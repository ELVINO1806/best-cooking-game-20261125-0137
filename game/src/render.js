// render.js — every pixel of the dusk satay kitchen.
// One job: draw the whole game state onto the canvas, nothing else.

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawText(ctx, text, x, y, size, color, weight, align) {
  ctx.fillStyle = color;
  ctx.font = (weight || 'bold') + ' ' + size + 'px Verdana, sans-serif';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function meatColor(meat) {
  if (meat === 'kambing') return '#b06a3b';
  if (meat === 'campur') return '#d97b4f';
  return '#e8a34c';
}

function skewerColor(meat, progress, slotState) {
  if (slotState === 'burnt') return '#1c1410';
  if (slotState === 'done') return '#8a4f22';
  const t = Math.max(0, Math.min(1, progress));
  const from = [232, 163, 76];
  const to = [138, 79, 34];
  const r = Math.round(from[0] + (to[0] - from[0]) * t);
  const g = Math.round(from[1] + (to[1] - from[1]) * t);
  const b = Math.round(from[2] + (to[2] - from[2]) * t);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function drawSkewerIcon(ctx, x, y, len, meat, progress, slotState) {
  const color = skewerColor(meat, progress, slotState);
  ctx.strokeStyle = '#c9a06a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - len / 2, y);
  ctx.lineTo(x + len / 2, y);
  ctx.stroke();
  ctx.fillStyle = color;
  for (let i = -1; i <= 1; i++) {
    roundRect(ctx, x + i * 16 - 8, y - 8, 16, 16, 4);
    ctx.fill();
  }
  if (slotState === 'burnt') {
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 14, y - 12);
    ctx.lineTo(x - 6, y - 4);
    ctx.moveTo(x + 4, y - 12);
    ctx.lineTo(x + 12, y - 4);
    ctx.stroke();
  }
}

function drawItemIcon(ctx, itemId, x, y, scale) {
  const s = scale || 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (itemId === 'skewerAyam' || itemId === 'skewerKambing' || itemId === 'skewerCampur') {
    const meat = itemId === 'skewerAyam' ? 'ayam' : itemId === 'skewerKambing' ? 'kambing' : 'campur';
    drawSkewerIcon(ctx, 0, 0, 52, meat, 1, 'done');
  } else if (itemId === 'lontong') {
    ctx.fillStyle = '#f2ead8';
    roundRect(ctx, -16, -11, 32, 22, 5);
    ctx.fill();
    ctx.fillStyle = '#7fae5a';
    ctx.fillRect(-16, -3, 32, 6);
    ctx.fillStyle = '#d9cba8';
    ctx.fillRect(-10, -11, 3, 22);
    ctx.fillRect(7, -11, 3, 22);
  } else if (itemId === 'onion') {
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = i % 2 ? '#c9a0c9' : '#efe6f2';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(-10 + i * 10, 0, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (itemId === 'sauce') {
    ctx.fillStyle = '#8a5a2e';
    ctx.beginPath();
    ctx.arc(0, 2, 15, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#c98a3d';
    ctx.beginPath();
    ctx.ellipse(0, 2, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a8641f';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (itemId === 'chili') {
    ctx.strokeStyle = '#d92b1f';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-14, 6);
    ctx.quadraticCurveTo(0, 14, 14, -6);
    ctx.stroke();
    ctx.strokeStyle = '#4e8a3a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(14, -6);
    ctx.lineTo(19, -11);
    ctx.stroke();
  }
  ctx.restore();
}

// --- background ------------------------------------------------------------

function drawKitchenBack(ctx, state) {
  const g = ctx.createLinearGradient(0, 0, 0, 480);
  g.addColorStop(0, SateConfig.colors.wallTop);
  g.addColorStop(1, SateConfig.colors.wallBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1280, 480);
  // Hanging lamp glow over the grill.
  const glow = ctx.createRadialGradient(595, 60, 4, 595, 60, 120);
  glow.addColorStop(0, 'rgba(255, 201, 60, 0.35)');
  glow.addColorStop(1, 'rgba(255, 201, 60, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(475, 0, 240, 180);
  ctx.strokeStyle = '#3a2418';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(595, 0);
  ctx.lineTo(595, 46);
  ctx.stroke();
  ctx.fillStyle = '#ffc93c';
  ctx.beginPath();
  ctx.arc(595, 52, 7, 0, Math.PI * 2);
  ctx.fill();
  // String lights along the top.
  ctx.strokeStyle = '#4a2c17';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 20);
  ctx.quadraticCurveTo(640, 44, 1280, 20);
  ctx.stroke();
  for (let i = 0; i < 16; i++) {
    const x = 40 + i * 78;
    const y = 22 + Math.sin(i * 0.9) * 8 + 8;
    ctx.fillStyle = i % 3 === 0 ? '#ffc93c' : i % 3 === 1 ? '#ff7a1a' : '#7ddc7d';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHud(ctx, state) {
  ctx.fillStyle = SateConfig.colors.hudBg;
  ctx.fillRect(0, 0, 1280, 54);
  ctx.fillStyle = '#3a2418';
  ctx.fillRect(0, 54, 1280, 3);
  drawText(ctx, 'SATE ARANG SENJA', 16, 20, 22, '#ffc93c', 'bold', 'left');
  drawText(ctx, 'warung sate · arang · senja', 16, 42, 11, '#c9a06a', 'normal', 'left');
  // Coins.
  ctx.fillStyle = '#ffc93c';
  ctx.beginPath();
  ctx.arc(330, 27, 13, 0, Math.PI * 2);
  ctx.fill();
  drawText(ctx, 'Rp', 330, 27, 11, '#7a4a00', 'bold', 'center');
  drawText(ctx, String(state.coins), 350, 27, 22, '#f5efdd', 'bold', 'left');
  // Combo.
  if (state.combo >= 2) {
    drawText(ctx, 'COMBO x' + state.combo, 480, 27, 16, '#ff7a1a', 'bold', 'left');
  }
  drawText(ctx, 'disajikan ' + state.served, 620, 27, 13, '#c9a06a', 'normal', 'left');
  // Dusk window with a low sun, drawn after the HUD so it stays visible.
  ctx.fillStyle = '#1d1030';
  roundRect(ctx, 1010, 6, 250, 34, 8);
  ctx.fill();
  const sky = ctx.createLinearGradient(0, 6, 0, 40);
  sky.addColorStop(0, '#7a3a6e');
  sky.addColorStop(0.6, '#e8763a');
  sky.addColorStop(1, '#ffc93c');
  ctx.fillStyle = sky;
  ctx.fillRect(1014, 10, 242, 26);
  ctx.fillStyle = '#fff3c9';
  ctx.beginPath();
  ctx.arc(1238, 30, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#241610';
  ctx.fillRect(1136, 10, 4, 26);
  ctx.fillRect(1014, 22, 242, 4);
  drawText(ctx, 'SENJA', 1022, 48, 10, '#c9a06a', 'bold', 'left');
  if (state.rush) {
    ctx.fillStyle = state.elapsed % 1 < 0.5 ? '#ff5a4e' : '#b03024';
    roundRect(ctx, 1010, 10, 250, 34, 6);
    ctx.fill();
    drawText(ctx, 'RUSH HOUR!', 1135, 28, 18, '#ffffff', 'bold', 'center');
  }
  // Shift timer, big and readable.
  const low = state.timeLeft <= 30;
  drawText(ctx, 'SHIFT', 990, 18, 11, '#c9a06a', 'bold', 'right');
  drawText(ctx, shiftClock(state), 990, 40, 26, low ? '#ff5a4e' : '#f5efdd', 'bold', 'right');
}

// --- order board -----------------------------------------------------------

function drawOrderBoard(ctx, state) {
  const z = SateConfig.zones.orderBoard;
  ctx.fillStyle = SateConfig.colors.board;
  roundRect(ctx, z.x, z.y, z.w, z.h, 8);
  ctx.fill();
  ctx.strokeStyle = '#6a5230';
  ctx.lineWidth = 3;
  roundRect(ctx, z.x, z.y, z.w, z.h, 8);
  ctx.stroke();
  drawText(ctx, 'ORDER BOARD · PESANAN', z.x + 14, z.y + 16, 14, SateConfig.colors.chalk, 'bold', 'left');
  if (state.orders.length === 0) {
    drawText(ctx, 'Tidak ada pesanan — tenang dulu.', z.x + 14, z.y + 70, 13, '#9a8a76', 'normal', 'left');
    return;
  }
  state.orders.forEach(function (order, i) {
    const y = z.y + 36 + i * 38;
    const recipe = recipeById(order.recipeId);
    drawText(ctx, '#' + order.id + ' ' + order.name, z.x + 14, y, 14, '#f5efdd', 'bold', 'left');
    drawText(ctx, 'Rp' + recipe.price, z.x + z.w - 14, y, 13, '#ffc93c', 'bold', 'right');
    order.needs.forEach(function (itemId, j) {
      drawItemIcon(ctx, itemId, z.x + 30 + j * 34, y + 18, 0.55);
    });
    const barX = z.x + 150;
    const barW = z.w - 164;
    ctx.fillStyle = '#1d120b';
    roundRect(ctx, barX, y + 10, barW, 10, 5);
    ctx.fill();
    const pct = Math.max(0, order.patience);
    ctx.fillStyle = pct > 0.5 ? '#7ddc7d' : pct > 0.25 ? '#ffb347' : '#ff5a4e';
    if (barW * pct > 4) {
      roundRect(ctx, barX, y + 10, barW * pct, 10, 5);
      ctx.fill();
    }
  });
}

// --- grill -----------------------------------------------------------------

function drawGrill(ctx, state) {
  const z = SateConfig.zones.grill;
  ctx.fillStyle = '#4a2c17';
  roundRect(ctx, z.x, z.y, z.w, z.h, 8);
  ctx.fill();
  drawText(ctx, 'PANGGANGAN ARANG · GRILL  [1]', z.x + 12, z.y + 16, 13, '#f5efdd', 'bold', 'left');
  // Coals: glowing row under the skewers.
  const flicker = Math.sin(state.elapsed * 6) * 0.5 + 0.5;
  for (let i = 0; i < 9; i++) {
    const cx = z.x + 30 + i * 32;
    const cy = z.y + 132;
    const hot = 0.6 + 0.4 * Math.sin(state.elapsed * 5 + i * 1.7);
    ctx.fillStyle = 'rgba(255, ' + Math.round(90 + 90 * hot) + ', 20, ' + (0.55 + 0.4 * hot) + ')';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 13, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a1c08';
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Grill bars.
  ctx.strokeStyle = '#2a1a10';
  ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    const gy = z.y + 96 + i * 8;
    ctx.beginPath();
    ctx.moveTo(z.x + 14, gy);
    ctx.lineTo(z.x + z.w - 14, gy);
    ctx.stroke();
  }
  // Skewer slots.
  state.grill.forEach(function (slot, i) {
    const c = SateConfig.grillSlotCentres[i];
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(c.x, c.y + 26, 34, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    if (slot.state === 'empty') {
      ctx.strokeStyle = '#8a6a4a';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, 34, 10, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      drawText(ctx, 'klik: bakar', c.x, c.y + 2, 10, '#c9a06a', 'normal', 'center');
    } else {
      drawSkewerIcon(ctx, c.x, c.y, 62, slot.meat, slot.progress, slot.state);
      const pct = slot.state === 'burnt' ? 1 : Math.min(1, slot.progress);
      ctx.fillStyle = '#1d120b';
      roundRect(ctx, c.x - 26, c.y - 34, 52, 7, 3);
      ctx.fill();
      ctx.fillStyle = slot.state === 'burnt' ? '#ff5a4e' : slot.state === 'done' ? '#7ddc7d' : '#ffb347';
      if (52 * pct > 3) {
        roundRect(ctx, c.x - 26, c.y - 34, 52 * pct, 7, 3);
        ctx.fill();
      }
      if (slot.state === 'done') {
        drawText(ctx, 'MATANG!', c.x, c.y - 42, 11, '#7ddc7d', 'bold', 'center');
      } else if (slot.state === 'burnt') {
        drawText(ctx, 'HANGUS!', c.x, c.y - 42, 11, '#ff5a4e', 'bold', 'center');
      }
    }
  });
  // Meat type selector.
  const mb = SateConfig.zones.meatButtons;
  SateConfig.meats.forEach(function (meat, i) {
    const bw = mb.w / SateConfig.meats.length;
    const bx = mb.x + i * bw;
    const selected = state.selectedMeat === meat.id;
    ctx.fillStyle = selected ? '#ffc93c' : '#5a3a22';
    roundRect(ctx, bx + 2, mb.y, bw - 4, mb.h, 6);
    ctx.fill();
    drawText(ctx, meat.label, bx + bw / 2, mb.y + 15, 12, selected ? '#3a2418' : '#f5efdd', 'bold', 'center');
  });
  drawText(ctx, 'pilih daging, lalu klik slot kosong  ·  [T] ganti', mb.x, mb.y + mb.h + 12, 11, '#c9a06a', 'normal', 'left');
  void flicker;
}

// --- prep counter + sauce pot ----------------------------------------------

function drawPrep(ctx, state) {
  const z = SateConfig.zones.prep;
  ctx.fillStyle = SateConfig.colors.wood;
  roundRect(ctx, z.x, z.y, z.w, z.h, 8);
  ctx.fill();
  drawText(ctx, 'TALENAN · PREP  [2]', z.x + 12, z.y + 16, 13, '#f5efdd', 'bold', 'left');
  ctx.fillStyle = '#e8cfa0';
  roundRect(ctx, z.x + 14, z.y + 78, z.w - 28, 62, 6);
  ctx.fill();
  ctx.strokeStyle = '#b89a6a';
  ctx.lineWidth = 2;
  roundRect(ctx, z.x + 14, z.y + 78, z.w - 28, 62, 6);
  ctx.stroke();
  const labels = { lontong: 'LONTONG', onion: 'BAWANG', chili: 'SAMBAL' };
  for (const itemId of Object.keys(SateConfig.prepPiles)) {
    const pile = SateConfig.prepPiles[itemId];
    drawItemIcon(ctx, itemId, pile.x, pile.y, 1.15);
    drawText(ctx, labels[itemId], pile.x, pile.y + 34, 10, '#f5efdd', 'bold', 'center');
  }
  drawText(ctx, 'klik bahan untuk mengambil', z.x + 12, z.y + 158, 11, '#e8cfa0', 'normal', 'left');
}

function drawSauce(ctx, state) {
  const z = SateConfig.zones.sauce;
  ctx.fillStyle = '#3a2a1a';
  roundRect(ctx, z.x, z.y, z.w, z.h, 8);
  ctx.fill();
  drawText(ctx, 'SAUS KACANG · SAUCE  [3]', z.x + 12, z.y + 16, 13, '#f5efdd', 'bold', 'left');
  // Pot body.
  ctx.fillStyle = '#1c1410';
  roundRect(ctx, z.x + 42, z.y + 60, 150, 84, 10);
  ctx.fill();
  ctx.fillStyle = '#c98a3d';
  ctx.beginPath();
  ctx.ellipse(z.x + 117, z.y + 62, 72, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a8641f';
  ctx.beginPath();
  ctx.ellipse(z.x + 117, z.y + 62, 52, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  // Steam.
  ctx.strokeStyle = 'rgba(245,239,221,0.5)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    const sx = z.x + 80 + i * 36;
    const sway = Math.sin(state.elapsed * 2 + i * 2) * 4;
    ctx.beginPath();
    ctx.moveTo(sx, z.y + 52);
    ctx.quadraticCurveTo(sx + sway, z.y + 38, sx - sway, z.y + 26);
    ctx.stroke();
  }
  // Ladle resting on the pot.
  ctx.strokeStyle = '#c9a06a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(z.x + 150, z.y + 66);
  ctx.lineTo(z.x + 196, z.y + 30);
  ctx.stroke();
  ctx.fillStyle = '#c9a06a';
  ctx.beginPath();
  ctx.arc(z.x + 150, z.y + 66, 9, 0, Math.PI * 2);
  ctx.fill();
  drawText(ctx, 'klik: ambil saus', z.x + 12, z.y + 158, 11, '#e8cfa0', 'normal', 'left');
}

// --- hand, plate, pass ------------------------------------------------------

function drawHandPanel(ctx, state) {
  const z = SateConfig.zones.hand;
  ctx.fillStyle = '#2e2118';
  roundRect(ctx, z.x, z.y, z.w, z.h, 8);
  ctx.fill();
  drawText(ctx, 'TANGAN · HAND', z.x + 14, z.y + 16, 13, '#f5efdd', 'bold', 'left');
  if (state.hand) {
    drawItemIcon(ctx, state.hand, z.x + 60, z.y + 70, 1.6);
    drawText(ctx, itemLabel(state.hand), z.x + 100, z.y + 70, 16, '#ffc93c', 'bold', 'left');
    drawText(ctx, 'klik piring untuk menaruh', z.x + 100, z.y + 94, 12, '#c9a06a', 'normal', 'left');
  } else {
    drawText(ctx, 'tangan kosong', z.x + 60, z.y + 70, 15, '#9a8a76', 'normal', 'left');
    drawText(ctx, 'klik bahan / sate matang', z.x + 60, z.y + 94, 12, '#9a8a76', 'normal', 'left');
  }
  drawText(ctx, '1 panggangan · 2 lontong · O bawang · C sambal', z.x + 14, z.y + 128, 11, '#c9a06a', 'normal', 'left');
  drawText(ctx, '3 saus · 4 piring · 5 antar · T ganti daging · R ulang', z.x + 14, z.y + 146, 11, '#c9a06a', 'normal', 'left');
}

function drawPlateCounter(ctx, state) {
  const z = SateConfig.zones.plate;
  ctx.fillStyle = SateConfig.colors.woodLight;
  roundRect(ctx, z.x, z.y, z.w, z.h, 8);
  ctx.fill();
  drawText(ctx, 'PIRING · PLATING  [4]', z.x + 14, z.y + 16, 13, '#3a2418', 'bold', 'left');
  const cx = z.x + 200;
  const cy = z.y + 88;
  const ready = recipeMatchingPlate(state.plate);
  // Plate.
  ctx.fillStyle = '#d9cba8';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 92, 52, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = SateConfig.colors.plateWhite;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 82, 45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b89a6a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 66, 34, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Placed items in a row across the plate.
  const n = Math.max(state.plate.length, 1);
  state.plate.forEach(function (itemId, i) {
    const ix = cx - 52 + (104 * (i + 0.5)) / Math.max(n, 1) - 0;
    drawItemIcon(ctx, itemId, ix, cy - 4, 0.95);
  });
  if (state.plate.length === 0) {
    drawText(ctx, 'piring kosong', cx, cy, 13, '#9a8a76', 'normal', 'center');
  }
  if (ready) {
    ctx.fillStyle = '#7ddc7d';
    roundRect(ctx, z.x + z.w - 128, z.y + 8, 116, 26, 6);
    ctx.fill();
    drawText(ctx, 'SIAP! klik piring', z.x + z.w - 70, z.y + 22, 12, '#1d3a1d', 'bold', 'center');
  } else if (state.plate.length > 0) {
    drawText(ctx, 'setengah jadi — ' + state.plate.length + ' bahan di piring', cx, z.y + 146, 12, '#3a2418', 'bold', 'center');
  } else {
    drawText(ctx, 'rakit pesanan di sini', cx, z.y + 146, 12, '#5a3a22', 'normal', 'center');
  }
}

function drawPass(ctx, state) {
  const z = SateConfig.zones.pass;
  ctx.fillStyle = SateConfig.colors.passShelf;
  roundRect(ctx, z.x, z.y, z.w, z.h, 8);
  ctx.fill();
  drawText(ctx, 'SIAP SAJI · SERVE  [5]', z.x + 14, z.y + 16, 13, '#f5efdd', 'bold', 'left');
  if (state.pass.length === 0) {
    drawText(ctx, 'belum ada piring siap saji', z.x + 100, z.y + 80, 13, '#e8cfa0', 'normal', 'center');
    drawText(ctx, 'piring lengkap pindah ke sini', z.x + 100, z.y + 104, 12, '#c9a06a', 'normal', 'center');
  }
  state.pass.forEach(function (dish, i) {
    const cx = z.x + 100 + i * 190;
    const cy = z.y + 82;
    ctx.fillStyle = '#d9cba8';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 86, 48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = SateConfig.colors.plateWhite;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 76, 41, 0, 0, Math.PI * 2);
    ctx.fill();
    dish.items.forEach(function (itemId, j) {
      const ix = cx - 48 + (96 * (j + 0.5)) / dish.items.length;
      drawItemIcon(ctx, itemId, ix, cy - 2, 0.85);
    });
    drawText(ctx, dish.name, cx, z.y + 140, 14, '#ffc93c', 'bold', 'center');
    drawText(ctx, 'klik untuk antar', cx, z.y + 156, 11, '#e8cfa0', 'normal', 'center');
  });
}

// --- particles, toast, overlays ----------------------------------------------

function drawParticles(ctx, state) {
  for (const p of state.particles) {
    ctx.fillStyle = 'rgba(220, 210, 195, ' + p.alpha.toFixed(2) + ')';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawToast(ctx, state) {
  if (!state.toast || state.elapsed > state.toastUntil) return;
  const w = 420;
  ctx.fillStyle = 'rgba(29, 18, 11, 0.92)';
  roundRect(ctx, 640 - w / 2, 220, w, 34, 8);
  ctx.fill();
  drawText(ctx, state.toast, 640, 238, 15, '#ffc93c', 'bold', 'center');
}

function drawRushBanner(ctx, state) {
  if (!state.rush || state.phase !== 'playing') return;
  ctx.fillStyle = state.elapsed % 1 < 0.5 ? 'rgba(255,90,78,0.9)' : 'rgba(176,48,36,0.9)';
  roundRect(ctx, 480, 216, 300, 26, 6);
  ctx.fill();
  drawText(ctx, 'RUSH HOUR — pesanan deras!', 630, 230, 14, '#ffffff', 'bold', 'center');
}

function drawGameOver(ctx, state) {
  ctx.fillStyle = 'rgba(20, 10, 5, 0.82)';
  ctx.fillRect(0, 0, 1280, 480);
  drawText(ctx, 'SHIFT SELESAI', 640, 130, 40, '#ffc93c', 'bold', 'center');
  drawText(ctx, 'Warung tutup — arang padam, senja habis.', 640, 175, 16, '#f5efdd', 'normal', 'center');
  drawText(ctx, 'Rp' + state.coins, 640, 235, 44, '#f5efdd', 'bold', 'center');
  drawText(ctx, 'disajikan ' + state.served + '  ·  combo terbaik x' + state.bestCombo + '  ·  hangus ' + state.burnt + '  ·  lewat ' + state.expired, 640, 285, 15, '#c9a06a', 'normal', 'center');
  ctx.fillStyle = '#ffc93c';
  roundRect(ctx, 540, 320, 200, 44, 8);
  ctx.fill();
  drawText(ctx, 'MAIN LAGI  [R]', 640, 343, 17, '#3a2418', 'bold', 'center');
}

function drawHintBar(ctx) {
  ctx.fillStyle = '#1d120b';
  ctx.fillRect(0, 452, 1280, 28);
  drawText(ctx, 'SATE ARANG SENJA — bakar sate di panggangan, rakit di piring, antar selagi hangat. Klik stasiun atau pakai tombol 1–5.', 640, 466, 12, '#c9a06a', 'normal', 'center');
}

// --- main entry --------------------------------------------------------------

function drawSateGame(ctx, state) {
  drawKitchenBack(ctx, state);
  drawHud(ctx, state);
  drawOrderBoard(ctx, state);
  drawGrill(ctx, state);
  drawPrep(ctx, state);
  drawSauce(ctx, state);
  drawHandPanel(ctx, state);
  drawPlateCounter(ctx, state);
  drawPass(ctx, state);
  drawParticles(ctx, state);
  drawRushBanner(ctx, state);
  drawToast(ctx, state);
  drawHintBar(ctx);
  if (state.phase === 'over') drawGameOver(ctx, state);
  // Hover highlight ring on the hovered station.
  if (state.hover && state.phase === 'playing') {
    const zoneMap = {
      grill: SateConfig.zones.grill,
      prep: SateConfig.zones.prep,
      sauce: SateConfig.zones.sauce,
      plate: SateConfig.zones.plate,
      pass: SateConfig.zones.pass
    };
    const zone = zoneMap[state.hover];
    if (zone) {
      ctx.strokeStyle = 'rgba(255, 201, 60, 0.7)';
      ctx.lineWidth = 2;
      roundRect(ctx, zone.x - 2, zone.y - 2, zone.w + 4, zone.h + 4, 10);
      ctx.stroke();
    }
  }
}
