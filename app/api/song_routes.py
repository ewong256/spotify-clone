import os
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from app.models import db, Song, Like
from sqlalchemy.orm import joinedload

song_routes = Blueprint("songs", __name__)

# Define upload folders
UPLOAD_FOLDER = os.path.join(os.getcwd(), "static/uploads/songs")
IMAGE_FOLDER = os.path.join(os.getcwd(), "static/uploads/images")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(IMAGE_FOLDER, exist_ok=True)

# Allowed file extensions
ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif"}
ALLOWED_AUDIO_EXTENSIONS = {"mp3", "wav", "flac"}


def allowed_file(filename, allowed_extensions):
    """Checks if a file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions


# Get all songs
@song_routes.route("", methods=["GET"])
def get_all_songs():
    """Get all songs and return them as a list of dictionaries."""
    songs = Song.query.options(joinedload(Song.likes)).all()
    return {"songs": [song.to_dict_with_likes() for song in songs]}, 200


# Create a new song
@song_routes.route("", methods=["POST"])
@login_required
def create_song():
    """Create a new song and store image/audio in local directories."""
    try:
        data = request.form  # Use form-data for file uploads

        # Validate required fields
        if "title" not in data or "album_id" not in data:
            return jsonify({"error": "Title and album_id are required"}), 400

        song_filename = None
        image_filename = None

        # Handle Song Upload
        if "song" not in request.files:
            return jsonify({"error": "Song file is required"}), 400

        song_file = request.files["song"]
        if not allowed_file(song_file.filename, ALLOWED_AUDIO_EXTENSIONS):
            return jsonify({"error": "Invalid song format"}), 400

        song_filename = secure_filename(song_file.filename)
        song_path = os.path.join(UPLOAD_FOLDER, song_filename)
        song_file.save(song_path)

        # Handle Image Upload
        if "image" in request.files:
            image_file = request.files["image"]
            if allowed_file(image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
                image_filename = secure_filename(image_file.filename)
                image_path = os.path.join(IMAGE_FOLDER, image_filename)
                image_file.save(image_path)

        # Convert album_id to integer
        try:
            album_id = int(data["album_id"])
        except ValueError:
            return jsonify({"error": "album_id must be an integer"}), 400

        # Generate absolute URL for frontend
        base_url = request.host_url  # Get 'http://localhost:5000/' dynamically
        song_url = f"{base_url}static/uploads/songs/{song_filename}"
        image_url = f"{base_url}static/uploads/images/{image_filename}" if image_filename else f"{base_url}static/default.jpg"

        # Create Song
        new_song = Song(
            title=data["title"],
            song_url=song_url,
            image_url=image_url,
            album_id=album_id,
            user_id=current_user.id
        )

        db.session.add(new_song)
        db.session.commit()

        return jsonify({"message": "Song successfully created!", "song": new_song.to_dict()}), 201

    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


# Serve static audio files
@song_routes.route("/play/<filename>", methods=["GET"])
def play_song(filename):
    """Serve the song file."""
    return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=False)
