from .db import db, environment, SCHEMA, add_prefix_for_prod
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, DateTime



class AlbumSong(db.Model):
    __tablename__ = 'album_songs'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    album_id = db.Column(db.Integer, db.ForeignKey('albums.id'), nullable=False)
    song_id = db.Column(db.Integer, db.ForeignKey('songs.id'), nullable=False)

    # Relationships
    album = db.relationship("Album", back_populates="songs")
    song = db.relationship("Song", back_populates="albums")

    def to_dict(self):
        """Retrieve actual song details from the Song table."""
        return self.song.to_dict()  # Access the song’s to_dict()