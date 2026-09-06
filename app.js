// =====================================================================
// MUSEUM AR COLLECTION — Main App
// Artworks are now loaded dynamically (built-in + Firebase uploads)
// =====================================================================
const FIREBASE_URL = "https://gbrmuseumtest-default-rtdb.asia-southeast1.firebasedatabase.app";
const BACKGROUND_IMAGE = "./assets/background.jpg";

// -------------------------------------------------------------------
// Built-in artworks (local assets). Uploaded artworks are merged
// from Firebase at runtime.
// -------------------------------------------------------------------
const BUILTIN_ARTWORKS = [
  {
    id: "builtin-mona",
    name: "Mona Lisa",
    image: "./assets/mona-marker.jpg",
    artist: "Leonardo da Vinci",
    year: "c. 1503–1506",
    location: "The Louvre, Paris, France",
    details:
      "Painted by Leonardo da Vinci in the early 1500s, this portrait is one of the most " +
      "recognized paintings in the world, known for its subtle, ambiguous smile and soft " +
      "transitions of light and shadow. It has hung in the Louvre in Paris since the museum " +
      "opened to the public.",
    markerImage: "./assets/mona-marker.jpg",
    modelObj: "./assets/monalisa-centered.obj",
    modelMtl: "./assets/monalisa.mtl",
    baseScale: 0.003,
    icon: "🖼️",
    unlocked: false,
    quizCompleted: false,
    quiz: [
      {
        question: "Who painted the Mona Lisa?",
        options: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Titian"],
        correctIndex: 1,
      },
      {
        question: "Which museum currently displays the Mona Lisa?",
        options: ["The British Museum", "The Uffizi Gallery", "The Louvre", "The Prado"],
        correctIndex: 2,
      },
      {
        question: "The painting is best known for its...",
        options: ["Bright, bold colors", "Enigmatic smile", "Large size", "Use of gold leaf"],
        correctIndex: 1,
      },
    ],
  },
    {
    id: "builtin-crisanto",
    name: "Portrait of Crisanto de los Reyes y Mendoza",
    image: "./assets/crisanto-marker.jpg",
    artist: "Rafael del Casal",
    year: "Undated",
    location: "GBR Jr. Museum, General Trias, Philippines",
    details:
      "Crisanto de los Reyes was born on October 25, 1828 to a Chinese mestizo couple " +
      "Gregorio de los Reyes and Dominga Mendoza of Quiapo. From his salary as a tenedor de libros " +
      "(book-keeper) he got into the business of buying scrap metals, later acquiring properties in " +
      "Binondo which he converted into almacenes (warehouses). He married Dorotea de los Reyes y Vergara " +
      "and bore five children. Among his businesses was a distillery of ylang-ylang (Cananga odorata) oil, " +
      "a sought-after ingredient for French perfumes, and a tobacco factory along Calle Alix (present-day Legarda). " +
      "He was implicated in the 1872 Cavite Mutiny and exiled to Cartagena, Spain, returning in 1877 after " +
      "an amnesty from King Alfonso XII. He died on July 4, 1895. In 2007, Republic Act No. 9476 renamed " +
      "the Gen. Trias – Amadeo – Tagaytay Road (formerly Governor's Drive) to Crisanto M. De los Reyes.\n\n" +
      "Portrait of Crisanto de los Reyes y Mendoza\nRafael del Casal\nOil on canvas\nUndated",
    markerImage: "./assets/crisanto-marker.jpg",
    modelObj: "./assets/crisanto.optimized.glb",
    modelMtl: null,
    baseScale: 0.5,
    icon: "🎨",
    immersiveSkybox: "./assets/crisantoskybox.optimized.glb",
    immersiveScale: 1,
    immersiveRotation: "0 0 0",
    unlocked: false,
    quizCompleted: false,
    quiz: [
      {
        question: "Who painted the Portrait of Crisanto de los Reyes y Mendoza?",
        options: ["Juan Luna", "Rafael del Casal", "Fernando Amorsolo", "Felix Resurreccion Hidalgo"],
        correctIndex: 1,
      },
      {
        question: "Crisanto de los Reyes was implicated in which historical event?",
        options: ["The Philippine Revolution of 1896", "The 1872 Cavite Mutiny", "The Gomburza execution", "The Cry of Pugad Lawin"],
        correctIndex: 1,
      },
      {
        question: "Which of Crisanto's businesses produced an ingredient used in French perfumes?",
        options: ["Sugar plantation", "Ylang-ylang oil distillery", "Coffee roasting factory", "Coconut oil mill"],
        correctIndex: 1,
      },
    ],
  },
    {
    id: "builtin-mcarthur",
    name: "MacArthur",
    image: "./assets/mcarthurmarker.jpg",
    artist: "",
    year: "",
    location: "",
    details: "Add the MacArthur artwork description here.",
    markerImage: "./assets/mcarthurmarker.jpg",
    modelObj: "./assets/mcarthur.optimized.glb",
    modelMtl: null,
    baseScale: 1,
    icon: "🎖️",
    unlocked: false,
    quizCompleted: false,
    quiz: [],
    immersiveSkybox: "./assets/beachskybox.optimized.glb",
    immersiveScale: 3.5,       
    immersiveRotation: "0 270 0",
    markerRotation: "0 270 0",   
  },

];

// Mutable artworks array — populated by initArtworks()
let artworks = [];

// =====================================================================
// BADGES
// =====================================================================
const badges = {
  firstScan: {
    id: "firstScan",
    name: "First Scan",
    description: "Scan your very first artwork",
    icon: "🔍",
    earned: false,
  },
  firstQuiz: {
    id: "firstQuiz",
    name: "First Quiz",
    description: "Complete your first quiz",
    icon: "📝",
    earned: false,
  },
};

function allBadgesEarned() {
  return Object.values(badges).every((b) => b.earned);
}

// -------------------------------------------------------------------
// DOM references
// -------------------------------------------------------------------
const screenUsername = document.getElementById("screen-username");
const usernameInput = document.getElementById("username-input");
const btnUsernameSubmit = document.getElementById("btn-username-submit");

const screenHome = document.getElementById("screen-home");
const screenScanner = document.getElementById("screen-scanner");
const screenDetail = document.getElementById("screen-detail");
const screenQuiz = document.getElementById("screen-quiz");
const screenBadges = document.getElementById("screen-badges");
const screenLeaderboard = document.getElementById("screen-leaderboard");

const bottomNav = document.getElementById("bottom-nav");
const navButtons = document.querySelectorAll(".nav-btn");

const galleryGrid = document.getElementById("gallery-grid");
const progressFill = document.getElementById("progress-fill");
const progressLabel = document.getElementById("progress-label");
const scanHint = document.getElementById("scan-hint");

const filterButtons = document.querySelectorAll(".filter-btn");
const filterToast = document.getElementById("filter-toast");

const unlockModal = document.getElementById("unlock-modal");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");

const badgeToast = document.getElementById("badge-toast");
const badgeToastIcon = document.getElementById("badge-toast-icon");
const badgeToastText = document.getElementById("badge-toast-text");

const loadingScreen = document.getElementById("loading-screen");
const loadingText = document.getElementById("loading-text");
const loadingProgressFill = document.getElementById("loading-progress-fill");
const loadingProgressText = document.getElementById("loading-progress-text");
const permissionError = document.getElementById("permission-error");
const btnInstallApp = document.getElementById("btn-install-app");
const installAppHint = document.getElementById("install-app-hint");

const btnBackHome = document.getElementById("btn-back-home");
const btnKeepScanning = document.getElementById("btn-keep-scanning");
const btnViewCollection = document.getElementById("btn-view-collection");

const detailImage = document.getElementById("detail-image");
const detailTitle = document.getElementById("detail-title");
const detailText = document.getElementById("detail-text");
const btnDetailBack = document.getElementById("btn-detail-back");
const btnTakeQuiz = document.getElementById("btn-take-quiz");
const quizDoneNote = document.getElementById("quiz-done-note");

const quizProgress = document.getElementById("quiz-progress");
const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options");
const quizFeedback = document.getElementById("quiz-feedback");
const btnQuizNext = document.getElementById("btn-quiz-next");
const btnQuizBack = document.getElementById("btn-quiz-back");

const btnOpenBadges = document.getElementById("btn-open-badges");
const btnBadgesBack = document.getElementById("btn-badges-back");
const badgesGrid = document.getElementById("badges-grid");

const screenLibrary = document.getElementById("screen-library");
const btnOpenLibrary = document.getElementById("btn-open-library");
const btnLibraryBack = document.getElementById("btn-library-back");
const libraryList = document.getElementById("library-list");

const libraryDetailModal = document.getElementById("library-detail-modal");
const libraryDetailImage = document.getElementById("library-detail-image");
const libraryDetailTitle = document.getElementById("library-detail-title");
const libraryDetailText = document.getElementById("library-detail-text");
const libraryDetailBadge = document.getElementById("library-detail-badge");
const btnLibraryDetailClose = document.getElementById("btn-library-detail-close");
const metaRowArtist = document.getElementById("meta-row-artist");
const metaArtist = document.getElementById("meta-artist");
const metaRowYear = document.getElementById("meta-row-year");
const metaYear = document.getElementById("meta-year");
const metaRowLocation = document.getElementById("meta-row-location");
const metaLocation = document.getElementById("meta-location");

const chatHeadBtn = document.getElementById("chat-head-btn");
const chatPanel = document.getElementById("chat-panel");
const btnChatClose = document.getElementById("btn-chat-close");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const btnChatSend = document.getElementById("btn-chat-send");

const screenSettings = document.getElementById("screen-settings");
const btnOpenSettings = document.getElementById("btn-open-settings");
const btnSettingsBack = document.getElementById("btn-settings-back");
const settingsCurrentName = document.getElementById("settings-current-name");
const settingsChangeName = document.getElementById("settings-change-name");
const settingsReplayTutorial = document.getElementById("settings-replay-tutorial");

const leaderboardList = document.getElementById("leaderboard-list");
const notesBoardWrap = document.getElementById("notes-board-wrap");
const notesBoard = document.getElementById("notes-board");
const btnNewNote = document.getElementById("btn-new-note");
const notesLockedMsg = document.getElementById("notes-locked-msg");
const btnBoardZoomIn = document.getElementById("btn-board-zoom-in");
const btnBoardZoomOut = document.getElementById("btn-board-zoom-out");
const btnBoardZoomReset = document.getElementById("btn-board-zoom-reset");

const noteEditorModal = document.getElementById("note-editor-modal");
const noteEditorHeading = document.getElementById("note-editor-heading");
const noteEditorEyebrow = document.getElementById("note-editor-eyebrow");
const noteTabs = document.querySelectorAll(".note-tab");
const noteColorSwatches = document.getElementById("note-color-swatches");
const noteTextInput = document.getElementById("note-text-input");
const noteDrawWrap = document.getElementById("note-draw-wrap");
const noteCanvas = document.getElementById("note-canvas");
const btnClearDrawing = document.getElementById("btn-clear-drawing");

const notePhotoWrap = document.getElementById("note-photo-wrap");
const notePhotoPreview = document.getElementById("note-photo-preview");
const notePhotoResult = document.getElementById("note-photo-result");
const notePhotoError = document.getElementById("note-photo-error");
const btnSnapPhoto = document.getElementById("btn-snap-photo");
const btnRetakePhoto = document.getElementById("btn-retake-photo");
const btnNoteDelete = document.getElementById("btn-note-delete");
const btnNoteCancel = document.getElementById("btn-note-cancel");
const btnNotePost = document.getElementById("btn-note-post");

const noteViewModal = document.getElementById("note-view-modal");
const noteViewContent = document.getElementById("note-view-content");
const noteViewName = document.getElementById("note-view-name");
const btnNoteViewClose = document.getElementById("btn-note-view-close");

const arContainer = document.getElementById("ar-container");
const screenImmersive = document.getElementById("screen-immersive");
const immersiveContainer = document.getElementById("immersive-container");
const btnImmersiveBack = document.getElementById("btn-immersive-back");
const btnImmersive = document.getElementById("btn-immersive");

// Browsers decide whether an install prompt is available. Installed launches use
// the manifest's standalone display mode, which removes browser chrome.
const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

