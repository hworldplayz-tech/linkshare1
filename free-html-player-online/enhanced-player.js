/**
 * AnyWebPlayer - Enhanced Features
 * This script adds advanced functionality to the original player
 */

// Global variables for quality selection and HLS
let hls = null;
let qualities = [];
let currentQuality = 'auto';
let savedPositions = {};

// DOM Elements - ensure we have references to all player elements
const video = document.getElementById('video');
const videoContainer = document.getElementById('video-container');
const settingBtn = document.querySelector('.setting-btn');
const settingMenu = document.querySelector('.setting-menu');
const loopBtn = document.querySelector('.loop-btn');
const pipBtn = document.querySelector('.pip-btn');
const screenshotBtn = document.querySelector('.screenshot-btn');
const shareBtn = document.querySelector('.share-btn');
const closeShareBtn = document.querySelector('.close-share');
const subtitleContainer = document.querySelector('.subtitle-container');
const qualityAutoBtn = document.querySelector('.quality-auto');

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced player initializing...');
    
    // Load saved positions from localStorage
    if (localStorage.getItem('anywebplayer_positions')) {
        savedPositions = JSON.parse(localStorage.getItem('anywebplayer_positions'));
    }
    
    // Add CSS link for modern styling
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'modern-player.css';
    document.head.appendChild(cssLink);
    
    // Initialize event listeners for new features
    initEventListeners();
    
    // Override the original loadMedia function with enhanced version
    window.originalLoadMedia = window.loadMedia;
    window.loadMedia = enhancedLoadMedia;
    
    console.log('Enhanced player initialized successfully');
});

// Initialize all event listeners for new features
function initEventListeners() {
    // Settings button
    if (settingBtn) {
        settingBtn.addEventListener('click', toggleSettingsMenu);
    }
    
    // Loop button
    if (loopBtn) {
        loopBtn.addEventListener('click', toggleLoop);
    }
    
    // Picture-in-Picture button
    if (pipBtn) {
        pipBtn.addEventListener('click', togglePictureInPicture);
    }
    
    // Screenshot button
    if (screenshotBtn) {
        screenshotBtn.addEventListener('click', takeScreenshot);
    }
    
    // Share button
    if (shareBtn) {
        shareBtn.addEventListener('click', toggleShareOptions);
    }
    
    // Close share button
    if (closeShareBtn) {
        closeShareBtn.addEventListener('click', function() {
            document.querySelector('.share-options').style.display = 'none';
        });
    }
    
    // Share buttons
    const shareFacebookBtn = document.querySelector('.share-facebook');
    if (shareFacebookBtn) {
        shareFacebookBtn.addEventListener('click', shareFacebook);
    }
    
    const shareTwitterBtn = document.querySelector('.share-twitter');
    if (shareTwitterBtn) {
        shareTwitterBtn.addEventListener('click', shareTwitter);
    }
    
    const shareWhatsAppBtn = document.querySelector('.share-whatsapp');
    if (shareWhatsAppBtn) {
        shareWhatsAppBtn.addEventListener('click', shareWhatsApp);
    }
    
    const shareCopyBtn = document.querySelector('.share-copy');
    if (shareCopyBtn) {
        shareCopyBtn.addEventListener('click', copyLink);
    }
    
    // Quality selection
    if (qualityAutoBtn) {
        qualityAutoBtn.addEventListener('click', function() {
            setQuality('auto');
        });
    }
    
    // Save position before unloading
    window.addEventListener('beforeunload', saveCurrentPosition);
    
    // Load saved position when metadata is loaded
    video.addEventListener('loadedmetadata', loadSavedPosition);
    
    console.log('Event listeners initialized');
}

// Enhanced loadMedia function with quality selection support
function enhancedLoadMedia(mediaSrc) {
    console.log('Loading media with enhanced features:', mediaSrc);
    
    // Check if the link is for MP3 file
    if (mediaSrc.toLowerCase().endsWith('.mp3')) {
        // Set the source directly to the video element for MP3 files
        video.src = mediaSrc;
        video.load();
        video.play();
    } else {
        // Handle other formats like M3U8, MP4, MKV
        if (Hls.isSupported() && (mediaSrc.includes('.m3u8') || mediaSrc.includes('playlist'))) {
            console.log('Using HLS.js for streaming content');
            
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
            console.log('Using native video playback');
            video.src = mediaSrc;
            video.load();
            video.play();
        }
    }
    
    // Load saved position if available
    loadSavedPosition();
}

// Function to update the quality menu with available quality options
function updateQualityMenu() {
    if (!qualities.length) {
        console.log('No quality options available');
        return;
    }
    
    console.log('Updating quality menu with', qualities.length, 'options');
    
    // Get the setting menu
    const settingMenu = document.querySelector('.setting-menu');
    if (!settingMenu) {
        console.error('Setting menu not found');
        return;
    }
    
    // Remove existing quality options
    const existingQualityOptions = document.querySelectorAll('.quality-option');
    existingQualityOptions.forEach(option => option.remove());
    
    // Sort qualities from highest to lowest
    qualities.sort((a, b) => b.height - a.height);
    
    // Find the quality header
    const qualityHeader = document.querySelector('.menu-header:nth-of-type(2)');
    if (!qualityHeader) {
        console.error('Quality header not found');
        return;
    }
    
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
    
    console.log('Quality menu updated successfully');
}

