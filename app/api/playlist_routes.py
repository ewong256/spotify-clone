from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models import db, Playlist, PlaylistSong, Song

playlist_routes = Blueprint('playlist_routes', __name__)

# POST/CREATE a Playlist
@playlist_routes.route('', methods=['POST'])
@login_required
def create_playlist():
    data = request.json

    new_playlist = Playlist(
        title=data['title'],
        user_id=current_user.id,
        image_url=data.get('image_url', '')
    )
    db.session.add(new_playlist)
    db.session.commit()

    return jsonify({
        "id": new_playlist.id,
        "title": new_playlist.title,
        "image_url": new_playlist.image_url,
        "user_id": new_playlist.user_id,
        "songs": []  # New playlist starts with no songs
    }), 201

# GET All Playlists (Publicly accessible)
@playlist_routes.route('', methods=['GET'])
@login_required
def get_all_playlists():
    playlists = Playlist.query.all()
    return jsonify([{
        "id": playlist.id,
        "title": playlist.title,
        "image_url": playlist.image_url,
        "user_id": playlist.user_id
    } for playlist in playlists])

# GET a Specific Playlist
@playlist_routes.route('/<int:playlist_id>', methods=['GET'])
@login_required
def get_playlist(playlist_id):
    playlist = Playlist.query.get_or_404(playlist_id)

    if playlist.user_id != current_user.id:
        return jsonify({"error": "You do not have permission to view this playlist"}), 403

    songs = [{
        "id": ps.song.id,
        "title": ps.song.title,
        "artist": ps.song.artist,
        "album": ps.song.album
    } for ps in playlist.songs]

    available_songs = Song.query.all()
    available_songs_list = [{
        "id": song.id,
        "title": song.title,
        "artist": song.artist
    } for song in available_songs]

    return jsonify({
        "id": playlist.id,
        "title": playlist.title,
        "image_url": playlist.image_url,
        "songs": songs,
        "available_songs": available_songs_list
    })

# UPDATE/PUT Playlist
@playlist_routes.route('/<int:playlist_id>', methods=['PUT'])
@login_required
def update_playlist(playlist_id):
    data = request.json
    playlist = Playlist.query.get_or_404(playlist_id)

    if playlist.user_id != current_user.id:
        return jsonify({"error": "You do not have permission to update this playlist"}), 403

    playlist.title = data.get('title', playlist.title)
    playlist.image_url = data.get('image_url', playlist.image_url)
    db.session.commit()

    return jsonify({
        "id": playlist.id,
        "title": playlist.title,
        "image_url": playlist.image_url,
        "user_id": playlist.user_id
    })

# DELETE Playlist
@playlist_routes.route('/<int:playlist_id>', methods=['DELETE'])
@login_required
def delete_playlist(playlist_id):
    playlist = Playlist.query.get_or_404(playlist_id)

    if playlist.user_id != current_user.id:
        return jsonify({"error": "You do not have permission to delete this playlist"}), 403

    db.session.delete(playlist)
    db.session.commit()

    return jsonify({"message": "Playlist deleted"})

# ADD Song to Playlist (Only if the Song Exists in the Songs Table)
@playlist_routes.route('/<int:playlist_id>/songs', methods=['POST'])
@login_required
def add_song_to_playlist(playlist_id):
    data = request.json
    song_id = data.get('song_id')

    if not song_id:
        return jsonify({"error": "Missing song ID"}), 400

    song = Song.query.get(song_id)
    if not song:
        return jsonify({"error": "Song not found"}), 404

    existing_entry = PlaylistSong.query.filter_by(playlist_id=playlist_id, song_id=song_id).first()
    if existing_entry:
        return jsonify({"error": "Song already in playlist"}), 400

    new_entry = PlaylistSong(playlist_id=playlist_id, song_id=song_id)
    db.session.add(new_entry)
    db.session.commit()

    # Fetch updated playlist with all songs
    playlist = Playlist.query.get(playlist_id)
    songs = [{
        "id": ps.song.id,
        "title": ps.song.title,
        "artist": ps.song.artist,
        "album": ps.song.album
    } for ps in playlist.songs]

    return jsonify({
        "id": playlist.id,
        "title": playlist.title,
        "image_url": playlist.image_url,
        "user_id": playlist.user_id,
        "songs": songs
    }), 201

# REMOVE Song from Playlist
@playlist_routes.route('/<int:playlist_id>/songs/<int:song_id>', methods=['DELETE'])
@login_required
def remove_song_from_playlist(playlist_id, song_id):
    entry = PlaylistSong.query.filter_by(playlist_id=playlist_id, song_id=song_id).first()
    if entry:
        db.session.delete(entry)
        db.session.commit()

        # Fetch updated playlist after song removal
        playlist = Playlist.query.get(playlist_id)
        songs = [{
            "id": ps.song.id,
            "title": ps.song.title,
            "artist": ps.song.artist,
            "album": ps.song.album
        } for ps in playlist.songs]

        return jsonify({
            "id": playlist.id,
            "title": playlist.title,
            "image_url": playlist.image_url,
            "user_id": playlist.user_id,
            "songs": songs
        })
    else:
        return jsonify({"error": "Song not found in playlist"}), 404
