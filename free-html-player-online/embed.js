// Get URL parameters
function getUrlParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');
    
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=');
        params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    
    return params;
}

// DOM Elements
const video = document.getElementById('video');
const videoContainer = document.getElementById('video-container');
const playPause = document.querySelector('.play-pause');
const mainState = document.querySelector('.main-state');
const muteUnmute = document.querySelector('.mute-unmute');
const currentTime = document.querySelector('.current-time');
const buffer = document.querySelector('.buffer');
const duration = document.querySelector('.duration');
const currentDuration = document.querySelector('.current-duration');
const totalDuration = document.querySelector('.total-duration');
const fullscreen = document.querySelector('.fullscreen-btn');
const currentVol = document.querySelector('.current-vol');
const totalVol = document.querySelector('.max-vol');
const forward = document.querySelector('.forward');
const backward = document.querySelector('.backward');
const hoverTime = document.querySelector('.hover-time');
const hoverDuration = document.querySelector('.hover-duration');
const settingsBtn = document.querySelector('.setting-btn');
const settingMenu = document.querySelector('.setting-menu');
const loopBtn = document.querySelector('.loop-btn');
const pipBtn = document.querySelector('.pip-btn');
const screenshotBtn = document.querySelector('.screenshot-btn');
const shareBtn = document.querySelector('.share-btn');
const shareOptions = document.querySelector('.share-options');
const closeShare = document.querySelector('.close-share');
const subtitleContainer = document.querySelector('.subtitle-container');
const videoLogo = document.getElementById('videoLogo');

// Variables
let isPlaying = false;
let isMuted = false;
let isFullScreen = false;
let mouseDownProgress = false;
let mouseDownVolume = false;
let isLoop = false;
let currentPlaybackRate = 1;
let currentMediaSrc = '';
let currentQuality = 'auto';
let currentSubtitle = 'none';
let currentAudioTrack = 'default';
let hls = null;
let qualities = [];
let subtitles = [];
let audioTracks = [];
let savedPositions = {};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Get parameters from URL
    const params = getUrlParams();
    
    // Set media source
    if (params.src) {
        currentMediaSrc = decodeURIComponent(params.src);
        loadMedia(currentMediaSrc);
    }
    
    // Set logo if provided
    if (params.logo) {
        videoLogo.src = decodeURIComponent(params.logo);
    } else {
        videoLogo.style.display = 'none';
    }
    
    // Set autoplay if provided
    if (params.autoplay === 'true') {
        video.autoplay = true;
    }
    
    // Set initial volume if provided
    if (params.volume) {
        video.volume = parseFloat(params.volume) / 100;
        currentVol.style.width = `${video.volume * 100}%`;
    }
    
    // Set loop if provided
    if (params.loop === 'true') {
        video.loop = true;
        isLoop = true;
        loopBtn.classList.add('active-control');
    }
    
    // Load saved position if available
    if (localStorage.getItem('anywebplayer_positions')) {
        savedPositions = JSON.parse(localStorage.getItem('anywebplayer_positions'));
        
        if (currentMediaSrc && savedPositions[currentMediaSrc]) {
            video.currentTime = savedPositions[currentMediaSrc];
        }
    }
    
    // Initialize event listeners
    initEventListeners();
});

// Function to load media
function loadMedia(mediaSrc) {
    currentMediaSrc = mediaSrc;
    
    // Show loader
    document.querySelector('.custom-loader').style.display = 'block';
    
    // Handle different media types
    handleMediaSource(mediaSrc);
}

