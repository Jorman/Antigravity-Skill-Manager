# Antigravity Skill Manager - Usage Guide

This guide covers both **Command Line Interface (CLI)** usage and **Natural Language Conversational Patterns** with the Antigravity agent.

---

## 1. Natural Language Conversation Patterns

Once `skill-manager` and `skill-archiver` are installed in your global configuration (`~/.gemini/config/skills/`), you can interact with them directly in chat using natural language:

### Asking If a Skill Exists
> **User**: *"Abbiamo una skill per gestire i componenti React o Stitch?"*  
> **Agent**: Looks up `catalog.json` / `CATALOG.md` in `~/.gemini/skill-library/`, reports matching skills (`react-components`, `design-md`, `stitch-loop`), and asks if you want to activate them in the project.

### Asking for Recommendations
> **User**: *"Cosa mi consigli per questo progetto di data engineering su BigQuery?"*  
> **Agent**: Inspects the workspace, identifies GCP/SQL workflows, queries `gcp-bigquery` pack, and suggests activating `dbt-bigquery`, `dataform-bigquery`, and `developing-with-bigquery`.

### Activating a Single Skill
> **User**: *"Attiva la skill tdd per questo progetto."*  
> **Agent**: Copies `~/.gemini/skill-library/tdd` into `<project-root>/.agents/skills/tdd` and confirms activation.

### Activating a Predefined Pack
> **User**: *"Attiva tutto il pacchetto Stitch UI."*  
> **Agent**: Reads `packs.json` for `stitch-ui` and copies all 15 related skills into `<project-root>/.agents/skills/`.

### Online Fallback Search
> **User**: *"C'è una skill per Solana o Web3?"*  
> **Agent**: Checks local library; if none is found, executes `npx skills find solana` using `find-skills` and offers to install it.

### Archiving and Cleaning Global Skills
> **User**: *"Archivia le skill che non servono e ripulisci il prompt globale."*  
> **Agent**: Runs pre-analysis, reports specialized skills to move, gently asks confirmation on MCP-linked skills, moves them to `~/.gemini/skill-library/`, and triggers `reindex`.

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

# Activate a skill in the current project (.agents/skills/)
node ./bin/skill-manager.cjs activate react-components

# Activate an entire pack in the current project
node ./bin/skill-manager.cjs activate stitch-ui

# Deactivate a skill from the current project
node ./bin/skill-manager.cjs deactivate react-components

# Ingest an external skill into the warehouse
node ./bin/skill-manager.cjs archive /path/to/my-custom-skill

# Rebuild catalog.json and CATALOG.md
node ./bin/skill-manager.cjs reindex

# Interactive global migration (dry-run)
node ./bin/skill-manager.cjs migrate --dry-run

# Interactive global migration (execution)
node ./bin/skill-manager.cjs migrate
```
