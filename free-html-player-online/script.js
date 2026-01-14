
//========= Input Script Start
var input = document.getElementById('mediaLink');
var inputbtn = document.getElementById("input-play-btn");


inputbtn.addEventListener("focus", function() {
 inputbtn.style.border='1px solid black';
});
inputbtn.addEventListener("blur", function() {
inputbtn.style.border='none';
// input.classList.remove('mediainput');
})
input.addEventListener("focus", function() {
 input.style.border='2px solid #ff6a00';
});
input.addEventListener("blur", function() {
input.style.border='none';
// input.classList.remove('mediainput');
});

var logoinput = document.getElementById("logoUrl");
var logoupdatebtn = document.getElementById("update-logo-btn");
var logoremovebtn = document.getElementById("remove-logo-btn");
// ====Logo input script
// Logo input script


logoinput.addEventListener("focus", function() {
  logoinput.style.border='2px solid #ff6a00';
 
 });
 logoinput.addEventListener("blur", function() {
  logoinput.style.border='none';
 // input.classList.remove('mediainput');
 
 });
 // ===Logo update btn script

// Function to check if a string is a valid URL
function isValidURL(url) {
  var urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  return urlRegex.test(url);
}

// Add event listener to the update logo button
logoupdatebtn.addEventListener("click", function() {
  // Check if the URL is valid
  if (isValidURL(logoinput.value)) {
      logoupdatebtn.innerHTML = "Logo Updated";
      logoupdatebtn.style.border='1px solid black';
      logoupdatebtn.style.background= ' rgb(9, 243, 20)';
      logoupdatebtn.style.color= ' white';
  } else {
      logoupdatebtn.innerHTML = "Update Logo"; 
  }
});

// Add event listener to the logo input field for additional feedback (optional)
logoinput.addEventListener("input", function() {
  if (isValidURL(logoinput.value)) {
      // Provide feedback that the URL is valid (optional)
      logoinput.style.border='2px solid #ff6a00';
  } else {
      // Provide feedback that the URL is not valid (optional)
      logoinput.style.border='2px solid red';
  }
});

// Add event listener to the update logo button for focus
logoupdatebtn.addEventListener("focus", function() {
  // Check if the URL is valid before updating the text
  if (isValidURL(logoinput.value)) {
      logoupdatebtn.innerHTML = "Logo Updated";
      logoupdatebtn.style.border='1px solid black';
      logoupdatebtn.style.background= ' rgb(9, 243, 20)';
      logoupdatebtn.style.color= ' white';
  }
});

// Add event listener to the update logo button for blur
logoupdatebtn.addEventListener("blur", function() {
  // Check if the URL is valid before updating the text
  
      logoupdatebtn.innerHTML = "Update Logo";
      logoupdatebtn.style.border=' 1px solid #ff6a00';
      logoupdatebtn.style.background= ' #ff6a00';
      logoupdatebtn.style.color= ' black';
  
});

/*logoupdatebtn.addEventListener("focus", function() {   
 
      logoupdatebtn.innerHTML = "Logo Updated";
      logoupdatebtn.style.border='1px solid black';
      logoupdatebtn.style.background= ' rgb(9, 243, 20)';
      logoupdatebtn.style.color= ' white';
  });
   
logoupdatebtn.addEventListener("blur", function() {   
 
  logoupdatebtn.innerHTML = "Update Logo";
  logoupdatebtn.style.border=' none';
  logoupdatebtn.style.background= ' #ff6a00';
  logoupdatebtn.style.color= ' black';
});
*/
 // ===Logo Remove btn script
 logoremovebtn.addEventListener("focus", function() {
  logoremovebtn.innerHTML= "Logo Removed"
  logoremovebtn.style.border='1px solid black';
  logoremovebtn.style.background=' red';
  logoremovebtn.style.color=' white';
  
  
 });
 logoremovebtn.addEventListener("blur", function() {
  logoremovebtn.innerHTML= "Remove Logo"
  logoremovebtn.style.border='1px solid #ff6a00';
  logoremovebtn.style.background= ' #ff6a00';
  logoremovebtn.style.color=' black';
 // input.classList.remove('mediainput');
 
 })
