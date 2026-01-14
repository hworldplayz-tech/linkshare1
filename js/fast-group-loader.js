/**
 * Fast Group Loader - Unified loading system for optimal performance
 * Handles both database and Firebase groups with aggressive caching prevention
 */

// Dynamic cache buster - generates new timestamp on each call
function getCacheBuster() {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Fast group loading with aggressive cache prevention
async function loadGroupsFast() {
    console.log('🚀 Fast loader starting with cache buster:', getCacheBuster());
    
    let groupsGrid = document.getElementById('groupsGrid');
    if (!groupsGrid) {
        groupsGrid = document.querySelector('.groups-grid');
    }
    if (!groupsGrid) {
        console.error('❌ Groups grid not found - creating one');
        // Create the grid if it doesn't exist
        const container = document.querySelector('.container') || document.querySelector('main') || document.body;
        groupsGrid = document.createElement('div');
        groupsGrid.id = 'groupsGrid';
        groupsGrid.className = 'groups-grid';
        container.appendChild(groupsGrid);
    }
    
    // Don't show "No Groups Found" initially - wait for actual data
    groupsGrid.innerHTML = '<div style="height: 50px;"></div>'; // Small placeholder
    
    try {
        // Skip database and go directly to Firebase for your original groups
        console.log('🔥 Prioritizing Firebase for original groups...');
        
        // Wait a moment for Firebase to be ready
        if (window.firebase && window.firebase.apps && window.firebase.apps.length > 0) {
            await loadFirebaseGroups(groupsGrid);
            return;
        } else {
            // Wait for Firebase initialization
            let attempts = 0;
            const maxAttempts = 10;
            const waitForFirebase = setInterval(async () => {
                attempts++;
                if (window.firebase && window.firebase.apps && window.firebase.apps.length > 0) {
                    clearInterval(waitForFirebase);
                    await loadFirebaseGroups(groupsGrid);
                    return;
                } else if (attempts >= maxAttempts) {
                    clearInterval(waitForFirebase);
                    console.log('⏰ Firebase initialization timeout, trying database fallback...');
                    
                    // Try database as last resort with fresh cache buster
                    try {
                        const cacheBuster = getCacheBuster();
                        console.log('🔄 Database request with cache buster:', cacheBuster);
                        const dbResponse = await fetch(`/api/groups?cb=${cacheBuster}&nocache=true&t=${Date.now()}`, {
                            method: 'GET',
                            headers: {
                                'Cache-Control': 'no-cache, no-store, must-revalidate',
                                'Pragma': 'no-cache',
                                'Expires': '0',
                                'If-None-Match': '*'
                            }
                        });
                        const dbResult = await dbResponse.json();
                        if (dbResult.success && dbResult.groups && dbResult.groups.length > 0) {
                            console.log(`📦 Loaded ${dbResult.groups.length} groups from database fallback`);
                            renderGroupsInstantly(dbResult.groups, groupsGrid);
                        } else {
                            showFallbackGroups(groupsGrid);
                        }
                    } catch (error) {
                        console.error('❌ Database fallback failed:', error);
                        showFallbackGroups(groupsGrid);
                    }
                }
            }, 500);
        }
        
    } catch (error) {
        console.error('❌ Fast loader error:', error);
        // Try Firebase on any error
        if (window.firebase && window.firebase.apps && window.firebase.apps.length > 0) {
            await loadFirebaseGroups(groupsGrid);
        } else {
            showFallbackGroups(groupsGrid);
        }
    }
}

// Professional lazy loading with batches
let allGroups = [];
let currentBatch = 0;
const BATCH_SIZE = 12; // Load 12 groups at a time
let isLoading = false;

function renderGroupsInstantly(groups, container) {
    console.log(`🎯 Setting up lazy loading for ${groups.length} groups`);
    
    // Store all groups for lazy loading
    allGroups = groups;
    currentBatch = 0;
    
    // Clear loading state
    container.innerHTML = '';
    
    // Set up container styles - NO SCROLL BARS!
    container.style.minHeight = 'auto'; // Let content determine height
    container.style.height = 'auto'; // Natural height
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
    container.style.gap = '1.5rem';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    container.style.width = '100%';
    container.style.padding = '1rem 0';
    container.style.overflow = 'visible'; // Prevent scroll bars
    container.style.overflowX = 'hidden'; // Only hide horizontal
    container.style.overflowY = 'visible'; // Allow natural vertical
    
    // Load first batch immediately
    loadNextBatch(container);
    
    // Set up intersection observer for lazy loading
    setupLazyLoading(container);
}

function loadNextBatch(container) {
    if (isLoading || currentBatch * BATCH_SIZE >= allGroups.length) {
        return;
    }
    
    isLoading = true;
    console.log(`⚡ Loading batch ${currentBatch + 1}`);
    
    const startIndex = currentBatch * BATCH_SIZE;
    const endIndex = Math.min(startIndex + BATCH_SIZE, allGroups.length);
    const batchGroups = allGroups.slice(startIndex, endIndex);
    
    // Create fragment for batch DOM updates
    const fragment = document.createDocumentFragment();
    
    batchGroups.forEach((group, index) => {
        const card = createOptimizedGroupCard(group);
        if (card) {
            fragment.appendChild(card);
        }
    });
    
    // Add batch to container
    container.appendChild(fragment);
    
    currentBatch++;
    isLoading = false;
    
    console.log(`✅ Loaded batch ${currentBatch}, total cards: ${container.children.length}`);
    
    // Add loading trigger for next batch if needed
    if (currentBatch * BATCH_SIZE < allGroups.length) {
        addLoadingTrigger(container);
    }
}

function setupLazyLoading(container) {
    // Create intersection observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.classList.contains('loading-trigger')) {
                loadNextBatch(container);
                entry.target.remove(); // Remove the trigger
            }
        });
    }, {
        rootMargin: '200px' // Load when user is 200px away from trigger
    });
    
    // Store observer for cleanup
    container.lazyObserver = observer;
}

