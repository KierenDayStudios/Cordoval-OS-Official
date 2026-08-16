/**
 * Cordoval PlayTab Background Web Worker
 * Handles real-time ticker calculations, passive income ticks, and background time synchronization.
 */

let tickInterval = null;
let passiveYieldPerSec = 0;
let isRunning = false;

self.onmessage = function (e) {
  const { type, payload } = e.data || {};

  if (type === 'START') {
    passiveYieldPerSec = payload?.passiveYieldPerSec || 0;
    if (!isRunning) {
      isRunning = true;
      startTickLoop();
    }
  } else if (type === 'UPDATE_YIELD') {
    passiveYieldPerSec = payload?.passiveYieldPerSec || 0;
  } else if (type === 'STOP') {
    isRunning = false;
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
  }
};

function startTickLoop() {
  if (tickInterval) clearInterval(tickInterval);

  tickInterval = setInterval(() => {
    if (!isRunning) return;

    self.postMessage({
      type: 'TICK',
      timestamp: Date.now(),
      earnedYield: passiveYieldPerSec
    });
  }, 1000);
}
