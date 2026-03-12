// Viewer HTML module: Runtime config bootstrap where deployments can inject API_BASE_URL before viewer scripts load.
window.__CONFIG__ = window.__CONFIG__ || {};
// Production deployments can inject API_BASE_URL here without changing source modules.
// In Docker/server environments, a web server pre-processing step can replace this value at startup.
// Must be loaded BEFORE core/config.js which reads window.__CONFIG__.API_BASE_URL.
window.__CONFIG__.API_BASE_URL = window.__CONFIG__.API_BASE_URL || "http://localhost:5000";

