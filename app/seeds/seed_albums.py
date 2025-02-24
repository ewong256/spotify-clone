from app.models import db, Album, environment, SCHEMA
from sqlalchemy.sql import text

def seed_albums():
    album1 = Album(
        title='Album One', 
        user_id=1, 
        image_url='https://qodeinteractive.com/magazine/wp-content/uploads/2020/06/8-Tyler-the-Creator.jpg',
        audio_url='http://example.com/audio1.mp3'  # Adding audio_url
    )
    album2 = Album(
        title='Album Two', 
        user_id=2, 
        image_url='https://m.media-amazon.com/images/I/71pxGj4RoVS._AC_UF894,1000_QL80_.jpg',
        audio_url='http://example.com/audio2.mp3'  # Adding audio_url
    )
    album3 = Album(
        title='Album Three', 
        user_id=3, 
        image_url='https://preview.redd.it/starboy-album-cover-colourised-v0-63bfaan13gd81.jpg?auto=webp&s=11a815f8c78324665fbbf15281e485b191dc3305',
        audio_url='http://example.com/audio3.mp3'  # Adding audio_url
    )
    album4 = Album(
        title='Album Four', 
        user_id=3, 
        image_url='https://www.theglobeandmail.com/resizer/v2/3YV2PTJAVFGCVJK5IC6RJYY6EA?auth=9a53ead4505ce67e63addf8bc4d133c4c3d7c7d584a921b98b689f7c426cd716&width=1500&quality=80',
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
