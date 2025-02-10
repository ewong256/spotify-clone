from .db import db, environment, SCHEMA, add_prefix_for_prod
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, DateTime



class PlaylistSong(db.Model):
    __tablename__ = 'playlist_songs'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    playlist_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('playlists.id')), nullable=False) #in production, want to reference correct table
    song_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('songs.id')), nullable=False)


# COMBACK TO UPDATE BACK POPULATE
    # uploader = db.relationship("User", back_populates="songs")
    # album = db.relationship("Album", back_populates="songs")
    # likes = db.relationship("Like", back_populates="song", cascade="all, delete-orphan")
