from .db import db, environment, SCHEMA, add_prefix_for_prod
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, DateTime

class Album(db.Model):
    __tablename__ = 'albums'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(250), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    image_url = db.Column(db.String(500), nullable=True)  # URL for album cover image
    audio_url = db.Column(db.String(500), nullable=True)  # URL for album audio file
    created_at = db.Column(DateTime, default=func.now())
    updated_at = db.Column(DateTime, onupdate=func.now())

    # Relationships
    user = db.relationship("User", back_populates="albums")
    songs = db.relationship("AlbumSong", back_populates="album", cascade="all, delete-orphan")

    def to_dict(self, include_songs=True):
        print('hello', self.songs)
        # Base album data
        album_data = {
            'id': self.id,
            'title': self.title,
            'user_id': self.user_id,
            'image_url': self.image_url,
            'audio_url': self.audio_url  # Add this field to the response dictionary
        }

        # Include songs if specified
        if include_songs:
            album_data['songs'] = [song.to_dict() for song in self.songs]
        
        return album_data
