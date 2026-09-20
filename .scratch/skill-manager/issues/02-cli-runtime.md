# 02 - CLI & Scripting Runtime

Type: grilling
Status: resolved
Blocked by: 01

## Question

What runtime/language should power the cross-platform CLI and automation scripts?
Options:
1. Portable Node.js (JavaScript/TypeScript ESM with native node `#!/usr/bin/env node`): Cross-platform on Windows/macOS/Linux without external dependencies, easy `npx` or local execution.
2. Dual Shell Scripts: PowerShell (`.ps1`) for Windows and Bash (`.sh`) for macOS/Linux.
3. Hybrid: Node.js core engine + thin `.ps1` and `.sh` wrapper scripts for native shell integration.
4. Python script (`skill_manager.py`).

## Answer

Approved: Portable Node.js standalone CLI (`bin/skill-manager.cjs`) with zero third-party dependencies, combined with native one-line installers `scripts/install.ps1` (Windows PowerShell) and `scripts/install.sh` (macOS/Linux Bash).
All filesystem paths use dynamic home resolution (`os.homedir()` / `~`), avoiding any hardcoded paths.
