# Curated Skill Packs Reference

Skill packs are curated bundles of complementary skills defined in `catalog/packs.json`. They allow developers and agents to activate an entire toolchain with a single command.

---

## Pre-Configured Packs

### 1. `stitch-ui` - Google Stitch & UI Design
- **Description**: Prototyping, token extraction, and code generation with Google Stitch.
- **Tags**: `stitch`, `design`, `ui`, `react`, `frontend`
- **Included Skills**:
  - `code-to-design`: Code to Stitch converter
  - `design-md`: Design system synthesizer
  - `enhance-prompt`: UI prompt refiner
  - `extract-design-md`: Source code token extractor
  - `extract-static-html`: Self-contained static HTML extractor
  - `generate-design`: Screen generator via Stitch MCP
  - `manage-design-system`: Design system manager via MCP
  - `react-components`: Production React component generator
  - `react-native`: React Native component generator
  - `react-vite-dashboard`: Vite dashboard scaffolding
  - `remotion`: Walkthrough animations
  - `shadcn-ui`: Component integration
  - `stitch-loop`: Incremental baton-passing loop
  - `taste-design`: Anti-generic typography & design principles
  - `upload-to-stitch`: Asset and screenshot uploader

---

### 2. `gcp-bigquery` - Google Cloud Platform & BigQuery
- **Description**: Data engineering, ELT, pipelines, dbt, and BigQuery ML.
- **Tags**: `gcp`, `bigquery`, `data-engineering`, `sql`, `dbt`
- **Included Skills**:
  - `bigquery-data-transfer-service`, `building-data-apps`, `data-autocleaning`
  - `dataform-bigquery`, `dbt-bigquery`, `developing-with-bigquery`
  - `discovering-gcp-data-assets`, `gcloud-auth-verification`
  - `gcp-composer-troubleshooting`, `gcp-data-pipelines`, `gcp-dataflow`
  - `gcp-pipeline-orchestration`, `gcp-pipeline-resource-provisioning`
  - `gcp-spark`, `ml-best-practices`, `ml-training-recipe`, `notebook-guidance`

---

### 3. `bio-research` - Feynman Research & Bioinformatics
- **Description**: Molecular biology, protein folding, single-cell genomics, and remote GPU execution.
- **Tags**: `biology`, `bioinformatics`, `research`, `machine-learning`
- **Included Skills**:
  - `alphafold2`, `boltz`, `borzoi`, `chai1`, `diffdock`, `esmfold2`, `evo2`
  - `fair-esm2`, `ligandmpnn`, `openfold3`, `proteinmpnn`, `scgpt`, `scvi-tools`
  - `solublempnn`, `indication-dossier`, `alpha-research`, `autoresearch`
  - `deep-research`, `literature-review`, `paper-writing`, `modal-compute`, `runpod-compute`

---

### 4. `dev-workflow` - Development & Quality Assurance
- **Description**: Rigorous coding workflows and verification routines.
- **Tags**: `testing`, `tdd`, `debugging`, `review`, `git`
- **Included Skills**:
  - `tdd`: Test-driven development loop
  - `code-review`: Standards and spec review
  - `deming-cycle`: PDCA continuous improvement
  - `diagnosing-bugs`: Root cause analysis
  - `resolving-merge-conflicts`: Git merge & rebase handler
  - `setup-pre-commit`: Husky & lint-staged configuration

---

### 5. `caveman` - Token Efficiency & Brevity
- **Description**: Ultra-compact token-efficient communication.
- **Tags**: `caveman`, `tokens`, `efficiency`, `compression`
- **Included Skills**:
  - `caveman`, `caveman-commit`, `caveman-compress`, `caveman-help`, `caveman-review`, `caveman-stats`, `cavecrew`

---

## Defining Custom Packs

You can define custom packs by editing `packs.json` inside your local warehouse (`~/.gemini/skill-library/packs.json`) or in the repository `catalog/packs.json`:

```json
{
  "packs": {
    "my-custom-pack": {
      "name": "My Custom Stack",
      "description": "Skills for my proprietary development stack",
      "tags": ["custom", "stack"],
      "skills": [
        "skill-a",
        "skill-b"
      ]
    }
  }
}
```

After modifying `packs.json`, run `skill-manager reindex` to update `CATALOG.md` and `catalog.json`.
