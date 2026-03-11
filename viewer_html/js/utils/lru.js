// Viewer HTML module: Implements a lightweight in-memory LRU cache used by data and runtime layers.
(function (global) {
  "use strict";
  var ns = global.HDFViewer;
  if (!ns) {
    console.error("[HDFViewer] Missing namespace for utils/lru.");
    return;
  }
  var ensurePath = ns.core && ns.core.ensurePath;
  if (typeof ensurePath !== "function") {
    console.error("[HDFViewer] Missing core.ensurePath before loading utils/lru.");
    return;
  }
  var moduleState = ensurePath(ns, "utils.lru");

// Bounded LRU cache backed by a native Map.
// Map preserves insertion order: get() re-inserts accessed keys at the end (most-recent position),
// and set() evicts the first (oldest) key when the size limit is exceeded.
class LruCache {
  constructor(limit = 100) {
    this.limit = limit;
    this.map = new Map();
  }

  // Returns the value for key and moves it to most-recently-used position; undefined if not found
  get(key) {
    if (!this.map.has(key)) {
      return undefined;
    }

    // Delete and re-insert to move this entry to the end of the Map's iteration order
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  // Inserts or updates a key-value pair; evicts the least-recently-used entry if over limit
  set(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    }

    this.map.set(key, value);

    // Evict the oldest entry (first key in Map iteration) when limit is exceeded
    if (this.map.size > this.limit) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
  }

  // Removes all entries from the cache
  clear() {
    this.map.clear();
  }
}
  if (typeof LruCache !== "undefined") {
    moduleState.LruCache = LruCache;
    global.LruCache = LruCache;
  }
  if (ns.core && typeof ns.core.registerModule === "function") {
    ns.core.registerModule("utils/lru");
  }
})(typeof window !== "undefined" ? window : globalThis);
