# Local Agent Skill Warehouse Catalog

> Generated on **20/09/2026** by `Antigravity Skill-Manager`.
> Total dormant skills: **128** | Total packs: **7** | Estimated prompt tokens saved: **~9020 tokens/turn**

This catalog indexes all skills stored offline in `~/.gemini/skill-library`.
These skills remain dormant until summoned for a specific project (`.agents/skills/`) or globally.

---

> ⚡ **Detected Configured MCP Servers:** `agentmemory`, `github`, `graphify`, `stitch`, `stripe`, `supabase`, `mem0-supabase`, `ruflo`, `notebooks`, `visualization`

### 📦 Pack: AI Hero & Matt Pocock Engineering Suite (`aihero-mattpocock`) `[Indivisible Bundle]`
Comprehensive engineering discipline from aihero.dev and github.com/mattpocock/skills: socratic grilling, wayfinder roadmap charts, spec/ticket planning, TDD, code review, systematic debugging, deep-module architecture, and multi-session workflows.

*Tags:* `aihero`, `mattpocock`, `engineering`, `spec`, `tdd`, `review`, `grilling`, `architecture`

| Skill | MCP | Dependencies | Description |
| :--- | :---: | :--- | :--- |
| `ask-matt` | ⚡ github | `code-review`, `codebase-design`, `diagnosing-bugs...` | Ask which skill or flow fits your situation. A router over the skills in this repo. |
| `setup-matt-pocock-skills` | ⚡ github | `domain-modeling`, `grill-with-docs`, `improve-codebase-architecture...` | Configure this repo for the engineering skills: set up its issue tracker, triage label vocabulary, and domain doc layout. Run once before first use of the other engineering skills. |
| `wayfinder` | - | `prototype`, `research`, `setup-matt-pocock-skills` | Plan a huge chunk of work (more than one agent session can hold) as a shared map of decision tickets on your issue tracker, and resolve them one at a time until the way to the destination is clear. |
| `grill-with-docs` | - | - | A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go. |
| `grill-me` | - | `grilling` | A relentless interview to sharpen a plan or design. |
| `grilling` | - | - | Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases. |
| `domain-modeling` | - | - | Build and sharpen a project's domain model. Use when discussing codebase terminology, writing or editing a CONTEXT.md, or recording or editing an ADR. |
| `codebase-design` | - | - | Shared vocabulary for designing deep modules. Use when the user wants to design or improve a module's interface, find deepening opportunities, decide where a seam goes, make code more testable or AI-navigable, or when another skill needs the deep-module vocabulary. |
| `to-spec` | - | `setup-matt-pocock-skills` | Turn the current conversation into a spec and publish it to the project issue tracker: no interview, just synthesis of what you've already discussed. |
| `to-tickets` | ⚡ github | `setup-matt-pocock-skills` | Break a plan, spec, or the current conversation into a set of tracer-bullet tickets, each declaring its blocking edges, published to the configured tracker (edges as text in one file per ticket locally, or native blocking links on a real tracker). |
| `to-questionnaire` | - | - | Turn a decision you can't fully answer into a questionnaire for someone else to fill in. |
| `implement` | - | `code-review`, `tdd` | Implement a piece of work based on a spec or set of tickets. |
| `implement-spec` | - | `code-review` | Implement a specification in code. |
| `tdd` | - | `codebase-design` | Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests. |
| `code-review` | - | `setup-matt-pocock-skills` | Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes: Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/spec asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to \"review since X\". |
| `prototype` | - | - | Build a throwaway prototype to answer a design question. Use when the user wants to sanity-check whether a state model or logic feels right, or explore what a UI should look like. |
| `diagnosing-bugs` | - | - | Diagnosis loop for hard bugs and performance regressions. Use when the user says "diagnose"/"debug this", or reports something broken/throwing/failing/slow. |
| `resolving-merge-conflicts` | - | - | Use when you need to resolve an in-progress git merge/rebase conflict. |
| `retro` | - | `writing-for-agents` | Conduct a retrospective on a coding session. |
| `triage` | - | `setup-matt-pocock-skills` | Move issues and external PRs through a state machine of triage roles, categorise, verify, grill if needed, and write agent-ready briefs. |
| `wait-what` | - | - | Stop. That last message did not land: re-pitch it. |
| `wizard` | ⚡ github | - | Generate an interactive bash wizard that walks a human through steps only they can perform. Use when provisioning infrastructure, setting up credentials or CI secrets, walking an unfamiliar third-party dashboard, or running a one-off migration or cutover. Don't invoke this for steps the agent can perform itself. |
| `improve-codebase-architecture` | - | `codebase-design`, `domain-modeling`, `grilling` | Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick. |
| `writing-for-agents` | - | - | Writing documents for agents. Use when creating or editing skills, or modifying AGENTS.md or CLAUDE.md. |
| `writing-beats` | - | - | Writing, exploit; assemble raw material into a journey of beats, grounding each term before a beat leans on it. |
| `writing-fragments` | - | - | Writing, explore: mine raw fragments, no structure yet. |
| `writing-shape` | - | - | Writing, exploit: shape raw material into an article, paragraph by paragraph. |
| `teach` | - | - | Teach the user a new skill or concept, within this workspace. |
| `research` | - | - | Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent. |
| `handoff` | - | - | Compact the current conversation into a handoff document for another agent to pick up. |
| `claude-handoff` | - | - | Hand the current conversation off to a fresh background agent that picks up the work immediately. |
| `loop-me` | - | `grilling` | Grill me about specs for the workflows I want to build, within this workspace. |
| `deming-cycle` | - | - | Applica in modo obbligatorio il Ciclo di Deming (PDCA: Plan, Do, Check, Act) per la gestione strutturata, la verifica empirica e il miglioramento continuo di ogni attivita del progetto. |
| `setup-ts-deep-modules` | ⚡ github | `codebase-design` | Wire dependency-cruiser into a TypeScript repo so each package is a deep module, with implementation hidden in subfolders and reachable only through its entry-point files. User-invoked. |
| `setup-pre-commit` | - | - | Set up Husky pre-commit hooks with lint-staged (Prettier), type checking, and tests in the current repo. Use when user wants to add pre-commit hooks, set up Husky, configure lint-staged, or add commit-time formatting/typechecking/testing. |
| `scaffold-exercises` | - | - | Create exercise directory structures with sections, problems, solutions, and explainers that pass linting. Use when user wants to scaffold exercises, create exercise stubs, or set up a new course section. |

