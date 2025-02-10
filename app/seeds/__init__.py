from flask.cli import AppGroup
from .users import seed_users, undo_users
from .seed_songs import seed_songs, undo_songs
from .seed_albums import seed_albums, undo_albums
from .seed_playlists import seed_playlists, undo_playlists
from .seed_likes import seed_likes, undo_likes
from .seed_notifications import seed_notifications, undo_notifications
from .seed_genre import seed_genres, undo_genres

from app.models.db import db, environment, SCHEMA

seed_commands = AppGroup('seed')


@seed_commands.command('all')
def seed():
    if environment == 'production':
        undo_users()
        undo_songs()
        undo_albums()
        undo_playlists()
        undo_likes()
        undo_notifications()
        undo_genres()  
    seed_users()
    seed_songs()
    seed_albums()
    seed_playlists()
    seed_likes()
    seed_notifications()
    seed_genres()


@seed_commands.command('undo')
def undo():
    undo_users()
    undo_songs()
    undo_albums()
    undo_playlists()
    undo_likes()
    undo_notifications()
    undo_genres() 
