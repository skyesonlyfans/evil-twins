import axios from 'axios';

// -----------------------------------------------------------------------------
// IMPORTANT: This token should be kept secure and ideally not be directly in the source code.
const GENIUS_ACCESS_TOKEN = 'RikXcu5kcsziNp_lflxoFjTc40ocgtyw14_Jdc44vXRzB3kgL89rmXwcAgc5_2r3';
// -----------------------------------------------------------------------------

// NOTE: This proxy is ONLY for scraping the Genius HTML page, NOT for API calls.
// Public proxies can be unreliable. For production, a self-hosted proxy is recommended.
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const API_BASE_URL = 'https://api.genius.com';

/**
 * Searches for a song on Genius by title and artist.
 * This call goes DIRECTLY to the Genius API.
 */
const searchForSong = async (title, artist) => {
  const searchQuery = `${title} ${artist}`.toLowerCase()
    .replace(/ *\([^)]*\) */g, "")
    .replace(/ *\[[^\]]*\] */g, "")
    .trim();

  // The proxy is REMOVED from this API call
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
 * This call goes DIRECTLY to the Genius API.
 */
const getSongById = async (songId) => {
  // The proxy is REMOVED from this API call
  const response = await axios.get(`${API_BASE_URL}/songs/${songId}`, {
    headers: { 'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}` },
  });
  return response.data.response.song.url;
};

/**
 * Finds the best Genius URL for a song, prioritizing a direct ID lookup.
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
        // If the direct API call fails, it might be a CORS issue after all, let's try with the proxy as a fallback for the API call
        console.log('Direct API call failed, trying with proxy as fallback...');
        try {
             const proxiedResponse = await axios.get(`${CORS_PROXY}${API_BASE_URL}/songs/${song.geniusId}`, {
                 headers: { 'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}` },
             });
             return proxiedResponse.data.response.song.url;
        } catch (proxyError) {
             console.error('Proxy fallback also failed:', proxyError.message);
             return null;
        }
    }
};


/**
 * Scrapes the lyrics from a given Genius URL.
 * This call NEEDS the proxy because we are scraping a website, not an API.
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
