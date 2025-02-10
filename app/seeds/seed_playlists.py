from app.models import db, Playlist

def seed_playlists():
    playlist1 = Playlist(
        name='Top 100 hits', user_id=1, image_url='http://example.com/playlist1.jpg')
    playlist2 = Playlist(
        name='Indie', user_id=2, image_url='http://example.com/playlist2.jpg')
    playlist3 = Playlist(
        name='Party Hits', user_id=3, image_url='http://example.com/playlist3.jpg')

    db.session.add(playlist1)
    db.session.add(playlist2)
    db.session.add(playlist3)
    db.session.commit()

def undo_playlists():
    db.session.execute('DELETE FROM playlists')
    db.session.commit()
