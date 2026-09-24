# Skill-Manager

A lightweight, on-demand skill management system for Google Antigravity that prevents token waste by keeping specialized skills dormant in an offline warehouse and activating them only per-project or on-demand.

## Language

**Skill Warehouse (or Library)**:
The central offline directory (`~/.gemini/skill-library/`) storing all dormant skills and packages without injecting them into the agent's active system prompt.
_Avoid_: Skill store, global cache, plugin bucket

**Global Active Skills**:
The minimal subset of universal skills kept in `~/.gemini/config/skills/` that are loaded into every conversation turn (e.g. execution safety, skill manager).
_Avoid_: Default skills, system skills

**Workspace Skills (Project Skills)**:
Skills copied into `<workspace-root>/.agents/skills/` (or the folder defined by `personal_customization_dir` in `<workspace-root>/.gemini/config.json` in Antigravity 2.17.0+) to provide capabilities only for the active project, without leaking into other projects.
_Avoid_: Local plugins, workspace extensions

**Catalog**:
The structured index (`CATALOG.md` / `catalog.json`) maintaining metadata, descriptions, categories, and tags for all skills stored in the Warehouse.
_Avoid_: Inventory, skills list, manifest table

**Skill Ingestion (Archiving)**:
The operation of importing or moving a skill into the Warehouse and re-indexing the Catalog.
_Avoid_: Skill stashing, library import, skill backup

**Skill Activation**:
The operation of deploying a dormant skill from the Warehouse into a project workspace (`.agents/skills/`) or global scope.
_Avoid_: Skill mounting, skill loading, skill injection

**Skill Pack**:
A curated group of complementary skills that can be activated together as a unit (e.g. `stitch-pack`, `gcp-pack`, `bio-pack`).
_Avoid_: Plugin suite

**Indivisible Skill Bundle**:
A cohesive ecosystem of interconnected skills (e.g. `aihero-mattpocock`, `caveman`) that call each other at runtime via slash commands, relative links, or agent delegations. They must always move or remain intact together to prevent broken runtime dependencies.
_Avoid_: Monolithic skill, skill folder
