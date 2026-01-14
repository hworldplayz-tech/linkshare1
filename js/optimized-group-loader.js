/**
 * OPTIMIZED GROUP LOADER - Fixes caching and loading speed issues
 * Forces fresh data, implements lazy loading, and improves performance
 */

// Configuration
const CONFIG = {
    BATCH_SIZE: 12,
    INITIAL_LOAD: 12, // Load 12 groups initially as requested
    LAZY_THRESHOLD: '200px',
    FRESH_DATA_INTERVAL: 5 * 60 * 1000, // 5 minutes
    STATE_STORAGE_KEY: 'linkshare_user_state'
};

// Enhanced state management with persistence
let loadingState = {
    isLoading: false,
    hasMore: true,
    lastDoc: null,
    totalLoaded: 0,
    currentFilter: { topic: 'all', country: 'all', search: '' },
    allGroups: [],
    lastFreshLoad: 0,
    userPosition: 0
};

// State persistence functions
function saveUserState() {
    try {
        const stateToSave = {
            currentFilter: loadingState.currentFilter,
            totalLoaded: loadingState.totalLoaded,
            lastFreshLoad: loadingState.lastFreshLoad,
            userPosition: window.pageYOffset || 0
        };
        sessionStorage.setItem(CONFIG.STATE_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
        console.warn('Could not save user state:', e);
    }
}

function restoreUserState() {
    try {
        const saved = sessionStorage.getItem(CONFIG.STATE_STORAGE_KEY);
        if (saved) {
            const state = JSON.parse(saved);
            loadingState.currentFilter = state.currentFilter || { topic: 'all', country: 'all', search: '' };
            loadingState.lastFreshLoad = state.lastFreshLoad || 0;
            loadingState.userPosition = state.userPosition || 0;
            return state;
        }
    } catch (e) {
        console.warn('Could not restore user state:', e);
    }
    return null;
}

/**
 * MAIN OPTIMIZED LOADER - Smart caching with database search
 */
async function loadGroupsOptimized(topic = 'all', country = 'all', searchTerm = '', append = false) {
    console.log('🚀 OPTIMIZED LOADER: Starting with smart caching...');
    
    const container = document.querySelector('.groups-grid');
    if (!container) {
        console.error('❌ Groups container not found');
        return;
    }

    // Prevent multiple simultaneous loads
    if (loadingState.isLoading && !append) return;
    loadingState.isLoading = true;

    try {
        // Update filter state
        loadingState.currentFilter = { topic, country, search: searchTerm };
        saveUserState(); // Save user state

        // Initialize state for initial load
        if (!append) {
            // Show beautiful skeleton loading only for completely fresh loads
            if (container.children.length === 0) {
                container.innerHTML = window.generateSkeletonLoader ? window.generateSkeletonLoader() : '<div class="simple-loading">Loading groups...</div>';
            }
            loadingState.lastDoc = null;
            loadingState.totalLoaded = 0;
            loadingState.hasMore = true;
        }

        // Check Firebase connection
        if (!window.db || !window.firebaseInitialized) {
            throw new Error('Firebase not ready');
        }

        let groups = [];
        
        // If we have search term or filters, search entire database
        if (searchTerm || topic !== 'all' || country !== 'all') {
            console.log('🔍 Searching entire database...');
            groups = await searchEntireDatabase(topic, country, searchTerm);
            
            // For search results, show all at once but paginated for display
            const startIndex = append ? loadingState.totalLoaded : 0;
            const endIndex = startIndex + CONFIG.INITIAL_LOAD;
            const displayGroups = groups.slice(startIndex, endIndex);
            
            loadingState.hasMore = endIndex < groups.length;
            
            if (displayGroups.length === 0 && !append) {
                container.innerHTML = '<div class="no-groups">No groups found matching your search.<br><a href="/add-group" style="color: #25D366; text-decoration: none; font-weight: bold;">Be the first to add one!</a></div>';
                loadingState.isLoading = false;
                return;
            }
            
            // Only clear container if it has loading message or error, not existing groups
            if (!append) {
                const hasLoadingOrError = container.querySelector('.simple-loading, .skeleton-card, .beautiful-loading, .error-state, .no-groups');
                if (hasLoadingOrError) {
                    container.innerHTML = '';
                }
            }
            
            renderGroupsWithLazyLoading(displayGroups, container, append);
            loadingState.totalLoaded = endIndex;
            
        } else {
            // Regular pagination for all groups
            let query = window.db.collection('groups');
            
            // Use cache-first approach for better performance
            const queryOptions = { source: 'default' };
            
            // Order and paginate
            query = query.orderBy('timestamp', 'desc');
            
            if (loadingState.lastDoc && append) {
                query = query.startAfter(loadingState.lastDoc);
            }
            
            query = query.limit(append ? CONFIG.BATCH_SIZE : CONFIG.INITIAL_LOAD);

            console.log('📡 Fetching groups...');
            const startTime = performance.now();
            
            const snapshot = await query.get(queryOptions);
            
            const loadTime = performance.now() - startTime;
            console.log(`⚡ Groups loaded in ${loadTime.toFixed(2)}ms`);

            if (snapshot.empty && !append) {
                container.innerHTML = '<div class="no-groups">No groups available.<br><a href="/add-group" style="color: #25D366; text-decoration: none; font-weight: bold;">Add the first group!</a></div>';
                loadingState.isLoading = false;
                return;
            }

            // Process groups
            snapshot.forEach(doc => {
                groups.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Update pagination state
            if (groups.length > 0) {
                loadingState.lastDoc = snapshot.docs[snapshot.docs.length - 1];
                loadingState.hasMore = groups.length >= (append ? CONFIG.BATCH_SIZE : CONFIG.INITIAL_LOAD);
            } else {
                loadingState.hasMore = false;
            }

            // Only clear container if it has loading message or error, not existing groups
            if (!append) {
                const hasLoadingOrError = container.querySelector('.simple-loading, .skeleton-card, .beautiful-loading, .error-state, .no-groups');
                if (hasLoadingOrError) {
                    container.innerHTML = '';
                }
            }

            renderGroupsWithLazyLoading(groups, container, append);
            loadingState.totalLoaded += groups.length;
        }

        console.log(`📦 Processed ${groups.length} groups`);
        console.log(`✅ Total groups loaded: ${loadingState.totalLoaded}`);

        // Setup load more if needed
        setupLoadMore(container);
        
        // Update last fresh load time
        loadingState.lastFreshLoad = Date.now();
        saveUserState();

    } catch (error) {
        console.error('❌ Optimized loader error:', error);
        if (!append && container.children.length === 0) {
            // Show beautiful loading with auto-retry instead of error
            container.innerHTML = window.generateBeautifulLoading ? 
                window.generateBeautifulLoading('Connection Issue', 'Retrying automatically...') : 
                '<div class="simple-loading">Retrying...</div>';
            
            // Auto-retry after 2 seconds
            setTimeout(() => {
                if (container.innerHTML.includes('Connection Issue') || container.innerHTML.includes('Retrying')) {
                    loadGroupsOptimized(topic, country, searchTerm, false);
                }
            }, 2000);
        }
    } finally {
        loadingState.isLoading = false;
        
        // Remove any loading indicators
        const loadingElements = container.querySelectorAll('.optimized-loading, .loading-more, .skeleton-card, .beautiful-loading');
        loadingElements.forEach(el => el.remove());
    }
}

/**
 * OPTIMIZED DATABASE SEARCH - Fast and index-friendly with improved caching
 */
async function searchEntireDatabase(topic, country, searchTerm) {
    console.log(`🔍 Super-optimized database search: topic=${topic}, country=${country}, search="${searchTerm}"`);
    
    try {
        let allGroups = [];
        
        // IMPROVED STRATEGY: Use most selective filter first, then in-memory filtering
        // This completely avoids composite index requirements
        
        if (topic !== 'all' && country !== 'all') {
            // Both filters: Use category as primary filter (usually more selective)
            console.log('🚀 FAST: Using category-first strategy to avoid index issues...');
            
            try {
            // ALWAYS get fresh data from server - no cache (NO orderBy)
            const query = window.db.collection('groups')
                .where('category', '==', topic)
                .limit(200);
                
            const snapshot = await query.get({ source: 'server' });
                
                console.log(`📊 Category query returned ${snapshot.size} documents`);
                
                snapshot.forEach(doc => {
                    const data = doc.data();
                    // Fast in-memory country filter
                    if (data.country === country) {
                        allGroups.push({
                            id: doc.id,
                            ...data
                        });
                    }
                });
                
                console.log(`⚡ Found ${allGroups.length} groups matching both filters`);
                
            } catch (error) {
                console.warn('⚠️ Category filter failed, trying country filter:', error.message);
                
                // Fallback: try country filter instead - FRESH from server (NO orderBy)
                const query = window.db.collection('groups')
                    .where('country', '==', country)
                    .limit(100);
                    
                const snapshot = await query.get({ source: 'server' });
                
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.category === topic) {
                        allGroups.push({
                            id: doc.id,
                            ...data
                        });
                    }
                });
            }
            
        } else if (topic !== 'all') {
            // Only category filter - FRESH from server (NO orderBy to avoid index)
            console.log('⚡ FRESH: Category-only filter from server (no index needed)...');
            
            const query = window.db.collection('groups')
                .where('category', '==', topic)
                .limit(200);
                
            const snapshot = await query.get({ source: 'server' });
            
            snapshot.forEach(doc => {
                allGroups.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`🎯 Category filter returned ${allGroups.length} groups`);
            
        } else if (country !== 'all') {
            // Only country filter - FRESH data from server (NO orderBy)
            console.log('⚡ FRESH: Country-only filter from server (no index needed)...');
            
            const query = window.db.collection('groups')
                .where('country', '==', country)
                .limit(200);
                
            const snapshot = await query.get({ source: 'server' });
            
            snapshot.forEach(doc => {
                allGroups.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`🌍 Country filter returned ${allGroups.length} groups`);
            
        } else {
            // No filters - get FRESH recent groups from server
            console.log('⚡ FRESH: Getting recent groups from server...');
            
            const query = window.db.collection('groups')
                .orderBy('timestamp', 'desc')
                .limit(300);
                
            const snapshot = await query.get({ source: 'server' });
            
            snapshot.forEach(doc => {
                allGroups.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`📚 All groups query returned ${allGroups.length} groups`);
        }
        
        // Apply SUPER FAST text search if provided
        if (searchTerm && searchTerm.trim()) {
            const startTime = performance.now();
            const searchLower = searchTerm.toLowerCase().trim();
            const searchWords = searchLower.split(' ').filter(word => word.length > 1); // Ignore single chars
            
            console.log(`🔍 Starting search for: "${searchTerm}" (${searchWords.length} words)`);
            
            // ULTRA-FAST search algorithm
            allGroups = allGroups.filter(group => {
                // Pre-lowercase once for efficiency
                const title = (group.title || '').toLowerCase();
                const description = (group.description || '').toLowerCase();
                const category = (group.category || '').toLowerCase();
                
                // Short-circuit: if any word matches title (most important), include it
                if (searchWords.some(word => title.includes(word))) {
                    return true;
                }
                
                // Check description and category only if title didn't match
                const searchableText = `${description} ${category}`;
                return searchWords.some(word => searchableText.includes(word));
            });
            
            const searchTime = performance.now() - startTime;
            console.log(`⚡ Search completed in ${searchTime.toFixed(2)}ms, found ${allGroups.length} results`);
        }
        
        // IMPORTANT: Sort by timestamp in JavaScript (since we removed orderBy)
        console.log('📋 Sorting groups by timestamp in JavaScript...');
        allGroups.sort((a, b) => {
            try {
                const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp || Date.now());
                const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp || Date.now());
                return bTime - aTime; // Most recent first
            } catch (error) {
                console.warn('⚠️ Timestamp sorting error:', error);
                return 0;
            }
        });
        
        console.log(`⚡ Found ${allGroups.length} groups in optimized search`);
        return allGroups;
        
    } catch (error) {
        console.error('❌ Optimized search error:', error);
        
        // Fallback: Get all groups and filter in memory
        console.log('🔄 Using fallback search method...');
        try {
            const fallbackQuery = window.db.collection('groups')
                .orderBy('timestamp', 'desc')
                .limit(200);
                
            const snapshot = await fallbackQuery.get({ source: 'default' });
            let fallbackGroups = [];
            
            snapshot.forEach(doc => {
                fallbackGroups.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Apply all filters in memory
            if (topic !== 'all') {
                fallbackGroups = fallbackGroups.filter(group => group.category === topic);
            }
            if (country !== 'all') {
                fallbackGroups = fallbackGroups.filter(group => group.country === country);
            }
            if (searchTerm && searchTerm.trim()) {
                const searchLower = searchTerm.toLowerCase().trim();
                fallbackGroups = fallbackGroups.filter(group => {
                    const title = (group.title || '').toLowerCase();
                    const description = (group.description || '').toLowerCase();
                    return title.includes(searchLower) || description.includes(searchLower);
                });
            }
            
            console.log(`🛡️ Fallback search found ${fallbackGroups.length} groups`);
            return fallbackGroups;
            
        } catch (fallbackError) {
            console.error('❌ Fallback search also failed:', fallbackError);
            return [];
        }
    }
}

/**
 * LAZY LOADING RENDERER - Professional lazy loading implementation
 */
function renderGroupsWithLazyLoading(groups, container, append = false) {
    console.log('🎯 Rendering with professional lazy loading...');

    const fragment = document.createDocumentFragment();
    
    groups.forEach((group, index) => {
        const card = createOptimizedGroupCard(group, index);
        fragment.appendChild(card);
    });

    if (!append && groups.length > 0) {
        // For non-append renders, replace content smoothly
        // Remove loading messages and errors, but keep existing groups during update
        const loadingElements = container.querySelectorAll('.simple-loading, .skeleton-card, .beautiful-loading, .error-state, .no-groups');
        loadingElements.forEach(el => el.remove());
        
        // If container was empty or only had loading/error messages, clear it
        if (container.children.length === 0) {
            container.innerHTML = '';
        }
    }

    container.appendChild(fragment);

    // Setup lazy loading observers
    setupLazyLoadingObservers();
}

/**
 * CREATE OPTIMIZED GROUP CARD - Fast rendering
 */
function createOptimizedGroupCard(group, index) {
    const card = document.createElement('div');
    card.className = 'group-card lazy-card';
    card.setAttribute('data-group-id', group.id);
    card.setAttribute('data-category', (group.category || 'general').toLowerCase());
    card.setAttribute('data-country', (group.country || 'global').toLowerCase());
    
    // Add stagger animation delay
    card.style.setProperty('--stagger-delay', `${index * 50}ms`);

    // IMPROVED image handling - avoid 403 errors
    let imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';
    
    if (group.image) {
        // Check for problematic domains that cause 403 errors
        const problematicDomains = [
            'whatsapp.net', 'fbcdn.net', 'facebook.com', 
            'cdninstagram.com', 'fbsbx.com', 'scontent'
        ];
        
        const hasProblematicDomain = problematicDomains.some(domain => 
            group.image.toLowerCase().includes(domain)
        );
        
        if (!hasProblematicDomain) {
            // Safe to use this image
            imageUrl = group.image;
        }
    }

    // Time formatting
    let timeDisplay = 'Recently added';
    try {
        if (group.timestamp) {
            const date = group.timestamp.toDate ? group.timestamp.toDate() : new Date(group.timestamp);
            timeDisplay = formatTimeAgo(date);
        }
    } catch (e) {
        // Keep default
    }

    card.innerHTML = `
        <div class="card-image">
            <img class="lazy-image" 
                 data-src="${imageUrl}" 
                 alt="${group.title || 'Group'}" 
                 loading="lazy"
                 onerror="this.onerror=null; this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';">
            <div class="image-placeholder">
                <i class="fab fa-whatsapp"></i>
            </div>
        </div>
        <div class="group-badges">
            <span class="category-badge">${group.category || 'General'}</span>
            <span class="country-badge">${group.country || 'Global'}</span>
        </div>
        <h3 class="card-title">${group.title || 'WhatsApp Group'}</h3>
        <p class="card-description">${group.description || 'Join this WhatsApp group for discussions'}</p>
        <div class="card-actions">
            <a href="${group.link || group.group_url}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="join-btn"
               onclick="updateGroupViews('${group.id}')">
                <i class="fab fa-whatsapp"></i>
                <span>Join Group</span>
            </a>
        </div>
        <div class="card-footer">
            <div class="views-count">
                <i class="fas fa-eye"></i>
                <span>${group.views || 0}</span> views
            </div>
            <div class="date-added">${timeDisplay}</div>
        </div>
    `;

    return card;
}

/**
 * LAZY LOADING OBSERVERS - Professional implementation
 */
function setupLazyLoadingObservers() {
    // Image lazy loading
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const placeholder = img.parentElement.querySelector('.image-placeholder');
                
                img.src = img.dataset.src;
                img.onload = () => {
                    img.classList.add('loaded');
                    placeholder.style.display = 'none';
                };
                img.onerror = () => {
                    img.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';
                    img.classList.add('loaded');
                    placeholder.style.display = 'none';
                };
                
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: CONFIG.LAZY_THRESHOLD,
        threshold: 0.1
    });

    // Card animation observer
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                cardObserver.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '50px',
        threshold: 0.1
    });

    // Apply observers
    document.querySelectorAll('.lazy-image:not([src])').forEach(img => {
        imageObserver.observe(img);
    });

    document.querySelectorAll('.lazy-card:not(.visible)').forEach(card => {
        cardObserver.observe(card);
    });
}