//============ Player Logo script Start
 

// Function to remove the logo image
function removeLogo() {
  var logoImage = document.getElementById('videoLogo');
  logoImage.remove(); // Remove the entire img element
}

// Function to update the logo image based on user input
function updateLogo() {
  var logoUrl = document.getElementById('logoUrl').value;

  if (logoUrl.trim() !== '') {
    
      var logoImage = document.getElementById('videoLogo');
      if (!logoImage) {
          // If logoImage doesn't exist, create a new img element
          logoImage = document.createElement('img');
          logoImage.id = 'videoLogo';
          logoImage.classList.add('logo') ;
          var videoContainer = document.getElementById('video-container');
          videoContainer.appendChild(logoImage);
          

      }
      logoImage.src = logoUrl;
  } else {
      alert("Please enter the URL of your logo image.");
  }
}

// Function to add subtitle
function addSubtitle() {
  var subtitleUrl = document.getElementById('subtitleUrl').value;
  
  if (subtitleUrl.trim() !== '') {
    // Check if it's a valid subtitle file (srt or vtt)
    if (subtitleUrl.toLowerCase().endsWith('.srt') || subtitleUrl.toLowerCase().endsWith('.vtt')) {
      // Create a track element
      var track = document.createElement('track');
      track.kind = 'subtitles';
      track.label = 'Subtitles';
      track.srclang = 'en'; // Default language
      track.src = subtitleUrl;
      track.default = true;
      
      // Remove any existing tracks
      var existingTracks = video.getElementsByTagName('track');
      while (existingTracks.length > 0) {
        video.removeChild(existingTracks[0]);
      }
      
      // Add the new track
      video.appendChild(track);
      
      alert('Subtitle added successfully!');
    } else {
      alert('Please enter a valid subtitle file URL (.srt or .vtt)');
    }
  } else {
    alert('Please enter a subtitle file URL');
  }
}

// Function to generate embed code
function generateEmbedCode() {
  var mediaLink = document.getElementById('mediaLink').value;
  var logoUrl = document.getElementById('logoUrl').value;
  var width = document.getElementById('embed-width').value;
  var height = document.getElementById('embed-height').value;
  var autoplay = document.getElementById('autoplay-option').checked;
  var loop = document.getElementById('loop-option').checked;
  var volume = document.getElementById('volume-option').value;
  var responsive = document.getElementById('responsive-embed').checked;
  var subtitleUrl = document.getElementById('subtitleUrl').value;
  
  // Base URL of your website
  var baseUrl = window.location.origin;
  var embedUrl = `${baseUrl}/free-html-player-online/embed.html`;
  
  // Build query parameters
  var params = [];
  
  if (mediaLink.trim() !== '') {
    params.push(`src=${encodeURIComponent(mediaLink)}`);
  }
  
  if (logoUrl.trim() !== '') {
    params.push(`logo=${encodeURIComponent(logoUrl)}`);
  }
  
  if (autoplay) {
    params.push('autoplay=true');
  }
  
  if (loop) {
    params.push('loop=true');
  }
  
  if (volume !== '100') {
    params.push(`volume=${volume}`);
  }
  
  if (subtitleUrl.trim() !== '') {
    params.push(`subtitle=${encodeURIComponent(subtitleUrl)}`);
  }
  
  // Combine URL and parameters
  if (params.length > 0) {
    embedUrl += '?' + params.join('&');
  }
  
  // Generate the iframe code
  var iframeCode;
  if (responsive) {
    iframeCode = `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allowfullscreen></iframe>
</div>`;
  } else {
    iframeCode = `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`;
  }
  
  // Set the embed code in the textarea
  var embedCodeElement = document.getElementById('embed-code');
  embedCodeElement.value = iframeCode;
  embedCodeElement.style.display = 'block';
}

// Function to copy embed code
function copyEmbedCode() {
  var embedCode = document.getElementById('embed-code');
  embedCode.select();
  document.execCommand('copy');
  
  // Visual feedback
  var copyBtn = document.getElementById('copy-embed-btn');
  var originalText = copyBtn.textContent;
  copyBtn.textContent = 'Copied!';
  
  setTimeout(function() {
    copyBtn.textContent = originalText;
  }, 2000);
}

