from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import Album
from app import db
from app.aws import upload_file_to_s3, delete_file_from_s3
from werkzeug.utils import secure_filename
import uuid
from app.models import Album, AlbumSong


album_routes = Blueprint('albums', __name__)

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


# Get all albums
@album_routes.route('/', methods=['GET'])
def get_albums():
    albums = Album.query.all()
    return jsonify([album.to_dict() for album in albums])

# Get a single album by ID
# Get a single album by ID
@album_routes.route('/<int:album_id>', methods=['GET'])
def get_album(album_id):
    # Fetch the album by its ID
    album = Album.query.get(album_id)

    if not album:
        return jsonify({"error": "Album not found"}), 404
    
    # Fetch the associated songs via the AlbumSong table
    album_songs = AlbumSong.query.filter(AlbumSong.album_id == album_id).all()

    # Create a list of songs based on the relationship
    songs = [album_song.song.to_dict() for album_song in album_songs]

    # Return the album data with the associated songs
    return jsonify({
        'id': album.id,
        'title': album.title,
        'user_id': album.user_id,
        'image_url': album.image_url,
        'songs': songs  # Add the list of songs
    })

# Create new album
@album_routes.route('/', methods=['POST'])
@login_required
def create_album():
    """
    Creates an album with an optional image and audio file uploaded to S3.
    """
    data = request.form  # Use form-data for file uploads

    if "title" not in data:
        return jsonify({"error": "Title is required"}), 400

    image_url = None
    audio_url = None

    # Upload Image
    if "image" in request.files:
        image_file = request.files["image"]
        if not allowed_file(image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
            return jsonify({"error": "Invalid image format"}), 400

        image_filename = secure_filename(generate_unique_filename(image_file.filename))
        content_type = image_file.content_type if image_file.content_type else "image/jpeg"

        image_url = upload_file_to_s3(image_file, f"albums/images/{image_filename}", content_type)
        if not image_url:
            return jsonify({"error": "Failed to upload image"}), 500

    # Upload Audio
    if "audio" in request.files:
        audio_file = request.files["audio"]
        if not allowed_file(audio_file.filename, ALLOWED_AUDIO_EXTENSIONS):
            return jsonify({"error": "Invalid audio format"}), 400

        audio_filename = secure_filename(generate_unique_filename(audio_file.filename))
        content_type = audio_file.content_type if audio_file.content_type else "audio/mpeg"

        audio_url = upload_file_to_s3(audio_file, f"albums/audios/{audio_filename}", content_type)
        if not audio_url:
            return jsonify({"error": "Failed to upload audio"}), 500

    # Create Album
    new_album = Album(
        title=data["title"],
        user_id=current_user.id,
        image_url=image_url,
        audio_url=audio_url
    )

    db.session.add(new_album)
    db.session.commit()

    return jsonify({"message": "Album successfully created!", "album": new_album.to_dict()}), 201

# Update an album
@album_routes.route('/<int:album_id>', methods=['PUT'])
@login_required
def update_album(album_id):
    """
    Updates an album and modifies the image/audio files if new ones are uploaded.
    """
    album = Album.query.get(album_id)
    if not album:
        return jsonify({"error": "Album not found"}), 404

    if album.user_id != current_user.id:
        return jsonify({"error": "You are not authorized to modify this album."}), 403

    data = request.form

    if "title" in data:
        album.title = data["title"]

    # Update Image
    if "image" in request.files:
        image_file = request.files["image"]
        if not allowed_file(image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
            return jsonify({"error": "Invalid image format"}), 400

        image_filename = secure_filename(generate_unique_filename(image_file.filename))
        content_type = image_file.content_type if image_file.content_type else "image/jpeg"

        new_image_url = upload_file_to_s3(image_file, f"albums/images/{image_filename}", content_type)
        if not new_image_url:
            return jsonify({"error": "Failed to upload new image"}), 500

        # Delete old image from S3
        if album.image_url:
            old_image_key = album.image_url.split(".s3.amazonaws.com/")[-1]
            delete_file_from_s3(old_image_key)

        album.image_url = new_image_url

    # Update Audio
    if "audio" in request.files:
        audio_file = request.files["audio"]
        if not allowed_file(audio_file.filename, ALLOWED_AUDIO_EXTENSIONS):
            return jsonify({"error": "Invalid audio format"}), 400

        audio_filename = secure_filename(generate_unique_filename(audio_file.filename))
        content_type = audio_file.content_type if audio_file.content_type else "audio/mpeg"

        new_audio_url = upload_file_to_s3(audio_file, f"albums/audios/{audio_filename}", content_type)
        if not new_audio_url:
            return jsonify({"error": "Failed to upload new audio"}), 500

        # Delete old audio from S3
        if album.audio_url:
            old_audio_key = album.audio_url.split(".s3.amazonaws.com/")[-1]
            delete_file_from_s3(old_audio_key)

        album.audio_url = new_audio_url

    db.session.commit()
    return jsonify({"message": "Album successfully updated!", "album": album.to_dict()}), 200

# Delete an album
@album_routes.route('/<int:album_id>', methods=['DELETE'])
@login_required
def delete_album(album_id):
    """
    Deletes an album along with its associated image and audio files from S3.
    """
    album = Album.query.get(album_id)
    if not album:
        return jsonify({"error": "Album not found"}), 404

    if album.user_id != current_user.id:
        return jsonify({"error": "You are not authorized to delete this album."}), 403

    # Delete files from S3
    if album.image_url:
        image_key = album.image_url.split(".s3.amazonaws.com/")[-1]
        delete_file_from_s3(image_key)

    if album.audio_url:
        audio_key = album.audio_url.split(".s3.amazonaws.com/")[-1]
        delete_file_from_s3(audio_key)

    # Delete album from DB
    db.session.delete(album)
    db.session.commit()

    return jsonify({"message": "Album successfully deleted!"}), 200