/**
 * LOAD MORE FUNCTIONALITY
 */
function setupLoadMore(container) {
    // Remove existing load more button
    const existingBtn = container.parentElement?.querySelector('.load-more-btn');
    if (existingBtn) existingBtn.remove();

    // Add new load more button if there are more groups
    if (loadingState.hasMore && loadingState.totalLoaded >= CONFIG.INITIAL_LOAD) {
        const loadMoreContainer = document.createElement('div');
        loadMoreContainer.className = 'load-more-container';
        loadMoreContainer.innerHTML = `
            <button class="load-more-btn optimized" onclick="loadMoreGroups()">
                <span class="btn-text">
                    <i class="fas fa-plus"></i>
                    Load More Groups
                </span>
                <span class="btn-loading" style="display: none;">
                    <i class="fas fa-spinner fa-spin"></i>
                    Loading...
                </span>
            </button>
        `;
        
        container.parentElement.appendChild(loadMoreContainer);
    }
}

/**
 * LOAD MORE HANDLER - Updated for new system
 */
async function loadMoreGroups() {
    const btn = document.querySelector('.load-more-btn');
    if (!btn || loadingState.isLoading) return;

    // Update button state
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');
    btnText.style.display = 'none';
    btnLoading.style.display = 'block';
    btn.disabled = true;

    try {
        await loadGroupsOptimized(
            loadingState.currentFilter.topic,
            loadingState.currentFilter.country,
            loadingState.currentFilter.search,
            true
        );
    } finally {
        // Reset button state
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        btn.disabled = false;
    }
}

