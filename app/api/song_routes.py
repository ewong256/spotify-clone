from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, Song
from werkzeug.utils import secure_filename
import uuid
from app.models import Like
from sqlalchemy.orm import joinedload
song_routes = Blueprint("songs", __name__)

# Allowed file extensions
ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif"}
ALLOWED_AUDIO_EXTENSIONS = {"mp3", "wav", "flac"}


def allowed_file(filename, allowed_extensions):
    """
    Checks if a file has an allowed extension.
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions


# Get all songs
@song_routes.route("", methods=["GET"])
def get_all_songs():
    """
    Get all songs and return them as a list of dictionaries.
    """
    songs = Song.query.options(joinedload(Like.id == Song.id)).all()
    return {"songs": [song.to_dict_with_likes() for song in songs]}, 200


# Get a single song by ID
@song_routes.route("/<int:id>", methods=["GET"])
def get_song(id):
    """
    Get a single song by ID.
    """
    song = Song.query.get(id)
    if not song:
        return jsonify({"error": "Oops! We couldn't find the song you're looking for."}), 404
    return jsonify(song.to_dict()), 200


# Create a new song without AWS S3
@song_routes.route("", methods=["POST"])
@login_required
def create_song():
    """
    Create a new song and store image/audio as binary data in the database.
    """
    data = request.form  # Use form-data for file uploads

    # Validate required fields
    if "title" not in data or "album_id" not in data:
        return jsonify({"error": "Title and album_id are required"}), 400

    image_data = None
    song_data = None

    # Handle Image Upload
    if "image" in request.files:
        image_file = request.files["image"]
        if not allowed_file(image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
            return jsonify({"error": "Invalid image format"}), 400
        image_data = image_file.read()  # Read image as binary

    # Handle Song Upload
    if "song" in request.files:
        song_file = request.files["song"]
        if not allowed_file(song_file.filename, ALLOWED_AUDIO_EXTENSIONS):
            return jsonify({"error": "Invalid song format"}), 400
        song_data = song_file.read()  # Read song as binary

    # Create Song
    new_song = Song(
        title=data["title"],
        song_data=song_data,  # Store binary data
        album_id=data["album_id"],
        user_id=current_user.id,
        image_data=image_data  # Store binary data
    )

    db.session.add(new_song)
    db.session.commit()
    return jsonify({"message": "Song successfully created!", "song": new_song.to_dict()}), 201
