from app.models import db, Playlist, environment, SCHEMA
from sqlalchemy.sql import text

def seed_playlists():
    playlist1 = Playlist(
        title='Top 100 hits', user_id=1, image_url='https://media.istockphoto.com/id/1183953611/vector/top-100-best-podium-award-sign-golden-object-vector-illustration.jpg?s=612x612&w=0&k=20&c=lGbpSGIH5Hl4fJo8a36l1vdOBg_62P4QnrbuBD-VZy0=')
    playlist2 = Playlist(
        title='Indie', user_id=2, image_url='https://img.freepik.com/free-vector/hand-drawn-indie-music-illustration_23-2149676368.jpg')
    playlist3 = Playlist(
        title='Party Hits', user_id=3, image_url='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZt14XFlLF-ZvgI8V28M-dCEluO59xXzRRVQ&s')

    db.session.add(playlist1)
    db.session.add(playlist2)
    db.session.add(playlist3)
    db.session.commit()

def undo_playlists():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.playlists RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM playlists"))

    db.session.commit()
