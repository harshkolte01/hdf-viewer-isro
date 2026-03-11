# js

Plain-script runtime source for the entire HDF Viewer frontend. No bundler or transpiler is used — each file is an IIFE (Immediately Invoked Function Expression) that registers itself on `window.HDFViewer`.

## Architecture overview

```
app-viewer.js          ← Boot entry point
    ↓ calls
views/viewerView.js    ← Top-level shell render + event routing
    ↓ uses
components/            ← Tree sidebar and viewer panel UI
state/                 ← Global state store + action factories
api/                   ← Backend HTTP calls + frontend caches
utils/                 ← Shared helpers (format, LRU, export)
core/                  ← Namespace, config, DOM references
```

## Files in this folder

| File | Purpose | Used by |
|------|---------|--------|
| `app-viewer.js` | Application bootstrap. Validates all dependencies, reads `?file=` deep-link, subscribes to state changes, and drives `renderViewerView` on every update. | Loaded last in `index.html` |

## Subsystem folders

| Folder | What it contains | Depends on |
|--------|-----------------|------------|
| `core/` | Namespace initializer, runtime config, and DOM ID contract | Nothing (runs first) |
| `utils/` | Format helpers, LRU cache, CSV/PNG export utilities | `core/namespace` |
| `api/` | HTTP client, payload normalizers, HDF5 API service | `core/config`, `utils/lru` |
| `state/` | Global state store + action factory modules | `api/hdf5Service`, `utils/` |
| `components/` | Sidebar tree render + viewer panel render and runtime engines | `state/`, `api/`, `utils/`, `core/` |
| `views/` | Shell-level orchestration, export dispatch, UI event wiring | `components/`, `state/`, `core/domRefs` |

## Key patterns used throughout

### IIFE with namespace guard
Every file begins with:
```js
(function (global) {
  "use strict";
  var ns = global.HDFViewer;
  if (!ns) { console.error("[HDFViewer] Missing namespace"); return; }
  // ... module code ...
  ns.core.registerModule("module/id");
})(typeof window !== "undefined" ? window : globalThis);
```
This ensures:
- Safe no-op if the namespace was not created yet (wrong script order)
- Each module self-registers so `core.requireModules` can verify load completeness

### Global bridge
Key functions are also written to `window.*` so they can be called by name from other modules loaded at any order:
```js
global.renderViewerPanel = renderViewerPanel;
ns.components.viewerPanel.renderViewerPanel = renderViewerPanel;
```

### Delegated event binding
Click/input handlers are attached once to a stable container and use `element.closest("[data-action]")` to find the actual target. This keeps rebinding cheap after rerenders because the container reference does not change.

### Subscription-driven render loop
```js
subscribe(queueRender);   // in app-viewer.js
// every setState() call fans out to all listeners
// queueRender batches via requestAnimationFrame
```

## Script load order

Dependencies are enforced purely by load order in `index.html`. The order is:
```
core/ → utils/ → api/ → state/ → components/ → views/ → app-viewer.js
```
Within each group, lower-level helpers load before consumers (e.g. `utils/lru.js` loads before `api/hdf5Service.js`).
