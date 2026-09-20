# Antigravity Skill Manager 🎛️

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()
[![Antigravity](https://img.shields.io/badge/Antigravity-2.0%2B-purple.svg)]()
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Node%20Builtin)-brightgreen.svg)]()

> **Lightweight, on-demand skill warehouse and activation manager for Google Antigravity.**  
> Decouples specialized skills into an offline local warehouse (`~/.gemini/skill-library/`) and activates them **per-project**, liberating **15,000+ tokens** on every conversation turn.

---

## ⚡ The Problem: Prompt Token Inflation

In Google Antigravity, every skill installed in the global directory (`~/.gemini/config/skills/`) is loaded into the agent's system prompt on **every single interaction turn**:

```
<skills>
You can use specialized 'skills' to help you with complex tasks...
- skill-1: ...
- skill-2: ...
... [55+ skills loaded into EVERY prompt turn] ...
</skills>
```

- With **50+ installed skills**, your system prompt is bloated by **~15,000 to 25,000 tokens per message**.
- In a typical 20-message session, this wastes **300,000+ to 500,000+ tokens** on unused capabilities (e.g. bioinformatics or cloud deployment tools active while writing a simple CSS layout).

---

## 💡 The Solution: Two-Tier Decoupled Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │           Google Antigravity Agent           │
                  └───────▲──────────────────────────────▲───────┘
                          │ (Always loaded: ~1k tokens)  │ (Scoped only to current project)
            ┌─────────────┴─────────────┐  ┌─────────────┴─────────────┐
            │  Global Active Skills     │  │  Project Workspace Skills │
            │ (~/.gemini/config/skills) │  │   (<project>/.agents/     │
            │                           │  │         skills/)          │
            │  • skill-manager          │  │                           │
            │  • skill-archiver         │  │  • react-components       │
            │  • find-skills            │  │  • shadcn-ui              │
            │  • (execution safety)     │  │  • stitch-loop            │
            └───────────────────────────┘  └─────────────▲─────────────┘
                                                         │
                                        On-demand copy   │
                                                         │
                           ┌─────────────────────────────┴─────────────┐
                           │            Offline Warehouse              │
                           │       (~/.gemini/skill-library/)          │
                           │                                           │
                           │  • CATALOG.md (Agent/Human readable)      │
                           │  • catalog.json (Machine fast index)      │
                           │  • packs.json (Curated skill bundles)     │
                           │  • 75+ dormant skills (0 prompt tokens!)  │
                           └───────────────────────────────────────────┘
```

1. **Global Core (`~/.gemini/config/skills/`)**: Keep only essential management tools (`skill-manager`, `skill-archiver`, `find-skills`).
2. **Offline Warehouse (`~/.gemini/skill-library/`)**: Store dozens of dormant skills offline. They consume **0 prompt tokens** until summoned.
3. **Workspace-Level Activation (`<project>/.agents/skills/`)**: Activate skills or curated packs for the specific project you are working in. Antigravity mounts them only in that repository.

### 📊 Token Impact Benchmark

| Metric | Before Skill-Manager | With Skill-Manager | Savings |
| :--- | :---: | :---: | :---: |
| **Global Active Skills** | 55+ skills | 2-4 core skills | **-93%** |
| **Prompt Overhead / Turn** | ~18,500 tokens | ~1,200 tokens | **~17,300 tokens saved / turn** |
| **Cost per 20-Turn Session** | ~370,000 tokens | ~24,000 tokens | **~346,000 tokens saved** |

---

## 🚀 Quickstart Installation

All paths use dynamic user home resolution (`~` or OS user profile). **Zero hardcoded paths**.

### Windows (PowerShell)
```powershell
git clone https://github.com/Jorman/Antigravity-Skill-Manager.git
cd Antigravity-Skill-Manager
.\scripts\install.ps1
```

### macOS / Linux (Bash)
```bash
git clone https://github.com/Jorman/Antigravity-Skill-Manager.git
cd Antigravity-Skill-Manager
chmod +x scripts/install.sh
./scripts/install.sh
```

The installer will:
1. Initialize the offline warehouse at `~/.gemini/skill-library/`.
2. Install the `skill-manager` and `skill-archiver` skills globally into `~/.gemini/config/skills/`.
3. Check and install `find-skills` for online search fallback.
4. Generate the hybrid catalog (`catalog.json` and `CATALOG.md`).

---

## 🧹 Liberate Existing Tokens: Migration Command

If you already have dozens of skills in `~/.gemini/config/skills/`, run the intelligent migration tool:

```bash
# Preview what will be moved
node ./bin/skill-manager.cjs migrate --dry-run

