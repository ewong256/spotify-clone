from app.models import db, Album, environment, SCHEMA
from sqlalchemy.sql import text

def seed_albums():
    album1 = Album(
        title='Album One', 
        user_id=1, 
        image_url='http://example.com/album1.jpg',
        audio_url='http://example.com/audio1.mp3'  # Adding audio_url
    )
    album2 = Album(
        title='Album Two', 
        user_id=2, 
        image_url='http://example.com/album2.jpg',
        audio_url='http://example.com/audio2.mp3'  # Adding audio_url
    )
    album3 = Album(
        title='Album Three', 
        user_id=3, 
        image_url='http://example.com/album3.jpg',
        audio_url='http://example.com/audio3.mp3'  # Adding audio_url
    )
    album4 = Album(
        title='Album Four', 
        user_id=3, 
        image_url='http://example.com/album4.jpg',
        audio_url='http://example.com/audio4.mp3'  # Adding audio_url
    )

    db.session.add(album1)
    db.session.add(album2)
    db.session.add(album3)
    db.session.add(album4)
    print(album1.image_url, album2.image_url, album3.image_url, album4.image_url)  # COMMENT OUT
    db.session.commit()

def undo_albums():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.albums RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM albums"))

    db.session.commit()
