import axios from 'axios';

// -----------------------------------------------------------------------------
// IMPORTANT: REPLACE THIS WITH YOUR OWN CLIENT ACCESS TOKEN FROM GENIUS.COM
const GENIUS_ACCESS_TOKEN = 'RikXcu5kcsziNp_lflxoFjTc40ocgtyw14_Jdc44vXRzB3kgL89rmXwcAgc5_2r3';
// -----------------------------------------------------------------------------

// Switched to a different CORS proxy for better reliability
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'; 
const API_BASE_URL = 'https://api.genius.com';

// ... rest of the file remains the same
/**
 * Searches for a song on Genius by title and artist.
 * @returns {Promise<string|null>} The URL of the best match, or null.
 */
const searchForSong = async (title, artist) => {
  const searchQuery = `${title} ${artist}`.toLowerCase()
    .replace(/ *\([^)]*\) */g, "")
    .replace(/ *\[[^\]]*\] */g, "")
    .trim();

  const response = await axios.get(`${API_BASE_URL}/search`, {
    headers: { 'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}` },
    params: { 'q': searchQuery },
  });

  const hits = response.data.response.hits;
  if (hits.length === 0) return null;

  const bestHit = hits.find(hit => hit.result.primary_artist.name.toLowerCase().includes(artist.toLowerCase())) || hits[0];
  return bestHit.result.url;
};

/**
 * Gets a song's data directly from Genius using its ID.
 * @returns {Promise<string|null>} The URL of the song, or null.
 */
const getSongById = async (songId) => {
  const response = await axios.get(`${API_BASE_URL}/songs/${songId}`, {
    headers: { 'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}` },
  });
  return response.data.response.song.url;
};

/**
 * Finds the best Genius URL for a song, prioritizing a direct ID lookup.
 * @param {object} song The song object, which may contain a `geniusId`.
 * @returns {Promise<string|null>} The URL of the song, or null.
 */
export const findBestGeniusUrl = async (song) => {
    if (!GENIUS_ACCESS_TOKEN || GENIUS_ACCESS_TOKEN === 'YOUR_GENIUS_CLIENT_ACCESS_TOKEN_HERE') {
        console.error('Genius API Access Token is missing.');
        throw new Error('Genius API Access Token is missing.');
    }
    try {
        if (song.geniusId) {
            console.log(`Found Genius ID (${song.geniusId}), fetching directly.`);
            return await getSongById(song.geniusId);
        } else {
            console.log(`No Genius ID, searching for "${song.title}" by ${song.artist}`);
            return await searchForSong(song.title, song.artist);
        }
    } catch (error) {
        console.error('Error finding song on Genius:', error.message);
        return null;
    }
};


/**
 * Scrapes the lyrics from a given Genius URL.
 * @param {string} url The URL of the song page on Genius.com.
 * @returns {Promise<string|null>} A promise that resolves to the lyrics HTML, or null on failure.
 */
export const getLyrics = async (url) => {
    if (!url) return null;
    try {
        const proxiedUrl = `${CORS_PROXY}${url}`;
        const { data: html } = await axios.get(proxiedUrl);
        
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const lyricContainers = doc.querySelectorAll('div[data-lyrics-container="true"]');
        
        if (!lyricContainers || lyricContainers.length === 0) return null;

        let lyrics = '';
        lyricContainers.forEach(container => {
            lyrics += container.innerHTML;
        });

        lyrics = lyrics.replace(/<a[^>]*>|<\/a>/g, "");
        
        return lyrics.trim() || null;

    } catch (error) {
        console.error('Error scraping lyrics:', error);
        return null;
    }
}
