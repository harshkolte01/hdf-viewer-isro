<?php
declare(strict_types=1);
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HDF Viewer Company Layout</title>

    <link rel="stylesheet" href="./css/tokens.css" />
    <link rel="stylesheet" href="./css/app.css" />
    <link rel="stylesheet" href="./css/home.css" />
    <link rel="stylesheet" href="./css/viewer.css" />
    <link rel="stylesheet" href="./css/viewer-panel.css" />
    <link rel="stylesheet" href="./css/components/tree.css" />
    <link rel="stylesheet" href="./css/components/table.css" />
    <link rel="stylesheet" href="./css/components/charts.css" />

    <style>
      body {
        min-height: 100vh;
        margin: 0;
        background:
          radial-gradient(circle at top right, rgba(56, 189, 248, 0.12), transparent 28%),
          linear-gradient(180deg, rgba(15, 23, 42, 0.02), rgba(15, 23, 42, 0.05)),
          var(--bg-primary);
      }

      .company-shell {
        min-height: 100vh;
        min-height: 100dvh;
        padding: 1.25rem;
        box-sizing: border-box;
      }

      .company-viewer-shell {
        min-height: calc(100vh - 2.5rem);
        min-height: calc(100dvh - 2.5rem);
        display: grid;
        grid-template-columns: minmax(320px, 360px) minmax(0, 1fr);
        gap: 1rem;
      }

      .company-left-column {
        min-height: 0;
        display: grid;
        grid-template-rows: minmax(0, 1.2fr) minmax(280px, 0.8fr);
        gap: 1rem;
      }

      .company-panel {
        min-height: 0;
        overflow: hidden;
        border: 1px solid var(--border);
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.86);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
        backdrop-filter: blur(10px);
      }

      .company-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.9rem 1rem;
        border-bottom: 1px solid var(--border);
        background:
          linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(56, 189, 248, 0.08)),
          var(--surface);
      }

      .company-panel-title {
        margin: 0;
        font-size: 0.82rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text-secondary);
      }

      .company-panel-note {
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--primary);
      }

      .company-tree-shell,
      .company-meta-shell,
      .company-output-shell {
        min-height: 0;
        display: flex;
        flex-direction: column;
      }

      .company-tree-shell > #viewer-sidebar {
        flex: 1;
        min-height: 0;
        border-right: none;
        padding-top: 0.8rem;
      }

      .company-tree-shell > #viewer-sidebar .sidebar-top {
        display: none;
      }

      .company-meta-body {
        flex: 1;
        min-height: 0;
        overflow: auto;
        padding: 1rem;
      }

      .company-meta-body #inspect-pane:not([hidden]) {
        display: block;
      }

      .company-meta-body #inspect-pane[hidden] {
        display: block;
      }

      .company-meta-body .panel-state {
        padding-top: 0;
      }

      .company-meta-status {
        border-top: 1px solid var(--border);
        padding: 0.65rem 1rem;
      }

      .company-output-shell {
        min-width: 0;
      }

      .company-output-shell > #viewer-main {
        min-height: 0;
        border: 1px solid var(--border);
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 24px 48px rgba(15, 23, 42, 0.08);
        overflow: hidden;
      }

      .company-output-shell #viewer-panel {
        flex: 1;
        min-height: 0;
      }

      .company-output-shell #display-pane:not([hidden]) {
        display: flex;
      }

      .company-output-shell #display-pane[hidden] {
        display: flex;
      }

      .company-output-shell #display-status {
        border-top: 1px solid var(--border);
        padding: 0.65rem 1rem;
      }

      .company-output-shell #viewer-topbar {
        padding: 0.9rem 1rem;
      }

      .company-output-shell #viewer-subbar {
        padding-left: 1rem;
        padding-right: 1rem;
      }

      @media (max-width: 1024px) {
        .company-shell {
          padding: 0.75rem;
        }

        .company-viewer-shell {
          min-height: auto;
          grid-template-columns: 1fr;
        }

        .company-left-column {
          grid-template-rows: minmax(320px, 1fr) minmax(220px, auto);
        }
      }
    </style>
  </head>
  <body>
    <!--
      This file shows the PHP shell structure for a company-style layout.
      Current JS still treats inspect/display as separate modes, so this layout
      is the right DOM shape, but simultaneous metadata + output needs JS split logic.
    -->
    <div class="company-shell">
      <div id="viewer-app" class="company-viewer-shell">
        <div class="company-left-column">
          <section class="company-panel company-tree-shell">
            <div class="company-panel-header">
              <h2 class="company-panel-title">Tree</h2>
              <span class="company-panel-note">HDF5 Structure</span>
            </div>

            <aside id="viewer-sidebar" class="viewer-sidebar">
              <div id="sidebar-header" class="sidebar-top">
                <div class="sidebar-top-row">
                  <div class="sidebar-title">HDF Viewer</div>
                  <button
                    id="sidebar-close-btn"
                    class="sidebar-close-btn"
                    type="button"
                    aria-label="Close sidebar"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <line x1="4" y1="4" x2="14" y2="14"></line>
                      <line x1="14" y1="4" x2="4" y2="14"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <div id="tree-panel" class="sidebar-section">
                <div class="section-label">Structure</div>
                <div class="sidebar-tree">
                  <ul id="tree-list" class="tree-root"></ul>
                </div>
                <div id="tree-status" class="tree-status info" aria-live="polite">
                  Waiting for file query parameter.
                </div>
              </div>
            </aside>
          </section>

          <section class="company-panel company-meta-shell">
            <div class="company-panel-header">
              <h2 class="company-panel-title">Metadata</h2>
              <span class="company-panel-note">Inspect Details</span>
            </div>

            <div class="company-meta-body">
              <div id="inspect-pane">
                <div class="panel-state">
                  <div class="state-text">Select a tree item to view metadata here.</div>
                </div>
              </div>
            </div>

            <div id="inspect-status" class="panel-status info company-meta-status" role="status" aria-live="polite">
              Metadata panel ready.
            </div>
          </section>
        </div>

        <section class="company-output-shell">
          <section id="viewer-main" class="viewer-main">
            <div id="viewer-topbar" class="viewer-topbar">
              <div class="topbar-left">
                <button id="sidebar-toggle-btn" class="sidebar-toggle-btn" type="button" aria-label="Toggle sidebar">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <line x1="3" y1="5" x2="17" y2="5"></line>
                    <line x1="3" y1="10" x2="17" y2="10"></line>
                    <line x1="3" y1="15" x2="17" y2="15"></line>
                  </svg>
                </button>
                <div class="topbar-path">
                  <div class="breadcrumb-label">File location</div>
                  <div id="breadcrumb-path" class="breadcrumb">
                    <span id="breadcrumb-file" class="crumb active">No file selected</span>
                  </div>
                </div>
              </div>

              <div class="topbar-right">
                <button id="viewer-back-btn" class="ghost-btn" type="button">
                  <svg class="btn-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="10 2 4 8 10 14"></polyline>
                  </svg>
                  <span class="btn-label">Back to files</span>
                </button>
                <button id="viewer-fullscreen-btn" class="ghost-btn" type="button" title="Toggle fullscreen">
                  <svg class="btn-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"></path>
                  </svg>
                  <span class="btn-label">Fullscreen</span>
                </button>
              </div>
            </div>

            <div id="viewer-subbar" class="viewer-subbar">
              <div id="subbar-tabs" class="subbar-tabs"></div>
              <div id="subbar-actions" class="subbar-actions"></div>
            </div>

            <div id="viewer-panel" class="viewer-panel">
              <div id="display-pane">
                <div class="panel-state">
                  <div class="state-text">Select a dataset to view matrix, line graph, or heatmap here.</div>
                </div>
              </div>
            </div>

            <div id="display-status" class="panel-status info" role="status" aria-live="polite">
              Output panel ready.
            </div>
          </section>
        </section>
      </div>
    </div>

    <div id="sidebar-backdrop" class="sidebar-backdrop" style="display:none"></div>
    <div id="global-status" class="panel-status info" role="status" aria-live="polite">
      Viewer shell loaded. Waiting for file query parameter.
    </div>

    <script src="./config/runtime-config.js"></script>

    <script src="./js/core/namespace.js" defer></script>
    <script src="./js/core/config.js" defer></script>
    <script src="./js/core/domRefs.js" defer></script>

    <script src="./js/utils/format.js" defer></script>
    <script src="./js/utils/lru.js" defer></script>
    <script src="./js/utils/export.js" defer></script>

    <script src="./js/api/client.js" defer></script>
    <script src="./js/api/contracts.js" defer></script>
    <script src="./js/api/hdf5Service.js" defer></script>

    <script src="./js/state/store.js" defer></script>
    <script src="./js/state/reducers/utils.js" defer></script>
    <script src="./js/state/reducers/filesActions.js" defer></script>
    <script src="./js/state/reducers/treeActions.js" defer></script>
    <script src="./js/state/reducers/viewActions.js" defer></script>
    <script src="./js/state/reducers/displayConfigActions.js" defer></script>
    <script src="./js/state/reducers/dataActions.js" defer></script>
    <script src="./js/state/reducers/compareActions.js" defer></script>
    <script src="./js/state/reducers.js" defer></script>

    <script src="./js/components/viewerPanel/shared.js" defer></script>
    <script src="./js/components/viewerPanel/render/config.js" defer></script>
    <script src="./js/components/viewerPanel/render/previews.js" defer></script>
    <script src="./js/components/viewerPanel/render/dimensionControls.js" defer></script>
    <script src="./js/components/viewerPanel/render/sections.js" defer></script>
    <script src="./js/components/viewerPanel/render.js" defer></script>
    <script src="./js/components/viewerPanel/runtime/common.js" defer></script>
    <script src="./js/components/viewerPanel/runtime/matrixRuntime.js" defer></script>
    <script src="./js/components/viewerPanel/runtime/lineRuntime.js" defer></script>
    <script src="./js/components/viewerPanel/runtime/heatmapRuntime.js" defer></script>
    <script src="./js/components/viewerPanel/runtime/bindEvents.js" defer></script>
    <script src="./js/components/viewerPanel/runtime.js" defer></script>
    <script src="./js/components/viewerPanel.js" defer></script>

    <script src="./js/components/sidebarTree.js" defer></script>
    <script src="./js/views/viewerView.js" defer></script>

    <script src="./js/app-viewer.js" defer></script>
  </body>
</html>
