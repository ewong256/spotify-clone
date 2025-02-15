from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, Playlist, PlaylistSong, Song
from app.aws import upload_file_to_s3, delete_file_from_s3
from werkzeug.utils import secure_filename
import uuid

playlist_routes = Blueprint('playlist_routes', __name__)

# Allowed file extensions
ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif"}


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


# POST/CREATE a Playlist
@playlist_routes.route('/', methods=['POST'])
@login_required
def create_playlist():
    """
    Creates a playlist with an optional image uploaded to S3.
    """
    data = request.form  # Use form-data for file uploads

    if "title" not in data:
        return jsonify({"error": "Title is required"}), 400

    image_url = None

    # Upload Image
    if "image" in request.files:
        image_file = request.files["image"]
        if not allowed_file(image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
            return jsonify({"error": "Invalid image format"}), 400

        image_filename = secure_filename(generate_unique_filename(image_file.filename))
        content_type = image_file.content_type if image_file.content_type else "image/jpeg"

        image_url = upload_file_to_s3(image_file, f"playlists/images/{image_filename}", content_type)
        if not image_url:
            return jsonify({"error": "Failed to upload image"}), 500

    new_playlist = Playlist(
        title=data["title"],
        user_id=current_user.id,
        image_url=image_url
    )

    db.session.add(new_playlist)
    db.session.commit()

    return jsonify({"message": "Playlist created successfully", "playlist": new_playlist.to_dict()}), 201


# GET All Playlists for a User
@playlist_routes.route('/', methods=['GET'])
@login_required
def get_user_playlists():
    """
    Get all playlists for the current user.
    """
    playlists = Playlist.query.filter_by(user_id=current_user.id).all()
    return jsonify([playlist.to_dict() for playlist in playlists]), 200


# GET a Specific Playlist
@playlist_routes.route('/<int:playlist_id>', methods=['GET'])
@login_required
def get_playlist(playlist_id):
    """
    Get a playlist and its songs.
    """
    playlist = Playlist.query.get_or_404(playlist_id)
    songs = [song.to_dict() for song in playlist.songs]

    return jsonify({
        "id": playlist.id,
        "title": playlist.title,
        "image_url": playlist.image_url,
        "songs": songs
    })

# UPDATE Playlist
@playlist_routes.route('/<int:playlist_id>', methods=['PUT'])
@login_required
def update_playlist(playlist_id):
    """
    Updates a playlist and modifies its image if a new one is uploaded.
    """
    playlist = Playlist.query.get_or_404(playlist_id)

    if playlist.user_id != current_user.id:
        return jsonify({"error": "You do not have permission to update this playlist"}), 403

    data = request.form

    if "title" in data:
        playlist.title = data["title"]

    # Update Image
    if "image" in request.files:
        image_file = request.files["image"]
        if not allowed_file(image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
            return jsonify({"error": "Invalid image format"}), 400

        image_filename = secure_filename(generate_unique_filename(image_file.filename))
        content_type = image_file.content_type if image_file.content_type else "image/jpeg"

        new_image_url = upload_file_to_s3(image_file, f"playlists/images/{image_filename}", content_type)
        if not new_image_url:
            return jsonify({"error": "Failed to upload new image"}), 500

        # Delete old image from S3
        if playlist.image_url:
            old_image_key = playlist.image_url.split(".s3.amazonaws.com/")[-1]
            delete_file_from_s3(old_image_key)

        playlist.image_url = new_image_url

    db.session.commit()
    return jsonify({"message": "Playlist updated", "playlist": playlist.to_dict()}), 200


# DELETE Playlist
@playlist_routes.route('/<int:playlist_id>', methods=['DELETE'])
@login_required
def delete_playlist(playlist_id):
    """
    Deletes a playlist along with its associated image from S3.
    """
    playlist = Playlist.query.get_or_404(playlist_id)

    if playlist.user_id != current_user.id:
        return jsonify({"error": "You do not have permission to delete this playlist"}), 403

    # Delete playlist image from S3
    if playlist.image_url:
        image_key = playlist.image_url.split(".s3.amazonaws.com/")[-1]
        delete_file_from_s3(image_key)

    db.session.delete(playlist)
    db.session.commit()

    return jsonify({"message": "Playlist deleted"}), 200


# ADD Song to Playlist
@playlist_routes.route('/<int:playlist_id>/songs', methods=['POST'])
@login_required
def add_song_to_playlist(playlist_id):
    """
    Adds a song to a playlist.
    """
    data = request.json
    song_id = data.get('song_id')

    new_entry = PlaylistSong(playlist_id=playlist_id, song_id=song_id)
    db.session.add(new_entry)
    db.session.commit()

    return jsonify({"message": "Song added to playlist"}), 201


# REMOVE Song from Playlist
@playlist_routes.route('/<int:playlist_id>/songs/<int:song_id>', methods=['DELETE'])
@login_required
def remove_song_from_playlist(playlist_id, song_id):
    """
    Removes a song from a playlist.
    """
    entry = PlaylistSong.query.filter_by(playlist_id=playlist_id, song_id=song_id).first()
    if entry:
        db.session.delete(entry)
        db.session.commit()
        return jsonify({"message": "Song removed from playlist"}), 200
    else:
        return jsonify({"error": "Song not found in playlist"}), 404