//============player Functionality start 
//---Context menu Script
function showContextMenu(event) {
  event.preventDefault();
  const contextMenu = document.getElementById("context-menu");
  contextMenu.style.display = "block";
  contextMenu.style.left = event.pageX + "px";
  contextMenu.style.top = event.pageY + "px";
}

document.addEventListener("click", function(event) {
  const contextMenu = document.getElementById("context-menu");
  if (!contextMenu.contains(event.target)) {
    contextMenu.style.display = "none";
  }
});

  
  
  //========== Player script start here

const fullscreen = document.querySelector(".fullscreen-btn");
const playPause = document.querySelector(".play-pause");
const volume = document.querySelector(".volume");
const currentTime = document.querySelector(".current-time");
const duration = document.querySelector(".duration");
const buffer = document.querySelector(".buffer");
const totalDuration = document.querySelector(".total-duration");
const currentDuration = document.querySelector(".current-duration");
const controls = document.querySelector(".controls");
const videoContainer = document.querySelector(".video-container");
const currentVol = document.querySelector(".current-vol");
const totalVol = document.querySelector(".max-vol");
const mainState = document.querySelector(".main-state");
const muteUnmute = document.querySelector(".mute-unmute");
const forward = document.querySelector(".forward");
const backward = document.querySelector(".backward");
const hoverTime = document.querySelector(".hover-time");
const hoverDuration = document.querySelector(".hover-duration");
const miniPlayer = document.querySelector(".mini-player");
const settingsBtn = document.querySelector(".setting-btn");
const settingMenu = document.querySelector(".setting-menu");
const theaterBtn = document.querySelector(".theater-btn");
const speedButtons = document.querySelectorAll(".setting-menu li");
const backwardSate = document.querySelector(".state-backward");
const forwardSate = document.querySelector(".state-forward");
const loader = document.querySelector(".custom-loader");
const playerlogo = document.querySelector("#player-logo")

let isPlaying = false,
  mouseDownProgress = false,
  mouseDownVol = false,
  isCursorOnControls = false,
  muted = false,
  timeout,
  volumeVal = 1,
  mouseOverDuration = false,
  touchClientX = 0,
  touchPastDurationWidth = 0,
  touchStartTime = 0;

currentVol.style.width = volumeVal * 100 + "%";

// Video Event Listeners
video.addEventListener("loadedmetadata", canPlayInit);
video.addEventListener("play", play);
video.addEventListener("pause", pause);
video.addEventListener("progress", handleProgress);
video.addEventListener("waiting", handleWaiting);
video.addEventListener("playing", handlePlaying);
//chatgpt update
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener('click', toggleVideoPlayback);

function toggleVideoPlayback() {
    if (video.paused) {
        play();
    } else {
        pause();
    }
}

  
  
document.addEventListener("keydown", handleShorthand);
fullscreen.addEventListener("click", toggleFullscreen);

playPause.addEventListener("click", (e) => {
  if (!isPlaying) {
    play();
  } else {
    pause();
  }
});



duration.addEventListener("click", navigate);

duration.addEventListener("mousedown", (e) => {
  mouseDownProgress = true;
  navigate(e);
});

totalVol.addEventListener("mousedown", (e) => {
  mouseDownVol = true;
  handleVolume(e);
});

document.addEventListener("mouseup", (e) => {
  mouseDownProgress = false;
  mouseDownVol = false;
});

document.addEventListener("mousemove", handleMousemove);

duration.addEventListener("mouseenter", (e) => {
  mouseOverDuration = true;
});
duration.addEventListener("mouseleave", (e) => {
  mouseOverDuration = false;
  hoverTime.style.width = 0;
  hoverDuration.innerHTML = "";
});

videoContainer.addEventListener("mouseleave", hideControls);
videoContainer.addEventListener("click", toggleMainState);
videoContainer.addEventListener("fullscreenchange", () => {
  videoContainer.classList.toggle("fullscreen", document.fullscreenElement);
});

