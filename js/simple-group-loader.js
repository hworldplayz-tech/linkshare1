/**
 * Simple Group Loader - Directly loads and displays groups from Firebase
 */

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAOUI5JCbOa3ZnsZ_wXRFjv3-QfY0L8v-0",
    authDomain: "linkshare-5635c.firebaseapp.com",
    projectId: "linkshare-5635c",
    storageBucket: "linkshare-5635c.appspot.com",
    messagingSenderId: "119032426237",
    appId: "1:119032426237:web:98d085bd9bd1a63c1ed894",
    measurementId: "G-5VEQPNG163"
};

// Initialize Firebase
let db;

try {
    // Check if Firebase is already initialized
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    } else {
        firebase.app(); // if already initialized, use that one
    }
    
    // Initialize Firestore
    db = firebase.firestore();
    
    // Enable offline persistence
    db.enablePersistence({synchronizeTabs: true})
        .catch((err) => {
            console.error('Error enabling offline persistence:', err);
        });
    
    console.log('Firebase initialized successfully');
    
    // Start loading groups
    document.addEventListener('DOMContentLoaded', loadGroupsDirectly);
    
} catch (error) {
    console.error('Error initializing Firebase:', error);
    showError('Failed to initialize. Please refresh the page.');
}

async function loadGroupsDirectly() {
    const groupsGrid = document.getElementById('groupsGrid');
    if (!groupsGrid) {
        console.error('Groups grid element not found');
        return;
    }

    try {
        // Show simple loading message
        groupsGrid.innerHTML = '<div class="loading">Loading groups...</div>';
        
        console.log('Fetching groups from Firestore...');
        
        // Get groups from Firestore
        const querySnapshot = await db
            .collection('groups')
            .where('status', '==', 'approved')
            .orderBy('created_at', 'desc')
            .limit(50)
            .get()
            .catch(error => {
                console.error('Firestore query error:', error);
                throw error;
            });

        console.log(`Found ${querySnapshot.size} groups`);

        if (querySnapshot.empty) {
            groupsGrid.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 2rem; color: #666;">
                    <p>No groups found. Be the first to add one!</p>
                    <a href="/add-group" class="btn" style="
                        display: inline-block;
                        margin-top: 1rem;
                        padding: 0.5rem 1.5rem;
                        background: #25d366;
                        color: white;
                        text-decoration: none;
                        border-radius: 4px;
                    ">Add Group</a>
                </div>`;
            return;
        }

        // Clear loading message
        groupsGrid.innerHTML = '';
        
        // Process and display groups
        const groups = [];
        querySnapshot.forEach(doc => {
            const group = { 
                id: doc.id, 
                ...doc.data(),
                // Ensure all required fields have defaults
                title: doc.data().title || 'Untitled Group',
                description: doc.data().description || 'Join our WhatsApp group',
                category: doc.data().category || 'General',
                country: doc.data().country || 'Global',
                views: doc.data().views || 0,
                created_at: doc.data().created_at || new Date()
            };
            groups.push(group);
        });
        
        // Sort groups by creation date (newest first) if not already sorted
        groups.sort((a, b) => {
            const dateA = a.created_at.toDate ? a.created_at.toDate() : new Date(a.created_at);
            const dateB = b.created_at.toDate ? b.created_at.toDate() : new Date(b.created_at);
            return dateB - dateA;
        });
        
        // Add groups to the grid
        groups.forEach(group => {
            const groupCard = createGroupCard(group);
            if (groupCard) {
                groupsGrid.appendChild(groupCard);
            }
        });

    } catch (error) {
        console.error('Error loading groups:', error);
        showError('Failed to load groups. Please check your connection and refresh the page.');
    }
}

// Function to show error messages
function showError(message) {
    const groupsGrid = document.getElementById('groupsGrid');
    if (!groupsGrid) return;
    
    groupsGrid.innerHTML = `
        <div class="error-message" style="
            text-align: center;
            padding: 2rem;
            color: #721c24;
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
            margin: 1rem 0;
            max-width: 600px;
            margin: 0 auto;
        ">
            <p style="margin: 0 0 1rem 0;">${message}</p>
            <button onclick="window.location.reload()" style="
                background: #dc3545;
                color: white;
                border: none;
                padding: 0.5rem 1.5rem;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 500;
            ">
                Refresh Page
            </button>
        </div>`;
}

function createGroupCard(group) {
    if (!group || !group.link) {
        console.warn('Invalid group data:', group);
        return null;
    }
    
    try {
        const card = document.createElement('div');
        card.className = 'group-card';
        card.style.cssText = `
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            display: flex;
            flex-direction: column;
            height: 100%;
        `;
        
        // Format date
        let dateDisplay = 'Recently added';
        if (group.created_at) {
            try {
                const date = group.created_at.toDate ? group.created_at.toDate() : new Date(group.created_at);
                dateDisplay = formatDate(date);
            } catch (e) {
                console.warn('Error formatting date:', e);
            }
        }
        
        // Ensure image URL is valid
        let imageUrl = group.image || '/favicon-96x96.png';
        if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
            imageUrl = '/favicon-96x96.png';
        }
        
        // Create card HTML with inline styles for reliability
        card.innerHTML = `
            <div style="
                height: 160px;
                background: #f0f2f5;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            ">
                <img src="${imageUrl}" 
                     alt="${group.title || 'Group'}" 
                     style="
                         width: 100%;
                         height: 100%;
                         object-fit: cover;
                         transition: transform 0.3s ease;
                     "
                     onerror="this.onerror=null; this.src='/favicon-96x96.png';">
            </div>
            <div style="padding: 1.25rem; flex-grow: 1; display: flex; flex-direction: column;">
                <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                    <span style="
                        background: #e3f2fd;
                        color: #1976d2;
                        padding: 4px 10px;
                        border-radius: 12px;
                        font-size: 0.8rem;
                        font-weight: 500;
                    ">${group.category || 'General'}</span>
                    <span style="
                        background: #e8f5e9;
                        color: #2e7d32;
                        padding: 4px 10px;
                        border-radius: 12px;
                        font-size: 0.8rem;
                        font-weight: 500;
                    ">${group.country || 'Global'}</span>
                </div>
                <h3 style="
                    margin: 0 0 8px 0;
                    font-size: 1.1rem;
                    color: #1a1a1a;
                    line-height: 1.4;
                    flex-grow: 1;
                ">${group.title || 'Untitled Group'}</h3>
                <p style="
                    color: #555;
                    font-size: 0.9rem;
                    margin: 0 0 16px 0;
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                ">${group.description || 'Join our WhatsApp group'}</p>
                <div style="margin-top: auto;">
                    <a href="${group.link}" 
                       target="_blank" 
                       rel="noopener" 
                       style="
                           display: block;
                           background: #25d366;
                           color: white;
                           text-align: center;
                           padding: 10px;
                           border-radius: 6px;
                           text-decoration: none;
                           font-weight: 600;
                           transition: background-color 0.2s;
                       "
                       onmouseover="this.style.backgroundColor='#128C7E'"
                       onmouseout="this.style.backgroundColor='#25D366'"
                       onclick="if(window.db) { db.collection('groups').doc('${group.id}').update({ views: firebase.firestore.FieldValue.increment(1) }); }">
                        <i class="fab fa-whatsapp"></i> Join Group
                    </a>
                </div>
                <div style="
                    display: flex;
                    justify-content: space-between;
                    margin-top: 12px;
                    font-size: 0.8rem;
                    color: #666;
                ">
                    <span><i class="fas fa-eye"></i> ${group.views || 0} views</span>
                    <span>${dateDisplay}</span>
                </div>
            </div>`;
        
        return card;
        
    } catch (error) {
        console.error('Error creating group card:', error);
        return null;
    }
}

function formatDate(date) {
    if (!(date instanceof Date)) return '';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (ensureFirebaseInitialized()) {
            loadGroupsDirectly();
        }
    });
} else {
    if (ensureFirebaseInitialized()) {
        loadGroupsDirectly();
    }
}
