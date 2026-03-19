# js/core

The `core/` layer is the foundation that **must load before any other module**. It sets up the global `window.HDFViewer` namespace, resolves API configuration, and locks in the list of required DOM IDs.

## Files

### `namespace.js`
**What it does**: Creates and initialises the `window.HDFViewer` global namespace object. All other modules attach themselves to sub-paths under this object (e.g. `ns.api.client`, `ns.state.store`).

**Key exports on `window.HDFViewer.core`**:
- `ensurePath(root, path)` — creates intermediate objects for a dot-separated path (e.g. `"api.client"`) and returns the leaf
- `registerModule(moduleId)` — marks a module as loaded in `loadedModules`
- `requireModules(ids, scope)` — checks all listed module IDs are registered; logs missing ones

**Used by**: every other module in the `js/` tree (they all call `ns.core.ensurePath` in their guard block)

**Load order**: must be **first** in the `<script>` list

---

### `config.js`
**What it does**: Reads `window.__CONFIG__` (injected by `config/runtime-config.js`), normalises the API base URL, and builds typed API endpoint helper functions.

**Key exports on `window.HDFViewer.core.config`**:
- `API_BASE_URL` — normalised base URL (trailing slash stripped), default `http://localhost:5000`
- `API_ENDPOINTS` — frozen map of endpoint path builders:
  - `FILES`, `FILES_REFRESH` — string paths
  - `FILE_CHILDREN(key)`, `FILE_META(key)`, `FILE_PREVIEW(key)`, `FILE_DATA(key)`, `FILE_EXPORT_CSV(key)` — functions that encode the object key per segment
- `buildApiUrl(endpoint, params)` — builds a full URL using `URL` constructor and appends query params
- `encodeObjectKeyForPath(key)` — percent-encodes each path segment without encoding `/` separators

**Used by**: `api/client.js` reads `API_BASE_URL`; `api/hdf5Service.js` calls endpoint builders directly

**Load order**: after `namespace.js`

---

### `domRefs.js`
**What it does**: Declares the canonical list of required viewer shell DOM IDs and provides reusable DOM helpers.

**Key exports on `window.HDFViewer.core.domRefs`**:
- `REQUIRED_IDS` — array of all element IDs that must exist in the HTML shell (e.g. `"viewer-app"`, `"tree-list"`, `"display-pane"`)
- `collect(doc)` — returns an object mapping semantic names (e.g. `domRefs.treeList`) to live DOM elements
- `validate(doc)` — returns `{ ok, missing }` — boots fails if any ID is absent
- `setStatus(el, message, tone)` — updates a status element with a message and CSS tone class
- `setVisible(el, visible)` — toggles the `hidden` attribute on an element

**Used by**: `views/viewerView.js` calls `domRefs.validate()` during boot and `domRefs.collect()` every render cycle to get live element references

**Load order**: after `config.js`

## How the core layer fits into the bootstrap

```
[index.html loads scripts]
  1. config/runtime-config.js  → sets window.__CONFIG__
  2. core/namespace.js         → creates window.HDFViewer
  3. core/config.js            → reads __CONFIG__, exposes API_BASE_URL
  4. core/domRefs.js           → registers required DOM ID list
  5. (all other modules...)    → each reads from ns.core.*
```
