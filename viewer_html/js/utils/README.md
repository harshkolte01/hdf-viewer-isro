# js/utils

Shared helper utilities that are used across the API layer, state reducers, render functions, and runtime engines. All utilities are published on both `window.HDFViewer.utils.*` and directly on `window.*` for global access.

## Files

### `lru.js`
**What it does**: Implements a **bounded Least-Recently-Used (LRU) cache** backed by a JavaScript `Map`. The Map preserves insertion order: on every `get` the item is moved to the end (most recently used), and on every `set` the oldest item (first in map order) is evicted if the map exceeds the size limit.

**Class**: `LruCache(limit)`
- `get(key)` — returns the value and promotes it to most-recent; returns `undefined` if not found
- `set(key, value)` — inserts/updates the entry; evicts the oldest entry if over limit
- `clear()` — empties the cache

**Used by**:
- `api/hdf5Service.js` creates multiple `LruCache` instances for matrix blocks (400 entries), line ranges (30), heatmap slices (20), metadata (80)
- `components/viewerPanel/shared.js` maintains panel-level caches for rendered line SVGs and matrix display blocks

**Load order**: must load **before** `api/hdf5Service.js` and `components/viewerPanel/shared.js`

---

### `format.js`
**What it does**: Provides two lightweight string formatting helpers used by HTML renderers.

**Exported functions (also on `window.*`)**:
- `escapeHtml(value)` — escapes `&`, `<`, `>`, `"`, `'` to HTML entities. **Used everywhere preview tables and metadata values are inserted into innerHTML to prevent XSS.**
- `formatBytes(bytes)` — converts a byte count to a human-readable string with units (B / KB / MB / GB / TB)

**Used by**: `components/viewerPanel/render/previews.js`, `views/viewerView.js`, and any render function that inserts untrusted text into HTML

---

### `export.js`
**What it does**: Provides all download-related utilities for exporting data from the viewer.

**Exported functions (also on `window.*`)**:
- `buildExportFilename({ fileKey, path, tab, scope, extension })` — builds a filename like `filename_path_line_export_20260311-120000.csv` using sanitised path segments and a timestamp
- `csvEscapeCell(value)` — safely escapes a single cell value for CSV: wraps in quotes if it contains commas/newlines, prepends `'` to suppress spreadsheet formula injection (OWASP CSV injection protection)
- `toCsvRow(values)` — maps an array of values to a CSV line string
- `createCsvBlob(rows, includeBom)` — builds a `Blob` from row strings with optional UTF-8 BOM for Excel compatibility
- `triggerBlobDownload(blob, filename)` — creates a temporary anchor element and triggers a browser download
- Helper: `buildServerExportUrl(...)` — builds a backend `/export/csv` URL for server-side full exports

**Used by**: `components/viewerPanel/runtime/lineRuntime.js`, `matrixRuntime.js`, `heatmapRuntime.js` — all runtimes publish `shell.__exportApi.exportCsv()` and `exportPng()` handlers that call these utilities