/**
 * UTILITY FUNCTIONS
 */
function formatTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    console.log('🕰️ Time calculation:', { now, date, seconds });
    
    if (seconds < 30) return 'Just now'; // Only show 'just now' for less than 30 seconds
    if (seconds < 60) return Math.floor(seconds) + ' seconds ago';
    if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        return minutes === 1 ? '1 minute ago' : minutes + ' minutes ago';
    }
    if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        return hours === 1 ? '1 hour ago' : hours + ' hours ago';
    }
    if (seconds < 2592000) {
        const days = Math.floor(seconds / 86400);
        return days === 1 ? '1 day ago' : days + ' days ago';
    }
    if (seconds < 31536000) {
        const months = Math.floor(seconds / 2592000);
        return months === 1 ? '1 month ago' : months + ' months ago';
    }
    const years = Math.floor(seconds / 31536000);
    return years === 1 ? '1 year ago' : years + ' years ago';
}

/**
 * SMART INITIALIZATION - Handles state restoration
 */
function initializeSmartLoader() {
    console.log('⚡ Initializing Smart Loader...');
    
    const savedState = restoreUserState();
    
    // ALWAYS load ALL groups by default - no filter persistence
    console.log('🆕 Loading ALL groups by default (no filters)...');
    
    // Clear any saved state to prevent auto-selection
    sessionStorage.removeItem(CONFIG.STATE_STORAGE_KEY);
    
    // Reset to default state
    loadingState.currentFilter = { topic: 'all', country: 'all', search: '' };
    
    // Load ALL groups without any filters
    loadGroupsOptimized('all', 'all', '');
}

