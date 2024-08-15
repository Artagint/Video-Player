const togglePlayBtn = document.querySelector(".toggle-play-btn");
const theaterModeBtn = document.querySelector(".theater-mode-btn");
const fullscreenModeBtn = document.querySelector(".fullscreen-mode-btn");
const miniModeBtn = document.querySelector(".mini-mode-btn");
const muteUnmuteBtn = document.querySelector(".mute-unmute-btn");
const speedControlBtn = document.querySelector(".playback-rate-btn");
const currentTimeDisplay = document.querySelector(".current-time");
const totalTimeDisplay = document.querySelector(".total-duration");
const previewThumbnail = document.querySelector(".preview-thumbnail");
const posterImage = document.querySelector(".poster-img");
const volumeControlSlider = document.querySelector(".volume-slider");
const mediaContainer = document.querySelector(".media-container");
const progressBarContainer = document.querySelector(".progress-bar-container");
const video = document.querySelector("video");

// Switch cases that listen for a keydown event and act according to the keypress
document.addEventListener("keydown", (e) => {
  const tagName = document.activeElement.tagName.toLowerCase();

  if (tagName === "input") return;

  switch (e.key.toLowerCase()) {
    case " ":
      if (tagName === "button") return;
    case "k":
      togglePlay();
      break;
    case "f":
      toggleFullScreenMode();
      break;
    case "t":
      toggleTheaterMode();
      break;
    case "i":
      toggleMiniPlayerMode();
      break;
    case "m":
      toggleMute();
      break;
    case "arrowleft":
    case "j":
      skip(-5);
      break;
    case "arrowright":
    case "l":
      skip(5);
      break;
  }
});

// Toggle scrubbing functionality (click-and-drag to skip through the video)
progressBarContainer.addEventListener("mousemove", handleTimelineUpdate);
progressBarContainer.addEventListener("mousedown", toggleScrubbing);
document.addEventListener("mouseup", (e) => {
  if (isScrubbing) toggleScrubbing(e);
});
document.addEventListener("mousemove", (e) => {
  if (isScrubbing) handleTimelineUpdate(e);
});

let isScrubbing = false;
let wasPaused;

// Enable or disable scrubbing (allows skipping through the video by dragging)
function toggleScrubbing(e) {
  const rect = progressBarContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  isScrubbing = (e.buttons & 1) === 1;
  mediaContainer.classList.toggle("scrubbing", isScrubbing);
  if (isScrubbing) {
    wasPaused = video.paused;
    video.pause();
  } else {
    video.currentTime = percent * video.duration;
    if (!wasPaused) video.play();
  }

  handleTimelineUpdate(e);
}

// Handle timeline updates (preview images, progress bar position, etc.)
function handleTimelineUpdate(e) {
  const rect = progressBarContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  const previewImgNumber = Math.max(
    1,
    Math.floor((percent * video.duration) / 10)
  );
  const previewImgSrc = `assets/previewImgs/preview${previewImgNumber}.jpg`;
  previewThumbnail.src = previewImgSrc;
  progressBarContainer.style.setProperty("--preview-position", percent);

  if (isScrubbing) {
    e.preventDefault();
    posterImage.src = previewImgSrc;
    progressBarContainer.style.setProperty("--progress-position", percent);
  }
}

// Change playback speed (cycle through 0.25x to 2x)
speedControlBtn.addEventListener("click", changePlaybackSpeed);

function changePlaybackSpeed() {
  let newPlaybackRate = video.playbackRate + 0.25;
  if (newPlaybackRate > 2) newPlaybackRate = 0.25;
  video.playbackRate = newPlaybackRate;
  speedControlBtn.textContent = `${newPlaybackRate}x`;
}

// Format and display the total duration of the video
video.addEventListener("loadeddata", () => {
  totalTimeDisplay.textContent = formatDuration(video.duration);
});

// Update current time display and progress bar during video playback
video.addEventListener("timeupdate", () => {
  currentTimeDisplay.textContent = formatDuration(video.currentTime);
  const percent = video.currentTime / video.duration;
  progressBarContainer.style.setProperty("--progress-position", percent);
});

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2,
});

// Format time in HH:MM:SS or MM:SS depending on video length
function formatDuration(time) {
  const seconds = Math.floor(time % 60);
  const minutes = Math.floor(time / 60) % 60;
  const hours = Math.floor(time / 3600);
  if (hours === 0) {
    return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
  } else {
    return `${hours}:${leadingZeroFormatter.format(
      minutes
    )}:${leadingZeroFormatter.format(seconds)}`;
  }
}

// Skip forward or backward in the video by a given duration
function skip(duration) {
  video.currentTime += duration;
}

// Toggle mute/unmute and update volume slider
muteUnmuteBtn.addEventListener("click", toggleMute);
volumeControlSlider.addEventListener("input", (e) => {
  video.volume = e.target.value;
  video.muted = e.target.value === 0;
});

function toggleMute() {
  video.muted = !video.muted;
}

// Update volume display (high, low, muted) based on volume level
video.addEventListener("volumechange", () => {
  volumeControlSlider.value = video.volume;
  let volumeLevel;
  if (video.muted || video.volume === 0) {
    volumeControlSlider.value = 0;
    volumeLevel = "muted";
  } else if (video.volume >= 0.5) {
    volumeLevel = "high";
  } else {
    volumeLevel = "low";
  }

  mediaContainer.dataset.volumeLevel = volumeLevel;
});

// Toggle between theater mode, fullscreen mode, and mini-player mode
theaterModeBtn.addEventListener("click", toggleTheaterMode);
fullscreenModeBtn.addEventListener("click", toggleFullScreenMode);
miniModeBtn.addEventListener("click", toggleMiniPlayerMode);

function toggleTheaterMode() {
  mediaContainer.classList.toggle("theater-mode");
}

// Toggle fullscreen mode on and off
function toggleFullScreenMode() {
  if (document.fullscreenElement == null) {
    mediaContainer.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// Toggle mini-player mode (Picture-in-Picture)
function toggleMiniPlayerMode() {
  if (mediaContainer.classList.contains("mini-player")) {
    document.exitPictureInPicture();
  } else {
    video.requestPictureInPicture();
  }
}

// Monitor fullscreen changes and update classes accordingly
document.addEventListener("fullscreenchange", () => {
  mediaContainer.classList.toggle(
    "fullscreen-mode",
    document.fullscreenElement
  );
});

// Update classes when entering or leaving Picture-in-Picture mode
video.addEventListener("enterpictureinpicture", () => {
  mediaContainer.classList.add("mini-player");
});

video.addEventListener("leavepictureinpicture", () => {
  mediaContainer.classList.remove("mini-player");
});

// Toggle between play and pause states when clicking the button or video
togglePlayBtn.addEventListener("click", togglePlay);
video.addEventListener("click", togglePlay);

function togglePlay() {
  video.paused ? video.play() : video.pause();
}

// Update classes based on whether the video is playing or paused
video.addEventListener("play", () => {
  mediaContainer.classList.remove("paused");
});

video.addEventListener("pause", () => {
  mediaContainer.classList.add("paused");
});