videoContainer.addEventListener("mousemove", (e) => {
  controls.classList.add("show-controls");
  hideControls();
});
videoContainer.addEventListener("touchstart", (e) => {
  controls.classList.add("show-controls");
  touchClientX = e.changedTouches[0].clientX;
  const currentTimeRect = currentTime.getBoundingClientRect();
  touchPastDurationWidth = currentTimeRect.width;
  touchStartTime = e.timeStamp;
});
videoContainer.addEventListener("touchend", () => {
  hideControls();
  touchClientX = 0;
  touchPastDurationWidth = 0;
  touchStartTime = 0;

});
videoContainer.addEventListener("touchmove", handleTouchNavigate);

controls.addEventListener("mouseenter", (e) => {
  controls.classList.add("show-controls");
  isCursorOnControls = true;

});

controls.addEventListener("mouseleave", (e) => {
  isCursorOnControls = false;

});

mainState.addEventListener("click", toggleMainState);

mainState.addEventListener("animationend", handleMainSateAnimationEnd);

muteUnmute.addEventListener("click", toggleMuteUnmute);

muteUnmute.addEventListener("mouseenter", (e) => {
  if (!muted) {
    totalVol.classList.add("show");
  } else {
    totalVol.classList.remove("show");
  }
});

muteUnmute.addEventListener("mouseleave", (e) => {
  if (e.relatedTarget != volume) {
    totalVol.classList.remove("show");
  }
});

forward.addEventListener("click", handleForward);

forwardSate.addEventListener("animationend", () => {
  forwardSate.classList.remove("show-state");
  forwardSate.classList.remove("animate-state");
});

backward.addEventListener("click", handleBackward);

backwardSate.addEventListener("animationend", () => {
  backwardSate.classList.remove("show-state");
  backwardSate.classList.remove("animate-state");
});

miniPlayer.addEventListener("click", toggleMiniPlayer);

theaterBtn.addEventListener("click", toggleTheater);

settingsBtn.addEventListener("click", handleSettingMenu);

speedButtons.forEach((btn) => {
  btn.addEventListener("click", handlePlaybackRate);
});

function handleTimeUpdate() {
    totalDuration.innerHTML = showDuration(video.duration);
    currentDuration.innerHTML = showDuration(video.currentTime);
    currentTime.style.width = (video.currentTime / video.duration) * 100 + "%";
  }

function canPlayInit() {
  totalDuration.innerHTML = showDuration(video.duration);
  video.volume = volumeVal;
  muted = video.muted;
  if (video.paused) {
    controls.classList.add("show-controls");
    mainState.classList.add("show-state");
    handleMainStateIcon(`<ion-icon name="play-outline"></ion-icon>`);
  }
  handleTimeUpdate();

}

function play() {
  video.play();
  isPlaying = true;
  playPause.innerHTML = `<ion-icon name="pause-outline"></ion-icon>`;
  mainState.classList.remove("show-state");
  handleMainStateIcon(`<ion-icon name="pause-outline"></ion-icon>`);
  // watchProgress();
}

// function watchProgress() {
//   if (isPlaying) {
//     requestAnimationFrame(watchProgress);
//     handleProgressBar();
//   }
// }

video.ontimeupdate = handleProgressBar;

function handleProgressBar() {
  currentTime.style.width = (video.currentTime / video.duration) * 100 + "%";
  currentDuration.innerHTML = showDuration(video.currentTime);
}

function pause() {
  video.pause();
  isPlaying = false;
  playPause.innerHTML = `<ion-icon name="play-outline"></ion-icon>`;
  controls.classList.add("show-controls");
  mainState.classList.add("show-state");
  handleMainStateIcon(`<ion-icon name="play-outline"></ion-icon>`);
  if (video.ended) {
    currentTime.style.width = 100 + "%";
  }
}

function handleWaiting() {
  loader.style.display = "unset";
}

function handlePlaying() {
  loader.style.display = "none";
}