// Function to handle different media sources
function handleMediaSource(mediaSrc) {
    // Check if HLS is supported and if it's an m3u8 file
    if (Hls.isSupported() && (mediaSrc.includes('.m3u8') || mediaSrc.includes('playlist'))) {
        if (hls) {
            hls.destroy();
        }
        
        hls = new Hls({
            capLevelToPlayerSize: true,
            autoStartLoad: true
        });
        
        hls.loadSource(mediaSrc);
        hls.attachMedia(video);
        
        // Handle HLS events
        hls.on(Hls.Events.MANIFEST_PARSED, function(event, data) {
            // Hide loader
            document.querySelector('.custom-loader').style.display = 'none';
            
            // Get available qualities
            qualities = [];
            data.levels.forEach((level, index) => {
                qualities.push({
                    index: index,
                    height: level.height,
                    bitrate: level.bitrate
                });
            });
            
            // Update quality menu
            updateQualityMenu();
            
            // Auto play
            if (video.autoplay) {
                video.play().catch(error => {
                    console.error('Autoplay failed:', error);
                });
            }
        });
        
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
        
        // Handle audio tracks
        hls.on(Hls.Events.AUDIO_TRACK_LOADED, function() {
            updateAudioTracksMenu();
        });
        
        // Handle subtitles
        hls.on(Hls.Events.SUBTITLE_TRACK_LOADED, function() {
            updateSubtitlesMenu();
        });
    } 
    // For non-HLS media
    else {
        video.src = mediaSrc;
        video.load();
        
        // Hide loader when metadata is loaded
        video.onloadedmetadata = function() {
            document.querySelector('.custom-loader').style.display = 'none';
            
            // Auto play
            if (video.autoplay) {
                video.play().catch(error => {
                    console.error('Autoplay failed:', error);
                });
            }
        };
        
        // Handle errors
        video.onerror = function() {
            console.error('Video error:', video.error);
            document.querySelector('.custom-loader').style.display = 'none';
        };
    }
}

