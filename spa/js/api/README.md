# js/api

The `api/` layer handles all communication between the viewer frontend and the backend HDF5 API server. It is responsible for making HTTP requests, normalising backend responses, and caching results so repeated operations (navigation, redraws) do not re-fetch data unnecessarily.

## Files

### `client.js`
**What it does**: A thin wrapper around the browser `fetch` API that adds:
- **AbortController linking** — requests can be cancelled via an external signal
- **In-flight cancel keys** — a named request type can cancel its own previous in-flight request before issuing a new one (prevents race conditions when the user navigates quickly)
- **Structured `ApiError`** — network errors, HTTP errors, and abort events are wrapped in a consistent `ApiError` class with `status`, `code`, `url`, `method`, and `isAbort` fields

**Key exports (also on `window.*`)**:
- `apiClient.get(endpoint, params, options)` — executes GET request, returns parsed JSON/text payload
- `apiClient.post(endpoint, body, options)` — executes POST request
- `cancelPendingRequest(cancelKey, reason)` — aborts an in-flight request by key
- `ApiError` class

**Used by**: `api/hdf5Service.js` (all API fetch calls go through `apiClient`)

---

### `contracts.js`
**What it does**: Normalises raw JSON payloads from the backend into predictable frontend shapes. Every field is coerced to its expected type with a safe fallback — this means renderers and reducers never need to handle `undefined` or unexpected types.

**Normalizers**:
- `normalizeFilesResponse(payload)` — files list with `key`, `size`, `last_modified`, `etag`, `type`, `is_folder`
- `normalizeTreeChildrenResponse(payload)` — array of `TreeNode` objects with `type`, `name`, `path`, `shape`, `dtype`, `ndim`, `chunks`, `compression`
- `normalizeFileMetaResponse(payload)` — dataset metadata including attributes, chunk info, and storage details
- `normalizeFilePreviewResponse(payload)` — preview payload covering `table`, `plot`, `heatmap`, `profile`, `stats` sub-objects
- `normalizeDataResponse(payload)` — windowed/block data for matrix, line, and heatmap full views

**Used by**: `api/hdf5Service.js` pipes every response through the appropriate normalizer before returning

---

### `hdf5Service.js`
**What it does**: The main API facade used by state action modules. Adds four layers of intelligence on top of raw HTTP calls:

1. **Frontend LRU caches** — caches files list, tree children per path, metadata, preview (all modes), matrix blocks, line ranges, and heatmap slices
2. **Cache key building** — cache keys include file key + ETag + all display parameters (dims, fixed indices, offsets, sizes) so any slice change produces a distinct key
3. **In-flight deduplification** — if two callers request the same preview simultaneously only one HTTP request is made; the second caller waits on the same promise
4. **Stale-while-refresh previews** — a background refresh updates the cache without a loading spinner, then dispatches a state patch when new data arrives

**Key exported functions (also on `window.*`)**:
- `getFiles(options)` — fetches and caches the file list
- `refreshFiles(options)` — force-refreshes the file list and clears tree caches
- `getFileChildren(fileKey, path, options)` — lazy tree node children
- `getFileMeta(fileKey, path, options)` — dataset metadata
- `getFilePreview(fileKey, path, params, options)` — preview data for the selected display mode
- `clearFrontendCaches()` — wipes all caches (called on file refresh)

**Used by**: `state/reducers/dataActions.js`, `state/reducers/filesActions.js`, `state/reducers/treeActions.js`, and the matrix/line/heatmap runtimes for windowed data calls

## Data flow

```
Action (e.g. treeActions.selectNode)
  ↓ calls
hdf5Service.getFilePreview(fileKey, path, params)
  ↓ checks cache → returns cached if hit
  ↓ cache miss: calls apiClient.get(endpoint, params)
    ↓ fetch() with AbortController
    ↓ response is parsed
    ↓ normalised via contracts.normalizeFilePreviewResponse()
  ↓ stored in LRU cache
  ↓ returned to action
  ↓ setState({ preview: data })
  ↓ subscribe listeners re-render
```
