// cdp-driver.mjs — drives the cached headless Chrome over CDP with only
// the Node standard library: loads a URL, collects console errors, can
// click at canvas coordinates, evaluates JS, and saves a PNG screenshot.
// Usage: node cdp-driver.mjs <shot|playtest> <url> <out.png>
import { writeFileSync } from 'node:fs';

const mode = process.argv[2];
const url = process.argv[3];
const outPng = process.argv[4];
const PORT = 9223;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getPageTarget() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const targets = await res.json();
      const page = targets.find((t) => t.type === 'page');
      if (page) return page;
    } catch { /* chrome not up yet */ }
    await sleep(250);
  }
  throw new Error('no page target on CDP port ' + PORT);
}

let msgId = 0;
const pending = new Map();
const consoleErrors = [];

function send(ws, method, params) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params: params || {} }));
  });
}

async function evaluate(ws, expression) {
  const res = await send(ws, 'Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (res.exceptionDetails) throw new Error('evaluate failed: ' + JSON.stringify(res.exceptionDetails));
  return res.result ? res.result.value : undefined;
}

async function clickAt(ws, x, y) {
  await send(ws, 'Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await send(ws, 'Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  await sleep(150);
}

async function main() {
  const target = await getPageTarget();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push('exception: ' + JSON.stringify(msg.params.exceptionDetails).slice(0, 500));
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      consoleErrors.push('console.error: ' + JSON.stringify(msg.params.args).slice(0, 500));
    }
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      consoleErrors.push('log.error: ' + msg.params.entry.text + ' ' + (msg.params.entry.url || ''));
    }
  };

  await send(ws, 'Page.enable');
  await send(ws, 'Runtime.enable');
  await send(ws, 'Log.enable');
  await send(ws, 'Page.navigate', { url });
  await sleep(1800);

  const ready = await evaluate(ws, '!!window.__sate');
  console.log('sate ready:', ready);

  if (mode === 'playtest') {
    const before = await evaluate(ws, 'JSON.stringify({coins: window.__sate.state.coins, served: window.__sate.state.served, plate: window.__sate.state.plate, pass: window.__sate.state.pass.length, hand: window.__sate.state.hand})');
    console.log('before:', before);
    // Complete the staged sate-ayam plate: sauce -> plate -> plate to pass -> serve.
    await clickAt(ws, 1147, 150); // sauce pot: take sauce
    await clickAt(ws, 630, 366);  // plate: add sauce (plate now complete)
    const mid = await evaluate(ws, 'JSON.stringify({plate: window.__sate.state.plate, hand: window.__sate.state.hand})');
    console.log('mid:', mid);
    await clickAt(ws, 630, 366);  // plate: move finished dish to the pass
    await clickAt(ws, 1062, 366); // pass: serve the dish
    await sleep(300);
    const after = await evaluate(ws, 'JSON.stringify({coins: window.__sate.state.coins, served: window.__sate.state.served, pass: window.__sate.state.pass.length, orders: window.__sate.state.orders.length, phase: window.__sate.state.phase})');
    console.log('after:', after);
    // Grill key test: press 1 to take the done kambing skewer (slot 1).
    await evaluate(ws, 'window.__sate.pressKey("1")');
    const grill = await evaluate(ws, 'JSON.stringify({hand: window.__sate.state.hand, grill: window.__sate.state.grill.map(s => s.state)})');
    console.log('grill key:', grill);
  }

  if (mode === 'gameover') {
    await evaluate(ws, 'window.__sate.state.timeLeft = 1.2');
    await sleep(2000);
    const over = await evaluate(ws, 'JSON.stringify({phase: window.__sate.state.phase, timeLeft: window.__sate.state.timeLeft})');
    console.log('gameover:', over);
    await evaluate(ws, 'window.__sate.pressKey("r")');
    await sleep(300);
    const restarted = await evaluate(ws, 'JSON.stringify({phase: window.__sate.state.phase, timeLeft: Math.round(window.__sate.state.timeLeft), orders: window.__sate.state.orders.length})');
    console.log('restarted:', restarted);
  }

  const shot = await send(ws, 'Page.captureScreenshot', { format: 'png' });
  writeFileSync(outPng, Buffer.from(shot.data, 'base64'));
  console.log('console errors:', consoleErrors.length);
  for (const e of consoleErrors) console.log('  ' + e);
  ws.close();
  process.exit(consoleErrors.length === 0 ? 0 : 2);
}

main().catch((err) => { console.error('DRIVER FAIL:', err.message); process.exit(1); });
