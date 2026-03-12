# js/state/reducers

Each file in this folder is an **action factory** — a plain function `create*Actions(deps)` that returns an object of named async/sync methods. All action files are composted together in `../reducers.js`.

## Files

### `utils.js`
**What it does**: Pure helper functions for path normalisation and multidimensional display-config math. These are passed as `utils` into every action factory.

**Key helpers**:
- `normalizePath(path)` — ensures paths start with `/` and have no trailing slash
- `getAncestorPaths(path)` — returns all parent paths up to `/` (used to expand tree ancestors automatically)
- `getNodeName(path, fallback)` — extracts the last segment of a path
- `getDefaultDisplayDims(shape)` — returns `[0, 1]` for any dataset with 2+ dimensions
- `normalizeDisplayDimsForShape(dims, shape)` — validates and clamps display dimensions to the dataset shape
- `normalizeFixedIndicesForShape(indices, shape, displayDims)` — clamps fixed slice indices to valid ranges
- `buildDisplayDimsParam(dims)` / `buildFixedIndicesParam(indices)` — serialise config to API query string parameters

**Used by**: injected as `deps.utils` into all six action factory modules

---

### `filesActions.js`
**What it does**: Actions that load and manage the top-level file list, and that open or close the viewer.

**Exported actions**:
- `loadFiles()` — fetches file list from API, stores in `state.files`
- `refreshFileList()` — force-refreshes and clears all caches
- `openViewer({ key, etag, name })` — sets `state.selectedFile`, routes to viewer, triggers `loadPreview`
- `resetToHome()` — resets all viewer state back to the home route

**Used by**: `app-viewer.js` calls `actions.openViewer` for deep-links; `views/viewerView.js` calls it when user selects a file

---

### `treeActions.js`
**What it does**: Actions for navigating the HDF5 group/dataset tree in the sidebar.

**Exported actions**:
- `expandPath(path)` — expands a tree node, lazily fetches children if not cached
- `collapsePath(path)` — collapses a tree node
- `selectNode({ path, type, name })` — sets the active node, expands ancestors, and triggers preview/metadata load
- `onBreadcrumbSelect(path)` — navigates to a path from the breadcrumb trail
- `retryLoadChildren(path)` — retries a failed child fetch

**Used by**: `components/sidebarTree.js` dispatches these on tree click/expand events

---

### `viewActions.js`
**What it does**: Actions for toggling UI controls that do not involve data fetching.

**Exported actions**:
- `setViewMode(mode)` — switches between `'inspect'` and `'display'` panel
- `setDisplayTab(tab)` — switches between `'line'`, `'heatmap'`, `'matrix'` in display mode
- `toggleSidebar()` / `setSidebarOpen(bool)` — controls sidebar visibility
- `enableMatrixFullView()` / `enableLineFullView()` / `enableHeatmapFullView()` — activates the full interactive runtime for a display tab
- `setNotation(mode)` — sets numeric notation for matrix cells (`'auto'`, `'fixed'`, `'sci'`)
- `setLineGrid(bool)` / `setHeatmapGrid(bool)` / `setHeatmapColormap(name)` — per-view UI preferences

**Used by**: `views/viewerView.js` on mode/tab button clicks

---

### `displayConfigActions.js`
**What it does**: Actions for choosing which dimensions of a 3D+ dataset to visualise (staged two-step apply workflow).

**Exported actions**:
- `setDisplayAxis(axis, dim)` — stages a new dimension assignment without applying yet
- `applyDisplayConfig()` — applies staged dims/indices, debounces a preview reload (140 ms)
- `resetDisplayConfigFromPreview()` — reverts to auto-default dims for the current dataset

**Note**: Fixed-index slider UI is currently **hidden** (`SHOW_FIXED_INDEX_CONTROLS = false` in `render/dimensionControls.js`), but the state update path here is fully implemented and ready to be re-enabled.

**Used by**: `views/viewerView.js` on dimension control interactions

---

### `dataActions.js`
**What it does**: Fetches metadata and preview data for the currently selected node, with request-key guards to prevent stale responses from overwriting newer ones.

**Exported actions**:
- `loadMetadata()` — fetches `/meta` for the selected file + path, stores in `state.metadata`
- `loadPreview()` — builds display config params from current state, fetches `/preview`, updates `state.preview`
- `reloadPreview()` — forces a fresh preview fetch (used after display config changes)

**Stale-safety mechanism**: each request stores a unique key; when the response arrives it checks `getState().previewRequestKey` — if a newer request has since started, the stale response is silently discarded.

**Used by**: called indirectly by `treeActions.selectNode` and `displayConfigActions.applyDisplayConfig`

---

### `compareActions.js`
**What it does**: Manages the list of datasets added to the line chart compare overlay.

**Exported actions**:
- `addToCompare(item)` — validates the dataset is numeric and same-ndim/shape-compatible, then adds it to `state.lineCompareItems`
- `removeFromCompare(path)` — removes a dataset from the compare list
- `clearCompare()` — empties the compare list

**Compatibility rules**: only numeric dtypes (`float*`, `int*`, `uint*`, `bool`) with matching `ndim` can be compared on the same line chart.

**Used by**: `components/sidebarTree.js` renders an “Add to compare” button for eligible datasets; `views/viewerView.js` dispatches remove/clear on toolbar interactions