function updateInstallUI() {
  if (isStandalone) {
    btnInstallApp.classList.add("hidden");
    installAppHint.classList.add("hidden");
    return;
  }

  // Android / PC: native prompt captured by early script in <head>
  if (window.deferredInstallPrompt && !isIOS) {
    btnInstallApp.textContent = "Install Museum App";
    btnInstallApp.classList.remove("hidden");
    installAppHint.classList.add("hidden");
    return;
  }

  // iOS: native prompt is impossible — show manual help
  if (isIOS) {
    btnInstallApp.textContent = "How to Install";
    btnInstallApp.classList.remove("hidden");
    installAppHint.textContent = "Tap the button above for iOS install steps.";
    installAppHint.classList.remove("hidden");
    return;
  }
}

btnInstallApp.addEventListener("click", async () => {
  if (isIOS) {
    alert("To install on iPhone/iPad:\n\n1. Tap the Share button (⬆️) in Safari's toolbar\n2. Scroll down and tap 'Add to Home Screen'\n3. Tap 'Add'");
    return;
  }
  const prompt = window.deferredInstallPrompt;
  if (!prompt) return;
  prompt.prompt();
  await prompt.userChoice;
  window.deferredInstallPrompt = null;
  btnInstallApp.classList.add("hidden");
});

window.addEventListener("appinstalled", () => {
  window.deferredInstallPrompt = null;
  btnInstallApp.classList.add("hidden");
  installAppHint.classList.add("hidden");
});

// Run now, and also re-run if the late event fires
updateInstallUI();
window.addEventListener('beforeinstallprompt', () => updateInstallUI());

// -------------------------------------------------------------------
// Username / session
// -------------------------------------------------------------------
let currentUsername = null;
let sessionStartTime = null;
let leaderboardSubmitted = false;
const PROGRESS_STORAGE_KEY = "museum_progress_v1";

function persistProgress() {
  const progress = {
    username: currentUsername,
    unlocked: artworks.filter((art) => art.unlocked).map((art) => art.id),
    quizCompleted: artworks.filter((art) => art.quizCompleted).map((art) => art.id),
    badges: Object.fromEntries(Object.entries(badges).map(([key, badge]) => [key, badge.earned]))
  };
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

function restoreProgress() {
  try {
    const progress = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) || "null");
    if (!progress) return;
    currentUsername = progress.username || null;
    const unlocked = new Set(progress.unlocked || []);
    const quizCompleted = new Set(progress.quizCompleted || []);
    artworks.forEach((art) => {
      art.unlocked = unlocked.has(art.id);
      art.quizCompleted = quizCompleted.has(art.id);
    });
    Object.entries(progress.badges || {}).forEach(([key, earned]) => {
      if (badges[key]) badges[key].earned = Boolean(earned);
    });
  } catch (error) {
    console.warn("Could not restore saved museum progress:", error);
  }
}

btnUsernameSubmit.addEventListener("click", submitUsername);
usernameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitUsername();
});

function submitUsername() {
  const name = usernameInput.value.trim();
  if (!name) {
    usernameInput.focus();
    return;
  }
  currentUsername = name;
  persistProgress();
  if (!sessionStartTime) sessionStartTime = Date.now();
  screenUsername.classList.add("hidden");
  if (returningToScreenAfterNameChange) {
    returningToScreenAfterNameChange();
    returningToScreenAfterNameChange = null;
  } else {
    showHome();
    initTour();
  }
}

let returningToScreenAfterNameChange = null;

settingsChangeName.addEventListener("click", () => {
  usernameInput.value = currentUsername || "";
  returningToScreenAfterNameChange = showSettings;
  screenUsername.classList.remove("hidden");
});
settingsReplayTutorial.addEventListener("click", () => {
  localStorage.removeItem("museum_tour_seen");
  showHome();
  initTour();
});

// -------------------------------------------------------------------
// Device ID
// -------------------------------------------------------------------
function getDeviceId() {
  let id = localStorage.getItem("museum_device_id");
  if (!id) {
    id = "d_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("museum_device_id", id);
  }
  return id;
}
const myDeviceId = getDeviceId();

const homeBgLayer = document.getElementById("home-bg-layer");
const homeBgImg = document.getElementById("home-bg-img");
const homeBgOverlay = document.querySelector(".home-bg-overlay");

(function tryApplyBackground() {
  const test = new Image();
  test.onload = () => {
    homeBgImg.src = BACKGROUND_IMAGE;
    homeBgImg.classList.add("visible");
    homeBgOverlay.classList.add("visible");
  };
  test.onerror = () => {};
  test.src = BACKGROUND_IMAGE;
})();

function setBgLayerForScreen(isCameraScreen) {
  homeBgLayer.classList.toggle("ar-mode", isCameraScreen);
  chatHeadBtn.classList.toggle("hidden", isCameraScreen);
  if (isCameraScreen) chatPanel.classList.add("hidden");
}

// -------------------------------------------------------------------
// Bottom nav
// -------------------------------------------------------------------
navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    setActiveNav(tab);
    if (tab === "home") showHome();
    else if (tab === "scanner") showScanner();
    else if (tab === "leaderboard") showLeaderboard();
  });
});

function setActiveNav(tab) {
  navButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tab));
}

// -------------------------------------------------------------------
// Gallery filter state
// -------------------------------------------------------------------
let activeFilter = "all";

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const clicked = btn.dataset.filter;
    activeFilter = activeFilter === clicked ? "all" : clicked;
    updateFilterButtonStyles();
    renderGallery();
    if (activeFilter !== "all") showFilterToast(`Showing ${activeFilter} artworks`);
    else hideFilterToast();
  });
});

function updateFilterButtonStyles() {
  filterButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.filter === activeFilter));
}

let toastTimer = null;
function showFilterToast(msg) {
  filterToast.textContent = msg;
  filterToast.classList.remove("hidden");
  clearTimeout(toastTimer);
}
function hideFilterToast() {
  filterToast.classList.add("hidden");
}

// -------------------------------------------------------------------
// Gallery rendering
// -------------------------------------------------------------------
function renderGallery() {
  galleryGrid.innerHTML = "";

  // Only the built-in 3D-model artworks belong in the locked/unlocked
  // gallery. Firebase-uploaded artworks are marker-only (no modelObj) and
  // are intentionally excluded here — they still unlock and show up in
  // the Library, just not as gallery cards.
  const galleryArtworks = artworks.filter((a) => a.modelObj);

  const visible = galleryArtworks.filter((art) => {
    if (activeFilter === "locked") return !art.unlocked;
    if (activeFilter === "unlocked") return art.unlocked;
    return true;
  });

  visible.forEach((art) => {
    const card = document.createElement("div");
    card.className = "art-card " + (art.unlocked ? "unlocked" : "locked");

    card.innerHTML = `
      <img class="art-card-img" src="${art.image}" alt="${art.name}"
           onerror="this.style.display='none'; this.closest('.art-card').querySelector('.art-card-fallback').style.display='flex';" />
      <div class="art-card-fallback" style="display:none;">${art.icon}</div>
      <div class="art-card-scrim"></div>
      <div class="status-badge ${art.unlocked ? "unlocked" : ""}">${art.unlocked ? "✓ Unlocked" : "🔒 Locked"}</div>
      ${art.quizCompleted ? `<div class="quiz-check-ribbon">✓</div>` : ""}
      <div class="art-card-caption">
        <h3>${art.name}</h3>
        <p>${art.unlocked ? "Tap to view details" : "Scan this artwork to reveal it"}</p>
      </div>
    `;

    if (art.unlocked) {
      card.addEventListener("click", () => openDetail(art.id));
    } else {
      card.addEventListener("click", () => {
        showFilterToast("Scan this artwork first to unlock it");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(hideFilterToast, 1800);
      });
    }

    galleryGrid.appendChild(card);
  });

  const unlockedCount = galleryArtworks.filter((a) => a.unlocked).length;
  const pct = galleryArtworks.length ? (unlockedCount / galleryArtworks.length) * 100 : 0;
  progressFill.style.width = pct + "%";
  progressLabel.textContent = `${unlockedCount} / ${galleryArtworks.length} unlocked`;
}

// -------------------------------------------------------------------
// Screen switching
// -------------------------------------------------------------------
function hideAllScreens() {
  screenHome.classList.add("hidden");
  screenScanner.classList.add("hidden");
  screenDetail.classList.add("hidden");
  screenQuiz.classList.add("hidden");
  screenBadges.classList.add("hidden");
  screenLeaderboard.classList.add("hidden");
  screenLibrary.classList.add("hidden");
  screenSettings.classList.add("hidden");
  screenImmersive.classList.add("hidden");
}

function showHome() {
  hideAllScreens();
  screenHome.classList.remove("hidden");
  bottomNav.classList.remove("hidden");
  setActiveNav("home");
  setBgLayerForScreen(false);
  renderGallery();
}

async function showScanner() {
  hideAllScreens();
  screenScanner.classList.remove("hidden");
  bottomNav.classList.add("hidden");
  setBgLayerForScreen(true);

  scanHint.textContent = "Preparing camera…";
  scanHint.classList.remove("found");

  try {
    if (arInitializationPromise) {
      await arInitializationPromise;
    }

    // If the combined Firebase + built-in target library finished compiling
    // while the scanner was closed, activate it now without a page reload.
    if (combinedTargetData && !isCombinedARActive()) {
      await switchToCombinedAR();
    }

    scanHint.textContent = "Point your camera at an artwork";
  } catch (err) {
    console.error("AR initialization failed:", err);
    scanHint.textContent = "AR could not be started.";
  }
}

function showBadges() {
  hideAllScreens();
  screenBadges.classList.add("hidden");
  renderBadges();
  screenBadges.classList.remove("hidden");
  bottomNav.classList.add("hidden");
  setBgLayerForScreen(false);
}

function showLeaderboard() {
  hideAllScreens();
  screenLeaderboard.classList.remove("hidden");
  bottomNav.classList.remove("hidden");
  setActiveNav("leaderboard");
  setBgLayerForScreen(false);
  loadLeaderboard();
  loadNotesBoard();
}

function showLibrary() {
  hideAllScreens();
  renderLibrary();
  screenLibrary.classList.remove("hidden");
  bottomNav.classList.add("hidden");
  setBgLayerForScreen(false);
}

function showSettings() {
  hideAllScreens();
  settingsCurrentName.textContent = `Currently: ${currentUsername || "—"}`;
  screenSettings.classList.remove("hidden");
  bottomNav.classList.add("hidden");
  setBgLayerForScreen(false);
  ensureSettingsARStatus();
}

btnBackHome.addEventListener("click", showHome);
btnBadgesBack.addEventListener("click", showHome);
btnOpenBadges.addEventListener("click", showBadges);
btnOpenLibrary.addEventListener("click", showLibrary);
btnLibraryBack.addEventListener("click", showHome);
btnOpenSettings.addEventListener("click", showSettings);
btnSettingsBack.addEventListener("click", showHome);
btnImmersiveBack.addEventListener("click", exitImmersive);

function showUnlockModal(art) {
  modalTitle.textContent = art.name;
  modalDesc.textContent = art.details;
  unlockModal.classList.remove("hidden");
}
function hideUnlockModal() {
  unlockModal.classList.add("hidden");
}
btnKeepScanning.addEventListener("click", hideUnlockModal);
btnViewCollection.addEventListener("click", () => {
  hideUnlockModal();
  showHome();
});

// -------------------------------------------------------------------
// Badge toast + awarding
// -------------------------------------------------------------------
let badgeToastTimer = null;
function showBadgeToast(badge) {
  badgeToastIcon.textContent = badge.icon;
  badgeToastText.textContent = `Badge earned: ${badge.name}`;
  badgeToast.classList.remove("hidden");
  clearTimeout(badgeToastTimer);
  badgeToastTimer = setTimeout(() => badgeToast.classList.add("hidden"), 2600);
}

function awardBadge(key) {
  const badge = badges[key];
  if (!badge || badge.earned) return;
  badge.earned = true;
  persistProgress();
  showBadgeToast(badge);
  if (allBadgesEarned()) updateNotesGate();
}

function renderBadges() {
  badgesGrid.innerHTML = Object.values(badges)
    .map(
      (b) => `
    <div class="badge-card ${b.earned ? "earned" : ""}">
      <div class="badge-icon">${b.earned ? b.icon : "🔒"}</div>
      <h4>${b.name}</h4>
      <p>${b.earned ? b.description : "Locked"}</p>
    </div>
  `
    )
    .join("");
}

