// main.js — boot and the game loop for Sate Arang Senja.
// One job: start the game, advance time, and draw every frame.

let sateState = null;
let sateCanvas = null;
let sateCtx = null;
let sateLastTime = 0;
let sateSmokeTimer = 0;

function updateGrill(state, dt) {
  const burnAt = SateConfig.burnSeconds / SateConfig.cookSeconds;
  for (const slot of state.grill) {
    if (slot.state === 'cooking') {
      slot.progress += dt / SateConfig.cookSeconds;
      if (slot.progress >= 1) slot.state = 'done';
    } else if (slot.state === 'done') {
      slot.progress += dt / SateConfig.cookSeconds;
      if (slot.progress >= burnAt) slot.state = 'burnt';
    }
  }
}

function updateSmoke(state, dt) {
  sateSmokeTimer -= dt;
  if (sateSmokeTimer <= 0) {
    sateSmokeTimer = 0.18;
    const grillOn = state.grill.some(function (slot) { return slot.state !== 'empty'; });
    if (grillOn) {
      const gx = 470 + Math.random() * 260;
      state.particles.push({ x: gx, y: 130, r: 2 + Math.random() * 3, vy: -28 - Math.random() * 14, vx: (Math.random() - 0.5) * 10, alpha: 0.2, life: 2.2 });
    }
  }
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.y += p.vy * dt;
    p.x += p.vx * dt;
    p.r += 6 * dt;
    p.life -= dt;
    p.alpha = Math.max(0, Math.min(0.2, p.life * 0.1));
    if (p.life <= 0) state.particles.splice(i, 1);
  }
}

function updateSate(state, dt) {
  if (state.phase !== 'playing') return;
  state.elapsed += dt;
  state.timeLeft -= dt;
  if (state.timeLeft <= SateConfig.rushAtSecondsLeft && !state.rush) {
    state.rush = true;
    showToast(state, 'RUSH HOUR! Pesanan makin deras!', 3);
  }
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.phase = 'over';
    state.overReason = 'shift selesai';
    return;
  }
  updateGrill(state, dt);
  updateOrders(state, dt);
  updateSmoke(state, dt);
}

function sateFrame(timestamp) {
  const dt = Math.min(0.05, Math.max(0, (timestamp - sateLastTime) / 1000 || 0));
  sateLastTime = timestamp;
  updateSate(sateState, dt);
  drawSateGame(sateCtx, sateState);
  window.requestAnimationFrame(sateFrame);
}

function bootSateGame() {
  sateCanvas = document.getElementById('game');
  sateCtx = sateCanvas.getContext('2d');
  sateState = createSateState();
  applyShotState(sateState, currentShot());
  bindSateInput(sateCanvas, sateState);
  // Test hook: the play-test driver reads and drives the live state.
  window.__sate = {
    state: sateState,
    clickAt: function (x, y) { handleCanvasClick(sateState, x, y); },
    pressKey: function (key) { handleKey(sateState, key); }
  };
  window.requestAnimationFrame(function (timestamp) {
    sateLastTime = timestamp;
    window.requestAnimationFrame(sateFrame);
  });
}

document.addEventListener('DOMContentLoaded', bootSateGame);
