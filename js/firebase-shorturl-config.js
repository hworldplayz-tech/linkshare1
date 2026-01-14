
        // Initialize Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyB1Nejcpv0jubaq85ufjZwll-k62aIjFuQ",
            authDomain: "short-url-generator-9ab67.firebaseapp.com",
            databaseURL: "https://short-url-generator-9ab67-default-rtdb.firebaseio.com",
            projectId: "short-url-generator-9ab67",
            storageBucket: "short-url-generator-9ab67.appspot.com",
            messagingSenderId: "375644970022",
            appId: "1:375644970022:web:be24008ed6f3a57a66dae7",
            measurementId: "G-1Q7PCGD8TM"
        };

        firebase.initializeApp(firebaseConfig);
        const database = firebase.database();

        // DOM Elements
        const urlInput = document.getElementById('url');
        const customAliasInput = document.getElementById('custom-alias');
        const shortenBtn = document.getElementById('shorten-btn');
        const result = document.getElementById('result');
        const shortUrlDisplay = document.getElementById('short-url');
        const copyBtn = document.getElementById('copy-btn');
        const errorDisplay = document.getElementById('error');
        const linksList = document.getElementById('links-list');
        const clearAllBtn = document.getElementById('clear-all-btn');
        
        // User ID elements might not exist if commented out
        const userIdDisplay = document.getElementById('user-id-display');
        const copyIdBtn = document.getElementById('copy-id-btn');
        const resetIdBtn = document.getElementById('reset-id-btn');

        // Popup Elements
        const confirmPopup = document.getElementById('confirmPopup');
        const closeConfirmPopup = document.getElementById('closeConfirmPopup');
        const confirmMessage = document.getElementById('confirmMessage');
        const cancelAction = document.getElementById('cancelAction');
        const confirmAction = document.getElementById('confirmAction');
        const successPopup = document.getElementById('successPopup');
        const closeSuccessPopup = document.getElementById('closeSuccessPopup');
        const successMessage = document.getElementById('successMessage');
        const okSuccessBtn = document.getElementById('okSuccessBtn');
        const toastContainer = document.getElementById('toastContainer');

        // Custom Popup Functions
        function showConfirmPopup(message, onConfirm) {
            confirmMessage.textContent = message;
            confirmPopup.classList.add('show');
            
            // Set up the confirm action
            const confirmHandler = () => {
                confirmPopup.classList.remove('show');
                onConfirm();
                confirmAction.removeEventListener('click', confirmHandler);
            };
            
            confirmAction.addEventListener('click', confirmHandler);
            
            // Set up cancel and close actions
            const cancelHandler = () => {
                confirmPopup.classList.remove('show');
                confirmAction.removeEventListener('click', confirmHandler);
                cancelAction.removeEventListener('click', cancelHandler);
                closeConfirmPopup.removeEventListener('click', cancelHandler);
            };
            
            cancelAction.addEventListener('click', cancelHandler);
            closeConfirmPopup.addEventListener('click', cancelHandler);
        }

        function showSuccessPopup(message) {
            successMessage.textContent = message;
            successPopup.classList.add('show');
            
            const closeHandler = () => {
                successPopup.classList.remove('show');
                okSuccessBtn.removeEventListener('click', closeHandler);
                closeSuccessPopup.removeEventListener('click', closeHandler);
            };
            
            okSuccessBtn.addEventListener('click', closeHandler);
            closeSuccessPopup.addEventListener('click', closeHandler);
        }

        function showToast(message, type = 'success') {
            const toast = document.createElement('div');
            toast.className = 'toast';
            
            let icon = 'check-circle';
            if (type === 'error') icon = 'exclamation-circle';
            if (type === 'info') icon = 'info-circle';
            if (type === 'warning') icon = 'exclamation-triangle';
            
            toast.innerHTML = `
                <div class="toast-icon ${type}">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="toast-content">
                    <p class="toast-message">${message}</p>
                </div>
            `;
            
            toastContainer.appendChild(toast);
            
            // Trigger reflow for animation
            void toast.offsetWidth;
            
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    toastContainer.removeChild(toast);
                }, 300);
            }, 3000);
        }

        // User ID Management
        function generateUserId(length = 16) {
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }

        // Get or create user ID
        function getUserId() {
            let userId = localStorage.getItem('linkshare_user_id');
            if (!userId) {
                userId = generateUserId();
                localStorage.setItem('linkshare_user_id', userId);
            }
            return userId;
        }

        // Display user ID - only if element exists
        function displayUserId() {
            if (userIdDisplay) {
                const userId = getUserId();
                userIdDisplay.textContent = userId;
            }
        }

        // Copy user ID to clipboard - only if element exists
        async function copyUserId() {
            if (copyIdBtn) {
                const userId = getUserId();
                try {
                    await navigator.clipboard.writeText(userId);
                    showToast('Device ID copied to clipboard!');
                } catch (error) {
                    errorDisplay.textContent = 'Failed to copy ID to clipboard';
                    errorDisplay.classList.add('show');
                }
            }
        }

        // Reset user ID - only if element exists
        function resetUserId() {
            if (resetIdBtn) {
                showConfirmPopup('Are you sure you want to reset your Device ID? You will no longer see your previously created links.', () => {
                    const newUserId = generateUserId();
                    localStorage.setItem('linkshare_user_id', newUserId);
                    if (userIdDisplay) {
                        userIdDisplay.textContent = newUserId;
                    }
                    loadLinks(); // Refresh links list with new user ID
                    showSuccessPopup('Device ID has been reset successfully!');
                });
            }
        }

        // Generate random ID for short links
        function generateId(length = 6) {
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }

        // Create short URL
        async function createShortUrl() {
            const url = urlInput.value.trim();
            const customAlias = customAliasInput.value.trim();
            const userId = getUserId();
            
            // Reset error display
            errorDisplay.textContent = '';
            errorDisplay.classList.remove('show');
            
            // Validate URL
            try {
                new URL(url);
            } catch {
                errorDisplay.textContent = 'Please enter a valid URL (include http:// or https://)';
                errorDisplay.classList.add('show');
                return;
            }

            shortenBtn.disabled = true;
            shortenBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            try {
                const shortId = customAlias || generateId();
                
                // Check if custom alias is available
                if (customAlias) {
                    const snapshot = await database.ref(`links/${shortId}`).once('value');
                    if (snapshot.exists()) {
                        throw new Error('This custom alias is already taken');
                    }
                }

                // Save to Firebase with user ID
                await database.ref(`links/${shortId}`).set({
                    originalUrl: url,
                    shortUrl: `https://linkshare.online/${shortId}`,
                    clicks: 0,
                    createdAt: Date.now(),
                    userId: userId // Store the user ID with the link
                });

                // Display result
                const shortUrl = `https://linkshare.online/${shortId}`;
                shortUrlDisplay.textContent = shortUrl;
                shortUrlDisplay.innerHTML = `<a href="${shortUrl}" target="_blank">${shortUrl}</a>`;
                result.classList.add('show');
                
                // Clear inputs
                urlInput.value = '';
                customAliasInput.value = '';
                
                // Refresh links list
                loadLinks();
                
                // Show success toast
                showToast('Short URL created successfully!');
            } catch (error) {
                errorDisplay.textContent = error.message;
                errorDisplay.classList.add('show');
            } finally {
                shortenBtn.disabled = false;
                shortenBtn.innerHTML = '<i class="fas fa-cut"></i> Create Short Link';
            }
        }

        // Copy to clipboard
        async function copyToClipboard() {
            try {
                const shortUrl = shortUrlDisplay.textContent || shortUrlDisplay.querySelector('a').href;
                await navigator.clipboard.writeText(shortUrl);
                showToast('Link copied to clipboard!');
            } catch (error) {
                errorDisplay.textContent = 'Failed to copy to clipboard';
                errorDisplay.classList.add('show');
            }
        }

        // Delete a link
        async function deleteLink(id) {
            showConfirmPopup('Are you sure you want to delete this link?', async () => {
                try {
                    await database.ref(`links/${id}`).remove();
                    showToast('Link deleted successfully!');
                    // Links list will automatically update due to the listener
                } catch (error) {
                    errorDisplay.textContent = 'Failed to delete link';
                    errorDisplay.classList.add('show');
                }
            });
        }

        // Clear all links for the current user
        async function clearAllLinks() {
            showConfirmPopup('Are you sure you want to delete all your links? This action cannot be undone.', async () => {
                try {
                    const userId = getUserId();
                    const snapshot = await database.ref('links').orderByChild('userId').equalTo(userId).once('value');
                    
                    if (!snapshot.exists()) {
                        showToast('You have no links to clear.', 'info');
                        return;
                    }
                    
                    const updates = {};
                    
                    snapshot.forEach(childSnapshot => {
                        updates[childSnapshot.key] = null;
                    });
                    
                    await database.ref('links').update(updates);
                    showSuccessPopup('All your links have been deleted successfully!');
                    
                    // Links list will automatically update due to the listener
                } catch (error) {
                    errorDisplay.textContent = 'Failed to clear links';
                    errorDisplay.classList.add('show');
                }
            });
        }

        // Copy a specific link
        async function copyLink(url) {
            try {
                await navigator.clipboard.writeText(url);
                showToast('Link copied to clipboard!');
            } catch (error) {
                errorDisplay.textContent = 'Failed to copy link';
                errorDisplay.classList.add('show');
            }
        }

        // Format date
        function formatDate(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // Load and display links for the current user
        function loadLinks() {
            const userId = getUserId();
            
            // Use orderByChild to filter links by userId and sort by createdAt in descending order
            database.ref('links').orderByChild('userId').equalTo(userId).on('value', (snapshot) => {
                linksList.innerHTML = '';
                const links = [];
                
                snapshot.forEach((childSnapshot) => {
                    links.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });

                // Sort links by createdAt in descending order (newest first)
                links.sort((a, b) => b.createdAt - a.createdAt);

                if (links.length === 0) {
                    linksList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-link"></i>
                            <h3>No links yet</h3>
                            <p>Your shortened links will appear here</p>
                        </div>
                    `;
                    clearAllBtn.style.display = 'none';
                } else {
                    clearAllBtn.style.display = 'block';
                    
                    links.forEach(link => {
                        const linkElement = document.createElement('div');
                        linkElement.className = 'link-item';
                        linkElement.innerHTML = `
                            <div class="link-info">
                                <div class="link-title">Short URL</div>
                                <p class="short-url-display">
                                    <a href="${link.shortUrl}" target="_blank">${link.shortUrl}</a>
                                </p>
                                <div class="link-title">Original URL</div>
                                <p class="original-url" title="${link.originalUrl}">${link.originalUrl}</p>
                                <div class="stats">
                                    <span><i class="fas fa-chart-line"></i> ${link.clicks} clicks</span>
                                    <span><i class="far fa-clock"></i> ${formatDate(link.createdAt)}</span>
                                </div>
                            </div>
                            <div class="link-actions">
                                <button class="action-btn copy-link-btn" title="Copy link" onclick="copyLink('${link.shortUrl}')">
                                    <i class="fas fa-copy"></i>
                                </button>
                                <button class="action-btn delete-btn" title="Delete link" onclick="deleteLink('${link.id}')">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `;
                        linksList.appendChild(linkElement);
                    });
                }
            });
        }

        // Event listeners
        shortenBtn.addEventListener('click', createShortUrl);
        copyBtn.addEventListener('click', copyToClipboard);
        clearAllBtn.addEventListener('click', clearAllLinks);
        
        // Only add event listeners if elements exist
        if (copyIdBtn) copyIdBtn.addEventListener('click', copyUserId);
        if (resetIdBtn) resetIdBtn.addEventListener('click', resetUserId);

        // Make functions available globally for onclick handlers
        window.deleteLink = deleteLink;
        window.copyLink = copyLink;

        // Initialize
        displayUserId(); // This will only run if userIdDisplay exists
        loadLinks(); // This should always run

       
    