---

### 📦 Pack: Google Stitch & UI Design (`stitch-ui`)
Comprehensive UI engineering and prototyping with Google Stitch, React, Tailwind, and Design Systems.

*Tags:* `stitch`, `design`, `ui`, `react`, `frontend`

| Skill | MCP | Dependencies | Description |
| :--- | :---: | :--- | :--- |
| `code-to-design` | ⚡ stitch | `extract-design-md`, `extract-static-html`, `manage-design-system...` | Convert frontend code (Vite, React, Angular, Vue, etc.) to a Stitch Design by chaining |
| `design-md` | ⚡ stitch | - | Analyze Stitch projects and synthesize a semantic design system into DESIGN.md files |
| `enhance-prompt` | ⚡ stitch | - | Transforms vague UI ideas into polished, Stitch-optimized prompts. Enhances specificity, adds UI/UX keywords, injects design system context, and structures output for better generation results. |
| `extract-design-md` | ⚡ stitch | - | Extract a comprehensive design system (DESIGN.md) directly from frontend source |
| `extract-static-html` | ⚡ stitch | - | Extract self-contained static HTML from a built web application or React components by inlining CSS and images. Use this skill whenever you need to capture a specific UI state, share a static version of a page, or prepare assets for Stitch upload, even if the user just asks to 'save the HTML' or 'mock the view'. |
| `generate-design` | ⚡ stitch | - | Generate new screens from text prompts or images, edit existing screens |
| `manage-design-system` | ⚡ stitch | `upload-to-stitch` | Manage design systems in Stitch using MCP tools. Includes retrieval of assets, |
| `react-components` | ⚡ stitch | - | Converts Stitch designs into modular Vite and React components, or syncs/updates |
| `react-native` | ⚡ stitch | - | Convert Stitch HTML designs to React Native components, or syncs/updates existing |
| `react-vite-dashboard` | ⚡ stitch | - | Convert Stitch designs into production React + Vite dashboards with TanStack Query, accessible tokens from DESIGN.md, and Web3-ready patterns (ethers/viem). |
| `remotion` | ⚡ github,stitch | - | Generate walkthrough videos from Stitch projects using Remotion with smooth transitions, zooming, and text overlays |
| `shadcn-ui` | ⚡ MCP | `contributing` | Expert guidance for integrating and building applications with shadcn/ui components, including component discovery, installation, customization, and best practices. |
| `stitch-loop` | ⚡ github,stitch | - | Teaches agents to iteratively build websites using Stitch with an autonomous baton-passing loop pattern |
| `taste-design` | ⚡ stitch | - | Semantic Design System Skill for Google Stitch. Generates agent-friendly DESIGN.md files that enforce premium, anti-generic UI standards — strict typography, calibrated color, asymmetric layouts, perpetual micro-motion, and hardware-accelerated performance. |
| `upload-to-stitch` | ⚡ stitch | - | Upload local assets (images, mockups, extracted HTML, design markdown) to a Stitch project. |

---

### 📦 Pack: Google Cloud Platform & BigQuery (`gcp-bigquery`)
Data engineering, ELT pipelines, dbt, Dataform, Beam/Dataflow, Spark, and BigQuery ML.

*Tags:* `gcp`, `bigquery`, `data-engineering`, `sql`, `dbt`

