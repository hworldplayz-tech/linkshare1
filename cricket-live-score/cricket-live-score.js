// Cricket Live Score Application
class CricketLiveScore {
    constructor() {
        // Multiple API configurations for fallback
        this.apiConfigs = [
            {
                name: 'CricAPI Primary',
                key: 'b43dd0b5-ccbf-4bb9-af24-dc9596b80f87',
                baseUrl: 'https://api.cricapi.com/v1',
                endpoint: 'currentMatches',
                type: 'cricapi'
            },
            {
                name: 'Cricket Live Line RapidAPI',
                key: '32a8817212msh7f3f4d71c33d39dp1e60cfjsnd741986feab8',
                baseUrl: 'https://cricket-live-line1.p.rapidapi.com',
                endpoint: 'liveMatches',
                type: 'cricket-live-line',
                host: 'cricket-live-line1.p.rapidapi.com',
                endpoints: {
                    live: 'liveMatches',
                    recent: 'recentMatches', 
                    upcoming: 'upcomingMatches',
                    series: 'series'
                }
            }
        ];
        
        this.currentApiIndex = 0;
        this.matches = [];
        this.currentFilter = 'all';
        this.refreshInterval = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        // Asia Cup cache for better coverage
        this.asiaCupMatchesCache = [];
        this.asiaCupLastFetch = 0;
        
        // DOM Elements
        this.liveScoreBar = document.getElementById('liveScoreBar');
        this.matchesContainer = document.getElementById('matchesContainer');
        this.asiaCupMatches = document.getElementById('asiaCupMatches');
        
        this.init();
    }
    
