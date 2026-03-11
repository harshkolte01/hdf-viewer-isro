# HDF Viewer ISRO

Current implemented application consists of:
- `backend/` - Flask API for browsing files and reading HDF5 data
- `viewer_html/` - static plain-JavaScript frontend for tree, metadata, matrix, line, and heatmap views

This root README documents only the active implementation path above.

## System Overview

```text
viewer_html (browser UI)
  -> calls HTTP API
backend (Flask)
  -> reads HDF5 files from filesystem storage
```

## Backend

Location:
- `backend/`

Main responsibility:
- expose APIs for file listing, HDF5 tree navigation, metadata, preview data, bounded data windows, and CSV export

Main entry files:
- `backend/app.py` - Flask app bootstrap
- `backend/wsgi.py` - production WSGI entry
- `backend/src/routes/files.py` - file listing and refresh routes
- `backend/src/routes/hdf5.py` - children, metadata, preview, data, export routes
- `backend/src/readers/hdf5_reader.py` - HDF5 traversal and slicing
- `backend/src/storage/filesystem_client.py` - filesystem storage access

Implemented backend capabilities:
- list available files/folders
- expand HDF5 groups lazily
- read group/dataset metadata
- generate preview payloads for frontend display
- serve bounded matrix, line, and heatmap data
- stream CSV exports
- cache repeated requests in memory

Run locally:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Default backend URL:
- `http://localhost:5000`

## Viewer HTML

Location:
- `viewer_html/`

Main responsibility:
- render the browser UI for HDF5 exploration using only static HTML, CSS, and plain JavaScript

Main entry files:
- `viewer_html/index.html` - frontend shell and script load order
- `viewer_html/config/runtime-config.js` - backend API base URL
- `viewer_html/js/app-viewer.js` - app bootstrap and deep-link startup
- `viewer_html/js/views/viewerView.js` - shell rendering and top-level event wiring
- `viewer_html/js/components/sidebarTree.js` - tree rendering and tree event handling
- `viewer_html/js/components/viewerPanel/render/sections.js` - metadata and display section rendering
- `viewer_html/js/components/viewerPanel/runtime/*.js` - matrix, line, and heatmap runtimes

Implemented frontend capabilities:
- open a file using `?file=<object-key>`
- lazy tree navigation
- inspect mode for metadata
- display mode for:
  - matrix preview/full view
  - line preview/full view
  - heatmap preview/full view
- dimension controls for multidimensional datasets
- line comparison mode
- CSV/PNG export where supported

Run locally:

```bash
cd viewer_html
python -m http.server 3000
```

Open:

```text
http://localhost:3000/?file=<url-encoded-object-key>
```

Frontend config:
- backend URL is set in `viewer_html/config/runtime-config.js`
- default value is `http://localhost:5000`

## Current Folder Focus

If you are working on API/data behavior, start in:
- `backend/`

If you are working on UI behavior, tree, metadata, matrix, line, or heatmap rendering, start in:
- `viewer_html/`

## Documentation

Backend docs:
- `backend/docs/README.md`

Frontend docs:
- `viewer_html/docs/README.md`
