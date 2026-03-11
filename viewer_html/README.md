# Viewer HTML

`viewer_html` is a fully **static, plain-JavaScript** single-page application (SPA) for visualising HDF5/HDF/HDF5 files served through the backend API. It requires **no build step** — all JS files are loaded in dependency order via `<script>` tags in `index.html`.

## How it talks to the backend

```
Browser  →  viewer_html (any static host, default port 3000)
                  ↓  HTTP fetch calls
         Backend API  (default: http://localhost:5000)
                  ↓  reads from disk
         HDF5 / HDF files
```

## What this frontend does

1. **Deep-link boot**: opens a file key from `?file=<object-key>` URL parameter
2. **Lazy tree navigation**: loads HDF5 group/dataset tree on demand in the sidebar
3. **Inspect mode**: shows metadata (shape, dtype, attributes) for the selected node
4. **Display mode** with three sub-tabs:
   - **Matrix view**: virtualized scrollable grid of raw numeric values — streams blocks lazily
   - **Line graph view**: interactive SVG line chart with zoom/pan, compare overlay, and quality selection
   - **Heatmap view**: canvas-rendered 2D color map with zoom/pan, colormap picker, and linked line plot
5. **Dimension controls**: for 3D+ datasets, pick which two dimensions map to the X/Y axes
6. **Export**: download displayed data as CSV or PNG

## Folder structure

```
viewer_html/
├── index.html               # Entry shell — static HTML layout + ordered script tags
├── config/
│   └── runtime-config.js    # Sets window.__CONFIG__.API_BASE_URL before any JS runs
├── assets/
│   └── logo.svg             # Optional branding SVG
├── css/
│   ├── tokens.css           # Design tokens (colors, spacing, radii, shadows)
│   ├── app.css              # Base resets, navbar, table, and shared layout
│   ├── home.css             # Home-page-specific styles
│   ├── viewer.css           # Viewer shell layout: sidebar, topbar, subbar
│   ├── viewer-panel.css     # Inspect/display panes, matrix/line/heatmap panel styles
│   └── components/
│       ├── tree.css         # Tree sidebar visuals
│       ├── table.css        # File list table and action row styles
│       └── charts.css       # Shared chart surface styles
└── js/
    ├── app-viewer.js        # Application bootstrap, dependency check, deep-link handler
    ├── core/
    │   ├── namespace.js     # Creates window.HDFViewer namespace and module registry
    │   ├── config.js        # Reads runtime config, builds normalised API endpoint helpers
    │   └── domRefs.js       # Lists required DOM IDs and provides DOM helpers
    ├── api/
    │   ├── client.js        # fetch wrapper with AbortController, cancel keys, ApiError
    │   ├── contracts.js     # Normalises raw backend payloads into clean frontend shapes
    │   └── hdf5Service.js   # Frontend LRU caches + request dedupe for all API calls
    ├── state/
    │   ├── store.js         # Mutable global state + getState/setState/subscribe
    │   ├── reducers.js      # Composes all action factories into a single `actions` object
    │   └── reducers/
    │       ├── utils.js             # Path and display-config math shared by all reducers
    │       ├── filesActions.js      # Load file list, open viewer, reset to home
    │       ├── treeActions.js       # Expand/collapse, lazy child loading, node selection
    │       ├── viewActions.js       # Mode/tab toggles, sidebar open, full-view guards
    │       ├── displayConfigActions.js  # Staged/applied display dims + fixed indices
    │       ├── dataActions.js       # Metadata and preview fetch with stale-safety
    │       └── compareActions.js    # Line compare dataset validation and management
    ├── utils/
    │   ├── format.js        # HTML escaping and byte size formatting
    │   ├── lru.js           # Bounded LRU cache class
    │   └── export.js        # CSV/PNG export, filename builder, download trigger
    ├── components/
    │   ├── sidebarTree.js   # Renders file tree markup and wires interaction events
    │   ├── viewerPanel.js   # Facade delegating to render/runtime submodules
    │   └── viewerPanel/
    │       ├── shared.js           # Chart/matrix constants and shared helper functions
    │       ├── render.js           # Panel wrapper that picks inspect or display content
    │       ├── runtime.js          # Facade for binding panel runtime events
    │       ├── render/
    │       │   ├── config.js            # Builds selection keys and resolves runtime config
    │       │   ├── dimensionControls.js # Dimension axis pickers for 2D+ datasets
    │       │   ├── previews.js          # Fast table/line/heatmap preview HTML/SVG
    │       │   └── sections.js          # Full inspect/display section markup + runtime shells
    │       └── runtime/
    │           ├── common.js        # Cleanup registries + shared DOM helpers
    │           ├── bindEvents.js    # Delegated panel events + per-shell runtime init
    │           ├── matrixRuntime.js # Block-virtualized matrix render + CSV export
    │           ├── lineRuntime.js   # SVG line chart with zoom/pan/compare + export
    │           └── heatmapRuntime.js # Canvas heatmap with zoom/pan/plot mode + export
    └── views/
        └── viewerView.js    # Top-level shell render, status sync, and export routing
```

