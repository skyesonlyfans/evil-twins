import axios from 'axios';

// -----------------------------------------------------------------------------
// IMPORTANT: REPLACE THIS WITH YOUR OWN CLIENT ACCESS TOKEN FROM GENIUS.COM
const GENIUS_ACCESS_TOKEN = 'qODwE3-sxgQwu-5IXReCkADunvmBgigjojbQiapGasqivfes7T8hevKbqsZId61J';
// -----------------------------------------------------------------------------

const API_BASE_URL = 'https://api.genius.com';

// Note on Lyrics: The official Genius API does not provide lyrics directly in the API response.
// It provides a link to the song page on Genius.com. To get the actual lyrics, one would
// need to "scrape" the webpage, which is complex and brittle for a client-side app.
// For a robust solution, we will fetch the song's URL on Genius and provide a link for the user.

/**
 * Searches for a song on Genius and returns the URL to its lyrics page.
 * @param {string} title The title of the song.
 * @param {string} artist The artist of the song.
 * @returns {Promise<string|null>} A promise that resolves to the song's URL on Genius, or null if not found.
 */
export const getGeniusSongUrl = async (title, artist) => {
  if (!GENIUS_ACCESS_TOKEN || GENIUS_ACCESS_TOKEN === 'qODwE3-sxgQwu-5IXReCkADunvmBgigjojbQiapGasqivfes7T8hevKbqsZId61J') {
    console.error('Genius API Access Token is missing. Please add it in src/services/genius.js');
    return null;
  }

  // Sanitize the search query for better results
  const searchQuery = `${title} ${artist}`.toLowerCase()
    .replace(/ *\([^)]*\) */g, "") // remove anything in parentheses
    .replace(/ *\[[^\]]*\] */g, "") // remove anything in brackets
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

    if (hits.length === 0) {
      console.log(`No Genius hits found for: ${searchQuery}`);
      return null;
    }

    // The first hit is usually the best match
    const firstHit = hits[0].result;
    return firstHit.url;

  } catch (error) {
    console.error('Error fetching from Genius API:', error);
    return null;
  }
};
