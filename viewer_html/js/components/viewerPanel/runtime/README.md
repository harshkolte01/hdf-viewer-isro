# js/components/viewerPanel/runtime

Interactive runtime engines. Where `render/` produces HTML, `runtime/` **brings it to life**: it attaches event listeners, fetches and streams data, draws graphics, and manages cleanup when the panel is re-rendered.

## Files

### `common.js`
**What it does**: Holds the three cleanup registries (`Set` objects) for active runtimes, and shared DOM utility helpers reused by all three runtime engines.

**Key exports (also on `window.*`)**:
- `MATRIX_RUNTIME_CLEANUPS`, `LINE_RUNTIME_CLEANUPS`, `HEATMAP_RUNTIME_CLEANUPS` — `Set<Function>` registries; each runtime registers a cleanup function here on init
- `clearViewerRuntimeBindings()` — calls and clears all three registries; called before each re-render to prevent memory/event leaks
- `ensureNodePool(container, pool, count, className)` — efficiently growns/shrinks a DOM node pool for matrix cell rendering
- `setMatrixStatus(el, message, tone)` — updates a status element with an info/error class

**Used by**: `runtime/bindEvents.js` calls `clearViewerRuntimeBindings()` before re-binding; each of the three runtime modules pushes their cleanup into the appropriate set

---

### `bindEvents.js`
**What it does**: The **coordinator** that is called once after each render. It (1) sets up delegated panel button handlers and (2) finds fresh runtime shell nodes and initialises the appropriate runtime engine for each.

**Delegated events handled**:
- `[data-sidebar-toggle]` — collapse/expand the dimension sidebar
- `[data-axis-change]` — dispatch `actions.setDisplayAxis`
- `[data-dim-apply]` / `[data-dim-reset]` — dispatch `actions.applyDisplayConfig` / `actions.resetDisplayConfigFromPreview`
- `[data-matrix-enable]` / `[data-line-enable]` / `[data-heatmap-enable]` — dispatch enable full-view actions
- `[data-line-compare-toggle]` — dispatch compare toggle
- `[data-export-*]` — route to the `shell.__exportApi.*` handler

**Runtime initialisation**:
- Finds `[data-matrix-shell]` → calls `initializeMatrixRuntime(shell)`
- Finds `[data-line-shell]` → calls `initializeLineRuntime(shell)`
- Finds `[data-heatmap-shell]` → calls `initializeHeatmapRuntime(shell)`

**Used by**: `viewerPanel/runtime.js` facade, which is called by `viewerPanel.js`, which is called by `views/viewerView.js`

---

### `matrixRuntime.js`
**What it does**: Implements the **virtualized matrix viewer** — a scrollable grid for large 2D datasets where only visible cells are rendered.

**How block streaming works**:
1. One `runtime` object tracks scroll position, viewport size, loaded blocks, and a pending request queue
2. On scroll, `queueVisibleBlocks(runtime)` determines which `(rowOffset, colOffset)` block tiles are in view
3. Up to `MATRIX_MAX_PARALLEL_REQUESTS` (4) concurrent block fetches run at once via `getMatrixBlock()` (calls `api/hdf5Service`)
4. Fetched blocks are stored in `MATRIX_BLOCK_CACHE` (`LruCache(1600)`)
5. `renderMatrixViewport(runtime)` paints only the visible cells from cache into DOM node pools, avoiding full re-renders
6. CSV export streams all blocks sequentially and downloads via `utils/export.js`

**Key functions**: `initializeMatrixRuntime(shell)`, `queueVisibleBlocks`, `fetchMatrixBlock`, `renderMatrixViewport`, `exportMatrixCsv`

**Used by**: `bindEvents.js` finds `[data-matrix-shell]` nodes and calls `initializeMatrixRuntime`

---

### `lineRuntime.js`
**What it does**: Implements the **interactive SVG line chart** with zoom, pan, click-to-zoom, compare overlays, overview/exact quality levels, and export.

**Key features**:
- **Zoom/pan**: mouse wheel zooms, click-drag pans the visible window over the full data range using `view.offset` + `view.windowSize`
- **Click-zoom**: double-click to zoom into a region; right-click to zoom out
- **Quality levels**: `overview` (max 5000 points, server-sampled) for navigation; `exact` (max 20000 points) for precision
- **Compare overlay**: up to 5 additional datasets rendered as coloured lines on the same SVG using `LINE_COMPARE_COLORS`
- **Fullscreen restore**: if the user was in fullscreen, switching tabs and coming back restores fullscreen via a short-lived TTL token (`lineFullscreenRestore`)
- **Export**: `exportLineCsv` downloads visible data; `exportLinePng` renders the SVG to a Canvas and saves as PNG

**Key functions**: `initializeLineRuntime(shell)`, `fetchAndRenderLine`, `handleLineZoom`, `handleLinePan`, `exportLineCsv`, `exportLinePng`

**Used by**: `bindEvents.js` finds `[data-line-shell]` nodes and calls `initializeLineRuntime`

---

### `heatmapRuntime.js`
**What it does**: Implements the **canvas-based 2D heatmap** with zoom, pan, plot mode linked line chart, colormap selection, and export.

**Rendering pipeline**:
1. Fetch heatmap data (up to `HEATMAP_MAX_SIZE` × 1024 pixels)
2. Find data min/max for normalisation; apply chosen colormap via `interpolateColor(stops, ratio)`
3. Write RGBA pixel data to an offscreen canvas via `ImageData`; draw to visible canvas
4. On zoom/pan: clip the offscreen canvas to the visible viewport and re-scale

**Six built-in colormaps**: `viridis`, `plasma`, `inferno`, `magma`, `cool`, `hot` — each defined as an array of 5 RGB stop points, linearly interpolated

**Zoom/pan**: identical model to line runtime; zoom factor 1x–8x, pan enabled above `HEATMAP_PAN_START_ZOOM`

**Plot mode**: clicking a row in the heatmap switches to a linked 1D line chart showing pixel values for that row

**Export**: `exportHeatmapPng` downloads the canvas as PNG; `exportHeatmapCsv` downloads the raw data matrix as CSV

**Key functions**: `initializeHeatmapRuntime(shell)`, `renderHeatmapCanvas`, `applyColormap`, `handleHeatmapZoom`, `exportHeatmapPng`, `exportHeatmapCsv`

**Used by**: `bindEvents.js` finds `[data-heatmap-shell]` nodes and calls `initializeHeatmapRuntime`
