// staging.js — screenshot staging: open the game already mid-shift.
// One job: pre-populate a live state for each ?shot= scene. Every scene
// keeps all six judging elements visible: kitchen, order board, counter
// ingredients, a dish mid-assembly, a running timer, a plated dish.

function currentShot() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot') || 'start';
  if (shot === 'play' || shot === 'rush' || shot === 'serve') return shot;
  return 'start';
}

function stageOrder(state, recipeId, patience) {
  const recipe = recipeById(recipeId);
  const order = {
    id: state.nextOrderId++,
    recipeId: recipe.id,
    name: recipe.name,
    needs: recipe.needs.slice(),
    patience: patience,
    patienceMax: SateConfig.orderPatienceSeconds
  };
  state.orders.push(order);
  return order;
}

function stageGrillSlot(state, index, meat, progress, slotState) {
  state.grill[index] = { meat: meat, progress: progress, state: slotState };
}

function applyShotState(state, shot) {
  state.orders = [];
  state.grill = [];
  for (let i = 0; i < SateConfig.grillSlots; i++) {
    state.grill.push({ meat: null, progress: 0, state: 'empty' });
  }
  state.plate = [];
  state.pass = [];
  state.hand = null;
  state.spawnTimer = 9;

  if (shot === 'play') {
    state.timeLeft = 130;
    state.coins = 185;
    state.combo = 3;
    state.served = 7;
    stageOrder(state, 'sate-campur', 0.72);
    stageOrder(state, 'sate-ayam', 0.55);
    stageOrder(state, 'sate-kambing', 0.38);
    stageGrillSlot(state, 0, 'campur', 0.45, 'cooking');
    stageGrillSlot(state, 1, 'ayam', 0.85, 'cooking');
    state.plate = ['skewerCampur', 'sauce'];
    state.pass = [{ recipeId: 'sate-kambing', name: 'Sate Kambing', items: ['skewerKambing', 'onion', 'sauce'] }];
    state.hand = 'lontong';
  } else if (shot === 'rush') {
    state.timeLeft = 42;
    state.coins = 340;
    state.combo = 5;
    state.served = 12;
    state.rush = true;
    stageOrder(state, 'sate-ayam', 0.28);
    stageOrder(state, 'sate-kambing', 0.36);
    stageOrder(state, 'sate-campur', 0.52);
    stageGrillSlot(state, 0, 'ayam', 1, 'done');
    stageGrillSlot(state, 1, 'kambing', 0.8, 'cooking');
    stageGrillSlot(state, 2, 'campur', 1, 'burnt');
    state.plate = ['skewerAyam', 'sauce'];
    state.pass = [{ recipeId: 'sate-ayam', name: 'Sate Ayam', items: ['skewerAyam', 'lontong', 'sauce'] }];
    state.hand = 'lontong';
  } else if (shot === 'serve') {
    state.timeLeft = 90;
    state.coins = 210;
    state.combo = 2;
    state.served = 9;
    stageOrder(state, 'sate-ayam', 0.66);
    stageOrder(state, 'sate-kambing', 0.5);
    stageOrder(state, 'sate-campur', 0.8);
    stageGrillSlot(state, 0, 'kambing', 0.6, 'cooking');
    state.plate = ['skewerKambing', 'onion'];
    state.pass = [{ recipeId: 'sate-ayam', name: 'Sate Ayam', items: ['skewerAyam', 'lontong', 'sauce'] }];
    state.hand = null;
  } else {
    // start: the full kitchen overview.
    state.timeLeft = 167;
    state.coins = 120;
    state.combo = 2;
    state.served = 4;
    stageOrder(state, 'sate-ayam', 0.8);
    stageOrder(state, 'sate-kambing', 0.6);
    stageOrder(state, 'sate-campur', 0.45);
    stageGrillSlot(state, 0, 'ayam', 0.55, 'cooking');
    stageGrillSlot(state, 1, 'kambing', 1, 'done');
    state.plate = ['skewerAyam', 'lontong'];
    state.pass = [{ recipeId: 'sate-kambing', name: 'Sate Kambing', items: ['skewerKambing', 'onion', 'sauce'] }];
    state.hand = 'sauce';
  }
}
