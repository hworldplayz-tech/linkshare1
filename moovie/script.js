// TMDB API Configuration - Pure frontend implementation
const TMDB_API_KEY = "46d13701165988b5bb5fb4d123c0447e";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// Use direct TMDB API with API key
const API_BASE_URL = TMDB_BASE_URL;

// ===== FEATURED MOVIE CONFIGURATION =====
// Just change the TMDB ID below to feature any movie/series you want!

// Option 1: Use direct configuration
const FEATURED_MOVIE_CONFIG = {
    // tmdbId: 1061474,    // Superman (2025) - Change this ID to feature any movie you want!
    //type: "movie"       // "movie" or "tv"
    tmdbId: 66732, type: "tv" //stranger things s5 
};

// Option 2: Choose from pre-configured popular movies (uncomment one to use)
/*
const FEATURED_MOVIE_OPTIONS = {
    superman: { tmdbId: 1061474, type: "movie" },        // Superman (2025)
    venom: { tmdbId: 912649, type: "movie" },            // Venom: The Last Dance
    deadpool: { tmdbId: 533535, type: "movie" },         // Deadpool & Wolverine
    avatar: { tmdbId: 76600, type: "movie" },            // Avatar: The Way of Water
    batman: { tmdbId: 414906, type: "movie" },           // The Batman
    spiderman: { tmdbId: 634649, type: "movie" },        // Spider-Man: No Way Home
    wednesday: { tmdbId: 119051, type: "tv" },           // Wednesday (Netflix)
    stranger: { tmdbId: 66732, type: "tv" },             // Stranger Things
};

// To use pre-configured options, uncomment this line and comment the FEATURED_MOVIE_CONFIG above:
// const FEATURED_MOVIE_CONFIG = FEATURED_MOVIE_OPTIONS.superman;
*/

