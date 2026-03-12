# Metadata Panel

Reference for the inspect/metadata panel in `viewer_html/`.

## Purpose

The metadata panel shows details for the currently selected tree item.

It renders:
- basic identity fields
- type and shape information
- chunking/compression info
- raw JSON response

## Main Shell IDs

Shell seed files:
- `viewer_html/index.html`
- `viewer_html/index.php`

Validation source:
- `viewer_html/js/core/domRefs.js`

| ID | Purpose | Main file using it |
|---|---|---|
| `inspect-pane` | metadata content mount point | `js/views/viewerView.js` |
| `inspect-status` | metadata status area | `js/views/viewerView.js` |
| `viewer-panel` | shared panel wrapper in default shell | `js/views/viewerView.js` |

## Files Responsible

| File | Role |
|---|---|
| `viewer_html/js/components/viewerPanel/render/sections.js` | `renderInspectContent(state)` builds metadata HTML |
| `viewer_html/js/state/reducers/dataActions.js` | `loadMetadata()` fetches metadata |
| `viewer_html/js/state/reducers/treeActions.js` | tree selection decides when metadata should load |
| `viewer_html/js/state/reducers/viewActions.js` | `setViewMode("inspect")` triggers metadata load |
| `viewer_html/js/api/hdf5Service.js` | backend call `getFileMeta()` |
| `viewer_html/js/views/viewerView.js` | injects metadata HTML into `#inspect-pane` and updates `#inspect-status` |
| `viewer_html/css/viewer-panel.css` | metadata styles like `.metadata-simple`, `.info-row`, `.json-view` |

## Metadata Render Cases

Handled in `renderInspectContent(state)`:
- no selection
- loading metadata
- metadata error
- no metadata response
- populated metadata view

## Data Dependency

Metadata rendering depends on:
- `state.selectedPath`
- `state.selectedNodeType`
- `state.metadata`
- `state.metadataLoading`
- `state.metadataError`

These are managed mostly by:
- `js/state/reducers/treeActions.js`
- `js/state/reducers/dataActions.js`
- `js/state/reducers/viewActions.js`

## Important Limitation

In the current viewer logic, metadata is tied to `inspect` mode.

That means these files control whether metadata is actively loaded and applied:
- `viewer_html/js/state/reducers/treeActions.js`
- `viewer_html/js/state/reducers/dataActions.js`
- `viewer_html/js/state/reducers/viewActions.js`

If you want metadata always visible independently from display mode, these are the files to change first.