## Script load order (index.html)

Scripts must be loaded in this dependency order because there is no module bundler:

```
runtime-config.js          ← sets window.__CONFIG__ first
core/namespace.js          ← creates window.HDFViewer namespace
core/config.js             ← reads __CONFIG__, exposes API_BASE_URL + endpoints
core/domRefs.js            ← locks in required DOM ID list
utils/lru.js               ← LruCache class (needed by service caches)
utils/format.js            ← escapeHtml, formatBytes
utils/export.js            ← CSV/PNG download helpers
api/client.js              ← fetch wrapper, ApiError
api/contracts.js           ← payload normalizers
api/hdf5Service.js         ← API service with frontend caches
state/store.js             ← state object + getState/setState/subscribe
state/reducers/utils.js    ← display-config math
state/reducers/*Actions.js ← individual action factories
state/reducers.js          ← composes all actions into window.actions
components/viewerPanel/shared.js        ← chart constants
components/viewerPanel/render/config.js ← selection key builders
components/viewerPanel/render/dimensionControls.js
components/viewerPanel/render/previews.js
components/viewerPanel/render/sections.js
components/viewerPanel/render.js
components/viewerPanel/runtime/common.js
components/viewerPanel/runtime/bindEvents.js
components/viewerPanel/runtime/matrixRuntime.js
components/viewerPanel/runtime/lineRuntime.js
components/viewerPanel/runtime/heatmapRuntime.js
components/viewerPanel/runtime.js
components/sidebarTree.js
views/viewerView.js
app-viewer.js              ← boot, deep-link parse, subscribe loop
```

## Application boot sequence

1. `runtime-config.js` sets `window.__CONFIG__.API_BASE_URL`
2. Core modules build the namespace, expose config, lock in DOM IDs
3. Utility, API, state, component, and view modules register themselves
4. `app-viewer.js` runs on `DOMContentLoaded`:
   - Verifies all required modules are registered
   - Validates all required DOM IDs are present
   - Reads `?file=` query param → dispatches `actions.openViewer` if present
   - Subscribes to state changes → calls `renderViewerView` on each update
   - Sets up responsive sidebar collapse on narrow viewports

## Key architecture patterns

- **Namespace IIFE**: every module is wrapped in `(function(global){...})(window)` and guard-checks `window.HDFViewer` before running
- **Global bridge**: key functions/classes are also written to `window.*` for cross-module access (e.g. `window.renderViewerPanel`, `window.actions`)
- **Delegated events**: click/input handlers are attached to stable container nodes and use `closest('[data-*]')` to find targets — this means rebinding after a rerender is cheap
- **LRU caches**: matrix blocks, line ranges, heatmap slices, metadata, and preview responses are cached in bounded `LruCache` instances to avoid redundant API calls
- **Stale-safety**: async actions tag requests with an in-flight key and discard responses that arrive after a newer request has already completed

## Default local integration

- Backend API: `http://localhost:5000`
- H5API browser (optional): `http://localhost:5100`
- `viewer_html` itself is fully static — host it on any web server

## Run locally

```bash
cd viewer_html
python -m http.server 3000
```

Open with deep link:

```text
http://localhost:3000/?file=<url-encoded-object-key>
```

## Configuration

Set backend URL in:
- `viewer_html/config/runtime-config.js`

Default value:

```js
window.__CONFIG__.API_BASE_URL = "http://localhost:5000";
```

## Documentation

Start here:
- `viewer_html/docs/README.md`