// Simplified Video Data - Only tmdbId and embedCode needed
const videoData = [
    {
        id: 1,
        tmdbId: 1246049, // Dracula: a love tale 2025
        type: "movie",
        downloads: [
            { url: "https://linkmake.in/view/B05yw8ufD9", label: "Hin/Eng" },
        ],
        embedCode: `<iframe src="https://ensta392zij.com/play/tt31434030" width="797" height="453" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`,
    },
    {
        id: 1,
        tmdbId: 200875, // IT: Welcome to Derry
        type: "tv",
        downloads: [
            { url: "https://nexdrive.vip/genxfm29007315845/", label: "EP1-6 Hin/Eng" },
        ],
        embedCode: `<iframe src="https://ensta392zij.com/play/tt19244304" width="797" height="453" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`,
    },
    {
        id: 1,
        tmdbId: 66732, // strangerthings s5
        type: "tv",
        downloads: [
            { url: "https://linkmake.in/view/7hH61pstIX", label: "S01 Hin/Eng" },
            { url: "https://linkmake.in/view/EpAizAKC2r", label: "S02 Hin/Eng" },
            { url: "https://linkmake.in/view/zQpGN5va3l", label: "S03 Hin/Eng" },
            { url: "https://linkmake.in/view/n32bRO4wOx", label: "S04 Hin/Eng" },
            { url: "https://linkmake.in/view/aReS4h8lnI", label: "S05 Hin/Eng Vol. 1" },
        ],
        embedCode: ``,
    },

    {
        id: 1,
        tmdbId: 1242898, // Predator badland 2025
        type: "movie",
        downloads: [{ url: "https://hubcloud.foo/drive/i16i0fq1wnwsnih", label: "Hindi/English" }],
        embedCode: ``,
    },
    {
        id: 1,
        tmdbId: 1180831, // Troll 2 2025
        type: "movie",
        downloads: [{ url: "https://linkmake.in/view/Xrc9N4FbJ9", label: "Hindi/English" }],
        embedCode: ``,
    },
    {
        id: 1,
        tmdbId: 736526, // Troll 1 2022
        type: "movie",
        downloads: [{ url: "https://linkmake.in/view/WEBlwBg6UY", label: "Hindi/English" }],
        embedCode: ``,
    },
    {
        id: 1,
        tmdbId: 533533, // Trons ares 2025
        type: "movie",
        downloads: [{ url: "https://linkmake.in/view/X8AGZjzyXX", label: "Hindi/English" }],
        embedCode: ``,
    },

    {
        id: 1,
        tmdbId: 1109086, // War 2
        type: "movie",
        downloads: [{ url: "https://linkmake.in/view/R5PGo1h13A", label: "Hindi/English" }],
        embedCode: `<iframe src="https://h-player-ashen.vercel.app/?embed=1&data=eyJwbGF5bGlzdCI6W3sic2VyaWVzTmFtZSI6IldpdGNoZXIiLCJzZWFzb25zIjpbeyJzZWFzb25OdW1iZXIiOjEsImVwaXNvZGVzIjpbeyJlcGlzb2RlTnVtYmVyIjoxLCJlcGlzb2RlTmFtZSI6ImVwMSIsInVybCI6Imh0dHBzOi8vbmV0NTEuY2MvaGxzLzgxNzA1NzIxLm0zdTg%2FaW49NmUxMzczNWMwMjQ5ZTNhMTY0M2M0OTMxMGFmZmM1ZWI6OjIxNTAwODMyMmU2NjFjYzk1YTY1ZmY5YTM5NzMzM2RmOjoxNzYzMTQwMTgwOjprcCIsImR1cmF0aW9uIjoiMDA6MDA6MDAiLCJxdWFsaXR5IjoiQXV0byIsInByb2dyZXNzIjoyMi43NTMyMTd9LHsiZXBpc29kZU51bWJlciI6MiwiZXBpc29kZU5hbWUiOiJlcDIiLCJ1cmwiOiJodHRwczovL25ldDUxLmNjL2hscy84MTcwNTcyMS5tM3U4P2luPTZlMTM3MzVjMDI0OWUzYTE2NDNjNDkzMTBhZmZjNWViOjoyMTUwMDgzMjJlNjYxY2M5NWE2NWZmOWEzOTczMzNkZjo6MTc2MzE0MDE4MDo6a3AiLCJkdXJhdGlvbiI6IjAwOjAwOjAwIiwicXVhbGl0eSI6IkF1dG8iLCJwcm9ncmVzcyI6NjYuODQzNDMxfSx7ImVwaXNvZGVOdW1iZXIiOjMsImVwaXNvZGVOYW1lIjoiZXAzIiwidXJsIjoiaHR0cHM6Ly9uZXQ1MS5jYy9obHMvODE3MDU3MjEubTN1OD9pbj02ZTEzNzM1YzAyNDllM2ExNjQzYzQ5MzEwYWZmYzVlYjo6MjE1MDA4MzIyZTY2MWNjOTVhNjVmZjlhMzk3MzMzZGY6OjE3NjMxNDAxODA6OmtwIiwiZHVyYXRpb24iOiIwMDowMDowMCIsInF1YWxpdHkiOiJBdXRvIiwicHJvZ3Jlc3MiOjB9LHsiZXBpc29kZU51bWJlciI6NCwiZXBpc29kZU5hbWUiOiJlcDQiLCJ1cmwiOiJodHRwczovL25ldDUxLmNjL2hscy84MTcwNTcyMS5tM3U4P2luPTZlMTM3MzVjMDI0OWUzYTE2NDNjNDkzMTBhZmZjNWViOjoyMTUwMDgzMjJlNjYxY2M5NWE2NWZmOWEzOTczMzNkZjo6MTc2MzE0MDE4MDo6a3AiLCJkdXJhdGlvbiI6IjAwOjAwOjAwIiwicXVhbGl0eSI6IkF1dG8iLCJwcm9ncmVzcyI6MH0seyJlcGlzb2RlTnVtYmVyIjo1LCJlcGlzb2RlTmFtZSI6ImVwNSIsInVybCI6Imh0dHBzOi8vbmV0NTEuY2MvaGxzLzgxNzA1NzIxLm0zdTg%2FaW49NmUxMzczNWMwMjQ5ZTNhMTY0M2M0OTMxMGFmZmM1ZWI6OjIxNTAwODMyMmU2NjFjYzk1YTY1ZmY5YTM5NzMzM2RmOjoxNzYzMTQwMTgwOjprcCIsImR1cmF0aW9uIjoiMDA6MDA6MDAiLCJxdWFsaXR5IjoiQXV0byIsInByb2dyZXNzIjowfV19LHsic2Vhc29uTnVtYmVyIjoyLCJlcGlzb2RlcyI6W3siZXBpc29kZU51bWJlciI6MSwiZXBpc29kZU5hbWUiOiJzMmVwMSIsInVybCI6Imh0dHBzOi8vbmV0NTEuY2MvaGxzLzgxNzA1NzIxLm0zdTg%2FaW49NmUxMzczNWMwMjQ5ZTNhMTY0M2M0OTMxMGFmZmM1ZWI6OjIxNTAwODMyMmU2NjFjYzk1YTY1ZmY5YTM5NzMzM2RmOjoxNzYzMTQwMTgwOjprcCIsImR1cmF0aW9uIjoiMDA6MDA6MDAiLCJxdWFsaXR5IjoiQXV0byIsInByb2dyZXNzIjowfV19XX1dLCJzYXZlIjpmYWxzZX0%3D" width="800" height="450" frameborder="0" allowfullscreen></iframe>

<!-- If you prefer to postMessage the playlist, use the player iframe and then send { type: "hplayer.load", payload: {...} } -->`,
    },
    {
        id: 1,
        tmdbId: 1061474, // Superman 
        type: "movie",
        downloads: ["https://linkmake.in/view/yz4V4eXOnt"],
        embedCode: `<IFRAME SRC="https://mivalyo.com/embed/euzlk6l3jb90" FRAMEBORDER=0 MARGINWIDTH=0 MARGINHEIGHT=0 SCROLLING=NO WIDTH=640 HEIGHT=360 allowfullscreen></IFRAME>`,
    },

    {
        id: 1,
        tmdbId: 205715, //Gen v
        type: "tv",
        downloads: [
            { url: "https://linkmake.in/view/ulJ1zQxeEE", label: "Season 1" },
            { url: "https://linkmake.in/view/tohS2UdpS0", label: "Season 2" },
        ],
        embedCode: `<iframe src="https://h-player-ashen.vercel.app/?embed=1&data=eyJwbGF5bGlzdCI6W3sic2VyaWVzTmFtZSI6ImJhZCBib3kiLCJzZWFzb25zIjpbeyJzZWFzb25OdW1iZXIiOjEsImVwaXNvZGVzIjpbeyJlcGlzb2RlTnVtYmVyIjoxLCJlcGlzb2RlTmFtZSI6ImJiMSIsInVybCI6Imh0dHBzOi8vbWVkaWEuYm95c29udHViZS5jb20vdmlkZW9zLzYvOC9lL2UvNC82OGVlNDM4YTM3YTNjLm1wNCIsImR1cmF0aW9uIjoiMDA6MDA6MDAiLCJxdWFsaXR5IjoiQXV0byIsInByb2dyZXNzIjowfSx7ImVwaXNvZGVOdW1iZXIiOjIsImVwaXNvZGVOYW1lIjoiYmIyIiwidXJsIjoiaHR0cHM6Ly9tZWRpYS5taWxreXZpZGVvLmNvbS92aWRlb3MvNS83LzcvMC8wLzU3NzAwYzkyMzg4MGQubXA0IiwiZHVyYXRpb24iOiIwMDowMDowMCIsInF1YWxpdHkiOiJBdXRvIiwicHJvZ3Jlc3MiOjB9LHsiZXBpc29kZU51bWJlciI6MywiZXBpc29kZU5hbWUiOiJiYjMiLCJ1cmwiOiJodHRwczovL21lZGlhLm1pbGt5dmlkZW8uY29tL3ZpZGVvcy81LzcvNy8wLzAvNTc3MDBjOTIzODgwZC5tcDQiLCJkdXJhdGlvbiI6IjAwOjAwOjAwIiwicXVhbGl0eSI6IkF1dG8iLCJwcm9ncmVzcyI6MH1dfV19XSwic2F2ZSI6ZmFsc2V9" width="800" height="450" frameborder="0" allowfullscreen></iframe>

<!-- If you prefer to postMessage the playlist, use the player iframe and then send { type: "hplayer.load", payload: {...} } -->`,
    },
    {
        id: 2,
        tmdbId: 1153399, //coolie
        type: "movie",
        downloads: ["https://linkmake.in/view/ubcUFJ3vqC"],
        embedCode: `<iframe src="https://hikke383ehr.com/play/tt27441481" width="1200" height="495" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`,
    },
    {
        id: 2,
        tmdbId: 75758, //Lost in Space
        type: "tv",
        downloads: [
            { url: "https://embedpk.net/13a4c2ecrlr3.html", label: "Season 1" },
            { url: "https://embedpk.net/jpt6u4s3aanw.html", label: "Season 2" },
            { url: "https://linkmake.in/view/EdiiOb2dXY", label: "Season 3" }
        ],
        embedCode: `<iframe src="https://fuhho374key.com/play/tt5232792" width="610" height="370" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`,
    },
    {
        id: 2,
        tmdbId: 1510251, //Murderbaad
        type: "movie",
        downloads: ["https://linkmake.in/view/ejVFdx7Z7t"],
        embedCode: `<iframe src="https://fuhho374key.com/play/tt37392885" width="610" height="370" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`,
    },
    {
        id: 2,
        tmdbId: 575265, // mission imposible 2025
        type: "movie",
        downloads: ["https://linkmake.in/view/C7svoEz27W"],
        embedCode: `<iframe src="https://fuhho374key.com/play/tt9603208" width="610" height="370" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`,
    },
    {
        id: 2,
        tmdbId: 911430, // F1
        type: "movie",
        download: "https://linkmake.in/view/AUi6XHpnNF",
        embedCode: `<iframe src="https://fuhho374key.com/play/tt16311594" width="610" height="370" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`,
    },
    {
        id: 2,
        tmdbId: 1241894, // Woodwalker 2024
        type: "movie",
        download: "https://hubdrive.space/file/1964106209",
        embedCode: `<iframe src="https://fuhho374key.com/play/tt30398905" width="610" height="370" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`,
    },
    {
        id: 2,
        tmdbId: 110492, // Peacemaker
        type: "tv",
        downloads: [
            { url: "https://linkmake.in/view/1S43gUS4Vm", label: "Season 1" },
            { url: "https://linkmake.in/view/2yu2Pm9HDD", label: "Season 2" }
        ],
        embedCode: `<iframe src="https://fuhho374key.com/play/tt13146488" width="610" height="370" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`,
    },
    {
        id: 2,
        tmdbId: 1254624, // Night Always Comes
        type: "movie",
        download: "https://hubdrive.space/file/1897326323",
        embedCode: `<iframe src="https://fuhho374key.com/play/tt31567422" width="610" height="370" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`,
    },
    {
        id: 2,
        tmdbId: 227114, // Butterfly
        type: "tv",
        download: "https://linkmake.in/view/NnsizQZhog",
        embedCode: `<iframe src="https://fuhho374key.com/play/tt26672404" width="610" height="370" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`,
    },
    {
        id: 2,
        tmdbId: 1071585, // Megan 2.0
        type: "movie",
        download: "https://linkmake.in/view/t2TrFRIhzH",
        embedCode: `<iframe src="https://fuhho374key.com/play/tt26342662" width="610" height="370" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`,
    },
    {
        id: 10,
        tmdbId: 1234821, //Jurassic world rebirth
        type: "movie",
        download: "https://linkmake.in/view/Gx50BNb2nD",
        embedCode: `<iframe src="https://fuhho374key.com/play/tt31036941" width="610" height="370" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`,
    },
    {
        id: 11,
        tmdbId: 119051, //Wednesday
        type: "tv",
        // NEW: You can now use objects with custom labels!
        downloads: [
            { url: "https://linkmake.in/view/CHFIed4Mo1", label: "Season 1" },
            { url: "https://linkmake.in/view/YvYhQBrUpp", label: "Season 2" },
        ],
        // OLD way still works: downloads: ["url1", "url2"] (shows "Link 1", "Link 2")
        embedCode: `<iframe src="https://fuhho374key.com/play/tt13443470" width="610" height="370" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`,
    },

    {
        id: 12,
        tmdbId: 1106289, //Pickup 2025
        type: "movie",
        download: "https://hubdrive.space/file/2309932002",
        embedCode: `<iframe src="https://fuhho374key.com/play/tt30445556" width="610" height="370" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`,
    },
    {
        id: 12,
        tmdbId: 464293, // legend of Maula jutt
        type: "movie",
        download: "https://linkmake.in/view/Ak9SZxt4Vz",
        embedCode: `<iframe src="#" width="610" height="370" frameborder="0" allowfullscreen="allowfullscreen"></iframe>`,
    },

];


// Cache for movie data to avoid repeated API calls
const movieCache = new Map();

