from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, Song

song_routes = Blueprint("songs", __name__, url_prefix="/api/songs")


@song_routes.route("", methods=["GET"])
def get_all_songs():
    """
    Get all songs and return them as a list of dictionaries.
    """
    songs = Song.query.all()
    return {"songs": [song.to_dict() for song in songs]}, 200


@song_routes.route("/<int:id>", methods=["GET"])
def get_song(id):
    """
    Get a single song by ID.
    """
    song = Song.query.get(id)
    if not song:
        return jsonify({"error": "Oops! We couldn't find the song you're looking for."}), 404
    return jsonify(song.to_dict()), 200


@song_routes.route("", methods=["POST"])
@login_required
def create_song():
    """
    Create a new song.
    """
    data = request.get_json()

    # Validate required fields
    required_fields = ["title", "song_url", "album_id"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    new_song = Song(
        title=data["title"],
        song_url=data["song_url"],
        album_id=data["album_id"],
        user_id=current_user.id,
        image_url=data.get("image_url")
    )

    db.session.add(new_song)
    db.session.commit()
    return jsonify({"message": "Song successfully created!", "song": new_song.to_dict()}), 201


@song_routes.route("/<int:id>", methods=["PUT"])
@login_required
def update_song(id):
    """
    Update a song by ID.
    """
    song = Song.query.get(id)
    if not song:
        return jsonify({"error": "Oops! We couldn't find the song you're trying to update."}), 404

    if song.user_id != current_user.id:
        return jsonify({"error": "You are not authorized to modify this song. This is someone else's song!"}), 403

    data = request.get_json()
    song.title = data.get("title", song.title)
    song.song_url = data.get("song_url", song.song_url)
    song.image_url = data.get("image_url", song.image_url)

    db.session.commit()
    return jsonify(song.to_dict()), 200


@song_routes.route("/<int:id>", methods=["DELETE"])
@login_required
def delete_song(id):
    """
    Delete a song by ID.
    """
    song = Song.query.get(id)
    if not song:
        return jsonify({"error": "Oops! We couldn't find the song you're trying to delete."}), 404

    if song.user_id != current_user.id:
        return jsonify({"error": "You are not authorized to delete this song. This is someone else's song!"}), 403

    db.session.delete(song)
    db.session.commit()
    return jsonify({"message": "The song has been successfully removed from the database!"}), 200
