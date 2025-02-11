from .db import db, environment, SCHEMA, add_prefix_for_prod
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, DateTime
from .playlist import Playlist
from .playlist_song import PlaylistSong




class Like(db.Model):
    __tablename__ = 'likes'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False) #in production, want to reference correct table
    song_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('songs.id')))
    # album_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('albums.id')))
    # playlist_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('playlists.id')))

    #RELATIONSHIPS
    user = db.relationship("User", back_populates="likes")
    song = db.relationship("Song", back_populates="likes")
    # libraries = db.relationship("Library", back_populates="like")

    # When fetching the Liked Songs playlist: Query all likes for the user and return the corresponding songs.
    # "liked_songs = Like.query.filter_by(user_id=current_user.id).join(Song).all()"
    def __init__(self, user_id, song_id):
        self.user_id = user_id
        self.song_id = song_id

        # Add to Liked Songs playlist
        # liked_playlist = Playlist.query.filter_by(user_id=user_id, special_type='liked_songs').first()
        # if not liked_playlist:
        #     liked_playlist = Playlist(
        #         user_id=user_id,
        #         title="Liked Songs",
        #         image_url="default_liked_image_url",  # Add a default image
        #         special_type="liked_songs"
        #     )
        #     db.session.add(liked_playlist)
        #     db.session.commit()

        # playlist_song = PlaylistSong(playlist_id=liked_playlist.id, song_id=song_id)
        # db.session.add(playlist_song)
