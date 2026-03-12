# js/components

The `components/` layer contains the two main UI components of the viewer: the **sidebar tree** (file/group navigation) and the **viewer panel** (inspect and display content area).

## Files

### `sidebarTree.js`
**What it does**: Renders the entire HDF5 group/dataset tree inside the left sidebar and delegates all tree interaction events.

**Rendering**: Generates `<ul>/<li>` HTML from the tree state (expanded paths, children cache, loading/error state). Each tree node carries `data-path`, `data-type`, `data-compare-add` attributes that event delegation uses to identify actions.

**Event delegation**: A single click listener on the tree root handles:
- **Group toggle** — expand or collapse a group node (`actions.expandPath` / `actions.collapsePath`)
- **Dataset select** — selecting a dataset node (`actions.selectNode`)
- **Retry** — retrying a failed child-load
- **Add to compare** — adding a numeric dataset to the line compare overlay (`actions.addToCompare`)

**Key internal helpers**:
- `lookupDatasetFromCache(state, path)` — scans the children cache to find dtype/shape of a dataset path (needed to validate compare eligibility)
- `isNumericDtype(dtype)` — returns `true` for float/int/uint/bool dtypes that can be compared on a line chart

**Used by**: `views/viewerView.js` calls `renderSidebarTree(state, dom)` and `bindSidebarTreeEvents(root, actions)` after each render

---

### `viewerPanel.js`
**What it does**: A thin **facade** that keeps a stable public API (`renderViewerPanel`, `bindViewerPanelEvents`) while delegating the actual work to the `viewerPanel/render.js` and `viewerPanel/runtime.js` submodules.

**Why a facade**: The inner render and runtime submodules load after this file in `index.html`. The facade captures the initial `window.renderViewerPanel` reference at load time. When the submodules override those globals, the facade is already holding a closured reference, ensuring smooth delegation regardless of the exact override sequence.

**Used by**: `views/viewerView.js` calls `renderViewerPanel(state)` and `bindViewerPanelEvents(root, actions)`

---

### `viewerPanel/` folder
See [viewerPanel/README.md](viewerPanel/README.md) for details on all submodules.

## Event flow for the viewer panel

```
User clicks "Enable full matrix view"
  ↓
components/sidebarTree.js OR views/viewerView.js
  ↓ dispatches actions.enableMatrixFullView()
  ↓ setState({ matrixFullEnabled: true })
  ↓ subscribe triggers renderApp()
  ↓ renderViewerPanel(state) re-renders panel HTML with matrix shell node
  ↓ bindViewerPanelEvents(root, actions)
    ↓ bindEvents.js finds [data-matrix-shell] node
    ↓ initializeMatrixRuntime(shell) attaches scroll/fetch/render loop
```
