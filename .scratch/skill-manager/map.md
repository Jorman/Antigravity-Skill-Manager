## Destination

A complete, production-grade, GitHub-ready open-source repository `Skill-Manager` (`https://github.com/Jorman/Antigravity-Skill-Manager.git`) providing a lightweight, modular skill ecosystem for Google Antigravity:
1. Keeps the agent ultra-light by archiving non-universal skills in an offline warehouse (`~/.gemini/skill-library/`), saving thousands of prompt tokens per turn.
2. An on-demand discovery & activation skill (`skill-manager`) searching local catalog first, with fallback to online registries (`find-skills` / `skills.sh`).
3. An automated archiver & migration skill/tool (`skill-archiver`) that gently analyzes installed skills, prompts for confirmation on MCP/critical skills, ingests them into the warehouse, and maintains the catalog (`CATALOG.md` / `catalog.json`).
4. Cross-platform setup and CLI tooling (Windows PowerShell, macOS/Linux Bash/Node) with non-hardcoded `~` paths.
5. Complete documentation, examples, and curated pack definitions ready for open-source publication.

## Notes

- Domain: Antigravity Customization System (Global: `~/.gemini/config/skills/`, Workspace: `.agents/skills/`, Warehouse: `~/.gemini/skill-library/`).
- Target Machine & OS: Windows, macOS, Linux (cross-platform, relative/home paths `~`).
- Skills to consult: `wayfinder`, `grilling`, `domain-modeling`, `codebase-design`.
- Standing preferences: Keep prompt token footprint minimal; zero hardcoded user paths.

## Decisions so far

- [01 - Catalog Architecture & Index Format](./issues/01-catalog-architecture.md): Hybrid format (`CATALOG.md` markdown table for agent/human + `catalog.json` for CLI/scripts).
- [02 - CLI & Scripting Runtime](./issues/02-cli-runtime.md): Zero-dependency Node.js CLI engine (`bin/skill-manager.cjs`) + native `scripts/install.ps1` & `scripts/install.sh`.
- [03 - Archiver & Migration Mechanics](./issues/03-archiver-mechanics.md): Total migration from global to warehouse; analyze skills first and gently ask confirmation for MCP-linked and critical skills.
- [04 - Online Discovery & Fallback Registry](./issues/04-online-discovery-providers.md): Local library first; fallback online via `find-skills` (`npx skills add https://github.com/vercel-labs/skills --skill find-skills` auto-suggested/installed).
- [05 - Repository Structure & Distribution](./issues/05-github-repo-distribution.md): Structured GitHub repo with CLI, skills, installers, docs, tests, and packs.

## Not yet specified

- Sync/update mechanisms for skills when upstream libraries update.
- Automated CI/CD GitHub Actions workflow for validating skill frontmatter and publishing releases.

## Out of scope

- Modifying Antigravity core binary or internal prompt engine directly.
- Managing MCP servers (out of scope, handled by MCP configuration).