// -------------------------------------------------------------------
// Library
// -------------------------------------------------------------------
function renderLibrary() {
  libraryList.innerHTML = artworks
    .map(
      (art, i) => `
    <div class="library-card" data-index="${i}">
      <div class="library-card-photo">
        <img
          src="${escapeHtml(art.thumbnail || art.image || "")}"
          alt="${escapeHtml(art.name || "Artwork")}" 
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          width="400"
          height="300"
          onerror="this.style.display='none'; this.closest('.library-card').querySelector('.library-fallback').style.display='flex';"
        />
        <div class="library-fallback" style="display:none;">${escapeHtml(art.icon || "🖼️")}</div>
      </div>
      <div class="library-card-info">
        <div class="library-card-title-row">
          <h4>${escapeHtml(art.name || "Artwork")}</h4>
          ${art.modelObj ? `<span class="model-badge">🧊 3D Model</span>` : ""}
        </div>
        <p>${escapeHtml(art.details || "")}</p>
        <span class="library-view-hint">Tap to view</span>
      </div>
    </div>
  `
    )
    .join("");

  libraryList.querySelectorAll(".library-card").forEach((card) => {
    card.addEventListener("click", () => {
      const art = artworks[Number(card.dataset.index)];
      openLibraryDetail(art);
    });
  });
}

function loadFullArtworkImage(imgEl, art) {
  if (!imgEl || !art) return;
  const fullImage = art.image || art.thumbnail;
  if (!fullImage) return;
  if (imgEl.dataset.fullSrc === fullImage) return;
  imgEl.dataset.fullSrc = fullImage;
  imgEl.loading = "eager";
  imgEl.decoding = "async";
  imgEl.src = fullImage;
}

function openLibraryDetail(art) {
  loadFullArtworkImage(libraryDetailImage, art);
  libraryDetailImage.alt = art.name;
  libraryDetailTitle.textContent = art.name;
  libraryDetailText.textContent = art.details;
  libraryDetailBadge.classList.toggle("hidden", !art.modelObj);

  metaRowArtist.classList.toggle("hidden", !art.artist);
  if (art.artist) metaArtist.textContent = art.artist;
  metaRowYear.classList.toggle("hidden", !art.year);
  if (art.year) metaYear.textContent = art.year;
  metaRowLocation.classList.toggle("hidden", !art.location);
  if (art.location) metaLocation.textContent = art.location;

  libraryDetailModal.classList.remove("hidden");
  libraryDetailModal.querySelector(".library-detail-scroll").scrollTop = 0;
}
btnLibraryDetailClose.addEventListener("click", () => libraryDetailModal.classList.add("hidden"));

// =====================================================================
// KUYA DAVON — AI CHAT (Groq API)
// =====================================================================
const GROQ_API_KEY = "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";
// Preferred models in order of preference. The app will auto-discover
// what's actually available from Groq and pick the first match.
const PREFERRED_MODELS = [
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "qwen/qwen3.6-27b",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
];
let GROQ_MODEL = null; // set dynamically on first use

async function resolveGroqModel() {
  if (GROQ_MODEL) return GROQ_MODEL;
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
    });
    if (!res.ok) throw new Error("status " + res.status);
    const data = await res.json();
    const available = (data.data || []).map((m) => m.id);
    for (const pref of PREFERRED_MODELS) {
      if (available.includes(pref)) {
        GROQ_MODEL = pref;
        console.log("[Kuya Davon] Using model:", GROQ_MODEL);
        return GROQ_MODEL;
      }
    }
    const chatModel = available.find((id) => !id.includes("whisper") && !id.includes("orpheus"));
    if (chatModel) {
      GROQ_MODEL = chatModel;
      console.log("[Kuya Davon] Fallback model:", GROQ_MODEL);
      return GROQ_MODEL;
    }
    throw new Error("No suitable model found");
  } catch (err) {
    console.warn("[Kuya Davon] Could not discover models, using hard fallback:", err);
    GROQ_MODEL = PREFERRED_MODELS[0];
    return GROQ_MODEL;
  }
}

const MUSEUM_NAME = "Geronimo Berenguer de los Reyes (GBR), Jr. Museum";
const MUSEUM_LOCATION = "General Trias, Philippines";

function buildKuyaDavonSystemPrompt() {
  const artworkList = artworks
    .map((a) => `- "${a.name}"${a.modelObj ? " (has a 3D AR model)" : ""}: ${a.details}`)
    .join("\n");

  return `You are Kuya Davon, the official AI museum guide for the ${MUSEUM_NAME}, located in ${MUSEUM_LOCATION}.

=== STRICT RULES — YOU MUST FOLLOW THESE EXACTLY ===
1. You may ONLY discuss the artworks listed below. NOTHING else.
2. If asked about ANY topic not directly related to these artworks — including but not limited to: general history, other artists, other museums, science, politics, sports, entertainment, personal advice, coding, math, weather, current events, or ANY artwork not in this list — you MUST refuse. Do not answer, do not summarize, do not redirect to the topic. Simply say you can only help with questions about the artworks at this museum.
3. Do NOT be conversational about off-topic subjects. A single firm refusal is enough.
4. Do NOT provide "fun facts" or tangential information that strays from the listed artworks.
5. If the user asks "who are you" or "what can you do", answer: "I'm Kuya Davon, your guide for the artworks here at ${MUSEUM_NAME}. Ask me about any piece in our collection!"
6. Keep all on-topic answers concise (2-3 sentences max).

Current artworks in the collection:
${artworkList}

Remember: If it is not about one of the artworks above, you do NOT know it. Period.`;
}

let chatHistory = [];

function addChatBubble(text, sender) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return bubble;
}

chatHeadBtn.addEventListener("click", () => {
  chatPanel.classList.toggle("hidden");
  if (!chatPanel.classList.contains("hidden") && chatMessages.children.length === 0) {
    addChatBubble(`Hi po! I'm Kuya Davon 👋 Ask me anything about the artworks here at ${MUSEUM_NAME}.`, "bot");
  }
});
btnChatClose.addEventListener("click", () => chatPanel.classList.add("hidden"));

async function sendChatMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";
  addChatBubble(text, "user");
  chatHistory.push({ role: "user", content: text });

  const typingBubble = addChatBubble("typing…", "bot typing");
  btnChatSend.disabled = true;

  try {
    const model = await resolveGroqModel();
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "system", content: buildKuyaDavonSystemPrompt() }, ...chatHistory],
        temperature: 0.4,
        max_tokens: 300,
      }),
    });

    if (!res.ok) throw new Error("status " + res.status);
    const data = await res.json();
    const reply =
      data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't come up with an answer for that.";

    typingBubble.remove();
    addChatBubble(reply, "bot");
    chatHistory.push({ role: "assistant", content: reply });

    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
  } catch (err) {
    console.error("Kuya Davon chat error:", err);
    typingBubble.remove();
    addChatBubble("Sorry, I'm having trouble connecting right now. Please try again in a bit.", "bot");
  } finally {
    btnChatSend.disabled = false;
  }
}

btnChatSend.addEventListener("click", sendChatMessage);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendChatMessage();
});

// -------------------------------------------------------------------
// Artwork detail page
// -------------------------------------------------------------------
let currentDetailArtId = null;

function openDetail(artworkId) {
  const art = artworks.find((a) => a.id === artworkId);
  if (!art) return;
  currentDetailArtId = artworkId;

  detailImage.src = art.image;
  detailImage.alt = art.name;
  detailTitle.textContent = art.name;
  detailText.textContent = art.details;

  const hasQuiz = art.quiz && art.quiz.length > 0;
  btnTakeQuiz.style.display = hasQuiz ? "block" : "none";
  quizDoneNote.classList.toggle("hidden", !art.quizCompleted);
  const hasImmersive = !!art.immersiveSkybox;
  btnImmersive.classList.toggle("hidden", !hasImmersive);
  btnImmersive.onclick = () => startImmersive(art);

  hideAllScreens();
  screenDetail.classList.remove("hidden");
  bottomNav.classList.add("hidden");
}

btnDetailBack.addEventListener("click", showHome);
btnTakeQuiz.addEventListener("click", () => {
  if (currentDetailArtId !== null) startQuiz(currentDetailArtId);
});

// -------------------------------------------------------------------
// Quiz
// -------------------------------------------------------------------
let quizArtId = null;
let quizIndex = 0;
let quizScore = 0;

function startQuiz(artworkId) {
  const art = artworks.find((a) => a.id === artworkId);
  if (!art || !art.quiz || art.quiz.length === 0) return;

  quizArtId = artworkId;
  quizIndex = 0;
  quizScore = 0;

  hideAllScreens();
  screenQuiz.classList.remove("hidden");
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const art = artworks.find((a) => a.id === quizArtId);
  const q = art.quiz[quizIndex];

  quizProgress.textContent = `Question ${quizIndex + 1} / ${art.quiz.length}`;
  quizQuestion.textContent = q.question;
  quizFeedback.classList.add("hidden");
  btnQuizNext.classList.add("hidden");

  quizOptions.innerHTML = "";
  q.options.forEach((option, i) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option-btn";
    btn.textContent = option;
    btn.addEventListener("click", () => selectQuizAnswer(i));
    quizOptions.appendChild(btn);
  });
}

function selectQuizAnswer(selectedIndex) {
  const art = artworks.find((a) => a.id === quizArtId);
  const q = art.quiz[quizIndex];
  const optionButtons = quizOptions.querySelectorAll(".quiz-option-btn");

  optionButtons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correctIndex) btn.classList.add("correct");
    else if (i === selectedIndex) btn.classList.add("incorrect");
  });

  const isCorrect = selectedIndex === q.correctIndex;
  if (isCorrect) quizScore++;

  quizFeedback.textContent = isCorrect ? "Correct!" : "Not quite — the highlighted answer was correct.";
  quizFeedback.className = "quiz-feedback " + (isCorrect ? "correct" : "incorrect");
  quizFeedback.classList.remove("hidden");

  btnQuizNext.textContent = quizIndex === art.quiz.length - 1 ? "Finish Quiz" : "Next Question";
  btnQuizNext.classList.remove("hidden");
}

btnQuizNext.addEventListener("click", () => {
  const art = artworks.find((a) => a.id === quizArtId);
  if (quizIndex < art.quiz.length - 1) {
    quizIndex++;
    renderQuizQuestion();
  } else {
    const firstTimeCompletingAnyQuiz = !art.quizCompleted && !Object.values(artworks).some((a) => a.quizCompleted);
    art.quizCompleted = true;
    if (firstTimeCompletingAnyQuiz) awardBadge("firstQuiz");
    persistProgress();
    openDetail(quizArtId);
  }
});

btnQuizBack.addEventListener("click", () => {
  if (currentDetailArtId !== null) openDetail(currentDetailArtId);
  else showHome();
});

// -------------------------------------------------------------------
// Firebase: leaderboard
// -------------------------------------------------------------------
async function loadLeaderboard() {
  leaderboardList.innerHTML = `<p class="leaderboard-status">Loading…</p>`;
  try {
    const res = await fetch(`${FIREBASE_URL}/leaderboard.json`);
    if (!res.ok) throw new Error("status " + res.status);
    const data = await res.json();
    const entries = data ? Object.values(data) : [];
    entries.sort((a, b) => a.time - b.time);

    if (entries.length === 0) {
      leaderboardList.innerHTML = `<p class="leaderboard-status">No completions yet — be the first!</p>`;
      return;
    }

    leaderboardList.innerHTML = entries
      .slice(0, 20)
      .map((e, i) => {
        const rank = i + 1;
        const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
        const rankClass = rank <= 3 ? ` rank-${rank}` : "";
        return `
      <div class="leaderboard-row${rankClass}">
        <span class="leaderboard-rank">${medal || "#" + rank}</span>
        <span class="leaderboard-name">${escapeHtml(e.name || "Anonymous")}${
          rank === 1 ? ' <span class="crown">👑</span>' : ""
        }</span>
        <span class="leaderboard-time">${formatTime(e.time)}</span>
      </div>
    `;
      })
      .join("");
  } catch (err) {
    leaderboardList.innerHTML = `<p class="leaderboard-status">Couldn't load the leaderboard. Check your connection or the Firebase database rules.</p>`;
  }
}

