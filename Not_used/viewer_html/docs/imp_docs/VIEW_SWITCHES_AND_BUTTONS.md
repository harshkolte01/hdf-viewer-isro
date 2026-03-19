# View Switches And Buttons

Reference for the shell-level buttons in `viewer_html/`.

## Purpose

These controls switch between the major areas of the viewer and control shell behavior:
- sidebar open/close
- breadcrumb navigation
- inspect vs display mode
- back to files
- fullscreen

Display-specific tab buttons are documented in:
- `viewer_html/docs/DISPLAY_PANEL.md`

## Main Shell IDs

Seeded in:
- `viewer_html/index.html`
- `viewer_html/index.php`

Validated in:
- `viewer_html/js/core/domRefs.js`

| ID | Purpose |
|---|---|
| `viewer-app` | main viewer root |
| `viewer-topbar` | top shell toolbar |
| `breadcrumb-path` | breadcrumb container |
| `breadcrumb-file` | file breadcrumb button |
| `sidebar-toggle-btn` | open sidebar on mobile/collapsed layout |
| `sidebar-close-btn` | close sidebar |
| `viewer-back-btn` | return to files/home route |
| `viewer-fullscreen-btn` | fullscreen toggle |
| `sidebar-backdrop` | mobile overlay close target |
| `global-status` | global status line |

## Generated Button Hooks

Rendered by:
- `viewer_html/js/views/viewerView.js`

| Selector | Meaning | Action |
|---|---|---|
| `[data-view-mode="display"]` | switch to display/output mode | `setViewMode("display")` |
| `[data-view-mode="inspect"]` | switch to metadata/inspect mode | `setViewMode("inspect")` |
| `[data-breadcrumb-path]` | navigate to file root or ancestor path | `onBreadcrumbSelect()` |

## Files Responsible

| File | Role |
|---|---|
| `viewer_html/js/views/viewerView.js` | topbar render + shell event delegation |
| `viewer_html/js/state/reducers/viewActions.js` | sidebar, mode, and display tab actions |
| `viewer_html/js/state/reducers/treeActions.js` | breadcrumb navigation action |
| `viewer_html/js/app-viewer.js` | boot lifecycle, media-query sidebar behavior, deep-link open |
| `viewer_html/js/core/domRefs.js` | shell DOM ID contract |
| `viewer_html/index.html` | default shell HTML |
| `viewer_html/index.php` | alternate PHP shell layout |

## Event Ownership

`bindViewerViewEvents()` in `viewerView.js` handles:
- `#sidebar-toggle-btn`
- `#sidebar-close-btn`
- `#viewer-back-btn`
- `#viewer-fullscreen-btn`
- `[data-view-mode]`
- `[data-breadcrumb-path]`
- display toolbar button hooks
- export menu open/close behavior

## When To Change What

Change `index.html` or `index.php` when:
- a shell button moves
- an outer container ID changes
- the page layout changes

Change `js/core/domRefs.js` when:
- an ID changes
- a new shell-level required ID is introduced

Change `js/views/viewerView.js` when:
- the topbar HTML changes
- the button wiring changes
- export behavior changes

Change `js/state/reducers/viewActions.js` when:
- button clicks should produce different state changes
- view switching behavior should change
