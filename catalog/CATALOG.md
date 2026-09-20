# Local Agent Skill Warehouse Catalog

> Generated on **20/09/2026** by `Antigravity Skill-Manager`.
> Total dormant skills: **77** | Total packs: **6** | Estimated prompt tokens saved: **~5811 tokens/turn**

This catalog indexes all skills stored offline in `~/.gemini/skill-library`.
These skills remain dormant until summoned for a specific project (`.agents/skills/`) or globally.

---

> ⚡ **Detected Configured MCP Servers:** `agentmemory`, `github`, `graphify`, `stitch`, `stripe`, `supabase`, `mem0-supabase`, `ruflo`, `notebooks`, `visualization`

### 📦 Pack: Google Stitch & UI Design (`stitch-ui`)
Comprehensive UI engineering and prototyping with Google Stitch, React, Tailwind, and Design Systems.

*Tags:* `stitch`, `design`, `ui`, `react`, `frontend`

| Skill | MCP | Description |
| :--- | :---: | :--- |
| `code-to-design` | ⚡ stitch | Convert frontend code (Vite, React, Angular, Vue, etc.) to a Stitch Design by chaining |
| `design-md` | ⚡ stitch | Analyze Stitch projects and synthesize a semantic design system into DESIGN.md files |
| `enhance-prompt` | ⚡ stitch | Transforms vague UI ideas into polished, Stitch-optimized prompts. Enhances specificity, adds UI/UX keywords, injects design system context, and structures output for better generation results. |
| `extract-design-md` | ⚡ stitch | Extract a comprehensive design system (DESIGN.md) directly from frontend source |
| `extract-static-html` | ⚡ stitch | Extract self-contained static HTML from a built web application or React components by inlining CSS and images. Use this skill whenever you need to capture a specific UI state, share a static version of a page, or prepare assets for Stitch upload, even if the user just asks to 'save the HTML' or 'mock the view'. |
| `generate-design` | ⚡ stitch | Generate new screens from text prompts or images, edit existing screens |
| `manage-design-system` | ⚡ stitch | Manage design systems in Stitch using MCP tools. Includes retrieval of assets, |
| `react-components` | ⚡ stitch | Converts Stitch designs into modular Vite and React components, or syncs/updates |
| `react-native` | ⚡ stitch | Convert Stitch HTML designs to React Native components, or syncs/updates existing |
| `react-vite-dashboard` | ⚡ stitch | Convert Stitch designs into production React + Vite dashboards with TanStack Query, accessible tokens from DESIGN.md, and Web3-ready patterns (ethers/viem). |
| `remotion` | ⚡ github,stitch | Generate walkthrough videos from Stitch projects using Remotion with smooth transitions, zooming, and text overlays |
| `shadcn-ui` | ⚡ MCP | Expert guidance for integrating and building applications with shadcn/ui components, including component discovery, installation, customization, and best practices. |
| `stitch-loop` | ⚡ github,stitch | Teaches agents to iteratively build websites using Stitch with an autonomous baton-passing loop pattern |
| `taste-design` | ⚡ stitch | Semantic Design System Skill for Google Stitch. Generates agent-friendly DESIGN.md files that enforce premium, anti-generic UI standards — strict typography, calibrated color, asymmetric layouts, perpetual micro-motion, and hardware-accelerated performance. |
| `upload-to-stitch` | ⚡ stitch | Upload local assets (images, mockups, extracted HTML, design markdown) to a Stitch project. |

---

### 📦 Pack: Google Cloud Platform & BigQuery (`gcp-bigquery`)
Data engineering, ELT pipelines, dbt, Dataform, Beam/Dataflow, Spark, and BigQuery ML.

*Tags:* `gcp`, `bigquery`, `data-engineering`, `sql`, `dbt`