async function submitLeaderboardEntry(name, timeSeconds) {
  try {
    await fetch(`${FIREBASE_URL}/leaderboard.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, time: timeSeconds, timestamp: Date.now() }),
    });
  } catch (err) {
    /* silently ignore */
  }
}

// =====================================================================
// GUESTBOOK BOARD
// =====================================================================
const NOTE_COLORS = ["#f4d35e", "#f2a19b", "#a8d5ba", "#9fc6e0", "#c9a8d8", "#f4f1ea"];
const BOARD_WIDTH = 1200;
const BOARD_HEIGHT = 800;
let allNotesCache = [];
let boardScale = 1;
let boardX = 0;
let boardY = 0;

function fitNotesBoardToViewport() {
  const wrapW = notesBoardWrap.clientWidth;
  const wrapH = notesBoardWrap.clientHeight;
  const scaleX = wrapW / BOARD_WIDTH;
  const scaleY = wrapH / BOARD_HEIGHT;
  boardScale = Math.min(scaleX, scaleY, 1);
  boardX = 0;
  boardY = 0;
  applyBoardTransform();
}
let editingMode = "text";
let selectedColor = NOTE_COLORS[0];
let hasDrawing = false;

function applyBoardTransform() {
  notesBoard.style.transform = `translate(${boardX}px, ${boardY}px) scale(${boardScale})`;
}

async function loadNotesBoard() {
  notesBoard.innerHTML = `<p class="leaderboard-status" style="padding:10px;">Loading…</p>`;
  try {
    const res = await fetch(`${FIREBASE_URL}/notes.json`);
    if (!res.ok) throw new Error("status " + res.status);
    const data = await res.json();
    allNotesCache = data
      ? Object.entries(data).map(([deviceId, note]) => ({ ...note, deviceId }))
      : [];
    renderNotesBoard();
    fitNotesBoardToViewport();
    updateNewNoteButton();
  } catch (err) {
    notesBoard.innerHTML = `<p class="leaderboard-status" style="padding:10px;">Couldn't load the guestbook. Check your connection or the Firebase database rules.</p>`;
  }
}

const NOTE_W = 140;
const NOTE_H = 160;
const NOTE_MARGIN = 16;

function findNonOverlappingPosition(existingNotes) {
  const occupied = existingNotes.map((n) => ({
    x: n.x, y: n.y,
    w: NOTE_W + NOTE_MARGIN, h: NOTE_H + NOTE_MARGIN,
  }));
  for (let attempt = 0; attempt < 80; attempt++) {
    const x = 20 + Math.random() * (BOARD_WIDTH - NOTE_W - 40);
    const y = 20 + Math.random() * (BOARD_HEIGHT - NOTE_H - 40);
    let overlaps = false;
    for (const o of occupied) {
      if (x < o.x + o.w && x + NOTE_W + NOTE_MARGIN > o.x &&
          y < o.y + o.h && y + NOTE_H + NOTE_MARGIN > o.y) {
        overlaps = true; break;
      }
    }
    if (!overlaps) return { x, y };
  }
  const cols = Math.floor((BOARD_WIDTH - 40) / (NOTE_W + NOTE_MARGIN));
  const rows = Math.floor((BOARD_HEIGHT - 40) / (NOTE_H + NOTE_MARGIN));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = 20 + c * (NOTE_W + NOTE_MARGIN);
      const y = 20 + r * (NOTE_H + NOTE_MARGIN);
      let overlaps = false;
      for (const o of occupied) {
        if (x < o.x + o.w && x + NOTE_W + NOTE_MARGIN > o.x &&
            y < o.y + o.h && y + NOTE_H + NOTE_MARGIN > o.y) {
          overlaps = true; break;
        }
      }
      if (!overlaps) return { x, y };
    }
  }
  return { x: 20 + Math.random() * (BOARD_WIDTH - NOTE_W - 40), y: 20 + Math.random() * (BOARD_HEIGHT - NOTE_H - 40) };
}

function renderNotesBoard() {
  notesBoard.innerHTML = "";
  const placed = [];

  allNotesCache.forEach((note) => {
    if (note.x == null || note.y == null) {
      const pos = findNonOverlappingPosition(placed);
      note.x = pos.x;
      note.y = pos.y;
    }
    placed.push({ x: note.x, y: note.y });

    const el = document.createElement("div");
    el.className =
      "note-sticky" +
      (note.type === "photo" ? " type-photo" : "") +
      (note.deviceId === myDeviceId ? " mine" : "");
    el.style.left = note.x + "px";
    el.style.top = note.y + "px";
    if (note.type !== "photo") el.style.background = note.color || NOTE_COLORS[0];
    el.style.transform = `rotate(${note.rotation || 0}deg)`;

    if (note.type === "photo") {
      el.innerHTML = `<img class="note-sticky-photo" src="${note.photo}" alt="photo" />`;
    } else if (note.type === "draw") {
      el.innerHTML = `<img class="note-sticky-drawing" src="${note.drawing}" alt="drawing" />`;
    } else {
      el.innerHTML = `<div class="note-sticky-text">${escapeHtml(note.text || "")}</div>`;
    }

    const nameTag = document.createElement("div");
    nameTag.className = "note-sticky-name";
    const dateStr = formatNoteDateShort(note.timestamp);
    nameTag.textContent = dateStr ? `${note.name || "Anonymous"} · ${dateStr}` : note.name || "Anonymous";
    el.appendChild(nameTag);

    el.addEventListener("click", () => {
      if (note.deviceId === myDeviceId) openNoteEditor(note);
      else openNoteView(note);
    });

    notesBoard.appendChild(el);
  });
}

function updateNewNoteButton() {
  const unlocked = allBadgesEarned();
  const myNote = allNotesCache.find((n) => n.deviceId === myDeviceId);
  btnNewNote.classList.toggle("hidden", !unlocked);
  notesLockedMsg.classList.toggle("hidden", unlocked);
  btnNewNote.textContent = myNote ? "✏️ Edit My Note" : "+ New Note";
}

// ---- board pan + pinch-zoom ----
let boardLastPinchDist = null;
let boardLastTouchX = null;
let boardLastTouchY = null;

notesBoardWrap.addEventListener(
  "touchstart",
  (e) => {
    if (e.touches.length === 2) {
      boardLastPinchDist = getPinchDistance(e.touches);
    } else if (e.touches.length === 1) {
      boardLastTouchX = e.touches[0].clientX;
      boardLastTouchY = e.touches[0].clientY;
    }
  },
  { passive: true }
);

notesBoardWrap.addEventListener(
  "touchmove",
  (e) => {
    if (e.touches.length === 2 && boardLastPinchDist !== null) {
      const newDist = getPinchDistance(e.touches);
      const factor = newDist / boardLastPinchDist;
      boardScale = Math.min(2.5, Math.max(0.5, boardScale * factor));
      boardLastPinchDist = newDist;
      applyBoardTransform();
    } else if (e.touches.length === 1 && boardLastTouchX !== null) {
      const dx = e.touches[0].clientX - boardLastTouchX;
      const dy = e.touches[0].clientY - boardLastTouchY;
      boardX += dx;
      boardY += dy;
      boardLastTouchX = e.touches[0].clientX;
      boardLastTouchY = e.touches[0].clientY;
      applyBoardTransform();
    }
  },
  { passive: true }
);

notesBoardWrap.addEventListener(
  "touchend",
  (e) => {
    if (e.touches.length < 2) boardLastPinchDist = null;
    if (e.touches.length < 1) {
      boardLastTouchX = null;
      boardLastTouchY = null;
    }
  },
  { passive: true }
);

// Mouse drag for desktop
let mouseDragging = false;
let mouseLastX = 0;
let mouseLastY = 0;
notesBoardWrap.addEventListener("mousedown", (e) => {
  mouseDragging = true;
  mouseLastX = e.clientX;
  mouseLastY = e.clientY;
  notesBoardWrap.style.cursor = "grabbing";
});
window.addEventListener("mousemove", (e) => {
  if (!mouseDragging) return;
  boardX += e.clientX - mouseLastX;
  boardY += e.clientY - mouseLastY;
  mouseLastX = e.clientX;
  mouseLastY = e.clientY;
  applyBoardTransform();
});
window.addEventListener("mouseup", () => {
  mouseDragging = false;
  notesBoardWrap.style.cursor = "grab";
});

btnBoardZoomIn.addEventListener("click", () => {
  boardScale = Math.min(2.5, boardScale + 0.2);
  applyBoardTransform();
});
btnBoardZoomOut.addEventListener("click", () => {
  boardScale = Math.max(0.5, boardScale - 0.2);
  applyBoardTransform();
});
btnBoardZoomReset.addEventListener("click", fitNotesBoardToViewport);

// ---- note editor ----
let editingExistingNote = null;
let drawCtx = null;

function initCanvas() {
  drawCtx = noteCanvas.getContext("2d");
  drawCtx.lineWidth = 4;
  drawCtx.lineCap = "round";
  drawCtx.strokeStyle = "#2a2320";

  let drawing = false;
  function pos(e) {
    const rect = noteCanvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }
  function start(e) {
    drawing = true;
    hasDrawing = true;
    const p = pos(e);
    drawCtx.beginPath();
    drawCtx.moveTo(p.x, p.y);
  }
  function move(e) {
    if (!drawing) return;
    const p = pos(e);
    drawCtx.lineTo(p.x, p.y);
    drawCtx.stroke();
  }
  function end() {
    drawing = false;
  }
  noteCanvas.addEventListener("touchstart", (e) => { start(e); }, { passive: true });
  noteCanvas.addEventListener("touchmove", (e) => { move(e); }, { passive: true });
  noteCanvas.addEventListener("touchend", end, { passive: true });
  noteCanvas.addEventListener("mousedown", start);
  noteCanvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
}
initCanvas();

btnClearDrawing.addEventListener("click", () => {
  drawCtx.clearRect(0, 0, noteCanvas.width, noteCanvas.height);
  hasDrawing = false;
});

function renderColorSwatches() {
  noteColorSwatches.innerHTML = NOTE_COLORS.map(
    (c) => `<div class="note-swatch${c === selectedColor ? " selected" : ""}" data-color="${c}" style="background:${c};"></div>`
  ).join("");
  noteColorSwatches.querySelectorAll(".note-swatch").forEach((el) => {
    el.addEventListener("click", () => {
      selectedColor = el.dataset.color;
      renderColorSwatches();
    });
  });
}

let capturedPhotoDataUrl = null;

function setEditingMode(mode) {
  editingMode = mode;
  noteTabs.forEach((t) => t.classList.toggle("active", t.dataset.mode === mode));
  noteTextInput.classList.toggle("hidden", mode !== "text");
  noteDrawWrap.classList.toggle("hidden", mode !== "draw");
  notePhotoWrap.classList.toggle("hidden", mode !== "photo");
  noteColorSwatches.classList.toggle("hidden", mode === "photo");

  if (mode === "photo" && !capturedPhotoDataUrl) {
    startPhotoPreview();
  } else {
    stopPhotoPreview();
  }
}
noteTabs.forEach((tab) => tab.addEventListener("click", () => setEditingMode(tab.dataset.mode)));

// -------------------------------------------------------------------
// Photo notes: reuse MindAR's already-running camera feed
// -------------------------------------------------------------------
function findArVideoElement() {
  return document.querySelector("#ar-container video");
}

function startPhotoPreview() {
  const arVideo = findArVideoElement();
  if (!arVideo || !arVideo.srcObject) {
    notePhotoError.classList.remove("hidden");
    notePhotoPreview.classList.add("hidden");
    btnSnapPhoto.disabled = true;
    return;
  }
  notePhotoError.classList.add("hidden");
  btnSnapPhoto.disabled = false;
  notePhotoPreview.srcObject = arVideo.srcObject;
  notePhotoPreview.classList.remove("hidden");
  notePhotoResult.classList.add("hidden");
  notePhotoPreview.play().catch(() => {});
}

function stopPhotoPreview() {
  notePhotoPreview.srcObject = null;
}

