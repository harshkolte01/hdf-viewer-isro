# js/state

The `state/` layer is the single source of truth for all viewer UI state. It follows a simple **centralised mutable store** pattern: one state object, plain update functions, and a subscriber list that drives re-renders.

## Files

### `store.js`
**What it does**: Defines the single global `state` object and three functions to interact with it.

**State shape (key fields)**:
| Field | Type | Purpose |
|-------|------|---------|
| `route` | `'home'\|'viewer'` | Current page |
| `selectedFile` | `string\|null` | Active file object key |
| `selectedPath` | `string` | Active dataset/group path in HDF5 tree |
| `selectedNodeType` | `'group'\|'dataset'` | Type of the selected tree node |
| `expandedPaths` | `Set<string>` | Tree nodes currently expanded |
| `childrenCache` | `Map<string, TreeNode[]>` | Lazily loaded children per path |
| `viewMode` | `'inspect'\|'display'` | Which panel tab is active |
| `displayTab` | `'line'\|'heatmap'\|'matrix'` | Active sub-tab in display mode |
| `metadata` | `object\|null` | Normalised metadata from `/meta` endpoint |
| `preview` | `object\|null` | Normalised preview from `/preview` endpoint |
| `displayConfig` | `object` | Applied + staged display dims + fixed indices |
| `lineCompareItems` | `array` | Datasets added to the line compare overlay |
| `sidebarOpen` | `boolean` | Whether the sidebar is expanded |

**Key exports (also on `window.*`)**:
- `getState()` — returns the current state object (by reference)
- `setState(updaterOrPatch)` — merges a patch or the result of an updater function into state, then notifies all subscribers
- `subscribe(listener)` — adds a listener called after every `setState`; returns an unsubscribe function

**Used by**: All action modules call `getState`/`setState`. `app-viewer.js` calls `subscribe(queueRender)` to drive re-renders.

---

### `reducers.js`
**What it does**: Imports all six action factory modules and composes them into a single `actions` object that is exported globally as `window.actions`.

**How it works**:
```js
const actions = {};
Object.assign(actions,
  createFileActions(deps),    // actions.loadFiles, actions.openViewer, ...
  createTreeActions(deps),    // actions.selectNode, actions.expandPath, ...
  createViewActions(deps),    // actions.setViewMode, actions.toggleSidebar, ...
  createDisplayConfigActions(deps), // actions.setDisplayAxis, actions.applyDisplayConfig, ...
  createDataActions(deps),    // actions.loadMetadata, actions.loadPreview, ...
  createCompareActions(deps)  // actions.addToCompare, actions.removeFromCompare, ...
);
```

**Used by**: `app-viewer.js` and `views/viewerView.js` both read from `actions.*`

---

### `reducers/` folder
See [reducers/README.md](reducers/README.md) for details on each action file.

## Data flow example

```
User clicks a tree node
  ↓ bindViewerViewEvents dispatches actions.selectNode(path)
  ↓ selectNode calls setState({ selectedPath, selectedNodeType, ... })
  ↓ setState fans out to all listeners
  ↓ queueRender() is called (registered via subscribe in app-viewer.js)
  ↓ requestAnimationFrame fires renderApp()
  ↓ renderViewerView(getState(), ...) updates the DOM
```