function navigate(e) {
  const totalDurationRect = duration.getBoundingClientRect();
  const width = Math.min(
    Math.max(0, e.clientX - totalDurationRect.x),
    totalDurationRect.width
  );
  currentTime.style.width = (width / totalDurationRect.width) * 100 + "%";
  video.currentTime = (width / totalDurationRect.width) * video.duration;
}

function handleTouchNavigate(e) {
  hideControls();
  if (e.timeStamp - touchStartTime > 500) {
    const durationRect = duration.getBoundingClientRect();
    const clientX = e.changedTouches[0].clientX;
    const value = Math.min(
      Math.max(0, touchPastDurationWidth + (clientX - touchClientX) * 0.2),
      durationRect.width
    );
    currentTime.style.width = value + "px";
    video.currentTime = (value / durationRect.width) * video.duration;
    currentDuration.innerHTML = showDuration(video.currentTime);
  }
}

function showDuration(time) {
  const hours = Math.floor(time / 60 ** 2);
  const min = Math.floor((time / 60) % 60);
  const sec = Math.floor(time % 60);
  if (hours > 0) {
    return `${formatter(hours)}:${formatter(min)}:${formatter(sec)}`;
  } else {
    return `${formatter(min)}:${formatter(sec)}`;
  }
}

function formatter(number) {
  return new Intl.NumberFormat({}, { minimumIntegerDigits: 2 }).format(number);
}

function toggleMuteUnmute() {
  if (!muted) {
    video.volume = 0;
    muted = true;
    muteUnmute.innerHTML = `<ion-icon name="volume-mute-outline"></ion-icon>`;
    handleMainStateIcon(`<ion-icon name="volume-mute-outline"></ion-icon>`);
    totalVol.classList.remove("show");
  } else {
    video.volume = volumeVal;
    muted = false;
    totalVol.classList.add("show");
    handleMainStateIcon(`<ion-icon name="volume-high-outline"></ion-icon>`);
    muteUnmute.innerHTML = `<ion-icon name="volume-high-outline"></ion-icon>`;
  }
}

 
function hideControls() {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    if (isPlaying && !isCursorOnControls) {
      controls.classList.remove("show-controls");
      settingMenu.classList.remove("show-setting-menu");
    }
  }, 1000);
}

function toggleMainState(e) {
  e.stopPropagation();
  if (!e.path.includes(controls)) {
    if (!isPlaying) {
      play();
    } else {
      pause();
    }
  }
}

function handleVolume(e) {
  const totalVolRect = totalVol.getBoundingClientRect();
  currentVol.style.width =
    Math.min(Math.max(0, e.clientX - totalVolRect.x), totalVolRect.width) +
    "px";
  volumeVal = Math.min(
    Math.max(0, (e.clientX - totalVolRect.x) / totalVolRect.width),
    1
  );
  video.volume = volumeVal;
}

function handleProgress() {
  if (!video.buffered || !video.buffered.length) {
    return;
  }
  const width = (video.buffered.end(0) / video.duration) * 100 + "%";
  buffer.style.width = width;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    videoContainer.requestFullscreen();
    handleMainStateIcon(`<ion-icon name="scan-outline"></ion-icon>`);
  } else {
    handleMainStateIcon(` <ion-icon name="contract-outline"></ion-icon>`);
    document.exitFullscreen();
  }
}

function handleMousemove(e) {
  if (mouseDownProgress) {
    e.preventDefault();
    navigate(e);
  }
  if (mouseDownVol) {
    handleVolume(e);
  }
  if (mouseOverDuration) {
    const rect = duration.getBoundingClientRect();
    const width = Math.min(Math.max(0, e.clientX - rect.x), rect.width);
    const percent = (width / rect.width) * 100;
    hoverTime.style.width = width + "px";
    hoverDuration.innerHTML = showDuration((video.duration / 100) * percent);
  }
}

function handleForward() {
  forwardSate.classList.add("show-state");
  forwardSate.classList.add("animate-state");
  video.currentTime += 5;
  handleProgressBar();
}

function handleBackward() {
  backwardSate.classList.add("show-state");
  backwardSate.classList.add("animate-state");
  video.currentTime -= 5;
  handleProgressBar();
}