| Skill | MCP | Description |
| :--- | :---: | :--- |
| `bigquery-data-transfer-service` | - | Discovers and inspects BigQuery Data Transfer Service (DTS) configurations. |
| `building-data-apps` | ⚡ visualization | Build modern data apps, dashboards, and interactive reports using either |
| `data-autocleaning` | - | Automated data quality and transformation capabilities for Dataform/dbt/BigQuery |
| `dataform-bigquery` | - | Expertise in generating clean, correct, and efficient Dataform pipeline |
| `dbt-bigquery` | - | Expert guidance for creating, modifying, and optimizing dbt pipelines |
| `developing-with-bigquery` | ⚡ notebooks,visualization | A repository of BigQuery-specific logic, knowledge, and specialized standards. |
| `discovering-gcp-data-assets` | ⚡ MCP | Finds and inspects data assets within Google Cloud. |
| `gcloud-auth-verification` | ⚡ notebooks | Guidelines for identifying and resolving missing Google Cloud authentication |
| `gcp-composer-troubleshooting` | - | Provides expert guidance for troubleshooting Cloud Composer (Apache |
| `gcp-data-pipelines` | ⚡ notebooks | Primary entry point for building, managing, and orchestrating data pipelines |
| `gcp-dataflow` | ⚡ github | Guides writing, packaging, executing, and troubleshooting Apache Beam pipelines on Dataflow. Use when creating new pipelines, configuring Flex Templates, or analyzing performance of Dataflow jobs. Capabilities include Java/Python/Go setup, Cloud Build integration, and deep diagnostic analysis of job health and autoscaling. |
| `gcp-pipeline-orchestration` | ⚡ notebooks | This skill helps the agent generate or update orchestration pipeline |
| `gcp-pipeline-resource-provisioning` | - | Automates declarative resource creation and provisioning for data pipelines, supporting BigQuery, Dataform, Dataproc, BigQuery Data Transfer Service (DTS), and other resources. It manages environment-specific configurations (dev, staging, prod) through a deployment.yaml file. |
| `gcp-spark` | ⚡ notebooks | Develops and executes Spark code on Dataproc Clusters and Serverless. |
| `ml-best-practices` | ⚡ visualization | CRITICAL RULE: You MUST use this skill whenever the task involves any machine learning tasks or data analysis. |
| `ml-training-recipe` | - | Find implementable ML training recipes from papers, datasets, docs, and code. Use when the user wants to fine-tune, train, reproduce, or choose a practical ML method, dataset, hyperparameter setup, or benchmark recipe. |
| `notebook-guidance` | ⚡ notebooks,visualization | - |

---

### 📦 Pack: Feynman Research & Bioinformatics (`bio-research`)
Protein folding, single-cell analysis, academic literature synthesis, and remote GPU orchestration.

*Tags:* `biology`, `bioinformatics`, `research`, `machine-learning`

| Skill | MCP | Description |
| :--- | :---: | :--- |
| `alphafold2` | - | Predict or audit protein structures with AlphaFold2-style workflows. Use when a research task needs monomer/multimer structure prediction, MSA/template handling, confidence metrics, or comparison against PDB/AlphaFold references. |
| `boltz` | - | Run or plan Boltz biomolecular structure predictions for proteins, complexes, ligands, or nucleic-acid assemblies. Use when a task asks for Boltz setup, inputs, outputs, confidence interpretation, or reproduction. |
| `borzoi` | - | Use Borzoi-style regulatory genomics models for sequence-to-expression or variant-effect analysis. Use when the task asks for noncoding variant impact, regulatory sequence design, or expression prediction. |
| `chai1` | - | Run or prepare Chai-1 structure predictions for biomolecular complexes. Use when a task asks for Chai-1 inputs, multimers, ligand/nucleic acid structure prediction, or confidence review. |
| `diffdock` | - | Run or plan DiffDock molecular docking workflows. Use when a task asks for protein-ligand pose prediction, docking setup, ligand/protein preparation, pose ranking, or docking-result verification. |
| `esmfold2` | - | Predict quick protein structures with ESMFold-style workflows. Use when a task needs fast MSA-free folding, sequence triage, variant structure screening, or confidence review. |
| `evo2` | - | Use Evo2-style biological sequence models for generation, scoring, or variant-effect analysis. Use when a task asks about DNA/RNA/protein sequence likelihood, editing, design, or long-context biological modeling. |
| `fair-esm2` | - | Use ESM2 protein language models for embeddings, mutation scoring, remote homology, or representation analysis. Use when a task needs protein embeddings, zero-shot variant scores, clustering, or sequence-function triage. |
| `ligandmpnn` | - | Design protein sequences around ligand or small-molecule contexts with LigandMPNN-style workflows. Use when a task asks for ligand-aware protein design, residue redesign, constraints, or design ranking. |
| `openfold3` | - | Run or plan OpenFold3-style structure prediction workflows. Use when a task asks for open protein or complex prediction, setup, model comparison, or reproducibility around OpenFold-family outputs. |
| `proteinmpnn` | - | Design protein sequences from fixed backbone structures with ProteinMPNN-style workflows. Use when a task asks for backbone-conditioned sequence design, mutation suggestions, fixed residues, or design filtering. |
| `scgpt` | - | Use scGPT-style single-cell foundation model workflows. Use when a task asks for single-cell embeddings, perturbation prediction, cell annotation, batch transfer, or gene-program analysis. |
| `scvi-tools` | - | Run scvi-tools single-cell workflows. Use when a task asks for scVI/scANVI setup, latent embeddings, batch correction, differential expression, cell annotation, or reproducible AnnData analysis. |
| `solublempnn` | - | Design or screen protein sequences for solubility-aware constraints with SolubleMPNN-style workflows. Use when a task asks for soluble protein design, expression-friendly variants, or solubility risk filtering. |
| `indication-dossier` | - | Build a source-backed biomedical indication dossier. Use when a research task asks for disease biology, target rationale, patient segmentation, biomarkers, trials, drugs, competitive landscape, or translational evidence. |
| `alpha-research` | ⚡ github | Search, read, and query research papers via Feynman's alphaXiv-backed alpha tools. Use when the user asks about academic papers, wants to find research on a topic, needs to read a specific paper, ask questions about a paper, inspect a paper's code repository, or manage paper annotations. |
| `autoresearch` | - | Bounded research experiment loop that tries hypotheses, measures benchmark evidence, keeps what works, and records what fails. Use when the user asks to optimize a research metric, run an experiment loop, improve model/retrieval/evaluation performance iteratively, or benchmark a research hypothesis. |
| `deep-research` | - | Run a thorough, source-heavy investigation on any topic. Use when the user asks for deep research, a comprehensive analysis, an in-depth report, or a multi-source investigation. Produces a cited research brief with provenance tracking. |
| `literature-review` | - | Run a literature review using paper search and primary-source synthesis. Use when the user asks for a lit review, paper survey, state of the art, or academic landscape summary on a research topic. |
| `paper-writing` | - | Turn research findings into a polished paper-style draft with sections, equations, and citations. Use when the user asks to write a paper, draft a report, write up findings, or produce a technical document from collected research. |
| `modal-compute` | - | Run explicitly chosen research benchmark or replication jobs on Modal's serverless infrastructure. Use when a Feynman research workflow needs burst remote GPU compute and the Modal CLI is available. |
| `runpod-compute` | - | Provision and manage GPU pods on RunPod for explicitly chosen long-running research experiments. Use when a Feynman replication, benchmark, or dataset-heavy research run needs persistent GPU compute with SSH access. |

---

### 📦 Pack: Development & Quality Assurance (`dev-workflow`)
Disciplined software engineering: TDD, systematic debugging, merge resolution, and code reviews.

*Tags:* `testing`, `tdd`, `debugging`, `review`, `git`

| Skill | MCP | Description |
| :--- | :---: | :--- |
| `tdd` | - | Specialized pack skill |
| `code-review` | - | Specialized pack skill |
| `deming-cycle` | - | Specialized pack skill |
| `diagnosing-bugs` | - | Specialized pack skill |
| `resolving-merge-conflicts` | - | Specialized pack skill |
| `setup-pre-commit` | - | Specialized pack skill |

---

### 📦 Pack: Caveman Token Efficiency (`caveman`)
Ultra-compact token-efficient communication and review formats.

*Tags:* `caveman`, `tokens`, `efficiency`, `compression`

| Skill | MCP | Description |
| :--- | :---: | :--- |
| `caveman` | - | Specialized pack skill |
| `caveman-commit` | - | Specialized pack skill |
| `caveman-compress` | - | Specialized pack skill |
| `caveman-help` | - | Specialized pack skill |
| `caveman-review` | - | Specialized pack skill |
| `caveman-stats` | - | Specialized pack skill |
| `cavecrew` | - | Specialized pack skill |

---

### 📦 Pack: Agent & Prompt Authoring (`agent-authoring`)
Tools and guidelines for writing skills, rules, prompts, and agent personas.

*Tags:* `authoring`, `skills`, `rules`, `prompts`

| Skill | MCP | Description |
| :--- | :---: | :--- |
| `writing-for-agents` | - | Specialized pack skill |
| `writing-beats` | - | Specialized pack skill |
| `writing-fragments` | - | Specialized pack skill |
| `writing-shape` | - | Specialized pack skill |
| `skill-creator` | - | Specialized pack skill |

---

## 📚 All Indexed Skills (77)

| Skill | MCP Dependency | Packs | Description |
| :--- | :---: | :--- | :--- |
| `alpha-research` | ⚡ github | `bio-research` | Search, read, and query research papers via Feynman's alphaXiv-backed alpha tools. Use when the user asks about academic papers, wants to find research on a topic, needs to read a specific paper, ask questions about a paper, inspect a paper's code repository, or manage paper annotations. |
| `alphafold2` | - | `bio-research` | Predict or audit protein structures with AlphaFold2-style workflows. Use when a research task needs monomer/multimer structure prediction, MSA/template handling, confidence metrics, or comparison against PDB/AlphaFold references. |
| `autoresearch` | - | `bio-research` | Bounded research experiment loop that tries hypotheses, measures benchmark evidence, keeps what works, and records what fails. Use when the user asks to optimize a research metric, run an experiment loop, improve model/retrieval/evaluation performance iteratively, or benchmark a research hypothesis. |
| `bigquery-data-transfer-service` | - | `gcp-bigquery` | Discovers and inspects BigQuery Data Transfer Service (DTS) configurations. |
| `boltz` | - | `bio-research` | Run or plan Boltz biomolecular structure predictions for proteins, complexes, ligands, or nucleic-acid assemblies. Use when a task asks for Boltz setup, inputs, outputs, confidence interpretation, or reproduction. |
| `borzoi` | - | `bio-research` | Use Borzoi-style regulatory genomics models for sequence-to-expression or variant-effect analysis. Use when the task asks for noncoding variant impact, regulatory sequence design, or expression prediction. |
| `building-data-apps` | ⚡ visualization | `gcp-bigquery` | Build modern data apps, dashboards, and interactive reports using either |
| `chai1` | - | `bio-research` | Run or prepare Chai-1 structure predictions for biomolecular complexes. Use when a task asks for Chai-1 inputs, multimers, ligand/nucleic acid structure prediction, or confidence review. |
| `compute-env-setup` | - | - | Set up a reproducible Feynman compute environment for research jobs. Use when a task needs Python/R packages, GPU libraries, containers, Modal, SSH, caches, or managed model runtime setup. |
| `contributing` | - | - | Contribute changes to the Feynman repository itself. Use when the task is to add features, fix bugs, update prompts or skills, change install or release behavior, improve docs, or prepare a focused PR against this repo. |
| `customize` | - | - | Configure Feynman specialists, skills, connectors, permissions, memory categories, compute providers, and project setup. Use when the task asks to customize the research workbench or create a reusable Feynman research capability. |
| `data-autocleaning` | - | `gcp-bigquery` | Automated data quality and transformation capabilities for Dataform/dbt/BigQuery |
| `dataform-bigquery` | - | `gcp-bigquery` | Expertise in generating clean, correct, and efficient Dataform pipeline |
| `dbt-bigquery` | - | `gcp-bigquery` | Expert guidance for creating, modifying, and optimizing dbt pipelines |
| `deep-research` | - | `bio-research` | Run a thorough, source-heavy investigation on any topic. Use when the user asks for deep research, a comprehensive analysis, an in-depth report, or a multi-source investigation. Produces a cited research brief with provenance tracking. |
| `design-md` | ⚡ stitch | `stitch-ui` | Analyze Stitch projects and synthesize a semantic design system into DESIGN.md files |
| `developing-with-bigquery` | ⚡ notebooks, visualization | `gcp-bigquery` | A repository of BigQuery-specific logic, knowledge, and specialized standards. |
| `diffdock` | - | `bio-research` | Run or plan DiffDock molecular docking workflows. Use when a task asks for protein-ligand pose prediction, docking setup, ligand/protein preparation, pose ranking, or docking-result verification. |
| `discovering-gcp-data-assets` | ⚡ MCP | `gcp-bigquery` | Finds and inspects data assets within Google Cloud. |
| `eli5` | - | - | Explain research, papers, or technical ideas in plain English with minimal jargon, concrete analogies, and clear takeaways. Use when the user says "ELI5 this", asks for a simple explanation of a paper or research result, wants jargon removed, or asks what something technically dense actually means. |
| `enhance-prompt` | ⚡ stitch | `stitch-ui` | Transforms vague UI ideas into polished, Stitch-optimized prompts. Enhances specificity, adds UI/UX keywords, injects design system context, and structures output for better generation results. |
| `esmfold2` | - | `bio-research` | Predict quick protein structures with ESMFold-style workflows. Use when a task needs fast MSA-free folding, sequence triage, variant structure screening, or confidence review. |
| `evo2` | - | `bio-research` | Use Evo2-style biological sequence models for generation, scoring, or variant-effect analysis. Use when a task asks about DNA/RNA/protein sequence likelihood, editing, design, or long-context biological modeling. |
| `fair-esm2` | - | `bio-research` | Use ESM2 protein language models for embeddings, mutation scoring, remote homology, or representation analysis. Use when a task needs protein embeddings, zero-shot variant scores, clustering, or sequence-function triage. |
| `figure-composer` | - | - | Compose a publication-grade multi-panel scientific figure from a claim, dataset, or draft result. Use when the task needs panel planning, consistent figure layout, figure review, or final figure assembly. |
| `figure-style` | - | - | Apply scientific plotting and figure-quality rules to a single plot or panel. Use when drawing, cleaning, labeling, or reviewing plots for research artifacts. |
| `gcloud-auth-verification` | ⚡ notebooks | `gcp-bigquery` | Guidelines for identifying and resolving missing Google Cloud authentication |
| `gcp-composer-troubleshooting` | - | `gcp-bigquery` | Provides expert guidance for troubleshooting Cloud Composer (Apache |
| `gcp-data-pipelines` | ⚡ notebooks | `gcp-bigquery` | Primary entry point for building, managing, and orchestrating data pipelines |
| `gcp-dataflow` | ⚡ github | `gcp-bigquery` | Guides writing, packaging, executing, and troubleshooting Apache Beam pipelines on Dataflow. Use when creating new pipelines, configuring Flex Templates, or analyzing performance of Dataflow jobs. Capabilities include Java/Python/Go setup, Cloud Build integration, and deep diagnostic analysis of job health and autoscaling. |
| `gcp-pipeline-orchestration` | ⚡ notebooks | `gcp-bigquery` | This skill helps the agent generate or update orchestration pipeline |
| `gcp-pipeline-resource-provisioning` | - | `gcp-bigquery` | Automates declarative resource creation and provisioning for data pipelines, supporting BigQuery, Dataform, Dataproc, BigQuery Data Transfer Service (DTS), and other resources. It manages environment-specific configurations (dev, staging, prod) through a deployment.yaml file. |
| `gcp-spark` | ⚡ notebooks | `gcp-bigquery` | Develops and executes Spark code on Dataproc Clusters and Serverless. |
| `indication-dossier` | - | `bio-research` | Build a source-backed biomedical indication dossier. Use when a research task asks for disease biology, target rationale, patient segmentation, biomarkers, trials, drugs, competitive landscape, or translational evidence. |
| `jobs` | - | - | Inspect visible research run state, scheduled research follow-ups when available, and durable watch artifacts. Use when the user asks what's running for a research workflow or wants research-run status. |
| `ligandmpnn` | - | `bio-research` | Design protein sequences around ligand or small-molecule contexts with LigandMPNN-style workflows. Use when a task asks for ligand-aware protein design, residue redesign, constraints, or design ranking. |
| `literature-review` | - | `bio-research` | Run a literature review using paper search and primary-source synthesis. Use when the user asks for a lit review, paper survey, state of the art, or academic landscape summary on a research topic. |
| `managed-model-endpoints` | - | - | Register or audit Feynman-managed model endpoints. Use when a research workflow needs a local or remote model service, endpoint health checks, credential refs, startup scripts, or inference routing. |
| `ml-best-practices` | ⚡ visualization | `gcp-bigquery` | CRITICAL RULE: You MUST use this skill whenever the task involves any machine learning tasks or data analysis. |
| `ml-training-recipe` | - | `gcp-bigquery` | Find implementable ML training recipes from papers, datasets, docs, and code. Use when the user wants to fine-tune, train, reproduce, or choose a practical ML method, dataset, hyperparameter setup, or benchmark recipe. |
| `modal-compute` | - | `bio-research` | Run explicitly chosen research benchmark or replication jobs on Modal's serverless infrastructure. Use when a Feynman research workflow needs burst remote GPU compute and the Modal CLI is available. |
| `notebook-guidance` | ⚡ notebooks, visualization | `gcp-bigquery` | - |
| `openfold3` | - | `bio-research` | Run or plan OpenFold3-style structure prediction workflows. Use when a task asks for open protein or complex prediction, setup, model comparison, or reproducibility around OpenFold-family outputs. |
| `paper-code-audit` | - | - | Compare a paper's claims against its public codebase. Use when the user asks to audit a paper, check code-claim consistency, verify reproducibility of a specific paper, or find mismatches between a paper and its implementation. |
| `paper-narrative` | - | - | Shape the scientific story across a manuscript, abstract, figures, and evidence. Use when a task asks for paper structure, figure order, argument flow, missing analyses, or manuscript revision strategy. |
| `paper-writing` | - | `bio-research` | Turn research findings into a polished paper-style draft with sections, equations, and citations. Use when the user asks to write a paper, draft a report, write up findings, or produce a technical document from collected research. |
| `pdf-explore` | - | - | Read, extract, and cross-check content across scientific PDFs. Use when a task needs methods, figures, tables, citations, accessions, or claims from multiple places in one or more papers. |
| `product-self-knowledge` | - | - | Answer questions about Feynman's own product behavior, runtime, settings, commands, skills, connectors, and package state. Use when a response would claim what Feynman can do or how it is wired. |
| `proteinmpnn` | - | `bio-research` | Design protein sequences from fixed backbone structures with ProteinMPNN-style workflows. Use when a task asks for backbone-conditioned sequence design, mutation suggestions, fixed residues, or design filtering. |
| `react-vite-dashboard` | ⚡ stitch | `stitch-ui` | Convert Stitch designs into production React + Vite dashboards with TanStack Query, accessible tokens from DESIGN.md, and Web3-ready patterns (ethers/viem). |
| `remote-compute-modal` | - | - | Dispatch Feynman research notebook or experiment jobs to Modal. Use when a task has explicitly chosen Modal for bounded cloud compute, GPU jobs, or reproducible remote execution. |
| `remote-compute-ssh` | - | - | Run Feynman research jobs on SSH, Slurm, or lab hosts. Use when a task needs remote host setup, job submission, log harvest, artifact sync, or GPU/cluster execution outside Modal. |
| `remotion` | ⚡ github, stitch | `stitch-ui` | Generate walkthrough videos from Stitch projects using Remotion with smooth transitions, zooming, and text overlays |
| `replication` | - | - | Plan a replication of a paper, claim, or benchmark, and execute only after an explicit environment choice. Use when the user asks to replicate results, reproduce an experiment, verify a claim empirically, or build a replication package. |
| `research-review` | - | - | Run a tough but constructive internal research critique of an AI research artifact. Use when the user asks for a review, critique, feedback on a paper or draft, or wants to identify weaknesses before submission. |
| `runpod-compute` | - | `bio-research` | Provision and manage GPU pods on RunPod for explicitly chosen long-running research experiments. Use when a Feynman replication, benchmark, or dataset-heavy research run needs persistent GPU compute with SSH access. |
| `scgpt` | - | `bio-research` | Use scGPT-style single-cell foundation model workflows. Use when a task asks for single-cell embeddings, perturbation prediction, cell annotation, batch transfer, or gene-program analysis. |
| `scvi-tools` | - | `bio-research` | Run scvi-tools single-cell workflows. Use when a task asks for scVI/scANVI setup, latent embeddings, batch correction, differential expression, cell annotation, or reproducible AnnData analysis. |
| `self-awareness` | - | - | Inspect the active Feynman workbench session, artifacts, execution log, settings, and provenance. Use when the task asks what happened in this session, which files were written, what tools ran, or what remains unverified. |
| `session-log` | - | - | Write a durable session log capturing completed work, findings, open questions, and next steps. Use when the user asks to log progress, save session notes, write up what was done, or create a research diary entry. |
| `session-search` | - | - | Recover prior Feynman work from session transcripts. Use the optional /search command only when it is installed and visible; otherwise search local session JSONL files directly. |
| `shadcn-ui` | ⚡ MCP | `stitch-ui` | Expert guidance for integrating and building applications with shadcn/ui components, including component discovery, installation, customization, and best practices. |
| `solublempnn` | - | `bio-research` | Design or screen protein sequences for solubility-aware constraints with SolubleMPNN-style workflows. Use when a task asks for soluble protein design, expression-friendly variants, or solubility risk filtering. |
| `source-comparison` | - | - | Compare multiple sources on a topic and produce a grounded comparison matrix. Use when the user asks to compare papers, tools, approaches, frameworks, or claims across multiple sources. |
| `stitch-loop` | ⚡ github, stitch | `stitch-ui` | Teaches agents to iteratively build websites using Stitch with an autonomous baton-passing loop pattern |
| `stitch-plugins` | ⚡ stitch | - | No description provided |
| `stitch::code-to-design` | ⚡ stitch | `stitch-ui` | Convert frontend code (Vite, React, Angular, Vue, etc.) to a Stitch Design by chaining |
| `stitch::extract-design-md` | ⚡ stitch | `stitch-ui` | Extract a comprehensive design system (DESIGN.md) directly from frontend source |
| `stitch::extract-static-html` | ⚡ stitch | `stitch-ui` | Extract self-contained static HTML from a built web application or React components by inlining CSS and images. Use this skill whenever you need to capture a specific UI state, share a static version of a page, or prepare assets for Stitch upload, even if the user just asks to 'save the HTML' or 'mock the view'. |
| `stitch::generate-design` | ⚡ stitch | `stitch-ui` | Generate new screens from text prompts or images, edit existing screens |
| `stitch::manage-design-system` | ⚡ stitch | `stitch-ui` | Manage design systems in Stitch using MCP tools. Includes retrieval of assets, |
| `stitch::react-components` | ⚡ stitch | `stitch-ui` | Converts Stitch designs into modular Vite and React components, or syncs/updates |
| `stitch::react-native` | ⚡ stitch | `stitch-ui` | Convert Stitch HTML designs to React Native components, or syncs/updates existing |
| `stitch::upload-to-stitch` | ⚡ stitch | `stitch-ui` | Upload local assets (images, mockups, extracted HTML, design markdown) to a Stitch project. |
| `taste-design` | ⚡ stitch | `stitch-ui` | Semantic Design System Skill for Google Stitch. Generates agent-friendly DESIGN.md files that enforce premium, anti-generic UI standards — strict typography, calibrated color, asymmetric layouts, perpetual micro-motion, and hardware-accelerated performance. |
| `using-model-endpoint` | - | - | Call a configured Feynman model endpoint and interpret its response. Use when a task needs inference from a registered endpoint, remote model API, local model service, or custom connector-backed predictor. |
| `watch` | - | - | Create a research watch baseline and optionally schedule follow-up checks when scheduling tools are visible. Use when the user asks to monitor a field, track new papers, watch for updates, or set up alerts on a research area. |
