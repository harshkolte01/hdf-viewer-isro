# css

All stylesheets for the `viewer_html` frontend. The CSS is split by responsibility so that each concern has a single canonical location. All files use CSS custom properties (variables) defined in `tokens.css`, so changes to the design system only need edits in one place.

## Files

### `tokens.css`
**What it does**: Defines all **design tokens** — the CSS custom properties that every other stylesheet references. Must be loaded **first**.

**Token groups**:
- **Colors**: `--bg-primary`, `--surface`, `--surface-alt`, `--border`, `--text-primary`, `--text-secondary`, `--primary`, `--primary-hover`, `--accent`, plus semantic colors `--success`, `--warning`, `--error`, `--info` each with a `*-bg` variant
- **Spacing scale**: `--spacing-xs` (0.25rem) through `--spacing-2xl` (3rem)
- **Border radius**: `--radius-sm` through `--radius-xl`
- **Shadows**: `--shadow-sm` through `--shadow-xl`
- **Layout**: `--sidebar-width` (280px)
- **Typography**: system font stack applied at root level
- **Breakpoint reference** (comment only): xs=375px, sm=576px, md=768px, lg=1024px

**Used by**: every other CSS file via `var(--token-name)` references

---

### `app.css`
**What it does**: Global base resets, shared layout primitives, and table/list styles used across the app.

**Contains**:
- CSS reset (`margin: 0`, `padding: 0`, `box-sizing: border-box`)
- `body` and `#app-root` base layout
- `.container` max-width wrapper
- Custom scrollbar styling (WebKit)
- `.navbar` sticky header styles
- Home page file-list table styles (`.files-table`, `.file-row`, `.file-actions`)
- Status/notification bar classes (`.panel-status.info`, `.panel-status.error`)
- Ghost button and segmented control button base styles

**Used by**: loaded for all pages; primary styles for the home/file-list route

---

### `home.css`
**What it does**: A minimal shim file. Home-page-specific layout originally lived here; it was consolidated into `app.css`. This file is kept as an explicit load-order entry point and may hold home-specific overrides in the future.

---

### `viewer.css`
**What it does**: Layout for the entire viewer shell: sidebar, topbar, subbar, main content area, and responsive collapse behaviour.

**Key sections**:
- `.viewer-page` — CSS grid defining sidebar + main two-column layout
- `.viewer-sidebar` — fixed-width left panel, collapsible
- `.sidebar-collapsed` modifier — hides the sidebar by translating it off-screen on mobile
- `.sidebar-backdrop` — overlay shown on mobile when sidebar is open
- `.viewer-topbar` — sticky top bar with breadcrumb, view mode toggle, fullscreen, back button
- `.viewer-subbar` — secondary bar holding display tab buttons and action buttons
- `.viewer-main` — scrollable content area
- Tree node styles: `.tree-root`, `.tree-node`, `.tree-item`, `.tree-expander`, node type badges
- Responsive breakpoints: sidebar auto-collapses at 1024px and below

**Used by**: the viewer route (when `state.route === 'viewer'`)

---

### `viewer-panel.css`
**What it does**: Styles for the display/inspect panel content area. Covers all three runtime views and their fullscreen states.

**Key sections**:
- `.viewer-panel` — flex container for display and inspect panes
- `.inspect-section` — metadata table and attribute list styles
- `.display-section` — data preview sections (table, line SVG, heatmap thumbnail)
- `.preview-table-wrapper` / `.preview-table` — table preview with fixed header
- `.line-container` / `.line-svg-wrap` — SVG line chart layout and toolbar
- `.heatmap-container` / `.heatmap-canvas-wrap` — canvas heatmap layout
- `.matrix-container` / `.matrix-table` — virtualized matrix grid layout
- `.panel-canvas-line-fixed` — full-viewport layout for expanded line chart
- `.preview-sidebar` — collapsible dimension controls sidebar
- Fullscreen helpers: `.is-display`, `.is-inspect`, `.panel-state` loading/empty placeholders

**Used by**: loaded globally; applies to inspect and display pane content

---

### `components/` folder
See [components/README.md](components/README.md) for the per-file breakdown of `tree.css`, `table.css`, and `charts.css`.

## CSS load order in index.html

```html
tokens.css       ← design tokens (must be first)
app.css          ← base resets and shared layout
home.css         ← home-page shim
viewer.css       ← viewer shell layout
viewer-panel.css ← panel content styles
components/tree.css
components/table.css
components/charts.css
```
