from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models import db, Playlist, PlaylistSong, Song

playlist_routes = Blueprint('playlist_routes', __name__)

# POST/CREATE a Playlist
@playlist_routes.route('/', methods=['POST'])
@login_required
def create_playlist():
    data = request.json

    new_playlist = Playlist(
        title=data['title'],
        user_id=current_user.id,  # Using current_user from Flask-Login
        image_url=data.get('image_url', '')
    )
    db.session.add(new_playlist)
    db.session.commit()

    return jsonify({"message": "Playlist created successfully", "playlist": new_playlist.id}), 201

# GET All Playlists for a User
@playlist_routes.route('/', methods=['GET'])
@login_required
def get_user_playlists():
    playlists = Playlist.query.all()  #Playlist.query.filter_by(user_id=current_user.id).all() [IF YOU WANT ONLY THE USER TO SEE THEIR PLAYLIST]
    return jsonify([{
        "id": playlist.id,
        "title": playlist.title,
        "image_url": playlist.image_url,
        "user_id": playlist.user_id #Optionsl. To show userID of Creator of Playlist
    } for playlist in playlists])

# GET a Specific Playlist
@playlist_routes.route('/<int:playlist_id>', methods=['GET'])
@login_required
def get_playlist(playlist_id):
    playlist = Playlist.query.get_or_404(playlist_id)
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
        "songs": songs
    })

# UPDATE/PUT Playlist
@playlist_routes.route('/<int:playlist_id>', methods=['PUT'])
@login_required
def update_playlist(playlist_id):
    data = request.json
    playlist = Playlist.query.get_or_404(playlist_id)

    # Ensure the current user is the owner of the playlist
    if playlist.user_id != current_user.id:
        return jsonify({"error": "You do not have permission to update this playlist"}), 403

    playlist.title = data.get('title', playlist.title)
    playlist.image_url = data.get('image_url', playlist.image_url)
    db.session.commit()

    return jsonify({"message": "Playlist updated"})

# DELETE Playlist
@playlist_routes.route('/<int:playlist_id>', methods=['DELETE'])
@login_required
def delete_playlist(playlist_id):
    playlist = Playlist.query.get_or_404(playlist_id)

    # Ensure the current user is the owner of the playlist
    if playlist.user_id != current_user.id:
        return jsonify({"error": "You do not have permission to delete this playlist"}), 403

    db.session.delete(playlist)
    db.session.commit()

    return jsonify({"message": "Playlist deleted"})

# ADD Song to Playlist
@playlist_routes.route('/<int:playlist_id>/songs', methods=['POST'])
@login_required
def add_song_to_playlist(playlist_id):
    data = request.json
    song_id = data.get('song_id')

    new_entry = PlaylistSong(playlist_id=playlist_id, song_id=song_id)
    db.session.add(new_entry)
    db.session.commit()

    return jsonify({"message": "Song added to playlist"})

# REMOVE Song from Playlist
@playlist_routes.route('/<int:playlist_id>/songs/<int:song_id>', methods=['DELETE'])
@login_required
def remove_song_from_playlist(playlist_id, song_id):
    entry = PlaylistSong.query.filter_by(playlist_id=playlist_id, song_id=song_id).first()
    if entry:
        db.session.delete(entry)
        db.session.commit()
        return jsonify({"message": "Song removed from playlist"})
    else:
        return jsonify({"error": "Song not found in playlist"}), 404