/**
 * UPDATE UI FILTERS - Syncs saved filters with UI (IMPROVED)
 */
function updateUIFilters(filters) {
    console.log('🔄 Updating UI filters:', filters);
    
    // Update search input
    const searchInput = document.querySelector('#searchGroups');
    if (searchInput && filters.search) {
        searchInput.value = filters.search;
        console.log('🔍 Updated search input:', filters.search);
    }
    
    // Update topic/category filter
    if (filters.topic && filters.topic !== 'all') {
        const topicBtn = document.querySelector('#topicFilters')?.closest('.dropdown')?.querySelector('.dropdown-btn');
        const topicItem = document.querySelector(`#topicFilters .filter-btn[data-category="${filters.topic}"]`);
        
        if (topicBtn && topicItem) {
            // Update button text
            topicBtn.innerHTML = `${topicItem.textContent.trim()} <i class="fas fa-chevron-down"></i>`;
            
            // Update active states
            document.querySelectorAll('#topicFilters .filter-btn').forEach(btn => btn.classList.remove('active'));
            topicItem.classList.add('active');
            
            console.log('🏷️ Updated topic filter:', filters.topic, '->', topicItem.textContent.trim());
        } else {
            console.warn('⚠️ Topic filter elements not found:', { topicBtn: !!topicBtn, topicItem: !!topicItem });
        }
    }
    
    // Update country filter
    if (filters.country && filters.country !== 'all') {
        const countryBtn = document.querySelector('#countryFilters')?.closest('.dropdown')?.querySelector('.dropdown-btn');
        const countryItem = document.querySelector(`#countryFilters .filter-btn[data-country="${filters.country}"]`);
        
        if (countryBtn && countryItem) {
            // Update button text
            countryBtn.innerHTML = `${countryItem.textContent.trim()} <i class="fas fa-chevron-down"></i>`;
            
            // Update active states
            document.querySelectorAll('#countryFilters .filter-btn').forEach(btn => btn.classList.remove('active'));
            countryItem.classList.add('active');
            
            console.log('🌍 Updated country filter:', filters.country, '->', countryItem.textContent.trim());
        } else {
            console.warn('⚠️ Country filter elements not found:', { countryBtn: !!countryBtn, countryItem: !!countryItem });
        }
    }
    
    // Also update global state for other scripts
    if (window.main) {
        window.currentTopic = filters.topic;
        window.currentCountry = filters.country;
    }
}

