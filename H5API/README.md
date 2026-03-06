# H5API

Filesystem-based Flask service for browsing HDF5 files.

## What it does

- `GET /` serves the browser UI (`templates/index.html`)
- `GET /api/browse` lists folders and HDF5 files at a `prefix`
- `GET /health` returns service liveness

## Storage path config (same model as backend)

Set one of these:

- `STORAGE_ROOT` (preferred explicit path)
- `STORAGE_PATH_LINUX`
- `STORAGE_PATH_WINDOWS`

Path priority:

- On Windows: `STORAGE_ROOT`, then `STORAGE_PATH_WINDOWS`, then `STORAGE_PATH_LINUX`
- On Linux: `STORAGE_ROOT`, then `STORAGE_PATH_LINUX`, then `STORAGE_PATH_WINDOWS`

## Run

```bash
cd H5API
pip install -r requirements.txt
python app.py
```

Defaults:

- `HOST=0.0.0.0`
- `PORT=5100`
- `DEBUG=false`

## Browse API

`GET /api/browse?prefix=<relative-folder>`

Response fields:

- `success`
- `prefix`
- `total`
- `breadcrumbs`
- `folders`
- `files`
- `storage_root`
