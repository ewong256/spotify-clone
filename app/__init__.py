import os
from flask import Flask, render_template, request, session, redirect
from flask_cors import CORS
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_login import LoginManager
from .models import db, User
from .api.user_routes import user_routes
from .api.auth_routes import auth_routes
from .seeds import seed_commands
from .config import Config
from .api.playlist_routes import playlist_routes
from .api.album_routes import album_routes
from .api.song_routes import song_routes
from .api.like_routes import like_routes

app = Flask(__name__, static_folder='../react-vite/dist', static_url_path='/')

# Setup login manager
login = LoginManager(app)
login.login_view = 'auth.unauthorized'

@login.user_loader
def load_user(id):
    try:
        return User.query.get(int(id))
    except (ValueError, TypeError):
        return None

# Tell Flask about our seed commands
app.cli.add_command(seed_commands)

# App Configuration
app.config.from_object(Config)
db.init_app(app)
Migrate(app, db)

# Security
CORS(app)
# Application Security
CORS(app, supports_credentials=True)


# Register API routes
app.register_blueprint(user_routes, url_prefix='/api/users')
app.register_blueprint(auth_routes, url_prefix='/api/auth')
app.register_blueprint(playlist_routes, url_prefix='/api/playlists')
app.register_blueprint(album_routes, url_prefix='/api/albums')
app.register_blueprint(song_routes, url_prefix='/api/songs')
app.register_blueprint(like_routes, url_prefix='/api/songs')  # Fixed prefix

@app.before_request
def https_redirect():
    """Redirect HTTP to HTTPS in production."""
    if os.environ.get('FLASK_ENV') == 'production':
        if request.headers.get('X-Forwarded-Proto', 'https') != 'https':
            return redirect(request.url.replace('http://', 'https://', 1), code=301)
        
@app.after_request
def inject_csrf_token(response):
    """Attach CSRF token to cookies for security."""
    secure_cookie = os.environ.get('FLASK_ENV') == 'production'
    response.set_cookie(
        'csrf_token',
        generate_csrf(),
        secure=secure_cookie,
        samesite='Strict' if secure_cookie else 'Lax',
        httponly=True
    )
    return response

@app.route("/api/docs")
def api_help():
    """Returns a list of API routes and their docstrings."""
    acceptable_methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    route_list = {
        rule.rule: [
            [method for method in rule.methods if method in acceptable_methods],
            app.view_functions[rule.endpoint].__doc__
        ]
        for rule in app.url_map.iter_rules() if rule.endpoint != 'static'
    }
    return route_list

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def react_root(path):
    """Serve the React frontend."""
    if path == 'favicon.ico':
        return app.send_from_directory('public', 'favicon.ico')
    return app.send_static_file('index.html')

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors by serving React frontend."""
    return app.send_static_file('index.html')