from app.models import db, Genre, environment, SCHEMA
from sqlalchemy.sql import text

def seed_genres():
    genres = [
        Genre(name="Pop"),
        Genre(name="Rock"),
        Genre(name="Hip-Hop"),
        Genre(name="Jazz"),
        Genre(name="Electronic"),
        Genre(name="Classical"),
        Genre(name="Reggae"),
        Genre(name="Country"),
        Genre(name="R&B"),
        Genre(name="Metal")
    ]

    db.session.add_all(genres)
    db.session.commit()


def undo_genres():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.genres RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM genres"))

    db.session.commit()