// Initialize all event listeners
function initEventListeners() {
    // Video events
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('ended', handleEnded);
    
    // Control events
    playPause.addEventListener('click', togglePlayPause);
    mainState.addEventListener('click', toggleMainState);
    muteUnmute.addEventListener('click', toggleMuteUnmute);
    fullscreen.addEventListener('click', toggleFullscreen);
    forward.addEventListener('click', handleForward);
    backward.addEventListener('click', handleBackward);
    loopBtn.addEventListener('click', toggleLoop);
    pipBtn.addEventListener('click', togglePictureInPicture);
    screenshotBtn.addEventListener('click', takeScreenshot);
    shareBtn.addEventListener('click', toggleShareOptions);
    closeShare.addEventListener('click', toggleShareOptions);
    
    // Progress bar events
    duration.addEventListener('click', navigate);
    duration.addEventListener('mousedown', function() {
        mouseDownProgress = true;
    });
    
    // Volume events
    totalVol.addEventListener('click', handleVolume);
    totalVol.addEventListener('mousedown', function() {
        mouseDownVolume = true;
    });
    
    // Settings events
    settingsBtn.addEventListener('click', toggleSettingsMenu);
    
    // Document events
    document.addEventListener('mouseup', function() {
        mouseDownProgress = false;
        mouseDownVolume = false;
    });
    
    document.addEventListener('mousemove', function(e) {
        if (mouseDownProgress) {
            navigate(e);
        }
        
        if (mouseDownVolume) {
            handleVolume(e);
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleShorthand);
    
    // Share buttons
    document.querySelector('.share-facebook').addEventListener('click', shareFacebook);
    document.querySelector('.share-twitter').addEventListener('click', shareTwitter);
    document.querySelector('.share-whatsapp').addEventListener('click', shareWhatsApp);
    document.querySelector('.share-copy').addEventListener('click', copyLink);
    
    // Context menu
    video.addEventListener('contextmenu', showContextMenu);
    document.addEventListener('click', function(event) {
        const contextMenu = document.getElementById('context-menu');
        if (!contextMenu.contains(event.target)) {
            contextMenu.style.display = 'none';
        }
    });
    
    // Window events
    window.addEventListener('beforeunload', saveCurrentPosition);
}

// Function to handle time updates
function handleTimeUpdate() {
    const percent = (video.currentTime / video.duration) * 100;
    currentTime.style.width = `${percent}%`;
    currentDuration.textContent = formatTime(video.currentTime);
    
    // Update subtitle display
    updateSubtitleDisplay();
}

// Function to handle buffer progress
function handleProgress() {
    if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        const bufferedPercent = (bufferedEnd / duration) * 100;
        
        buffer.style.width = `${bufferedPercent}%`;
    }
}

// Function to show loader when waiting
function handleWaiting() {
    document.querySelector('.custom-loader').style.display = 'block';
}

// Function to hide loader when playing
function handlePlaying() {
    document.querySelector('.custom-loader').style.display = 'none';
}

// Function to handle video end
function handleEnded() {
    if (!isLoop) {
        pause();
    }
}

// Toggle play/pause
function togglePlayPause() {
    if (video.paused) {
        play();
    } else {
        pause();
    }
}

// Play function
function play() {
    video.play();
    playPause.innerHTML = '<ion-icon name="pause-outline"></ion-icon>';
    mainState.innerHTML = '<ion-icon name="pause-outline"></ion-icon>';
    isPlaying = true;
}

// Pause function
function pause() {
    video.pause();
    playPause.innerHTML = '<ion-icon name="play-outline"></ion-icon>';
    mainState.innerHTML = '<ion-icon name="play-outline"></ion-icon>';
    isPlaying = false;
}

// Toggle main state (big play/pause button)
function toggleMainState() {
    togglePlayPause();
    
    mainState.style.opacity = '1';
    setTimeout(() => {
        mainState.style.opacity = '0';
    }, 500);
}

// Toggle mute/unmute
function toggleMuteUnmute() {
    if (video.volume === 0 || video.muted) {
        video.muted = false;
        video.volume = 0.5;
        currentVol.style.width = '50%';
        muteUnmute.innerHTML = '<ion-icon name="volume-high-outline"></ion-icon>';
    } else {
        video.muted = true;
        video.volume = 0;
        currentVol.style.width = '0%';
        muteUnmute.innerHTML = '<ion-icon name="volume-mute-outline"></ion-icon>';
    }
}

// Handle volume change
function handleVolume(e) {
    const totalVolRect = totalVol.getBoundingClientRect();
    let volumeValue = (e.clientX - totalVolRect.left) / totalVolRect.width;
    
    // Clamp volume between 0 and 1
    volumeValue = Math.max(0, Math.min(1, volumeValue));
    
    video.volume = volumeValue;
    currentVol.style.width = `${volumeValue * 100}%`;
    
    if (volumeValue === 0) {
        muteUnmute.innerHTML = '<ion-icon name="volume-mute-outline"></ion-icon>';
        video.muted = true;
    } else {
        muteUnmute.innerHTML = '<ion-icon name="volume-high-outline"></ion-icon>';
        video.muted = false;
    }
}

// Navigate through video (seek)
function navigate(e) {
    const durationRect = duration.getBoundingClientRect();
    const percent = (e.clientX - durationRect.left) / durationRect.width;
    const seekTime = percent * video.duration;
    
    video.currentTime = seekTime;
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Handle forward button (skip ahead)
function handleForward() {
    video.currentTime = Math.min(video.currentTime + 5, video.duration);
    
    const forwardBtn = document.querySelector('.state-forward');
    forwardBtn.style.opacity = '1';
    
    setTimeout(() => {
        forwardBtn.style.opacity = '0';
    }, 500);
}

// Handle backward button (skip back)
function handleBackward() {
    video.currentTime = Math.max(video.currentTime - 5, 0);
    
    const backwardBtn = document.querySelector('.state-backward');
    backwardBtn.style.opacity = '1';
    
    setTimeout(() => {
        backwardBtn.style.opacity = '0';
    }, 500);
}

// Toggle fullscreen
function toggleFullscreen() {
    if (!isFullScreen) {
        if (videoContainer.requestFullscreen) {
            videoContainer.requestFullscreen();
        } else if (videoContainer.webkitRequestFullscreen) {
            videoContainer.webkitRequestFullscreen();
        } else if (videoContainer.msRequestFullscreen) {
            videoContainer.msRequestFullscreen();
        }
        
        isFullScreen = true;
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        isFullScreen = false;
    }
}

// Toggle loop
function toggleLoop() {
    isLoop = !isLoop;
    video.loop = isLoop;
    
    if (isLoop) {
        loopBtn.classList.add('active-control');
    } else {
        loopBtn.classList.remove('active-control');
    }
}

// Toggle Picture-in-Picture mode
function togglePictureInPicture() {
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
        video.requestPictureInPicture();
    }
}

// Take screenshot
function takeScreenshot() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Create download link
    const link = document.createElement('a');
    link.download = `screenshot-${new Date().getTime()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Toggle share options
function toggleShareOptions() {
    if (shareOptions.style.display === 'block') {
        shareOptions.style.display = 'none';
    } else {
        shareOptions.style.display = 'block';
    }
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
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard!');
    });
}

// Context menu
function showContextMenu(event) {
    event.preventDefault();
    const contextMenu = document.getElementById('context-menu');
    contextMenu.style.display = 'block';
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';
}

// Toggle settings menu
function toggleSettingsMenu() {
    if (settingMenu.style.display === 'block') {
        settingMenu.style.display = 'none';
    } else {
        settingMenu.style.display = 'block';
    }
}

// Update quality menu
function updateQualityMenu() {
    // Remove existing quality options
    const existingQualityOptions = document.querySelectorAll('.quality-option');
    existingQualityOptions.forEach(option => option.remove());
    
    // Add new quality options
    if (qualities.length > 0) {
        qualities.sort((a, b) => b.height - a.height).forEach(quality => {
            const li = document.createElement('li');
            li.className = 'quality-option';
            li.dataset.quality = quality.index;
            li.textContent = `${quality.height}p`;
            
            if (currentQuality === quality.index.toString()) {
                li.classList.add('quality-active');
            }
            
            li.addEventListener('click', function() {
                setQuality(quality.index);
            });
            
            // Insert before the subtitles header
            const subtitlesHeader = document.querySelector('.menu-header:nth-of-type(3)');
            settingMenu.insertBefore(li, subtitlesHeader);
        });
    }
}

// Set video quality
function setQuality(index) {
    if (hls) {
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
        settingMenu.style.display = 'none';
    }
}

// Update subtitles menu
function updateSubtitlesMenu() {
    // Implementation for subtitles will depend on how your subtitles are provided
    // This is a placeholder for the functionality
}

// Update subtitle display
function updateSubtitleDisplay() {
    // Implementation for displaying subtitles
    // This is a placeholder for the functionality
}

// Update audio tracks menu
function updateAudioTracksMenu() {
    if (hls && hls.audioTracks && hls.audioTracks.length > 1) {
        // Remove existing audio track options
        const existingAudioOptions = document.querySelectorAll('.audio-option');
        existingAudioOptions.forEach(option => option.remove());
        
        // Add new audio track options
        hls.audioTracks.forEach((track, index) => {
            const li = document.createElement('li');
            li.className = 'audio-option';
            li.dataset.audio = index;
            li.textContent = track.name || `Audio ${index + 1}`;
            
            if (hls.audioTrack === index) {
                li.classList.add('audio-active');
            }
            
            li.addEventListener('click', function() {
                setAudioTrack(index);
            });
            
            settingMenu.appendChild(li);
        });
    }
}

// Set audio track
function setAudioTrack(index) {
    if (hls) {
        hls.audioTrack = index;
        
        // Update active class
        document.querySelectorAll('.audio-option, .audio-default').forEach(el => {
            el.classList.remove('audio-active');
        });
        
        const activeAudio = document.querySelector(`.audio-option[data-audio="${index}"]`);
        if (activeAudio) {
            activeAudio.classList.add('audio-active');
        }
        
        // Close settings menu
        settingMenu.style.display = 'none';
    }
}

// Handle keyboard shortcuts
function handleShorthand(e) {
    switch(e.key) {
        case ' ':
        case 'k':
            e.preventDefault();
            togglePlayPause();
            break;
        case 'ArrowRight':
            e.preventDefault();
            handleForward();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            handleBackward();
            break;
        case 'f':
            e.preventDefault();
            toggleFullscreen();
            break;
        case 'm':
            e.preventDefault();
            toggleMuteUnmute();
            break;
        case 'l':
            e.preventDefault();
            toggleLoop();
            break;
        case 'p':
            e.preventDefault();
            togglePictureInPicture();
            break;
        case 's':
            e.preventDefault();
            takeScreenshot();
            break;
    }
}

// Save current position
function saveCurrentPosition() {
    if (currentMediaSrc && video.currentTime > 0) {
        savedPositions[currentMediaSrc] = video.currentTime;
        localStorage.setItem('anywebplayer_positions', JSON.stringify(savedPositions));
    }
}

// Load subtitle file
function loadSubtitle(url) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            // Parse subtitle file (SRT or VTT)
            // Implementation depends on the subtitle format
        })
        .catch(error => {
            console.error('Error loading subtitle:', error);
        });
}

// Parse SRT format
function parseSRT(srtText) {
    // Implementation for parsing SRT format
    // This is a placeholder for the functionality
}

// Parse VTT format
function parseVTT(vttText) {
    // Implementation for parsing VTT format
    // This is a placeholder for the functionality
}
