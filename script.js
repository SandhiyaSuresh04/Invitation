
"use strict";

/* ELEMENTS */

const firstPage = document.getElementById("page1");
const door = document.getElementById("templeDoor");
const openingEnvelope = document.getElementById("openingEnvelope");
const scrollStage = document.getElementById("scrollStage");
const weddingPage = document.getElementById("page4");
const receptionPage = document.getElementById("page5");
const thankYouPage = document.getElementById("page6");
const photoPage = document.getElementById("page7");
const finalMessagePage = document.getElementById("page8");
const finalPhoto = document.getElementById("finalCouplePhoto");
const music = document.getElementById("weddingMusic");
const musicButton = document.getElementById("musicToggle");
const canvas = document.getElementById("scratchCanvas");
const scratchArea = document.getElementById("dateScratch");
const ctx = canvas ? canvas.getContext("2d") : null;

let currentPage = 1;
let doorOpened = false;
let envelopeRunning = false;
let invitationRevealed = false;
let thankYouReady = false;
let scratching = false;
let dateRevealed = false;
let scratchPrepared = false;
let scratchedPoints = 0;
let lastScratchPosition = null;
let lastPetalTime = 0;
let activePetals = 0;

const MAX_ACTIVE_PETALS = 65;

/* PAGE NAVIGATION */

function showPage(number) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  if (number >= 2 && number <= 5) {
    scrollStage.classList.add("active");

    if (number === 2) {
      scrollStage.scrollTop = 0;
    }
  } else {
    scrollStage.classList.remove("active");

    const page = document.getElementById("page" + number);
    if (page) page.classList.add("active");
  }

  currentPage = number;

  if (number === 6) {
    thankYouReady = false;

    setTimeout(() => {
      if (currentPage === 6) {
        thankYouReady = true;
      }
    }, 2400);
  }

  if (number === 7) {
    preloadFinalPhoto();
  }

  if (number === 8) {
    if (music) music.pause();
    updateMusicButton();
  }
}

/* TEMPLE DOOR */

function openDoor(event) {
  if (event) event.stopPropagation();

  if (doorOpened || door.classList.contains("opening")) {
    return;
  }

  door.classList.add("opening");

  if (music && musicButton) {
    musicButton.hidden = false;
    music.volume = 0.65;

    music.play()
      .then(updateMusicButton)
      .catch(updateMusicButton);
  }

  setTimeout(() => {
    door.classList.add("opened");
    firstPage.classList.add("door-finished");
    doorOpened = true;
  }, 2450);
}

door.addEventListener("click", openDoor);

door.addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openDoor(event);
  }
});

/* ENVELOPE OPENING */

firstPage.addEventListener("click", event => {
  if (event.target.closest("#templeDoor")) return;
  if (!doorOpened || envelopeRunning) return;

  envelopeRunning = true;
  openingEnvelope.classList.remove("play");

  void openingEnvelope.offsetWidth;
  openingEnvelope.classList.add("play");

  setTimeout(() => {
    showPage(2);
    requestAnimationFrame(prepareScratch);
  }, 3600);

  setTimeout(() => {
    invitationRevealed = true;
    envelopeRunning = false;
    openingEnvelope.classList.remove("play");
  }, 5100);
});

/* SCROLL PAGES 2 TO 5 */

function updateScrollPage() {
  if (!invitationRevealed) return;

  const height = scrollStage.clientHeight || window.innerHeight;
  const position = scrollStage.scrollTop;

  if (position >= height * 2.7) {
    currentPage = 5;
    weddingPage.classList.add("curtains-open");
  } else if (position >= height * 1.7) {
    currentPage = 4;
    weddingPage.classList.add("curtains-open");
  } else if (position >= height * 0.7) {
    currentPage = 3;
  } else {
    currentPage = 2;
  }
}

scrollStage.addEventListener("scroll", updateScrollPage, {
  passive: true
});


/* RECEPTION -> THANK YOU
   Reception page stays visible.
   Only an additional swipe up or tap continues.
*/

let receptionReady = false;
let receptionTimer = null;
let receptionTouchStartY = null;

