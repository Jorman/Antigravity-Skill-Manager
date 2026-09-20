# 01 - Catalog Architecture & Index Format

Type: grilling
Status: resolved
Blocked by:

## Question

How should the Skill Warehouse Catalog be structured and stored?
Currently, `~/.gemini/skill-library/CATALOG.md` is a human-readable markdown table.
Should we support:
1. Pure Markdown (`CATALOG.md`): lightweight, agent-friendly, easily read with `view_file`.
2. Hybrid Markdown + JSON (`CATALOG.md` + `catalog.json`): Markdown for humans/agent quick reads, JSON for programmatic indexing, fast querying, and CLI automation.
3. YAML or SQLite.

## Answer

Approved: Hybrid format.
- `CATALOG.md`: Generated human & agent-friendly Markdown table, grouped by categories/packs, readable via `view_file`.
- `catalog.json`: Machine-readable structured catalog with skill metadata (name, description, tags, categories, mcpDependencies, lastUpdated) for fast CLI queries, filtering, and indexing.
- Both are maintained and kept in sync automatically by the indexer.
