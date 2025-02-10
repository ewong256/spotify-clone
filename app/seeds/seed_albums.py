from app.models import db, Album

def seed_albums():
    album1 = Album(
        title='Album One', artist_id=1, image_url='http://example.com/album1.jpg') #docker?
    album2 = Album(
        title='Album Two', artist_id=2, image_url='http://example.com/album2.jpg')
    album3 = Album(
        title='Album Three', artist_id=3, image_url='http://example.com/album3.jpg')
    album4 = Album(
        title='Album Four', artist_id=1, image_url='http://example.com/album4.jpg')

    db.session.add(album1)
    db.session.add(album2)
    db.session.add(album3)
    db.session.add(album4)
    db.session.commit()

def undo_albums():
    db.session.execute('DELETE FROM albums')
    db.session.commit()
