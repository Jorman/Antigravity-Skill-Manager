# 03 - Archiver & Migration Mechanics

Type: grilling
Status: resolved
Blocked by: 01

## Question

How should the archiver operate when transitioning existing installations or ingesting new skills?
1. One-shot migration / prune: Detect all skills in `~/.gemini/config/skills/`, keep a configurable allowlist in global, move the rest to `~/.gemini/skill-library/`, and auto-generate `CATALOG.md` + `catalog.json`.
2. Single-skill ingest: Tool/skill command to archive one specified skill at a time (`archive <skill-name>` or `ingest <path>`).
3. Both: A bulk migration/cleaner command + an individual ingest/archive tool.

## Answer

Approved: Both bulk migration and single-skill ingestion.
Migration specifics:
- Total migration of non-skill-manager skills from `~/.gemini/config/skills/` to `~/.gemini/skill-library/`.
- Pre-analysis of all skills: identify important skills (e.g. skills associated with MCP servers or core safety/governance).
- Ask user confirmation politely and gently without causing alarm before moving important/MCP-related skills.
- Automatically update `CATALOG.md` and `catalog.json` upon moving or ingesting skills.
