from .db import db, environment, SCHEMA, add_prefix_for_prod
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, DateTime



class Playlist(db.Model):
    __tablename__ = 'playlists'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(250), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False) #in production, want to reference correct table
    image_url = db.Column(db.String(500), nullable=False) #AWS S3 storage URL
    special_type=db.Column(db.String(50), nullable=True) #Added for "Liked_Songs"
    created_at = db.Column(DateTime, default=func.now())
    updated_at = db.Column(DateTime, onupdate=func.now())


  #RELATIONSHIPS
    user = db.relationship("User", back_populates="playlists")
    songs = db.relationship("PlaylistSong", back_populates="playlist", cascade="all, delete-orphan")
    libraries = db.relationship("Library", back_populates="playlist", cascade="all, delete-orphan")