// TMDB API Functions - Hybrid approach (backend or CORS proxy)
async function fetchTMDBData(tmdbId, type) {
    const cacheKey = `${type}_${tmdbId}`;
    if (movieCache.has(cacheKey)) {
        console.log('Using cached data for:', cacheKey);
        return movieCache.get(cacheKey);
    }

    try {
        const endpoint = type === "movie" ? "movie" : "tv";
        console.log(`Fetching TMDB data for ${endpoint} ID:`, tmdbId);

        // Fetch both movie details and videos in parallel
        const urls = [
            `${TMDB_BASE_URL}/${endpoint}/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`,
            `${TMDB_BASE_URL}/${endpoint}/${tmdbId}/credits?api_key=${TMDB_API_KEY}&language=en-US`,
            `${TMDB_BASE_URL}/${endpoint}/${tmdbId}/videos?api_key=${TMDB_API_KEY}&language=en-US`
        ];

        console.log('API URLs:', urls);

        // Add error handling for each fetch
        const fetchWithTimeout = (url, options = {}) => {
            return Promise.race([
                fetch(url, options),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timeout')), 10000)
                )
            ]);
        };

        const [detailsResponse, creditsResponse, videosResponse] = await Promise.allSettled([
            fetchWithTimeout(urls[0]),
            fetchWithTimeout(urls[1]),
            fetchWithTimeout(urls[2])
        ]);

        // Process responses
        const processResponse = (response) => {
            if (response.status === 'fulfilled' && response.value.ok) {
                return response.value.json();
            }
            console.warn('Failed to fetch data:', response.reason || response.value?.statusText);
            return null;
        };

        const [details, credits, videos] = await Promise.all([
            processResponse(detailsResponse),
            processResponse(creditsResponse),
            processResponse(videosResponse)
        ]);

        if (!details) {
            throw new Error('Failed to fetch required movie details');
        }

        // Format the data to match our expected structure with enhanced data
        const formattedData = {
            id: details.id,
            title: details.title || details.name || 'Unknown Title',
            overview: details.overview || 'No description available',
            description: details.overview || 'No description available',
            release_date: details.release_date || details.first_air_date || '',
            release_year: (details.release_date || details.first_air_date)?.substring(0, 4) || 'Unknown',
            vote_average: details.vote_average || 0,
            rating: details.vote_average ? details.vote_average.toFixed(1) : 'N/A',
            runtime: details.runtime || null,
            number_of_seasons: details.number_of_seasons || null,
            genres: details.genres || [],
            production_countries: details.production_countries || [],
            spoken_languages: details.spoken_languages || [],
            original_language: details.original_language || '',
            poster_path: details.poster_path
                ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
                : null,
            backdrop_path: details.backdrop_path
                ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}`
                : null,
            status: details.status || 'Unknown',
            tagline: details.tagline || '',
            homepage: details.homepage || '',
            budget: details.budget || 0,
            revenue: details.revenue || 0,
            production_companies: details.production_companies || [],
            directors: [],
            writers: [],
            creators: details.created_by?.map((c) => c.name) || [],
            cast: [],
            trailer: null,
        };

        // Extract crew information from credits if available
        if (credits?.crew) {
            formattedData.directors = credits.crew
                .filter((p) => p.job === 'Director')
                .map((p) => p.name)
                .filter(Boolean);

            formattedData.writers = credits.crew
                .filter((p) => ['Writer', 'Screenplay', 'Story'].includes(p.job))
                .map((p) => p.name)
                .filter(Boolean);
        }

        // Extract cast information (top 12 for better display)
        if (credits?.cast) {
            console.log('Processing cast data:', credits.cast.length, 'members found');
            formattedData.cast = credits.cast
                .slice(0, 12)
                .map((actor) => {
                    const profileUrl = actor.profile_path
                        ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                        : null;
                    console.log('Cast member:', actor.name, 'Profile path:', actor.profile_path, 'Full URL:', profileUrl);
                    return {
                        name: actor.name || 'Unknown',
                        character: actor.character || 'N/A',
                        profile_path: profileUrl,
                    };
                });
        }

        // Find trailer (prioritize official trailers)
        if (videos?.results) {
            console.log('Video results found:', videos.results.length, 'for', details.title || details.name);

            // Only include YouTube trailers and teasers
            const trailers = videos.results.filter(v => {
                return v.site === 'YouTube' && v.key && ['Trailer', 'Teaser'].includes(v.type);
            });

            console.log('Filtered trailers:', trailers.length);

            if (trailers.length > 0) {
                // First try to find an official trailer
                let trailer = trailers.find(v =>
                    v.name.toLowerCase().includes('official trailer')
                ) || trailers.find(v =>
                    v.name.toLowerCase().includes('trailer') ||
                    v.name.toLowerCase().includes('official teaser')
                ) || trailers[0]; // Fallback to first trailer

                if (trailer) {
                    console.log('Selected trailer:', trailer.name, trailer.key);
                    formattedData.trailer = `https://www.youtube.com/embed/${trailer.key}?rel=0&modestbranding=1`;
                }
            }
        }

        console.log('Formatted TMDB data:', formattedData);

        // Cache the result
        movieCache.set(cacheKey, formattedData);
        return formattedData;
    } catch (error) {
        console.error('Error in fetchTMDBData:', error);
        return null;
    }
}

async function fetchTrendingContent() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}&language=en-US`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Error fetching trending data:", error);
        return [];
    }
}

function formatMoney(amount) {
    if (amount >= 1000000000) {
        return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(1)}K`;
    } else {
        return amount > 0 ? `$${amount}` : "Not disclosed";
    }
}

function formatRuntime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

// Live TV Data
const liveTvChannels = [

    {
        id: "tv1",
        name: "Ten Sports",
        channel: "Sports",
        thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6unjd_eUOQbyUwmeg8a_C5yV-zdGaVeO1og&s",
        embedCode: `<iframe src="https://bradm.ax/build/202410/09/10dddbda311d7cd7ad4cb3ee7ffaaa441bf5a620/index.html?mediaUrl=https%3A%2F%2Flive.streamly.com.co%3A8081%2Fpk-tensports%2Findex.m3u8" width="800px" height="400px" frameBorder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`,
    },
    {
        id: "tv2",
        name: "A Sports",
        channel: "Sports",
        thumbnail: "https://a-sports.tv/assets/img/logo/A-Sports-Logo-final.webp",
        embedCode: `<iframe src="https://bradm.ax/build/202410/09/10dddbda311d7cd7ad4cb3ee7ffaaa441bf5a620/index.html?mediaUrl=https%3A%2F%2Flive.streamly.com.co%3A8081%2Fpk-Asports%2Findex.m3u8" width="800px" height="400px" frameBorder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`,
    },
    {
        id: "tv3",
        name: "ARY NEWS",
        channel: "News",
        thumbnail: "https://canvas.tamashaweb.com/jazzlive/uploads/channels/1707716722.webp?id=20240917093633",
        embedCode: `<iframe src="https://bradm.ax/build/202410/09/10dddbda311d7cd7ad4cb3ee7ffaaa441bf5a620/index.html?mediaUrl=https%3A%2F%2Fcdn24lhr.tamashaweb.com%3A8087%2Fjazzauth%2FARYnews-abr%2Fplaylist.m3u8%3FwmsAuthSign%3Dc2VydmVyX3RpbWU9OS85LzIwMjUgMTE6NTY6MTAgQU0maGFzaF92YWx1ZT1oVGRRSkRyTWZXNWppZTdGREtpT0xRPT0mdmFsaWRtaW51dGVzPTYw%3A8087%2Fjazzauth%2FARYnews-abr%2Fplaylist.m3u8&title=ARY%20NEWS" width="800px" height="400px" frameBorder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`,
    },
    {
        id: "tv4",
        name: "PTV Sports",
        channel: "Sports",
        thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRv1cjHErL1De6N1Is8Q-jS-9nlsyR0IizcBg&s",
        embedCode: `<iframe src="https://bradm.ax/build/202410/09/10dddbda311d7cd7ad4cb3ee7ffaaa441bf5a620/index.html?mediaUrl=https%3A%2F%2Flive.streamly.com.co%3A8081%2Fpk-ptvsports%2Findex.m3u8" width="800px" height="400px" frameBorder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`,
    },
    {
        id: "tv5",
        name: "ARY Digital",
        channel: "Entertainment",
        thumbnail: "https://play-lh.googleusercontent.com/n9P9QTU4pPUtKAsD8Eun6mlxxwpFt4WRLhF29XziXjRrS_vcYv7xMhaVoMvdUDvluac",
        embedCode: `<iframe src="https://bradm.ax/build/202410/09/10dddbda311d7cd7ad4cb3ee7ffaaa441bf5a620/index.html?mediaUrl=https%3A%2F%2Flive.streamly.com.co%3A8081%2Fpk-arydigital%2Findex.m3u8" width="800px" height="400px" frameBorder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`,
    },
    {
        id: "tv6",
        name: "Green TV",
        channel: "Entertainment",
        thumbnail: "https://greenentertainment.tv/_next/static/media/GreenLogo.7e0f62ea.svg",
        embedCode: `<iframe src="https://bradm.ax/build/202410/09/10dddbda311d7cd7ad4cb3ee7ffaaa441bf5a620/index.html?mediaUrl=https%3A%2F%2Flive.streamly.com.co%3A8081%2Fpk-greenent%2Findex.m3u8" width="800px" height="400px" frameBorder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`,
    },
];

// Global variables for loaded movies
let loadedMovies = [];
let currentCategory = "all";
let searchQuery = "";
let filteredVideos = [];
let currentView = "grid";

// Load more functionality variables
let displayedMovies = 12; // Show 12 movies initially
const moviesPerLoad = 12; // Load 12 more movies when "Load More" is clicked

