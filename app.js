// Simple helper
function $(selector) {
  return document.querySelector(selector);
}

// ---- Landing / enter house ----
const landing = $("#landing");
const house = $("#house");
const enterHouseBtn = $("#enterHouseBtn");

enterHouseBtn.addEventListener("click", () => {
  landing.classList.add("hidden");
  house.classList.remove("hidden");
});

// ---- Room config for swipe + map ----
const roomsWrapper = $("#roomsWrapper");
const slides = Array.from(roomsWrapper.querySelectorAll(".room-slide"));

const heartLayer = document.getElementById("heartLayer");

function spawnHeart(kind = "heart") {
  if (!heartLayer) return;
  const span = document.createElement("span");
  span.className = "floating-heart";

  if (kind === "kiss") span.textContent = "💋";
  else if (kind === "hug") span.textContent = "🤗";
  else if (kind === "room") span.textContent = "💖";
  else span.textContent = "💕";

  const startLeft = Math.random() * 100; // 0–100vw
  const duration = 4000 + Math.random() * 2000; // 4–6s

  span.style.left = startLeft + "vw";
  span.style.animationDuration = duration + "ms";

  heartLayer.appendChild(span);

  setTimeout(() => {
    if (span.parentNode === heartLayer) {
      heartLayer.removeChild(span);
    }
  }, duration + 800);
}

const roomOrder = slides.map((slide) => slide.dataset.roomKey); // order from HTML

const roomInfo = {
  pet: { emoji: "🐾", name: "Pet room", note: "Feed our little pet" },
  love: { emoji: "🛏", name: "Love room", note: "Just you & me" },
  prayer: { emoji: "🕌", name: "Prayer room", note: "Du’a & barakah" },
  feelings: { emoji: "💬", name: "Feelings room", note: "Heart check-in" },
  game: { emoji: "🎮", name: "Game room", note: "X & O battles" },
  future: { emoji: "🗺", name: "Future room", note: "Plans & dreams" },
  letters: { emoji: "📬", name: "Letters room", note: "Open when you miss me" },
  dressup: { emoji: "👗", name: "Dress-up", note: "Outfits & vibes" },
  kitchen: { emoji: "🍳", name: "Kitchen", note: "Our future menu" },
};

let currentIndex = 0;

// ---- Tour text + index ----
const tourLocationText = $("#tourLocationText");
const roomIndexText = $("#roomIndexText");
const nextRoomBtn = $("#nextRoomBtn");

function updateRoomUI() {
  const key = roomOrder[currentIndex];
  const info = roomInfo[key];

  roomsWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
  tourLocationText.textContent = `You step into the ${info.emoji} ${info.name}.`;
  roomIndexText.textContent = `Room ${currentIndex + 1} of ${roomOrder.length}`;

  // highlight active slide
  slides.forEach((slide, idx) => {
    slide.classList.toggle("active-slide", idx === currentIndex);
  });

  updateMapActive();

  // little heart when you move between rooms
  spawnHeart("room");
}


nextRoomBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % roomOrder.length;
  updateRoomUI();
});

// ---- Swipe handling (left/right) ----
let startX = 0;
let isSwiping = false;

roomsWrapper.addEventListener(
  "touchstart",
  (e) => {
    if (!e.touches || e.touches.length === 0) return;
    startX = e.touches[0].clientX;
    isSwiping = true;
  },
  { passive: true }
);

roomsWrapper.addEventListener(
  "touchmove",
  (e) => {
    // we don't animate during move for simplicity, just record
    if (!isSwiping) return;
  },
  { passive: true }
);

roomsWrapper.addEventListener(
  "touchend",
  (e) => {
    if (!isSwiping) return;
    isSwiping = false;
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;
    const threshold = 40; // px

    if (Math.abs(deltaX) > threshold) {
      if (deltaX < 0 && currentIndex < roomOrder.length - 1) {
        // swipe left -> next
        currentIndex++;
      } else if (deltaX > 0 && currentIndex > 0) {
        // swipe right -> prev
        currentIndex--;
      }
      updateRoomUI();
    }
  },
  { passive: true }
);

