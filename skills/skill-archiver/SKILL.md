---
name: skill-archiver
description: Ingest, archive, analyze, and catalog skills for Google Antigravity. Performs deep dynamic analysis of installed skills, checks for duplicates via SHA-256 fingerprinting, enforces indivisible skill bundles and dependency graphs, dynamically detects MCP server integrations, gently advises the user, and automatically regenerates both catalog.json and CATALOG.md with portable paths.
---

# Antigravity Skill Archiver & Cataloger

This skill provides dynamic, multi-platform skill archiving, duplicate detection, dependency graph analysis, and catalog synchronization for Google Antigravity.
It works **dynamically for any user and any skill set**, with zero hardcoded paths or personal machine data.

---

## Core Capabilities

### 1. Dynamic Environment & Skill Analysis
- Scans `~/.gemini/config/skills/` without any preconceptions or machine-specific assumptions.
- Dynamically reads the user's MCP configurations (`mcp_config.json`, `antigravity/mcp/`) to discover which MCP servers are configured on the machine.
- Computes estimated token overhead injected into the system prompt for each skill.

### 2. Deep Duplicate Detection (SHA-256 Fingerprinting)
Before touching or moving any skill, it compares the active folder against `~/.gemini/skill-library/<name>`:
- **`IDENTICAL`**: Checksums match 100%. The skill already safely exists in the warehouse. Completely safe to prune from global to liberate prompt tokens.
- **`MODIFIED`**: Files differ or have been updated. Identifies which version is newer and creates an automatic timestamped backup (`<name>.backup-<timestamp>`) before overwriting.
- **`UNIQUE`**: No copy exists in the warehouse; will be ingested cleanly.

### 3. Structural Dependency & Indivisible Bundle Engine
Skills are rarely isolated text files. Modern agent workflows rely on **interconnected ecosystems** that call each other at runtime.
The archiver statically analyzes dependencies (slash commands `/skill`, markdown relative links, and explicit invocations) and cross-references curated bundle definitions (such as the Matt Pocock / AI Hero Engineering Suite and Caveman Suite):

> [!CAUTION]
> ### 🛑 Structural Indivisibility Rule: Never Split Connected Bundles
> Skills belonging to an interconnected ecosystem (e.g. `aihero-mattpocock`, `caveman`) form a cohesive workflow graph:
> - Router skills like `/ask-matt` dispatch to `/grill-with-docs`, `/wayfinder`, `/to-spec`, `/to-tickets`, `/implement`, and `/triage`.
> - Implementation skills like `/implement` invoke `/tdd` and `/code-review`.
> - Upkeep skills like `/diagnosing-bugs` invoke `/improve-codebase-architecture`.
> 
> **NEVER SPLIT A BUNDLE ACROSS GLOBAL AND WAREHOUSE STORAGE.**
> - If a router skill (e.g. `ask-matt`) is kept global, **all 36 connected skills in the suite must remain global together**.
> - If the user requests archiving a suite, **all connected skills must move to the warehouse together**.
> - Archiving an individual skill from an indivisible suite without its dependencies breaks runtime execution and is prohibited.

### 4. Heuristic User Advisory & Categorization
The skill categorizes every discovered skill into 5 distinct groups:
1. **Core System Managers (`CORE_SYSTEM`)**:
   - `skill-manager`, `skill-archiver`, `find-skills`.
   - *Recommendation*: **MUST KEEP GLOBAL** (Required to manage the ecosystem).
2. **Safety Guardrails (`SAFETY_GUARDRAIL`)**:
   - Terminal command interceptors, data-loss protection, execution governance.
   - *Recommendation*: **KEEP GLOBAL** (Protects user operations).
3. **Interconnected Ecosystem Bundles (`INTERCONNECTED_BUNDLE`)**:
   - Cohesive suites (e.g. Matt Pocock / AI Hero Suite: 36 skills; Caveman Suite: 7 skills).
   - *Recommendation*: **DECIDE AT BUNDLE LEVEL**. Must be kept together globally or archived together into the warehouse.
4. **MCP-Linked Integrations (`MCP_LINKED` / `MCP_GENERIC`)**:
   - Skills that interact with configured MCP servers (e.g. GitHub, Stripe, Supabase, Stitch, Graphify).
   - *Recommendation*: **GENTLE CONFIRMATION**. Explains which MCP servers are linked, and asks if the user prefers them always global or on-demand per project.