// Function to set video quality
function setQuality(index) {
    if (!hls) {
        console.error('HLS not initialized');
        return;
    }
    
    console.log('Setting quality to', index === 'auto' ? 'auto' : `level ${index}`);
    
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
        const autoOption = document.querySelector('.quality-auto');
        if (autoOption) {
            autoOption.classList.add('quality-active');
        }
    } else {
        const activeQuality = document.querySelector(`.quality-option[data-quality="${index}"]`);
        if (activeQuality) {
            activeQuality.classList.add('quality-active');
        }
    }
    
    // Close settings menu
    toggleSettingsMenu(false);
}

// Toggle settings menu
function toggleSettingsMenu(show) {
    const menu = document.querySelector('.setting-menu');
    if (!menu) return;
    
    if (show === undefined) {
        // Toggle
        menu.classList.toggle('show-setting-menu');
    } else if (show) {
        // Show
        menu.classList.add('show-setting-menu');
    } else {
        // Hide
        menu.classList.remove('show-setting-menu');
    }
}

// Toggle loop function
function toggleLoop() {
    if (!video) return;
    
    video.loop = !video.loop;
    console.log('Loop toggled:', video.loop);
    
    const loopBtn = document.querySelector('.loop-btn');
    if (loopBtn) {
        if (video.loop) {
            loopBtn.classList.add('active-control');
        } else {
            loopBtn.classList.remove('active-control');
        }
    }
}

// Toggle Picture-in-Picture mode
function togglePictureInPicture() {
    if (!video) return;
    
    if (document.pictureInPictureElement) {
        console.log('Exiting Picture-in-Picture mode');
        document.exitPictureInPicture()
            .catch(error => {
                console.error('Error exiting Picture-in-Picture mode:', error);
            });
    } else if (document.pictureInPictureEnabled) {
        console.log('Entering Picture-in-Picture mode');
        video.requestPictureInPicture()
            .catch(error => {
                console.error('Error entering Picture-in-Picture mode:', error);
            });
    } else {
        console.warn('Picture-in-Picture not supported in this browser');
        alert('Picture-in-Picture is not supported in your browser');
    }
}

// Take screenshot function
function takeScreenshot() {
    if (!video) return;
    
    console.log('Taking screenshot');
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    try {
        // Draw the current video frame to the canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert the canvas to a data URL and create a download link
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'screenshot-' + new Date().getTime() + '.png';
        link.click();
        
        console.log('Screenshot saved');
    } catch (error) {
        console.error('Error taking screenshot:', error);
        alert('Error taking screenshot. The video might be from a different domain.');
    }
}

// Toggle share options
function toggleShareOptions() {
    const shareOptions = document.querySelector('.share-options');
    if (!shareOptions) return;
    
    shareOptions.style.display = shareOptions.style.display === 'block' ? 'none' : 'block';
}

// Share functions
function shareFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function shareTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Check out this video!');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function shareWhatsApp() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://wa.me/?text=${url}`, '_blank');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href)
        .then(() => {
            alert('Link copied to clipboard!');
        })
        .catch(err => {
            console.error('Could not copy text: ', err);
            
            // Fallback for browsers that don't support clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Link copied to clipboard!');
        });
}

// Function to save current position
function saveCurrentPosition() {
    if (!video) return;
    
    const currentSrc = video.src;
    if (currentSrc && video.currentTime > 0) {
        savedPositions[currentSrc] = video.currentTime;
        localStorage.setItem('anywebplayer_positions', JSON.stringify(savedPositions));
        console.log('Position saved:', video.currentTime);
    }
}

// Function to load saved position
function loadSavedPosition() {
    if (!video) return;
    
    const currentSrc = video.src;
    if (currentSrc && savedPositions[currentSrc] && savedPositions[currentSrc] < video.duration) {
        video.currentTime = savedPositions[currentSrc];
        console.log('Position restored:', savedPositions[currentSrc]);
    }
}

// Add subtitle support
function addSubtitle(url) {
    if (!video) return;
    
    if (!url) {
        const subtitleInput = document.getElementById('subtitleUrl');
        if (subtitleInput) {
            url = subtitleInput.value.trim();
        }
    }
    
    if (!url) {
        console.error('No subtitle URL provided');
        return;
    }
    
    console.log('Adding subtitle:', url);
    
    // Check if it's a valid subtitle file
    if (url.toLowerCase().endsWith('.srt') || url.toLowerCase().endsWith('.vtt')) {
        // Create a track element
        const track = document.createElement('track');
        track.kind = 'subtitles';
        track.label = 'Subtitles';
        track.srclang = 'en'; // Default language
        track.src = url;
        track.default = true;
        
        // Remove any existing tracks
        const existingTracks = video.getElementsByTagName('track');
        while (existingTracks.length > 0) {
            video.removeChild(existingTracks[0]);
        }
        
        // Add the new track
        video.appendChild(track);
        
        console.log('Subtitle added successfully');
        alert('Subtitle added successfully!');
    } else {
        console.error('Invalid subtitle format');
        alert('Please enter a valid subtitle file URL (.srt or .vtt)');
    }
}

// Expose functions globally
window.toggleLoop = toggleLoop;
window.togglePictureInPicture = togglePictureInPicture;
window.takeScreenshot = takeScreenshot;
window.toggleShareOptions = toggleShareOptions;
window.shareFacebook = shareFacebook;
window.shareTwitter = shareTwitter;
window.shareWhatsApp = shareWhatsApp;
window.copyLink = copyLink;
window.addSubtitle = addSubtitle;

console.log('Enhanced player features loaded');
