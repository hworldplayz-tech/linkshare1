/**
 * Real-time Group Loader - Forces fresh data on every load
 * Completely bypasses all caching mechanisms
 */

// Force reload groups every time without any caching
async function loadGroupsRealtime() {
    console.log('⚡ REALTIME: Loading groups with zero cache tolerance...');
    
    let groupsGrid = document.getElementById('groupsGrid') || document.querySelector('.groups-grid');
    if (!groupsGrid) {
        console.error('❌ REALTIME: Groups grid not found');
        return;
    }
    
    // Show graceful loading state without immediate error
    groupsGrid.innerHTML = '<div class="loading-spinner">🔄 Loading groups...</div>';
    
    try {
        // Generate unique cache buster for this exact request
        const uniqueId = Date.now() + '_' + Math.random().toString(36).substr(2, 9) + '_' + performance.now();
        const antiCache = {
            t: Date.now(),
            r: Math.random(),
            cb: uniqueId,
            nocache: 'true',
            fresh: '1',
            realtime: 'force'
        };
        
        const queryString = Object.entries(antiCache)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
            
        const apiUrl = `/api/groups?${queryString}`;
        
        console.log('📡 REALTIME: Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('📊 REALTIME: Got fresh data:', result);
        
        if (result.success && result.groups) {
            if (result.groups.length > 0) {
            console.log(`✅ REALTIME: Got ${result.groups.length} groups, sorting by date...`);
            
            // Sort groups by creation date (newest first)
            const sortedGroups = result.groups.sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
                const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
                return dateB.getTime() - dateA.getTime();
            });
            
            console.log(`✅ REALTIME: Rendering ${sortedGroups.length} sorted groups`);
            renderGroupsInstantly(sortedGroups, groupsGrid);
            
            } else {
                // Show friendly message for empty groups
                groupsGrid.innerHTML = `
                    <div class="empty-state" style="
                        text-align: center; padding: 3rem; color: #666;
                        background: white; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    ">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">📱</div>
                        <h3 style="margin-bottom: 1rem; color: #333;">No Groups Found</h3>
                        <p style="margin-bottom: 1.5rem;">Be the first to add a WhatsApp group!</p>
                        <a href="/add-group" style="
                            background: #25d366; color: white; padding: 12px 24px;
                            border-radius: 25px; text-decoration: none; font-weight: 600;
                            display: inline-block; transition: all 0.3s ease;
                        ">Add First Group</a>
                    </div>
                `;
                console.log('📭 No groups found, showing empty state');
            }
        } else {
            throw new Error('Failed to load groups from server');
        }
        
    } catch (error) {
        console.error('❌ REALTIME: Failed to load groups:', error);
        // Show more graceful fallback without alarming user
        groupsGrid.innerHTML = `
            <div class="loading-fallback" style="
                text-align: center; padding: 3rem; color: #666;
                background: white; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            ">
                <div style="font-size: 2rem; margin-bottom: 1rem;">🔄</div>
                <h3 style="margin-bottom: 1rem; color: #333;">Loading Groups...</h3>
                <p style="margin-bottom: 1.5rem;">Please wait while we fetch the latest groups</p>
                <button onclick="loadGroupsRealtime()" style="
                    background: #25d366; color: white; 
                    border: none; padding: 12px 24px; 
                    border-radius: 25px; cursor: pointer; font-weight: 600;
                    transition: all 0.3s ease;
                ">Refresh Groups</button>
            </div>
        `;
        
        // Auto retry after 2 seconds silently
        setTimeout(() => {
            console.log('🔄 Auto-retrying group load...');
            loadGroupsRealtime();
        }, 2000);
    }
}

// Render groups with optimized performance
function renderGroupsInstantly(groups, container) {
    console.log(`🎯 REALTIME: Rendering ${groups.length} groups instantly`);
    
    // Clear and prepare container
    container.innerHTML = '';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
    container.style.gap = '1.5rem';
    container.style.padding = '1rem 0';
    
    // Create document fragment for efficient DOM manipulation
    const fragment = document.createDocumentFragment();
    
    groups.forEach((group, index) => {
        const card = createRealtimeGroupCard(group);
        fragment.appendChild(card);
    });
    
    container.appendChild(fragment);
    console.log(`✅ REALTIME: Successfully rendered ${groups.length} groups`);
}

// Create optimized group card for realtime display
function createRealtimeGroupCard(group) {
    const card = document.createElement('div');
    card.className = 'group-card realtime-loaded';
    card.setAttribute('data-group-id', group.id);
    
    // Enhanced image handling with better fallbacks
    let imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';
    
    // Check if group has a valid image
    if (group.image_url && 
        group.image_url !== 'null' && 
        group.image_url !== '' && 
        group.image_url !== 'undefined' && 
        group.image_url.length > 10) {
        
        // Use the group's image if it exists
        imageUrl = group.image_url;
        console.log(`🖼️ Using group image: ${imageUrl.substring(0, 50)}...`);
    } else {
        console.log(`📷 No valid image for group: ${group.title}, using default WhatsApp logo`);
    }
    
    // Format time display
    let timeDisplay = 'Recently added';
    if (group.created_at) {
        try {
            const date = new Date(group.created_at);
            if (!isNaN(date.getTime())) {
                timeDisplay = formatTimeAgo(date);
            }
        } catch (e) {
            console.warn('Date parsing error:', e);
        }
    }
    
    card.innerHTML = `
        <div class="card-image">
            <img src="${imageUrl}" alt="${group.title || 'Group'}" loading="lazy" 
                 onerror="this.onerror=null; this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';">
        </div>
        <div class="group-badges">
            <span class="category-badge">${group.category || 'General'}</span>
            <span class="country-badge">${group.country || 'Global'}</span>
        </div>
        <h3>${group.title || 'WhatsApp Group'}</h3>
        <p>${group.description || 'Join this WhatsApp group for discussions'}</p>
        <div class="card-actions">
            <a href="${group.group_url || '#'}" target="_blank" rel="noopener noreferrer" class="join-btn">
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

// Time formatting helper
function formatTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
        }
    }
    
    return 'Just now';
}

// Auto-load on page ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGroupsRealtime);
} else {
    loadGroupsRealtime();
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
@keyframes fadeInOut {
    0%, 100% { opacity: 0; transform: translateY(-20px); }
    20%, 80% { opacity: 1; transform: translateY(0); }
}
.realtime-loaded {
    animation: slideInUp 0.3s ease-out;
}
@keyframes slideInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(style);

// Export for global access
window.loadGroupsRealtime = loadGroupsRealtime;

console.log('⚡ Real-time Group Loader initialized');