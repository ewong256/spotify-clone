from .db import db, environment, SCHEMA
from flask_sqlalchemy import SQLAlchemy



class Genre(db.Model):
    __tablename__ = 'genres'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)

    #Relationships
    song = db.relationship("SongGenre", back_populates="genre", cascade="all, delete-orphan")
