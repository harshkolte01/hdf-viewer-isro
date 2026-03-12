// Viewer HTML module: Initializes the global HDFViewer namespace, module registry, and dependency guards for plain-script loading.
(function (global) {
  "use strict";

  if (!global) {
    return;
  }

  // Guard: do not overwrite an existing non-object value (e.g. if a third-party script claimed the name)
  var existingNamespace = global.HDFViewer;
  if (existingNamespace && typeof existingNamespace !== "object") {
    console.error("[HDFViewer] Cannot initialize namespace: window.HDFViewer is not an object.");
    return;
  }

  // Reuse an existing partial namespace (e.g. set by a previous script) or start fresh
  var ns = existingNamespace || {};

  // Ensures a key on target is an object, creating it if absent
  function ensureObject(target, key) {
    if (!target[key] || typeof target[key] !== "object") {
      target[key] = {};
    }
    return target[key];
  }

  // Walks a dot-separated path string and creates missing intermediate objects,
  // then returns the leaf object so callers can attach properties to it.
  // Example: ensurePath(ns, "api.client") returns ns.api.client (creating ns.api and ns.api.client if needed)
  function ensurePath(root, path) {
    if (!path) {
      return root;
    }

    var parts = String(path).split(".");
    var cursor = root;

    for (var i = 0; i < parts.length; i += 1) {
      var part = parts[i];
      if (!part) {
        continue;
      }

      if (!cursor[part] || typeof cursor[part] !== "object") {
        cursor[part] = {};
      }
      cursor = cursor[part];
    }

    return cursor;
  }

  // Mark namespace as initialized and set a phase identifier for debugging
  ns.__initialized = true;
  ns.__phase = "phase3-port";

  // Create top-level namespace buckets for each subsystem
  ensureObject(ns, "core");
  ensureObject(ns, "utils");
  ensureObject(ns, "api");
  ensureObject(ns, "state");
  ensureObject(ns, "components");
  ensureObject(ns, "views");
  ensureObject(ns, "app");

  // Publish ensurePath so all other modules can safely create their own sub-paths
  ns.core.ensurePath = ensurePath;

  // Module registry: tracks which module IDs have been loaded (prevents double-init errors)
  ns.core.loadedModules = ns.core.loadedModules || {};

  // registerModule: called by each module after it finishes self-registering
  ns.core.registerModule = function registerModule(moduleId) {
    if (!moduleId) {
      return;
    }
    ns.core.loadedModules[moduleId] = true;
  };

  // requireModules: used by app-viewer.js at boot to assert all expected modules loaded successfully
  ns.core.requireModules = function requireModules(moduleIds, scope) {
    var ids = Array.isArray(moduleIds) ? moduleIds : [];
    var missing = [];

    for (var i = 0; i < ids.length; i += 1) {
      var id = ids[i];
      if (id && !ns.core.loadedModules[id]) {
        missing.push(id);
      }
    }

    if (missing.length > 0) {
      console.error(
        "[HDFViewer] Missing required modules" + (scope ? " for " + scope : "") + ":",
        missing.join(", ")
      );
    }

    return {
      ok: missing.length === 0,
      missing: missing,
    };
  };

  // Self-register so requireModules can verify this module loaded
  ns.core.registerModule("core/namespace");

  global.HDFViewer = ns;
})(typeof window !== "undefined" ? window : globalThis);

