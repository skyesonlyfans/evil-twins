import axios from 'axios';
import { getLyricsFromDB, addLyricsToDB } from '../utils/db';

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
 * Fallback function to scrape LRC data from Lyricsify.com.
 * This is a multi-step process and is dependent on the website's structure.
 * @param {object} song The song object.
 * @returns {Promise<{plain: string, synced: object}|null>}
 */
const fetchLyricsFromLyricsify = async (song) => {
    console.log(`Falling back to scrape lyrics from Lyricsify for "${song.title}"...`);
    try {
        // Step 1: Search for the song to find its specific URL
        const searchQuery = `${song.title} ${song.artist}`;
        const searchUrl = `https://www.lyricsify.com/search?q=${encodeURIComponent(searchQuery)}`;
        
        const { data: searchHtml } = await axios.get(searchUrl);
        
        // Step 2: Parse the search page to find the first result link
        const songLinkRegex = /<a href="(\/lyrics\/[^"]+)" class="title">/g;
        const songLinkMatch = songLinkRegex.exec(searchHtml);
        
        if (!songLinkMatch || !songLinkMatch[1]) {
            console.log("Could not find a matching song link on Lyricsify search results.");
            return null;
        }
        const songPageUrl = `https://www.lyricsify.com${songLinkMatch[1]}`;

        // Step 3: Fetch the actual song page
        const { data: songPageHtml } = await axios.get(songPageUrl);

        // Step 4: Extract the raw LRC content from the page
        const lrcContentRegex = /<div id="lrc"[^>]*>([\s\S]*?)<\/div>/;
        const lrcMatch = lrcContentRegex.exec(songPageHtml);

        if (lrcMatch && lrcMatch[1]) {
            let rawLrc = lrcMatch[1];
            // Decode any HTML entities (like &amp;, &quot;, etc.)
            const txt = document.createElement("textarea");
            txt.innerHTML = rawLrc;
            rawLrc = txt.value;

            const plainLyrics = rawLrc.replace(/\[.*?\]/g, '').trim();
            const syncedLyrics = parseLRC(rawLrc);
            
            if (syncedLyrics) {
                console.log(`Successfully scraped LRC for "${song.title}" from Lyricsify.`);
                // Cache the raw response from Lyricsify so we can parse it again later
                await addLyricsToDB(song.id, { plainLyrics, syncedLyrics: rawLrc });
                return { plain: plainLyrics, synced: syncedLyrics };
            }
        }
        return null;
    } catch (error) {
        console.error(`Failed to scrape Lyricsify for "${song.title}". This could be a CORS issue or a change in the website's layout.`, error);
        return null;
    }
}


/**
 * Main function to fetch lyrics with multiple fallbacks.
 * @param {object} song The song object.
 * @param {number} duration The duration of the song in seconds.
 * @returns {Promise<{synced: Array, plain: string}|null>}
 */
export const getLyrics = async (song, duration) => {
    if (!song) return null;

    // 1. Check local cache (IndexedDB) first
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
        const lrcLibGetUrl = `https://lrclib.net/api/get`;
        let response = await axios.get(lrcLibGetUrl, {
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
        const lrcLibSearchUrl = `https://lrclib.net/api/search`;
        response = await axios.get(lrcLibSearchUrl, {
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
