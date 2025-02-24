from flask.cli import AppGroup
from .users import seed_users, undo_users
from .seed_albums import seed_albums, undo_albums
from .seed_songs import seed_songs, undo_songs
from .seed_playlists import seed_playlists, undo_playlists
from .seed_likes import seed_likes, undo_likes
from .seed_album_songs import seed_album_songs, undo_album_songs  # Import Album-Song seeding

# from .seed_notifications import seed_notifications, undo_notifications
# from .seed_genre import seed_genres, undo_genres

from app.models.db import db, environment, SCHEMA

seed_commands = AppGroup('seed')


@seed_commands.command('all')
def seed():
    if environment == 'production':
        undo_likes()
        undo_playlists()
        undo_album_songs()  # Undo album-song relationships first
        undo_albums()
        undo_songs()
        undo_users()
        # undo_notifications()
        # undo_genres()
        
    seed_users()
    seed_albums()
    seed_songs()
    seed_album_songs()  # Seed album-song relationships after songs & albums
    seed_playlists()
    seed_likes()
    # seed_notifications()
    # seed_genres()


@seed_commands.command('undo')
def undo():
    undo_likes()
    undo_playlists()
    undo_album_songs()  # Undo album-song relationships first
    undo_albums()
    undo_songs()
    undo_users()
    # undo_notifications()
    # undo_genres()
