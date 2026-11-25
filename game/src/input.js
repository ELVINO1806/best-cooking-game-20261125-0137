// input.js — mouse clicks and keyboard shortcuts on the kitchen.
// One job: turn a click or a key into one station action.

function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

function pointInCircle(px, py, cx, cy, r) {
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= r * r;
}

function canvasPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function takeIntoHand(state, itemId) {
  if (state.hand) return false;
  state.hand = itemId;
  return true;
}

// --- grill ---------------------------------------------------------------

function grillSlotAt(px, py) {
  for (let i = 0; i < SateConfig.grillSlotCentres.length; i++) {
    const c = SateConfig.grillSlotCentres[i];
    if (pointInCircle(px, py, c.x, c.y, 52)) return i;
  }
  return -1;
}

function actOnGrillSlot(state, slotIndex) {
  const slot = state.grill[slotIndex];
  if (!slot) return;
  if (slot.state === 'burnt') {
    registerBurntSkewer(state);
    state.grill[slotIndex] = { meat: null, progress: 0, state: 'empty' };
    showToast(state, 'Sate hangus dibuang! -' + SateConfig.burntPenalty, 2);
    return;
  }
  if (slot.state === 'done') {
    if (takeIntoHand(state, meatSkewerItem(slot.meat))) {
      state.grill[slotIndex] = { meat: null, progress: 0, state: 'empty' };
    }
    return;
  }
  if (slot.state === 'empty') {
    state.grill[slotIndex] = { meat: state.selectedMeat, progress: 0, state: 'cooking' };
    return;
  }
  showToast(state, 'Masih dibakar, tunggu sebentar…', 1);
}

function grillActionKey(state) {
  for (let i = 0; i < state.grill.length; i++) {
    if (state.grill[i].state === 'done' || state.grill[i].state === 'burnt') {
      actOnGrillSlot(state, i);
      return;
    }
  }
  for (let i = 0; i < state.grill.length; i++) {
    if (state.grill[i].state === 'empty') {
      actOnGrillSlot(state, i);
      return;
    }
  }
  showToast(state, 'Panggangan penuh!', 1);
}

function meatButtonAt(px, py) {
  const zone = SateConfig.zones.meatButtons;
  if (!pointInRect(px, py, zone)) return null;
  const each = zone.w / SateConfig.meats.length;
  const index = Math.floor((px - zone.x) / each);
  return SateConfig.meats[Math.max(0, Math.min(SateConfig.meats.length - 1, index))].id;
}

// --- prep, sauce, plate, pass --------------------------------------------

function prepPileAt(px, py) {
  for (const itemId of Object.keys(SateConfig.prepPiles)) {
    const pile = SateConfig.prepPiles[itemId];
    if (pointInCircle(px, py, pile.x, pile.y, pile.r)) return itemId;
  }
  return null;
}

function actOnPlate(state) {
  const ready = recipeMatchingPlate(state.plate);
  if (ready && !state.hand) {
    state.pass.push({ recipeId: ready.id, name: ready.name, items: state.plate.slice() });
    state.plate = [];
    showToast(state, ready.name + ' siap diantar!', 2);
    return;
  }
  if (state.hand) {
    if (state.plate.indexOf(state.hand) !== -1) {
      showToast(state, itemLabel(state.hand) + ' sudah di piring.', 1);
      return;
    }
    state.plate.push(state.hand);
    state.hand = null;
    return;
  }
  if (state.plate.length > 0) {
    state.hand = state.plate.pop();
  }
}

function actOnPass(state) {
  if (state.pass.length === 0) return;
  const dish = state.pass[0];
  const recipe = recipeById(dish.recipeId);
  if (!recipe) return;
  const served = serveFinishedPlate(state, recipe);
  if (served) {
    state.pass.shift();
  } else {
    state.pass.shift();
    registerWrongServe(state);
    showToast(state, 'Tidak ada yang pesan ' + recipe.name + '! -' + SateConfig.wrongServePenalty, 2);
  }
}

// --- the click router ------------------------------------------------------

function handleCanvasClick(state, px, py) {
  if (state.phase === 'over') {
    resetSateState(state);
    applyShotState(state, currentShot());
    return;
  }
  const slot = grillSlotAt(px, py);
  if (slot !== -1) { actOnGrillSlot(state, slot); return; }
  const meat = meatButtonAt(px, py);
  if (meat) { state.selectedMeat = meat; return; }
  const pile = prepPileAt(px, py);
  if (pile) { takeIntoHand(state, pile); return; }
  if (pointInRect(px, py, SateConfig.zones.sauce)) { takeIntoHand(state, 'sauce'); return; }
  if (pointInRect(px, py, SateConfig.zones.plate)) { actOnPlate(state); return; }
  if (pointInRect(px, py, SateConfig.zones.pass)) { actOnPass(state); return; }
}

function handleKey(state, key) {
  const k = key.toLowerCase();
  if (state.phase === 'over') {
    if (k === 'r' || k === 'enter' || k === ' ') {
      resetSateState(state);
      applyShotState(state, currentShot());
    }
    return;
  }
  if (k === '1') grillActionKey(state);
  else if (k === '2') takeIntoHand(state, 'lontong');
  else if (k === 'o') takeIntoHand(state, 'onion');
  else if (k === 'c') takeIntoHand(state, 'chili');
  else if (k === '3') takeIntoHand(state, 'sauce');
  else if (k === '4') actOnPlate(state);
  else if (k === '5') actOnPass(state);
  else if (k === 't') cycleMeat(state);
  else if (k === 'r') { resetSateState(state); applyShotState(state, currentShot()); }
}

function cycleMeat(state) {
  const ids = SateConfig.meats.map(function (m) { return m.id; });
  const at = ids.indexOf(state.selectedMeat);
  state.selectedMeat = ids[(at + 1) % ids.length];
}

function bindSateInput(canvas, state) {
  canvas.addEventListener('click', function (event) {
    const p = canvasPoint(event, canvas);
    handleCanvasClick(state, p.x, p.y);
  });
  canvas.addEventListener('mousemove', function (event) {
    const p = canvasPoint(event, canvas);
    state.hover = zoneNameAt(p.x, p.y);
  });
  window.addEventListener('keydown', function (event) {
    if (event.key === ' ' ) event.preventDefault();
    handleKey(state, event.key);
  });
}

function zoneNameAt(px, py) {
  if (grillSlotAt(px, py) !== -1) return 'grill';
  if (meatButtonAt(px, py)) return 'meat';
  if (prepPileAt(px, py)) return 'prep';
  if (pointInRect(px, py, SateConfig.zones.sauce)) return 'sauce';
  if (pointInRect(px, py, SateConfig.zones.plate)) return 'plate';
  if (pointInRect(px, py, SateConfig.zones.pass)) return 'pass';
  return null;
}
