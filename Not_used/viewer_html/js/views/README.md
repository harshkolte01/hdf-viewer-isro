# js/views

The `views/` layer sits between app bootstrap and the component layer. It owns the **viewer shell** — the static outer layout that does not change between dataset selections — and orchestrates per-region content updates.

## Files

### `viewerView.js`
**What it does**: The top-level shell renderer and UI event coordinator. Almost everything the user interacts with goes through this file.

**Responsibilities**:

1. **Shell validation**: calls `domRefs.validate()` on boot to ensure all required IDs exist in the HTML
2. **Region-by-region updates**: instead of replacing the full page, updates specific shell regions:
   - Sidebar tree HTML → updates `#tree-list` + `#tree-status`
   - Topbar breadcrumb + view mode toggle buttons
   - Subbar tabs + action buttons
   - Display pane / inspect pane content via `renderViewerPanel(state)`
   - Status messages: `#display-status`, `#inspect-status`, `#global-status`
3. **Delegated event handling**: a single click listener on the viewer root handles:
   - Back to files button
   - Sidebar toggle / close
   - Fullscreen button
   - View mode segmented buttons (`[data-view-mode]`)
   - Subbar tab buttons (`[data-tab]`)
   - Export menu items (`[data-export-action]`)
   - Line compare controls (remove dataset, toggle enable)
   - Display config axis changes
4. **Export routing**: reads `shell.__exportApi` published by the active runtime and dispatches the correct export method (CSV client-side, CSV server-side, PNG)
5. **Responsive sidebar**: manages `sidebar-collapsed` CSS class on `#viewer-app` based on viewport width and `state.sidebarOpen`

**Key exported functions (also on `window.*`)**:
- `renderViewerView(state, options)` — performs all DOM updates for a given state snapshot
- `bindViewerViewEvents(root, actions)` — attaches the delegated event listener to the viewer root
- `validateViewerDomIds(doc)` — proxied from `domRefs.validate` for use by `app-viewer.js`
- `initViewerViewTemplate()` — async init hook (currently a no-op, reserved for future async template loading)

**Used by**: `app-viewer.js` calls `renderViewerView` and `bindViewerViewEvents` on every state update via the subscribe loop

## How re-renders work

```
[state changes via setState]
  ↓
subscribe listener (queueRender) triggers
  ↓
requestAnimationFrame fires renderApp()
  ↓
renderViewerView(state, { missingFile })
  ↓
  Updates sidebar: renderSidebarTree(state, dom) → dom.treeList.innerHTML = ...
  Updates topbar:  breadcrumb path, active view mode button
  Updates subbar:  tab buttons, action buttons
  Updates panel:   dom.displayPane.innerHTML = renderViewerPanel(state)
  Updates status:  dom.globalStatus / displayStatus / inspectStatus
  ↓
bindViewerViewEvents(root, actions)
  ↓
  bindSidebarTreeEvents    ← wires tree click events to actions.*
  bindViewerPanelEvents    ← wires panel buttons + inits runtimes
```
