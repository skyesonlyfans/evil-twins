import axios from 'axios';

// -----------------------------------------------------------------------------
// IMPORTANT: REPLACE THIS WITH YOUR OWN CLIENT ACCESS TOKEN FROM GENIUS.COM
const GENIUS_ACCESS_TOKEN = '281JA3XbbYyUGcvaWLF5OuvUX140g4o_1H19Rl1mSAC3RlWCbJ9tYgvv_s-eKjtl';
// -----------------------------------------------------------------------------

// We use a public CORS proxy to fetch the Genius page HTML from the client-side.
// This can be unreliable and is for demonstration purposes. A real production
// app would have its own backend server to do this.
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

const API_BASE_URL = 'https://api.genius.com';


/**
 * Searches for a song on Genius and returns the URL to its lyrics page.
 * @param {string} title The title of the song.
 * @param {string} artist The artist of the song.
 * @returns {Promise<string|null>} A promise that resolves to the song's URL on Genius, or null if not found.
 */
export const getGeniusSongUrl = async (title, artist) => {
  if (!GENIUS_ACCESS_TOKEN || GENIUS_ACCESS_TOKEN === 'YOUR_GENIUS_CLIENT_ACCESS_TOKEN_HERE') {
    console.error('Genius API Access Token is missing. Please add it in src/services/genius.js');
    return null;
  }

  const searchQuery = `${title} ${artist}`.toLowerCase()
    .replace(/ *\([^)]*\) */g, "")
    .replace(/ *\[[^\]]*\] */g, "")
    .trim();

  try {
    const response = await axios.get(`${API_BASE_URL}/search`, {
      headers: {
        'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}`,
      },
      params: {
        'q': searchQuery,
      },
    });

    const hits = response.data.response.hits;
    if (hits.length === 0) return null;

    // Find the best match, preferring results where the primary artist matches.
    const bestHit = hits.find(hit => hit.result.primary_artist.name.toLowerCase().includes(artist.toLowerCase())) || hits[0];
    return bestHit.result.url;

  } catch (error) {
    console.error('Error searching on Genius API:', error);
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
        const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
        const { data: html } = await axios.get(proxiedUrl);
        
        // Create a temporary, disconnected DOM element to parse the HTML string
        const doc = new DOMParser().parseFromString(html, 'text/html');
        
        // Genius marks lyrics containers with a specific data attribute.
        const lyricContainers = doc.querySelectorAll('div[data-lyrics-container="true"]');
        
        if (!lyricContainers || lyricContainers.length === 0) {
            console.log("Could not find lyrics container on page.");
            return null;
        }

        let lyrics = '';
        lyricContainers.forEach(container => {
            // Replace <br> tags with newlines for better text formatting if needed,
            // but innerHTML will preserve them for rendering.
            lyrics += container.innerHTML;
        });

        // Basic cleanup of unwanted elements
        lyrics = lyrics.replace(/<a[^>]*>|<\/a>/g, ""); // Remove anchor tags
        
        return lyrics.trim() || null;

    } catch (error) {
        console.error('Error scraping lyrics:', error);
        return null;
    }
}
