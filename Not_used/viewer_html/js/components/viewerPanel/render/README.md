# js/components/viewerPanel/render

Pure rendering functions that turn state into HTML strings. No DOM mutations, no side effects. Render modules are called every time state changes and produce stable, deterministic output.

## Files

### `config.js`
**What it does**: Resolves the runtime display configuration from current state and a preview response, and builds stable **selection keys** that uniquely identify a rendered chart or matrix instance.

**Key functions**:
- `buildLineSelectionKey(fileKey, path, displayDimsParam, fixedIndicesParam, lineIndex)` — pipe-joined string key used to detect when a line chart shell refers to the same data slice
- `buildMatrixSelectionKey(...)` / `buildMatrixBlockKey(...)` — equivalent helpers for matrix and block caching
- `resolveLineRuntimeConfig(state, preview)` — returns `{ supported, totalPoints, rowCount, displayDimsParam, fixedIndicesParam, lineIndex, selectionKey }` that `sections.js` uses to decide whether to render a line shell
- `resolveHeatmapRuntimeConfig(state, preview)` — equivalent for heatmap
- `resolveMatrixRuntimeConfig(state, preview)` — equivalent for matrix

**Used by**: `render/sections.js` calls all three config resolvers to decide what shells to generate and what `data-*` attributes to set on them

---

### `dimensionControls.js`
**What it does**: Renders the **Dimensions sidebar** panel that lets users pick which two axes of a 3D+ dataset to display on X and Y.

**Behaviour**:
- For a 2D dataset: shows X/Y axis radio buttons for D0 and D1
- For 3D+ datasets: shows row/column axis selectors for all dimensions, plus a fixed-index input for the non-displayed axes
- Fixed-index slider inputs are currently **hidden** via `SHOW_FIXED_INDEX_CONTROLS = false` (the UI is commented out; the state logic in `displayConfigActions.js` is still active)

**Used by**: `render/sections.js` includes the output of `renderDimensionControls(state, preview)` alongside the main display section for eligible datasets

---

### `previews.js`
**What it does**: Renders lightweight **instant preview** HTML/SVG shown before the full interactive runtime loads. Gives the user immediate visual feedback on selection.

**Three preview modes** (chosen based on dataset type/shape):
1. **Table preview** (`renderTablePreview`) — `<table>` of up to 200 rows for 1D or 100 rows × 40 cols for 2D data
2. **Line preview** (`renderLineSvgPreview`) — an inline `<svg>` polyline drawn from `preview.plot.y` data
3. **Heatmap preview** (`renderHeatmapPreview`) — a sampled grid preview using the `preview.heatmap` thumbnail data

**Used by**: `render/sections.js` calls the appropriate preview renderer and inserts it into the display section alongside the full runtime shell

---

### `sections.js`
**What it does**: The largest render file. Assembles the complete HTML for both the **inspect pane** and the **display pane**, including toolbars, tab headers, data sections, and runtime shell nodes.

**Key functions**:
- `renderInspectSection(state)` — produces the metadata table (shape, dtype, attributes, storage info)
- `renderDisplaySection(state, preview)` — builds the full display layout:
  - Tab bar (line / heatmap / matrix)
  - For each tab: preview content + "Enable full view" button + virtual shell node with `data-*` attributes
- `renderVirtualLineShell(state, config, preview)` — creates `<div data-line-shell ...>` with all config baked into `data-*` attributes; runtime reads these on init
- `renderVirtualHeatmapShell(...)` / `renderVirtualMatrixShell(...)` — equivalent for heatmap and matrix
- `renderToolIcon(kind)` / `renderIconToolButton(...)` — SVG icon helpers for toolbar buttons

**Used by**: `render/render.js` calls `renderInspectContent` and `renderDisplayContent` which are built from these section functions
