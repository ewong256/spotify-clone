from .db import db, environment, SCHEMA, add_prefix_for_prod
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, DateTime



class Library(db.Model):
    __tablename__ = 'libraries'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False) #in production, want to reference correct table
    song_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('songs.id')))
    album_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('albums.id')))
    playlist_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('playlists.id')))

    #RELATIONSHIPS
    user = db.relationship("User", back_populates="libraries")
    song= db.relationship("Song", back_populates="libraries")
    album= db.relationship("Album", back_populates="libraries")
    playlist= db.relationship("Playlist", back_populates="libraries")
    # like= db.relationship("Like", back_populates="libraries")
