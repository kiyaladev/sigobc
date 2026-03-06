/**
 * test-data-modes.js
 *
 * Standalone Node.js test for the 3 data-mode logic.
 * Run with: node test-data-modes.js
 *
 * Tests the mode predicates (useApi, useCache, useSyncQueue) and the
 * Collection-level canApi/canCache/canQueue behavior for each mode.
 */

// ── Minimal Vue ref/computed shim ────────────────────────────────────────────

function ref(val) {
  const r = {
    get value() {
      return r._val;
    },
    set value(v) {
      r._val = v;
    },
    _val: val,
  };
  return r;
}

function computed(fn) {
  return {
    get value() {
      return fn();
    },
  };
}

// ── Mock localStorage ────────────────────────────────────────────────────────

const storage = {};
const localStorage = {
  getItem(k) {
    return storage[k] ?? null;
  },
  setItem(k, v) {
    storage[k] = String(v);
  },
  removeItem(k) {
    delete storage[k];
  },
};

// ── Reproduce connectivity.ts logic ──────────────────────────────────────────

const STORAGE_KEY = '_tresor_dataMode';

function loadMode() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'offline' || stored === 'offline-sync' || stored === 'online') return stored;
  return 'offline-sync';
}

const dataMode = ref(loadMode());
const isOnline = ref(true);

function setDataMode(mode) {
  dataMode.value = mode;
  localStorage.setItem(STORAGE_KEY, mode);
}

const useApi = computed(() => dataMode.value !== 'offline');
const useCache = computed(() => dataMode.value !== 'online');
const useSyncQueue = computed(() => dataMode.value === 'offline-sync');

// ── Reproduce Collection canApi/canCache/canQueue logic ──────────────────────

function getCanApi() {
  return useApi.value && isOnline.value;
}
function getCanCache() {
  return useCache.value;
}
function getCanQueue() {
  return useSyncQueue.value;
}

// ── Test helpers ─────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

function section(name) {
  console.log(`\n─── ${name} ───`);
}

// ── Tests ────────────────────────────────────────────────────────────────────

section('Default mode is offline-sync');
assert(dataMode.value === 'offline-sync', 'default mode = offline-sync');
assert(useApi.value === true, 'useApi = true');
assert(useCache.value === true, 'useCache = true');
assert(useSyncQueue.value === true, 'useSyncQueue = true');

// ── Mode: offline ────────────────────────────────────────────────────────────

section('Mode: offline');
setDataMode('offline');
assert(dataMode.value === 'offline', 'dataMode = offline');
assert(useApi.value === false, 'useApi = false (no API in offline)');
assert(useCache.value === true, 'useCache = true (Dexie active)');
assert(useSyncQueue.value === false, 'useSyncQueue = false (no sync needed)');

isOnline.value = true;
assert(getCanApi() === false, 'canApi = false even if isOnline (API disabled)');
assert(getCanCache() === true, 'canCache = true');
assert(getCanQueue() === false, 'canQueue = false');

isOnline.value = false;
assert(getCanApi() === false, 'canApi = false when offline');
assert(getCanCache() === true, 'canCache = true when offline');

// ── Mode: offline-sync ──────────────────────────────────────────────────────

section('Mode: offline-sync (online)');
setDataMode('offline-sync');
isOnline.value = true;
assert(useApi.value === true, 'useApi = true');
assert(useCache.value === true, 'useCache = true');
assert(useSyncQueue.value === true, 'useSyncQueue = true');
assert(getCanApi() === true, 'canApi = true (online + API enabled)');
assert(getCanCache() === true, 'canCache = true');
assert(getCanQueue() === true, 'canQueue = true');

section('Mode: offline-sync (offline)');
isOnline.value = false;
assert(getCanApi() === false, 'canApi = false (isOnline=false)');
assert(getCanCache() === true, 'canCache = true (Dexie still active)');
assert(getCanQueue() === true, 'canQueue = true (sync queue still active)');

// ── Mode: online ─────────────────────────────────────────────────────────────

section('Mode: online (connected)');
setDataMode('online');
isOnline.value = true;
assert(useApi.value === true, 'useApi = true');
assert(useCache.value === false, 'useCache = false (no Dexie)');
assert(useSyncQueue.value === false, 'useSyncQueue = false (no sync)');
assert(getCanApi() === true, 'canApi = true');
assert(getCanCache() === false, 'canCache = false');
assert(getCanQueue() === false, 'canQueue = false');

