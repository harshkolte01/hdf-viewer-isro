# Backend Export Implementation Plan

As of 2026-02-22.

## Purpose
Define backend support required for production-grade CSV export used by `old_web` export actions.

## Why backend support is needed
Current `/files/<key>/data` is optimized for visualization windows and JSON payload limits.
- Matrix has row/col caps for render windows.
- Heatmap mode is sampled/clamped for display.
- Line exact mode has strict window cap.
For robust `CSV (Full)`, backend should stream raw data safely and efficiently.

## Recommended API

### 1. Streaming CSV endpoint
`GET /files/<key>/export/csv`

Query params:
- required:
- `path`
- `mode=matrix|line|heatmap`
- optional common:
- `display_dims`
- `fixed_indices`
- `etag`
- mode-specific:
- matrix/heatmap full slice:
- `row_offset` (default 0)
- `row_limit` (default all)
- `col_offset` (default 0)
- `col_limit` (default all)
- line full/profile:
- `line_dim`
- `line_index`
- `line_offset` (default 0)
- `line_limit` (default all)
- compare optional:
- `compare_paths` (comma-separated absolute dataset paths)

Response:
- `200 text/csv; charset=utf-8`
- `Content-Disposition: attachment; filename="...csv"`
- streamed/chunked body

Error response:
- JSON error payload (4xx/5xx) before stream starts.

### 2. Optional async export jobs (large enterprise scale)
- `POST /files/<key>/exports`
- `GET /files/<key>/exports/<job_id>`
- `GET /files/<key>/exports/<job_id>/download`
Use this only if synchronous streaming still risks gateway timeout.

## Data correctness rules
- Export uses raw numeric values (not display-formatted strings).
- Heatmap full CSV must export full 2D slice (not sampled heatmap render payload).
- Line compare export aligns all series on x-index; missing points emit empty field.
- CSV includes header row.

## Implementation Design

### Route layer (`backend/src/routes/hdf5.py`)
- Add new export route with explicit validation branch.
- Reuse existing selection normalization (`display_dims`, `fixed_indices`, line params).
- Validate compare paths against:
- same file
- dataset-only
- numeric dtype
- same ndim
- same shape

### Reader layer (`backend/src/readers/hdf5_reader.py`)
- Add chunk iterators (generator style):
- matrix row-block iterator
- line window iterator
- compare line multi-series iterator
- Emit rows as CSV-safe strings incrementally.

### Streaming
- Use Flask streaming response (`Response(generator(), mimetype="text/csv")`).
- Avoid building full CSV in memory.
- Flush periodic chunks.

### Limits and safety
- Dedicated export limits separate from render limits.
- Max concurrent exports guard.
- Max stream duration and max rows/points safeguards.
- Graceful abort on client disconnect.

## TODO (Backend)

### P0 - Contract and route skeleton
- [ ] Finalize endpoint contract and query schema.
- [ ] Add `/export/csv` route skeleton with validation and error responses.
- [ ] Add unit tests for validation paths (missing params, bad mode, invalid dims/index).

### P1 - Matrix and heatmap-full CSV
- [ ] Implement matrix slice streaming CSV generator.
- [ ] Implement heatmap full export using matrix-plane iterator (raw data).
- [ ] Add tests for CSV row/column counts and headers.

### P2 - Line CSV and compare
- [ ] Implement line streaming generator.
- [ ] Add optional compare series export (`compare_paths`).
- [ ] Add alignment tests for uneven returned points/steps.

### P3 - Hardening
- [ ] Add export-specific cache policy decision (usually no cache, stream direct).
- [ ] Add request metrics/logging for export duration and size.
- [ ] Add concurrency guard + cancellation handling.
- [ ] Add integration tests against realistic large datasets.

## Compatibility with existing frontend plan
- Frontend can ship `Displayed` and `PNG` exports without backend changes.
- Frontend `CSV (Full)` should switch to this endpoint once available.

## What should be done first
1. Lock backend export API contract (params + CSV headers + error model).
2. Implement matrix/heatmap full CSV streaming first.
3. Implement line + compare streaming next.