btnSnapPhoto.addEventListener("click", () => {
  const arVideo = findArVideoElement();
  if (!arVideo) return;

  const maxDim = 480;
  const scale = Math.min(1, maxDim / Math.max(arVideo.videoWidth, arVideo.videoHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(arVideo.videoWidth * scale);
  canvas.height = Math.round(arVideo.videoHeight * scale);
  canvas.getContext("2d").drawImage(arVideo, 0, 0, canvas.width, canvas.height);
  capturedPhotoDataUrl = canvas.toDataURL("image/jpeg", 0.85);

  notePhotoResult.src = capturedPhotoDataUrl;
  notePhotoResult.classList.remove("hidden");
  notePhotoPreview.classList.add("hidden");
  btnSnapPhoto.classList.add("hidden");
  btnRetakePhoto.classList.remove("hidden");
  stopPhotoPreview();
});

btnRetakePhoto.addEventListener("click", () => {
  capturedPhotoDataUrl = null;
  notePhotoResult.classList.add("hidden");
  btnRetakePhoto.classList.add("hidden");
  btnSnapPhoto.classList.remove("hidden");
  startPhotoPreview();
});

function openNoteEditor(existingNote) {
  editingExistingNote = existingNote || null;
  noteEditorHeading.textContent = existingNote ? "Edit Your Note" : "Leave Your Mark";
  noteEditorEyebrow.textContent = existingNote
    ? `Posted ${formatNoteDateFull(existingNote.timestamp)}`
    : "Your Notepad";
  btnNoteDelete.classList.toggle("hidden", !existingNote);

  selectedColor = existingNote?.color || NOTE_COLORS[0];
  renderColorSwatches();

  drawCtx.clearRect(0, 0, noteCanvas.width, noteCanvas.height);
  hasDrawing = false;
  noteTextInput.value = "";

  capturedPhotoDataUrl = null;
  notePhotoResult.classList.add("hidden");
  notePhotoPreview.classList.remove("hidden");
  btnRetakePhoto.classList.add("hidden");
  btnSnapPhoto.classList.remove("hidden");

  if (existingNote && existingNote.type === "draw") {
    setEditingMode("draw");
    const img = new Image();
    img.onload = () => {
      drawCtx.drawImage(img, 0, 0);
      hasDrawing = true;
    };
    img.src = existingNote.drawing;
  } else if (existingNote && existingNote.type === "photo") {
    capturedPhotoDataUrl = existingNote.photo;
    setEditingMode("photo");
    notePhotoResult.src = existingNote.photo;
    notePhotoResult.classList.remove("hidden");
    notePhotoPreview.classList.add("hidden");
    btnSnapPhoto.classList.add("hidden");
    btnRetakePhoto.classList.remove("hidden");
  } else if (existingNote) {
    setEditingMode("text");
    noteTextInput.value = existingNote.text || "";
  } else {
    setEditingMode("text");
  }

  noteEditorModal.classList.remove("hidden");
}

btnNewNote.addEventListener("click", () => {
  const myNote = allNotesCache.find((n) => n.deviceId === myDeviceId);
  openNoteEditor(myNote || null);
});

btnNoteCancel.addEventListener("click", () => {
  stopPhotoPreview();
  noteEditorModal.classList.add("hidden");
});

btnNotePost.addEventListener("click", async () => {
  const isDraw = editingMode === "draw";
  const isPhoto = editingMode === "photo";
  if (isDraw && !hasDrawing) return;
  if (isPhoto && !capturedPhotoDataUrl) return;
  if (!isDraw && !isPhoto && !noteTextInput.value.trim()) return;

  btnNotePost.disabled = true;

  const note = {
    name: currentUsername || "Anonymous",
    type: editingMode,
    color: selectedColor,
    timestamp: Date.now(),
    x: editingExistingNote ? editingExistingNote.x : 40 + Math.random() * 860,
    y: editingExistingNote ? editingExistingNote.y : 40 + Math.random() * 560,
    rotation: editingExistingNote ? editingExistingNote.rotation : Math.round(Math.random() * 16 - 8),
  };
  if (isDraw) note.drawing = noteCanvas.toDataURL("image/png");
  else if (isPhoto) note.photo = capturedPhotoDataUrl;
  else note.text = noteTextInput.value.trim();

  try {
    await fetch(`${FIREBASE_URL}/notes/${myDeviceId}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });
  } catch (err) {
    /* ignore */
  }

  btnNotePost.disabled = false;
  stopPhotoPreview();
  noteEditorModal.classList.add("hidden");
  loadNotesBoard();
});

btnNoteDelete.addEventListener("click", async () => {
  await fetch(`${FIREBASE_URL}/notes/${myDeviceId}.json`, { method: "DELETE" }).catch(() => {});
  stopPhotoPreview();
  noteEditorModal.classList.add("hidden");
  loadNotesBoard();
});

// ---- read-only view for someone else's note ----
function openNoteView(note) {
  noteViewContent.style.background = note.type === "photo" ? "#f7f4ec" : note.color || NOTE_COLORS[0];
  if (note.type === "photo") {
    noteViewContent.innerHTML = `<img src="${note.photo}" alt="photo" />`;
  } else if (note.type === "draw") {
    noteViewContent.innerHTML = `<img src="${note.drawing}" alt="drawing" />`;
  } else {
    noteViewContent.innerHTML = `<p>${escapeHtml(note.text || "")}</p>`;
  }
  const dateStr = formatNoteDateFull(note.timestamp);
  noteViewName.textContent = dateStr ? `— ${note.name || "Anonymous"} · ${dateStr}` : `— ${note.name || "Anonymous"}`;
  noteViewModal.classList.remove("hidden");
}
btnNoteViewClose.addEventListener("click", () => noteViewModal.classList.add("hidden"));

function formatTime(seconds) {
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}

function formatNoteDateShort(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function formatNoteDateFull(timestamp) {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  const datePart = d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const timePart = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${datePart} · ${timePart}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function getPinchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

// =====================================================================
// AR INITIALIZATION
// =====================================================================
let arInitializationPromise = null;
let firebaseArtworkLoadPromise = null;
let firebaseARPreparationScheduled = false;
let lastUserInteractionAt = performance.now();

function noteUserInteraction() {
  lastUserInteractionAt = performance.now();
}

["pointerdown", "touchstart", "keydown", "wheel"].forEach((eventName) => {
  window.addEventListener(eventName, noteUserInteraction, { passive: true });
});

function waitForUiIdle(quietMs = 1200) {
  return new Promise((resolve) => {
    const check = () => {
      const elapsed = performance.now() - lastUserInteractionAt;
      if (elapsed >= quietMs) { resolve(); return; }
      setTimeout(check, Math.max(100, quietMs - elapsed));
    };
    check();
  });
}

function yieldToUi() {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(resolve);
    else setTimeout(resolve, 0);
  });
}

// The first AR scene uses the existing, proven targets.mind file so the
// built-in artworks behave exactly as they did before.
//
// Firebase marker images are compiled in the background. Once that finishes,
// we replace the running MindAR scene with ONE combined target library that
// contains the original built-ins + the Firebase uploads.
let combinedTargetData = null;
let combinedCompilePromise = null;
let combinedSwitchQueued = false;
let activeTargetCount = 0;
let activeARTargetMode = "builtin";
let combinedObjectUrl = null;

// -------------------------------------------------------------------
// Local cache for the compiled combined target library.
//
// Compiling MindAR targets in the browser (MINDAR.IMAGE.Compiler) is the
// single slowest part of this app — it was previously re-run from scratch
// on every page load, for every visitor, even when nothing had changed.
// This cache stores the already-compiled binary in IndexedDB, keyed by a
// signature of which artworks/marker images it was built from. As long as
// nobody has uploaded/changed a Firebase artwork since last time, a return
// visit on the same device skips compilation entirely and just reloads the
// cached binary — which is close to instant.
// -------------------------------------------------------------------
const AR_CACHE_DB_NAME = "museum_ar_cache";
const AR_CACHE_STORE = "targets";
const AR_CACHE_KEY = "combined";

function openARCacheDB() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB not available"));
      return;
    }
    const req = indexedDB.open(AR_CACHE_DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(AR_CACHE_STORE)) {
        req.result.createObjectStore(AR_CACHE_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function computeArtworkListSignature(artworkList) {
  const AR_CACHE_VERSION = "v2";

  return [
    AR_CACHE_VERSION,
    ...artworkList
      .map((a) => [a.id, a.markerImage || ""].join(":"))
      .sort(),
  ].join("|");
}

async function loadCachedCombinedTargets(signature) {
  try {
    const db = await openARCacheDB();

    return await new Promise((resolve, reject) => {
      const tx = db.transaction(AR_CACHE_STORE, "readonly");
      const store = tx.objectStore(AR_CACHE_STORE);
      const req = store.get(AR_CACHE_KEY);

      req.onsuccess = () => {
        const record = req.result;

        if (
          record &&
          record.signature === signature &&
          record.buffer instanceof ArrayBuffer &&
          record.buffer.byteLength > 0
        ) {
          console.log("[AR] Using cached combined target library.");
          resolve(record.buffer);
          return;
        }

        resolve(null);
      };

      req.onerror = () => {
        reject(req.error || new Error("IndexedDB read failed"));
      };
    });
  } catch (err) {
    console.warn("[AR] Could not read cached target library:", err);
    return null;
  }
}

async function saveCachedCombinedTargets(signature, arrayBuffer) {
  if (!(arrayBuffer instanceof ArrayBuffer)) {
    console.warn("[AR] Refusing to cache invalid target buffer.");
    return false;
  }

  if (arrayBuffer.byteLength === 0) {
    console.warn("[AR] Refusing to cache empty target buffer.");
    return false;
  }

  try {
    const db = await openARCacheDB();

    await new Promise((resolve, reject) => {
      const tx = db.transaction(AR_CACHE_STORE, "readwrite");

      tx.objectStore(AR_CACHE_STORE).put(
        {
          signature,
          buffer: arrayBuffer,
          savedAt: Date.now(),
          size: arrayBuffer.byteLength,
        },
        AR_CACHE_KEY
      );

      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error("IndexedDB write failed"));
      tx.onabort = () => reject(tx.error || new Error("IndexedDB transaction aborted"));
    });

    console.log(
      `[AR] Cached combined target library (${arrayBuffer.byteLength} bytes).`
    );

    return true;
  } catch (err) {
    console.warn(
      "[AR] Could not cache target library. The app will still work, but it may recompile next visit.",
      err
    );
    return false;
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error("Empty image URL."));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";

    const cleanup = () => {
      img.onload = null;
      img.onerror = null;
    };

    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) {
        cleanup();
        reject(new Error(`Image loaded but has no dimensions: ${src}`));
        return;
      }

      cleanup();
      resolve(img);
    };

    img.onerror = () => {
      cleanup();
      reject(new Error(`Could not load marker image: ${src}`));
    };

    img.src = src;
  });
}

// Smaller maxDim = fewer pixels for MindAR's compiler to analyze = much
// faster compilation, at a small cost to tracking robustness on very
// low-detail images. 1200px was overkill for marker detection; ~800px is
// the sweet spot most MindAR projects use.
function prepareMarkerImage(img, maxDim = 640) {
  const scale = Math.min(
    1,
    maxDim / Math.max(img.naturalWidth, img.naturalHeight)
  );

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));

  const ctx = canvas.getContext("2d", {
    alpha: false,
    willReadFrequently: true,
  });

  if (!ctx) {
    throw new Error("Could not create canvas context for marker image.");
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  try {
    ctx.getImageData(0, 0, 1, 1);
  } catch (err) {
    throw new Error(
      "Firebase marker image is blocked by CORS. " +
      "Firebase Storage must allow this website to read the image."
    );
  }

  return canvas;
}

// -------------------------------------------------------------------
// Gesture state: pinch-to-zoom + drag-to-rotate on the active target
// -------------------------------------------------------------------
let activeModelEl = null;
let activeBaseScale = 0.06;
let currentScale = 0.06;
let currentRotY = 0;
let currentRotX = 0;

function applyTransform() {
  if (!activeModelEl) return;
  activeModelEl.setAttribute("scale", `${currentScale} ${currentScale} ${currentScale}`);
  activeModelEl.setAttribute("rotation", `${currentRotX} ${currentRotY} 0`);
}

let lastPinchDistance = null;
let lastTouchX = null;
let lastTouchY = null;

window.addEventListener(
  "touchstart",
  (e) => {
    if (screenScanner.classList.contains("hidden")) return;
    if (e.touches.length === 2) {
      lastPinchDistance = getPinchDistance(e.touches);
    } else if (e.touches.length === 1) {
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    }
  },
  { passive: true }
);

window.addEventListener(
  "touchmove",
  (e) => {
    if (screenScanner.classList.contains("hidden") || !activeModelEl) return;

    if (e.touches.length === 2 && lastPinchDistance !== null) {
      const newDistance = getPinchDistance(e.touches);
      const factor = newDistance / lastPinchDistance;
      const minScale = activeBaseScale * 0.3;
      const maxScale = activeBaseScale * 3;
      currentScale = Math.min(maxScale, Math.max(minScale, currentScale * factor));
      lastPinchDistance = newDistance;
      applyTransform();
    } else if (e.touches.length === 1 && lastTouchX !== null) {
      const dx = e.touches[0].clientX - lastTouchX;
      const dy = e.touches[0].clientY - lastTouchY;
      currentRotY += dx * 0.5;
      currentRotX += dy * 0.5;
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
      applyTransform();
    }
  },
  { passive: true }
);

window.addEventListener(
  "touchend",
  (e) => {
    if (e.touches.length < 2) lastPinchDistance = null;
    if (e.touches.length < 1) {
      lastTouchX = null;
      lastTouchY = null;
    }
  },
  { passive: true }
);

// -------------------------------------------------------------------
// Target found / lost
// -------------------------------------------------------------------
function getOrCreateModelEntity(art, targetIndex, targetEl) {
  if (!art.modelObj) return null;

  let modelEl = document.getElementById(`model-${targetIndex}`);
  if (modelEl) return modelEl;

  modelEl = document.createElement("a-entity");
  modelEl.setAttribute("id", `model-${targetIndex}`);

  const isGltf = art.modelObj.match(/\.(glb|gltf)$/i);
  if (isGltf) {
    modelEl.setAttribute("gltf-model", art.modelObj);
  } else {
    modelEl.setAttribute(
      "obj-model",
      `obj: ${art.modelObj};${art.modelMtl ? ` mtl: ${art.modelMtl};` : ""}`
    );
    modelEl.setAttribute("material", "side: double");
  }

  modelEl.setAttribute("position", "0 0 0.1");
  modelEl.setAttribute("rotation", art.markerRotation || "0 0 0");
  modelEl.setAttribute("scale", `${art.baseScale} ${art.baseScale} ${art.baseScale}`);
  modelEl.addEventListener("model-error", (e) =>
    console.error(`"${art.name}" model failed to load:`, e.detail)
  );
  targetEl.appendChild(modelEl);
  return modelEl;
}

function handleTargetFound(art, targetIndex, targetEl) {
  activeTargetCount++;

  scanHint.textContent = "Pinch to zoom · Drag to rotate";
  scanHint.classList.add("found");

  const modelEl = getOrCreateModelEntity(art, targetIndex, targetEl);

  activeModelEl = modelEl;
  activeBaseScale = art.baseScale;
  currentScale = art.baseScale;
  currentRotY = 0;
  currentRotX = 0;
  applyTransform();

  const firstTimeEver = !artworks.some((a) => a.unlocked);
  const wasAlreadyUnlocked = art.unlocked;
  art.unlocked = true;
  if (firstTimeEver) awardBadge("firstScan");
  persistProgress();

  if (art.modelObj) {
    if (!wasAlreadyUnlocked) {
      showUnlockModal(art);
      checkCollectionComplete();
    }
  } else {
    showUnlockModal(art);
  }
}

function handleTargetLost() {
  activeTargetCount = Math.max(0, activeTargetCount - 1);

  scanHint.textContent = "Point your camera at an artwork";
  scanHint.classList.remove("found");
  activeModelEl = null;

  // If the combined target library finished while the user was looking at
  // an artwork, switch only after that target has been lost. This avoids
  // interrupting a successful scan halfway through.
  if (activeTargetCount === 0 && combinedSwitchQueued && combinedTargetData) {
    combinedSwitchQueued = false;
    switchToCombinedAR().catch((err) => {
      console.error("Could not activate combined AR target library:", err);
    });
  }
}

function checkCollectionComplete() {
  const galleryArtworks = artworks.filter((a) => a.modelObj);
  const allUnlocked = galleryArtworks.length > 0 && galleryArtworks.every((a) => a.unlocked);
  if (allUnlocked && !leaderboardSubmitted && sessionStartTime) {
    leaderboardSubmitted = true;
    const elapsed = (Date.now() - sessionStartTime) / 1000;
    submitLeaderboardEntry(currentUsername || "Anonymous", elapsed);
  }
}

// -------------------------------------------------------------------
// MindAR scene creation / replacement
// -------------------------------------------------------------------
function isCombinedARActive() {
  return activeARTargetMode === "combined" && !!document.getElementById("ar-scene");
}

function stopAndRemoveCurrentARScene() {
  const oldScene = document.getElementById("ar-scene");
  if (!oldScene) return;

  try {
    const mindarSystem =
      oldScene.systems && oldScene.systems["mindar-image-system"];

    if (mindarSystem && typeof mindarSystem.stop === "function") {
      mindarSystem.stop();
    }
  } catch (err) {
    console.warn("Could not cleanly stop the previous MindAR session:", err);
  }

  try {
    oldScene.pause?.();
  } catch (_) {}

  oldScene.remove();
  activeModelEl = null;
  activeTargetCount = 0;
}

function buildARScene(scannable, imageTargetSrc, mode = "builtin") {
  if (!scannable || scannable.length === 0) {
    throw new Error("No artworks are available for AR scanning.");
  }

  activeARTargetMode = mode;
  activeModelEl = null;
  activeTargetCount = 0;

  const targetEntities = scannable
    .map((art, i) =>
      `<a-entity id="ar-target-${i}" mindar-image-target="targetIndex: ${i}"></a-entity>`
    )
    .join("\n");

  arContainer.innerHTML = `
    <a-scene
      id="ar-scene"
      mindar-image="imageTargetSrc: ${imageTargetSrc}; maxTrack: ${scannable.length}; filterMinCF: 0.0001; filterBeta: 1000; missTolerance: 5; warmupTolerance: 3; uiLoading: no; uiScanning: no; uiError: no;"
      color-space="sRGB"
      renderer="colorManagement: true, physicallyCorrectLights"
      vr-mode-ui="enabled: false"
      device-orientation-permission-ui="enabled: false"
      embedded
    >
      <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
      ${targetEntities}
    </a-scene>
  `;

  const arScene = document.getElementById("ar-scene");

  arScene.addEventListener("renderstart", () => {
    // The initial built-in scene controls the real loading-screen dismissal.
    // The background Firebase compiler never changes loadingText or blocks UI.
    setTimeout(() => loadingScreen.classList.add("hidden"), 300);
  });

  scannable.forEach((art, i) => {
    const targetEl = document.getElementById(`ar-target-${i}`);
    if (!targetEl) return;

    targetEl.addEventListener("targetFound", () =>
      handleTargetFound(art, i, targetEl)
    );
    targetEl.addEventListener("targetLost", handleTargetLost);
  });

  return arScene;
}

async function loadMarkerImagesWithConcurrency(artworkList, concurrency = 4) {
  const results = new Array(artworkList.length);
  let nextIndex = 0;
  let completed = 0;

  async function worker() {
    while (true) {
      const index = nextIndex++;
      if (index >= artworkList.length) return;

      const art = artworkList[index];

      try {
        const image = await loadImage(art.markerImage);
        results[index] = { status: "fulfilled", value: image };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }

      completed++;

      updateFirebaseARStatus({
        phase: "loading-images",
        progress: artworkList.length
          ? 10 + (completed / artworkList.length) * 10
          : 10,
        loaded: completed,
        total: artworkList.length,
        message: `Loading AR images (${completed}/${artworkList.length})…`,
      });
    }
  }

  const workerCount = Math.min(concurrency, artworkList.length);

  await Promise.all(
    Array.from({ length: workerCount }, () => worker())
  );

  return results;
}

// -------------------------------------------------------------------
// Background compilation of Firebase + built-in markers
// -------------------------------------------------------------------
async function prepareCombinedMarkersInBackground(bundledTargetIds) {
  if (combinedCompilePromise) return combinedCompilePromise;

  const uploadedArtworks = artworks.filter(
    (art) => art.markerImage && !bundledTargetIds.has(art.id)
  );

  if (uploadedArtworks.length === 0) {
    return null;
  }

  combinedCompilePromise = (async () => {
    console.log(
      `[AR] Preparing ${uploadedArtworks.length} Firebase marker(s) in the background…`
    );

    updateFirebaseARStatus({
      phase: "checking-cache",
      progress: 5,
      loaded: 0,
      total: uploadedArtworks.length,
      ready: false,
      message: `Checking for a cached AR target library…`,
    });

    // IMPORTANT: the built-in marker images are compiled into the combined
    // library using the exact same local files already used by the app.
    // The existing static targets.mind is still used first, so built-ins are
    // immediately available while this work happens silently in the background.
    const combinedArtworkList = [
      ...BUILTIN_ARTWORKS.filter((art) => art.markerImage),
      ...uploadedArtworks,
    ];

    const signature = computeArtworkListSignature(combinedArtworkList);

    // ---- Fast path: reuse a previously compiled target library ----
    // If nothing about the artwork set (or their images) has changed since
    // this device last compiled, skip straight to using the cached binary.
    // This is what turns "slow every single time" into "slow once".
    const cachedBuffer = await loadCachedCombinedTargets(signature);
    if (cachedBuffer) {
      console.log(
        "[AR] Using cached combined target library (skipping recompilation)."
      );

      updateFirebaseARStatus({
        phase: "ready",
        progress: 100,
        loaded: uploadedArtworks.length,
        total: uploadedArtworks.length,
        ready: true,
        message: `AR ready (loaded from cache) — ${combinedArtworkList.length} artwork(s) total.`,
      });

      if (combinedObjectUrl) {
        URL.revokeObjectURL(combinedObjectUrl);
        combinedObjectUrl = null;
      }
      combinedObjectUrl = URL.createObjectURL(
        new Blob([cachedBuffer], { type: "application/octet-stream" })
      );

      // The cache is only trusted when its signature matches the full,
      // current artwork list exactly, so we can assume every artwork in
      // combinedArtworkList was successfully included when it was built.
      combinedTargetData = {
        artworks: combinedArtworkList,
        imageTargetSrc: combinedObjectUrl,
      };

      if (!screenScanner.classList.contains("hidden")) {
        if (activeTargetCount > 0) {
          combinedSwitchQueued = true;
        } else {
          await switchToCombinedAR();
        }
      }

      return combinedTargetData;
    }

    // ---- Slow path: nothing cached (or artwork set changed) — compile ----
    updateFirebaseARStatus({
      phase: "loading-images",
      progress: 10,
      loaded: 0,
      total: combinedArtworkList.length,
      ready: false,
      message: `Downloading ${combinedArtworkList.length} marker image(s)…`,
    });

    const results = await loadMarkerImagesWithConcurrency(
      combinedArtworkList,
      4
    );

    const compiledArtworks = [];
    const images = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const art = combinedArtworkList[i];

      if (result.status === "fulfilled") {
        try {
          await waitForUiIdle(150);
          await yieldToUi();
          compiledArtworks.push(art);
          images.push(prepareMarkerImage(result.value));
        } catch (err) {
          console.error(
            `[AR] Could not prepare marker image for "${art.name}":`,
            err
          );
        }
      } else {
        console.error(
          `[AR] Marker image failed to load for "${art.name}" (${art.markerImage}).`,
          result.reason
        );
      }
    }

    await waitForUiIdle(1800);
    await yieldToUi();

    const builtinCompiledCount = compiledArtworks.filter((art) =>
      bundledTargetIds.has(art.id)
    ).length;
    const uploadedCompiledCount = compiledArtworks.filter((art) =>
      !bundledTargetIds.has(art.id)
    ).length;

    if (uploadedCompiledCount === 0) {
      console.warn(
        "[AR] No Firebase marker images could be compiled. Keeping the original built-in AR scene."
      );
      updateFirebaseARStatus({
        phase: "error",
        progress: 0,
        ready: false,
        message: `Couldn't load any Firebase marker image(s) — check the image URLs and Firebase Storage CORS settings.`,
      });
      return null;
    }

    if (builtinCompiledCount === 0) {
      console.warn(
        "[AR] Firebase markers loaded, but no built-in marker could be compiled. " +
        "Keeping the original built-in AR scene to protect existing functionality."
      );
      updateFirebaseARStatus({
        phase: "error",
        progress: 0,
        ready: false,
        message: `Firebase markers loaded, but a built-in marker failed — keeping the original AR scene.`,
      });
      return null;
    }

    console.log(
      `[AR] Compiling combined target library: ${builtinCompiledCount} built-in + ${uploadedCompiledCount} Firebase marker(s).`
    );

    updateFirebaseARStatus({
      phase: "compiling",
      progress: 20,
      loaded: compiledArtworks.length,
      total: combinedArtworkList.length,
      ready: false,
      message: `Compiling AR targets (0%)…`,
    });

    const compiler = new window.MINDAR.IMAGE.Compiler();

    // MindAR's compiler *may* call this with a 0-100 percent as each target
    // finishes — if so we use real numbers. But not every build reliably
    // fires it, so we also run a gentle simulated-progress ticker in
    // parallel (an ease-toward-88% curve) purely so the bar keeps visibly
    // moving during the slow compile step instead of sitting frozen. Real
    // progress, when it arrives, always overrides the simulated value.
    let compileProgress = 20;
    const progressTicker = setInterval(() => {
      compileProgress += (88 - compileProgress) * 0.12;
      updateFirebaseARStatus({
        phase: "compiling",
        progress: compileProgress,
        message: `Compiling AR targets…`,
      });
    }, 600);

    try {
      await compiler.compileImageTargets(images, (percent) => {
        const clamped = Math.max(0, Math.min(100, percent));
        compileProgress = 20 + (clamped / 100) * 70; // 20%–90% of the overall bar
        updateFirebaseARStatus({
          phase: "compiling",
          progress: compileProgress,
          message: `Compiling AR targets (${Math.round(clamped)}%)…`,
        });
      });
    } finally {
      clearInterval(progressTicker);
    }

    updateFirebaseARStatus({
      phase: "exporting",
      progress: 92,
      message: `Finalizing AR target library…`,
    });

    const exportedBuffer = await compiler.exportData();

    // Cache this result for next time, keyed to exactly this artwork set.
    // If the buffer is very large this may silently no-op (see the
    // try/catch inside saveCachedCombinedTargets) — that's fine, it just
    // means this device will recompile again next visit.
    const compiledSignature = computeArtworkListSignature(compiledArtworks);
    saveCachedCombinedTargets(compiledSignature, exportedBuffer);

    if (combinedObjectUrl) {
      URL.revokeObjectURL(combinedObjectUrl);
      combinedObjectUrl = null;
    }

    combinedObjectUrl = URL.createObjectURL(
      new Blob([exportedBuffer], { type: "application/octet-stream" })
    );

    combinedTargetData = {
      artworks: compiledArtworks,
      imageTargetSrc: combinedObjectUrl,
    };

    console.log(
      `[AR] Combined target library ready: ${compiledArtworks.length} total target(s).`
    );

    updateFirebaseARStatus({
      phase: "ready",
      progress: 100,
      loaded: compiledArtworks.length,
      total: combinedArtworkList.length,
      ready: true,
      message: `AR ready — ${compiledArtworks.length} artwork(s) available for scanning.`,
    });

    // Only restart MindAR automatically if the user is actually looking at
    // the scanner. If they are elsewhere in the app, keep the compiled data
    // ready and activate it the next time they open the scanner.
    if (!screenScanner.classList.contains("hidden")) {
      if (activeTargetCount > 0) {
        combinedSwitchQueued = true;
        console.log("[AR] Combined library ready; waiting for current target to be lost before switching.");
      } else {
        await switchToCombinedAR();
      }
    }

    return combinedTargetData;
  })().catch((err) => {
    console.error("[AR] Background combined marker compilation failed:", err);
    updateFirebaseARStatus({
      phase: "error",
      progress: 0,
      ready: false,
      message: `AR preparation failed: ${err.message || err}`,
    });
    combinedTargetData = null;
    return null;
  });

  return combinedCompilePromise;
}

