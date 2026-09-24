# Antigravity Skill Packs Reference

Skill packs are curated bundles of complementary skills that allow developers and agents to activate an entire toolchain with a single command.

---

## Overview

In Google Antigravity, keeping dozens of skills loaded globally inflates the system prompt token count on every turn. Skill packs enable grouping related skills into logical units stored offline in the warehouse (`~/.gemini/skill-library/`), ready to be activated into a project workspace on demand:

```bash
# View available packs in your local library
skill-manager packs

# Activate all skills in a pack for the current workspace
skill-manager activate <pack-name>
```

---

## Defining Packs in Your Local Warehouse

Each user maintains their pack definitions locally in:
```
~/.gemini/skill-library/packs.json
```

When you run `skill-manager reindex`, the engine scans all dormant skills in `~/.gemini/skill-library/`, cross-references your defined packs, and updates both `catalog.json` and `CATALOG.md`.

### Pack Schema Specification

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "version": "1.0.0",
  "packs": {
    "pack-identifier": {
      "name": "Human-Readable Pack Name",
      "description": "Clear explanation of capabilities provided by this pack.",
      "tags": ["tag1", "tag2", "tag3"],
      "indivisible": false,
      "bundle": false,
      "skills": [
        "skill-one",
        "skill-two",
        "skill-three"
      ]
    }
  }
}
```

### Schema Properties

| Field | Type | Description |
| :--- | :---: | :--- |
| `name` | `string` | Display name of the skill pack. |
| `description` | `string` | Overview of tools and workflows enabled by the pack. |
| `tags` | `array<string>` | Keywords used by the dynamic recommendation engine (`skill-manager recommend`). |
| `indivisible` | `boolean` | If `true`, skills in this pack are coupled at runtime and cannot be archived or activated individually. |
| `bundle` | `boolean` | Alias for `indivisible`. Enforces atomic bundle management. |
| `skills` | `array<string>` | Exact folder names of skills residing in `~/.gemini/skill-library/`. |

---

## Example Pack Configurations

### 1. Frontend & UI Pack Example

```json
{
  "packs": {
    "frontend-suite": {
      "name": "Frontend & UI Design Suite",
      "description": "Component scaffolding, design tokens, and style linting.",
      "tags": ["react", "vue", "tailwind", "ui", "frontend"],
      "skills": [
        "react-components",
        "tailwind-tokens",
        "svg-icons"
      ]
    }
  }
}
```

### 2. Quality & Testing Pack Example

```json
{
  "packs": {
    "quality-assurance": {
      "name": "Quality Assurance & Testing Suite",
      "description": "Test-driven development, code review, and automated checks.",
      "tags": ["testing", "tdd", "quality", "code-review"],
      "skills": [
        "tdd",
        "code-review",
        "systematic-debugging"
      ]
    }
  }
}
```

### 3. Indivisible Workflow Bundle Example

For suites where skills invoke one another at runtime via slash commands or tool calls:

```json
{
  "packs": {
    "engineering-discipline": {
      "name": "Engineering Discipline Suite",
      "description": "Interconnected router and workflow execution skills.",
      "tags": ["spec", "planning", "tdd", "review"],
      "indivisible": true,
      "bundle": true,
      "skills": [
        "workflow-router",
        "spec-writer",
        "task-executor"
      ]
    }
  }
}
```

---

## Dynamic Recommendation & Pack Discovery

The `skill-manager recommend` command inspects project manifests (`package.json`, `pyproject.toml`, `Dockerfile`, `.git`, etc.) and automatically matches identified tech signals against your defined pack `tags`:

- If a project contains `react` and `tailwind`, packs tagged with `react` or `tailwind` are recommended.
- If a project contains a git repository or test suites, quality and review packs are surfaced.
- You can activate any recommended pack with a single CLI command or conversational request to the agent.
