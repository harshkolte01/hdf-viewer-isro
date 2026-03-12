// Viewer HTML module: Wraps fetch with abort linking, in-flight cancellation keys, and normalized API errors.
(function (global) {
  "use strict";
  var ns = global.HDFViewer;
  if (!ns) {
    console.error("[HDFViewer] Missing namespace for api/client.");
    return;
  }
  var ensurePath = ns.core && ns.core.ensurePath;
  if (typeof ensurePath !== "function") {
    console.error("[HDFViewer] Missing core.ensurePath before loading api/client.");
    return;
  }
  var moduleState = ensurePath(ns, "api.client");

// Tracks currently running requests by cancel key; used to abort previous requests when a new one supersedes them
const inFlightControllers = new Map();

// Structured error thrown for all failed API calls — includes HTTP status, error code, and request context
class ApiError extends Error {
  constructor({
    message,
    status = 0,
    code = "REQUEST_FAILED",
    details = null,
    url = "",
    method = "GET",
    isAbort = false,
  }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
    this.method = method;
    this.isAbort = isAbort;
  }
}

// Serialises a params object into a URL query string (supports array values by appending multiple times)
function toQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry !== null && entry !== undefined) {
          searchParams.append(key, String(entry));
        }
      });
      return;
    }

    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

// Combines the base URL, endpoint path, and query params into a complete request URL
function buildRequestUrl(endpoint, params = {}) {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${normalizedEndpoint}${toQueryString(params)}`;
}

// Creates a new AbortController and mirrors abort events from an optional external signal.
// If the external signal is already aborted the new controller aborts immediately.
function createLinkedController(externalSignal) {
  const controller = new AbortController();

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort(externalSignal.reason || "external-abort");
    } else {
      externalSignal.addEventListener(
        "abort",
        () => controller.abort(externalSignal.reason || "external-abort"),
        { once: true }
      );
    }
  }

  return controller;
}

// Reads the response body as JSON or plain text based on Content-Type header
async function parseResponsePayload(response) {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (isJson) {
    try {
      return await response.json();
    } catch (_error) {
      return null;
    }
  }

  try {
    return await response.text();
  } catch (_error) {
    return null;
  }
}

// Extracts the most useful error message from the response payload and wraps it in ApiError
function createErrorFromResponse({ response, payload, url, method }) {
  const messageFromPayload =
    payload && typeof payload === "object"
      ? payload.error || payload.message || null
      : null;

  return new ApiError({
    message: messageFromPayload || `HTTP ${response.status}`,
    status: response.status,
    code: "HTTP_ERROR",
    details: payload,
    url,
    method,
  });
}

// Registers a new in-flight controller for the given cancel key.
// If cancelPrevious is true, the previous in-flight request for this key is aborted first.
function registerInFlight(cancelKey, controller, cancelPrevious = false) {
  if (!cancelKey) {
    return;
  }

  if (cancelPrevious && inFlightControllers.has(cancelKey)) {
    const previous = inFlightControllers.get(cancelKey);
    previous.abort("superseded");
  }

  inFlightControllers.set(cancelKey, controller);
}

// Removes the controller from the in-flight map once a request completes or errors
function clearInFlight(cancelKey, controller) {
  if (!cancelKey) {
    return;
  }

  const current = inFlightControllers.get(cancelKey);
  if (current === controller) {
    inFlightControllers.delete(cancelKey);
  }
}

// Aborts any currently in-flight request registered under cancelKey
function cancelPendingRequest(cancelKey, reason = "cancelled") {
  const controller = inFlightControllers.get(cancelKey);
  if (!controller) {
    return false;
  }

  controller.abort(reason);
  inFlightControllers.delete(cancelKey);
  return true;
}

// Returns a plain { controller, signal, cancel } object for callers that need to manage a request lifecycle externally
function createRequestController() {
  const controller = new AbortController();
  return {
    controller,
    signal: controller.signal,
    cancel: (reason = "cancelled") => controller.abort(reason),
  };
}

// Core fetch wrapper: builds URL, attaches cancel controller, executes fetch, parses response,
// throws structured ApiError on failure, and normalises network/abort errors.
async function apiRequest(endpoint, options = {}) {
  const {
    method = "GET",
    params = {},
    body,
    headers = {},
    signal,
    cancelKey,
    cancelPrevious = false,
  } = options;

  const url = buildRequestUrl(endpoint, params);
  const controller = createLinkedController(signal);

  // Register this request in the in-flight map so it can be cancelled by key
  registerInFlight(cancelKey, controller, cancelPrevious);

  try {
    const hasBody = body !== undefined && body !== null;
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      body: hasBody ? JSON.stringify(body) : undefined,
      headers: {
        Accept: "application/json",
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
    });

    const payload = await parseResponsePayload(response);

    // Throw structured error for any non-2xx HTTP status
    if (!response.ok) {
      throw createErrorFromResponse({ response, payload, url, method });
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Convert browser AbortError into a structured ApiError with isAbort=true so callers can distinguish it
    if (error?.name === "AbortError") {
      throw new ApiError({
        message: "Request aborted",
        status: 0,
        code: "ABORTED",
        details: null,
        url,
        method,
        isAbort: true,
      });
    }

    // Wrap unexpected network errors (e.g. no connection, DNS failure)
    throw new ApiError({
      message: error?.message || "Network error",
      status: 0,
      code: "NETWORK_ERROR",
      details: null,
      url,
      method,
    });
  } finally {
    // Always remove from in-flight map once the request settles
    clearInFlight(cancelKey, controller);
  }
}

// Public API client: thin wrappers around apiRequest for GET and POST verbs
const apiClient = {
  get(endpoint, params = {}, options = {}) {
    return apiRequest(endpoint, { ...options, method: "GET", params });
  },

  post(endpoint, body = null, params = {}, options = {}) {
    return apiRequest(endpoint, { ...options, method: "POST", params, body });
  },
};
  if (typeof ApiError !== "undefined") {
    moduleState.ApiError = ApiError;
    global.ApiError = ApiError;
  }
  if (typeof cancelPendingRequest !== "undefined") {
    moduleState.cancelPendingRequest = cancelPendingRequest;
    global.cancelPendingRequest = cancelPendingRequest;
  }
  if (typeof createRequestController !== "undefined") {
    moduleState.createRequestController = createRequestController;
    global.createRequestController = createRequestController;
  }
  if (typeof apiRequest !== "undefined") {
    moduleState.apiRequest = apiRequest;
    global.apiRequest = apiRequest;
  }
  if (typeof apiClient !== "undefined") {
    moduleState.apiClient = apiClient;
    global.apiClient = apiClient;
  }
  if (ns.core && typeof ns.core.registerModule === "function") {
    ns.core.registerModule("api/client");
  }
})(typeof window !== "undefined" ? window : globalThis);
