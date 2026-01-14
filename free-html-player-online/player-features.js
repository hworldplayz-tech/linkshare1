// Global variables for quality selection
var hls = null;
var qualities = [];
var currentQuality = 'auto';

// Function to update the quality menu with available quality options
function updateQualityMenu() {
    if (!qualities.length) return;
    
    // Get the setting menu
    const settingMenu = document.querySelector('.setting-menu');
    if (!settingMenu) return;
    
    // Remove existing quality options
    const existingQualityOptions = document.querySelectorAll('.quality-option');
    existingQualityOptions.forEach(option => option.remove());
    
    // Sort qualities from highest to lowest
    qualities.sort((a, b) => b.height - a.height);
    
    // Find the quality header
    const qualityHeader = document.querySelector('.menu-header:nth-of-type(2)');
    if (!qualityHeader) return;
    
    // Add quality options
    qualities.forEach(quality => {
        const li = document.createElement('li');
        li.className = 'quality-option';
        li.dataset.quality = quality.index;
        li.textContent = `${quality.height}p`;
        
        li.addEventListener('click', function() {
            setQuality(quality.index);
        });
        
        // Insert after quality header
        qualityHeader.after(li);
    });
}

// Function to set video quality
function setQuality(index) {
    if (!hls) return;
    
    if (index === 'auto') {
        hls.currentLevel = -1; // Auto quality
    } else {
        hls.currentLevel = parseInt(index);
    }
    
    currentQuality = index.toString();
    
    // Update active class
    document.querySelectorAll('.quality-option, .quality-auto').forEach(el => {
        el.classList.remove('quality-active');
    });
    
    if (index === 'auto') {
        document.querySelector('.quality-auto').classList.add('quality-active');
    } else {
        const activeQuality = document.querySelector(`.quality-option[data-quality="${index}"]`);
        if (activeQuality) {
            activeQuality.classList.add('quality-active');
        }
    }
    
    // Close settings menu
    const settingMenu = document.querySelector('.setting-menu');
    if (settingMenu) {
        settingMenu.classList.remove('show-setting-menu');
    }
}

// Enhanced loadMedia function with quality selection support
function enhancedLoadMedia(mediaSrc) {
    // Check if the link is for MP3 file
    if (mediaSrc.toLowerCase().endsWith('.mp3')) {
        // Set the source directly to the video element for MP3 files
        video.src = mediaSrc;
    } else {
        // Handle other formats like M3U8, MP4, MKV
        if (Hls.isSupported() && (mediaSrc.includes('.m3u8') || mediaSrc.includes('playlist'))) {
            // Destroy previous HLS instance if it exists
            if (hls) {
                hls.destroy();
            }
            
            // Create new HLS instance with options
            hls = new Hls({
                capLevelToPlayerSize: true,  // Adjust quality based on player size
                autoStartLoad: true
            });
            
            hls.loadSource(mediaSrc);
            hls.attachMedia(video);
            
            // Handle HLS events
            hls.on(Hls.Events.MANIFEST_PARSED, function(event, data) {
                console.log('HLS manifest parsed, found ' + data.levels.length + ' quality levels');
                
                // Store available qualities
                qualities = [];
                data.levels.forEach((level, index) => {
                    qualities.push({
                        index: index,
                        height: level.height || 720, // Default if height not available
                        bitrate: level.bitrate
                    });
                });
                
                // Update quality menu
                updateQualityMenu();
                
                // Play video
                video.play();
                handleMediaSource(mediaSrc);
            });
            
            // Handle HLS errors
            hls.on(Hls.Events.ERROR, function(event, data) {
                if (data.fatal) {
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error('Network error');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error('Media error');
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error('Unrecoverable error');
                            hls.destroy();
                            break;
                    }
                }
            });
        } else {
            // For non-HLS media
            video.src = mediaSrc;
            video.load();
            video.play();
            handleMediaSource(mediaSrc);
        }
    }
    
    // Load saved position if available
    loadSavedPosition();
}

// Replace the original loadMedia function
window.originalLoadMedia = window.loadMedia;
window.loadMedia = enhancedLoadMedia;

// Picture-in-Picture functionality
function togglePictureInPicture() {
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
        video.requestPictureInPicture();
    }
}

// Loop functionality
function toggleLoop() {
    video.loop = !video.loop;
    const loopBtn = document.querySelector('.loop-btn');
    
    if (video.loop) {
        loopBtn.classList.add('active-control');
    } else {
        loopBtn.classList.remove('active-control');
    }
}

// Screenshot functionality
function takeScreenshot() {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert the canvas to a data URL and create a download link
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'screenshot-' + new Date().getTime() + '.png';
    link.click();
}

