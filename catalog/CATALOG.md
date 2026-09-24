# Local Agent Skill Warehouse Catalog

> Redistributable catalog template for `Antigravity Skill-Manager`.

This repository provides the core tools (`skill-manager` and `skill-archiver`) to manage your offline skill library in `~/.gemini/skill-library/`.

## Dynamic Local Generation

When installed on a user's machine, the actual catalog (`catalog.json` and `CATALOG.md`) is dynamically generated within the user's local warehouse (`~/.gemini/skill-library/`).

To index or update your local skills at any time, run:
```bash
skill-manager reindex
```

This will automatically scan your `~/.gemini/skill-library/` folder, detect your active MCP servers, and compile your personal catalog without leaking any private or machine-specific data.

---

## Curated Skill Packs

Curated pack definitions are maintained in `catalog/packs.json`. You can activate packs or skills on demand:

```bash
# List available packs
skill-manager packs

# Activate a pack for your active project workspace
skill-manager activate <pack-name>
```
