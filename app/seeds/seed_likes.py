from app.models import db, Like

def seed_likes():
    like1 = Like(user_id=1, song_id=1)
    like2 = Like(user_id=1, song_id=2)
    like3 = Like(user_id=2, song_id=3)
    like4 = Like(user_id=2, song_id=4)
    like5 = Like(user_id=3, song_id=5)
    like6 = Like(user_id=3, song_id=6)

    db.session.add(like1)
    db.session.add(like2)
    db.session.add(like3)
    db.session.add(like4)
    db.session.add(like5)
    db.session.add(like6)
    db.session.commit()

def undo_likes():
    db.session.execute('DELETE FROM likes')
    db.session.commit()
