---
name: skill-archiver
description: Ingest, archive, migrate, and catalog skills for Google Antigravity. Use when the user wants to archive an existing skill, clean up global ~/.gemini/config/skills/ to save context tokens, import a new skill into the offline warehouse (~/.gemini/skill-library/), or rebuild/update the catalog index (CATALOG.md and catalog.json).
---

# Antigravity Skill Archiver & Cataloger

This skill handles archiving, safe migration, and catalog indexing for Google Antigravity.
It enables moving non-essential skills out of the global autoloader (`~/.gemini/config/skills/`) into the offline warehouse (`~/.gemini/skill-library/`), liberating thousands of tokens per conversation turn while ensuring all skills remain fully indexed and retrievable.

---

## Key Responsibilities

1. **Ingest & Archive**: Take any skill directory and store it in `~/.gemini/skill-library/<skill-name>`.
2. **Pre-Analysis & Gentle Migration**:
   - Inspect global skills.
   - Separate into Core Essentials, Important / MCP-Linked, and Specialized.
   - Gently prompt the user for confirmation before moving Important skills.
   - Move specialized skills to the warehouse, removing them from global autoload.
3. **Automatic Re-Indexing**:
   - Parse YAML frontmatter (`name`, `description`).
   - Associate with curated packs (`catalog/packs.json`).
   - Regenerate both `~/.gemini/skill-library/catalog.json` and `~/.gemini/skill-library/CATALOG.md`.

---

## Safe Migration Protocol (Global to Warehouse)

When asked to clean up, optimize, or migrate global skills:

### Step 1: Pre-Analysis
Scan `~/.gemini/config/skills/` and group items:
- **Core Essentials (MUST REMAIN IN GLOBAL)**:
  - `skill-manager` (on-demand loader)
  - `skill-archiver` (warehouse manager)
  - `find-skills` (online discovery tool)
- **Important / Cautionary Skills (ASK USER CONFIRMATION GENTLY)**:
  - Skills directly integrated with active MCP servers (e.g. `graphify`, `retro`).
  - Core execution safety guardrails (e.g. `accidental-data-loss-prevention`, `git-guardrails-claude-code`).
  - *Tone requirement*: Be reassuring and gentle. Explain: *"These skills are tied to external MCP tools or safety rules. Do you prefer keeping them always active globally, or archiving them to load on-demand?"*
- **Specialized Skills (SAFE TO ARCHIVE)**:
  - Domain-specific skills (e.g. `android-lint-inspector`, `docker`, `scaffold-exercises`, `writing-beats`, `tdd`, `preview`, etc.).
  - Moving these to the warehouse immediately frees ~15,000+ prompt tokens.

### Step 2: Ingestion & Relocation
1. For each skill approved for archiving:
   - Copy recursively from `~/.gemini/config/skills/<name>` to `~/.gemini/skill-library/<name>`.
   - Once verified, delete the source from `~/.gemini/config/skills/<name>`.
2. Keep the approved core essentials in global.

### Step 3: Rebuild Catalog Index
Run the CLI indexer:
```bash
node <path-to-skill-manager>/bin/skill-manager.cjs reindex
```
Or execute the re-indexing routine directly to update:
- `~/.gemini/skill-library/catalog.json`
- `~/.gemini/skill-library/CATALOG.md`

---

## Ingesting a Single New Skill

When the user creates or downloads a new skill (e.g. from GitHub, web, or `.scratch/`):
1. Verify that the skill folder contains a valid `SKILL.md` with YAML frontmatter:
   ```markdown
   ---
   name: my-skill
   description: Description of what this skill does
   ---
   ```
2. Move/copy the folder into `~/.gemini/skill-library/<skill-name>`.
3. Trigger reindex:
   ```bash
   node <path-to-skill-manager>/bin/skill-manager.cjs reindex
   ```
4. Confirm to the user that the skill is stored dormantly and ready for on-demand project activation.
