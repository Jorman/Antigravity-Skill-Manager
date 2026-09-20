---
name: skill-manager
description: Manage, search, discover, recommend, and activate skills from the local offline warehouse (~/.gemini/skill-library) or online (skills.sh). Use when the user asks if a skill exists, asks for skill recommendations, wants to list/activate/enable/install a skill or pack (e.g. Stitch, GCP, BigQuery, Bio, Caveman, Dev-Workflow) for the current project or globally, or searches for skills online.
---

# Antigravity Skill Manager (On-Demand Activation & Discovery)

This skill manages agent capabilities dynamically across all operating systems (Windows, macOS, Linux).
It enables searching and activating skills **on-demand**, keeping the global context window ultra-light (~15,000+ prompt tokens saved per turn) while providing instant access to an offline warehouse and online registries.

---

## Architectural Principles

1. **Global Active Skills** (`~/.gemini/config/skills/`):
   Only a minimal set of universal skills resides here (e.g. `skill-manager`, `skill-archiver`, `find-skills`, and system safety rules).
2. **Offline Warehouse** (`~/.gemini/skill-library/`):
   Flat directory storing all dormant skills (`~/.gemini/skill-library/<skill-name>/`).
   Catalog indexes: `~/.gemini/skill-library/CATALOG.md` (Markdown) and `~/.gemini/skill-library/catalog.json` (structured JSON).
3. **Workspace Skills** (`<project-root>/.agents/skills/`):
   Project-specific skills. When activated here, Antigravity loads them **only** when working inside this project, leaving all other conversations completely lean.

---

## Dynamic Cross-Platform Path Resolution

Never hardcode drive letters or absolute user paths. Resolve dynamically:

- **PowerShell (Windows)**:
  ```powershell
  $library = Join-Path ([Environment]::GetFolderPath("UserProfile")) ".gemini\skill-library"
  $globalSkills = Join-Path ([Environment]::GetFolderPath("UserProfile")) ".gemini\config\skills"
  $projectSkills = ".\.agents\skills"
  ```
- **Bash / Zsh (macOS / Linux)**:
  ```bash
  LIBRARY="$HOME/.gemini/skill-library"
  GLOBAL_SKILLS="$HOME/.gemini/config/skills"
  PROJECT_SKILLS="./.agents/skills"
  ```
- **Node.js**:
  ```javascript
  const library = path.join(os.homedir(), '.gemini', 'skill-library');
  const projectSkills = path.join(process.cwd(), '.agents', 'skills');
  ```

---

## Workflows & Capabilities

### 1. Check If a Skill Exists / Search Warehouse
When the user asks:
- *"Do we have a skill for X?"*
- *"Search for a skill that does..."*
- *"Is there a skill for BigQuery / React / Docker / Biology?"*

**Action:**
1. Check `~/.gemini/skill-library/catalog.json` or `CATALOG.md` using `view_file` or CLI:
   ```bash
   node <path-to-skill-manager>/bin/skill-manager.cjs search "<query>"
   ```
2. If matches are found locally, present the skill name(s), descriptions, and tags to the user, and offer to activate them for the current project.
3. If **no local match** is found, proceed to **Fallback Online Search**.

---

### 2. Recommend Skills for Current Project (Intelligent Advisory)
When the user asks:
- *"What skills do you recommend for this project?"*
- *"Help me choose local skills for this task"*
- *"Which local skills would be useful here?"*

**Protocol:**
1. **Analyze Project Environment & Tech Signals**:
   - Inspect workspace manifests: `package.json` (React, Vue, Next.js, Tailwind, Shadcn, Jest, Vitest), `requirements.txt`/`pyproject.toml` (Pandas, PyTorch, BigQuery, FastAPI), `Dockerfile`, `.git`.
   - Or run the recommendation engine:
     ```bash
     node <path-to-skill-manager>/bin/skill-manager.cjs recommend
     ```
2. **Catalog & Pack Cross-Referencing**:
   - Match detected signals against `catalog.json` and `catalog/packs.json`:
     - *React / Tailwind / UI*: Recommend `stitch-ui` pack (or `react-components`, `design-md`).
     - *Data Engineering / SQL*: Recommend `gcp-bigquery` pack (or `dbt-bigquery`, `dataform-bigquery`).
     - *Testing & Clean Code*: Recommend `dev-workflow` pack (`tdd`, `code-review`, `diagnosing-bugs`).
     - *Python Development*: Recommend `managing-python-dependencies`.
     - *Large Sessions / Token Optimization*: Recommend `caveman` pack.
3. **Present Structured Advice to User**:
   - State clearly which indicators were detected in their project.
   - List 2 to 3 tailored recommendations with a concise 1-sentence rationale explaining *how* that skill improves the agent's work.
   - Mention whether it's an individual skill or part of a curated pack.
4. **Offer Single-Action Activation**:
   - Ask the user if they'd like you to activate the recommended skill(s) into `.agents/skills/`.
   - Upon confirmation, activate immediately.

---

