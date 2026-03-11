# config

Runtime configuration bootstrap for `viewer_html`. This folder holds the **single file that must execute before any viewer JavaScript module runs**.

## Files

### `runtime-config.js`
**What it does**: Guarantees that `window.__CONFIG__` exists and contains a default `API_BASE_URL`. This lets `js/core/config.js` safely read `window.__CONFIG__.API_BASE_URL` without null-checking.

**Default value**: `http://localhost:5000` (points to the backend Flask app running locally)

**How to change the API base URL for a deployment**: Edit this file or inject the value from the server-side before the page loads:
```js
// In runtime-config.js (or a server-rendered script tag above it):
window.__CONFIG__.API_BASE_URL = "https://your-api-server.example.com";
```

**Load order**: This file is the **very first `<script>` tag** in `index.html`, before all `js/` modules. If it runs after `js/core/config.js`, `API_BASE_URL` will default to `http://localhost:5000`.

**Used by**: `js/core/config.js` reads `window.__CONFIG__.API_BASE_URL` to build all API endpoint URLs

## Deployment pattern

In a production deployment where the frontend is served from a CDN or static host:
1. Generate `runtime-config.js` at deploy time with the correct `API_BASE_URL`
2. Or inject a `<script>` block above it in the HTML template that sets `window.__CONFIG__` before this file loads
3. All other source files remain unchanged — this is the **only file** deployments need to modify