function atReceptionBottom() {
  return (
    scrollStage.scrollTop + scrollStage.clientHeight >=
    scrollStage.scrollHeight - 12
  );
}

function prepareReceptionTransition() {
  if (currentPage !== 5 || receptionReady || receptionTimer) {
    return;
  }

  receptionTimer = setTimeout(() => {
    receptionReady = true;
    receptionTimer = null;
  }, 1500);
}

function goToThankYou() {
  if (
    !invitationRevealed ||
    currentPage !== 5 ||
    !receptionReady ||
    !atReceptionBottom()
  ) {
    return;
  }

  showPage(6);
}

scrollStage.addEventListener("scroll", () => {
  if (atReceptionBottom()) {
    prepareReceptionTransition();
  } else {
    receptionReady = false;
    clearTimeout(receptionTimer);
    receptionTimer = null;
  }
}, { passive: true });

scrollStage.addEventListener("touchstart", event => {
  receptionTouchStartY = event.touches[0].clientY;
}, { passive: true });

scrollStage.addEventListener("touchend", event => {
  if (receptionTouchStartY === null) return;

  const distance =
    receptionTouchStartY - event.changedTouches[0].clientY;

  receptionTouchStartY = null;

  if (distance > 45) {
    goToThankYou();
  }
}, { passive: true });

scrollStage.addEventListener("wheel", event => {
  if (event.deltaY > 12) {
    goToThankYou();
  }
}, { passive: true });

receptionPage.addEventListener("click", event => {
  if (event.target.closest("a, button")) return;

  goToThankYou();
});

/* THANK YOU -> COUPLE PHOTO */

thankYouPage.addEventListener("click", event => {
  if (event.target.closest("a, button")) return;
  if (currentPage !== 6) return;

  if (!thankYouReady) {
    return;
  }

  showPage(7);
});

/* PRELOAD TRADITIONAL PHOTO */

let finalPhotoPreload = null;

function preloadFinalPhoto() {
  if (finalPhotoPreload) return;

  finalPhotoPreload = new Image();
  finalPhotoPreload.src = "images/traditional-couple.jpg";

  finalPhotoPreload.onerror = () => {
    console.error(
      "Photo not found: images/traditional-couple.jpg"
    );
  };
}

window.addEventListener("load", () => {
  setTimeout(preloadFinalPhoto, 400);
});

/* COUPLE PHOTO -> FINAL MESSAGE */

function openFinalMessage() {
  if (currentPage !== 7) return;
  showPage(8);
}

photoPage.addEventListener("click", openFinalMessage);

photoPage.addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openFinalMessage();
  }
});

/* MUSIC */

function updateMusicButton() {
  if (!music || !musicButton) return;

  const playing = !music.paused && !music.muted;

  musicButton.textContent = playing ? "♫" : "♪";

  musicButton.setAttribute(
    "aria-label",
    playing ? "Mute music" : "Play music"
  );
}

if (music && musicButton) {
  musicButton.addEventListener("click", event => {
    event.stopPropagation();

    if (music.paused) {
      music.muted = false;

      music.play()
        .then(updateMusicButton)
        .catch(updateMusicButton);
    } else {
      music.muted = !music.muted;
      updateMusicButton();
    }
  });
}

/* WEDDING COUNTDOWN */

const weddingDate =
  new Date("2026-11-16T06:00:00+05:30").getTime();