// ---- Map overlay ----
const mapOverlay = $("#mapOverlay");
const openMapBtn = $("#openMapBtn");
const closeMapBtn = $("#closeMapBtn");
const mapGrid = $("#mapGrid");

openMapBtn.addEventListener("click", () => {
  mapOverlay.classList.remove("hidden");
  updateMapActive();
});

closeMapBtn.addEventListener("click", () => {
  mapOverlay.classList.add("hidden");
});

mapOverlay.addEventListener("click", (e) => {
  // close if click outside dialog
  if (e.target === mapOverlay) {
    mapOverlay.classList.add("hidden");
  }
});

function buildMap() {
  mapGrid.innerHTML = "";
  roomOrder.forEach((key, index) => {
    const info = roomInfo[key];
    const tile = document.createElement("button");
    tile.className = "map-tile";
    tile.dataset.index = index;
    tile.innerHTML = `
      <div class="map-tile-emoji">${info.emoji}</div>
      <div class="map-tile-main">
        <div class="map-tile-name">${info.name}</div>
        <div class="map-tile-note">${info.note}</div>
      </div>
    `;
    tile.addEventListener("click", () => {
      currentIndex = index;
      updateRoomUI();
      mapOverlay.classList.add("hidden");
    });
    mapGrid.appendChild(tile);
  });
}

function updateMapActive() {
  const tiles = mapGrid.querySelectorAll(".map-tile");
  tiles.forEach((tile) => {
    const idx = Number(tile.dataset.index);
    if (idx === currentIndex) tile.classList.add("active");
    else tile.classList.remove("active");
  });
}

// ---- Helpers ----
function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// ---- PET ROOM LOGIC ----
const kissBtn = $("#kissBtn");
const hugBtn = $("#hugBtn");
const kissCountEl = $("#kissCount");
const hugCountEl = $("#hugCount");
const petMessageEl = $("#petMessage");
const petEl = $("#pet");

const STORAGE_KEY_PET = "lovehouse_pet_stats_v1";

function loadPetStats() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_PET));
    if (saved && typeof saved.kisses === "number" && typeof saved.hugs === "number") {
      return saved;
    }
  } catch {
    /* ignore */
  }
  return { kisses: 0, hugs: 0 };
}

function savePetStats(stats) {
  localStorage.setItem(STORAGE_KEY_PET, JSON.stringify(stats));
}

let petStats = loadPetStats();
kissCountEl.textContent = petStats.kisses;
hugCountEl.textContent = petStats.hugs;

const kissMessages = [
  "Kiss received 💋 I love you even more now.",
  "Your kisses power my whole little universe, ya albi ✨",
  "Another kiss? I’m officially the luckiest pet and fiancé 😘",
  "Your lips are my favourite bug-free feature in this whole system 💻💋",
];

const hugMessages = [
  "Hug received 🤗 wrapping you in a big virtual cuddle.",
  "Your hugs are my safe place, even through a screen 🧸",
  "Virtual hug now, real hug in person soon inshaAllah 💕",
  "That hug just upgraded my heart firmware again 🥹",
];

function animatePet() {
  petEl.classList.add("bounce");
  setTimeout(() => petEl.classList.remove("bounce"), 160);
}

kissBtn.addEventListener("click", () => {
  petStats.kisses += 1;
  kissCountEl.textContent = petStats.kisses;
  petMessageEl.textContent = randomFrom(kissMessages);
  savePetStats(petStats);
  animatePet();
  spawnHeart("kiss");
});

hugBtn.addEventListener("click", () => {
  petStats.hugs += 1;
  hugCountEl.textContent = petStats.hugs;
  petMessageEl.textContent = randomFrom(hugMessages);
  savePetStats(petStats);
  animatePet();
  spawnHeart("hug");
});

// ---- LOVE ROOM ----
const loveRange = $("#loveRange");
const loveOutput = $("#loveOutput");
const loveNoteBtn = $("#loveNoteBtn");
const loveNoteMessage = $("#loveNoteMessage");

