# Display Panel

Reference for the display/output area in `viewer_html/`.

## Purpose

The display panel shows preview and full-data views for:
- matrix
- line graph
- heatmap

It also contains:
- display tab buttons
- export controls
- notation/grid/aspect/colormap controls
- dimension controls
- full-view load buttons
- line comparison controls

## Main Shell IDs

Shell seed files:
- `viewer_html/index.html`
- `viewer_html/index.php`

Validation source:
- `viewer_html/js/core/domRefs.js`

| ID | Purpose | Main file using it |
|---|---|---|
| `viewer-subbar` | display toolbar wrapper | `js/views/viewerView.js` |
| `subbar-tabs` | tab buttons host | `js/views/viewerView.js` |
| `subbar-actions` | tab-specific controls host | `js/views/viewerView.js` |
| `viewer-panel` | shared content area | `js/views/viewerView.js` |
| `display-pane` | output panel mount point | `js/views/viewerView.js` |
| `display-status` | output status area | `js/views/viewerView.js` |

## Top Display Switch Buttons

Rendered by:
- `viewer_html/js/views/viewerView.js`

| Selector | Meaning | Action |
|---|---|---|
| `[data-display-tab="table"]` | switch to matrix view | `setDisplayTab("table")` |
| `[data-display-tab="line"]` | switch to line graph | `setDisplayTab("line")` |
| `[data-display-tab="heatmap"]` | switch to heatmap | `setDisplayTab("heatmap")` |
| `[data-notation]` | matrix number format | `setNotation()` |
| `[data-line-grid-toggle]` | line grid on/off | `toggleLineGrid()` |
| `[data-line-aspect]` | line / point / both | `setLineAspect()` |
| `[data-heatmap-grid-toggle]` | heatmap grid on/off | `toggleHeatmapGrid()` |
| `[data-heatmap-colormap]` | change heatmap palette | `setHeatmapColormap()` |
| `[data-export-toggle]` | open export menu | handled in `viewerView.js` |
| `[data-export-action]` | run export option | handled in `viewerView.js` |

## Display Content Files

| File | Role |
|---|---|
| `viewer_html/js/components/viewerPanel/render/sections.js` | main display renderer and section selection |
| `viewer_html/js/components/viewerPanel/render/previews.js` | preview renderers for matrix, line, heatmap |
| `viewer_html/js/components/viewerPanel/render/dimensionControls.js` | dimension selector sidebar |
| `viewer_html/js/components/viewerPanel/render/config.js` | runtime config derived from preview + state |
| `viewer_html/js/components/viewerPanel/runtime/bindEvents.js` | event delegation for display internals |
| `viewer_html/js/components/viewerPanel/runtime/matrixRuntime.js` | full matrix runtime |
| `viewer_html/js/components/viewerPanel/runtime/lineRuntime.js` | full line runtime |
| `viewer_html/js/components/viewerPanel/runtime/heatmapRuntime.js` | full heatmap runtime |
| `viewer_html/js/state/reducers/viewActions.js` | tab and visual settings actions |
| `viewer_html/js/state/reducers/displayConfigActions.js` | display dimensions and fixed indices |
| `viewer_html/js/state/reducers/dataActions.js` | preview data fetch logic |
| `viewer_html/js/api/hdf5Service.js` | preview and full-data backend calls |

## Section-Specific Buttons

Rendered mainly by:
- `viewer_html/js/components/viewerPanel/render/sections.js`
- `viewer_html/js/components/viewerPanel/render/dimensionControls.js`

| Selector | Meaning |
|---|---|
| `[data-matrix-enable]` | load full matrix runtime |
| `[data-line-enable]` | load full line runtime |
| `[data-heatmap-enable]` | load full heatmap runtime |
| `[data-line-compare-toggle]` | enable/disable compare mode |
| `[data-line-compare-clear]` | clear compare selection |
| `[data-line-compare-remove]` | remove one compare item |
| `[data-line-compare-dismiss]` | dismiss compare status |
| `[data-axis-change]` | quick X/Y axis switching for 2D datasets |
| `[data-display-dim-select]` | choose staged display dims |
| `[data-fixed-index-range]` | staged hidden-dimension slider |
| `[data-fixed-index-number]` | staged hidden-dimension numeric input |
| `[data-dim-apply]` | commit staged dims/fixed indices |
| `[data-dim-reset]` | reset staged config from preview |
| `[data-sidebar-toggle]` | collapse preview dimension sidebar on smaller screens |

## Runtime Shell Hooks

These are emitted into the output HTML when full runtimes are active.

### Matrix

| Selector | Purpose |
|---|---|
| `[data-matrix-shell]` | matrix runtime root |
| `[data-matrix-table]` | scrollable matrix table host |
| `[data-matrix-header-cells]` | sticky column header host |
| `[data-matrix-index]` | sticky row index host |
| `[data-matrix-cells]` | matrix cell host |
| `[data-matrix-status]` | matrix section status output |

### Line

| Selector | Purpose |
|---|---|
| `[data-line-shell]` | line runtime root |
| `[data-line-canvas]` | interactive line canvas host |
| `[data-line-svg]` | SVG plotting surface |
| `[data-line-hover]` | hover tooltip |
| `[data-line-status]` | line section status output |
| `[data-line-pan-toggle]` | pan mode |
| `[data-line-zoom-click-toggle]` | click-zoom mode |
| `[data-line-zoom-in]` | zoom in |
| `[data-line-zoom-out]` | zoom out |
| `[data-line-reset-view]` | reset zoom |
| `[data-line-step-prev]` | previous line slice |
| `[data-line-step-next]` | next line slice |
| `[data-line-jump-start]` | first line slice |
| `[data-line-jump-end]` | last line slice |
| `[data-line-fullscreen-toggle]` | fullscreen chart |

### Heatmap

| Selector | Purpose |
|---|---|
| `[data-heatmap-shell]` | heatmap runtime root |
| `[data-heatmap-canvas]` | interactive heatmap canvas host |
| `[data-heatmap-surface]` | `<canvas>` plotting surface |
| `[data-heatmap-hover]` | hover tooltip |
| `[data-heatmap-status]` | heatmap section status output |
| `[data-heatmap-pan-toggle]` | pan mode |
| `[data-heatmap-plot-toggle]` | plot mode |
| `[data-heatmap-zoom-in]` | zoom in |
| `[data-heatmap-zoom-out]` | zoom out |
| `[data-heatmap-reset-view]` | reset zoom |
| `[data-heatmap-fullscreen-toggle]` | fullscreen chart |
| `[data-heatmap-plot-axis]` | row/column linked plot axis |
| `[data-heatmap-plot-close]` | close linked line plot |
| `[data-heatmap-linked-shell-host]` | linked line-plot mount area |

## Render Flow

1. `viewerView.js` renders the subbar into `#viewer-subbar`.
2. `viewerView.js` renders the current display panel into `#display-pane`.
3. `bindViewerViewEvents()` handles top display toolbar clicks.
4. `bindViewerPanelEvents()` handles panel-internal controls.
5. Runtime files mount onto `[data-matrix-shell]`, `[data-line-shell]`, or `[data-heatmap-shell]`.
