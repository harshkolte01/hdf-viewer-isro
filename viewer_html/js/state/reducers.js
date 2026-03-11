// Viewer HTML module: Composes all action factories into the shared actions API consumed by views and runtimes.
(function (global) {
  "use strict";
  var ns = global.HDFViewer;
  if (!ns) {
    console.error("[HDFViewer] Missing namespace for state/reducers.");
    return;
  }
  var ensurePath = ns.core && ns.core.ensurePath;
  if (typeof ensurePath !== "function") {
    console.error("[HDFViewer] Missing core.ensurePath before loading state/reducers.");
    return;
  }
  var moduleState = ensurePath(ns, "state");
  var utils =
    ns.state && ns.state.reducers && ns.state.reducers.utils
      ? ns.state.reducers.utils
      : null;
  if (!utils) {
    console.error("[HDFViewer] Missing dependency state/reducers/utils for state/reducers.");
    return;
  }
const actions = {};

  // deps bundles the shared store primitives, API methods, and utils so action factories receive them via injection
  const deps = {
    actions,
    getState,
    setState,
    api: {
      getFiles,
      refreshFiles,
      getFileChildren,
      getFileMeta,
      getFilePreview,
    },
    utils,
  };

  // Merge all action factory outputs into a single `actions` object so callers use one consistent API surface
  Object.assign(
    actions,
    createFileActions(deps),
    createTreeActions(deps),
    createViewActions(deps),
    createDisplayConfigActions(deps),
    createDataActions(deps),
    createCompareActions(deps)
  );
  if (typeof actions !== "undefined") {
    moduleState.actions = actions;
    global.actions = actions;
  }
  if (ns.core && typeof ns.core.registerModule === "function") {
    ns.core.registerModule("state/reducers");
  }
})(typeof window !== "undefined" ? window : globalThis);