# Run migration
node ./bin/skill-manager.cjs migrate
```

### Safety & MCP Protection
The migration engine automatically:
- **Preserves** core management tools (`skill-manager`, `skill-archiver`, `find-skills`).
- **Detects Important / MCP Skills**: Identifies skills linked to active MCP servers or execution safety guardrails (e.g. `graphify`, `accidental-data-loss-prevention`) and **gently asks confirmation** before touching them.
- **Relocates** specialized domain skills to `~/.gemini/skill-library/` and updates the catalog.

---

## 💬 How to Use in Antigravity Chat

Once installed, talk to Antigravity naturally:

| What you say in chat | What Antigravity does |
| :--- | :--- |
| *"Abbiamo una skill per gestire React o Stitch?"* | Queries the local catalog and presents matching skills with descriptions. |
| *"Cosa mi consigli per questo task?"* | Inspects the project files and recommends relevant local skills or packs. |
| *"Attiva la skill tdd per questo progetto"* | Copies `tdd` into `./.agents/skills/tdd` for the current repository only. |
| *"Attiva il pacchetto stitch-ui"* | Copies all 15 Stitch UI skills into `./.agents/skills/`. |
| *"Cerca una skill online per Web3/Solana"* | Searches `~/.gemini/skill-library/`; if not found, queries online via `find-skills`. |
| *"Archivia questa nuova skill e aggiorna il catalogo"* | Stores the skill in `~/.gemini/skill-library/` and regenerates `catalog.json` and `CATALOG.md`. |

---

## 🛠️ CLI Reference

The zero-dependency CLI `bin/skill-manager.cjs` provides deterministic terminal commands:

```bash
# Search local warehouse by keyword, tag, or pack
node ./bin/skill-manager.cjs search stitch

# List all dormant skills
node ./bin/skill-manager.cjs list

# List available curated packs
node ./bin/skill-manager.cjs packs

# Activate a skill for current project (.agents/skills/)
node ./bin/skill-manager.cjs activate react-components

# Activate an entire pack for current project
node ./bin/skill-manager.cjs activate stitch-ui

# Deactivate / remove a skill from current project
node ./bin/skill-manager.cjs deactivate react-components

# Ingest an external skill folder into warehouse and reindex
node ./bin/skill-manager.cjs archive /path/to/my-skill

# Rebuild catalog.json and CATALOG.md
node ./bin/skill-manager.cjs reindex

# Check system status and token stats
node ./bin/skill-manager.cjs status
```

---

## 📦 Built-In Curated Skill Packs

| Pack | Focus Area | Skills Included |
| :--- | :--- | :--- |
| `stitch-ui` | Google Stitch & UI Design | `code-to-design`, `design-md`, `enhance-prompt`, `extract-design-md`, `generate-design`, `manage-design-system`, `react-components`, `react-native`, `react-vite-dashboard`, `remotion`, `shadcn-ui`, `taste-design`, `upload-to-stitch` |
| `gcp-bigquery` | GCP & BigQuery Data Eng | `bigquery-data-transfer-service`, `building-data-apps`, `data-autocleaning`, `dataform-bigquery`, `dbt-bigquery`, `developing-with-bigquery`, `gcp-data-pipelines`, `gcp-dataflow`, `gcp-spark`, `ml-best-practices` |
| `bio-research` | Bioinformatics & ML | `alphafold2`, `boltz`, `borzoi`, `chai1`, `diffdock`, `esmfold2`, `evo2`, `fair-esm2`, `ligandmpnn`, `openfold3`, `proteinmpnn`, `scgpt`, `scvi-tools`, `deep-research`, `modal-compute`, `runpod-compute` |
| `dev-workflow` | Quality & Testing | `tdd`, `code-review`, `deming-cycle`, `diagnosing-bugs`, `resolving-merge-conflicts`, `setup-pre-commit` |
| `caveman` | Token Compression | `caveman`, `caveman-commit`, `caveman-compress`, `caveman-help`, `caveman-review`, `caveman-stats`, `cavecrew` |
| `agent-authoring`| Prompt & Skill Writing | `writing-for-agents`, `writing-beats`, `writing-fragments`, `writing-shape`, `skill-creator` |

---

## 📂 Project Structure

```
Antigravity-Skill-Manager/
├── bin/
│   └── skill-manager.cjs        # Standalone cross-platform CLI engine (Zero dependencies)
├── catalog/
│   ├── CATALOG.md               # Human/Agent readable catalog table
│   ├── catalog.json             # Structured index for fast queries
│   └── packs.json               # Predefined skill packs
├── docs/
│   ├── ARCHITECTURE.md          # In-depth architectural design & token economics
│   ├── USAGE.md                 # Complete conversational & CLI manual
│   └── PACKS.md                 # Guide to custom skill packs
├── scripts/
│   ├── install.ps1              # One-click Windows PowerShell installer
│   └── install.sh               # One-click macOS / Linux installer
├── skills/
│   ├── skill-manager/           # Discovery, advice, and on-demand project activator
│   │   └── SKILL.md
│   └── skill-archiver/          # Migration, analyzer, and catalog indexer
│       └── SKILL.md
├── test/
│   └── test-cli.cjs             # Automated cross-platform test suite
├── CONTEXT.md                   # Domain model glossary
├── LICENSE                      # MIT License
├── package.json                 # Node package configuration
└── README.md                    # This document
```

---

## 🧪 Testing

Run the automated test suite verifying cross-platform path resolution, sandbox indexing, keyword search, project activation, and deactivation:

```bash
node test/test-cli.cjs
```

---

## 📄 License

Released under the [MIT License](LICENSE). Created for the Google Antigravity developer community.
