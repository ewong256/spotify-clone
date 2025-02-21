from app.models import db, Song, Album, environment, SCHEMA
from sqlalchemy.sql import text

def seed_songs():
    song1 = Song(
        title='Dreams', 
        song_url='https://freemusicarchive.org/track/dreams/download/', 
        user_id=1, 
        image_url='https://images.pexels.com/photos/164777/pexels-photo-164777.jpeg', 
        album_id=1
    )
    song2 = Song(
        title='Night Drive', 
        song_url='https://freemusicarchive.org/track/night-drive/download/', 
        user_id=1, 
        image_url='https://images.pexels.com/photos/370717/pexels-photo-370717.jpeg', 
        album_id=1
    )
    song3 = Song(
        title='Golden Hour', 
        song_url='https://freemusicarchive.org/track/golden-hour/download/', 
        user_id=2, 
        image_url='https://images.pexels.com/photos/167599/pexels-photo-167599.jpeg', 
        album_id=2
    )
    song4 = Song(
        title='Wanderlust', 
        song_url='https://freemusicarchive.org/track/wanderlust/download/', 
        user_id=2, 
        image_url='https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg', 
        album_id=2
    )
    song5 = Song(
        title='Ocean Breeze', 
        song_url='https://freemusicarchive.org/track/ocean-breeze/download/', 
        user_id=3, 
        image_url='https://images.pexels.com/photos/238787/pexels-photo-238787.jpeg', 
        album_id=3
    )
    song6 = Song(
        title='Sunset Vibes', 
        song_url='https://freemusicarchive.org/track/sunset-vibes/download/', 
        user_id=3, 
        image_url='https://images.pexels.com/photos/462162/pexels-photo-462162.jpeg', 
        album_id=3
    )

    db.session.add_all([song1, song2, song3, song4, song5, song6])
    db.session.commit()

def undo_songs():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.songs RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM songs"))

    db.session.commit()
