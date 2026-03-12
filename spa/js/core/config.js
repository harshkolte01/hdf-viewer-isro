// Viewer HTML module: Builds normalized API endpoint helpers and exposes runtime config for all viewer modules.
(function (global) {
  "use strict";

  var ns = global.HDFViewer;
  if (!ns) {
    console.error("[HDFViewer] Missing namespace for core/config.");
    return;
  }

  var DEFAULT_API_BASE_URL = "http://localhost:5000";

  // Read runtime config injected by config/runtime-config.js before this script loaded
  var runtimeConfig =
    global.__CONFIG__ && typeof global.__CONFIG__ === "object" ? global.__CONFIG__ : {};

  // Strip trailing slashes from the base URL to make URL concatenation consistent
  function normalizeBaseUrl(value) {
    return String(value || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
  }

  // Encodes each path segment of an HDF5 object key separately, preserving internal `/` separators
  function encodeObjectKeyForPath(key) {
    return String(key || "")
      .split("/")
      .map(function (segment) {
        return encodeURIComponent(segment);
      })
      .join("/");
  }

  // Appends a query param, supporting array values (appends once per element)
  function appendSearchParams(searchParams, key, value) {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      for (var i = 0; i < value.length; i += 1) {
        if (value[i] !== null && value[i] !== undefined) {
          searchParams.append(key, String(value[i]));
        }
      }
      return;
    }

    searchParams.append(key, String(value));
  }

  // Builds a complete request URL from an endpoint path and optional query params object
  function buildApiUrl(endpoint, params) {
    var endpointValue = endpoint || "";
    var normalizedEndpoint =
      endpointValue.charAt(0) === "/" ? endpointValue : "/" + endpointValue;

    var url = new URL(normalizedEndpoint, API_BASE_URL + "/");
    var queryParams = params && typeof params === "object" ? params : {};

    Object.keys(queryParams).forEach(function (paramKey) {
      appendSearchParams(url.searchParams, paramKey, queryParams[paramKey]);
    });

    return url.toString();
  }

  // Resolve final API base URL from runtime config or fall back to localhost default
  var API_BASE_URL = normalizeBaseUrl(runtimeConfig.API_BASE_URL);

  // Frozen map of all backend endpoint path definitions.
  // String values are static paths; functions accept an object key and return the encoded path.
  var API_ENDPOINTS = Object.freeze({
    FILES: "/files",
    FILES_REFRESH: "/files/refresh",
    FILE_CHILDREN: function (key) {
      return "/files/" + encodeObjectKeyForPath(key) + "/children";
    },
    FILE_META: function (key) {
      return "/files/" + encodeObjectKeyForPath(key) + "/meta";
    },
    FILE_PREVIEW: function (key) {
      return "/files/" + encodeObjectKeyForPath(key) + "/preview";
    },
    FILE_DATA: function (key) {
      return "/files/" + encodeObjectKeyForPath(key) + "/data";
    },
    FILE_EXPORT_CSV: function (key) {
      return "/files/" + encodeObjectKeyForPath(key) + "/export/csv";
    },
  });

  var APP_CONFIG = Object.freeze({
    API_BASE_URL: API_BASE_URL,
  });

  // Bundle everything into a frozen config object for safe consumption by other modules
  var configApi = Object.freeze({
    DEFAULT_API_BASE_URL: DEFAULT_API_BASE_URL,
    runtimeConfig: runtimeConfig,
    API_BASE_URL: API_BASE_URL,
    API_ENDPOINTS: API_ENDPOINTS,
    APP_CONFIG: APP_CONFIG,
    normalizeBaseUrl: normalizeBaseUrl,
    encodeObjectKeyForPath: encodeObjectKeyForPath,
    buildApiUrl: buildApiUrl,
  });

  // Publish under namespace and as shorthand globals for cross-module access
  ns.core.config = configApi;
  ns.core.API_BASE_URL = API_BASE_URL;
  ns.core.API_ENDPOINTS = API_ENDPOINTS;
  ns.core.APP_CONFIG = APP_CONFIG;
  ns.core.normalizeBaseUrl = normalizeBaseUrl;
  ns.core.encodeObjectKeyForPath = encodeObjectKeyForPath;
  ns.core.buildApiUrl = buildApiUrl;

  ns.api = ns.api || {};
  ns.api.config = configApi;

  // Legacy symbol bridge for Phase 3 converted plain-script modules.
  global.DEFAULT_API_BASE_URL = DEFAULT_API_BASE_URL;
  global.API_BASE_URL = API_BASE_URL;
  global.API_ENDPOINTS = API_ENDPOINTS;
  global.APP_CONFIG = APP_CONFIG;
  global.normalizeBaseUrl = normalizeBaseUrl;
  global.encodeObjectKeyForPath = encodeObjectKeyForPath;
  global.buildApiUrl = buildApiUrl;

  if (typeof ns.core.registerModule === "function") {
    ns.core.registerModule("core/config");
  }
})(typeof window !== "undefined" ? window : globalThis);

