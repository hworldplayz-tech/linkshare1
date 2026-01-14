//BACKUP of ORignal Add group Firebase initializng ===================
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

// Flag to track initialization status
window.firebaseInitialized = false;

// Initialize Firebase using regular script tags instead of modules
document.addEventListener('DOMContentLoaded', async function() {
    try {
        if (typeof firebase === 'undefined') {
            console.error("Firebase SDK not loaded. Make sure you've included the Firebase scripts.");
            return;
        }

        // Only initialize once
        let app;
        if (!firebase.apps || !firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
            const analytics = firebase.analytics();
            console.log("Firebase app initialized");
        } else {
            app = firebase.app();
            console.log("Firebase already initialized");
        }
        
        const db = firebase.firestore();
        
        // Configure Firestore with SMART CACHING for better performance
        try {
            // Enable persistence but with smart refresh mechanism
            await db.enablePersistence({ synchronizeTabs: true });
            console.log('Firestore configured with SMART CACHING');
            
            // Set cache settings for optimal performance
            db.settings({
                cacheSizeBytes: 5242880, // 5MB cache for better performance
                ignoreUndefinedProperties: true
            });
            
        } catch (err) {
            console.warn('Firestore settings error:', err);
        }
        
        // Make db and Firebase functions available globally
        window.db = db;
        window.collection = (path) => db.collection(path);
        window.getDocs = (query) => query.get();
        window.query = db;
        window.orderBy = (field, direction) => ({field, direction});
        window.where = (field, op, value) => ({field, op, value});
        window.startAfter = (doc) => ({doc});
        window.limit = (value) => ({value});
        window.doc = (collectionPath, id) => db.collection(collectionPath).doc(id);
        window.updateDoc = (ref, data) => ref.update(data);
        window.increment = (value) => firebase.firestore.FieldValue.increment(value);
        window.addDoc = (collectionRef, data) => collectionRef.add(data);
        window.serverTimestamp = () => firebase.firestore.FieldValue.serverTimestamp();
        
        // Set flag to true
        window.firebaseInitialized = true;
        
        console.log("Firebase initialized successfully and global functions set");
        
        // Trigger INSTANT loading with fresh data
        if (document.querySelector('.groups-grid')) {
            console.log('🚀 Loading groups instantly...');
            // Use optimized fast loader instead of old loadGroups - NO DELAY
            if (typeof loadGroupsOptimized === 'function') {
                loadGroupsOptimized();
            } else {
                // Fallback to current approach but with fresh data priority
                const currentTopic = window.currentTopic || 'all';
                const currentCountry = window.currentCountry || 'all';
                loadGroups(currentTopic, currentCountry);
            }
        }
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        // Display error in UI if possible
        if (document.querySelector('.groups-grid')) {
            document.querySelector('.groups-grid').innerHTML = 
                `<div class="error">Error initializing Firebase: ${error.message}. 
                Please check your network connection and try again.</div>`;
        }
    }
});