5. **Specialized Domain Workflows (`SPECIALIZED`)**:
   - Standalone frontend frameworks, cloud tools, isolated data pipelines.
   - *Recommendation*: **SAFE TO ARCHIVE**. Moving them to the warehouse saves prompt tokens on every turn while keeping them 100% accessible on-demand.

### 5. Automatic Catalog Re-Generation (Hybrid Model with Portable Paths)
Whenever skills are archived, migrated, or updated, the skill regenerates:
- **`~/.gemini/skill-library/catalog.json`**: Structured JSON containing skill metadata, dependency links, bundle affiliations, and prompt token savings metrics. Uses universal `~/.gemini/skill-library` paths with forward slashes; zero host usernames or personal temp directories.
- **`~/.gemini/skill-library/CATALOG.md`**: Clean, human-readable Markdown table with visual badges, pack groupings, bundle tags, and direct `view_file` accessibility for the agent.

---

## Conversational Workflows

### Scenario A: Clean up global skills & save tokens
> **User**: *"Analyze my global skills and clean up the prompt"* / *"Optimize my global skills"* / *"Migrate skills"*

**Action:**
1. Run analysis via CLI:
   ```bash
   node <path-to-skill-manager>/bin/skill-manager.cjs analyze
   ```
2. Present the breakdown to the user:
   - Total global skills and current prompt token weight.
   - **Estimated Token Savings Calculation**:
     - *Per single message turn*: ~X tokens liberated.
     - *Per typical 20-message conversation*: ~Y tokens saved.
     - *Percentage prompt bloat reduction*: ~Z%.
   - Detected active MCP servers.
   - Detected Indivisible Bundles (e.g. AI Hero & Matt Pocock Suite with 36 connected skills).
   - Grouped recommendations (Core, Safety, Bundles, MCP-linked, Specialized).
   - Duplicate status (how many are already identically in the warehouse).
3. For **Indivisible Bundles**:
   - Explicitly highlight: *"The AI Hero & Matt Pocock Suite contains 36 interconnected skills (ask-matt, wayfinder, grill-with-docs, tdd, implement, etc.). Would you like to keep the entire suite globally or archive the entire suite to load per-project?"*
   - Never offer to archive part of a bundle while keeping another part.
4. For **MCP-linked skills**, ask confirmation politely:
   *"The following skills connect to your configured MCP servers: [X, Y]. Would you like to keep them active globally or archive them to load only in relevant projects?"*
5. Execute the move for approved items, delete the global copies, and re-index the catalog.
6. Provide a summary of the actual tokens saved in the active session and remind the user to restart or reload Antigravity (`Ctrl+R`).
   Always explain how the user can recall/reactivate archived skills at any time:
   - **Conversational (Primary & Recommended)**: Tell the user they can simply ask in chat at any time (e.g. *"Attiva la suite Matt Pocock in questo progetto"* or *"Activate graphify here"*). The `skill-manager` skill will automatically copy the skill or full kit into `<project-root>/.agents/skills/`.
   - **CLI Terminal (Alternative)**: Mention that they can also run `node <path-to-skill-manager>/bin/skill-manager.cjs activate <name-or-pack>` if they prefer using the terminal.

---

### Scenario B: Ingest a newly created or downloaded skill
> **User**: *"Archive this new skill located in ./my-skill"*

**Action:**
1. Inspect `./my-skill/SKILL.md` to verify frontmatter (`name`, `description`).
2. Run duplicate check against warehouse.
3. If the skill belongs to a bundle, advise user or use `--bundle`.
4. Ingest via CLI:
   ```bash
   node <path-to-skill-manager>/bin/skill-manager.cjs archive "./my-skill" --backup
   ```
5. Confirm to user that the skill is stored dormantly and the catalog is updated.

---

### Scenario C: Check for duplicates
> **User**: *"Are there any duplicates between my global skills and the warehouse?"*

**Action:**
1. Run `node <path-to-skill-manager>/bin/skill-manager.cjs duplicates`.
2. Report identical vs modified copies with file diff details.