async function switchToCombinedAR() {
  if (!combinedTargetData) return;
  if (isCombinedARActive()) return;

  // If the scanner is not currently visible, do not start/restart the camera.
  // showScanner() will activate the ready combined library when opened.
  if (screenScanner.classList.contains("hidden")) return;

  const { artworks: scannable, imageTargetSrc } = combinedTargetData;

  if (!scannable || !scannable.length || !imageTargetSrc) {
    console.warn("[AR] Combined target data is incomplete; keeping current AR scene.");
    return;
  }

  console.log("[AR] Switching to combined built-in + Firebase target library…");

  stopAndRemoveCurrentARScene();
  buildARScene(scannable, imageTargetSrc, "combined");

  // Give A-Frame/MindAR a moment to create the new scene before updating the hint.
  setTimeout(() => {
    if (!screenScanner.classList.contains("hidden")) {
      scanHint.textContent = "Point your camera at an artwork";
      scanHint.classList.remove("found");
    }
  }, 250);
}

// -------------------------------------------------------------------
// Initial AR startup
// -------------------------------------------------------------------
async function initAR() {
  const bundledTargetIds = new Set(
    BUILTIN_ARTWORKS
      .filter((a) => a.markerImage)
      .map((a) => a.id)
  );

  let staticTargetsAvailable = false;
  const imageTargetSrc = "./assets/targets.mind";

  // Fast path: use the existing static .mind file exactly as before.
  // This is what makes the built-in artworks immediately scannable.
  try {
    const targetResponse = await fetch(imageTargetSrc, { cache: "no-store" });
    if (!targetResponse.ok) {
      throw new Error(`status ${targetResponse.status}`);
    }
    staticTargetsAvailable = true;
  } catch (error) {
    console.warn("[AR] Static MindAR target file unavailable:", error);
  }

  const builtinScannable = artworks.filter(
    (art) => bundledTargetIds.has(art.id) && art.markerImage
  );

  if (staticTargetsAvailable && builtinScannable.length > 0) {
    // IMPORTANT: mount the proven built-in scene FIRST.
    // Nothing waits for Firebase image downloads or compilation here.
    buildARScene(builtinScannable, imageTargetSrc, "builtin");

    // Firebase AR preparation is scheduled separately after the UI is interactive.

    return;
  }

  // Fallback only if the static built-in target file is missing/unusable.
  // In that case we must compile the available markers before AR can start.
  const fallbackScannable = artworks.filter((a) => a.markerImage);

  if (fallbackScannable.length === 0) {
    throw new Error("No artworks have marker images available for scanning.");
  }

  console.warn("[AR] Falling back to runtime compilation because targets.mind is unavailable.");

  const results = await Promise.allSettled(
    fallbackScannable.map((a) => loadImage(a.markerImage))
  );

  const compiled = [];
  const images = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      try {
        compiled.push(fallbackScannable[i]);
        images.push(prepareMarkerImage(result.value));
      } catch (err) {
        console.error(
          `Marker image could not be prepared for "${fallbackScannable[i].name}":`,
          err
        );
      }
    } else {
      console.error(
        `Marker image failed to load for "${fallbackScannable[i].name}" (${fallbackScannable[i].markerImage}).`,
        result.reason
      );
    }
  });

  if (images.length === 0) {
    throw new Error(
      "No marker images could be loaded at all — check your assets folder and Firebase Storage CORS settings."
    );
  }

  const compiler = new window.MINDAR.IMAGE.Compiler();
  await compiler.compileImageTargets(images);
  const exportedBuffer = await compiler.exportData();
  const fallbackObjectUrl = URL.createObjectURL(
    new Blob([exportedBuffer], { type: "application/octet-stream" })
  );

  buildARScene(compiled, fallbackObjectUrl, "combined");
}