loveRange.addEventListener("input", () => {
  loveOutput.textContent = `Love level: ${loveRange.value}% (never under 80 for us 😏)`;
});

const loveNotes = [
  "Wallah, if I could choose again, I would still choose you in every lifetime.",
  "You are both my peace and my excitement at the same time, habibti.",
  "Every version of my future in my head has you in it. There is no future without you.",
  "You’re not just my fiancée, you are my favourite person in this whole dunya.",
];

loveNoteBtn.addEventListener("click", () => {
  loveNoteMessage.textContent = randomFrom(loveNotes);
});

// ---- PRAYER ROOM ----
const duaInput = $("#duaInput");
const addDuaBtn = $("#addDuaBtn");
const duaList = $("#duaList");
const STORAGE_KEY_DUA = "lovehouse_duas_v1";

function loadDuas() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_DUA));
    if (Array.isArray(saved)) return saved;
  } catch {
    /* ignore */
  }
  return [];
}

function saveDuas(duas) {
  localStorage.setItem(STORAGE_KEY_DUA, JSON.stringify(duas));
}

let duas = loadDuas();

function renderDuas() {
  duaList.innerHTML = "";
  duas.forEach((text) => {
    const div = document.createElement("div");
    div.className = "list-item";
    div.textContent = text;
    duaList.appendChild(div);
  });
}

renderDuas();

addDuaBtn.addEventListener("click", () => {
  const text = duaInput.value.trim();
  if (!text) return;
  duas.unshift(text);
  saveDuas(duas);
  renderDuas();
  duaInput.value = "";
});

// ---- FEELINGS ROOM ----
const feelingsInput = $("#feelingsInput");
const copyFeelingsBtn = $("#copyFeelingsBtn");

copyFeelingsBtn.addEventListener("click", async () => {
  const text = feelingsInput.value.trim();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    alert("Feelings copied 💌 You can paste them in WhatsApp now, habibti.");
  } catch {
    alert("Could not copy automatically. You can manually select and copy.");
  }
});

// ---- GAME ROOM (Tic Tac Toe) ----
const boardEl = $("#board");
const gameStatus = $("#gameStatus");
const resetGameBtn = $("#resetGameBtn");

let board = Array(9).fill(null);
let currentPlayer = "X";
let gameOver = false;

function createBoard() {
  boardEl.innerHTML = "";
  board.forEach((val, idx) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = idx;
    cell.textContent = val || "";
    cell.addEventListener("click", onCellClick);
    boardEl.appendChild(cell);
  });
}

function checkWinner() {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every((v) => v)) return "draw";
  return null;
}

function onCellClick(e) {
  if (gameOver) return;
  const idx = Number(e.currentTarget.dataset.index);
  if (board[idx]) return;
  board[idx] = currentPlayer;
  createBoard();
  const result = checkWinner();
  if (result === "draw") {
    gameStatus.textContent = "Draw! Rematch, ya champion? 😊";
    gameOver = true;
  } else if (result) {
    gameStatus.textContent = `Player ${result} wins! Next game I’m winning inshaAllah 😏`;
    gameOver = true;
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    gameStatus.textContent = `Your turn: ${currentPlayer}`;
  }
}

function resetGame() {
  board = Array(9).fill(null);
  currentPlayer = "X";
  gameOver = false;
  gameStatus.textContent = "Your turn: X";
  createBoard();
}

resetGameBtn.addEventListener("click", resetGame);
createBoard();

// ---- FUTURE ROOM ----
const futureInput = $("#futureInput");
const addFutureBtn = $("#addFutureBtn");
const futureList = $("#futureList");
const STORAGE_KEY_FUTURE = "lovehouse_future_v1";

function loadFuture() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_FUTURE));
    if (Array.isArray(saved)) return saved;
  } catch {
    /* ignore */
  }
  return [];
}

function saveFuture(arr) {
  localStorage.setItem(STORAGE_KEY_FUTURE, JSON.stringify(arr));
}