// Social sharing functionality
function shareMedia() {
    const shareOptions = document.querySelector('.share-options');
    shareOptions.style.display = shareOptions.style.display === 'block' ? 'none' : 'block';
}

// Save and restore playback position
let savedPositions = {};

// Load saved positions from localStorage
if (localStorage.getItem('anywebplayer_positions')) {
    savedPositions = JSON.parse(localStorage.getItem('anywebplayer_positions'));
}

// Function to save current position
function saveCurrentPosition() {
    const currentSrc = video.src;
    if (currentSrc && video.currentTime > 0) {
        savedPositions[currentSrc] = video.currentTime;
        localStorage.setItem('anywebplayer_positions', JSON.stringify(savedPositions));
    }
}

// Function to load saved position
function loadSavedPosition() {
    const currentSrc = video.src;
    if (currentSrc && savedPositions[currentSrc] && savedPositions[currentSrc] < video.duration) {
        video.currentTime = savedPositions[currentSrc];
    }
}

// Add event listeners for new player controls
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for the new buttons
    const pipBtn = document.querySelector('.pip-btn');
    if (pipBtn) {
        pipBtn.addEventListener('click', togglePictureInPicture);
    }
    
    const loopBtn = document.querySelector('.loop-btn');
    if (loopBtn) {
        loopBtn.addEventListener('click', toggleLoop);
    }
    
    const screenshotBtn = document.querySelector('.screenshot-btn');
    if (screenshotBtn) {
        screenshotBtn.addEventListener('click', takeScreenshot);
    }
    
    const shareBtn = document.querySelector('.share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareMedia);
    }
    
    const closeShareBtn = document.querySelector('.close-share');
    if (closeShareBtn) {
        closeShareBtn.addEventListener('click', function() {
            document.querySelector('.share-options').style.display = 'none';
        });
    }
    
    // Share buttons
    const shareFacebookBtn = document.querySelector('.share-facebook');
    if (shareFacebookBtn) {
        shareFacebookBtn.addEventListener('click', function() {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
        });
    }
    
    const shareTwitterBtn = document.querySelector('.share-twitter');
    if (shareTwitterBtn) {
        shareTwitterBtn.addEventListener('click', function() {
            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('Check out this video!')}`, '_blank');
        });
    }
    
    const shareWhatsAppBtn = document.querySelector('.share-whatsapp');
    if (shareWhatsAppBtn) {
        shareWhatsAppBtn.addEventListener('click', function() {
            window.open(`https://wa.me/?text=${encodeURIComponent(window.location.href)}`, '_blank');
        });
    }
    
    const shareCopyBtn = document.querySelector('.share-copy');
    if (shareCopyBtn) {
        shareCopyBtn.addEventListener('click', function() {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        });
    }
    
    // Quality selection
    const qualityAutoBtn = document.querySelector('.quality-auto');
    if (qualityAutoBtn) {
        qualityAutoBtn.addEventListener('click', function() {
            setQuality('auto');
        });
    }
    
    // Auto-save position before unloading the page
    window.addEventListener('beforeunload', saveCurrentPosition);
    
    // Load saved position when metadata is loaded
    video.addEventListener('loadedmetadata', loadSavedPosition);
    
    // Update settings menu to show/hide
    const settingsBtn = document.querySelector('.setting-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            const settingMenu = document.querySelector('.setting-menu');
            if (settingMenu) {
                settingMenu.classList.toggle('show-setting-menu');
            }
        });
    }
});

// Add CSS styles for new features
const style = document.createElement('style');
style.textContent = `
.active-control {
    color: #ff6a00 !important;
}

.menu-header {
    font-weight: bold;
    color: #ff6a00;
    cursor: default;
}

.menu-header:hover {
    background: none !important;
}

.quality-active, .subtitle-active, .audio-active {
    color: #ff6a00;
}

.setting-menu {
    max-height: 300px;
    overflow-y: auto;
}

.subtitle-container {
    position: absolute;
    bottom: 70px;
    width: 100%;
    text-align: center;
    padding: 0 20%;
    font-size: 1.2rem;
    text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.8);
}

.share-options {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(28, 28, 28, 0.9);
    border-radius: 5px;
    padding: 1rem;
    display: none;
    width: 300px;
    z-index: 1002;
}

.share-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.close-share {
    cursor: pointer;
    font-size: 1.5rem;
}

.share-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
}

.share-buttons button {
    padding: 0.5rem;
    border: none;
    border-radius: 5px;
    background: #333;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.share-buttons button ion-icon {
    margin-right: 0.3rem;
}

.share-facebook {
    background: #3b5998 !important;
}

.share-twitter {
    background: #1da1f2 !important;
}

.share-whatsapp {
    background: #25d366 !important;
}

.share-copy {
    background: #555 !important;
}
`;
document.head.appendChild(style);
