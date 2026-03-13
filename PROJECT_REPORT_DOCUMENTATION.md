# HDF Viewer ISRO - Full Project Documentation

This document is a report-style explanation of the current implementation in this repository.

It focuses on the active project path:

- `backend/` - Flask API and HDF5 data access layer
- `viewer_html/` - static plain-JavaScript browser viewer

It also explains the related delivery and integration variants:

- `spa/` - host-page integration version
- `spa-single-page/` - single-file bundled SPA output
- `singlepagecode/` - another single-file generated viewer output

This file is written so it can be used as the base for a technical report, viva, presentation notes, or project documentation handover.

---

## 1. Project Overview

### 1.1 What the project does

The project is an HDF5 file exploration and visualization system.

It lets a user:

- browse available HDF5/HDF files from server storage
- open a selected file
- navigate the internal HDF5 tree structure
- inspect metadata for groups and datasets
- preview data quickly
- open full interactive views for matrix, line graph, and heatmap
- export displayed or full data to CSV
- export selected chart views to PNG where supported

### 1.2 Main problem solved

HDF5 files are structured, hierarchical, and often large. They are not convenient to inspect directly using raw filesystem tools.

This project solves that by separating responsibilities:

- the backend reads files safely from disk and exposes a controlled HTTP API
- the frontend turns that API into an interactive viewer

### 1.3 Active implementation path

The current implemented application is based on:

```text
Browser
  -> viewer_html (static frontend)
  -> backend (Flask API)
  -> filesystem storage
  -> HDF5 files
```

### 1.4 Main technologies

Backend:

- Python
- Flask
- Flask-CORS
- h5py
- NumPy
- dotenv

Frontend:

- HTML
- CSS
- plain JavaScript
- no framework
- no bundler
- no build step required for `viewer_html/`

### 1.5 Core design idea

The project is designed to be simple to deploy and easy to reason about:

- backend is a standard Flask service
- frontend is a static site with fixed DOM IDs
- modules are loaded in strict script order
- no React, Vue, or Webpack dependency is required
- data-heavy operations are bounded with cache and size limits

---

## 2. High-Level Architecture

## 2.1 End-to-end flow

```text
User opens viewer
  -> frontend loads static HTML/CSS/JS
  -> frontend reads ?file=<backend-key> or host-provided file variable
  -> frontend calls backend APIs
  -> backend validates request
  -> backend reads filesystem and HDF5 contents
  -> backend returns JSON or streamed CSV
  -> frontend renders tree, metadata, table, line graph, or heatmap
```

### 2.2 Logical layers

Backend layers:

1. app bootstrap
2. storage layer
3. route layer
4. HDF5 reader layer
5. cache layer

Frontend layers:

1. static shell
2. runtime config
3. core namespace and DOM contract
4. API client and data contracts
5. global state and actions
6. view orchestration
7. component rendering
8. runtime engines for matrix, line, and heatmap

---

## 3. Project Folder Structure

## 3.1 Main folders

```text
backend/           Flask backend and HDF5 access
viewer_html/       Primary static viewer implementation
spa/               Host-page integration version
spa-single-page/   Bundled one-file SPA output
singlepagecode/    Generated single-file viewer variant
H5API/             Separate folder present in repo, not the main active path described here
images/            Project images and assets
```

### 3.2 Important root files

- `README.md` - top-level summary of the current implementation path
- `PROJECT_REPORT_DOCUMENTATION.md` - this consolidated report document

---

## 4. Backend Documentation

## 4.1 Backend purpose

The backend is responsible for:

- exposing the list of files/folders available under the configured storage root
- opening HDF5 files
- navigating internal HDF5 groups and datasets
- reading metadata
- generating lightweight previews
- reading bounded data windows for full views
- streaming CSV exports
- applying caching and safety limits

### 4.2 Main backend files

| File | Responsibility |
|---|---|
| `backend/app.py` | Flask app creation, CORS, route registration |
| `backend/wsgi.py` | production WSGI entry |
| `backend/src/routes/files.py` | file list and refresh routes |
| `backend/src/routes/hdf5.py` | children, metadata, preview, data, export routes |
| `backend/src/readers/hdf5_reader.py` | HDF5 traversal, slicing, preview building |
| `backend/src/storage/filesystem_client.py` | safe filesystem access |
| `backend/src/utils/cache.py` | thread-safe TTL caches |

### 4.3 Backend startup flow

When the backend starts:

