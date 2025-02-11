from app.models import db, Song, Album

def seed_songs():

    # album1 = Album(title='Album One', user_id=1)
    # album2 = Album(title='Album Two', user_id=2)
    # album3 = Album(title='Album Three', user_id=3)

    # db.session.add(album1)
    # db.session.add(album2)
    # db.session.add(album3)
    # db.session.commit()


    song1 = Song(
        title='Song One', song_url='http://example.com/song1.mp3', user_id=1, image_url='http://example.com/song1.jpg', album_id=1)
    song2 = Song(
        title='Song Two', song_url='http://example.com/song2.mp3', user_id=1, image_url='http://example.com/song2.jpg', album_id=1)
    song3 = Song(
        title='Song Three', song_url='http://example.com/song3.mp3', user_id=2, image_url='http://example.com/song3.jpg', album_id=2)
    song4 = Song(
        title='Song Four', song_url='http://example.com/song4.mp3', user_id=2, image_url='http://example.com/song4.jpg', album_id=2)
    song5 = Song(
        title='Song Five', song_url='http://example.com/song5.mp3', user_id=3, image_url='http://example.com/song5.jpg', album_id=3)
    song6 = Song(
        title='Song Six', song_url='http://example.com/song6.mp3', user_id=3, image_url='http://example.com/song6.jpg', album_id=3)


    db.session.add(song1)
    db.session.add(song2)
    db.session.add(song3)
    db.session.add(song4)
    db.session.add(song5)
    db.session.add(song6)

    db.session.commit()

def undo_songs():
    db.session.execute('DELETE FROM songs')
    db.session.commit()
