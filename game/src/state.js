// state.js — the game's state: what exists, and how it changes.
// One job: create, reset, and mutate the single state object.

function createSateState() {
  const state = {
    phase: 'playing', // 'playing' | 'over'
    timeLeft: SateConfig.shiftSeconds,
    elapsed: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    servedWrong: 0,
    expired: 0,
    burnt: 0,
    orders: [],
    nextOrderId: 1,
    spawnTimer: 6,
    grill: [],
    plate: [],
    pass: [],
    hand: null,
    selectedMeat: 'ayam',
    rush: false,
    toast: '',
    toastUntil: 0,
    particles: [],
    hover: null,
    overReason: ''
  };
  for (let i = 0; i < SateConfig.grillSlots; i++) {
    state.grill.push({ meat: null, progress: 0, state: 'empty' });
  }
  return state;
}

function resetSateState(state) {
  const fresh = createSateState();
  for (const key of Object.keys(fresh)) state[key] = fresh[key];
}

function showToast(state, text, seconds) {
  state.toast = text;
  state.toastUntil = state.elapsed + (seconds || 2);
}

function addCoins(state, amount) {
  state.coins = Math.max(0, state.coins + amount);
}

function registerServe(state, earned) {
  state.served++;
  state.combo++;
  if (state.combo > state.bestCombo) state.bestCombo = state.combo;
  addCoins(state, earned);
}

function registerWrongServe(state) {
  state.servedWrong++;
  state.combo = 0;
  addCoins(state, -SateConfig.wrongServePenalty);
}

function registerExpiredOrder(state) {
  state.expired++;
  state.combo = 0;
  addCoins(state, -SateConfig.expiredPenalty);
}

function registerBurntSkewer(state) {
  state.burnt++;
  addCoins(state, -SateConfig.burntPenalty);
}

function shiftClock(state) {
  const total = Math.max(0, Math.ceil(state.timeLeft));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

function comboMultiplier(state) {
  return 1 + state.combo * SateConfig.comboStep;
}