// =====================================================================
// DYNAMIC ARTWORK LOADING (built-in + Firebase uploads)
// =====================================================================
function initArtworks() {
  // Local built-ins are the critical startup data.
  artworks = BUILTIN_ARTWORKS.map((a) => ({ ...a }));
  return artworks;
}

async function parseFirebaseJsonOffMainThread(text) {
  if (typeof Worker === "undefined" || text.length < 100000) return JSON.parse(text);

  const workerSource = `
    self.onmessage = function(event) {
      try {
        self.postMessage({ ok: true, data: JSON.parse(event.data) });
      } catch (error) {
        self.postMessage({ ok: false, error: error && error.message ? error.message : String(error) });
      }
    };
  `;
  const blob = new Blob([workerSource], { type: "application/javascript" });
  const workerUrl = URL.createObjectURL(blob);

  try {
    return await new Promise((resolve, reject) => {
      const worker = new Worker(workerUrl);
      const cleanup = () => { worker.terminate(); URL.revokeObjectURL(workerUrl); };
      worker.onmessage = (event) => {
        cleanup();
        if (event.data?.ok) resolve(event.data.data);
        else reject(new Error(event.data?.error || "Could not parse Firebase artwork data."));
      };
      worker.onerror = (error) => {
        cleanup();
        reject(error instanceof Error ? error : new Error("Firebase JSON worker failed."));
      };
      worker.postMessage(text);
    });
  } catch (error) {
    console.warn("[Firebase] Worker JSON parsing unavailable; using main-thread parsing.", error);
    return JSON.parse(text);
  }
}

async function loadFirebaseArtworksInBackground() {
  if (firebaseArtworkLoadPromise) return firebaseArtworkLoadPromise;

  firebaseArtworkLoadPromise = (async () => {
    if (navigator.onLine === false) return [];

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${FIREBASE_URL}/artworks.json`, {
        method: "GET", cache: "default", signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`Firebase returned HTTP ${res.status}`);

      const text = await res.text();
      if (!text || text === "null") return [];
      const data = await parseFirebaseJsonOffMainThread(text);
      if (!data || typeof data !== "object") return [];

      const uploaded = Object.entries(data).map(([key, val]) => {
        if (!val || typeof val !== "object") return null;
        const image = val.image || "";
        const thumbnail = val.thumbnail || image;
        const markerImage = val.markerImage || image;
        if (!image) return null;
        return {
          id: key, name: val.name || "Untitled Artwork", image, thumbnail, markerImage,
          artist: val.artist || "", year: val.year || "", location: val.location || "",
          details: val.details || "", modelObj: null, modelMtl: null,
          baseScale: Number(val.baseScale) || 0.06, icon: val.icon || "🖼️",
          unlocked: false, quizCompleted: false, quiz: Array.isArray(val.quiz) ? val.quiz : [],
        };
      }).filter(Boolean);

      if (!uploaded.length) {
        updateFirebaseARStatus({ phase: "waiting", progress: 0, loaded: 0, total: 0, ready: false, message: "No Firebase-uploaded artworks found yet." });
        return [];
      }

      artworks = [...BUILTIN_ARTWORKS.map((a) => ({ ...a })), ...uploaded];
      console.log(`[Firebase] Loaded ${uploaded.length} uploaded artwork(s) in background.`);

      if (typeof renderGallery === "function" && !screenHome.classList.contains("hidden")) renderGallery();

      const bundledTargetIds = new Set(
        BUILTIN_ARTWORKS.filter((a) => a.markerImage).map((a) => a.id)
      );

      updateFirebaseARStatus({
        phase: "waiting", progress: 0, loaded: 0, total: uploaded.length, ready: false,
        message: "Firebase artworks loaded. AR preparation will run when the UI is idle.",
      });

      if (!firebaseARPreparationScheduled) {
        firebaseARPreparationScheduled = true;
        setTimeout(async () => {
          try {
            if (arInitializationPromise) await arInitializationPromise;
            await waitForUiIdle(2500);
            await prepareCombinedMarkersInBackground(bundledTargetIds);
          } catch (err) {
            console.error("[AR] Deferred Firebase preparation failed:", err);
          }
        }, 1500);
      }
      return uploaded;
    } catch (err) {
      console.warn("[Firebase] Background artwork loading failed; built-in artworks remain available.", err);
      return [];
    }
  })();
  return firebaseArtworkLoadPromise;
}


// =====================================================================
// FIREBASE AR PREPARATION STATUS
// =====================================================================
let firebaseARStatus = {
  phase: "not-started",
  progress: 0,
  loaded: 0,
  total: 0,
  ready: false,
  message: "Firebase AR preparation has not started yet."
};

function updateFirebaseARStatus(patch = {}) {
  firebaseARStatus = { ...firebaseARStatus, ...patch };
  window.firebaseARStatus = { ...firebaseARStatus };

  const statusEl = document.getElementById("settings-ar-status");
  if (!statusEl) return;

  const pct = Math.max(0, Math.min(100, Math.round(firebaseARStatus.progress || 0)));
  statusEl.innerHTML = `
    <div style="font-weight:700;margin-bottom:6px;">Firebase AR</div>
    <div style="font-size:13px;line-height:1.4;">${firebaseARStatus.message}</div>
    <div style="height:6px;background:rgba(255,255,255,.12);border-radius:999px;overflow:hidden;margin-top:9px;">
      <div style="height:100%;width:${pct}%;background:currentColor;border-radius:999px;transition:width .25s ease;"></div>
    </div>
    <div style="font-size:11px;opacity:.7;margin-top:5px;">${pct}%</div>
  `;
}

function ensureSettingsARStatus() {
  if (!screenSettings) return null;

  let statusEl = document.getElementById("settings-ar-status");
  if (!statusEl) {
    statusEl = document.createElement("div");
    statusEl.id = "settings-ar-status";
    statusEl.style.cssText =
      "margin:16px 0;padding:12px 14px;border-radius:12px;" +
      "background:rgba(255,255,255,.06);color:inherit;" +
      "border:1px solid rgba(255,255,255,.12);";
    screenSettings.insertBefore(statusEl, screenSettings.firstChild);
  }

  updateFirebaseARStatus();
  return statusEl;
}

window.firebaseARStatus = { ...firebaseARStatus };

// =====================================================================
// ANALYTICS: page visits + presence heartbeat
// =====================================================================
function recordVisit() {
  fetch(`${FIREBASE_URL}/analytics_visits.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timestamp: Date.now() }),
  }).catch(() => {});
}

