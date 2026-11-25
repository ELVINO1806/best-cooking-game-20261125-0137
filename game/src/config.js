// config.js — every fixed number and label for Sate Arang Senja.
// One job: hold the constants so the other files never hard-code them.

const SateConfig = {
  canvasWidth: 1280,
  canvasHeight: 480,

  // Shift length in seconds. The last minute is rush hour.
  shiftSeconds: 180,
  rushAtSecondsLeft: 60,

  // Grill: a skewer is done after cookSeconds, burnt after burnSeconds.
  grillSlots: 4,
  cookSeconds: 8,
  burnSeconds: 14,

  // Orders: patience in seconds, spawn pacing, at most this many live.
  orderPatienceSeconds: 50,
  maxOrders: 3,
  spawnEverySeconds: 14,
  rushSpawnEverySeconds: 7,
  rushPatienceMultiplier: 1.25,

  // Scoring.
  patienceBonusMax: 15,
  wrongServePenalty: 10,
  burntPenalty: 5,
  expiredPenalty: 15,
  comboStep: 0.1,

  // Meat types the grill can cook.
  meats: [
    { id: 'ayam', label: 'AYAM', color: '#e8a34c' },
    { id: 'kambing', label: 'KAMBING', color: '#b06a3b' },
    { id: 'campur', label: 'CAMPUR', color: '#d97b4f' }
  ],

  // Layout: every clickable station's rectangle on the 1280x480 canvas.
  zones: {
    orderBoard: { x: 16, y: 62, w: 384, h: 152 },
    grill: { x: 430, y: 62, w: 330, h: 172 },
    meatButtons: { x: 430, y: 240, w: 330, h: 30 },
    prep: { x: 790, y: 62, w: 210, h: 172 },
    sauce: { x: 1030, y: 62, w: 234, h: 172 },
    hand: { x: 16, y: 286, w: 384, h: 160 },
    plate: { x: 430, y: 286, w: 400, h: 160 },
    pass: { x: 860, y: 286, w: 404, h: 160 },
    hintBar: { x: 0, y: 452, w: 1280, h: 28 }
  },

  // Where each prep pile sits inside the prep zone.
  prepPiles: {
    lontong: { x: 830, y: 150, r: 42 },
    onion: { x: 895, y: 150, r: 42 },
    chili: { x: 960, y: 150, r: 42 }
  },

  // Grill slot centres, computed from the grill zone.
  grillSlotCentres: [
    { x: 480, y: 150 },
    { x: 555, y: 150 },
    { x: 630, y: 150 },
    { x: 705, y: 150 }
  ],

  // Palette: dusk charcoal-grill kitchen.
  colors: {
    wallTop: '#3a2418',
    wallBottom: '#241610',
    woodDark: '#5a3a22',
    wood: '#7a5230',
    woodLight: '#9a6b3d',
    board: '#2e2a26',
    chalk: '#f5efdd',
    coalGlow: '#ff7a1a',
    coalHot: '#ffb347',
    plateWhite: '#f7f2e7',
    passShelf: '#8a5a2e',
    hudBg: '#1d120b',
    gold: '#ffc93c',
    good: '#7ddc7d',
    warn: '#ffb347',
    bad: '#ff5a4e'
  }
};

// Item ids the player can hold in one hand.
const SateItems = {
  skewerAyam: { label: 'Sate Ayam', short: 'tusuk ayam' },
  skewerKambing: { label: 'Sate Kambing', short: 'tusuk kambing' },
  skewerCampur: { label: 'Sate Campur', short: 'tusuk campur' },
  lontong: { label: 'Lontong', short: 'lontong' },
  onion: { label: 'Bawang Iris', short: 'bawang' },
  sauce: { label: 'Saus Kacang', short: 'saus' },
  chili: { label: 'Sambal', short: 'sambal' }
};

function itemLabel(itemId) {
  const item = SateItems[itemId];
  return item ? item.label : itemId;
}

function meatSkewerItem(meatId) {
  if (meatId === 'ayam') return 'skewerAyam';
  if (meatId === 'kambing') return 'skewerKambing';
  return 'skewerCampur';
}
