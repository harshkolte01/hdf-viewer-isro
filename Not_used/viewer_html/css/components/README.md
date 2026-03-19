# css/components

Component-scoped stylesheet files. Each one styles a specific reusable UI component that is shared between the file-list view and the viewer.

## Files

### `tree.css`
**What it does**: Styles for the HDF5 group/dataset tree displayed in the viewer sidebar.

**Note**: The canonical tree visual rules (expand chevrons, node badges, `dataset` vs `group` type colouring, hover/active states) are **centralised in `viewer.css`**. This file contains the tree-specific structural rules and any overrides that are scoped to the component. Kept as a separate load entry so the component boundary is explicit in the HTML `<link>` load order.

**Used by**: the sidebar tree rendered by `js/components/sidebarTree.js` in the viewer

---

### `table.css`
**What it does**: Styles for file-list table rows, action columns, and status badges on the home/files page.

**Contains**:
- `.file-row` hover and selected state
- `.file-action-btn` icon button styles (open, copy link)
- `.file-type-badge` (file vs folder)
- Responsive table column collapsing on small screens

**Used by**: the home page file list rendered server-side in `backend/templates/index.html` and optionally by `viewer_html/index.html` when the home route is active

---

### `charts.css`
**What it does**: Minimal shared chart surface styles. Provides baseline sizing and border rules for the SVG and canvas chart containers that are consistent across line, heatmap, and future chart types.

**Contains**:
- `.chart-surface` shared container sizing
- Axis label typography
- Chart toolbar layout (zoom/pan/reset button row)

**Used by**: line chart and heatmap containers in `viewer-panel.css` which extend these base rules