1. `.env` is loaded with `load_dotenv()`
2. logging level is configured from `DEBUG`
3. Flask app is created
4. `strict_slashes` is disabled
5. CORS is enabled
6. blueprints are registered:
   - `files_bp` under `/files`
   - `hdf5_bp` under `/files`
7. top-level service routes become available:
   - `GET /`
   - `GET /health`

### 4.4 Environment configuration

The backend expects storage location configuration through environment variables.

Main variables:

- `STORAGE_ROOT`
- `STORAGE_PATH_WINDOWS`
- `STORAGE_PATH_LINUX`
- `HOST`
- `PORT`
- `DEBUG`

Storage root selection logic:

1. if `STORAGE_ROOT` exists, use it
2. otherwise use OS-aware fallback:
   - Windows: `STORAGE_PATH_WINDOWS`, then `STORAGE_PATH_LINUX`
   - Linux/macOS: `STORAGE_PATH_LINUX`, then `STORAGE_PATH_WINDOWS`

### 4.5 How the backend works internally

For a typical request:

1. route reads path and query parameters
2. parameters are validated and normalized
3. relevant cache is checked
4. storage client resolves the file safely
5. HDF5 reader opens the file and resolves the dataset/group path
6. backend reads only the required data window, not the whole file when avoidable
7. data is sanitized into JSON-safe format
8. response is returned as JSON or streamed CSV

### 4.6 Filesystem storage layer

`FilesystemStorageClient` is the active storage implementation.

What it does:

- resolves the configured storage root
- validates keys and prefixes
- blocks path traversal like `..`
- ensures resolved paths stay under the allowed root
- lists objects recursively
- returns file metadata such as size, timestamps, and `etag`
- opens files as binary streams for `h5py`

Important point:

The backend is filesystem-based. It does not depend on object storage at runtime in the active implementation.

### 4.7 HDF5 reader layer

`HDF5Reader` is the core data-processing engine of the backend.

Main responsibilities:

- get dataset information without reading the full dataset
- get children of a group path
- get metadata for a group or dataset
- build preview payloads
- read matrix windows
- read heatmap slices
- read line profiles
- sanitize NumPy/HDF5 values into JSON-safe Python values

Examples of sanitization:

- bytes -> string
- NumPy scalars -> plain Python values
- `NaN` or `Inf` -> `None`
- complex values -> string representation

### 4.8 Selection normalization for N-D data

Many HDF5 datasets are more than 2D. The backend supports this by using:

- `display_dims` - which two dimensions should be shown visually
- `fixed_indices` - which index to use for all other dimensions

This makes it possible to:

- show a 2D matrix from a higher-dimensional dataset
- extract a heatmap plane from a larger tensor
- extract a 1D line profile from a multidimensional dataset

---

## 5. Backend Route Reference

## 5.1 Service routes

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/` | service info endpoint |
| `GET` | `/health` | health and timestamp endpoint |

### 5.2 File routes

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/files/` | list files and folders under storage root |
| `POST` | `/files/refresh` | clear file-list cache |

#### `GET /files/`

Purpose:

- return file and optional folder entries
- support filtering by prefix
- support result-size limiting

Important query parameters:

- `prefix`
- `include_folders`
- `max_items`

Response includes:

- `files`
- `files_count`
- `folders_count`
- `truncated`
- `cached`

#### `POST /files/refresh`

Purpose:

- clear the file-list cache so the next `/files/` call reads fresh content from disk

### 5.3 HDF5 routes

All HDF5 routes use:

```text
/files/<key>/...
```

