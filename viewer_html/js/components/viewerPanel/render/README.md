# js/components/viewerPanel/render

Pure rendering layer for preview and full-view shell markup.

## What is implemented
- `config.js`: derives runtime config and selection keys from state + preview context.
- `dimensionControls.js`: renders dimension pickers and apply/reset controls.
  - Fixed-index slider markup is intentionally hidden for now via `SHOW_FIXED_INDEX_CONTROLS = false` in `dimensionControls.js`.
  - If this UI needs to come back later, start with `dimensionControls.js`, then check `runtime/bindEvents.js` and `state/reducers/displayConfigActions.js`.
- `previews.js`: generates table preview, SVG line preview, and sampled heatmap preview.
- `sections.js`: renders inspect panel, display panel sections, toolbars, and full runtime shell containers.

## How it is implemented
- Rendering is state-driven and side-effect free.
- Full runtimes are activated by embedding shell nodes with precise `data-*` attributes.
- Preview rendering provides immediate feedback while full runtimes fetch higher-resolution data.
