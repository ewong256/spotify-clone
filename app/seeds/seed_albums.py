from app.models import db, Album

def seed_albums():
    album1 = Album(
        title='Album One', user_id=1, image_url='http://example.com/album1.jpg') #docker?
    album2 = Album(
        title='Album Two', user_id=2, image_url='http://example.com/album2.jpg')
    album3 = Album(
        title='Album Three', user_id=3, image_url='http://example.com/album3.jpg')
    album4 = Album(
        title='Album Four', user_id=4, image_url='http://example.com/album4.jpg')


    db.session.add(album1)
    db.session.add(album2)
    db.session.add(album3)
    db.session.add(album4)
    print(album1.image_url, album2.image_url, album3.image_url, album4.image_url)#COMMENT OUT
    db.session.commit()

def undo_albums():
    db.session.execute('DELETE FROM albums')
    db.session.commit()