Where `<key>` is the backend-relative file key under the storage root.

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/files/<key>/children` | get immediate children of a group path |
| `GET` | `/files/<key>/meta` | get metadata for a group or dataset path |
| `GET` | `/files/<key>/preview` | get a lightweight preview payload |
| `GET` | `/files/<key>/data` | get bounded data for matrix, heatmap, or line runtime |
| `GET` | `/files/<key>/export/csv` | stream CSV export |

#### `GET /files/<key>/children`

Purpose:

- lazy-load the tree
- return immediate children under a specific HDF5 path

Important query parameter:

- `path` (default `/`)

Main use in frontend:

- sidebar tree expansion

#### `GET /files/<key>/meta`

Purpose:

- return detailed metadata for the selected path

Important query parameter:

- `path` (required)

Typical metadata includes:

- object type
- shape
- ndim
- dtype
- chunks
- filters/compression
- attributes

#### `GET /files/<key>/preview`

Purpose:

- return preview data that is small enough for fast UI updates

Important query parameters:

- `path`
- `mode=auto|line|table|heatmap`
- `detail=fast|full`
- `include_stats`
- `display_dims`
- `fixed_indices`
- `max_size`
- `etag`

What the frontend gets from preview:

- preview type
- sample table or plot data
- optional stats
- selected display dimensions
- normalized fixed indices
- cache metadata

#### `GET /files/<key>/data`

Purpose:

- provide full runtime data for interactive views

Required:

- `path`
- `mode=matrix|heatmap|line`

Mode behavior:

Matrix mode:

- reads bounded row/column windows
- supports offset, limit, and step
- used by the virtualized matrix runtime

Heatmap mode:

- reads a 2D plane
- supports size-limited downsampling
- can include stats

Line mode:

- reads a 1D profile
- supports exact, overview, and auto quality
- supports line windowing and point caps

#### `GET /files/<key>/export/csv`

Purpose:

- export full or selected data as CSV

Supported modes:

- `matrix`
- `heatmap`
- `line`

Main features:

- streamed response
- chunked reading for large exports
- UTF-8 BOM for spreadsheet compatibility
- CSV formula-injection hardening
- compare-series export support for line mode

---

## 6. Backend Caching, Limits, and Safety

## 6.1 Cache model

The backend uses in-memory thread-safe TTL caches.

Main caches:

| Cache | Purpose | Default TTL | Max entries |
|---|---|---:|---:|
| files cache | `/files/` results | 30s | 200 |
| hdf5 cache | children, metadata, preview | 300s | 3000 |
| dataset cache | dataset info reused across routes | 300s | 3000 |
| data cache | `/data` responses | 120s | 1200 |

### 6.2 Why caching matters

Caching reduces:

- repeated filesystem walks
- repeated HDF5 open/read overhead
- repeated metadata fetches
- repeated preview generation
- repeated interactive runtime requests

### 6.3 Route-level limits

The backend applies hard guardrails to prevent very large responses and memory pressure.

Important limits:

- `MAX_JSON_ELEMENTS = 500_000`
- `MAX_ELEMENTS = 1_000_000`
- `MAX_MATRIX_ROWS = 2000`
- `MAX_MATRIX_COLS = 2000`
- `MAX_LINE_POINTS = 5000`
- `MAX_LINE_EXACT_POINTS = 20000`
- `MAX_HEATMAP_SIZE = 1024`
- `MAX_EXPORT_CSV_CELLS = 10_000_000`
- `MAX_EXPORT_LINE_POINTS = 5_000_000`

### 6.4 Safety features

Backend safety mechanisms include:

- path traversal protection in the filesystem client
- object-key normalization
- not-found errors mapped to 404 where possible
- deterministic cache key serialization
- CSV cell escaping against spreadsheet formula execution
- bounded export chunk sizes
- bounded preview and data payload size

### 6.5 Error model

Error responses use a common shape:

```json
{
  "success": false,
  "error": "message"
}
```

Typical status codes:

- `400` - invalid params or unsupported request shape
- `404` - file/path not found style errors
- `500` - unexpected server-side failure

---

## 7. Backend Testing and Validation

## 7.1 Unit tests

Backend tests live in:

- `backend/tests/test_files_routes.py`
- `backend/tests/test_hdf5_routes.py`

Covered areas include:

- `/files` parameter validation
- folder counting and truncation
- `/data` validation and mode handling
- preview forwarding behavior
- cache reuse behavior
- line/heatmap limits
- CSV export logic
- formula-like CSV escaping

### 7.2 Helper scripts

Useful scripts in `backend/scripts/` include:

- benchmarking
- storage testing
- range-read verification

---

## 8. Viewer HTML Documentation

## 8.1 Viewer purpose

`viewer_html/` is the primary browser frontend for this project.

Its job is to turn backend API responses into a usable HDF5 exploration UI.

It is intentionally implemented as:

- static HTML
- static CSS
- plain JavaScript
- strict script order
- no framework build pipeline

### 8.2 Main viewer files

| File | Responsibility |
|---|---|
| `viewer_html/index.html` | fixed shell and script order |
| `viewer_html/config/runtime-config.js` | backend base URL |
| `viewer_html/js/app-viewer.js` | startup and lifecycle |
| `viewer_html/js/views/viewerView.js` | shell render and event orchestration |
| `viewer_html/js/components/sidebarTree.js` | tree UI |
| `viewer_html/js/components/viewerPanel/render/*` | HTML generation for inspect/display |
| `viewer_html/js/components/viewerPanel/runtime/*` | matrix, line, and heatmap engines |
| `viewer_html/js/api/*` | API access and normalization |
| `viewer_html/js/state/*` | store and actions |

### 8.3 Viewer boot sequence

The viewer startup order is:

1. `runtime-config.js`
2. `js/core/*`
3. `js/utils/*`
4. `js/api/*`
5. `js/state/*`
6. `js/components/*`
7. `js/views/viewerView.js`
8. `js/app-viewer.js`

Why this matters:

- there is no module bundler
- every script depends on symbols registered by earlier scripts
- load order is part of the runtime contract

### 8.4 Viewer architecture layers

Core layer:

- namespace creation
- API base URL config
- DOM ID validation helpers

API layer:

- fetch wrapper
- error normalization
- backend payload normalization
- frontend-side caches and dedupe

State layer:

- global mutable store
- action factories for files, tree, view, metadata, preview, compare mode

View layer:

- render shell sections
- bind delegated events
- sync statuses

Component layer:

- sidebar tree renderer
- viewer panel renderer
- runtime engines for full interactive views

---

## 9. Viewer HTML User Views and Features

This section explains the actual user-facing screens and interactions implemented in the project.

## 9.1 Home / file list state

The viewer supports a file-list state where users can see available files returned by the backend.

Main behaviors:

- fetch file list from `/files/`
- show file/folder rows
- support refresh
- support navigation into viewer mode

Main files involved:

- `viewer_html/js/state/reducers/filesActions.js`
- `viewer_html/js/api/hdf5Service.js`
- `viewer_html/js/views/viewerView.js`

### 9.2 Viewer shell

Once a file is opened, the layout is built around:

- left sidebar
- top toolbar
- sub-toolbar for display controls
- main panel
- status line

Important shell IDs:

- `viewer-app`
- `viewer-sidebar`
- `viewer-topbar`
- `viewer-subbar`
- `display-pane`
- `inspect-pane`
- `global-status`

### 9.3 Sidebar tree view

The tree is the left-side browser for HDF5 structure.

Implemented tree features:

- show groups and datasets
- lazy-load child nodes
- expand/collapse groups
- select a node
- retry failed tree loads
- show compare buttons for compatible line datasets

The tree is not hardcoded. It is rendered from current state and updated after API responses.

### 9.4 Metadata / inspect view

The inspect view shows metadata for the selected node.

It includes:

- identity information
- object type
- shape
- dtype
- chunking and compression details
- attributes
- raw JSON output

Metadata depends on:

- selected path
- selected node type
- metadata loading state
- metadata error state

### 9.5 Display view

Display view is the main data visualization area.

It contains:

- sub-tabs for matrix, line, and heatmap
- runtime-specific controls
- export menu
- dimension controls for higher-dimensional datasets

The three display subviews are described below.

---

## 10. Display Subviews

## 10.1 Matrix view

Purpose:

- show a 2D data slice as a scrollable numeric table

Implemented matrix features:

- preview table
- full matrix runtime
- virtualized cell rendering
- block-based data loading
- bounded parallel requests
- sticky row and column headers
- notation controls
- displayed CSV export
- full CSV export

Why it is useful:

- large matrices can be explored without loading the entire dataset into the browser at once

## 10.2 Line graph view

Purpose:

- show a 1D profile extracted from the selected dataset

Implemented line features:

- line preview
- full interactive SVG runtime
- zoom
- pan
- click zoom
- keyboard stepping
- line grid toggle
- aspect switch: line / point / both
- compare mode for multiple datasets
- displayed CSV export
- full CSV export
- current PNG export

Compare mode features:

- add datasets from the tree
- validate shape compatibility
- validate dtype compatibility
- overlay multiple series on the same chart
- remove one series or clear all series

## 10.3 Heatmap view

Purpose:

- show a 2D dataset slice as a color image

Implemented heatmap features:

- preview heatmap
- full canvas-based runtime
- zoom and pan
- hover and inspect behavior
- colormap selection
- grid toggle
- progressive loading
- fullscreen heatmap view
- linked line plot mode
- displayed CSV export
- full CSV export
- current PNG export

Linked plot behavior:

- user interacts with heatmap
- viewer can derive a row or column profile
- linked line chart is shown with the heatmap context

---

## 11. Viewer Control Features

## 11.1 Shell-level controls

Implemented shell controls include:

- sidebar open/close
- breadcrumb navigation
- back to files
- fullscreen toggle
- inspect vs display switching

### 11.2 Display controls

Implemented display controls include:

- display tab switching
- notation selection
- line grid toggle
- line aspect mode
- heatmap grid toggle
- heatmap colormap picker
- export menu open/close

### 11.3 Dimension controls

For datasets with more than two dimensions, the viewer supports:

- choosing which axes should be displayed
- fixing hidden dimensions to selected indices
- applying staged configuration
- resetting staged configuration

This is one of the most important implemented features because it makes N-D data practically viewable.

### 11.4 Fullscreen and responsive behavior

The frontend supports:

- fullscreen toggle on the viewer
- responsive sidebar collapsing
- mobile overlay backdrop
- toolbar adjustments for smaller screens

---

## 12. Viewer State Management

The frontend uses one mutable global store.

Important state categories:

- selected file
- selected path
- route and view mode
- tree cache and expand state
- metadata data/loading/error
- preview data/loading/error
- display configuration
- matrix/line/heatmap runtime settings
- compare mode state
- sidebar state

Actions are grouped by concern:

- `filesActions`
- `treeActions`
- `viewActions`
- `displayConfigActions`
- `dataActions`
- `compareActions`

This makes the app modular even though it is plain JavaScript.

---

## 13. Frontend-to-Backend Integration

## 13.1 How the viewer opens a file

The main viewer integration contract is:

```text
?file=<backend-object-key>
```

That means the viewer expects a backend-relative file key such as:

- `hdf5/sample.hdf5`
- `Folder_1/random_05.h5`

The viewer does not open raw local machine paths directly.

### 13.2 API calls used by the frontend

Main backend endpoints used by `viewer_html`:

- `GET /files/`
- `POST /files/refresh`
- `GET /files/<key>/children`
- `GET /files/<key>/meta`
- `GET /files/<key>/preview`
- `GET /files/<key>/data`
- `GET /files/<key>/export/csv`

### 13.3 Why contracts.js exists

The frontend includes a contract-normalization layer so UI code does not depend on raw backend response details everywhere.

This improves:

- consistency
- maintainability
- easier API evolution

---

## 14. Project Features Summary

This section can be used directly in a report chapter titled "Implemented Features".

Implemented backend features:

- Flask service bootstrap
- health and service endpoints
- file listing under configured storage root
- file-list refresh endpoint
- safe filesystem path handling
- HDF5 group and dataset traversal
- metadata extraction
- preview generation
- bounded matrix data access
- bounded heatmap data access
- bounded line data access
- streamed CSV export
- in-memory TTL caches
- route-level size and safety limits
- test coverage for major route behaviors

Implemented frontend features:

- static shell with no build dependency
- deep-link file open
- file listing and viewer state
- lazy tree navigation
- inspect metadata panel
- display panel with three visual modes
- matrix runtime
- line runtime
- heatmap runtime
- dimension controls for N-D data
- line compare mode
- CSV export
- PNG export for charts where supported
- fullscreen mode
- responsive sidebar behavior
- topbar, breadcrumb, and shell controls

Implemented project-level features:

- clear backend/frontend separation
- static frontend deployment support
- single-file output variants
- host-page integration variants
- documentation for backend and viewer implementation

---

## 15. Delivery and Integration Variants

Although `backend/` and `viewer_html/` are the main active implementation path, the repository also contains deployment-friendly variants.

## 15.1 `spa/`

Purpose:

- adapt the viewer for host-page integration
- allow a company page to keep its own header and surrounding layout
- support a host-provided global `file` variable or URL parameter normalization

Use case:

- integrating the viewer inside an existing PHP page or other host application

## 15.2 `spa-single-page/`

Purpose:

- generate a bundled single-file version of the SPA
- useful where one HTML file is easier to deliver than many separate assets

How it is created:

- `spa/build-single-file.ps1` inlines CSS and JS into one output HTML file

## 15.3 `singlepagecode/`

Purpose:

- provide a self-contained one-file viewer build in `singlepagecode/index.html`

Practical value:

- easier sharing
- simpler embedding in environments that prefer one file

### What `singlepagecode/index.html` contains

`singlepagecode/index.html` is a fully inlined HTML viewer bundle.

It contains inside one file:

- the main viewer shell HTML
- inlined CSS from the viewer stylesheets
- inlined JavaScript modules
- runtime config
- app bootstrap logic

So instead of loading many separate files like:

- `css/*.css`
- `js/*.js`
- `config/runtime-config.js`

everything is already embedded inside one HTML file.

### How it behaves

The bundled file behaves like the plain `viewer_html` viewer.

Main behavior visible in the file:

- it uses the fixed viewer shell IDs like `viewer-app`, `viewer-sidebar`, `viewer-topbar`, and `viewer-panel`
- it supports inspect and display modes
- it supports matrix, line, and heatmap views
- it reads the file to open from `?file=<backend-object-key>`
- it expects the backend API base URL through the inlined runtime config

In other words, `singlepagecode/index.html` is a self-contained viewer delivery artifact, not a separate architecture.

### Difference from `viewer_html/`

`viewer_html/` is the main source-oriented frontend folder.

It is better for:

- development
- feature changes
- debugging by module
- maintaining the codebase

`singlepagecode/index.html` is better for:

- delivering one file
- sharing a compact build
- environments where loading many separate frontend assets is inconvenient

### Difference from `spa-single-page/`

`spa-single-page/index.html` is the bundled single-file output of the SPA integration path.

That path is oriented toward host-page integration, where a company page may provide:

- a global `file` variable
- external page header/layout
- host-side file selection UI

`singlepagecode/index.html` is closer to the standalone `viewer_html` viewer flow:

- it contains the viewer directly
- it uses the `?file=` deep-link style contract
- it does not act like the host-integration page described in `spa/`

### Important maintenance note

`singlepagecode/index.html` should be treated as a delivery artifact.

That means:

- the main implementation logic should be maintained in source folders first
- bundled single-file outputs should be refreshed after source changes
- this file is convenient to deploy, but not ideal as the primary development source

For report writing, it is best to describe `singlepagecode/index.html` as:

```text
a bundled single-file packaging of the viewer implementation
```

---

## 16. How the Full System Works in Practice

This section is useful for a "Working Principle" or "Execution Flow" chapter.

1. Backend starts and exposes `/files` and HDF5 endpoints.
2. Frontend is served as static files.
3. User opens the viewer with a file key.
4. Frontend loads base shell and boot scripts.
5. Frontend validates required DOM IDs and loaded modules.
6. Frontend dispatches open-viewer state for the selected file.
7. Tree root is requested through `/files/<key>/children?path=/`.
8. User selects a node in the tree.
9. Frontend loads metadata and preview data for that node.
10. User can stay in inspect mode or switch to display mode.
11. In display mode, user chooses matrix, line, or heatmap.
12. Full runtime loads additional data from `/data`.
13. If needed, export is generated through `/export/csv` or frontend PNG logic.

---

## 17. Strengths of the Current Implementation

- clean separation between backend and frontend
- no heavy frontend build dependency
- supports large datasets through bounded reads and virtualization
- supports multiple visualization styles
- supports multidimensional slicing
- includes caching on both backend and frontend sides
- includes export features
- includes responsive and fullscreen support
- codebase is already documented by subsystem

---

## 18. Current Boundaries and Practical Constraints

These are not necessarily problems, but they are important report observations.

- backend storage is filesystem-based in the active implementation
- frontend depends on strict script load order
- caches are in-memory only, not distributed
- very large requests are intentionally blocked by route limits
- metadata behavior is tied to inspect mode in the primary `viewer_html` design
- single-page variants are generated outputs, not the main source of truth

---

## 19. Suggested Report Chapter Mapping

If you want to turn this into a formal project report, you can map this file like this:

| Report Chapter | Use from this document |
|---|---|
| Introduction | Sections 1 and 2 |
| System Architecture | Sections 2 and 3 |
| Backend Design | Sections 4, 5, 6, 7 |
| Frontend Design | Sections 8, 9, 10, 11, 12 |
| API Design | Sections 5 and 13 |
| Features Implemented | Section 14 |
| Deployment / Variants | Section 15 |
| Working Flow | Section 16 |
| Discussion / Evaluation | Sections 17 and 18 |

---

## 20. Source of Truth

This report is based on the current implementation and the existing project docs.

Primary source folders:

- `backend/`
- `viewer_html/`

Primary supporting docs:

- `backend/docs/*`
- `viewer_html/docs/*`
- `README.md`

If any document and code disagree, the code is the final source of truth.
