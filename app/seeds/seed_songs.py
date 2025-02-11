from app.models import db, Song

def seed_songs():
    song1 = Song(
        title='Song One', audio_url='http://example.com/song1.mp3', user_id=1, image_url='http://example.com/song1.jpg') #aws #docker
    song2 = Song(
        title='Song Two', audio_url='http://example.com/song2.mp3', user_id=1, image_url='http://example.com/song2.jpg')
    song3 = Song(
        title='Song Three', audio_url='http://example.com/song3.mp3', user_id=2, image_url='http://example.com/song3.jpg')
    song4 = Song(
        title='Song Four', audio_url='http://example.com/song4.mp3', user_id=2, image_url='http://example.com/song4.jpg')
    song5 = Song(
        title='Song Five', audio_url='http://example.com/song5.mp3', user_id=3, image_url='http://example.com/song5.jpg')
    song6 = Song(
        title='Song Six', audio_url='http://example.com/song6.mp3', user_id=3, image_url='http://example.com/song6.jpg')

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