/**
 * CLEAR CACHE FUNCTION - Use this to force refresh
 */
function clearGroupsCache() {
    console.log('🗑️ Clearing all groups cache...');
    
    // Clear session storage
    sessionStorage.removeItem(CONFIG.STATE_STORAGE_KEY);
    
    // Reset state
    loadingState = {
        isLoading: false,
        hasMore: true,
        lastDoc: null,
        totalLoaded: 0,
        currentFilter: { topic: 'all', country: 'all', search: '' },
        allGroups: [],
        lastFreshLoad: 0,
        userPosition: 0
    };
    
    // Force fresh data load
    loadGroupsOptimized();
}

// Make functions globally available
window.loadGroupsOptimized = loadGroupsOptimized;
window.loadMoreGroups = loadMoreGroups;
window.clearGroupsCache = clearGroupsCache;
window.initializeSmartLoader = initializeSmartLoader;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('⚡ Optimized Group Loader initialized');
    
    // Use smart initialization immediately - NO DELAY
    initializeSmartLoader();
});

// Visibility change handler - DISABLED to prevent blinking
// document.addEventListener('visibilitychange', () => {
//     if (!document.hidden) {
//         console.log('👁️ Page became visible - refreshing groups silently...');
//         
//         // Refresh data when page becomes visible without loading messages
//         const searchInput = document.querySelector('#searchGroups');
//         const currentSearch = searchInput ? searchInput.value : '';
//         
//         loadGroupsOptimized(
//             loadingState.currentFilter.topic,
//             loadingState.currentFilter.country,
//             currentSearch
//         );
//     }
// });

// Save state before user leaves
window.addEventListener('beforeunload', () => {
    saveUserState();
});

console.log('🚀 OPTIMIZED GROUP LOADER: Ready for fresh data loading!');
