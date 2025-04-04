import os
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from app.models import Album, Song, AlbumSong
from app import db

album_routes = Blueprint('albums', __name__)

# Define upload folders
IMAGE_UPLOAD_FOLDER = "app/uploads/images"
AUDIO_UPLOAD_FOLDER = "app/uploads/audio"

# Ensure upload directories exist
os.makedirs(IMAGE_UPLOAD_FOLDER, exist_ok=True)
os.makedirs(AUDIO_UPLOAD_FOLDER, exist_ok=True)

# Allowed file extensions
ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif"}
ALLOWED_AUDIO_EXTENSIONS = {"mp3", "wav", "flac"}

def allowed_file(filename, allowed_extensions):
    """Check if file has allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

# Get all albums
@album_routes.route('', methods=['GET'])
def get_albums():
    albums = Album.query.all()
    # Include songs for each album in the response
    return jsonify([album.to_dict(include_songs=True) for album in albums])

# Get a single album by ID
@album_routes.route('/<int:album_id>', methods=['GET'])
def get_album(album_id):
    album = Album.query.get(album_id)
    if not album:
        return jsonify({"error": "Album not found"}), 404
    return jsonify(album.to_dict(include_songs=True))  # Ensure songs are included

@album_routes.route('/songs/unassigned', methods=['GET'])
def get_unassigned_songs():
    # Fetch songs that are NOT in any album
    unassigned_songs = Song.query.filter(~Song.albums.any()).all()
    return jsonify([song.to_dict() for song in unassigned_songs])


# Get all available songs
@album_routes.route('/songs', methods=['GET'])
def get_available_songs():
    songs = Song.query.all()
    return jsonify([song.to_dict() for song in songs])

# Create album
@album_routes.route('', methods=['POST'])
@login_required
def create_album():
    data = request.get_json()  # Read JSON data instead of form data

    title = data.get('title')
    song_ids = data.get('song_ids')  # Expecting list of song IDs
    image_url = data.get('image_url')  # Image URL instead of uploaded file

    if not title or not song_ids:
        return jsonify({"error": "Title and at least one song selection are required"}), 400

    # Ensure all song IDs exist
    songs = Song.query.filter(Song.id.in_(song_ids)).all()
    if len(songs) != len(song_ids):
        return jsonify({"error": "One or more selected songs do not exist"}), 404

    # Create new album
    new_album = Album(
        title=title,
        user_id=current_user.id,
        image_url=image_url  # Use URL directly
    )

    db.session.add(new_album)
    db.session.commit()

    # Add selected songs to album
    album_songs = [AlbumSong(album_id=new_album.id, song_id=song.id) for song in songs]
    db.session.bulk_save_objects(album_songs)
    db.session.commit()

    return jsonify({"message": "Album successfully created!", "album": new_album.to_dict()}), 201



# Update an album
@album_routes.route('/<int:album_id>', methods=['PUT'])
@login_required
def update_album(album_id):
    album = Album.query.get(album_id)
    if not album:
        return jsonify({"error": "Album not found"}), 404

    if album.user_id != current_user.id:
        return jsonify({"error": "You are not authorized to modify this album."}), 403

    title = request.form.get('title')
    song_id = request.form.get('song_id')  # Get song_id from the frontend for update
    if title:
        album.title = title

    # Update song if a new one is selected
    if song_id:
        song = Song.query.get(song_id)
        if not song:
            return jsonify({"error": "Selected song does not exist"}), 404

        # Create or update the many-to-many relationship with the new song
        album_song = AlbumSong.query.filter_by(album_id=album.id).first()
        if album_song:
            album_song.song_id = song.id  # Update existing song
        else:
            album_song = AlbumSong(album_id=album.id, song_id=song.id)  # Add new relationship
            db.session.add(album_song)

    # Update image if provided
    if 'image' in request.files:
        image_file = request.files['image']
        if allowed_file(image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
            filename = secure_filename(image_file.filename)
            image_path = os.path.join(IMAGE_UPLOAD_FOLDER, filename)
            image_file.save(image_path)
            album.image_url = f"/uploads/images/{filename}"  # Store relative URL
        else:
            return jsonify({"error": "Invalid image format"}), 400

    db.session.commit()
    return jsonify({"message": "Album successfully updated!", "album": album.to_dict()}), 200

# Delete an album
@album_routes.route('/<int:album_id>', methods=['DELETE'])
@login_required
def delete_album(album_id):
    album = Album.query.get(album_id)
    if not album:
        return jsonify({"error": "Album not found"}), 404

    if album.user_id != current_user.id:
        return jsonify({"error": "You are not authorized to delete this album."}), 403

    db.session.delete(album)
    db.session.commit()

    return jsonify({"message": "Album successfully deleted!"}), 200
