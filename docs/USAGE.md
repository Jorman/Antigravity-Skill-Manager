# Antigravity Skill Manager - Usage Guide

This guide covers both **Command Line Interface (CLI)** usage and **Natural Language Conversational Patterns** with the Antigravity agent.

---

## 1. Natural Language Conversation Patterns

Once `skill-manager` and `skill-archiver` are installed in your global configuration (`~/.gemini/config/skills/`), you can interact with them directly in chat using natural language:

### Asking If a Skill Exists
> **User**: *"Do we have a skill to manage React components or Google Stitch?"*  
> **Agent**: Looks up `catalog.json` / `CATALOG.md` in `~/.gemini/skill-library/`, reports matching skills (`react-components`, `design-md`, `stitch-loop`), and asks if you want to activate them in the project.

### Asking for Recommendations
> **User**: *"What skills do you recommend for this BigQuery data engineering project?"*  
> **Agent**: Inspects the workspace, identifies GCP/SQL workflows, queries `gcp-bigquery` pack, and suggests activating `dbt-bigquery`, `dataform-bigquery`, and `developing-with-bigquery`.

### Activating a Single Skill
> **User**: *"Activate the tdd skill for this project."*  
> **Agent**: Copies `~/.gemini/skill-library/tdd` into `<project-root>/.agents/skills/tdd` and confirms activation.

### Activating a Predefined Pack
> **User**: *"Activate the entire Stitch UI pack."*  
> **Agent**: Reads `packs.json` for `stitch-ui` and copies all 15 related skills into `<project-root>/.agents/skills/`.

### Online Fallback Search
> **User**: *"Is there a skill for Solana or Web3?"*  
> **Agent**: Checks local library; if none is found, executes `npx skills find solana` using `find-skills` and offers to install it.

### Archiving and Cleaning Global Skills
> **User**: *"Archive unnecessary skills and clean up the global system prompt."*  
> **Agent**: Runs pre-analysis, reports specialized skills to move, calculates prompt tokens saved per turn, gently asks confirmation on MCP-linked skills, moves them to `~/.gemini/skill-library/`, and triggers `reindex`.

---

## 2. Command Line Interface (CLI)

The CLI tool `skill-manager.cjs` provides deterministic terminal commands across Windows, macOS, and Linux:

```bash
# General help
node ./bin/skill-manager.cjs help

# Display system status & token efficiency
node ./bin/skill-manager.cjs status

# Search local warehouse by keyword or tag
node ./bin/skill-manager.cjs search stitch
node ./bin/skill-manager.cjs search bigquery

# List all dormant skills
node ./bin/skill-manager.cjs list

# List curated skill packs
node ./bin/skill-manager.cjs packs

# List indivisible bundles and inspect member skills
node ./bin/skill-manager.cjs bundles
node ./bin/skill-manager.cjs bundle ask-matt

# Activate a skill in the current project (.agents/skills/)
node ./bin/skill-manager.cjs activate react-components

# Activate an entire pack or indivisible bundle in the current project
node ./bin/skill-manager.cjs activate stitch-ui
node ./bin/skill-manager.cjs activate aihero-mattpocock

# Deactivate a skill from the current project
node ./bin/skill-manager.cjs deactivate react-components

# Ingest an external skill into the warehouse
node ./bin/skill-manager.cjs archive /path/to/my-custom-skill

# Archive an entire indivisible bundle together
node ./bin/skill-manager.cjs archive /path/to/ask-matt --bundle

# Rebuild catalog.json and CATALOG.md
node ./bin/skill-manager.cjs reindex

# Interactive global migration (dry-run)
node ./bin/skill-manager.cjs migrate --dry-run

# Interactive global migration (execution)
node ./bin/skill-manager.cjs migrate
```
