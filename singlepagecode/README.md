# Singlepagecode

This folder contains a single-file viewer build:

- `singlepagecode/index.html`

## What this file is

`index.html` in this folder is a bundled viewer artifact.

It combines the viewer into one HTML file by inlining:

- CSS
- JavaScript
- runtime config
- shell markup

So this file can be moved or shared more easily than the normal multi-file frontend.

## What is implemented inside it

The file includes the same main viewer capabilities as the standalone viewer flow:

- fixed viewer shell
- HDF5 tree navigation
- inspect mode
- display mode
- matrix view
- line graph view
- heatmap view
- fullscreen and sidebar controls
- CSV and PNG export support where implemented
- deep-link open using `?file=<backend-object-key>`

## How it works

The bundled file still depends on the backend API.

It does not read HDF5 files directly in the browser.

The flow is still:

```text
singlepagecode/index.html
  -> backend API
  -> filesystem storage
  -> HDF5 files
```

## How to open a file

Open the page with:

```text
?file=<backend-object-key>
```

Example:

```text
index.html?file=hdf5/sample.hdf5
```

The value must be the backend-relative file key, not:

- a full Windows path
- a full API URL

## Difference from other frontend folders

### Compared to `viewer_html/`

`viewer_html/` is the main source-oriented frontend.

Use `viewer_html/` when:

- editing features
- debugging code by module
- changing the viewer architecture

Use `singlepagecode/` when:

- you need one deliverable HTML file
- separate CSS/JS files are not convenient

### Compared to `spa/`

`spa/` is for host-page integration.

That version is designed for cases where another page already has:

- its own header
- its own file list UI
- its own selected-file variable

`singlepagecode/index.html` is closer to the standalone viewer flow.

## Important note

Treat `singlepagecode/index.html` as a generated or packaged output.

For long-term maintenance, edit the source-side implementation first, then refresh the single-file artifact.
