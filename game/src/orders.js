// orders.js — customer orders: spawn, patience, serve, expire.
// One job: everything about the order board's tickets.

function pickRecipeForOrder(state) {
  // Favour recipes the player has not just served, so the board stays mixed.
  const index = (state.nextOrderId + state.served) % SateRecipes.length;
  return SateRecipes[index];
}

function spawnOrder(state) {
  if (state.orders.length >= SateConfig.maxOrders) return null;
  const recipe = pickRecipeForOrder(state);
  const order = {
    id: state.nextOrderId++,
    recipeId: recipe.id,
    name: recipe.name,
    needs: recipe.needs.slice(),
    patience: 1,
    patienceMax: SateConfig.orderPatienceSeconds
  };
  state.orders.push(order);
  return order;
}

function spawnInterval(state) {
  return state.rush ? SateConfig.rushSpawnEverySeconds : SateConfig.spawnEverySeconds;
}

function updateOrders(state, dt) {
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    spawnOrder(state);
    state.spawnTimer = spawnInterval(state);
  }
  const drain = dt / SateConfig.orderPatienceSeconds;
  const factor = state.rush ? SateConfig.rushPatienceMultiplier : 1;
  for (let i = state.orders.length - 1; i >= 0; i--) {
    const order = state.orders[i];
    order.patience -= drain * factor;
    if (order.patience <= 0) {
      state.orders.splice(i, 1);
      registerExpiredOrder(state);
      showToast(state, 'Order #' + order.id + ' lewat! -' + SateConfig.expiredPenalty, 2);
    }
  }
}

// The oldest order whose recipe the finished plate matches, or null.
function findOrderForPlate(state, recipe) {
  for (const order of state.orders) {
    if (order.recipeId === recipe.id) return order;
  }
  return null;
}

function serveFinishedPlate(state, recipe) {
  const order = findOrderForPlate(state, recipe);
  if (!order) return false;
  const patienceBonus = Math.round(order.patience * SateConfig.patienceBonusMax);
  const earned = Math.round((recipe.price + patienceBonus) * comboMultiplier(state));
  state.orders.splice(state.orders.indexOf(order), 1);
  registerServe(state, earned);
  showToast(state, 'Sajian ' + recipe.name + ' +Rp' + earned + '!', 2);
  return true;
}