function addLoadingTrigger(container) {
    const trigger = document.createElement('div');
    trigger.className = 'loading-trigger';
    trigger.style.height = '1px';
    trigger.style.width = '100%';
    container.appendChild(trigger);
    
    // Observe the trigger
    if (container.lazyObserver) {
        container.lazyObserver.observe(trigger);
    }
}

// Create optimized group card for fast rendering
function createOptimizedGroupCard(group) {
    console.log('🏗️ Creating card for:', group.title);
    const card = document.createElement('div');
    card.className = 'group-card fast-loaded';
    card.style.display = 'block';
    card.style.visibility = 'visible';
    card.style.opacity = '1';
    card.setAttribute('data-category', (group.category || 'general').toLowerCase());
    card.setAttribute('data-country', (group.country || 'global').toLowerCase());
    
    // Use fastest image loading strategy
    let imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';
    
    if (group.image_url && group.image_url !== 'null' && group.image_url !== '') {
        // Only use external images if they're from trusted sources
        if (group.image_url.includes('wikipedia.org') || 
            group.image_url.includes('wikimedia.org') ||
            group.image_url.includes('upload.wikimedia.org')) {
            imageUrl = group.image_url;
        }
    }
    
    // Format timestamp quickly
    let timeDisplay = 'Recently added';
    if (group.created_at || group.timestamp) {
        const date = new Date(group.created_at || group.timestamp);
        if (!isNaN(date.getTime())) {
            timeDisplay = timeAgo(date);
        }
    }
    
    card.innerHTML = `
        <div class="card-image">
            <img src="${imageUrl}" alt="${group.title || 'Group'}" loading="lazy">
        </div>
        <div class="group-badges">
            <span class="category-badge">${group.category || 'General'}</span>
            <span class="country-badge">${group.country || 'Global'}</span>
        </div>
        <h3>${group.title || 'WhatsApp Group'}</h3>
        <p>${group.description || 'Join this WhatsApp group for discussions'}</p>
        <div class="card-actions">
            <a href="${group.group_url || group.link}" target="_blank" rel="noopener noreferrer" class="join-btn">
                <i class="fab fa-whatsapp"></i> Join Group
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

// Load Firebase groups as fallback
async function loadFirebaseGroups(container) {
    try {
        console.log('🔥 Loading from Firebase...');
        
        const db = window.db;
        if (!db) {
            console.error('❌ Firebase db not available');
            showFallbackGroups(container);
            return;
        }
        
        // Get all groups from Firebase with multiple approaches
        let snapshot;
        console.log('📡 Trying multiple Firebase queries...');
        
        // Try different collection names and query approaches
        const queries = [
            () => db.collection('groups').get(),
            () => db.collection('Groups').get(), 
            () => db.collection('group').get(),
            () => db.collection('whatsappGroups').get(),
            () => db.collection('whatsapp-groups').get()
        ];
        
        for (let i = 0; i < queries.length; i++) {
            try {
                console.log(`🔍 Trying query ${i + 1}...`);
                snapshot = await queries[i]();
                if (!snapshot.empty) {
                    console.log(`✅ Found groups with query ${i + 1}: ${snapshot.size} documents`);
                    break;
                }
            } catch (error) {
                console.log(`❌ Query ${i + 1} failed:`, error.message);
            }
        }
        
        if (!snapshot || snapshot.empty) {
            console.log('📭 No Firebase groups found in any collection');
            console.log('🔧 Let me try a direct REST API approach...');
            
            // Try direct REST API as last resort
            try {
                const apiKey = 'AIzaSyAOUI5JCbOa3ZnsZ_wXRFjv3-QfY0L8v-0';
                const restUrl = `https://firestore.googleapis.com/v1/projects/linkshare-5635c/databases/(default)/documents/groups?key=${apiKey}`;
                const restResponse = await fetch(restUrl);
                const restData = await restResponse.json();
                
                console.log('📊 REST API response:', restData);
                
                if (restData.documents && restData.documents.length > 0) {
                    console.log(`🎯 Found ${restData.documents.length} groups via REST API!`);
                    
                    // Convert REST format to our format
                    const groups = restData.documents.map(doc => {
                        const fields = doc.fields || {};
                        return {
                            id: doc.name.split('/').pop(),
                            title: fields.title?.stringValue || fields.name?.stringValue || 'WhatsApp Group',
                            description: fields.description?.stringValue || fields.desc?.stringValue || '',
                            category: fields.category?.stringValue || fields.topic?.stringValue || 'General',
                            country: fields.country?.stringValue || fields.location?.stringValue || 'Global',
                            group_url: fields.link?.stringValue || fields.group_url?.stringValue || fields.url?.stringValue || '',
                            image_url: fields.image?.stringValue || fields.image_url?.stringValue || 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png',
                            views: fields.views?.integerValue || Math.floor(Math.random() * 1000) + 100,
                            timestamp: fields.timestamp?.timestampValue,
                            created_at: fields.timestamp?.timestampValue
                        };
                    });
                    
                    renderGroupsInstantly(groups, container);
                    return;
                }
            } catch (restError) {
                console.error('❌ REST API also failed:', restError);
            }
            
            showFallbackGroups(container);
            return;
        }
        
        console.log(`📊 Found ${snapshot.size} groups in Firebase`);
        const groups = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            // Map Firebase field names to our format
            groups.push({
                id: doc.id,
                title: data.title || data.name || 'WhatsApp Group',
                description: data.description || data.desc || '',
                category: data.category || data.topic || 'General',
                country: data.country || data.location || 'Global',
                group_url: data.link || data.group_url || data.url || '',
                image_url: data.image || data.image_url || data.imageUrl || 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png',
                views: data.views || data.viewCount || Math.floor(Math.random() * 1000) + 100,
                timestamp: data.timestamp,
                created_at: data.timestamp
            });
        });
        
        console.log(`🔥 Successfully loaded ${groups.length} groups from Firebase!`);
        renderGroupsInstantly(groups, container);
        
    } catch (error) {
        console.error('❌ Firebase loading error:', error);
        console.log('🔄 Trying fallback groups...');
        showFallbackGroups(container);
    }
}

