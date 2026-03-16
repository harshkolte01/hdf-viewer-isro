const API_BASE = "http://localhost:5100";

const rootBtn = document.getElementById("rootBtn");
const currentPathEl = document.getElementById("currentPath");
const breadcrumbsEl = document.getElementById("breadcrumbs");
const itemsEl = document.getElementById("items");
const statusEl = document.getElementById("status");

let currentPrefix = "";

function normalizeFolderPrefix(folderKey) {
  return String(folderKey || "").replace(/\\/g, "/").replace(/\/+$/, "");
}

function renderBreadcrumbs(breadcrumbs) {
  breadcrumbsEl.innerHTML = "";

  if (!Array.isArray(breadcrumbs) || breadcrumbs.length === 0) {
    return;
  }

  breadcrumbs.forEach((crumb, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "crumb";
    button.textContent = crumb.name || "Root";
    button.addEventListener("click", () => loadPrefix(crumb.prefix || ""));
    breadcrumbsEl.appendChild(button);

    if (index < breadcrumbs.length - 1) {
      const sep = document.createElement("span");
      sep.textContent = "/";
      sep.className = "sep";
      breadcrumbsEl.appendChild(sep);
    }
  });
}

function renderItems(folders, files) {
  itemsEl.innerHTML = "";

  const hasFolders = Array.isArray(folders) && folders.length > 0;
  const hasFiles = Array.isArray(files) && files.length > 0;

  if (!hasFolders && !hasFiles) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No folders or files available here.";
    itemsEl.appendChild(empty);
    return;
  }

  if (hasFolders) {
    folders.forEach((folder) => {
      const row = document.createElement("div");
      row.className = "item-row";

      const name = document.createElement("span");
      name.textContent = folder.name;

      const goBtn = document.createElement("button");
      goBtn.type = "button";
      goBtn.textContent = "Go ->";
      goBtn.addEventListener("click", () => {
        loadPrefix(normalizeFolderPrefix(folder.key));
      });

      row.appendChild(name);
      row.appendChild(goBtn);
      itemsEl.appendChild(row);
    });
  }

  if (hasFiles) {
    files.forEach((file, index) => {
      const row = document.createElement("label");
      row.className = "item-row file-row";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "selectedFile";
      radio.value = file.key;
      radio.id = `file-${index}`;

      const text = document.createElement("span");
      text.textContent = file.name;

      radio.addEventListener("change", () => {
        statusEl.textContent = `Selected file: ${file.key}`;
      });

      row.appendChild(radio);
      row.appendChild(text);
      itemsEl.appendChild(row);
    });
  }
}

async function loadPrefix(prefix) {
  const normalized = String(prefix || "").trim();
  currentPrefix = normalized;
  currentPathEl.textContent = normalized ? `/${normalized}` : "/";
  statusEl.textContent = "Loading...";

  try {
    const url = `${API_BASE}/api/browse?prefix=${encodeURIComponent(normalized)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Unable to load files.");
    }

    renderBreadcrumbs(data.breadcrumbs);
    renderItems(data.folders, data.files);
    statusEl.textContent = `Loaded ${data.total} item(s).`;
  } catch (error) {
    itemsEl.innerHTML = "";
    statusEl.textContent = `Error: ${error.message}`;
  }
}

rootBtn.addEventListener("click", () => loadPrefix(""));
loadPrefix("");
