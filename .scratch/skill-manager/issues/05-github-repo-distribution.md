# 05 - Repository Structure & Distribution

Type: grilling
Status: resolved
Blocked by: 02, 03

## Question

How should the GitHub repository `Skill-Manager` be organized and distributed?
Structure options:
- Root: `README.md`, `INSTALL.md`, `ARCHITECTURE.md`, `LICENSE`, `package.json`.
- `skills/`: Contains the skills meant to be installed into Antigravity (`skill-manager`, `skill-archiver`).
- `bin/` or `src/`: The CLI tool (e.g. `bin/skill-manager.cjs` or `src/cli.js`).
- `scripts/`: Platform install/setup scripts (`install.ps1`, `install.sh`).
- `catalog/` or `presets/`: Default seed catalog and pack definitions (Stitch UI, GCP, Bio, Web Dev, etc.).
- Examples and documentation in `docs/` or `examples/`.

## Answer

Approved:
Repository hosted at `https://github.com/Jorman/Antigravity-Skill-Manager.git`.
Structure:
- `skills/skill-manager/`: The search, list, recommend, and on-demand project activator skill.
- `skills/skill-archiver/`: The migration, analyzer, and catalog indexer skill.
- `bin/skill-manager.cjs`: Zero-dependency cross-platform CLI tool.
- `scripts/install.ps1`: One-liner installer for Windows PowerShell.
- `scripts/install.sh`: One-liner installer for macOS/Linux.
- `catalog/`: Seed catalog definitions and curated packs (`packs.json`).
- `docs/`: Installation, Architecture (token savings analysis), and Usage Guides.
- `test/`: Automated CLI & Skill tests.
- `package.json`, `README.md`, `LICENSE`.