section('Mode: online (disconnected)');
isOnline.value = false;
assert(getCanApi() === false, 'canApi = false (no network)');
assert(getCanCache() === false, 'canCache = false (no Dexie in online mode)');
assert(getCanQueue() === false, 'canQueue = false');

// ── Write behavior simulation ────────────────────────────────────────────────

section('Write behavior: offline mode');
setDataMode('offline');
isOnline.value = false;
{
  let apiCalled = false,
    cacheCalled = false,
    queueCalled = false;
  // Simulate add() flow
  if (getCanApi()) apiCalled = true;
  if (getCanCache()) cacheCalled = true;
  if (getCanQueue()) queueCalled = true;
  assert(!apiCalled, 'API NOT called in offline mode');
  assert(cacheCalled, 'Cache IS written in offline mode');
  assert(!queueCalled, 'Queue NOT used in offline mode');
}

section('Write behavior: offline-sync (online)');
setDataMode('offline-sync');
isOnline.value = true;
{
  let apiCalled = false,
    cacheCalled = false,
    queueCalled = false;
  if (getCanApi()) apiCalled = true;
  if (getCanCache()) cacheCalled = true;
  // In real code, queue is NOT used when API succeeds (early return)
  // But queue IS available
  assert(apiCalled, 'API called in offline-sync+online');
  assert(cacheCalled, 'Cache written in offline-sync+online');
  assert(getCanQueue(), 'Queue would be available if API failed');
}

section('Write behavior: offline-sync (offline)');
isOnline.value = false;
{
  let apiCalled = false,
    cacheCalled = false,
    queueCalled = false;
  if (getCanApi()) apiCalled = true;
  if (getCanCache()) cacheCalled = true;
  if (getCanQueue()) queueCalled = true;
  assert(!apiCalled, 'API NOT called when offline');
  assert(cacheCalled, 'Cache IS written when offline');
  assert(queueCalled, 'Queue IS used when offline (for later sync)');
}

section('Write behavior: online mode (connected)');
setDataMode('online');
isOnline.value = true;
{
  let apiCalled = false,
    cacheCalled = false,
    queueCalled = false;
  if (getCanApi()) apiCalled = true;
  if (getCanCache()) cacheCalled = true;
  if (getCanQueue()) queueCalled = true;
  assert(apiCalled, 'API called in online mode');
  assert(!cacheCalled, 'Cache NOT written in online mode');
  assert(!queueCalled, 'Queue NOT used in online mode');
}

section('Write behavior: online mode (disconnected) — should fail');
isOnline.value = false;
{
  const canDoAnything = getCanApi() || getCanCache() || getCanQueue();
  assert(!canDoAnything, 'No fallback available — error should be thrown');
}

// ── Read behavior simulation ─────────────────────────────────────────────────

section('Read behavior: offline mode');
setDataMode('offline');
isOnline.value = false;
{
  let source = 'none';
  if (getCanApi()) source = 'api';
  else if (getCanCache()) source = 'cache';
  assert(source === 'cache', 'Reads from cache in offline mode');
}

section('Read behavior: offline-sync (online)');
setDataMode('offline-sync');
isOnline.value = true;
{
  let source = 'none';
  if (getCanApi()) source = 'api';
  else if (getCanCache()) source = 'cache';
  assert(source === 'api', 'Reads from API in offline-sync+online');
}

section('Read behavior: offline-sync (offline)');
isOnline.value = false;
{
  let source = 'none';
  if (getCanApi()) source = 'api';
  else if (getCanCache()) source = 'cache';
  assert(source === 'cache', 'Falls back to cache in offline-sync+offline');
}

section('Read behavior: online (connected)');
setDataMode('online');
isOnline.value = true;
{
  let source = 'none';
  if (getCanApi()) source = 'api';
  else if (getCanCache()) source = 'cache';
  assert(source === 'api', 'Reads from API in online mode');
}

section('Read behavior: online (disconnected) — no fallback');
isOnline.value = false;
{
  let source = 'none';
  if (getCanApi()) source = 'api';
  else if (getCanCache()) source = 'cache';
  assert(source === 'none', 'No data available — online mode + disconnected');
}

// ── Persistence test ─────────────────────────────────────────────────────────

section('LocalStorage persistence');
setDataMode('online');
assert(localStorage.getItem(STORAGE_KEY) === 'online', 'mode persisted to localStorage');
setDataMode('offline');
assert(localStorage.getItem(STORAGE_KEY) === 'offline', 'mode updated in localStorage');

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${'═'.repeat(50)}`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log(`${'═'.repeat(50)}`);

process.exit(failed > 0 ? 1 : 0);
