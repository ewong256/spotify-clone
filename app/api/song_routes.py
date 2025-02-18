from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, Song
from app.aws import upload_file_to_s3, delete_file_from_s3
from werkzeug.utils import secure_filename
import uuid

song_routes = Blueprint("songs", __name__)

# Allowed file extensions
ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif"}
ALLOWED_AUDIO_EXTENSIONS = {"mp3", "wav", "flac"}


def allowed_file(filename, allowed_extensions):
    """
    Checks if a file has an allowed extension.
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions


def generate_unique_filename(filename):
    """
    Generates a unique filename to prevent overwriting.
    """
    ext = filename.split('.')[-1]
    return f"{uuid.uuid4().hex}.{ext}"


# Get all songs
@song_routes.route("/", methods=["GET"])
def get_all_songs():
    """
    Get all songs and return them as a list of dictionaries.
    """
    songs = Song.query.all()
    return {"songs": [song.to_dict() for song in songs]}, 200


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


# Create a new song
@song_routes.route("/", methods=["POST"])
@login_required
def create_song():
    """
    Create a new song with an optional image and song file uploaded to S3.
    """
    data = request.form  # Use form-data for file uploads

    # Validate required fields
    if "title" not in data or "album_id" not in data:
        return jsonify({"error": "Title and album_id are required"}), 400

    image_url = None
    song_url = None

    # Upload Image
    if "image" in request.files:
        image_file = request.files["image"]
        if not allowed_file(image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
            return jsonify({"error": "Invalid image format"}), 400

        image_filename = secure_filename(generate_unique_filename(image_file.filename))
        content_type = image_file.content_type if image_file.content_type else "image/jpeg"

        image_url = upload_file_to_s3(image_file, f"songs/images/{image_filename}", content_type)
        if not image_url:
            return jsonify({"error": "Failed to upload image"}), 500

    # Upload Song
    if "song" in request.files:
        song_file = request.files["song"]
        if not allowed_file(song_file.filename, ALLOWED_AUDIO_EXTENSIONS):
            return jsonify({"error": "Invalid song format"}), 400

        song_filename = secure_filename(generate_unique_filename(song_file.filename))
        content_type = song_file.content_type if song_file.content_type else "audio/mpeg"

        song_url = upload_file_to_s3(song_file, f"songs/audio/{song_filename}", content_type)
        if not song_url:
            return jsonify({"error": "Failed to upload song"}), 500

    # Create Song
    new_song = Song(
        title=data["title"],
        song_url=song_url,
        album_id=data["album_id"],
        user_id=current_user.id,
        image_url=image_url
    )

    db.session.add(new_song)
    db.session.commit()
    return jsonify({"message": "Song successfully created!", "song": new_song.to_dict()}), 201


# Update a song
@song_routes.route("/<int:id>", methods=["PUT"])
@login_required
def update_song(id):
    """
    Update a song by ID and modify its image/song files if new ones are uploaded.
    """
    song = Song.query.get(id)
    if not song:
        return jsonify({"error": "Oops! We couldn't find the song you're trying to update."}), 404

    if song.user_id != current_user.id:
        return jsonify({"error": "You are not authorized to modify this song. This is someone else's song!"}), 403

    data = request.form

    if "title" in data:
        song.title = data["title"]

    # Update Image
    if "image" in request.files:
        image_file = request.files["image"]
        if not allowed_file(image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
            return jsonify({"error": "Invalid image format"}), 400

        image_filename = secure_filename(generate_unique_filename(image_file.filename))
        content_type = image_file.content_type if image_file.content_type else "image/jpeg"

        new_image_url = upload_file_to_s3(image_file, f"songs/images/{image_filename}", content_type)
        if not new_image_url:
            return jsonify({"error": "Failed to upload new image"}), 500

        # Delete old image from S3
        if song.image_url:
            old_image_key = song.image_url.split(".s3.amazonaws.com/")[-1]
            delete_file_from_s3(old_image_key)

        song.image_url = new_image_url

    # Update Song
    if "song" in request.files:
        song_file = request.files["song"]
        if not allowed_file(song_file.filename, ALLOWED_AUDIO_EXTENSIONS):
            return jsonify({"error": "Invalid song format"}), 400

        song_filename = secure_filename(generate_unique_filename(song_file.filename))
        content_type = song_file.content_type if song_file.content_type else "audio/mpeg"

        new_song_url = upload_file_to_s3(song_file, f"songs/audio/{song_filename}", content_type)
        if not new_song_url:
            return jsonify({"error": "Failed to upload new song"}), 500

        # Delete old song from S3
        if song.song_url:
            old_song_key = song.song_url.split(".s3.amazonaws.com/")[-1]
            delete_file_from_s3(old_song_key)

        song.song_url = new_song_url

    db.session.commit()
    return jsonify({"message": "Song successfully updated!", "song": song.to_dict()}), 200


# Delete a song
@song_routes.route("/<int:id>", methods=["DELETE"])
@login_required
def delete_song(id):
    """
    Delete a song by ID, along with its associated image and song file from S3.
    """
    song = Song.query.get(id)
    if not song:
        return jsonify({"error": "Oops! We couldn't find the song you're trying to delete."}), 404

    if song.user_id != current_user.id:
        return jsonify({"error": "You are not authorized to delete this song. This is someone else's song!"}), 403

    # Delete files from S3
    if song.image_url:
        image_key = song.image_url.split(".s3.amazonaws.com/")[-1]
        delete_file_from_s3(image_key)

    if song.song_url:
        song_key = song.song_url.split(".s3.amazonaws.com/")[-1]
        delete_file_from_s3(song_key)

    # Delete song from DB
    db.session.delete(song)
    db.session.commit()
    return jsonify({"message": "The song has been successfully removed from the database!"}), 200