function sendHeartbeat() {
  fetch(`${FIREBASE_URL}/presence/${myDeviceId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timestamp: Date.now(), name: currentUsername || "Anonymous" }),
  }).catch(() => {});
}

function startPresenceHeartbeat() {
  sendHeartbeat();
  setInterval(sendHeartbeat, 20000);
}

recordVisit();
startPresenceHeartbeat();
// =====================================================================
// ONBOARDING TOUR
// =====================================================================

const TOUR_STEPS = [
  {
    target: null,
    illustration: "🖼️",
    title: "Welcome to the GBR Museum!",
    text: "Your personal gallery awaits. Scan artworks with AR to unlock hidden stories, take quizzes, and collect badges along the way.",
  },
  {
    target: "#gallery-grid",
    illustration: "🔒",
    title: "Artwork Cards",
    text: "These cards represent real artworks on display. Locked ones are hidden until you scan them with the AR camera.",
  },
  {
    target: ".filter-row",
    illustration: "⚡",
    title: "Quick Filters",
    text: "Switch between Locked and Unlocked to see what's left to discover or admire what you've already found.",
  },
  {
    target: ".progress-row",
    illustration: "📊",
    title: "Track Your Progress",
    text: "Watch your completion bar fill up as you unlock artworks. Complete them all to earn a spot on the leaderboard!",
  },
  {
    target: ".corner-fabs-left",
    illustration: "🏅",
    title: "Badges & Library",
    text: "View your earned badges, browse the full artwork library (no camera needed), or change your display name anytime.",
  },
  {
    target: "#bottom-nav",
    illustration: "📷",
    title: "AR Camera",
    text: "Tap the AR Camera tab to launch the scanner. Point your camera at any artwork to instantly unlock its story!",
  },
  {
    target: null,
    illustration: "🎉",
    title: "You're All Set!",
    text: "Start exploring, scan your first artwork, and race to the top of the leaderboard. Happy hunting!",
  },
];

let currentTourStep = 0;
let highlightedEl = null;

function initTour() {
  if (localStorage.getItem("museum_tour_seen")) {
    showHome();
    bottomNav.classList.remove("hidden");
    return;
  }

  // Don't start the tour until the loading screen is finished
  if (!loadingScreen.classList.contains("hidden")) {
    setTimeout(initTour, 200);
    return;
  }

  currentTourStep = 0;
  renderTourDots();
  showTourStep();
  document.getElementById("tour-overlay").classList.remove("hidden");
}

function showTourStep() {
  const step = TOUR_STEPS[currentTourStep];
  const title = document.getElementById("tour-title");
  const text = document.getElementById("tour-text");
  const count = document.getElementById("tour-step-count");
  const illo = document.getElementById("tour-illustration");
  const prevBtn = document.getElementById("btn-tour-prev");
  const nextBtn = document.getElementById("btn-tour-next");
  const overlay = document.getElementById("tour-overlay");

  title.textContent = step.title;
  text.textContent = step.text;
  count.textContent = `${currentTourStep + 1} / ${TOUR_STEPS.length}`;
  illo.textContent = step.illustration;

  prevBtn.classList.toggle("hidden", currentTourStep === 0);
  nextBtn.textContent = currentTourStep === TOUR_STEPS.length - 1 ? "Get Started 🎉" : "Next →";

  clearTourHighlight();
  if (step.target) {
    const el = document.querySelector(step.target);
    if (el) {
      highlightedEl = el;
      el.classList.add("tour-highlight");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      overlay.classList.add("has-highlight");
    } else {
      overlay.classList.remove("has-highlight");
    }
  } else {
    overlay.classList.remove("has-highlight");
  }

  positionTourCard();

  document.querySelectorAll(".tour-dot").forEach((d, i) => {
    d.classList.toggle("active", i === currentTourStep);
  });
}

function positionTourCard() {
  const card = document.getElementById("tour-card");
  const step = TOUR_STEPS[currentTourStep];

  card.style.top = "";
  card.style.bottom = "";
  card.style.transform = "";

  const isShort = window.innerHeight <= 640;
  const noTarget = !step.target;
  const isBottomNav = step.target === "#bottom-nav";

  if (noTarget || isShort || isBottomNav) {
    card.style.top = "50%";
    card.style.transform = "translateY(-50%)";
  } else {
    card.style.bottom = "calc(var(--nav-height) + max(16px, env(safe-area-inset-bottom)))";

    if (highlightedEl) {
      const rect = highlightedEl.getBoundingClientRect();
      if (rect.top > window.innerHeight / 2) {
        card.style.bottom = "auto";
        card.style.top = "max(16px, env(safe-area-inset-top))";
        card.style.transform = "none";
      }
    }
  }
}

function clearTourHighlight() {
  if (highlightedEl) {
    highlightedEl.classList.remove("tour-highlight");
    highlightedEl = null;
  }
}

function renderTourDots() {
  const container = document.getElementById("tour-dots");
  container.innerHTML = TOUR_STEPS.map((_, i) =>
    `<div class="tour-dot ${i === 0 ? "active" : ""}" data-index="${i}"></div>`
  ).join("");
}

function nextTourStep() {
  if (currentTourStep < TOUR_STEPS.length - 1) {
    currentTourStep++;
    showTourStep();
  } else {
    hideTour();
  }
}

function prevTourStep() {
  if (currentTourStep > 0) {
    currentTourStep--;
    showTourStep();
  }
}

function hideTour() {
  localStorage.setItem("museum_tour_seen", "1");
  clearTourHighlight();
  document.getElementById("tour-overlay").classList.add("hidden");
  showHome();
  bottomNav.classList.remove("hidden");
}

// Tour controls
document.getElementById("btn-tour-next").addEventListener("click", nextTourStep);
document.getElementById("btn-tour-prev").addEventListener("click", prevTourStep);
document.getElementById("btn-tour-skip").addEventListener("click", hideTour);

// Swipe support
(function initTourSwipe() {
  const overlay = document.getElementById("tour-overlay");
  let startX = 0;
  overlay.addEventListener("touchstart", (e) => {
    if (overlay.classList.contains("hidden")) return;
    startX = e.touches[0].clientX;
  }, { passive: true });
  overlay.addEventListener("touchend", (e) => {
    if (overlay.classList.contains("hidden")) return;
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextTourStep();
      else prevTourStep();
    }
  }, { passive: true });
})();

// Reposition on resize
window.addEventListener("resize", () => {
  const overlay = document.getElementById("tour-overlay");
  if (overlay && !overlay.classList.contains("hidden")) {
    positionTourCard();
  }
});
// -------------------------------------------------------------------
// Immersive Mode (markerless skybox)
// -------------------------------------------------------------------
AFRAME.registerComponent("joystick-movement", {
  schema: { speed: { default: 0.004 } },
  init: function () {
    this.moveVector = { x: 0, y: 0 };
    this.zone = document.getElementById("joystick-zone");
    this.knob = document.getElementById("joystick-knob");
    this.active = false;
    this.maxDist = 40;
    this.center = { x: 0, y: 0 };

    this.start = this.start.bind(this);
    this.move = this.move.bind(this);
    this.end = this.end.bind(this);

    this.zone.addEventListener("touchstart", this.start, { passive: false });
    this.zone.addEventListener("mousedown", this.start);
    window.addEventListener("touchmove", this.move, { passive: false });
    window.addEventListener("mousemove", this.move);
    window.addEventListener("touchend", this.end);
    window.addEventListener("touchcancel", this.end);
    window.addEventListener("mouseup", this.end);
  },
  start: function (e) {
    e.preventDefault();
    this.active = true;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = this.zone.getBoundingClientRect();
    this.center.x = rect.left + rect.width / 2;
    this.center.y = rect.top + rect.height / 2;
    this.update(cx, cy);
  },
  move: function (e) {
    if (!this.active) return;
    if (e.touches && e.touches.length > 1) return;
    e.preventDefault();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    this.update(cx, cy);
  },
  end: function () {
    if (!this.active) return;
    this.active = false;
    this.moveVector.x = 0;
    this.moveVector.y = 0;
    this.knob.style.transform = "translate(0px, 0px)";
  },
  update: function (x, y) {
    let dx = x - this.center.x;
    let dy = y - this.center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > this.maxDist) {
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * this.maxDist;
      dy = Math.sin(angle) * this.maxDist;
    }
    this.knob.style.transform = `translate(${dx}px, ${dy}px)`;
    this.moveVector.x = dx / this.maxDist;
    this.moveVector.y = dy / this.maxDist;
  },
  tick: function (_t, dt) {
    if (!this.active) return;
    const cam = this.el.object3D;
    const dir = new THREE.Vector3();
    cam.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    const right = new THREE.Vector3();
    right.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
    const s = this.data.speed * dt;
    cam.position.add(dir.multiplyScalar(this.moveVector.y * s));
    cam.position.add(right.multiplyScalar(-this.moveVector.x * s));
  },
});
async function startImmersive(art) {
  // iOS 13+ requires explicit permission for device orientation
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      await DeviceOrientationEvent.requestPermission();
    } catch (err) {
      console.warn('Device orientation permission error:', err);
    }
  }

  hideAllScreens();
  screenImmersive.classList.remove("hidden");
  bottomNav.classList.add("hidden");
  setBgLayerForScreen(true);

  immersiveContainer.innerHTML = `
    <a-scene embedded vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false">
      <a-entity camera look-controls="touchEnabled: true; mouseEnabled: true; magicWindowTrackingEnabled: true" joystick-movement="speed: 0.004" position="0 1.6 0"></a-entity>
      <a-entity gltf-model="${art.immersiveSkybox}" position="0 0 0" scale="100 100 100"></a-entity>
      <a-entity gltf-model="${art.modelObj}" position="0 0 -3" rotation="${art.immersiveRotation || '0 0 0'}" scale="${art.immersiveScale || art.baseScale || 1} ${art.immersiveScale || art.baseScale || 1} ${art.immersiveScale || art.baseScale || 1}"></a-entity>
      <a-light type="ambient" color="#ffffff" intensity="0.6"></a-light>
      <a-light type="directional" color="#ffffff" intensity="0.4" position="-1 2 1"></a-light>
    </a-scene>
  `;
  document.getElementById("joystick-zone").classList.remove("hidden");
}

function exitImmersive() {
  document.getElementById("joystick-zone").classList.add("hidden");
  immersiveContainer.innerHTML = "";
  setBgLayerForScreen(false);
  if (currentDetailArtId !== null) openDetail(currentDetailArtId);
  else showHome();
}
// =====================================================================
// BOOT
// =====================================================================
async function bootMuseum() {
  // Critical path: local museum + built-in AR only. Firebase never blocks boot.
  initArtworks();
  restoreProgress();

  if (currentUsername) {
    screenUsername.classList.add("hidden");
    showHome();
    initTour();
  }

  loadingScreen.classList.add("hidden");

  updateFirebaseARStatus({
    phase: "waiting", progress: 0, loaded: 0, total: 0, ready: false,
    message: "Built-in museum ready. Firebase artworks will load in the background.",
  });

  // Offline caching is also background work and must not delay the UI.
  if (window.MuseumOffline) {
    setTimeout(() => {
      window.MuseumOffline.preloadAssets(({ completed, total, failed }) => {
        const percent = total ? Math.round((completed / total) * 100) : 0;
        loadingProgressFill.style.width = `${percent}%`;
        loadingProgressFill.parentElement.setAttribute("aria-valuenow", String(percent));
        loadingProgressText.textContent = failed
          ? `${completed} / ${total} files ready (${failed} will retry later)`
          : `${completed} / ${total} files ready`;
      }).catch((err) => console.warn("[Offline] Background preload failed:", err));
    }, 2000);
  }

  // Built-in AR starts independently of Firebase. The local targets.mind path
  // remains the fast/offline scanner for all bundled artworks.
  arInitializationPromise = initAR().catch((err) => {
    console.error("Background AR initialization failed:", err);
    return null;
  });

  // Request camera permission without awaiting it. Navigation stays responsive.
  navigator.mediaDevices?.getUserMedia?.({ video: true })
    .then((stream) => stream.getTracks().forEach((track) => track.stop()))
    .catch((err) => {
      console.error("Camera permission/init failed:", err);
      permissionError.classList.remove("hidden");
    });

  // Firebase metadata is intentionally delayed until after the app is interactive.
  setTimeout(() => {
    loadFirebaseArtworksInBackground().catch((err) => console.error("[Firebase] Background load failed:", err));
  }, 2000);
}

bootMuseum();
