// Group Slider Script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize slider
    initGroupSlider();
    
    // Set up slider navigation
    const slider = document.getElementById('groupSlider');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (slider && prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            slider.scrollBy({ left: -600, behavior: 'smooth' });
        });
        
        nextBtn.addEventListener('click', () => {
            slider.scrollBy({ left: 600, behavior: 'smooth' });
        });
    }
});

// Function to initialize the group slider
function initGroupSlider() {
    console.log("Initializing group slider");
    
    // Check if Firebase is already initialized
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
        loadGroupsForSlider();
    } else {
        // If Firebase isn't initialized, skip dummy groups - database groups will load
        console.log("Firebase not initialized, waiting for database groups to load");
    }
}

// Function to load groups for the slider
function loadGroupsForSlider() {
    console.log("Loading groups for slider");
    
    try {
        // Get reference to the database
        const db = firebase.firestore();
        
        // Query for the latest 8 groups
        db.collection('groups')
            .orderBy('timestamp', 'desc')
            .limit(8)
            .get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    console.log("No groups found in Firestore");
                    populateGroupSliderWithDummy();
                    return;
                }
                
                const groups = [];
                querySnapshot.forEach((doc) => {
                    const group = doc.data();
                    group.id = doc.id;
                    groups.push(group);
                });
                
                console.log(`Loaded ${groups.length} groups from Firestore`);
                populateGroupSlider(groups);
            })
            .catch((error) => {
                console.error("Error loading groups from Firestore:", error);
                
                // Try loading from Realtime Database as fallback
                tryRealtimeDatabase();
            });
    } catch (error) {
        console.error("Error accessing Firestore:", error);
        
        // Try loading from Realtime Database as fallback
        tryRealtimeDatabase();
    }
}

// Function to try loading from Realtime Database as fallback
function tryRealtimeDatabase() {
    console.log("Trying to load groups from Realtime Database");
    
    try {
        const database = firebase.database();
        const groupsRef = database.ref('groups');
        
        groupsRef.limitToLast(8).once('value')
            .then((snapshot) => {
                if (!snapshot.exists()) {
                    console.log("No groups found in Realtime Database");
                    populateGroupSliderWithDummy();
                    return;
                }
                
                const groups = [];
                snapshot.forEach((childSnapshot) => {
                    const group = childSnapshot.val();
                    group.id = childSnapshot.key;
                    groups.push(group);
                });
                
                console.log(`Loaded ${groups.length} groups from Realtime Database`);
                populateGroupSlider(groups.reverse());
            })
            .catch((error) => {
                console.error("Error loading groups from Realtime Database:", error);
                populateGroupSliderWithDummy();
            });
    } catch (error) {
        console.error("Error accessing Realtime Database:", error);
        populateGroupSliderWithDummy();
    }
}

// Function to populate the group slider
function populateGroupSlider(groups) {
    const slider = document.getElementById('groupSlider');
    if (!slider) {
        console.error("Group slider element not found!");
        return;
    }
    
    slider.innerHTML = '';
    
    if (groups.length === 0) {
        console.log("No groups to display");
        populateGroupSliderWithDummy();
        return;
    }
    
    groups.forEach(group => {
        const slide = document.createElement('div');
        slide.className = 'group-slide';
        
        // Handle image URL safely
        let imageUrl = '/favicon-96x96.png'; // Default fallback
        
        if (group.image || group.imageUrl) {
            const imgSrc = group.image || group.imageUrl;
            
            // Check for common problematic domains
            const problematicDomains = [
                'whatsapp.net', 
                'fbcdn.net', 
                'facebook.com',
                'cdninstagram.com',
                'fbsbx.com'
            ];
            
            const hasProblematicDomain = problematicDomains.some(domain => 
                imgSrc.includes(domain)
            );
            
            if (hasProblematicDomain) {
                imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';
            } else {
                imageUrl = imgSrc;
            }
        }
        
        // Handle group name
        const groupName = group.title || group.name || 'WhatsApp Group';
        
        // Handle group category
        const category = group.category || 'General';
        
        // Handle group country
        const country = group.country || 'Global';
        
        // Handle group link
        const link = group.link || '#';
        
        slide.innerHTML = `
            <div class="group-slide-img" style="background-image: url('${imageUrl}')">
                <span class="group-slide-category">${category}</span>
                <span class="group-slide-country">${country}</span>
            </div>
            <div class="group-slide-content">
                <h3 class="group-slide-title">${groupName}</h3>
                <a href="${link}" target="_blank" class="group-slide-join" onclick="updateGroupViews('${group.id}')">Join Group</a>
            </div>
        `;
        
        slider.appendChild(slide);
    });
}

// Function to add dummy groups if no real groups exist
function populateGroupSliderWithDummy() {
    console.log("Adding dummy groups for testing");
    
    const dummyGroups = [
        {
            id: 'dummy1',
            name: "Movies & TV Shows",
            category: "Entertainment",
            country: "Global",
            image: "https://via.placeholder.com/300x200?text=Movies",
            link: "https://chat.whatsapp.com/example1"
        },
        {
            id: 'dummy2',
            name: "Tech Enthusiasts",
            category: "Technology",
            country: "USA",
            image: "https://via.placeholder.com/300x200?text=Tech",
            link: "https://chat.whatsapp.com/example2"
        },
        {
            id: 'dummy3',
            name: "Football Fans",
            category: "Sports",
            country: "UK",
            image: "https://via.placeholder.com/300x200?text=Football",
            link: "https://chat.whatsapp.com/example3"
        },
        {
            id: 'dummy4',
            name: "Gaming Community",
            category: "Gaming",
            country: "Global",
            image: "https://via.placeholder.com/300x200?text=Gaming",
            link: "https://chat.whatsapp.com/example4"
        },
        {
            id: 'dummy5',
            name: "Music Lovers",
            category: "Music",
            country: "Global",
            image: "https://via.placeholder.com/300x200?text=Music",
            link: "https://chat.whatsapp.com/example5"
        },
        {
            id: 'dummy6',
            name: "Study Group",
            category: "Education",
            country: "India",
            image: "https://via.placeholder.com/300x200?text=Education",
            link: "https://chat.whatsapp.com/example6"
        },
        {
            id: 'dummy7',
            name: "Job Opportunities",
            category: "Jobs",
            country: "Pakistan",
            image: "https://via.placeholder.com/300x200?text=Jobs",
            link: "https://chat.whatsapp.com/example7"
        },
        {
            id: 'dummy8',
            name: "Memes & Fun",
            category: "Entertainment",
            country: "Global",
            image: "https://via.placeholder.com/300x200?text=Memes",
            link: "https://chat.whatsapp.com/example8"
        }
    ];
    
    populateGroupSlider(dummyGroups);
}

// Helper function to update group views (if available from main.js)
function updateGroupViews(groupId) {
    if (window.updateGroupViews && typeof window.updateGroupViews === 'function') {
        window.updateGroupViews(groupId);
    } else {
        console.log("View count updated for group:", groupId);
    }
}