function handleMainStateIcon(icon) {
  mainState.classList.add("animate-state");
  mainState.innerHTML = icon;
}

function handleMainSateAnimationEnd() {
  mainState.classList.remove("animate-state");
  if (!isPlaying) {
    mainState.innerHTML = `<ion-icon name="play-outline"></ion-icon>`;
  }
  if (document.pictureInPictureElement) {
    mainState.innerHTML = ` <ion-icon name="tv-outline"></ion-icon>`;
  }
}

function toggleTheater() {
  videoContainer.classList.toggle("theater");
  if (videoContainer.classList.contains("theater")) {
    handleMainStateIcon(
      `<ion-icon name="tablet-landscape-outline"></ion-icon>`
    );
  } else {
    handleMainStateIcon(`<ion-icon name="tv-outline"></ion-icon>`);
  }
}

// Add event listener to video container
const videoContainer2 = document.querySelector('.video-container');
videoContainer2.addEventListener('click', toggleVideoPlayback);

function toggleVideoPlayback() {
    if (video.paused) {
        play();
    } else {
        pause();
    }
}


function toggleMiniPlayer() {
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture();
    handleMainStateIcon(`<ion-icon name="magnet-outline"></ion-icon>`);
  } else {
    video.requestPictureInPicture();
    handleMainStateIcon(`<ion-icon name="albums-outline"></ion-icon>`);
  }
}

function handleSettingMenu() {
  settingMenu.classList.toggle("show-setting-menu");
}

function handlePlaybackRate(e) {
  video.playbackRate = parseFloat(e.target.dataset.value);
  speedButtons.forEach((btn) => {
    btn.classList.remove("speed-active");
  });
  e.target.classList.add("speed-active");
  settingMenu.classList.remove("show-setting-menu");
}

function handlePlaybackRateKey(type = "") {
  if (type === "increase" && video.playbackRate < 2) {
    video.playbackRate += 0.25;
  } else if (video.playbackRate > 0.25 && type !== "increase") {
    video.playbackRate -= 0.25;
  }
  handleMainStateIcon(
    `<span style="font-size: 1.4rem">${video.playbackRate}x</span>`
  );
  speedButtons.forEach((btn) => {
    btn.classList.remove("speed-active");
    if (btn.dataset.value == video.playbackRate) {
      btn.classList.add("speed-active");
    }
  });
}

function handleShorthand(e) {
  const tagName = document.activeElement.tagName.toLowerCase();
  if (tagName === "input") return;
  if (e.key.match(/[0-9]/gi)) {
    video.currentTime = (video.duration / 100) * (parseInt(e.key) * 10);
    currentTime.style.width = parseInt(e.key) * 10 + "%";
  }
  switch (e.key.toLowerCase()) {
    case " ":
      if (tagName === "button") return;
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      break;
    case "f":
      toggleFullscreen();
      break;
    case "arrowright":
      handleForward();
      break;
    case "arrowleft":
      handleBackward();
      break;
    case "t":
      toggleTheater();
      break;
    case "i":
      toggleMiniPlayer();
      break;
    case "m":
      toggleMuteUnmute();
      break;
    case "+":
      handlePlaybackRateKey("increase");
      break;
    case "-":
      handlePlaybackRateKey();
      break;

    default:
      break;
  }
}
 /* // Add this code at the end of your existing JavaScript code

function toggleIconsForTheaterMode() {
  const theaterBtn = document.querySelector(".theater-btn");
  const tabletLandscapeIcon = theaterBtn.querySelector(".theater-default");
  const tvIcon = theaterBtn.querySelector(".theater-active");
  const videoContainer = document.querySelector(".video-container");

  if (videoContainer.classList.contains("theater")) {
    tabletLandscapeIcon.style.display = "none";
    tvIcon.style.display = "flex";
  } else {
    tabletLandscapeIcon.style.display = "flex";
    tvIcon.style.display = "none";
  }
}

// Call the function initially to set the icons correctly
toggleIconsForTheaterMode();

  function toggleTheater() {
  const videoContainer = document.querySelector(".video-container");
  videoContainer.classList.toggle("theater");
  toggleIconsForTheaterMode();
}*/