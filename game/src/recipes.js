// recipes.js — the menu of Sate Arang Senja.
// One job: define every dish as a different combination of items.

const SateRecipes = [
  {
    id: 'sate-ayam',
    name: 'Sate Ayam',
    nameEn: 'Chicken Satay',
    needs: ['skewerAyam', 'lontong', 'sauce'],
    price: 45,
    blurb: 'Tusuk ayam bakar + lontong + saus kacang'
  },
  {
    id: 'sate-kambing',
    name: 'Sate Kambing',
    nameEn: 'Goat Satay',
    needs: ['skewerKambing', 'onion', 'sauce'],
    price: 55,
    blurb: 'Tusuk kambing bakar + bawang iris + saus kacang'
  },
  {
    id: 'sate-campur',
    name: 'Sate Campur',
    nameEn: 'Mixed Satay',
    needs: ['skewerCampur', 'lontong', 'sauce', 'chili'],
    price: 70,
    blurb: 'Tusuk campur + lontong + saus kacang + sambal'
  }
];

function recipeById(recipeId) {
  for (const recipe of SateRecipes) {
    if (recipe.id === recipeId) return recipe;
  }
  return null;
}

// True when the plate's items are exactly one recipe's needs, any order.
function recipeMatchingPlate(plateItems) {
  for (const recipe of SateRecipes) {
    if (recipe.needs.length !== plateItems.length) continue;
    const remaining = recipe.needs.slice();
    let matches = true;
    for (const item of plateItems) {
      const at = remaining.indexOf(item);
      if (at === -1) { matches = false; break; }
      remaining.splice(at, 1);
    }
    if (matches) return recipe;
  }
  return null;
}

// How many of a recipe's needs the plate already holds (for the hint line).
function plateProgressFor(recipe, plateItems) {
  let done = 0;
  const remaining = recipe.needs.slice();
  for (const item of plateItems) {
    const at = remaining.indexOf(item);
    if (at !== -1) { remaining.splice(at, 1); done++; }
  }
  return { done: done, total: recipe.needs.length, missing: remaining };
}
