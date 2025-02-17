import os
from flask import Flask, render_template, request, session, redirect
from flask_cors import CORS
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_login import LoginManager
from .models import db, User, Playlist, Song  # Import models for Playlist and Song
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
    return User.query.get(int(id))


# Tell flask about our seed commands
app.cli.add_command(seed_commands)

app.config.from_object(Config)
app.register_blueprint(user_routes, url_prefix='/api/users')
app.register_blueprint(auth_routes, url_prefix='/api/auth')
db.init_app(app)
Migrate(app, db)

# Application Security
CORS(app)


# Since we are deploying with Docker and Flask,
# we won't be using a buildpack when we deploy to Heroku.
# Therefore, we need to make sure that in production any
# request made over http is redirected to https.
# Well.........
@app.before_request
def https_redirect():
    if os.environ.get('FLASK_ENV') == 'production':
        if request.headers.get('X-Forwarded-Proto') == 'http':
            url = request.url.replace('http://', 'https://', 1)
            code = 301
            return redirect(url, code=code)


@app.after_request
def inject_csrf_token(response):
    response.set_cookie(
        'csrf_token',
        generate_csrf(),
        secure=True if os.environ.get('FLASK_ENV') == 'production' else False,
        samesite='Strict' if os.environ.get(
            'FLASK_ENV') == 'production' else None,
        httponly=True)
    return response


@app.route("/api/docs")
def api_help():
    """
    Returns all API routes and their doc strings
    """
    acceptable_methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    route_list = { rule.rule: [[ method for method in rule.methods if method in acceptable_methods ],
                    app.view_functions[rule.endpoint].__doc__ ]
                    for rule in app.url_map.iter_rules() if rule.endpoint != 'static' }
    return route_list


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def react_root(path):
    """
    This route will direct to the public directory in our
    react builds in the production environment for favicon
    or index.html requests
    """
    if path == 'favicon.ico':
        return app.send_from_directory('public', 'favicon.ico')
    return app.send_static_file('index.html')

# ADDED FOR PLAYLIST
app.register_blueprint(playlist_routes, url_prefix='/api/playlists')

# Playlist routes:
@app.route('/api/playlists/<int:playlist_id>', methods=['PUT'])
def update_playlist(playlist_id):
    """
    Renames a playlist
    """
    data = request.get_json()
    new_title = data.get('title')

    playlist = Playlist.query.get(playlist_id)
    if playlist is None:
        return {'error': 'Playlist not found'}, 404

    # You should check if the user has permission to rename the playlist here.
    # For example, if the playlist is owned by the current logged-in user.
    if playlist.user_id != session.get('user_id'):  # Assuming session stores user ID
        return {'error': 'Unauthorized'}, 403

    playlist.title = new_title
    db.session.commit()

    return {'playlist': playlist.to_dict()}

@app.route('/api/playlists/<int:playlist_id>/songs/<int:song_id>', methods=['DELETE'])
def remove_song_from_playlist(playlist_id, song_id):
    """
    Removes a song from a playlist
    """
    playlist = Playlist.query.get(playlist_id)
    if playlist is None:
        return {'error': 'Playlist not found'}, 404

    # You should check if the user has permission to remove songs from the playlist.
    if playlist.user_id != session.get('user_id'):  # Assuming session stores user ID
        return {'error': 'Unauthorized'}, 403

    song = Song.query.get(song_id)
    if song is None:
        return {'error': 'Song not found'}, 404

    playlist.songs.remove(song)  # Removing the song from the playlist
    db.session.commit()

    return {'message': 'Song removed successfully'}

# Register other blueprints
app.register_blueprint(album_routes, url_prefix='/api/albums')
app.register_blueprint(song_routes, url_prefix='/api/songs')
app.register_blueprint(like_routes, url_prefix='/api/songs')

@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')
