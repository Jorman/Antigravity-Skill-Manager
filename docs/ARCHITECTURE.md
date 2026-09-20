# Skill-Manager Architecture & Token Economics

## The Problem: Global Autoload Token Inflation

In Google Antigravity, every skill installed in the global configuration directory (`~/.gemini/config/skills/`) is discovered and injected into the agent's system prompt on **every single interaction turn**:

```
<skills>
You can use specialized 'skills' to help you with complex tasks. Each skill has a name and a description listed below.
Available skills:
- skill-1 (~/.gemini/config/skills/skill-1/SKILL.md): description...
- skill-2 (~/.gemini/config/skills/skill-2/SKILL.md): description...
... [55+ skills] ...
</skills>
```

### Measured Token Overhead
- Average skill metadata footprint: **250 to 450 tokens** per skill (name, path, multi-line description, instructions).
- With **55 installed skills**, the system prompt incurs an overhead of **~15,000 to 25,000 tokens** on **every request**.
- Across a 20-message debugging or feature session, this wastes **300,000 to 500,000 tokens** on skills completely unrelated to the task at hand (e.g. bioinformatics tools active during a React UI session).

---

## The Solution: Two-Tier Decoupled Architecture

`Antigravity Skill-Manager` introduces a clean, two-tier storage and activation pattern:

```
                  ┌──────────────────────────────────────────────┐
                  │           Google Antigravity Agent           │
                  └───────▲──────────────────────────────▲───────┘
                          │ (Always loaded)              │ (Scoped to workspace)
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

### 1. Minimal Global Core (`~/.gemini/config/skills/`)
Only keep universal tools that help the agent manage skills and ensure command safety:
- `skill-manager`: Search, recommend, and activate skills.
- `skill-archiver`: Ingest, archive, and rebuild catalog indexes.
- `find-skills`: Online fallback engine (`skills.sh`).
- Essential safety guardrails (e.g. data loss prevention).

**Result**: Global prompt overhead drops to **< 1,500 tokens** (a **90%+ reduction**).

### 2. The Offline Warehouse (`~/.gemini/skill-library/`)
A flat offline repository where dormant skills reside without polluting the prompt. Each skill directory contains its standard `SKILL.md` and assets.

### 3. Workspace-Scoped Activation (`<project>/.agents/skills/`)
When working on a specific project, skills are copied into `.agents/skills/`. Antigravity natively discovers and mounts these skills **only** when working within that repository. When you switch to another project, those skills are automatically absent from the prompt.

---

## Catalog Indexing: The Hybrid Model

To combine human/agent readability with algorithmic speed, Skill-Manager generates and synchronizes two catalog representations:

| Feature | `catalog.json` | `CATALOG.md` |
| :--- | :--- | :--- |
| **Primary Consumer** | CLI engine, search scripts, automated tools | Human user, Antigravity `view_file` |
| **Structure** | Structured JSON with arrays, tags, MCP flags | Markdown table grouped by curated packs |
| **Speed** | Sub-millisecond keyword and tag filtering | Instant scanning by language models |
| **Synchronization** | Kept 1:1 in sync via `skill-manager reindex` | Kept 1:1 in sync via `skill-manager reindex` |

---

## Intelligent Migration & Safety Engine

When cleaning up an existing environment with dozens of skills, the migration engine applies a 3-tier heuristic:

1. **Core Essentials**: Automatically preserved in global (`skill-manager`, `skill-archiver`, `find-skills`).
2. **Important / Cautionary Skills**: Identified by analyzing MCP server calls (`call_mcp_tool`) or safety guardrail terms. The user is prompted gently with the rationale before moving.
3. **Specialized Skills**: Safely migrated to the warehouse, freeing prompt tokens immediately.