// Page memory functionality
const PAGE_MEMORY_KEY = 'htv-page-state';
let pageMemory = {
    displayedMovies: 12,
    scrollPosition: 0,
    currentCategory: 'all',
    searchQuery: ''
};

// DOM Elements
const videosGrid = document.getElementById("videosGrid");
const categoryFilters = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const videoModal = document.getElementById("videoModal");
const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const modalPlayer = document.getElementById("modalPlayer");
const modalTitle = document.getElementById("modalTitle");
const modalDuration = document.getElementById("modalDuration");
const modalViews = document.getElementById("modalViews");
const modalCategory = document.getElementById("modalCategory");
const modalDescription = document.getElementById("modalDescription");
const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");
const loginOverlay = document.getElementById("loginOverlay");
const loginModalClose = document.getElementById("loginModalClose");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");
const gridViewBtn = document.getElementById("gridViewBtn");
const listViewBtn = document.getElementById("listViewBtn");
const viewBtns = document.querySelectorAll(".view-btn");

// Scroll to top button
const scrollToTopBtn = document.getElementById("scrollToTop");

// Load Featured Movie
async function loadFeaturedMovie() {
    console.log('Loading featured movie with TMDB ID:', FEATURED_MOVIE_CONFIG.tmdbId);

    try {
        // Fetch TMDB data for featured movie
        const movieData = await fetchTMDBData(FEATURED_MOVIE_CONFIG.tmdbId, FEATURED_MOVIE_CONFIG.type);

        if (movieData) {
            // Update featured section with dynamic data
            const featuredTitle = document.querySelector('.featured-title');
            const featuredDescription = document.querySelector('.featured-description');
            const featuredDuration = document.querySelector('.duration');
            const featuredViews = document.querySelector('.views');
            const featuredCategory = document.querySelector('.category');
            const featuredPlayer = document.getElementById('featuredPlayer');
            const watchNowBtn = document.querySelectorAll('.featured-section .login-btn')[0];

            // Update content
            if (featuredTitle) {
                featuredTitle.textContent = `${movieData.title} (${movieData.release_year})`;
            }

            if (featuredDescription) {
                featuredDescription.textContent = movieData.overview || movieData.description;
            }

            if (featuredDuration && movieData.runtime) {
                const hours = Math.floor(movieData.runtime / 60);
                const minutes = movieData.runtime % 60;
                featuredDuration.textContent = `${hours}h ${minutes}m`;
            } else if (featuredDuration && movieData.number_of_seasons) {
                featuredDuration.textContent = `${movieData.number_of_seasons} Season${movieData.number_of_seasons > 1 ? 's' : ''}`;
            }

            if (featuredViews) {
                featuredViews.textContent = `⭐ ${movieData.rating} TMDB`;
            }

            if (featuredCategory && movieData.genres && movieData.genres.length > 0) {
                featuredCategory.textContent = movieData.genres[0].name;
            }

            // Update trailer if available
            if (featuredPlayer && movieData.trailer) {
                // Extract video ID from trailer URL
                let videoId = null;
                if (movieData.trailer.includes('youtube.com/embed/')) {
                    videoId = movieData.trailer.split('/embed/')[1]?.split('?')[0];
                } else if (movieData.trailer.includes('youtube.com/watch')) {
                    videoId = new URL(movieData.trailer).searchParams.get('v');
                } else if (movieData.trailer.includes('youtu.be/')) {
                    videoId = movieData.trailer.split('youtu.be/')[1]?.split('?')[0];
                }

                if (videoId) {
                    featuredPlayer.src = `https://www.youtube.com/embed/${videoId}?si=qm5j12OBg51YoIMN&autoplay=1&mute=1&loop=1&playlist=${videoId}`;
                }
            }

            // Make Watch Now button clickable
            if (watchNowBtn) {
                watchNowBtn.onclick = () => {
                    // Create featured movie object for modal
                    const featuredMovieForModal = {
                        id: `featured_${FEATURED_MOVIE_CONFIG.tmdbId}`,
                        tmdbId: FEATURED_MOVIE_CONFIG.tmdbId,
                        type: FEATURED_MOVIE_CONFIG.type,
                        title: movieData.title,
                        description: movieData.overview || movieData.description,
                        views: `⭐ ${movieData.rating}`,
                        duration: movieData.runtime ? `${Math.floor(movieData.runtime / 60)}h ${movieData.runtime % 60}m` : 'N/A',
                        category: movieData.genres?.[0]?.name?.toLowerCase() || 'unknown',
                        tmdbData: movieData,
                        embedCode: movieData.trailer
                            ? `<iframe src="${movieData.trailer}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`
                            : '<div style="text-align: center; padding: 50px; color: var(--text-secondary);">Trailer not available for this content</div>',
                    };

                    openVideoModal(featuredMovieForModal);
                };
            }

            console.log('Featured movie loaded successfully:', movieData.title);
        } else {
            console.error('Failed to load featured movie data');
        }
    } catch (error) {
        console.error('Error loading featured movie:', error);
    }
}

// Page memory functions
function savePageState() {
    pageMemory.displayedMovies = displayedMovies;
    pageMemory.scrollPosition = window.scrollY;
    pageMemory.currentCategory = currentCategory;
    pageMemory.searchQuery = searchQuery;

    try {
        localStorage.setItem(PAGE_MEMORY_KEY, JSON.stringify(pageMemory));
        console.log('Page state saved:', pageMemory);
    } catch (error) {
        console.warn('Could not save page state:', error);
    }
}

function loadPageState() {
    try {
        const saved = localStorage.getItem(PAGE_MEMORY_KEY);
        if (saved) {
            pageMemory = JSON.parse(saved);
            displayedMovies = pageMemory.displayedMovies || 12;
            currentCategory = pageMemory.currentCategory || 'all';
            searchQuery = pageMemory.searchQuery || '';

            console.log('Page state loaded:', pageMemory);
            return true;
        }
    } catch (error) {
        console.warn('Could not load page state:', error);
    }
    return false;
}

function clearPageState() {
    try {
        localStorage.removeItem(PAGE_MEMORY_KEY);
        console.log('Page state cleared');
    } catch (error) {
        console.warn('Could not clear page state:', error);
    }
}

function restorePageState() {
    console.log('Restoring page state...');

    // Restore search input
    if (searchInput && pageMemory.searchQuery) {
        searchInput.value = pageMemory.searchQuery;
        console.log('Restored search query:', pageMemory.searchQuery);
    }

    // Restore active category filter
    if (pageMemory.currentCategory !== 'all') {
        const categoryBtn = document.querySelector(`[data-category="${pageMemory.currentCategory}"]`);
        if (categoryBtn) {
            categoryFilters.forEach(btn => btn.classList.remove('active'));
            categoryBtn.classList.add('active');
            console.log('Restored category filter:', pageMemory.currentCategory);
        }
    }

    // Apply filters and render with restored movie count
    filterVideos(true); // Pass true to indicate we're restoring state

    // Restore scroll position after a delay to ensure content is loaded
    setTimeout(() => {
        if (pageMemory.scrollPosition > 0) {
            window.scrollTo({
                top: pageMemory.scrollPosition,
                behavior: 'smooth'
            });
            console.log('Restored scroll position:', pageMemory.scrollPosition);
        }
    }, 500);
}

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
    console.log('DOM Content Loaded - Starting H-TV initialization...');

    // CLEAR OLD PAGE STATE - Start fresh
    clearPageState();
    displayedMovies = 12; // Reset to 12

    // Initialize app immediately (no delay, no loading message)
    (async () => {
        try {
            await loadFeaturedMovie();      // Load featured movie first
            await loadMoviesWithTMDBData(); // Then load other movies (now optimized!)
            setupEventListeners();
            loadLiveTvSlider();
            loadTrendingSlider();
            setupCommentSection();          // Initialize comment section

            console.log('H-TV initialization complete!');
            console.log('Total movies loaded:', loadedMovies.length);
            console.log('Displaying:', displayedMovies, 'movies initially');
        } catch (error) {
            console.error('Error during initialization:', error);
            if (videosGrid) {
                videosGrid.innerHTML = '<div style="text-align: center; padding: 60px; color: red;"><h3>Loading Error</h3><p>Please refresh the page to try again.</p></div>';
            }
        }
    })();
});

