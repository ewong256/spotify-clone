from .db import db, environment, SCHEMA, add_prefix_for_prod
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, DateTime



class Song(db.Model):
    __tablename__ = 'songs'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(250), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False) #in production, want to reference correct table
    album_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('albums.id')), nullable=False)
    song_url = db.Column(db.String(500), nullable=False) #AWS S3 storage URL
    image_url = db.Column(db.String(500), nullable=False) #AWS S3 storage URL
    created_at = db.Column(DateTime, default=func.now())
    updated_at = db.Column(DateTime, onupdate=func.now())

    #RELATIONSHIP
    user = db.relationship("User", back_populates="songs")
    albums = db.relationship("AlbumSong", back_populates="song")
    likes = db.relationship("Like", back_populates="song", cascade="all, delete-orphan")
    genre= db.relationship("SongGenre", back_populates="song")
    playlist= db.relationship("PlaylistSong", back_populates="song")
    libraries = db.relationship("Library", back_populates="song")
