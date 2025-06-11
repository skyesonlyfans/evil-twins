import axios from 'axios';
import { getLyricsFromDB, addLyricsToDB } from '../utils/db';

const LRC_API_BASE_URL = 'https://lrclib.net/api';

/**
 * Parses a standard LRC format string into an array of timed lyric objects.
 * @param {string} lrcText The LRC formatted text.
 * @returns {Array<{time: number, text: string}>|null}
 */
const parseLRC = (lrcText) => {
    if (!lrcText) return null;
    const lines = lrcText.split('\n');
    const lyrics = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

    for (const line of lines) {
        const match = line.match(timeRegex);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const milliseconds = parseInt(match[3], 10);
            const text = match[4].trim();

            const time = minutes * 60 + seconds + milliseconds / 1000;
            if (text) {
                lyrics.push({ time, text });
            }
        }
    }
    return lyrics.length > 0 ? lyrics : null;
};

/**
 * Fallback function to scrape plain text lyrics from Lyricsify.
 * NOTE: This is fragile and depends on the website's HTML structure, which can change.
 * This will likely be blocked by CORS in a live browser environment without a proxy.
 * @param {object} song The song object.
 * @returns {Promise<{plain: string, synced: null}|null>}
 */
const fetchLyricsFromLyricsify = async (song) => {
    console.log(`Falling back to scrape lyrics from Lyricsify for "${song.title}"...`);
    try {
        // This simplified approach assumes the URL structure is consistent.
        // A more robust solution would search and parse the results.
        const artist = song.artist.toLowerCase().replace(/ /g, '-');
        const title = song.title.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
        const pageUrl = `https://www.lyricsify.com/lyrics/${artist}/${title}`;

        // This request will likely fail due to CORS without a server-side proxy.
        const { data: html } = await axios.get(pageUrl);

        // This regex looks for the specific div containing the lyrics on Lyricsify.
        const lyricsDivRegex = /<div id="lyrics"[^>]*>([\s\S]*?)<\/div>/;
        const match = html.match(lyricsDivRegex);

        if (match && match[1]) {
            let lyricsText = match[1].replace(/<br\s*\/?>/gi, '\n').trim();
            // Create a temporary element to decode HTML entities
            const txt = document.createElement("textarea");
            txt.innerHTML = lyricsText;
            lyricsText = txt.value;
            
            console.log(`Successfully scraped lyrics for "${song.title}" from Lyricsify.`);
            const result = { plainLyrics: lyricsText, syncedLyrics: null };
            await addLyricsToDB(song.id, result); // Cache the result
            return { plain: lyricsText, synced: null };
        }
        return null;
    } catch (error) {
        console.error(`Failed to scrape Lyricsify for "${song.title}". This may be a CORS issue.`, error);
        return null;
    }
}

/**
 * Fetches lyrics by checking cache, then lrclib, then falling back to Lyricsify.
 * @param {object} song The song object.
 * @param {number} duration The duration of the song in seconds.
 * @returns {Promise<{synced: Array, plain: string}|null>}
 */
export const getLyrics = async (song, duration) => {
    if (!song) return null;

    // 1. Check local cache
    const cachedLyrics = await getLyricsFromDB(song.id);
    if (cachedLyrics) {
        console.log(`Found lyrics for "${song.title}" in cache.`);
        return {
            plain: cachedLyrics.plainLyrics || "No plain lyrics available.",
            synced: parseLRC(cachedLyrics.syncedLyrics)
        };
    }

    console.log(`No cache for "${song.title}", fetching from external sources...`);

    try {
        // 2. Try precise match on lrclib.net
        let response = await axios.get(`${LRC_API_BASE_URL}/get`, {
            params: {
                track_name: song.title,
                artist_name: song.artist,
                album_name: song.albumName || '',
                duration: Math.round(duration)
            }
        });

        if (response.data && (response.data.syncedLyrics || response.data.plainLyrics)) {
            console.log(`Found precise lyric match for "${song.title}" on lrclib.net.`);
            await addLyricsToDB(song.id, response.data);
            return {
                plain: response.data.plainLyrics,
                synced: parseLRC(response.data.syncedLyrics)
            };
        }

        // 3. Fall back to lrclib.net search
        console.log(`No precise match, falling back to lrclib.net search for "${song.title}".`);
        response = await axios.get(`${LRC_API_BASE_URL}/search`, {
            params: { track_name: song.title, artist_name: song.artist }
        });

        if (response.data && response.data.length > 0) {
            const bestMatch = response.data[0];
            console.log(`Found best match via lrclib.net search: "${bestMatch.trackName}"`);
            await addLyricsToDB(song.id, bestMatch);
            return {
                plain: bestMatch.plainLyrics || "No plain lyrics available.",
                synced: parseLRC(bestMatch.syncedLyrics)
            };
        }

        // 4. Final fallback to Lyricsify scraping
        const lyricsifyResult = await fetchLyricsFromLyricsify(song);
        if (lyricsifyResult) {
            return lyricsifyResult;
        }

        console.log(`Could not find any lyrics for "${song.title}" from any source.`);
        return null;

    } catch (error) {
        console.error("An error occurred during the lyric fetching process:", error);
        return null;
    }
};
