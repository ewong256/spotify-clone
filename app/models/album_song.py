from .db import db, environment, SCHEMA, add_prefix_for_prod
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, DateTime



class AlbumSong(db.Model):
    __tablename__ = 'album_songs'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    album_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('albums.id')), nullable=False) #in production, want to reference correct table
    song_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('songs.id')), nullable=False)

    #RELATIONSHIPS
    album = db.relationship("Album", back_populates="songs")
    song = db.relationship("Song", back_populates="albums")


    #Same Song cannot appear again in same Album:
#     __table_args__ = (
#     db.UniqueConstraint('album_id', 'song_id', name='unique_album_song'),
# )
