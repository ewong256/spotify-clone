import os
from app import db
from app.models import Album, Song, AlbumSong

# Helper function to get the MP3 file path from the static directory
def get_mp3_file_path(filename):
    file_path = os.path.join("app", "static", "mp3_files", filename)
    if not os.path.exists(file_path):
        print(f"MP3 file {filename} does not exist!")
        return None
    return file_path

# Seed data for songs, linking them to an existing album (e.g., album ID 1)
def seed_album_songs():
    album_id = 1  # Use an existing album ID

    # List of songs to be linked to the album
    songs_data = [
        {"title": "her-americandawn", "filename": "her-americandawn.mp3"},
        {"title": "phonk2", "filename": "phonk2.mp3"},
        {"title": "rap", "filename": "rap.mp3"},
    ]

    # Fetch the album by ID
    album = Album.query.get(album_id)
    if not album:
        print(f"Album with ID {album_id} not found!")
        return

    # Create a list of songs and album-song relationships to add
    songs_to_add = []
    album_songs_to_add = []

    for song_data in songs_data:
        mp3_file_path = get_mp3_file_path(song_data["filename"])

        if not mp3_file_path:
            continue  # Skip if file is not found

        # Create the song object and prepare it for insertion
        song = Song(title=song_data["title"], audio_url=f"/static/mp3_files/{song_data['filename']}")
        songs_to_add.append(song)

        # Create the many-to-many relationship between album and song
        album_song = AlbumSong(album_id=album.id, song_id=song.id)
        album_songs_to_add.append(album_song)

    # Add songs and album-song relationships to the session
    db.session.add_all(songs_to_add)
    db.session.add_all(album_songs_to_add)

    # Commit all changes to the database at once
    db.session.commit()

    print("Songs successfully added and linked to album!")

# Run the seeding function
if __name__ == "__main__":
    seed_album_songs()