// Load movies with TMDB data - OPTIMIZED for instant loading
async function loadMoviesWithTMDBData() {
    console.log('🚀 Starting OPTIMIZED parallel movie loading...');
    console.log('Total movies in videoData:', videoData.length);

    // Step 1: Create placeholder movies immediately and render them
    loadedMovies = videoData.map((video, i) => ({
        ...video,
        uniqueId: `movie_${i}_${video.id}_${video.tmdbId}`,
        title: `Loading...`,
        duration: "...",
        views: "...",
        category: "loading",
        thumbnail: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjIyIi8+PGNpcmNsZSBjeD0iMTYwIiBjeT0iOTAiIHI9IjMwIiBmaWxsPSJub25lIiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWRhc2hhcnJheT0iMTAgNSI+PGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJyb3RhdGUiIGZyb209IjAgMTYwIDkwIiB0bz0iMzYwIDE2MCA5MCIgZHVyPSIxcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48L2NpcmNsZT48dGV4dCB4PSI1MCUiIHk9IjYwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=",
        description: "Loading movie details...",
        isPlaceholder: true
    }));

    // Render placeholder cards immediately for instant display
    filteredVideos = [...loadedMovies];
    renderVideos();
    console.log('✅ Rendered placeholder cards immediately');

    // Step 2: Fetch all TMDB data in parallel
    console.log('📡 Fetching TMDB data in parallel...');
    const fetchPromises = videoData.map((video, i) =>
        fetchTMDBData(video.tmdbId, video.type)
            .then(tmdbData => ({ index: i, video, tmdbData, success: true }))
            .catch(error => {
                console.error(`❌ Error loading movie ${video.id}:`, error);
                return { index: i, video, tmdbData: null, success: false, error };
            })
    );

    // Wait for all fetches to complete (in parallel)
    const results = await Promise.all(fetchPromises);
    console.log(`📦 Received ${results.length} results from TMDB`);

    // Step 3: Update loadedMovies with real data
    results.forEach(({ index, video, tmdbData, success }) => {
        if (success && tmdbData) {
            loadedMovies[index] = {
                ...video,
                uniqueId: `movie_${index}_${video.id}_${video.tmdbId}`,
                title: tmdbData.title,
                duration: tmdbData.runtime ? `${Math.floor(tmdbData.runtime / 60)}h ${tmdbData.runtime % 60}m` :
                    tmdbData.number_of_seasons ? `${tmdbData.number_of_seasons} seasons` : "Unknown",
                views: `${tmdbData.rating}⭐`,
                category: (tmdbData.genres && tmdbData.genres.length > 0) ? tmdbData.genres[0].name.toLowerCase() : "drama",
                thumbnail: tmdbData.poster_path,
                description: tmdbData.overview || tmdbData.description,
                tmdbData: tmdbData,
                isPlaceholder: false
            };
            console.log(`✅ [${index + 1}/${videoData.length}] Updated: ${tmdbData.title}`);
        } else {
            // Fallback for failed fetches
            loadedMovies[index] = {
                ...video,
                uniqueId: `movie_${index}_${video.id}_fallback`,
                title: `Movie ${video.id}`,
                duration: "Unknown",
                views: "N/A",
                category: "unknown",
                thumbnail: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==",
                description: "Failed to load movie details",
                isPlaceholder: false
            };
            console.warn(`⚠️ [${index + 1}/${videoData.length}] Fallback for movie ${video.id}`);
        }
    });

    console.log(`🎬 TOTAL LOADED: ${loadedMovies.length} movies (expected: ${videoData.length})`);

    // Step 4: Re-render with real data
    filteredVideos = [...loadedMovies];
    renderVideos();
    console.log('✅ Updated all cards with TMDB data');
}

// Setup Event Listeners
function setupEventListeners() {
    // Category filters
    categoryFilters.forEach((btn) => {
        btn.addEventListener("click", handleCategoryFilter);
    });

    // Search functionality
    searchBtn.addEventListener("click", handleSearch);
    searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevent page scroll on Enter
            handleSearch();
        }
        // Prevent page scrolling on any key press in search
        e.stopPropagation();
    });
    searchInput.addEventListener("input", function (e) {
        e.stopPropagation(); // Prevent bubbling that might cause scrolling
        handleSearch();
    });

    // Prevent search input from causing page scroll
    searchInput.addEventListener("focus", function (e) {
        e.stopPropagation();
    });
    searchInput.addEventListener("blur", function (e) {
        e.stopPropagation();
    });

    // Modal functionality
    modalOverlay.addEventListener("click", closeVideoModal);
    modalClose.addEventListener("click", closeVideoModal);

    // Login modal
    loginBtn.addEventListener("click", openLoginModal);
    loginOverlay.addEventListener("click", closeLoginModal);
    loginModalClose.addEventListener("click", closeLoginModal);

    // Mobile menu
    mobileMenuBtn.addEventListener("click", toggleMobileMenu);

    // Navigation links
    navLinks.forEach((link) => {
        link.addEventListener("click", handleNavigation);
    });

    // View toggle buttons
    viewBtns.forEach((btn) => {
        btn.addEventListener("click", handleViewToggle);
    });

    // Close modal on escape key
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            closeVideoModal();
            closeLoginModal();
        }
    });

    // Login form submission
    const loginForm = document.querySelector(".login-form form");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    // Slider navigation for Trending and Live TV
    setupSliders();

    // Scroll to top button functionality
    setupScrollToTop();

    // Page state saving on scroll (throttled)
    let scrollTimer;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            savePageState();
        }, 500); // Save state 500ms after user stops scrolling
    });

    // Save state when user navigates away
    window.addEventListener('beforeunload', () => {
        savePageState();
    });
}