    async init() {
        try {
            this.setupEventListeners();
            await this.fetchMatches();
            // Also try to fetch upcoming matches if no live matches
            if (this.matches.length === 0) {
                await this.fetchUpcomingMatches();
            }
            // Always try to fetch Asia Cup specifically for featured section
            await this.fetchAsiaCupFeatured();
            this.startAutoRefresh();
        } catch (error) {
            console.error('Failed to initialize cricket live score:', error);
            this.showError('Failed to load cricket data');
        }
    }
    
    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderMatches();
            });
        });
        
        // Scroll to top functionality
        const scrollBtn = document.querySelector('.scroll-to-top');
        if (scrollBtn) {
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    scrollBtn.classList.add('visible');
                } else {
                    scrollBtn.classList.remove('visible');
                }
            });
            
            scrollBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }
    
    async fetchMatches() {
        // Try current API
        const success = await this.tryFetchFromCurrentApi();
        
        if (!success) {
            // Try fallback APIs or show demo data
            await this.handleApiFallback();
        }
    }
    
    async tryFetchFromCurrentApi() {
        try {
            const config = this.apiConfigs[this.currentApiIndex];
            console.log(`Trying API: ${config.name}`);
            
            // Create timeout controller for better browser compatibility
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            let url, headers;
            
            if (config.type === 'cricapi') {
                url = `${config.baseUrl}/${config.endpoint}?apikey=${config.key}&offset=0`;
                headers = {
                    'Content-Type': 'application/json',
                };
            } else if (config.type === 'rapidapi') {
                url = `${config.baseUrl}/${config.endpoint}`;
                headers = {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Key': config.key,
                    'X-RapidAPI-Host': 'cricbuzz-cricket.p.rapidapi.com'
                };
            } else if (config.type === 'cricket-live-line') {
                url = `${config.baseUrl}/${config.endpoint}`;
                headers = {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Key': config.key,
                    'X-RapidAPI-Host': config.host
                };
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: headers,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Rate limited - too many requests');
                } else if (response.status === 401) {
                    throw new Error('Invalid API key');
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            }
            
            const data = await response.json();
            console.log('API Response:', data);
            
            // Parse data based on API type
            let matches = [];
            
            if (config.type === 'cricapi' && data.status === 'success' && data.data) {
                matches = data.data;
            } else if (config.type === 'rapidapi') {
                // Parse Cricbuzz API response
                matches = this.parseCricbuzzData(data);
            } else if (config.type === 'cricket-live-line') {
                // Parse Cricket Live Line API response
                matches = this.parseCricketLiveLineData(data);
            }
            
            if (matches.length > 0) {
                this.matches = matches;
                this.retryCount = 0; // Reset retry count on success
                this.updateLiveScoreBar();
                this.renderMatches();
                this.renderAsiaCupSection();
                return true;
            } else {
                // If no matches, show appropriate message
                this.matches = [];
                this.showNoMatchesMessage();
                return true; // This is still a successful API call
            }
            
        } catch (error) {
            console.error(`API ${this.apiConfigs[this.currentApiIndex].name} failed:`, error.message);
            return false;
        }
    }
    
    async handleApiFallback() {
        // Try next API if available
        if (this.currentApiIndex < this.apiConfigs.length - 1) {
            this.currentApiIndex++;
            const success = await this.tryFetchFromCurrentApi();
            if (success) return;
        }
        
        // If all APIs failed, increment retry count
        this.retryCount++;
        
        if (this.retryCount <= this.maxRetries) {
            // Reset to first API and show retry message
            this.currentApiIndex = 0;
            this.showRetryMessage();
            
            // Retry after 5 seconds
            setTimeout(() => {
                this.fetchMatches();
            }, 5000);
        } else {
            // Show demo data after max retries
            this.loadDemoData();
        }
    }
    
    updateLiveScoreBar() {
        const liveMatches = this.matches.filter(match => 
            match.matchStarted && !match.matchEnded
        );
        
        if (liveMatches.length > 0) {
            const match = liveMatches[0];
            const scoreText = this.getScoreText(match);
            this.liveScoreBar.innerHTML = `
                <i class="fas fa-circle" style="color: #e74c3c; animation: blink 1s infinite;"></i>
                <strong>LIVE:</strong> ${match.name} - ${scoreText}
            `;
        } else {
            this.liveScoreBar.innerHTML = `
                <i class="fas fa-clock"></i> 
                No live matches currently. Check upcoming matches below!
            `;
        }
    }
    
    renderAsiaCupSection() {
        const asiaCupMatches = this.matches.filter(match => 
            (match.series && match.series.toLowerCase().includes('asia cup')) ||
            (match.tournament && match.tournament.toLowerCase().includes('asia cup')) ||
            (match.name && match.name.toLowerCase().includes('asia cup'))
        ).slice(0, 3);
        
        if (asiaCupMatches.length > 0) {
            let html = '<div class="asia-cup-grid" style="display: grid; gap: 1rem; margin-top: 1rem;">';
            
            asiaCupMatches.forEach(match => {
                const statusClass = this.getMatchStatusClass(match);
                const scoreText = this.getScoreText(match);
                
                html += `
                    <div class="match-card ${statusClass}" style="margin: 0;">
                        <div class="match-header">
                            <div class="match-title">${match.name}</div>
                            <div class="match-subtitle">${match.venue || 'Venue TBA'} • ${match.date || 'Date TBA'}</div>
                        </div>
                        <div class="match-body">
                            <div class="teams-section">
                                ${this.renderTeams(match)}
                            </div>
                            <div class="match-status ${statusClass}">
                                ${match.status || 'Status Unknown'}
                            </div>
                            ${scoreText !== 'No score available' ? `
                                <div class="overs-progress">
                                    ${this.renderProgressBar(match)}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            this.asiaCupMatches.innerHTML = html;
        } else {
            this.asiaCupMatches.innerHTML = `
                <div class="no-matches" style="text-align: center; padding: 2rem; color: white;">
                    <i class="fas fa-trophy" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.7;"></i>
                    <p>No Asia Cup matches currently active</p>
                    <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 1rem;">Searching for fixtures...</p>
                </div>
            `;
            // Trigger explicit Asia Cup fetch if not already cached
            this.fetchAsiaCupFeatured().catch(() => {});
        }
    }
    
    renderMatches() {
        const filteredMatches = this.filterMatches();
        
        if (filteredMatches.length === 0) {
            this.matchesContainer.innerHTML = `
                <div class="no-matches" style="text-align: center; padding: 3rem; background: white; border-radius: 12px; box-shadow: var(--shadow);">
                    <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--cricket-secondary); margin-bottom: 0.5rem;">No matches found</h3>
                    <p style="color: #666;">No ${this.currentFilter} matches available right now.</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        filteredMatches.forEach(match => {
            html += this.renderMatchCard(match);
        });
        
        this.matchesContainer.innerHTML = html;
    }
    
    renderMatchCard(match) {
        const statusClass = this.getMatchStatusClass(match);
        const scoreText = this.getScoreText(match);
        const teams = this.renderTeams(match);
        
        return `
            <div class="match-card ${statusClass}">
                <div class="match-header">
                    <div class="match-title">${match.name}</div>
                    <div class="match-subtitle">
                        ${match.venue || 'Venue TBA'} • ${match.matchType || 'Format TBA'} • ${match.date || 'Date TBA'}
                    </div>
                </div>
                <div class="match-body">
                    <div class="teams-section">
                        ${teams}
                    </div>
                    
                    <div class="match-status ${statusClass}">
                        ${match.status || 'Status Unknown'}
                    </div>
                    
                    ${this.renderMatchDetails(match)}
                    
                    ${scoreText !== 'No score available' ? `
                        <div class="overs-progress">
                            ${this.renderProgressBar(match)}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    renderTeams(match) {
        const teams = match.teams || [];
        if (teams.length < 2) {
            return '<p>Team information not available</p>';
        }
        
        const team1 = teams[0];
        const team2 = teams[1];
        
        // Get team scores
        const team1Score = this.getTeamScore(match, team1);
        const team2Score = this.getTeamScore(match, team2);
        
        return `
            <div class="team">
                <img class="team-flag" src="${this.getCountryFlag(team1)}" alt="${team1}" onerror="this.src='https://flagsapi.com/XX/shiny/64.png'" />
                <div class="team-info">
                    <h4>${team1}</h4>
                    <div class="team-score">${team1Score}</div>
                </div>
            </div>
            <div class="team">
                <img class="team-flag" src="${this.getCountryFlag(team2)}" alt="${team2}" onerror="this.src='https://flagsapi.com/XX/shiny/64.png'" />
                <div class="team-info">
                    <h4>${team2}</h4>
                    <div class="team-score">${team2Score}</div>
                </div>
            </div>
        `;
    }
    
    renderMatchDetails(match) {
        const details = [];
        
        if (match.venue) {
            details.push({ label: 'Venue', value: match.venue });
        }
        
        if (match.matchType) {
            details.push({ label: 'Format', value: match.matchType });
        }
        
        if (match.series) {
            details.push({ label: 'Series', value: match.series });
        }
        
        if (match.tossWinner && match.tossChoice) {
            details.push({ label: 'Toss', value: `${match.tossWinner} (${match.tossChoice})` });
        }
        
        if (details.length === 0) return '';
        
        return `
            <div class="match-details">
                ${details.map(detail => `
                    <div class="detail-item">
                        <div class="label">${detail.label}</div>
                        <div class="value">${detail.value}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderProgressBar(match) {
        if (!match.score || match.score.length === 0) return '';
        
        const currentInning = match.score[0];
        if (!currentInning.o) return '';
        
        const overs = parseFloat(currentInning.o);
        const maxOvers = match.matchType === 'T20' || match.matchType === 'T20I' ? 20 : 50;
        const progress = Math.min((overs / maxOvers) * 100, 100);
        
        return `
            <div class="progress-label">
                <span>Overs</span>
                <span>${overs}/${maxOvers}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
        `;
    }
    
    getMatchStatusClass(match) {
        if (match.matchStarted && !match.matchEnded) return 'live';
        if (match.matchEnded) return 'completed';
        return 'upcoming';
    }
    
    getScoreText(match) {
        if (!match.score || match.score.length === 0) {
            return 'No score available';
        }
        
        const currentInning = match.score[0];
        return `${currentInning.r || 0}/${currentInning.w || 0} (${currentInning.o || 0} ov)`;
    }
    
    getTeamScore(match, teamName) {
        if (!match.score || match.score.length === 0) {
            return '-';
        }
        
        const teamScore = match.score.find(score => score.inning === teamName);
        if (teamScore) {
            return `${teamScore.r || 0}/${teamScore.w || 0} (${teamScore.o || 0})`;
        }
        
        return '-';
    }
    
    getCountryFlag(teamName) {
        const flagMap = {
            'Pakistan': 'https://flagsapi.com/PK/shiny/64.png',
            'India': 'https://flagsapi.com/IN/shiny/64.png',
            'Sri Lanka': 'https://flagsapi.com/LK/shiny/64.png',
            'Bangladesh': 'https://flagsapi.com/BD/shiny/64.png',
            'Afghanistan': 'https://flagsapi.com/AF/shiny/64.png',
            'Australia': 'https://flagsapi.com/AU/shiny/64.png',
            'England': 'https://flagsapi.com/GB/shiny/64.png',
            'South Africa': 'https://flagsapi.com/ZA/shiny/64.png',
            'New Zealand': 'https://flagsapi.com/NZ/shiny/64.png',
            'West Indies': 'https://flagsapi.com/JM/shiny/64.png',
            'Zimbabwe': 'https://flagsapi.com/ZW/shiny/64.png'
        };
        
        return flagMap[teamName] || 'https://flagsapi.com/XX/shiny/64.png';
    }
    
    filterMatches() {
        if (this.currentFilter === 'all') return this.matches;
        
        return this.matches.filter(match => {
            switch (this.currentFilter) {
                case 'live':
                    return match.matchStarted && !match.matchEnded;
                case 'upcoming':
                    return !match.matchStarted;
                case 'completed':
                    return match.matchEnded;
                default:
                    return true;
            }
        });
    }
    
    startAutoRefresh() {
        // Start with longer intervals to avoid rate limiting
        let refreshIntervalMs = 60000; // Start with 60 seconds
        
        this.refreshInterval = setInterval(() => {
            // Only auto-refresh if we have real data (not demo data)
            if (this.retryCount <= this.maxRetries) {
                this.fetchMatches();
            } else {
                // If using demo data, try once every 5 minutes
                clearInterval(this.refreshInterval);
                this.refreshInterval = setInterval(() => {
                    this.retryCount = 0; // Reset retry count
                    this.currentApiIndex = 0; // Reset to first API
                    this.fetchMatches();
                }, 300000); // 5 minutes
            }
        }, refreshIntervalMs);
    }
    
    showError(message) {
        this.matchesContainer.innerHTML = `
            <div class="error-state" style="text-align: center; padding: 3rem; background: rgba(231, 76, 60, 0.1); border-radius: 12px; border: 1px solid rgba(231, 76, 60, 0.2);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e74c3c; margin-bottom: 1rem;"></i>
                <h3 style="color: #e74c3c; margin-bottom: 0.5rem;">Error Loading Data</h3>
                <p style="color: #666; margin-bottom: 1rem;">${message}</p>
                <button onclick="cricketApp.fetchMatches()" style="background: #e74c3c; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-refresh"></i> Try Again
                </button>
            </div>
        `;
        
        this.liveScoreBar.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i> 
            Unable to load live scores
        `;
    }
    
    showRetryMessage() {
        this.liveScoreBar.innerHTML = `
            <i class="fas fa-hourglass-half"></i> Rate limited. Retrying in 5 seconds... (Attempt ${this.retryCount}/${this.maxRetries})
        `;
    }
    
    parseCricbuzzData(data) {
        // Parse Cricbuzz API response format
        let matches = [];
        
        try {
            // Cricbuzz API structure varies, handle different formats
            if (data && Array.isArray(data)) {
                matches = data.map(match => this.normalizeCricbuzzMatch(match));
            } else if (data && data.matches && Array.isArray(data.matches)) {
                matches = data.matches.map(match => this.normalizeCricbuzzMatch(match));
            } else if (data && data.typeMatches) {
                // Handle Cricbuzz grouped format
                data.typeMatches.forEach(group => {
                    if (group.seriesMatches) {
                        group.seriesMatches.forEach(series => {
                            if (series.seriesAdWrapper && series.seriesAdWrapper.matches) {
                                series.seriesAdWrapper.matches.forEach(match => {
                                    matches.push(this.normalizeCricbuzzMatch(match.matchInfo));
                                });
                            }
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error parsing Cricbuzz data:', error);
        }
        
        return matches.filter(match => match !== null);
    }
    
    normalizeCricbuzzMatch(matchData) {
        if (!matchData) return null;
        
        try {
            return {
                name: `${matchData.team1?.teamName || 'Team 1'} vs ${matchData.team2?.teamName || 'Team 2'}`,
                teams: [matchData.team1?.teamName || 'Team 1', matchData.team2?.teamName || 'Team 2'],
                matchStarted: matchData.status === 'LIVE' || matchData.state === 'In Progress',
                matchEnded: matchData.status === 'COMPLETE' || matchData.state === 'Complete',
                matchType: matchData.matchFormat || matchData.matchType || 'Unknown',
                venue: matchData.venue?.name || matchData.venueInfo?.ground || 'Venue TBA',
                date: this.formatDate(matchData.startDate || matchData.matchStartTimestamp),
                status: matchData.status || matchData.state || 'Unknown',
                series: matchData.seriesName || matchData.series?.name,
                score: this.parseCricbuzzScore(matchData)
            };
        } catch (error) {
            console.error('Error normalizing match data:', error);
            return null;
        }
    }
    
    parseCricbuzzScore(matchData) {
        let scores = [];
        
        try {
            // Handle different score formats from Cricbuzz
            if (matchData.team1Score && matchData.team2Score) {
                scores.push({
                    inning: matchData.team1?.teamName,
                    r: matchData.team1Score.runs || 0,
                    w: matchData.team1Score.wickets || 0,
                    o: matchData.team1Score.overs || 0
                });
                
                scores.push({
                    inning: matchData.team2?.teamName,
                    r: matchData.team2Score.runs || 0,
                    w: matchData.team2Score.wickets || 0,
                    o: matchData.team2Score.overs || 0
                });
            }
        } catch (error) {
            console.error('Error parsing scores:', error);
        }
        
        return scores;
    }
    
    parseCricketLiveLineData(data) {
        // Parse Cricket Live Line API response format
        let matches = [];
        
        try {
            console.log('Raw Cricket Live Line API data:', data);
            
            // Handle different response formats from cricket-live-line API
            if (data && Array.isArray(data)) {
                matches = data.map(match => this.normalizeCricketLiveLineMatch(match)).filter(m => m !== null);
            } else if (data && data.matches && Array.isArray(data.matches)) {
                matches = data.matches.map(match => this.normalizeCricketLiveLineMatch(match)).filter(m => m !== null);
            } else if (data && data.data && Array.isArray(data.data)) {
                matches = data.data.map(match => this.normalizeCricketLiveLineMatch(match)).filter(m => m !== null);
            } else if (data && typeof data === 'object') {
                // If single match object
                const normalized = this.normalizeCricketLiveLineMatch(data);
                if (normalized) matches.push(normalized);
            }
            
            console.log(`Parsed ${matches.length} matches from Cricket Live Line API`);
            
        } catch (error) {
            console.error('Error parsing Cricket Live Line data:', error);
        }
        
        return matches;
    }
    
    normalizeCricketLiveLineMatch(matchData) {
        if (!matchData) return null;
        
        try {
            // Extract team names
            const team1 = matchData.team1 || matchData.teamA || matchData.homeTeam || 'Team 1';
            const team2 = matchData.team2 || matchData.teamB || matchData.awayTeam || 'Team 2';
            
            // Determine match status
            const status = matchData.status || matchData.matchStatus || 'Unknown';
            const isLive = status.toLowerCase().includes('live') || 
                          status.toLowerCase().includes('inprogress') || 
                          matchData.isLive || 
                          matchData.live;
            const isCompleted = status.toLowerCase().includes('complete') || 
                               status.toLowerCase().includes('finished') || 
                               matchData.isCompleted;
            
            return {
                name: `${team1} vs ${team2}`,
                teams: [team1, team2],
                matchStarted: isLive || isCompleted,
                matchEnded: isCompleted,
                matchType: matchData.format || matchData.matchType || matchData.type || 'Unknown',
                venue: matchData.venue || matchData.ground || matchData.location || 'Venue TBA',
                date: this.formatDate(matchData.date || matchData.startTime || matchData.matchTime),
                status: status,
                series: matchData.series || matchData.tournament || matchData.competition,
                score: this.parseCricketLiveLineScore(matchData)
            };
        } catch (error) {
            console.error('Error normalizing Cricket Live Line match data:', error);
            return null;
        }
    }
    
    parseCricketLiveLineScore(matchData) {
        let scores = [];
        
        try {
            // Handle different score formats from Cricket Live Line
            if (matchData.score) {
                if (Array.isArray(matchData.score)) {
                    // If score is an array of innings
                    scores = matchData.score.map(inning => ({
                        inning: inning.team || inning.battingTeam,
                        r: parseInt(inning.runs || inning.score || 0),
                        w: parseInt(inning.wickets || inning.wicketsLost || 0),
                        o: parseFloat(inning.overs || inning.oversPlayed || 0)
                    }));
                } else if (typeof matchData.score === 'object') {
                    // If score is an object with team scores
                    const team1Score = matchData.score.team1 || matchData.score.teamA;
                    const team2Score = matchData.score.team2 || matchData.score.teamB;
                    
                    if (team1Score) {
                        scores.push({
                            inning: matchData.team1 || matchData.teamA,
                            r: parseInt(team1Score.runs || team1Score.score || 0),
                            w: parseInt(team1Score.wickets || 0),
                            o: parseFloat(team1Score.overs || 0)
                        });
                    }
                    
                    if (team2Score) {
                        scores.push({
                            inning: matchData.team2 || matchData.teamB,
                            r: parseInt(team2Score.runs || team2Score.score || 0),
                            w: parseInt(team2Score.wickets || 0),
                            o: parseFloat(team2Score.overs || 0)
                        });
                    }
                }
            }
            
            // Fallback: try to extract from direct properties
            if (scores.length === 0) {
                if (matchData.team1Score || matchData.teamAScore) {
                    scores.push({
                        inning: matchData.team1 || matchData.teamA,
                        r: parseInt(matchData.team1Score || matchData.teamAScore || 0),
                        w: parseInt(matchData.team1Wickets || matchData.teamAWickets || 0),
                        o: parseFloat(matchData.team1Overs || matchData.teamAOvers || 0)
                    });
                }
                
                if (matchData.team2Score || matchData.teamBScore) {
                    scores.push({
                        inning: matchData.team2 || matchData.teamB,
                        r: parseInt(matchData.team2Score || matchData.teamBScore || 0),
                        w: parseInt(matchData.team2Wickets || matchData.teamBWickets || 0),
                        o: parseFloat(matchData.team2Overs || matchData.teamBOvers || 0)
                    });
                }
            }
            
        } catch (error) {
            console.error('Error parsing Cricket Live Line scores:', error);
        }
        
        return scores;
    }
    
    formatDate(timestamp) {
        if (!timestamp) return 'Date TBA';
        
        try {
            const date = new Date(timestamp);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            if (date.toDateString() === today.toDateString()) {
                return 'Today';
            } else if (date.toDateString() === tomorrow.toDateString()) {
                return 'Tomorrow';
            } else {
                return date.toLocaleDateString();
            }
        } catch (error) {
            return 'Date TBA';
        }
    }

    async fetchUpcomingMatches() {
        try {
            // Try to fetch upcoming matches from different endpoints
            const config = this.apiConfigs[this.currentApiIndex];
            
            let upcomingUrl;
            if (config.type === 'cricapi') {
                upcomingUrl = `${config.baseUrl}/matches?apikey=${config.key}&offset=0`;
            } else if (config.type === 'rapidapi') {
                upcomingUrl = `${config.baseUrl}/matches/v1/recent`;
            } else if (config.type === 'cricket-live-line') {
                upcomingUrl = `${config.baseUrl}/recentMatches`;
            }
            
            const headers = {};
            if (config.type === 'rapidapi') {
                headers['X-RapidAPI-Key'] = config.key;
                headers['X-RapidAPI-Host'] = 'cricbuzz-cricket.p.rapidapi.com';
            } else if (config.type === 'cricket-live-line') {
                headers['X-RapidAPI-Key'] = config.key;
                headers['X-RapidAPI-Host'] = config.host;
            }
            
            const response = await fetch(upcomingUrl, {
                method: 'GET',
                headers: headers
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Upcoming matches data:', data);
                
                let upcomingMatches = [];
                if (config.type === 'cricapi' && data.status === 'success') {
                    upcomingMatches = data.data || [];
                } else if (config.type === 'rapidapi') {
                    upcomingMatches = this.parseCricbuzzData(data);
                } else if (config.type === 'cricket-live-line') {
                    upcomingMatches = this.parseCricketLiveLineData(data);
                }
                
                if (upcomingMatches.length > 0) {
                    this.matches = upcomingMatches;
                    this.renderMatches();
                    this.renderAsiaCupSection();
                    return;
                }
            }
        } catch (error) {
            console.log('Could not fetch upcoming matches:', error.message);
        }
        
        // If no upcoming matches found, show the no matches message
        this.showNoMatchesMessage();
    }
    
    showNoMatchesMessage() {
        this.liveScoreBar.innerHTML = `
            <i class="fas fa-info-circle"></i> 
            No live matches currently. Check upcoming matches below!
        `;
        
        this.matchesContainer.innerHTML = `
            <div class="no-matches" style="text-align: center; padding: 3rem; background: white; border-radius: 12px; box-shadow: var(--shadow);">
                <i class="fas fa-calendar-alt" style="font-size: 3rem; color: var(--cricket-secondary); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--cricket-secondary); margin-bottom: 0.5rem;">No Live Matches Right Now</h3>
                <p style="color: #666; margin-bottom: 1rem;">There are currently no cricket matches being played. Check back later for live updates!</p>
                <div style="background: var(--gray-light); padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
                    <h4 style="color: var(--cricket-secondary); margin-bottom: 1rem;">📅 Upcoming Matches</h4>
                    <p style="color: #666; font-size: 0.9rem;">We'll automatically refresh and show live matches when they start. Stay tuned for exciting cricket action!</p>
                    <p style="color: var(--cricket-primary); font-size: 0.9rem; font-weight: bold; margin-top: 1rem;">⚡ Auto-refresh: Every 60 seconds</p>
                </div>
                <button onclick="cricketApp.fetchMatches()" style="background: var(--cricket-primary); color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; margin-top: 1rem;">
                    <i class="fas fa-refresh"></i> Refresh Now
                </button>
            </div>
        `;
        
        this.asiaCupMatches.innerHTML = `
            <div class="no-matches" style="text-align: center; padding: 2rem; color: white;">
                <i class="fas fa-trophy" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.7;"></i>
                <p>No Asia Cup matches currently active</p>
                <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 1rem;">Stay tuned for upcoming tournament matches!</p>
            </div>
        `;
    }
    
    loadDemoData() {
        // This should only be used as last resort
        console.log('Loading demo data as fallback');
        this.matches = [];
        this.showNoMatchesMessage();
        
        this.liveScoreBar.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i> 
            All APIs unavailable. Showing fallback message.
        `;
    }
    
    // Explicit Asia Cup fetching from multiple endpoints
    async fetchAsiaCupFeatured() {
        try {
            const now = Date.now();
            // Use cache if fetched within last 5 minutes
            if (this.asiaCupMatchesCache.length > 0 && (now - this.asiaCupLastFetch) < 5 * 60 * 1000) {
                this.renderAsiaCupFromCache();
                return;
            }
            
            // Prefer new cricket-live-line API; if not present, fallback to prior rapidapi
            const cllConfig = this.apiConfigs.find(c => c.type === 'cricket-live-line');
            const rapidConfig = this.apiConfigs.find(c => c.type === 'rapidapi');
            const apiConfig = cllConfig || rapidConfig;
            if (!apiConfig) return;
            
            console.log('Fetching Asia Cup matches from Cricbuzz...');
            
            const headers = {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': apiConfig.key,
                'X-RapidAPI-Host': apiConfig.host || 'cricbuzz-cricket.p.rapidapi.com'
            };
            
            // Start with series data to find Asia Cup specifically, then get matches
            const allMatches = [];
            
            if (apiConfig.type === 'cricket-live-line') {
                // Try to get series first to find Asia Cup series ID
                try {
                    const seriesResponse = await fetch(`${apiConfig.baseUrl}/series`, { 
                        method: 'GET', 
                        headers 
                    });
                    
                    if (seriesResponse.ok) {
                        const seriesData = await seriesResponse.json();
                        const asiaCupSeries = this.findAsiaCupSeries(seriesData);
                        
                        // If we find Asia Cup series, get matches from that specific series
                        if (asiaCupSeries && asiaCupSeries.id) {
                            console.log(`Found Asia Cup series ID: ${asiaCupSeries.id}`);
                            const seriesEndpoints = [
                                `series/${asiaCupSeries.id}/recentMatches`,
                                `series/${asiaCupSeries.id}/upcomingMatches`
                            ];
                            
                            for (const endpoint of seriesEndpoints) {
                                try {
                                    const response = await fetch(`${apiConfig.baseUrl}/${endpoint}`, { 
                                        method: 'GET', 
                                        headers 
                                    });
                                    
                                    if (response.ok) {
                                        const data = await response.json();
                                        const parsed = this.parseCricketLiveLineData(data);
                                        allMatches.push(...parsed);
                                    }
                                } catch (err) {
                                    console.log(`Failed to fetch from ${endpoint}:`, err.message);
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.log('Failed to fetch series data:', err.message);
                }
                
                // Fallback: try general endpoints but limit to avoid rate limiting
                if (allMatches.length === 0) {
                    try {
                        const response = await fetch(`${apiConfig.baseUrl}/recentMatches`, { 
                            method: 'GET', 
                            headers 
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            const parsed = this.parseCricketLiveLineData(data);
                            allMatches.push(...parsed);
                        }
                    } catch (err) {
                        console.log('Failed to fetch recent matches:', err.message);
                    }
                }
            } else {
                // Cricbuzz API fallback
                const endpoints = ['matches/v1/live', 'matches/v1/recent'];
                for (const endpoint of endpoints) {
                    try {
                        const response = await fetch(`${apiConfig.baseUrl}/${endpoint}`, { 
                            method: 'GET', 
                            headers 
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            const parsed = this.parseCricbuzzData(data);
                            allMatches.push(...parsed);
                        }
                    } catch (err) {
                        console.log(`Failed to fetch from ${endpoint}:`, err.message);
                    }
                }
            }
            
            // Filter for Asia Cup matches
            const asiaCupMatches = allMatches.filter(match => 
                this.isAsiaCupMatch(match)
            );
            
            // Remove duplicates based on match name
            const uniqueMatches = asiaCupMatches.filter((match, index, arr) => 
                arr.findIndex(m => m.name === match.name) === index
            );
            
            // Sort by date priority
            uniqueMatches.sort((a, b) => {
                const dateA = a.date || '';
                const dateB = b.date || '';
                const priority = (d) => d === 'Today' ? 0 : d === 'Tomorrow' ? 1 : 2;
                return priority(dateA) - priority(dateB);
            });
            
            this.asiaCupMatchesCache = uniqueMatches.slice(0, 6);
            this.asiaCupLastFetch = now;
            
            console.log(`Found ${this.asiaCupMatchesCache.length} Asia Cup matches`);
            this.renderAsiaCupFromCache();
            
        } catch (error) {
            console.error('Error fetching Asia Cup featured matches:', error);
        }
    }
    
    findAsiaCupSeries(seriesData) {
        try {
            if (Array.isArray(seriesData)) {
                return seriesData.find(series => {
                    const name = (series.name || series.title || '').toLowerCase();
                    return name.includes('asia cup') || (name.includes('asia') && name.includes('cup'));
                });
            } else if (seriesData && seriesData.data && Array.isArray(seriesData.data)) {
                return seriesData.data.find(series => {
                    const name = (series.name || series.title || '').toLowerCase();
                    return name.includes('asia cup') || (name.includes('asia') && name.includes('cup'));
                });
            }
        } catch (error) {
            console.log('Error finding Asia Cup series:', error);
        }
        return null;
    }
    
    isAsiaCupMatch(match) {
        const text = `${match.series || ''} ${match.tournament || ''} ${match.name || ''}`.toLowerCase();
        return text.includes('asia cup') || 
               text.includes('asia') && text.includes('cup') ||
               (match.teams && match.teams.some(team => 
                   ['Pakistan', 'India', 'Sri Lanka', 'Bangladesh', 'Afghanistan'].includes(team)
               ));
    }
    
    renderAsiaCupFromCache() {
        if (!this.asiaCupMatchesCache || this.asiaCupMatchesCache.length === 0) {
            this.asiaCupMatches.innerHTML = `
                <div class="no-matches" style="text-align: center; padding: 2rem; color: white;">
                    <i class="fas fa-trophy" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.7;"></i>
                    <p>No Asia Cup fixtures found yet</p>
                    <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 1rem;">Checking tournament schedule...</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="asia-cup-grid" style="display: grid; gap: 1rem; margin-top: 1rem;">';
        
        this.asiaCupMatchesCache.forEach(match => {
            const statusClass = this.getMatchStatusClass(match);
            const scoreText = this.getScoreText(match);
            
            html += `
                <div class="match-card ${statusClass}" style="margin: 0;">
                    <div class="match-header">
                        <div class="match-title">${match.name}</div>
                        <div class="match-subtitle">${match.venue || 'Venue TBA'} • ${match.date || 'Date TBA'}</div>
                    </div>
                    <div class="match-body">
                        <div class="teams-section">
                            ${this.renderTeams(match)}
                        </div>
                        <div class="match-status ${statusClass}">
                            ${match.status || 'Status Unknown'}
                        </div>
                        ${scoreText !== 'No score available' ? `
                            <div class="overs-progress">
                                ${this.renderProgressBar(match)}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        this.asiaCupMatches.innerHTML = html;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cricketApp = new CricketLiveScore();
});