### 3. Activate Skills / Packs for the Current Project (Default)
When the user says:
- *"Activate Stitch for this project"* / *"Enable BigQuery skills here"*
- *"Install the react-components skill"* / *"Activate tdd"*
- *"Activate ask-matt"* / *"Enable Matt Pocock suite"*

**Action:**
1. Target path: `<project-root>/.agents/skills/<skill-name>`.
2. Ensure directory exists.
3. **Indivisible Bundle Awareness**: If the requested skill belongs to an interconnected ecosystem (e.g. Matt Pocock / AI Hero suite or Caveman), activate all connected skills together using `--bundle` so the agent doesn't suffer broken runtime references.
4. Copy the skill directory recursively from `~/.gemini/skill-library/<skill-name>` into `<project-root>/.agents/skills/<skill-name>`.
5. Or use the CLI:
   ```bash
   node <path-to-skill-manager>/bin/skill-manager.cjs activate <name-or-pack> [--bundle]
   ```
6. **Advise on Session Reload**:
   - Remind the user: *"Skill activated! To have it loaded into the prompt, start a new conversation turn or reload Antigravity (`Ctrl+R`)."*

> [!NOTE]
> **Antigravity Prompt Lifecycle**: The `<skills>` block in the system prompt is assembled at conversation/session startup. Any addition or removal of skills takes effect upon starting a new chat or reloading Antigravity (`Ctrl+R` / `Developer: Reload Window`).

---

### 4. Activate Skills Globally (Explicit Request Only)
Only when the user explicitly requests machine-wide global activation:
1. Target path: `~/.gemini/config/skills/<skill-name>`.
2. Copy from warehouse to global directory.
3. Note to user: global skills add prompt token weight to every chat session.

---

### 5. Fallback Online Search & Installation (`find-skills`)
When a skill is not found in the local warehouse:
1. Check if `find-skills` is installed in `~/.gemini/config/skills/find-skills`.
2. If **not present**, recommend and install it:
   ```bash
   npx skills add https://github.com/vercel-labs/skills --skill find-skills
   ```
3. Run online search:
   ```bash
   npx skills find "<query>"
   ```
4. Once identified, ask the user if they wish to install it into the local project or archive it directly into the warehouse.

---

### 6. Deactivate / Remove Skills
- **From project**: Remove the folder from `<project-root>/.agents/skills/<skill-name>`.
- **From global**: Move back to warehouse or delete if already present in warehouse.

---

### 7. MCP Server Management & Project Workspace Isolation
Antigravity supports both global MCP servers (`~/.gemini/config/mcp_config.json`) and per-project MCP isolation via workspace plugins (`<project-root>/.agents/plugins/<server>-mcp/mcp_config.json`):
- **Inspect MCP status**:
  ```bash
  node <path-to-skill-manager>/bin/skill-manager.cjs mcp list
  ```
- **Disable unused global server** (sets `"disabled": true` to free RAM, CPU, and thousands of prompt tokens):
  ```bash
  node <path-to-skill-manager>/bin/skill-manager.cjs mcp disable <server-name>
  ```
- **Re-enable global server**:
  ```bash
  node <path-to-skill-manager>/bin/skill-manager.cjs mcp enable <server-name>
  ```
- **Isolate MCP server to current workspace** (project X has the MCP server, project Y does not):
  ```bash
  node <path-to-skill-manager>/bin/skill-manager.cjs mcp isolate <server-name>
  ```

---

## Built-In Curated Packs Reference

| Pack Key | Name | Key Skills Included |
| :--- | :--- | :--- |
| `stitch-ui` | Google Stitch & UI Design | `code-to-design`, `design-md`, `enhance-prompt`, `extract-design-md`, `generate-design`, `manage-design-system`, `react-components`, `react-native`, `react-vite-dashboard`, `remotion`, `shadcn-ui`, `taste-design`, `upload-to-stitch` |
| `gcp-bigquery` | GCP & BigQuery Data Eng | `bigquery-data-transfer-service`, `building-data-apps`, `data-autocleaning`, `dataform-bigquery`, `dbt-bigquery`, `developing-with-bigquery`, `discovering-gcp-data-assets`, `gcp-data-pipelines`, `gcp-dataflow`, `gcp-spark`, `ml-best-practices` |
| `bio-research` | Feynman Research & Bio | `alphafold2`, `boltz`, `borzoi`, `chai1`, `diffdock`, `esmfold2`, `evo2`, `fair-esm2`, `ligandmpnn`, `openfold3`, `proteinmpnn`, `scgpt`, `scvi-tools`, `solublempnn`, `alpha-research`, `deep-research`, `literature-review`, `paper-writing`, `modal-compute`, `runpod-compute` |
| `dev-workflow` | Quality & Development | `tdd`, `code-review`, `deming-cycle`, `diagnosing-bugs`, `resolving-merge-conflicts`, `setup-pre-commit` |
| `caveman` | Token Compression | `caveman`, `caveman-commit`, `caveman-compress`, `caveman-help`, `caveman-review`, `caveman-stats`, `cavecrew` |
| `agent-authoring`| Skill & Prompt Writing | `writing-for-agents`, `writing-beats`, `writing-fragments`, `writing-shape`, `skill-creator` |