let futureItems = loadFuture();

function renderFuture() {
  futureList.innerHTML = "";
  futureItems.forEach((text) => {
    const div = document.createElement("div");
    div.className = "list-item";
    div.textContent = text;
    futureList.appendChild(div);
  });
}

renderFuture();

addFutureBtn.addEventListener("click", () => {
  const text = futureInput.value.trim();
  if (!text) return;
  futureItems.unshift(text);
  saveFuture(futureItems);
  renderFuture();
  futureInput.value = "";
});

// ---- LETTERS ROOM ----
const openLetterBtn = $("#openLetterBtn");
const letterMessage = $("#letterMessage");

const letters = [
  "My love, even when we are far, wallah you are the closest one to my heart. This little house is my way of sitting next to you on your phone.",
  "One day this won’t be pixels, it will be a real house with a real key and our names on the door. Until then, every swipe here is me holding your hand and saying: I’m not going anywhere.",
  "When things feel heavy, remember: you are not carrying them alone. I am with you, making du’a for you, supporting you, and loving you more than you think.",
  "You are my favourite notification, my favourite tab, my favourite everything. If life is a project, then you are the main feature, not a side task.",
];

openLetterBtn.addEventListener("click", () => {
  letterMessage.textContent = randomFrom(letters);
});

// ---- DRESS-UP ROOM ----
const outfitSelect = $("#outfitSelect");
const dressupTagline = $("#dressupTagline");
const avatarYou = $("#avatarYou");
const avatarHer = $("#avatarHer");

outfitSelect.addEventListener("change", () => {
  const value = outfitSelect.value;
  if (value === "comfy") {
    dressupTagline.textContent =
      "Comfy outfits, long calls, same blanket inshaAllah one day.";
    avatarYou.textContent = "🧑‍💻";
    avatarHer.textContent = "🧕";
  } else if (value === "fancy") {
    dressupTagline.textContent =
      "Fancy date night, both of us looking 11/10, even if it’s just on camera.";
    avatarYou.textContent = "🤵";
    avatarHer.textContent = "👸";
  } else if (value === "wedding") {
    dressupTagline.textContent =
      "Wedding outfits, signing our papers and starting our life inshaAllah.";
    avatarYou.textContent = "🤵‍♂️";
    avatarHer.textContent = "👰‍♀️";
  } else if (value === "travel") {
    dressupTagline.textContent =
      "Airport outfits, finally closing the distance and meeting again.";
    avatarYou.textContent = "🧑‍✈️";
    avatarHer.textContent = "🧳";
  } else if (value === "home") {
    dressupTagline.textContent =
      "At home clothes, same kitchen, same sofa, same everything.";
    avatarYou.textContent = "🧑‍🍳";
    avatarHer.textContent = "👩‍🍳";
  }
});

// ---- KITCHEN ROOM ----
const kitchenInput = $("#kitchenInput");
const addKitchenBtn = $("#addKitchenBtn");
const kitchenList = $("#kitchenList");
const STORAGE_KEY_KITCHEN = "lovehouse_kitchen_v1";

function loadKitchen() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_KITCHEN));
    if (Array.isArray(saved)) return saved;
  } catch {
    /* ignore */
  }
  return [];
}

function saveKitchen(arr) {
  localStorage.setItem(STORAGE_KEY_KITCHEN, JSON.stringify(arr));
}

let kitchenItems = loadKitchen();

function renderKitchen() {
  kitchenList.innerHTML = "";
  kitchenItems.forEach((text) => {
    const div = document.createElement("div");
    div.className = "list-item";
    div.textContent = text;
    kitchenList.appendChild(div);
  });
}

renderKitchen();

addKitchenBtn.addEventListener("click", () => {
  const text = kitchenInput.value.trim();
  if (!text) return;
  kitchenItems.unshift(text);
  saveKitchen(kitchenItems);
  renderKitchen();
  kitchenInput.value = "";
});

// ---- Init map + room UI ----
buildMap();
updateRoomUI();
