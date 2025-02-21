from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from ..models import db, Playlist, PlaylistSong, Song
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

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
        "artist": ps.song.user.username,  # Use username from User relationship
        "album": ps.song.albums[0].album.album_name if ps.song.albums else None  # Assuming AlbumSong links to Album
    } for ps in playlist.songs]

    available_songs = Song.query.all()
    available_songs_list = [{
        "id": song.id,
        "title": song.title,
        "artist": song.user.username  # Use username from User relationship
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

# GET Songs in Playlist and Available Songs
@playlist_routes.route('/<int:playlist_id>/songs', methods=['GET'])
@login_required
def get_playlist_songs(playlist_id):
    try:
        playlist = Playlist.query.get_or_404(playlist_id)
        logger.debug(f"Fetching songs for playlist {playlist_id}, user_id: {playlist.user_id}, current_user: {current_user.id}")

        if playlist.user_id != current_user.id:
            return jsonify({"error": "You do not have permission to view this playlist"}), 403

        # Songs currently in the playlist
        songs = []
        try:
            songs = [{
                "id": ps.song.id,
                "title": ps.song.title,
                "artist": ps.song.user.username,  # Use username from User relationship
                "album": ps.song.albums[0].album.album_name if ps.song.albums else None  # Assuming AlbumSong links to Album
            } for ps in playlist.songs]
        except AttributeError as e:
            logger.error(f"Error processing playlist songs: {e}")
            return jsonify({"error": "Invalid playlist songs data"}), 500

        # All available songs (excluding those already in the playlist)
        playlist_song_ids = {ps.song_id for ps in playlist.songs} if playlist.songs else set()
        try:
            available_songs = Song.query.filter(Song.id.notin_(playlist_song_ids)).all()
            available_songs_list = [{
                "id": song.id,
                "title": song.title,
                "artist": song.user.username  # Use username from User relationship
            } for song in available_songs]
        except Exception as e:
            logger.error(f"Error fetching available songs: {e}")
            return jsonify({"error": "Failed to fetch available songs"}), 500

        return jsonify({
            "playlist_id": playlist.id,
            "title": playlist.title,
            "songs": songs,
            "available_songs": available_songs_list
        })
    except Exception as e:
        logger.error(f"Unhandled error in get_playlist_songs: {e}")
        return jsonify({"error": "Internal server error"}), 500

# ADD Song to Playlist
@playlist_routes.route('/<int:playlist_id>/songs', methods=['POST'])
@login_required
def add_song_to_playlist(playlist_id):
    playlist = Playlist.query.get_or_404(playlist_id)

    if playlist.user_id != current_user.id:
        return jsonify({"error": "You do not have permission to modify this playlist"}), 403

    data = request.json
    song_id = data.get('song_id')

    if not song_id:
        return jsonify({"error": "Missing song_id"}), 400

    song = Song.query.get(song_id)
    if not song:
        return jsonify({"error": "Song not found"}), 404

    existing_entry = PlaylistSong.query.filter_by(playlist_id=playlist_id, song_id=song_id).first()
    if existing_entry:
        return jsonify({"error": "Song already in playlist"}), 400

    new_entry = PlaylistSong(playlist_id=playlist_id, song_id=song_id)
    db.session.add(new_entry)
    db.session.commit()

    songs = [{
        "id": ps.song.id,
        "title": ps.song.title,
        "artist": ps.song.user.username,  # Use username from User relationship
        "album": ps.song.albums[0].album.album_name if ps.song.albums else None  # Assuming AlbumSong links to Album
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
    playlist = Playlist.query.get_or_404(playlist_id)

    if playlist.user_id != current_user.id:
        return jsonify({"error": "You do not have permission to modify this playlist"}), 403

    entry = PlaylistSong.query.filter_by(playlist_id=playlist_id, song_id=song_id).first()
    if not entry:
        return jsonify({"error": "Song not found in playlist"}), 404

    db.session.delete(entry)
    db.session.commit()

    songs = [{
        "id": ps.song.id,
        "title": ps.song.title,
        "artist": ps.song.user.username,  # Use username from User relationship
        "album": ps.song.albums[0].album.album_name if ps.song.albums else None  # Assuming AlbumSong links to Album
    } for ps in playlist.songs]

    return jsonify({
        "id": playlist.id,
        "title": playlist.title,
        "image_url": playlist.image_url,
        "user_id": playlist.user_id,
        "songs": songs
    })
