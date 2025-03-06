import os
from flask import Blueprint, request, jsonify, send_from_directory
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from app.models import db, Song, Like
from sqlalchemy.orm import joinedload

song_routes = Blueprint("songs", __name__)

# Define upload folders
UPLOAD_FOLDER = "static/uploads/songs"
IMAGE_FOLDER = "static/uploads/images"
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


# Get a single song by ID
@song_routes.route("/<int:id>", methods=["GET"])
def get_song(id):
    """Get a single song by ID."""
    song = Song.query.get(id)
    if not song:
        return jsonify({"error": "Oops! We couldn't find the song you're looking for."}), 404
    return jsonify(song.to_dict()), 200


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

        # Create Song
        new_song = Song(
            title=data["title"],
            song_url=f"/{song_path}",
            image_url=f"/{image_path}" if image_filename else "/static/default.jpg",
            album_id=album_id,
            user_id=current_user.id
        )

        db.session.add(new_song)
        db.session.commit()

        return jsonify({"message": "Song successfully created!", "song": new_song.to_dict()}), 201

    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


# Update an existing song
@song_routes.route("/<int:id>", methods=["PUT"])
@login_required
def update_song(id):
    """Update an existing song."""
    song = Song.query.get(id)

    if not song:
        return jsonify({"error": "Song not found"}), 404

    if song.user_id != current_user.id:
        return jsonify({"error": "Unauthorized to edit this song"}), 403

    data = request.form  # Expecting form-data for file uploads

    # Update title and album_id if present
    if "title" in data:
        song.title = data["title"]
    if "album_id" in data:
        try:
            song.album_id = int(data["album_id"])
        except ValueError:
            return jsonify({"error": "album_id must be an integer"}), 400

    # Handle image update (if provided)
    if "image" in request.files:
        image_file = request.files["image"]
        if allowed_file(image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
            image_filename = secure_filename(image_file.filename)
            image_path = os.path.join(IMAGE_FOLDER, image_filename)
            image_file.save(image_path)
            song.image_url = f"/{image_path}"

    # Handle song update (if provided)
    if "song" in request.files:
        song_file = request.files["song"]
        if allowed_file(song_file.filename, ALLOWED_AUDIO_EXTENSIONS):
            song_filename = secure_filename(song_file.filename)
            song_path = os.path.join(UPLOAD_FOLDER, song_filename)
            song_file.save(song_path)
            song.song_url = f"/{song_path}"

    db.session.commit()
    return jsonify({"message": "Song successfully updated!", "song": song.to_dict()}), 200


# Delete a song
@song_routes.route("/<int:id>", methods=["DELETE"])
@login_required
def delete_song(id):
    """Delete a song by ID."""
    song = Song.query.get(id)

    if not song:
        return jsonify({"error": "Song not found"}), 404

    if song.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    # Remove the song and image files from local storage
    if song.song_url and os.path.exists(song.song_url[1:]):  # Remove leading '/'
        os.remove(song.song_url[1:])
    if song.image_url and os.path.exists(song.image_url[1:]):  # Remove leading '/'
        os.remove(song.image_url[1:])

    db.session.delete(song)
    db.session.commit()

    return jsonify({"message": "Song deleted successfully", "song_id": id}), 200


# Serve songs
@song_routes.route("/play/<path:filename>", methods=["GET"])
def play_song(filename):
    """Serve the song file."""
    return send_from_directory(UPLOAD_FOLDER, filename)

















# from flask import Blueprint, request, jsonify
# from flask_login import login_required, current_user
# from app.models import db, Song
# from werkzeug.utils import secure_filename
# import uuid
# from app.models import Like
# from sqlalchemy.orm import joinedload

# song_routes = Blueprint("songs", __name__)

# # Allowed file extensions
# ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif"}
# ALLOWED_AUDIO_EXTENSIONS = {"mp3", "wav", "flac"}


# def allowed_file(filename, allowed_extensions):
#     """
#     Checks if a file has an allowed extension.
#     """
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions


# # Get all songs
# @song_routes.route("", methods=["GET"])
# def get_all_songs():
#     """
#     Get all songs and return them as a list of dictionaries.
#     """
#     songs = Song.query.options(joinedload(Like.id == Song.id)).all()
#     return {"songs": [song.to_dict_with_likes() for song in songs]}, 200


# # Get a single song by ID
# @song_routes.route("/<int:id>", methods=["GET"])
# def get_song(id):
#     """
#     Get a single song by ID.
#     """
#     song = Song.query.get(id)
#     if not song:
#         return jsonify({"error": "Oops! We couldn't find the song you're looking for."}), 404
#     return jsonify(song.to_dict()), 200


# # Create a new song
# @song_routes.route("", methods=["POST"])
# @login_required
# def create_song():
#     """
#     Create a new song and store image/audio as binary data in the database.
#     """
#     try:
#         # Debugging: Log incoming request data
#         print("Received request to create a song.")

#         data = request.form  # Use form-data for file uploads

#         # Validate required fields
#         if "title" not in data or "album_id" not in data:
#             return jsonify({"error": "Title and album_id are required"}), 400

#         image_data = None
#         song_data = None

#         # Handle Image Upload
#         if "image" in request.files:
#             image_file = request.files["image"]
#             if not allowed_file(image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
#                 return jsonify({"error": "Invalid image format"}), 400
#             image_data = image_file.read()  # Read image as binary
#             print("Image file successfully processed.")  # Debugging

#         # Handle Song Upload
#         if "song" in request.files:
#             song_file = request.files["song"]
#             if not allowed_file(song_file.filename, ALLOWED_AUDIO_EXTENSIONS):
#                 return jsonify({"error": "Invalid song format"}), 400
#             song_data = song_file.read()  # Read song as binary
#             print("Song file successfully processed.")  # Debugging
#         else:
#             return jsonify({"error": "Song file is required"}), 400  # Ensure a song is uploaded

#         # Convert album_id to integer
#         try:
#             album_id = int(data["album_id"])
#         except ValueError:
#             return jsonify({"error": "album_id must be an integer"}), 400

#         # Create Song
#         new_song = Song(
#             title=data["title"],
#             song_data=song_data,
#             album_id=album_id,
#             user_id=current_user.id,
#             image_data=image_data
#         )

#         db.session.add(new_song)
#         db.session.commit()

#         print("Song successfully created!")  # Debugging
#         return jsonify({"message": "Song successfully created!", "song": new_song.to_dict()}), 201

#     except Exception as e:
#         print(f"Server Error: {str(e)}")  # Debugging
#         return jsonify({"error": "An unexpected error occurred"}), 500


# # Update an existing song
# @song_routes.route("/<int:id>", methods=["PUT"])
# @login_required
# def update_song(id):
#     """
#     Update an existing song.
#     """
#     song = Song.query.get(id)

#     if not song:
#         return jsonify({"error": "Song not found"}), 404

#     if song.user_id != current_user.id:
#         return jsonify({"error": "Unauthorized to edit this song"}), 403

#     data = request.form  # Expecting form-data for file uploads

#     # Update title and album_id if present
#     if "title" in data:
#         song.title = data["title"]
#     if "album_id" in data:
#         song.album_id = data["album_id"]

#     # Handle image update (if provided)
#     if "image" in request.files:
#         image_file = request.files["image"]
#         if not allowed_file(image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
#             return jsonify({"error": "Invalid image format"}), 400
#         song.image_data = image_file.read()

#     # Handle song update (if provided)
#     if "song" in request.files:
#         song_file = request.files["song"]
#         if not allowed_file(song_file.filename, ALLOWED_AUDIO_EXTENSIONS):
#             return jsonify({"error": "Invalid song format"}), 400
#         song.song_data = song_file.read()

#     db.session.commit()
#     return jsonify({"message": "Song successfully updated!", "song": song.to_dict()}), 200


# # Delete a song
# @song_routes.route("/<int:id>", methods=["DELETE"])
# @login_required
# def delete_song(id):
#     """
#     Delete a song by ID.
#     """
#     song = Song.query.get(id)

#     if not song:
#         return jsonify({"error": "Song not found"}), 404

#     if song.user_id != current_user.id:
#         return jsonify({"error": "Unauthorized"}), 403

#     db.session.delete(song)
#     db.session.commit()

#     return jsonify({"message": "Song deleted successfully", "song_id": id}), 200