from app import db
from app.models import AlbumSong
from sqlalchemy.sql import text
from app.models import db, environment, SCHEMA


def seed_album_songs():
    album_songs = [
        AlbumSong(album_id=1, song_id=1),
        AlbumSong(album_id=1, song_id=2),
        AlbumSong(album_id=2, song_id=3),
        # Add more as needed
    ]

    db.session.add_all(album_songs)
    db.session.commit()


def undo_album_songs():
    if environment == "production":
        db.session.execute(text(f"TRUNCATE table {SCHEMA}.album_songs RESTART IDENTITY CASCADE;"))
    else:
        db.session.execute(text("DELETE FROM album_songs;"))

    db.session.commit()