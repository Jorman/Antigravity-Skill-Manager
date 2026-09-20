---
name: skill-archiver
description: Ingest, archive, analyze, and catalog skills for Google Antigravity. Performs deep dynamic analysis of installed skills, checks for duplicates via SHA-256 fingerprinting, dynamically detects MCP server integrations, gently advises the user, and automatically regenerates both catalog.json and CATALOG.md.
---

# Antigravity Skill Archiver & Cataloger

This skill provides dynamic, multi-platform skill archiving, duplicate detection, and catalog synchronization for Google Antigravity.
It works **dynamically for any user and any skill set**, with zero hardcoded skill names.

---

## Core Capabilities

### 1. Dynamic Environment & Skill Analysis
- Scans `~/.gemini/config/skills/` without any preconceptions or hardcoded lists.
- Dynamically reads the user's MCP configurations (`mcp_config.json`, `antigravity/mcp/`) to discover which MCP servers are actually configured on the machine.
- Computes estimated token overhead injected into the system prompt for each skill.

### 2. Deep Duplicate Detection (SHA-256 Fingerprinting)
Before touching or moving any skill, it compares the global folder against `~/.gemini/skill-library/<name>`:
- **`IDENTICAL`**: Checksums match 100%. The skill already safely exists in the warehouse. Completely safe to prune from global to liberate prompt tokens.
- **`MODIFIED`**: Files differ or have been updated. Identifies which version is newer and creates an automatic timestamped backup (`<name>.backup-<timestamp>`) before overwriting.
- **`UNIQUE`**: No copy exists in the warehouse; will be ingested cleanly.

### 3. Heuristic User Advisory & Categorization
The skill categorizes every discovered skill into 4 distinct groups:
1. **Core System Managers (`CORE_SYSTEM`)**:
   - `skill-manager`, `skill-archiver`, `find-skills`.
   - *Recommendation*: **MUST KEEP GLOBAL** (Required to manage the ecosystem).
2. **Safety Guardrails (`SAFETY_GUARDRAIL`)**:
   - Terminal command interceptors, data-loss protection, execution governance.
   - *Recommendation*: **KEEP GLOBAL** (Protects user operations).
3. **MCP-Linked Integrations (`MCP_LINKED` / `MCP_GENERIC`)**:
   - Skills that interact with configured MCP servers (e.g. GitHub, Stripe, Supabase, Stitch, Graphify).
   - *Recommendation*: **GENTLE CONFIRMATION**. Explains which MCP servers are linked, and asks if the user prefers them always global or on-demand per project.
4. **Specialized Domain Workflows (`SPECIALIZED`)**:
   - Frontend frameworks, testing utilities, cloud tools, documentation formats, etc.
   - *Recommendation*: **SAFE TO ARCHIVE**. Moving them to the warehouse saves prompt tokens on every turn while keeping them 100% accessible on-demand.

### 4. Automatic Catalog Re-Generation (Hybrid Model)
Whenever skills are archived, migrated, or updated, the skill regenerates:
- **`~/.gemini/skill-library/catalog.json`**: Structured JSON containing skill metadata, configured MCP tags, pack associations, and prompt token savings metrics.
- **`~/.gemini/skill-library/CATALOG.md`**: Clean, human-readable Markdown table with visual badges, pack groupings, and direct `view_file` accessibility for the agent.

---

## Conversational Workflows

### Scenario A: Clean up global skills & save tokens
> **User**: *"Analizza le mie skill globali e ripulisci il prompt"* / *"Optimize my global skills"*

**Action:**
1. Run analysis via CLI:
   ```bash
   node <path-to-skill-manager>/bin/skill-manager.cjs analyze
   ```
   Or invoke internal analysis routine.
2. Present the breakdown to the user:
   - Total global skills and current prompt token weight.
   - **Estimated Token Savings Calculation**:
     - *Per single message turn*: ~X tokens liberated.
     - *Per typical 20-message conversation*: ~Y tokens saved (e.g. 20 * X).
     - *Percentage prompt bloat reduction*: ~Z%.
   - Detected active MCP servers.
   - Grouped recommendations (Core, Safety, MCP-linked, Specialized).
   - Duplicate status (how many are already identically in the warehouse).
3. For MCP-linked skills, ask confirmation politely without alarming the user:
   *"The following skills connect to your configured MCP servers: [X, Y]. Would you like to keep them active globally or archive them to load only in relevant projects?"*
4. Execute the move for approved skills, delete the global copies, and re-index the catalog.
5. Provide a summary of the actual tokens saved in the active session.

---

### Scenario B: Ingest a newly created or downloaded skill
> **User**: *"Archivia questa nuova skill situata in ./my-skill"*

**Action:**
1. Inspect `./my-skill/SKILL.md` to verify frontmatter (`name`, `description`).
2. Run duplicate check against warehouse.
3. Ingest via CLI:
   ```bash
   node <path-to-skill-manager>/bin/skill-manager.cjs archive "./my-skill" --backup
   ```
4. Confirm to user that the skill is stored dormantly and the catalog is updated.

---

### Scenario C: Check for duplicates
> **User**: *"Ci sono duplicati tra le mie skill globali e la warehouse?"*

**Action:**
1. Run `node <path-to-skill-manager>/bin/skill-manager.cjs duplicates`.
2. Report identical vs modified copies with file diff details.
