# js/components/viewerPanel

The `viewerPanel/` folder contains all code for the main content area of the viewer. It is split into two sub-layers:
- **`render/`** — pure functions that produce HTML strings from state (no side effects)
- **`runtime/`** — imperative code that attaches interactive behaviour to the HTML shells produced by render

## Files at this level

### `shared.js`
**What it does**: Defines shared constants and helper functions used by **both** the render and runtime sublayers. Loading it before both layers avoids duplication.

**Key constants**:
- Matrix layout: `MATRIX_ROW_HEIGHT`, `MATRIX_COL_WIDTH`, `MATRIX_HEADER_HEIGHT`, `MATRIX_INDEX_WIDTH`, `MATRIX_OVERSCAN`
- Matrix caches: `MATRIX_BLOCK_CACHE` (`LruCache(1600)`), `MATRIX_PENDING` (`Set`)
- Line chart: `LINE_SVG_WIDTH` (980px), `LINE_SVG_HEIGHT` (340px), `LINE_VIEW_CACHE`, `LINE_WINDOW_OPTIONS`, `LINE_KEYBOARD_PAN_RATIO`
- Line quality: `LINE_DEFAULT_QUALITY`, `LINE_DEFAULT_OVERVIEW_MAX_POINTS` (5000), `LINE_EXACT_MAX_POINTS` (20000)

**Key helpers**: `normalizeShape`, `normalizeDisplayDims`, `normalizeFixedIndices`, `getDefaultDisplayDims`, `toSafeInteger`, `clamp`, `resolveDisplayControls`

**Used by**: `render/config.js`, `render/previews.js`, `render/sections.js`, `runtime/matrixRuntime.js`, `runtime/lineRuntime.js`, `runtime/heatmapRuntime.js`

---

### `render.js`
**What it does**: The top-level panel renderer. Checks `state.viewMode` and calls either `renderDisplayContent(state)` or `renderInspectContent(state)`, wrapping the result in the outer panel `<div>`.

**Used by**: `viewerPanel.js` facade which is called from `views/viewerView.js`

---

### `runtime.js`
**What it does**: A thin facade for `bindViewerPanelEvents`. Captures the global `window.bindViewerPanelEvents` before submodules override it and re-exposes a stable reference.

**Used by**: `viewerPanel.js` delegates to this when `bindViewerPanelEvents` is called

---

## Sub-folders

| Folder | What it contains |
|--------|------------------|
| `render/` | Config resolvers, dimension controls, static previews, full section HTML builders |
| `runtime/` | Cleanup registry, event dispatcher, and the three interactive runtime engines |

See [render/README.md](render/README.md) and [runtime/README.md](runtime/README.md) for full details.

## Two-phase rendering model

```
Phase 1 — Render (synchronous, pure)
  renderViewerPanel(state)
    → render/render.js chooses inspect or display
    → render/sections.js builds the HTML with data-* attribute shells
    → render/previews.js injects fast preview (table/svg/heatmap sample)
    → render/dimensionControls.js adds axis picker sidebar if ndim ≥ 2
    → HTML string returned and injected into #viewer-panel

Phase 2 — Bind (imperative, attaches behaviour)
  bindViewerPanelEvents(root, actions)
    → runtime/bindEvents.js sets up delegated click/change handlers
    → finds [data-matrix-shell], [data-line-shell], [data-heatmap-shell] nodes
    → initializes the appropriate runtime (matrixRuntime / lineRuntime / heatmapRuntime)
```