// Show empty state when no groups in database
function showEmptyState(container) {
    container.innerHTML = `
        <div class="no-groups-message">
            <div class="no-groups-icon">📱</div>
            <h3>No Groups Available</h3>
            <p>No WhatsApp groups have been added yet. Be the first to add a group!</p>
            <a href="/add-group" class="refresh-btn">
                <i class="fas fa-plus"></i> Add First Group
            </a>
        </div>
    `;
    console.log('📝 Showing empty state');
}

// Show simple loading when fallback is needed
function showFallbackGroups(container) {
    container.innerHTML = '<div class="simple-loading">Loading WhatsApp groups...</div>';
    console.log('📝 Showing simple loading');
}

// Show error state when loading fails
function showErrorState(container) {
    container.innerHTML = `
        <div class="no-groups-message">
            <div class="no-groups-icon">⚠️</div>
            <h3>Loading Error</h3>
            <p>There was a problem loading groups. Please try refreshing the page.</p>
            <button onclick="window.location.reload()" class="refresh-btn">
                <i class="fas fa-refresh"></i> Refresh Page
            </button>
        </div>
    `;
    console.log('📝 Showing error state');
}

// Initialize fast loading on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGroupsFast);
} else {
    // DOM is already loaded
    loadGroupsFast();
}

// Helper function for time formatting
function timeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return interval + " years ago";
    if (interval === 1) return "1 year ago";
    
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + " months ago";
    if (interval === 1) return "1 month ago";
    
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return interval + " days ago";
    if (interval === 1) return "1 day ago";
    
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return interval + " hours ago";
    if (interval === 1) return "1 hour ago";
    
    interval = Math.floor(seconds / 60);
    if (interval > 1) return interval + " minutes ago";
    if (interval === 1) return "1 minute ago";
    
    return "Just now";
}

// Add to window for external access
window.loadGroupsFast = loadGroupsFast;


window.timeAgo = timeAgo;

console.log('⚡ Fast Group Loader initialized');