| Skill | MCP | Dependencies | Description |
| :--- | :---: | :--- | :--- |
| `bigquery-data-transfer-service` | - | - | Discovers and inspects BigQuery Data Transfer Service (DTS) configurations. |
| `building-data-apps` | ⚡ visualization | - | Build modern data apps, dashboards, and interactive reports using either |
| `data-autocleaning` | - | - | Automated data quality and transformation capabilities for Dataform/dbt/BigQuery |
| `dataform-bigquery` | - | - | Expertise in generating clean, correct, and efficient Dataform pipeline |
| `dbt-bigquery` | - | - | Expert guidance for creating, modifying, and optimizing dbt pipelines |
| `developing-with-bigquery` | ⚡ notebooks,visualization | - | A repository of BigQuery-specific logic, knowledge, and specialized standards. |
| `discovering-gcp-data-assets` | ⚡ MCP | - | Finds and inspects data assets within Google Cloud. |
| `gcloud-auth-verification` | ⚡ notebooks | - | Guidelines for identifying and resolving missing Google Cloud authentication |
| `gcp-composer-troubleshooting` | - | - | Provides expert guidance for troubleshooting Cloud Composer (Apache |
| `gcp-data-pipelines` | ⚡ notebooks | `gcp-pipeline-orchestration` | Primary entry point for building, managing, and orchestrating data pipelines |
| `gcp-dataflow` | ⚡ github | - | Guides writing, packaging, executing, and troubleshooting Apache Beam pipelines on Dataflow. Use when creating new pipelines, configuring Flex Templates, or analyzing performance of Dataflow jobs. Capabilities include Java/Python/Go setup, Cloud Build integration, and deep diagnostic analysis of job health and autoscaling. |
| `gcp-pipeline-orchestration` | ⚡ notebooks | - | This skill helps the agent generate or update orchestration pipeline |
| `gcp-pipeline-resource-provisioning` | - | - | Automates declarative resource creation and provisioning for data pipelines, supporting BigQuery, Dataform, Dataproc, BigQuery Data Transfer Service (DTS), and other resources. It manages environment-specific configurations (dev, staging, prod) through a deployment.yaml file. |
| `gcp-spark` | ⚡ notebooks | - | Develops and executes Spark code on Dataproc Clusters and Serverless. |
| `ml-best-practices` | ⚡ visualization | - | CRITICAL RULE: You MUST use this skill whenever the task involves any machine learning tasks or data analysis. |
| `ml-training-recipe` | - | - | Find implementable ML training recipes from papers, datasets, docs, and code. Use when the user wants to fine-tune, train, reproduce, or choose a practical ML method, dataset, hyperparameter setup, or benchmark recipe. |
| `notebook-guidance` | ⚡ notebooks,visualization | - | - |

---

### 📦 Pack: Feynman Research & Bioinformatics (`bio-research`)
Protein folding, single-cell analysis, academic literature synthesis, and remote GPU orchestration.

*Tags:* `biology`, `bioinformatics`, `research`, `machine-learning`

| Skill | MCP | Dependencies | Description |
| :--- | :---: | :--- | :--- |
| `alphafold2` | - | - | Predict or audit protein structures with AlphaFold2-style workflows. Use when a research task needs monomer/multimer structure prediction, MSA/template handling, confidence metrics, or comparison against PDB/AlphaFold references. |
| `boltz` | - | - | Run or plan Boltz biomolecular structure predictions for proteins, complexes, ligands, or nucleic-acid assemblies. Use when a task asks for Boltz setup, inputs, outputs, confidence interpretation, or reproduction. |
| `borzoi` | - | - | Use Borzoi-style regulatory genomics models for sequence-to-expression or variant-effect analysis. Use when the task asks for noncoding variant impact, regulatory sequence design, or expression prediction. |
| `chai1` | - | - | Run or prepare Chai-1 structure predictions for biomolecular complexes. Use when a task asks for Chai-1 inputs, multimers, ligand/nucleic acid structure prediction, or confidence review. |
| `diffdock` | - | - | Run or plan DiffDock molecular docking workflows. Use when a task asks for protein-ligand pose prediction, docking setup, ligand/protein preparation, pose ranking, or docking-result verification. |
| `esmfold2` | - | - | Predict quick protein structures with ESMFold-style workflows. Use when a task needs fast MSA-free folding, sequence triage, variant structure screening, or confidence review. |
| `evo2` | - | - | Use Evo2-style biological sequence models for generation, scoring, or variant-effect analysis. Use when a task asks about DNA/RNA/protein sequence likelihood, editing, design, or long-context biological modeling. |
| `fair-esm2` | - | - | Use ESM2 protein language models for embeddings, mutation scoring, remote homology, or representation analysis. Use when a task needs protein embeddings, zero-shot variant scores, clustering, or sequence-function triage. |
| `ligandmpnn` | - | - | Design protein sequences around ligand or small-molecule contexts with LigandMPNN-style workflows. Use when a task asks for ligand-aware protein design, residue redesign, constraints, or design ranking. |
| `openfold3` | - | - | Run or plan OpenFold3-style structure prediction workflows. Use when a task asks for open protein or complex prediction, setup, model comparison, or reproducibility around OpenFold-family outputs. |
| `proteinmpnn` | - | - | Design protein sequences from fixed backbone structures with ProteinMPNN-style workflows. Use when a task asks for backbone-conditioned sequence design, mutation suggestions, fixed residues, or design filtering. |
| `scgpt` | - | - | Use scGPT-style single-cell foundation model workflows. Use when a task asks for single-cell embeddings, perturbation prediction, cell annotation, batch transfer, or gene-program analysis. |
| `scvi-tools` | - | - | Run scvi-tools single-cell workflows. Use when a task asks for scVI/scANVI setup, latent embeddings, batch correction, differential expression, cell annotation, or reproducible AnnData analysis. |
| `solublempnn` | - | - | Design or screen protein sequences for solubility-aware constraints with SolubleMPNN-style workflows. Use when a task asks for soluble protein design, expression-friendly variants, or solubility risk filtering. |
| `indication-dossier` | - | - | Build a source-backed biomedical indication dossier. Use when a research task asks for disease biology, target rationale, patient segmentation, biomarkers, trials, drugs, competitive landscape, or translational evidence. |
| `alpha-research` | ⚡ github | - | Search, read, and query research papers via Feynman's alphaXiv-backed alpha tools. Use when the user asks about academic papers, wants to find research on a topic, needs to read a specific paper, ask questions about a paper, inspect a paper's code repository, or manage paper annotations. |
| `autoresearch` | - | - | Bounded research experiment loop that tries hypotheses, measures benchmark evidence, keeps what works, and records what fails. Use when the user asks to optimize a research metric, run an experiment loop, improve model/retrieval/evaluation performance iteratively, or benchmark a research hypothesis. |
| `deep-research` | - | - | Run a thorough, source-heavy investigation on any topic. Use when the user asks for deep research, a comprehensive analysis, an in-depth report, or a multi-source investigation. Produces a cited research brief with provenance tracking. |
| `literature-review` | - | - | Run a literature review using paper search and primary-source synthesis. Use when the user asks for a lit review, paper survey, state of the art, or academic landscape summary on a research topic. |
| `paper-writing` | - | - | Turn research findings into a polished paper-style draft with sections, equations, and citations. Use when the user asks to write a paper, draft a report, write up findings, or produce a technical document from collected research. |
| `modal-compute` | - | - | Run explicitly chosen research benchmark or replication jobs on Modal's serverless infrastructure. Use when a Feynman research workflow needs burst remote GPU compute and the Modal CLI is available. |
| `runpod-compute` | - | - | Provision and manage GPU pods on RunPod for explicitly chosen long-running research experiments. Use when a Feynman replication, benchmark, or dataset-heavy research run needs persistent GPU compute with SSH access. |

---

### 📦 Pack: Development & Quality Assurance (`dev-workflow`)
Disciplined software engineering: TDD, systematic debugging, merge resolution, and code reviews.

*Tags:* `testing`, `tdd`, `debugging`, `review`, `git`

| Skill | MCP | Dependencies | Description |
| :--- | :---: | :--- | :--- |
| `tdd` | - | `codebase-design` | Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests. |
| `code-review` | - | `setup-matt-pocock-skills` | Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes: Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/spec asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to \"review since X\". |
| `deming-cycle` | - | - | Applica in modo obbligatorio il Ciclo di Deming (PDCA: Plan, Do, Check, Act) per la gestione strutturata, la verifica empirica e il miglioramento continuo di ogni attivita del progetto. |
| `diagnosing-bugs` | - | - | Diagnosis loop for hard bugs and performance regressions. Use when the user says "diagnose"/"debug this", or reports something broken/throwing/failing/slow. |
| `resolving-merge-conflicts` | - | - | Use when you need to resolve an in-progress git merge/rebase conflict. |
| `setup-pre-commit` | - | - | Set up Husky pre-commit hooks with lint-staged (Prettier), type checking, and tests in the current repo. Use when user wants to add pre-commit hooks, set up Husky, configure lint-staged, or add commit-time formatting/typechecking/testing. |

---

### 📦 Pack: Caveman Token Efficiency (`caveman`) `[Indivisible Bundle]`
Ultra-compact token-efficient communication and review formats.

*Tags:* `caveman`, `tokens`, `efficiency`, `compression`

| Skill | MCP | Dependencies | Description |
| :--- | :---: | :--- | :--- |
| `caveman` | - | - | > |
| `caveman-commit` | - | - | > |
| `caveman-compress` | - | `caveman` | > |
| `caveman-help` | ⚡ github | `caveman`, `caveman-commit`, `caveman-compress...` | > |
| `caveman-review` | - | - | > |
| `caveman-stats` | - | - | > |
| `cavecrew` | - | - | > |

---

### 📦 Pack: Agent & Prompt Authoring (`agent-authoring`)
Tools and guidelines for writing skills, rules, prompts, and agent personas.

*Tags:* `authoring`, `skills`, `rules`, `prompts`

| Skill | MCP | Dependencies | Description |
| :--- | :---: | :--- | :--- |
| `writing-for-agents` | - | - | Writing documents for agents. Use when creating or editing skills, or modifying AGENTS.md or CLAUDE.md. |
| `writing-beats` | - | - | Writing, exploit; assemble raw material into a journey of beats, grounding each term before a beat leans on it. |
| `writing-fragments` | - | - | Writing, explore: mine raw fragments, no structure yet. |
| `writing-shape` | - | - | Writing, exploit: shape raw material into an article, paragraph by paragraph. |
| `skill-creator` | - | - | Create or revise Feynman skills. Use when a research workflow needs a reusable on-demand capability, skill metadata, trigger wording, references, scripts, or skill validation. |

---

## 📚 All Indexed Skills (128)

| Skill | MCP | Bundle | Packs | Description |
| :--- | :---: | :---: | :--- | :--- |
| `alpha-research` | ⚡ github | - | `bio-research` | Search, read, and query research papers via Feynman's alphaXiv-backed alpha tools. Use when the user asks about academic papers, wants to find research on a topic, needs to read a specific paper, ask questions about a paper, inspect a paper's code repository, or manage paper annotations. |
| `alphafold2` | - | - | `bio-research` | Predict or audit protein structures with AlphaFold2-style workflows. Use when a research task needs monomer/multimer structure prediction, MSA/template handling, confidence metrics, or comparison against PDB/AlphaFold references. |
| `android-lint-inspector` | - | - | - | > |
| `ask-matt` | ⚡ github | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Ask which skill or flow fits your situation. A router over the skills in this repo. |
| `autoresearch` | - | - | `bio-research` | Bounded research experiment loop that tries hypotheses, measures benchmark evidence, keeps what works, and records what fails. Use when the user asks to optimize a research metric, run an experiment loop, improve model/retrieval/evaluation performance iteratively, or benchmark a research hypothesis. |
| `bigquery-data-transfer-service` | - | - | `gcp-bigquery` | Discovers and inspects BigQuery Data Transfer Service (DTS) configurations. |
| `boltz` | - | - | `bio-research` | Run or plan Boltz biomolecular structure predictions for proteins, complexes, ligands, or nucleic-acid assemblies. Use when a task asks for Boltz setup, inputs, outputs, confidence interpretation, or reproduction. |
| `borzoi` | - | - | `bio-research` | Use Borzoi-style regulatory genomics models for sequence-to-expression or variant-effect analysis. Use when the task asks for noncoding variant impact, regulatory sequence design, or expression prediction. |
| `building-data-apps` | ⚡ visualization | - | `gcp-bigquery` | Build modern data apps, dashboards, and interactive reports using either |
| `cavecrew` | - | 📦 `caveman` | `caveman` | > |
| `caveman` | - | 📦 `caveman` | `caveman` | > |
| `caveman-commit` | - | 📦 `caveman` | `caveman` | > |
| `caveman-compress` | - | 📦 `caveman` | `caveman` | > |
| `caveman-help` | ⚡ github | 📦 `caveman` | `caveman` | > |
| `caveman-review` | - | 📦 `caveman` | `caveman` | > |
| `caveman-stats` | - | 📦 `caveman` | `caveman` | > |
| `chai1` | - | - | `bio-research` | Run or prepare Chai-1 structure predictions for biomolecular complexes. Use when a task asks for Chai-1 inputs, multimers, ligand/nucleic acid structure prediction, or confidence review. |
| `claude-handoff` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Hand the current conversation off to a fresh background agent that picks up the work immediately. |
| `code-review` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` `dev-workflow` | Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes: Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/spec asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to \"review since X\". |
| `codebase-design` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Shared vocabulary for designing deep modules. Use when the user wants to design or improve a module's interface, find deepening opportunities, decide where a seam goes, make code more testable or AI-navigable, or when another skill needs the deep-module vocabulary. |
| `compute-env-setup` | - | - | - | Set up a reproducible Feynman compute environment for research jobs. Use when a task needs Python/R packages, GPU libraries, containers, Modal, SSH, caches, or managed model runtime setup. |
| `contributing` | - | - | - | Contribute changes to the Feynman repository itself. Use when the task is to add features, fix bugs, update prompts or skills, change install or release behavior, improve docs, or prepare a focused PR against this repo. |
| `customize` | - | - | - | Configure Feynman specialists, skills, connectors, permissions, memory categories, compute providers, and project setup. Use when the task asks to customize the research workbench or create a reusable Feynman research capability. |
| `data-autocleaning` | - | - | `gcp-bigquery` | Automated data quality and transformation capabilities for Dataform/dbt/BigQuery |
| `dataform-bigquery` | - | - | `gcp-bigquery` | Expertise in generating clean, correct, and efficient Dataform pipeline |
| `dbt-bigquery` | - | - | `gcp-bigquery` | Expert guidance for creating, modifying, and optimizing dbt pipelines |
| `deep-research` | - | - | `bio-research` | Run a thorough, source-heavy investigation on any topic. Use when the user asks for deep research, a comprehensive analysis, an in-depth report, or a multi-source investigation. Produces a cited research brief with provenance tracking. |
| `deming-cycle` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` `dev-workflow` | Applica in modo obbligatorio il Ciclo di Deming (PDCA: Plan, Do, Check, Act) per la gestione strutturata, la verifica empirica e il miglioramento continuo di ogni attivita del progetto. |
| `design-md` | ⚡ stitch | - | `stitch-ui` | Analyze Stitch projects and synthesize a semantic design system into DESIGN.md files |
| `developing-with-bigquery` | ⚡ notebooks, visualization | - | `gcp-bigquery` | A repository of BigQuery-specific logic, knowledge, and specialized standards. |
| `diagnosing-bugs` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` `dev-workflow` | Diagnosis loop for hard bugs and performance regressions. Use when the user says "diagnose"/"debug this", or reports something broken/throwing/failing/slow. |
| `diffdock` | - | - | `bio-research` | Run or plan DiffDock molecular docking workflows. Use when a task asks for protein-ligand pose prediction, docking setup, ligand/protein preparation, pose ranking, or docking-result verification. |
| `discovering-gcp-data-assets` | ⚡ MCP | - | `gcp-bigquery` | Finds and inspects data assets within Google Cloud. |
| `docker` | - | - | - | Execute research code inside isolated Docker containers for safe replication, experiments, and benchmarks. Use when the user selects Docker as the execution environment or asks to run code safely, in isolation, or in a sandbox. |
| `domain-modeling` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Build and sharpen a project's domain model. Use when discussing codebase terminology, writing or editing a CONTEXT.md, or recording or editing an ADR. |
| `eli5` | - | - | - | Explain research, papers, or technical ideas in plain English with minimal jargon, concrete analogies, and clear takeaways. Use when the user says "ELI5 this", asks for a simple explanation of a paper or research result, wants jargon removed, or asks what something technically dense actually means. |
| `enhance-prompt` | ⚡ stitch | - | `stitch-ui` | Transforms vague UI ideas into polished, Stitch-optimized prompts. Enhances specificity, adds UI/UX keywords, injects design system context, and structures output for better generation results. |
| `esmfold2` | - | - | `bio-research` | Predict quick protein structures with ESMFold-style workflows. Use when a task needs fast MSA-free folding, sequence triage, variant structure screening, or confidence review. |
| `evo2` | - | - | `bio-research` | Use Evo2-style biological sequence models for generation, scoring, or variant-effect analysis. Use when a task asks about DNA/RNA/protein sequence likelihood, editing, design, or long-context biological modeling. |
| `fair-esm2` | - | - | `bio-research` | Use ESM2 protein language models for embeddings, mutation scoring, remote homology, or representation analysis. Use when a task needs protein embeddings, zero-shot variant scores, clustering, or sequence-function triage. |
| `figure-composer` | - | - | - | Compose a publication-grade multi-panel scientific figure from a claim, dataset, or draft result. Use when the task needs panel planning, consistent figure layout, figure review, or final figure assembly. |
| `figure-style` | - | - | - | Apply scientific plotting and figure-quality rules to a single plot or panel. Use when drawing, cleaning, labeling, or reviewing plots for research artifacts. |
| `gcloud-auth-verification` | ⚡ notebooks | - | `gcp-bigquery` | Guidelines for identifying and resolving missing Google Cloud authentication |
| `gcp-composer-troubleshooting` | - | - | `gcp-bigquery` | Provides expert guidance for troubleshooting Cloud Composer (Apache |
| `gcp-data-pipelines` | ⚡ notebooks | - | `gcp-bigquery` | Primary entry point for building, managing, and orchestrating data pipelines |
| `gcp-dataflow` | ⚡ github | - | `gcp-bigquery` | Guides writing, packaging, executing, and troubleshooting Apache Beam pipelines on Dataflow. Use when creating new pipelines, configuring Flex Templates, or analyzing performance of Dataflow jobs. Capabilities include Java/Python/Go setup, Cloud Build integration, and deep diagnostic analysis of job health and autoscaling. |
| `gcp-pipeline-orchestration` | ⚡ notebooks | - | `gcp-bigquery` | This skill helps the agent generate or update orchestration pipeline |
| `gcp-pipeline-resource-provisioning` | - | - | `gcp-bigquery` | Automates declarative resource creation and provisioning for data pipelines, supporting BigQuery, Dataform, Dataproc, BigQuery Data Transfer Service (DTS), and other resources. It manages environment-specific configurations (dev, staging, prod) through a deployment.yaml file. |
| `gcp-spark` | ⚡ notebooks | - | `gcp-bigquery` | Develops and executes Spark code on Dataproc Clusters and Serverless. |
| `graphify` | ⚡ github, graphify, visualization | - | - | Use for any question about a codebase, its architecture, file relationships, or project content — especially when graphify-out/ exists, where the question should be treated as a graphify query first. Turns any input (code, docs, papers, images, videos) into a persistent knowledge graph with god nodes, community detection, and query/path/explain tools. |
| `grill-me` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | A relentless interview to sharpen a plan or design. |
| `grill-with-docs` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go. |
| `grilling` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases. |
| `handoff` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Compact the current conversation into a handoff document for another agent to pick up. |
| `implement` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Implement a piece of work based on a spec or set of tickets. |
| `implement-spec` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Implement a specification in code. |
| `improve-codebase-architecture` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick. |
| `indication-dossier` | - | - | `bio-research` | Build a source-backed biomedical indication dossier. Use when a research task asks for disease biology, target rationale, patient segmentation, biomarkers, trials, drugs, competitive landscape, or translational evidence. |
| `jobs` | - | - | - | Inspect visible research run state, scheduled research follow-ups when available, and durable watch artifacts. Use when the user asks what's running for a research workflow or wants research-run status. |
| `ligandmpnn` | - | - | `bio-research` | Design protein sequences around ligand or small-molecule contexts with LigandMPNN-style workflows. Use when a task asks for ligand-aware protein design, residue redesign, constraints, or design ranking. |
| `literature-review` | - | - | `bio-research` | Run a literature review using paper search and primary-source synthesis. Use when the user asks for a lit review, paper survey, state of the art, or academic landscape summary on a research topic. |
| `loop-me` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Grill me about specs for the workflows I want to build, within this workspace. |
| `managed-model-endpoints` | - | - | - | Register or audit Feynman-managed model endpoints. Use when a research workflow needs a local or remote model service, endpoint health checks, credential refs, startup scripts, or inference routing. |
| `managing-python-dependencies` | - | - | - | Ensures proper Python dependency management, avoiding global `pip install` and |
| `migrate-to-shoehorn` | - | - | - | Migrate test files from `as` type assertions to @total-typescript/shoehorn. Use when user mentions shoehorn, wants to replace `as` in tests, or needs partial test data. |
| `ml-best-practices` | ⚡ visualization | - | `gcp-bigquery` | CRITICAL RULE: You MUST use this skill whenever the task involves any machine learning tasks or data analysis. |
| `ml-training-recipe` | - | - | `gcp-bigquery` | Find implementable ML training recipes from papers, datasets, docs, and code. Use when the user wants to fine-tune, train, reproduce, or choose a practical ML method, dataset, hyperparameter setup, or benchmark recipe. |
| `modal-compute` | - | - | `bio-research` | Run explicitly chosen research benchmark or replication jobs on Modal's serverless infrastructure. Use when a Feynman research workflow needs burst remote GPU compute and the Modal CLI is available. |
| `notebook-guidance` | ⚡ notebooks, visualization | - | `gcp-bigquery` | - |
| `openfold3` | - | - | `bio-research` | Run or plan OpenFold3-style structure prediction workflows. Use when a task asks for open protein or complex prediction, setup, model comparison, or reproducibility around OpenFold-family outputs. |
| `paper-code-audit` | - | - | - | Compare a paper's claims against its public codebase. Use when the user asks to audit a paper, check code-claim consistency, verify reproducibility of a specific paper, or find mismatches between a paper and its implementation. |
| `paper-narrative` | - | - | - | Shape the scientific story across a manuscript, abstract, figures, and evidence. Use when a task asks for paper structure, figure order, argument flow, missing analyses, or manuscript revision strategy. |
| `paper-writing` | - | - | `bio-research` | Turn research findings into a polished paper-style draft with sections, equations, and citations. Use when the user asks to write a paper, draft a report, write up findings, or produce a technical document from collected research. |
| `pdf-explore` | - | - | - | Read, extract, and cross-check content across scientific PDFs. Use when a task needs methods, figures, tables, citations, accessions, or claims from multiple places in one or more papers. |
| `preview` | - | - | - | Preview Markdown, LaTeX, PDF, or code artifacts when preview commands are visible, or fall back to shell/browser tools. Use when the user wants to review a written artifact, export a report, or view a rendered document. |
| `product-self-knowledge` | - | - | - | Answer questions about Feynman's own product behavior, runtime, settings, commands, skills, connectors, and package state. Use when a response would claim what Feynman can do or how it is wired. |
| `proteinmpnn` | - | - | `bio-research` | Design protein sequences from fixed backbone structures with ProteinMPNN-style workflows. Use when a task asks for backbone-conditioned sequence design, mutation suggestions, fixed residues, or design filtering. |
| `prototype` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Build a throwaway prototype to answer a design question. Use when the user wants to sanity-check whether a state model or logic feels right, or explore what a UI should look like. |
| `react-vite-dashboard` | ⚡ stitch | - | `stitch-ui` | Convert Stitch designs into production React + Vite dashboards with TanStack Query, accessible tokens from DESIGN.md, and Web3-ready patterns (ethers/viem). |
| `remote-compute-modal` | - | - | - | Dispatch Feynman research notebook or experiment jobs to Modal. Use when a task has explicitly chosen Modal for bounded cloud compute, GPU jobs, or reproducible remote execution. |
| `remote-compute-ssh` | - | - | - | Run Feynman research jobs on SSH, Slurm, or lab hosts. Use when a task needs remote host setup, job submission, log harvest, artifact sync, or GPU/cluster execution outside Modal. |
| `remotion` | ⚡ github, stitch | - | `stitch-ui` | Generate walkthrough videos from Stitch projects using Remotion with smooth transitions, zooming, and text overlays |
| `replication` | - | - | - | Plan a replication of a paper, claim, or benchmark, and execute only after an explicit environment choice. Use when the user asks to replicate results, reproduce an experiment, verify a claim empirically, or build a replication package. |
| `research` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent. |
| `research-review` | - | - | - | Run a tough but constructive internal research critique of an AI research artifact. Use when the user asks for a review, critique, feedback on a paper or draft, or wants to identify weaknesses before submission. |
| `resolving-merge-conflicts` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` `dev-workflow` | Use when you need to resolve an in-progress git merge/rebase conflict. |
| `retro` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Conduct a retrospective on a coding session. |
| `runpod-compute` | - | - | `bio-research` | Provision and manage GPU pods on RunPod for explicitly chosen long-running research experiments. Use when a Feynman replication, benchmark, or dataset-heavy research run needs persistent GPU compute with SSH access. |
| `scaffold-exercises` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Create exercise directory structures with sections, problems, solutions, and explainers that pass linting. Use when user wants to scaffold exercises, create exercise stubs, or set up a new course section. |
| `scgpt` | - | - | `bio-research` | Use scGPT-style single-cell foundation model workflows. Use when a task asks for single-cell embeddings, perturbation prediction, cell annotation, batch transfer, or gene-program analysis. |
| `scvi-tools` | - | - | `bio-research` | Run scvi-tools single-cell workflows. Use when a task asks for scVI/scANVI setup, latent embeddings, batch correction, differential expression, cell annotation, or reproducible AnnData analysis. |
| `self-awareness` | - | - | - | Inspect the active Feynman workbench session, artifacts, execution log, settings, and provenance. Use when the task asks what happened in this session, which files were written, what tools ran, or what remains unverified. |
| `session-log` | - | - | - | Write a durable session log capturing completed work, findings, open questions, and next steps. Use when the user asks to log progress, save session notes, write up what was done, or create a research diary entry. |
| `session-search` | - | - | - | Recover prior Feynman work from session transcripts. Use the optional /search command only when it is installed and visible; otherwise search local session JSONL files directly. |
| `setup-matt-pocock-skills` | ⚡ github | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Configure this repo for the engineering skills: set up its issue tracker, triage label vocabulary, and domain doc layout. Run once before first use of the other engineering skills. |
| `setup-pre-commit` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` `dev-workflow` | Set up Husky pre-commit hooks with lint-staged (Prettier), type checking, and tests in the current repo. Use when user wants to add pre-commit hooks, set up Husky, configure lint-staged, or add commit-time formatting/typechecking/testing. |
| `setup-ts-deep-modules` | ⚡ github | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Wire dependency-cruiser into a TypeScript repo so each package is a deep module, with implementation hidden in subfolders and reachable only through its entry-point files. User-invoked. |
| `shadcn-ui` | ⚡ MCP | - | `stitch-ui` | Expert guidance for integrating and building applications with shadcn/ui components, including component discovery, installation, customization, and best practices. |
| `skill-creator` | - | - | `agent-authoring` | Create or revise Feynman skills. Use when a research workflow needs a reusable on-demand capability, skill metadata, trigger wording, references, scripts, or skill validation. |
| `skill-repair` | - | - | - | Use this to fix and re-install agent skills that have failed installation. |
| `solublempnn` | - | - | `bio-research` | Design or screen protein sequences for solubility-aware constraints with SolubleMPNN-style workflows. Use when a task asks for soluble protein design, expression-friendly variants, or solubility risk filtering. |
| `source-comparison` | - | - | - | Compare multiple sources on a topic and produce a grounded comparison matrix. Use when the user asks to compare papers, tools, approaches, frameworks, or claims across multiple sources. |
| `stitch-loop` | ⚡ github, stitch | - | `stitch-ui` | Teaches agents to iteratively build websites using Stitch with an autonomous baton-passing loop pattern |
| `stitch-plugins` | ⚡ stitch | - | - | No description provided |
| `stitch::code-to-design` | ⚡ stitch | - | `stitch-ui` | Convert frontend code (Vite, React, Angular, Vue, etc.) to a Stitch Design by chaining |
| `stitch::extract-design-md` | ⚡ stitch | - | `stitch-ui` | Extract a comprehensive design system (DESIGN.md) directly from frontend source |
| `stitch::extract-static-html` | ⚡ stitch | - | `stitch-ui` | Extract self-contained static HTML from a built web application or React components by inlining CSS and images. Use this skill whenever you need to capture a specific UI state, share a static version of a page, or prepare assets for Stitch upload, even if the user just asks to 'save the HTML' or 'mock the view'. |
| `stitch::generate-design` | ⚡ stitch | - | `stitch-ui` | Generate new screens from text prompts or images, edit existing screens |
| `stitch::manage-design-system` | ⚡ stitch | - | `stitch-ui` | Manage design systems in Stitch using MCP tools. Includes retrieval of assets, |
| `stitch::react-components` | ⚡ stitch | - | `stitch-ui` | Converts Stitch designs into modular Vite and React components, or syncs/updates |
| `stitch::react-native` | ⚡ stitch | - | `stitch-ui` | Convert Stitch HTML designs to React Native components, or syncs/updates existing |
| `stitch::upload-to-stitch` | ⚡ stitch | - | `stitch-ui` | Upload local assets (images, mockups, extracted HTML, design markdown) to a Stitch project. |
| `taste-design` | ⚡ stitch | - | `stitch-ui` | Semantic Design System Skill for Google Stitch. Generates agent-friendly DESIGN.md files that enforce premium, anti-generic UI standards — strict typography, calibrated color, asymmetric layouts, perpetual micro-motion, and hardware-accelerated performance. |
| `tdd` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` `dev-workflow` | Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests. |
| `teach` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Teach the user a new skill or concept, within this workspace. |
| `to-questionnaire` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Turn a decision you can't fully answer into a questionnaire for someone else to fill in. |
| `to-spec` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Turn the current conversation into a spec and publish it to the project issue tracker: no interview, just synthesis of what you've already discussed. |
| `to-tickets` | ⚡ github | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Break a plan, spec, or the current conversation into a set of tracer-bullet tickets, each declaring its blocking edges, published to the configured tracker (edges as text in one file per ticket locally, or native blocking links on a real tracker). |
| `triage` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Move issues and external PRs through a state machine of triage roles, categorise, verify, grill if needed, and write agent-ready briefs. |
| `using-model-endpoint` | - | - | - | Call a configured Feynman model endpoint and interpret its response. Use when a task needs inference from a registered endpoint, remote model API, local model service, or custom connector-backed predictor. |
| `wait-what` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Stop. That last message did not land: re-pitch it. |
| `watch` | - | - | - | Create a research watch baseline and optionally schedule follow-up checks when scheduling tools are visible. Use when the user asks to monitor a field, track new papers, watch for updates, or set up alerts on a research area. |
| `wayfinder` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Plan a huge chunk of work (more than one agent session can hold) as a shared map of decision tickets on your issue tracker, and resolve them one at a time until the way to the destination is clear. |
| `wizard` | ⚡ github | 📦 `aihero-mattpocock` | `aihero-mattpocock` | Generate an interactive bash wizard that walks a human through steps only they can perform. Use when provisioning infrastructure, setting up credentials or CI secrets, walking an unfamiliar third-party dashboard, or running a one-off migration or cutover. Don't invoke this for steps the agent can perform itself. |
| `writing-beats` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` `agent-authoring` | Writing, exploit; assemble raw material into a journey of beats, grounding each term before a beat leans on it. |
| `writing-for-agents` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` `agent-authoring` | Writing documents for agents. Use when creating or editing skills, or modifying AGENTS.md or CLAUDE.md. |
| `writing-fragments` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` `agent-authoring` | Writing, explore: mine raw fragments, no structure yet. |
| `writing-shape` | - | 📦 `aihero-mattpocock` | `aihero-mattpocock` `agent-authoring` | Writing, exploit: shape raw material into an article, paragraph by paragraph. |