// Render Videos
function renderVideos() {
    console.log('Rendering videos...', filteredVideos.length, 'videos to render');

    if (!videosGrid) {
        console.error('videosGrid element not found!');
        return;
    }

    videosGrid.innerHTML = "";

    if (filteredVideos.length === 0) {
        console.log('No videos to display');
        videosGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                <h3>No videos found</h3>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        `;
        return;
    }

    // Show only the number of movies specified by displayedMovies
    console.log('Displaying movies:', { total: filteredVideos.length, showing: displayedMovies });
    const moviesToShow = filteredVideos.slice(0, displayedMovies);

    moviesToShow.forEach((video, index) => {
        try {
            console.log(`Rendering video ${index + 1}: ${video.title}`);
            const videoCard = createVideoCard(video);
            videosGrid.appendChild(videoCard);
        } catch (error) {
            console.error(`Error rendering video ${index + 1}:`, error, video);
        }
    });

    // NEW LOAD MORE BUTTON - Built from scratch
    createLoadMoreButton();

    console.log(`Finished rendering videos - Showing ${moviesToShow.length} of ${filteredVideos.length} movies`);
}

// NEW: Create Load More Button Function
function createLoadMoreButton() {
    // Check if we need a load more button
    if (displayedMovies >= filteredVideos.length) {
        console.log('All movies displayed - no load more button needed');
        return;
    }

    const remaining = filteredVideos.length - displayedMovies;
    console.log(`Creating load more button: ${remaining} movies remaining`);

    // Create wrapper div
    const wrapper = document.createElement('div');
    wrapper.id = 'loadMoreWrapper';
    wrapper.style.cssText = `
        grid-column: 1 / -1;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 50px 20px;
        margin-top: 30px;
    `;

    // Create button with RED GRADIENT THEME - Mobile optimized
    const button = document.createElement('button');
    button.id = 'loadMoreButton';
    button.style.cssText = `
        background: linear-gradient(135deg, #ff0844 0%, #ffb199 100%);
        color: white;
        border: none;
        padding: 16px 30px;
        font-size: 16px;
        font-weight: bold;
        border-radius: 50px;
        cursor: pointer;
        box-shadow: 0 10px 30px rgba(255, 8, 68, 0.5);
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        position: relative;
        overflow: hidden;
        min-width: 200px;
    `;

    button.innerHTML = `
        <span style="white-space: nowrap;">🔥 Load More Movies</span>
        <span style="background: rgba(255,255,255,0.25); padding: 3px 10px; border-radius: 15px; font-size: 12px; font-weight: 600; white-space: nowrap;">
            ${remaining} remaining
        </span>
    `;

    // Add hover effect with RED GLOW
    button.onmouseover = () => {
        button.style.transform = 'translateY(-5px) scale(1.02)';
        button.style.boxShadow = '0 15px 50px rgba(255, 8, 68, 0.8), 0 0 30px rgba(255, 0, 0, 0.4)';
        button.style.background = 'linear-gradient(135deg, #ff073a 0%, #ff5e62 100%)';
    };

    button.onmouseout = () => {
        button.style.transform = 'translateY(0) scale(1)';
        button.style.boxShadow = '0 10px 30px rgba(255, 8, 68, 0.5)';
        button.style.background = 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)';
    };

    // Add click handler
    button.onclick = () => {
        console.log('Load More clicked!');

        // Show loading state
        button.innerHTML = '⏳ Loading...';
        button.style.pointerEvents = 'none';
        button.style.opacity = '0.7';

        // Load more movies after short delay
        setTimeout(() => {
            displayedMovies += moviesPerLoad;
            savePageState();
            renderVideos();

            // Scroll to new content
            setTimeout(() => {
                window.scrollBy({
                    top: 300,
                    behavior: 'smooth'
                });
            }, 100);
        }, 300);
    };

    wrapper.appendChild(button);
    videosGrid.appendChild(wrapper);

    console.log('✅ Load More button created and added to grid!');
}

// Create Video Card
function createVideoCard(video) {
    const card = document.createElement("div");
    card.className = "video-card";

    // Normalize category name for CSS class (remove special characters and spaces)
    const categoryClass = video.category ? video.category.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : 'unknown';

    // Debug: Log category information
    console.log(`Creating card for: ${video.title}, Category: ${video.category}, CSS Class: ${categoryClass}`);

    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${video.thumbnail}" alt="${video.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
            <div class="video-duration">${video.duration}</div>
            <span class="video-category ${categoryClass}">${video.category}</span>
        </div>
        <div class="video-info">
            <h3 class="video-title">${video.title}</h3>
            <div class="video-meta">
                <span class="video-views">${video.views}</span>
            </div>
        </div>
    `;

    card.addEventListener("click", () => openVideoModal(video));
    return card;
}

// Handle Category Filter
function handleCategoryFilter(e) {
    const selectedCategory = e.target.dataset.category;

    // Update active filter button
    categoryFilters.forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");

    currentCategory = selectedCategory;
    filterVideos();
}

// Handle Search
function handleSearch() {
    searchQuery = searchInput.value.toLowerCase().trim();
    filterVideos();
}

// Filter Videos
function filterVideos(isRestoringState = false) {
    console.log('Filtering videos...', { currentCategory, searchQuery });

    filteredVideos = loadedMovies.filter((video) => {
        const matchesCategory =
            currentCategory === "all" || video.category === currentCategory;
        const matchesSearch =
            searchQuery === "" ||
            video.title.toLowerCase().includes(searchQuery) ||
            video.description.toLowerCase().includes(searchQuery) ||
            video.category.toLowerCase().includes(searchQuery);

        return matchesCategory && matchesSearch;
    });

    console.log('Filtered results:', { total: filteredVideos.length });

    // Only reset displayed movies count when not restoring state
    if (!isRestoringState) {
        displayedMovies = 12;
        savePageState(); // Save state when user actively filters
    }

    renderVideos();
}

// Open Video Modal
async function openVideoModal(video) {
    if (!video) {
        console.error('No video data provided');
        return;
    }

    console.log('Opening video modal for:', video);

    // Get all modal elements
    const modalElements = {
        video: document.querySelector(".modal-video"),
        title: document.getElementById("modalTitle"),
        duration: document.getElementById("modalDuration"),
        views: document.getElementById("modalViews"),
        category: document.getElementById("modalCategory"),
        description: document.getElementById("modalDescription"),
        year: document.getElementById("modalYear"),
        status: document.getElementById("modalStatus"),
        rating: document.getElementById("modalRating")
    };

    try {
        // Normalize download data - convert single download to downloads array
        if (video.download && !video.downloads) {
            video.downloads = [video.download];
        } else if (!video.downloads) {
            video.downloads = [];
        }

        // Set up iframe sizing handler
        const setupIframeStyles = () => {
            const iframes = modalElements.video.getElementsByTagName('iframe');
            for (let iframe of iframes) {
                iframe.style.position = 'absolute';
                iframe.style.top = '0';
                iframe.style.left = '0';
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
            }
        };

        // Add the video with proper responsive container
        modalElements.video.innerHTML = `
            <div class="modal-content-wrapper">
                <div class="video-container" style="position: relative; width: 100%; padding-bottom: 56.25%; margin-bottom: 15px; background: #000;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                        ${video.embedCode}
                    </div>
                </div>
                ${video.downloads && video.downloads.length > 0 ? `
                    <div class="download-options">
                        <div class="download-options-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Download Links
                        </div>
                        <div class="download-links-container">
                            ${video.downloads.map((item, index) => {
            // Support both string URLs and objects with {url, label}
            const downloadUrl = typeof item === 'string' ? item : item.url;
            const downloadLabel = typeof item === 'string'
                ? (video.downloads.length > 1 ? `Link ${index + 1}` : 'Download')
                : (item.label || `Link ${index + 1}`);

            return `
                                    <a href="${downloadUrl}" target="_blank" rel="noopener noreferrer" class="download-link">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                        ${downloadLabel}
                                    </a>
                                `;
        }).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        // Set up iframe styles after a small delay
        setTimeout(setupIframeStyles, 100);

        // Try to get TMDB data if not already available
        let movieData = video.tmdbData;

        if ((!movieData || Object.keys(movieData).length === 0) && video.tmdbId) {
            console.log('Fetching TMDB data for ID:', video.tmdbId, 'Type:', video.type);
            movieData = await fetchTMDBData(video.tmdbId, video.type || 'movie');
            video.tmdbData = movieData;
        }

        if (movieData) {
            // Update video properties
            video.title = movieData.title || video.title;
            video.duration = movieData.runtime || video.duration;
            video.views = `⭐ ${movieData.rating || 'N/A'}`;
            video.category = (movieData.genres && movieData.genres.length > 0 && movieData.genres[0].name)
                ? movieData.genres[0].name.toLowerCase()
                : video.category || 'drama';
            video.description = movieData.overview || movieData.description || video.description;

            // Update meta information
            if (modalElements.year) modalElements.year.textContent = movieData.release_year || "Unknown";
            if (modalElements.status) modalElements.status.textContent = movieData.status || "";
            if (modalElements.rating) modalElements.rating.textContent = movieData.rating ? `⭐ ${movieData.rating}` : "";

            // Display TMDB details
            displayTMDBDetails(movieData, video.type || 'movie', video);
        }

        // Clear the basic modal info since we'll show detailed TMDB info instead
        modalElements.title.textContent = "";
        modalElements.duration.textContent = "";
        modalElements.views.textContent = "";
        modalElements.category.textContent = "";
        modalElements.description.textContent = "";

        // Add video container iframe styles if not already added
        if (!document.getElementById('video-container-styles')) {
            const style = document.createElement('style');
            style.id = 'video-container-styles';
            style.textContent = `
                .video-container iframe {
                    border: none;
                    border-radius: 8px;
                }
            `;
            document.head.appendChild(style);
        }

        // Show modal
        const videoModal = document.getElementById('videoModal');
        if (videoModal) {
            videoModal.classList.add("active");
            document.body.style.overflow = "hidden";
        }

    } catch (error) {
        console.error('Error in openVideoModal:', error);
        if (modalElements?.video) {
            modalElements.video.innerHTML = `
                <div style="text-align: center; padding: 50px; color: var(--error-color);">
                    <p>Failed to load content. Please try again later.</p>
                    <button onclick="openVideoModal(${JSON.stringify(video).replace(/"/g, '&quot;')})" 
                            style="margin-top: 15px; padding: 8px 16px; background: var(--primary-color); border: none; border-radius: 4px; color: white; cursor: pointer;">
                        Retry
                    </button>
                </div>`;
        }
    }
}
// Display TMDB details
function displayTMDBDetails(movieData, type, video) {
    console.log('Displaying TMDB details for:', movieData.title || 'Unknown');
    console.log('Trailer available:', movieData.trailer ? 'Yes' : 'No');

    const tmdbDetails = document.getElementById("tmdbDetails");
    if (!tmdbDetails) {
        console.error('TMDB details container not found');
        return;
    }

    // Make sure the details section is visible
    tmdbDetails.style.display = "block";

    try {
        // Create safe strings to prevent XSS
        const safeTitle = movieData.title ? movieData.title.replace(/"/g, '&quot;').replace(/'/g, '&apos;') : 'Unknown Title';
        const safeReleaseYear = movieData.release_year ? movieData.release_year : '';
        const safeDescription = movieData.overview ? movieData.overview.replace(/[\"\']/g, '') : 'No description available';

        // Create compact movie info
        let compactInfoHTML = createCompactMovieInfo(movieData, type);

        // Create cast section
        let castHTML = createCastSection(movieData);

        // Create trailer section
        let trailerHTML = createTrailerSection(movieData);

        // Combine all sections with new layout
        const htmlContent = `
            <div class="modern-movie-header">
                <h2 class="movie-title">${safeTitle} <span class="year-badge">${safeReleaseYear}</span></h2>
                ${movieData.tagline ? `<p class="movie-tagline">${movieData.tagline}</p>` : ''}
                <p class="movie-description">${safeDescription}</p>
            </div>
            ${compactInfoHTML}
            ${castHTML}
            ${trailerHTML}
        `;

        tmdbDetails.innerHTML = htmlContent;

    } catch (error) {
        console.error('Error displaying TMDB details:', error);
        tmdbDetails.innerHTML = '<div class="error-message">Error loading details. Please try again later.</div>';
    }
}

// Helper function to create cast section
function createCastSection(movieData) {
    if (!movieData.cast || !Array.isArray(movieData.cast)) {
        console.log('No cast information available');
        return '';
    }

    const castItems = movieData.cast
        .filter(actor => actor && (actor.name || actor.character))
        .slice(0, 12) // Limit to first 12 cast members
        .map(actor => {
            const safeName = actor.name ? actor.name.replace(/[\"\']/g, '') : 'Unknown';
            const safeCharacter = actor.character ? actor.character.replace(/[\"\']/g, '') : 'N/A';
            // Use the profile path already processed from TMDB data
            const profileImage = actor.profile_path || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9IiMzMzMiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjQ1IiByPSIyMCIgZmlsbD0iIzY2NiIvPjxlbGxpcHNlIGN4PSI2MCIgY3k9IjEwMCIgcng9IjMwIiByeT0iMjUiIGZpbGw9IiM2NjYiLz48L3N2Zz4=';
            console.log('Cast member image for', safeName + ':', profileImage);

            return `
                <div class="compact-cast-member">
                    <img 
                        class="compact-cast-photo" 
                        src="${profileImage}" 
                        alt="${safeName}"
                        onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzMCIgZmlsbD0iIzMzMyIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMjIiIHI9IjEwIiBmaWxsPSIjNjY2Ii8+PGVsbGlwc2UgY3g9IjMwIiBjeT0iNDgiIHJ4PSIxNSIgcnk9IjEyIiBmaWxsPSIjNjY2Ii8+PC9zdmc+';"
                        loading="lazy"
                        title="${safeName} as ${safeCharacter}">
                    <div class="compact-cast-info">
                        <div class="compact-cast-name">${safeName}</div>
                        <div class="compact-cast-character">${safeCharacter}</div>
                    </div>
                </div>`;
        });

    if (castItems.length === 0) {
        console.log('No valid cast members to display');
        return '';
    }

    return `
        <div class="compact-cast-section">
            <h3 class="section-title">🎭 Cast</h3>
            <div class="compact-cast-grid">
                ${castItems.join('')}
            </div>
        </div>`;
}

// Helper function to create compact movie info section
function createCompactMovieInfo(movieData, type) {
    // Create compact movie details
    const primaryInfo = [];
    const secondaryInfo = [];

    // Primary info (always show)
    if (movieData.vote_average) {
        primaryInfo.push(`<div class="info-chip"><span class="chip-icon">⭐</span>${movieData.vote_average.toFixed(1)}</div>`);
    }

    if (movieData.release_date) {
        const year = movieData.release_date.substring(0, 4);
        primaryInfo.push(`<div class="info-chip"><span class="chip-icon">📅</span>${year}</div>`);
    }

    if (movieData.runtime) {
        const hours = Math.floor(movieData.runtime / 60);
        const minutes = movieData.runtime % 60;
        primaryInfo.push(`<div class="info-chip"><span class="chip-icon">⏱️</span>${hours}h ${minutes}m</div>`);
    } else if (movieData.number_of_seasons) {
        primaryInfo.push(`<div class="info-chip"><span class="chip-icon">📺</span>${movieData.number_of_seasons} Season${movieData.number_of_seasons > 1 ? 's' : ''}</div>`);
    }

    if (movieData.status && movieData.status !== 'Released') {
        primaryInfo.push(`<div class="info-chip status-chip"><span class="chip-icon">📊</span>${movieData.status}</div>`);
    }

    // Secondary info (additional details)
    if (movieData.genres && movieData.genres.length > 0) {
        const genres = movieData.genres.slice(0, 3).map(g => g.name).join(', ');
        secondaryInfo.push(`<div class="info-detail"><strong>Genre:</strong> ${genres}</div>`);
    }

    if (movieData.production_countries && movieData.production_countries.length > 0) {
        const countries = movieData.production_countries.slice(0, 2).map(c => c.name).join(', ');
        secondaryInfo.push(`<div class="info-detail"><strong>Country:</strong> ${countries}</div>`);
    }

    if (movieData.original_language) {
        const languageNames = {
            'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
            'it': 'Italian', 'ja': 'Japanese', 'ko': 'Korean', 'zh': 'Chinese',
            'hi': 'Hindi', 'ar': 'Arabic', 'ru': 'Russian', 'pt': 'Portuguese'
        };
        const lang = languageNames[movieData.original_language] || movieData.original_language.toUpperCase();
        secondaryInfo.push(`<div class="info-detail"><strong>Language:</strong> ${lang}</div>`);
    }

    if (movieData.directors && movieData.directors.length > 0) {
        const directors = movieData.directors.slice(0, 2).join(', ');
        secondaryInfo.push(`<div class="info-detail"><strong>Director:</strong> ${directors}</div>`);
    }

    if (movieData.writers && movieData.writers.length > 0) {
        const writers = movieData.writers.slice(0, 2).join(', ');
        secondaryInfo.push(`<div class="info-detail"><strong>Writer:</strong> ${writers}</div>`);
    }

    // Budget & Revenue (only for movies with significant amounts)
    if (type === 'movie' && movieData.budget > 100000) {
        secondaryInfo.push(`<div class="info-detail"><strong>Budget:</strong> ${formatMoney(movieData.budget)}</div>`);
    }

    if (type === 'movie' && movieData.revenue > 100000) {
        secondaryInfo.push(`<div class="info-detail"><strong>Box Office:</strong> ${formatMoney(movieData.revenue)}</div>`);
    }

    return `
        <div class="compact-movie-info">
            <div class="primary-info">
                ${primaryInfo.join('')}
            </div>
            <div class="secondary-info">
                ${secondaryInfo.join('')}
            </div>
        </div>
    `;
}

// Helper function to create trailer section
function createTrailerSection(movieData) {
    if (!movieData.trailer) {
        console.log('No trailer available for:', movieData.title || 'Unknown movie');
        return '';
    }

    try {
        console.log('Creating trailer section for:', movieData.title, '- Trailer URL:', movieData.trailer);

        // Extract video ID from YouTube URL - handles multiple URL formats
        let videoId = null;

        if (movieData.trailer.includes('youtube.com/embed/')) {
            // Handle embed URLs: https://www.youtube.com/embed/VIDEO_ID
            videoId = movieData.trailer.split('/embed/')[1]?.split('?')[0];
        } else if (movieData.trailer.includes('youtube.com/watch')) {
            // Handle watch URLs: https://www.youtube.com/watch?v=VIDEO_ID
            videoId = new URL(movieData.trailer).searchParams.get('v');
        } else if (movieData.trailer.includes('youtu.be/')) {
            // Handle short URLs: https://youtu.be/VIDEO_ID
            videoId = movieData.trailer.split('youtu.be/')[1]?.split('?')[0];
        } else if (movieData.trailer.match(/^[\w-]{11}$/)) {
            // Handle case where it's just the video ID
            videoId = movieData.trailer;
        }

        if (!videoId) {
            console.error('Could not extract video ID from trailer URL:', movieData.trailer);
            return '';
        }

        console.log('Extracted video ID:', videoId);

        // Create safe title for the trailer note
        const safeTitle = movieData.title ? movieData.title.replace(/"/g, '&quot;').replace(/'/g, '&apos;') : 'this content';
        const safeReleaseYear = movieData.release_date ? new Date(movieData.release_date).getFullYear() : '';

        return `
            <div class="trailer-section">
                <h3 class="section-title">🎬 Official Trailer</h3>
                <div class="video-container">
                    <iframe 
                        width="560" 
                        height="315" 
                        src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        loading="lazy"
                        allowfullscreen>
                    </iframe>
                </div>
                <p class="trailer-note">Watch the official trailer for ${safeTitle}${safeReleaseYear ? ` (${safeReleaseYear})` : ''}</p>
            </div>`;
    } catch (error) {
        console.error('Error creating trailer section:', error);
        return '';
    }
}

// Close Video Modal
function closeVideoModal() {
    videoModal.classList.remove("active");
    // Clear the iframe content
    const modalVideo = document.querySelector(".modal-video");
    modalVideo.innerHTML =
        '<iframe id="modalPlayer" frameborder="0" allowfullscreen style="display: none;"></iframe>';
    document.body.style.overflow = "auto";
}

// Open Login Modal
function openLoginModal() {
    loginModal.classList.add("active");
    document.body.style.overflow = "hidden";
}

// Close Login Modal
function closeLoginModal() {
    loginModal.classList.remove("active");
    document.body.style.overflow = "auto";
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();

    // Show loading state
    const submitBtn = e.target.querySelector(".login-submit-btn");
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<div class="loading"></div>';

    // Simulate login process
    setTimeout(() => {
        // Reset button
        submitBtn.textContent = originalText;

        // Show success message
        const notification = document.createElement("div");
        notification.className = "download-notification show";
        notification.innerHTML = `
            <div class="notification-content">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
                <span>Welcome back! Login successful.</span>
            </div>
        `;
        document.body.appendChild(notification);

        // Close modal
        closeLoginModal();

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }, 2000);
}

// Toggle Mobile Menu
function toggleMobileMenu() {
    navMenu.classList.toggle("active");
}

// Handle Navigation
function handleNavigation(e) {
    e.preventDefault();
    const sectionName = e.target.getAttribute("data-section");
    console.log('Navigation clicked:', sectionName);

    // Close mobile menu
    navMenu.classList.remove("active");

    // Remove active class from all links
    navLinks.forEach((link) => link.classList.remove("active"));
    e.target.classList.add("active");

    // Navigate to section using the section ID
    if (sectionName) {
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });

            // Special actions for specific sections
            switch (sectionName) {
                case 'search':
                    // Focus on search input when navigating to search
                    setTimeout(() => {
                        const searchInput = document.getElementById('searchInput');
                        if (searchInput) {
                            searchInput.focus();
                        }
                    }, 800);
                    break;

                case 'categories':
                    // Could add special category actions here if needed
                    break;

                case 'popular':
                    // Could add popular filtering here if needed
                    break;
            }
        } else {
            console.log('Section not found:', sectionName);
        }
    }
}

// Handle View Toggle
function handleViewToggle(e) {
    const view = e.target.dataset.view;
    currentView = view;

    // Update active button
    viewBtns.forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");

    // Update grid layout
    if (view === "list") {
        videosGrid.classList.add("list-view");
    } else {
        videosGrid.classList.remove("list-view");
    }
}

// Download Movie Function
function handleDownload(title, year, downloadUrl) {
    console.log('Download initiated:', { title, year, downloadUrl });

    // Create download link
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${title} (${year})`.trim();  // Suggested filename
    a.target = '_blank';  // Open in new tab if direct download not possible

    // Show download notification
    const notification = document.createElement("div");
    notification.className = "download-notification show";
    notification.innerHTML = `
        <div class="notification-content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Download started: ${title} (${year})</span>
        </div>
    `;
    document.body.appendChild(notification);

    // Trigger download
    a.click();

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Load Live TV Slider
async function loadLiveTvSlider() {
    const liveTvGrid = document.querySelector(".live-tv-grid");
    if (!liveTvGrid) return;

    liveTvGrid.innerHTML = "";

    liveTvChannels.forEach((channel) => {
        const channelCard = document.createElement("div");
        channelCard.className = "live-tv-card";
        channelCard.innerHTML = `
            <div class="live-tv-thumbnail">
                <img src="${channel.thumbnail}" alt="${channel.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxpdmUgVFY8L3RleHQ+PC9zdmc+'">
                <div class="live-indicator">
                    <span class="live-dot"></span>
                    LIVE
                </div>
            </div>
            <div class="live-tv-info">
                <h3>${channel.name}</h3>
                <p>${channel.channel}</p>
            </div>
        `;

        channelCard.addEventListener("click", () => openLiveTvModal(channel));
        liveTvGrid.appendChild(channelCard);
    });
}

// Load Trending Slider
async function loadTrendingSlider() {
    const trendingGrid = document.querySelector(".trending-grid");
    if (!trendingGrid) return;

    trendingGrid.innerHTML =
        '<div style="text-align: center; color: var(--text-secondary);">Loading trending content...</div>';

    try {
        const trendingContent = await fetchTrendingContent();
        trendingGrid.innerHTML = "";

        trendingContent.slice(0, 10).forEach((item) => {
            const trendingCard = document.createElement("div");
            trendingCard.className = "trending-card";
            trendingCard.innerHTML = `
                <div class="trending-thumbnail">
                    <img src="${item.poster_path ? TMDB_IMAGE_BASE_URL + item.poster_path : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=="}" alt="${item.title || item.name}">
                    <div class="trending-rank">#${trendingContent.indexOf(item) + 1}</div>
                </div>
                <div class="trending-info">
                    <h3>${item.title || item.name}</h3>
                    <p>⭐ ${item.vote_average.toFixed(1)}</p>
                </div>
            `;

            trendingCard.addEventListener("click", async () => {
                try {
                    // Fetch TMDB data for the trending item
                    const tmdbData = await fetchTMDBData(item.id, item.media_type);

                    // Create a video object with the fetched data
                    const trendingVideo = {
                        id: `trending_${item.id}`,
                        tmdbId: item.id,
                        type: item.media_type,
                        title: item.title || item.name,
                        description: item.overview || 'No description available',
                        views: item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}` : 'N/A',
                        duration: item.runtime ? `${item.runtime} min` : 'N/A',
                        category: item.genre_ids ? item.genre_ids[0]?.toString() : 'unknown',
                        tmdbData: tmdbData, // Include the full TMDB data
                        embedCode: tmdbData?.trailer
                            ? `<iframe src="${tmdbData.trailer}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`
                            : '<div style="text-align: center; padding: 50px; color: var(--text-secondary);">Trailer not available for this content</div>',
                    };

                    openVideoModal(trendingVideo);
                } catch (error) {
                    console.error('Error loading trending content:', error);
                    // Fallback to basic info if TMDB fetch fails
                    const trendingVideo = {
                        id: `trending_${item.id}`,
                        tmdbId: item.id,
                        type: item.media_type,
                        title: item.title || item.name,
                        description: item.overview || 'No description available',
                        views: item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}` : 'N/A',
                        duration: item.runtime ? `${item.runtime} min` : 'N/A',
                        category: item.genre_ids ? item.genre_ids[0]?.toString() : 'unknown',
                        embedCode: '<div style="text-align: center; padding: 50px; color: var(--text-secondary);">Failed to load content details. Please try again later.</div>',
                    };
                    openVideoModal(trendingVideo);
                }
            });

            trendingGrid.appendChild(trendingCard);
        });
    } catch (error) {
        console.error("Error loading trending content:", error);
        trendingGrid.innerHTML =
            '<div style="text-align: center; color: var(--text-secondary);">Failed to load trending content</div>';
    }
}

// Open Live TV Modal
function openLiveTvModal(channel) {
    const modalVideo = document.querySelector(".modal-video");
    modalVideo.innerHTML = channel.embedCode;

    modalTitle.textContent = channel.name;
    modalDuration.textContent = "LIVE";
    modalViews.textContent = "Live TV";
    modalCategory.textContent = channel.channel;
    modalDescription.textContent = `Watch ${channel.name} live streaming 24/7.`;

    // Hide TMDB details for live TV
    const tmdbDetails = document.getElementById("tmdbDetails");
    tmdbDetails.style.display = "none";

    videoModal.classList.add("active");
    document.body.style.overflow = "hidden";
}

// Initialize sliders when the page loads
document.addEventListener('DOMContentLoaded', function () {
    setupSliders();
    console.log("H-TV Video Streaming Platform initialized successfully!");
});

// Slider functionality
function setupSliders() {
    // Live TV Slider
    const liveTvGrid = document.querySelector('.live-tv-grid');
    const liveTvNext = document.getElementById('liveTvNext');
    const liveTvPrev = document.getElementById('liveTvPrev');

    if (liveTvNext && liveTvPrev && liveTvGrid) {
        liveTvNext.addEventListener('click', () => {
            liveTvGrid.scrollBy({
                left: 300, // Adjust this value based on your card width + margin
                behavior: 'smooth'
            });
        });

        liveTvPrev.addEventListener('click', () => {
            liveTvGrid.scrollBy({
                left: -300, // Adjust this value based on your card width + margin
                behavior: 'smooth'
            });
        });
    }

    // Trending Slider
    const trendingGrid = document.querySelector('.trending-grid');
    const trendingNext = document.getElementById('trendingNext');
    const trendingPrev = document.getElementById('trendingPrev');

    if (trendingNext && trendingPrev && trendingGrid) {
        trendingNext.addEventListener('click', () => {
            trendingGrid.scrollBy({
                left: 300, // Adjust this value based on your card width + margin
                behavior: 'smooth'
            });
        });

        trendingPrev.addEventListener('click', () => {
            trendingGrid.scrollBy({
                left: -300, // Adjust this value based on your card width + margin
                behavior: 'smooth'
            });
        });
    }
}

// Comment Section Functionality
function setupCommentSection() {
    const commentForm = document.getElementById('commentForm');
    const commentText = document.getElementById('commentText');
    const charCount = document.getElementById('charCount');

    if (!commentForm || !commentText || !charCount) {
        console.log('❌ Comment section elements not found');
        return;
    }

    console.log('✅ Comment section initialized - Firebase will handle form submission');

    // Character counter
    commentText.addEventListener('input', () => {
        const count = commentText.value.length;
        charCount.textContent = count;

        // Change color when approaching limit
        if (count > 450) {
            charCount.style.color = '#ff0844';
        } else if (count > 400) {
            charCount.style.color = '#ffa500';
        } else {
            charCount.style.color = 'var(--text-muted)';
        }
    });

    // NOTE: Form submission is now handled by Firebase module in index.html
    // This function only sets up the character counter
}

// Scroll to Top functionality
function setupScrollToTop() {
    if (!scrollToTopBtn) {
        console.warn('Scroll to top button not found');
        return;
    }

    // Show/hide scroll to top button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });

    // Smooth scroll to top when button is clicked
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Back to LinkShare Button functionality
const backToLinkshareBtn = document.getElementById('backToLinkshare');

function setupBackToLinkshare() {
    if (!backToLinkshareBtn) {
        console.warn('Back to LinkShare button not found');
        return;
    }

    // Show/hide back button based on scroll position (same as scroll to top)
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToLinkshareBtn.classList.add('visible');
        } else {
            backToLinkshareBtn.classList.remove('visible');
        }
    });
}

// Initialize back to linkshare button
setupBackToLinkshare();