function updateCountdown() {
  const remaining = Math.max(0, weddingDate - Date.now());
  const count = document.getElementById("countdown");

  if (remaining === 0) {
    if (!count.classList.contains("finished")) {
      count.classList.add("finished");
      count.textContent = "Our Forever Begins Today!";
    }
    return;
  }

  const values = {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor(remaining / 3600000) % 24,
    minutes: Math.floor(remaining / 60000) % 60,
    seconds: Math.floor(remaining / 1000) % 60
  };

  Object.entries(values).forEach(([key, value]) => {
    const element = document.getElementById(key);

    if (element) {
      element.textContent = String(value).padStart(2, "0");
    }
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* GOLD SCRATCH */

function prepareScratch() {
  if (!canvas || !ctx || dateRevealed || scratchPrepared) return;

  const rect = canvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;

  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = "source-over";

  const gradient = ctx.createLinearGradient(
    0, 0, rect.width, rect.height
  );

  gradient.addColorStop(0, "#b18445");
  gradient.addColorStop(.25, "#e7c58a");
  gradient.addColorStop(.5, "#f8e6b9");
  gradient.addColorStop(.75, "#d4a760");
  gradient.addColorStop(1, "#a87536");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, rect.width, rect.height);

  ctx.fillStyle = "#663b20";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const fontSize = Math.max(
    9,
    Math.min(17, rect.width * .07)
  );

  ctx.font = `bold ${fontSize}px Georgia`;

  ctx.fillText(
    "SCRATCH TO REVEAL",
    rect.width / 2,
    rect.height / 2,
    rect.width * .94
  );

  scratchPrepared = true;
}

/* RED ROSE PETALS */

function createRosePetals(count = 8) {
  for (let i = 0; i < count; i++) {
    if (activePetals >= 65) break;

    const petal = document.createElement("span");
    petal.className = "scratch-rose-petal";

    petal.style.left = Math.random() * 100 + "vw";
    petal.style.width = (10 + Math.random() * 12) + "px";
    petal.style.height = (14 + Math.random() * 16) + "px";

    petal.style.setProperty(
      "--drift",
      (Math.random() * 180 - 90) + "px"
    );

    petal.style.setProperty(
      "--rotation",
      (360 + Math.random() * 540) + "deg"
    );

    petal.style.animationDuration =
      (3.5 + Math.random() * 2.5) + "s";

    petal.style.animationDelay =
      (Math.random() * .25) + "s";

    document.body.appendChild(petal);
    activePetals++;

    petal.addEventListener("animationend", () => {
      petal.remove();
      activePetals = Math.max(0, activePetals - 1);
    }, { once: true });
  }
}

function releasePetalsDuringScratch() {
  const now = performance.now();

  if (now - lastPetalTime < 130) return;

  lastPetalTime = now;
  createRosePetals(3);
}

/* COMPLETE SCRATCH */

function finishScratch() {
  if (dateRevealed) return;

  dateRevealed = true;
  scratching = false;

  scratchArea.classList.add("revealed");
  createRosePetals(18);
}

/* POINTER SCRATCH */

function scratchAt(event) {
  if (!scratching || dateRevealed || !ctx || !canvas) return;

  event.preventDefault();

  if (!scratchPrepared) prepareScratch();
  if (!scratchPrepared) return;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  ctx.globalCompositeOperation = "destination-out";
  ctx.lineWidth = 42;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  if (lastScratchPosition) {
    ctx.moveTo(lastScratchPosition.x, lastScratchPosition.y);
    ctx.lineTo(x, y);
    ctx.stroke();
  } else {
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  lastScratchPosition = { x, y };
  scratchedPoints++;

  releasePetalsDuringScratch();

  if (scratchedPoints >= 25) finishScratch();
}

if (canvas) {
  canvas.addEventListener("pointerdown", event => {
    if (dateRevealed) return;

    if (!scratchPrepared) prepareScratch();

    scratching = true;
    lastScratchPosition = null;
    createRosePetals(10);
    lastPetalTime = performance.now();

    try {
      canvas.setPointerCapture(event.pointerId);
    } catch (error) {
      // Optional on unsupported devices.
    }

    scratchAt(event);
  });

  canvas.addEventListener("pointermove", scratchAt);

  canvas.addEventListener("pointerup", () => {
    scratching = false;
    lastScratchPosition = null;
  });

  canvas.addEventListener("pointercancel", () => {
    scratching = false;
    lastScratchPosition = null;
  });
}

scratchArea.addEventListener("click", event => {
  event.stopPropagation();
});

/* RESIZE */

window.addEventListener("resize", () => {
  if (!dateRevealed && scratchPrepared && !scratching) {
    scratchPrepared = false;
    prepareScratch();
  }
});

/* INITIALIZE */

showPage(1);
