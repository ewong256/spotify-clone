from .db import db, environment, SCHEMA, add_prefix_for_prod
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, DateTime



class Album(db.Model):
    __tablename__ = 'albums'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(250), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False) #in production, want to reference correct table
    image_url = db.Column(db.String(500), nullable=False) #AWS S3 storage URL
    # banner_image_url = db.Column(db.String(500), nullable=False) #AWS S3 storage URL
    created_at = db.Column(DateTime, default=func.now())
    updated_at = db.Column(DateTime, onupdate=func.now())

    #RELATIONSHIPS
    user = db.relationship("User", back_populates="albums")
    songs = db.relationship("AlbumSong", back_populates="album", cascade="all, delete-orphan")
    libraries = db.relationship("Library", back_populates="album", cascade="all, delete-orphan")


    #Same User cannot make Album with same Name:
#     __table_args__ = (
#     db.UniqueConstraint('title', 'user_id', name='unique_album_title_user'),)
