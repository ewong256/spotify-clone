import React, { useState } from 'react';

const CreateSong = () => {
  const [title, setTitle] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const csrfToken = document.cookie.match(/csrf_token=([\w-]+)/)[1];
    const authToken = localStorage.getItem('authToken');

    const newSong = { title, song_url: songUrl, album_id: albumId };

    try {
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(newSong),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors || 'Failed to create song');
      }

      const result = await response.json();
      console.log('Song created:', result);

      // Clear form or redirect user (optional)
      setTitle('');
      setSongUrl('');
      setAlbumId('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Create a New Song</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="songUrl">Song URL</label>
          <input
            id="songUrl"
            type="url"
            value={songUrl}
            onChange={(e) => setSongUrl(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="albumId">Album ID</label>
          <input
            id="albumId"
            type="number"
            value={albumId}
            onChange={(e) => setAlbumId(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Song</button>
      </form>
    </div>
  );
};

export default CreateSong;
