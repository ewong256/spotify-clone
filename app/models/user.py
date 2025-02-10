from .db import db, environment, SCHEMA, add_prefix_for_prod
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
# from datetime import datetime
from sqlalchemy import func, DateTime



class User(db.Model, UserMixin):
    __tablename__ = 'users'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(40), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    hashed_password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    banner_image_url = db.Column(db.String(500), nullable=False) #AWS S3 storage URL #ARTIST ONLY
    avatar_url = db.Column(db.String(500))
    created_at = db.Column(DateTime, default=func.now())

    #RELATIONSHIPS
    songs = db.relationship("Song", back_populates="user")
    likes= db.relationship("Like", back_populates="user")
    notifications= db.relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    albums=db.relationship("Album", back_populates="user")
    libraries=db.relationship("Library", back_populates="user")
    playlists=db.relationship("Playlist", back_populates="user")
    liked_songs_playlist=db.relationship(
        "Playlist",
        primaryjoin="and_(Playlist.user_id == User.id, Playlist.special_type == 'liked_songs')",
        uselist=False
)



    @property
    def password(self):
        return self.hashed_password

    @password.setter
    def password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }
