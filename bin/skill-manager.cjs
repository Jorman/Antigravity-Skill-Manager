#!/usr/bin/env node

/**
 * Antigravity Skill Manager (CLI)
 * Lightweight on-demand skill warehouse and loader for Google Antigravity.
 *
 * Zero external dependencies - pure Node.js built-ins.
 * Fully cross-platform (Windows, macOS, Linux) with dynamic user home resolution.
 * Completely dynamic: Zero hardcoded skill names, dynamically inspects user's MCP configurations,
 * detects duplicates, and provides intelligent token-saving advice.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const readline = require('readline');

// ==========================================
// Dynamic Directory Resolution (Zero Hardcoding)
// ==========================================
function getUserHome() {
  return os.homedir();
}

function getLibraryPath() {
  if (process.env.ANTIGRAVITY_SKILL_LIBRARY) {
    return path.resolve(process.env.ANTIGRAVITY_SKILL_LIBRARY);
  }
  return path.join(getUserHome(), '.gemini', 'skill-library');
}

function getGlobalSkillsPath() {
  if (process.env.ANTIGRAVITY_GLOBAL_SKILLS) {
    return path.resolve(process.env.ANTIGRAVITY_GLOBAL_SKILLS);
  }
  return path.join(getUserHome(), '.gemini', 'config', 'skills');
}

function getProjectSkillsPath(targetDir) {
  const root = targetDir ? path.resolve(targetDir) : process.cwd();
  return path.join(root, '.agents', 'skills');
}

function getPacksFilePath() {
  const repoPacks = path.join(__dirname, '..', 'catalog', 'packs.json');
  if (fs.existsSync(repoPacks)) return repoPacks;

  const libraryPacks = path.join(getLibraryPath(), 'packs.json');
  if (fs.existsSync(libraryPacks)) return libraryPacks;

  return null;
}

// ==========================================
// Dynamic MCP Server Discovery
// ==========================================
function getConfiguredMcpServers() {
  const mcpServers = new Set();
  const home = getUserHome();

  const candidateConfigs = [
    process.env.ANTIGRAVITY_MCP_CONFIG,
    path.join(home, '.gemini', 'config', 'mcp_config.json'),
    path.join(home, '.gemini', 'antigravity', 'mcp_config.json'),
    path.join(home, '.gemini', 'antigravity-ide', 'mcp_config.json')
  ].filter(Boolean);

  for (const cfgPath of candidateConfigs) {
    if (fs.existsSync(cfgPath)) {
      try {
        const raw = fs.readFileSync(cfgPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.mcpServers && typeof parsed.mcpServers === 'object') {
          Object.keys(parsed.mcpServers).forEach(name => mcpServers.add(name.toLowerCase()));
        }
      } catch (_) {}
    }
  }

  // Also check antigravity/mcp/ directories
  const mcpDirs = [
    path.join(home, '.gemini', 'antigravity', 'mcp'),
    path.join(home, '.gemini', 'antigravity-ide', 'mcp')
  ];

  for (const mDir of mcpDirs) {
    if (fs.existsSync(mDir)) {
      try {
        const entries = fs.readdirSync(mDir, { withFileTypes: true });
        for (const e of entries) {
          if (e.isDirectory() && !e.name.startsWith('.')) {
            mcpServers.add(e.name.toLowerCase());
          }
        }
      } catch (_) {}
    }
  }

  return Array.from(mcpServers);
}

// ==========================================
// File Hashing & Directory Comparison
// ==========================================
function getFileChecksum(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  } catch (_) {
    return null;
  }
}

function getDirectoryFingerprint(dirPath) {
  if (!fs.existsSync(dirPath)) return null;

  const files = {};
  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      const relPath = path.relative(dirPath, fullPath).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        files[relPath] = getFileChecksum(fullPath);
      }
    }
  }
  walk(dirPath);
  return files;
}

function compareSkillDirectories(sourceDir, targetDir) {
  if (!fs.existsSync(targetDir)) {
    return { status: 'UNIQUE', diff: 'Not present in destination' };
  }

  const srcFiles = getDirectoryFingerprint(sourceDir);
  const tgtFiles = getDirectoryFingerprint(targetDir);

  const srcKeys = Object.keys(srcFiles).sort();
  const tgtKeys = Object.keys(tgtFiles).sort();

  if (srcKeys.length !== tgtKeys.length) {
    return { status: 'MODIFIED', diff: `File count mismatch (${srcKeys.length} vs ${tgtKeys.length})` };
  }

  let hasDiff = false;
  for (const key of srcKeys) {
    if (!tgtFiles[key] || srcFiles[key] !== tgtFiles[key]) {
      hasDiff = true;
      break;
    }
  }

  if (!hasDiff) {
    return { status: 'IDENTICAL', diff: 'Files and checksums match 100%' };
  }

  // Check which one was modified more recently
  const srcMtime = fs.statSync(sourceDir).mtimeMs;
  const tgtMtime = fs.statSync(targetDir).mtimeMs;

  return {
    status: 'MODIFIED',
    diff: srcMtime > tgtMtime ? 'Source is newer' : 'Destination is newer'
  };
}

// ==========================================
// Metadata & Frontmatter Extraction
// ==========================================
function parseYamlFrontmatter(content) {
  const frontmatterMatch = content.match(/^---[\r\n]+([\s\S]*?)[\r\n]+---/);
  if (!frontmatterMatch) {
    return { name: '', description: '' };
  }

  const raw = frontmatterMatch[1];
  let name = '';
  let description = '';

  const nameMatch = raw.match(/^name:\s*(.+)$/m);
  if (nameMatch) {
    name = nameMatch[1].trim().replace(/^['"]|['"]$/g, '');
  }

  const descBlockMatch = raw.match(/^description:\s*(?:>-\s*|\|\s*)?([\s\S]*?)(?=^[a-zA-Z0-9_-]+:|$)/m);
  if (descBlockMatch) {
    description = descBlockMatch[1]
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .join(' ')
      .replace(/^['"]|['"]$/g, '');
  }

  return { name, description };
}

function extractSkillMetadata(skillDir, configuredMcpServers = []) {
  const skillName = path.basename(skillDir);
  const skillMdPath = path.join(skillDir, 'SKILL.md');

  let name = skillName;
  let description = 'No description provided';
  let rawContent = '';
  let tokenEstimate = 0;

  if (fs.existsSync(skillMdPath)) {
    try {
      rawContent = fs.readFileSync(skillMdPath, 'utf8');
      const parsed = parseYamlFrontmatter(rawContent);
      if (parsed.name) name = parsed.name;
      if (parsed.description) description = parsed.description;
      // Frontmatter token estimate (characters / 3.5)
      tokenEstimate = Math.ceil((name.length + description.length + 80) / 3.5);
    } catch (_) {}
  }

  // Dynamic MCP detection:
  // 1. Check against user's configured MCP servers
  const linkedMcpServers = [];
  const lowerContent = rawContent.toLowerCase();

  for (const mcp of configuredMcpServers) {
    const regex = new RegExp(`\\b${mcp}\\b`, 'i');
    if (regex.test(lowerContent) || skillName.toLowerCase().includes(mcp)) {
      linkedMcpServers.push(mcp);
    }
  }

  // 2. Generic MCP invocation
  const hasGenericMcp =
    lowerContent.includes('call_mcp_tool') ||
    lowerContent.includes('mcp_') ||
    lowerContent.includes('mcp server') ||
    lowerContent.includes('mcp tools');

  return {
    name,
    folderName: skillName,
    description,
    path: skillDir,
    tokenEstimate,
    mcpRelated: linkedMcpServers.length > 0 || hasGenericMcp,
    linkedMcpServers: Array.from(new Set(linkedMcpServers)),
    hasGenericMcp
  };
}

// ==========================================
// Packs Loader
// ==========================================
function loadPacks() {
  const packsPath = getPacksFilePath();
  if (!packsPath) return {};

  try {
    const raw = fs.readFileSync(packsPath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed.packs || {};
  } catch (_) {
    return {};
  }
}

// ==========================================
// Deep Dynamic Analysis & Recommendation
// ==========================================
const CORE_SYSTEM_SKILLS = new Set([
  'skill-manager',
  'skill-archiver',
  'find-skills'
]);

function analyzeSkill(skillDir, libraryDir, configuredMcpServers) {
  const meta = extractSkillMetadata(skillDir, configuredMcpServers);
  const warehousePath = path.join(libraryDir, meta.folderName);
  const dupComparison = compareSkillDirectories(skillDir, warehousePath);

  let category = 'SPECIALIZED';
  let recommendation = 'ARCHIVE';
  let reason = 'Domain or workflow capability. Moving to warehouse eliminates prompt token bloat in every conversation turn.';
  let severity = 'info'; // 'info', 'warning', 'critical'

  // 1. Core System
  if (CORE_SYSTEM_SKILLS.has(meta.folderName) || CORE_SYSTEM_SKILLS.has(meta.name)) {
    category = 'CORE_SYSTEM';
    recommendation = 'KEEP_GLOBAL';
    reason = 'Essential manager skill needed to search, activate, or archive other skills.';
    severity = 'critical';
  }
  // 2. Execution Safety / Guardrails
  else if (
    meta.folderName.includes('guardrail') ||
    meta.folderName.includes('data-loss') ||
    meta.folderName.includes('safety') ||
    meta.folderName.includes('prevention') ||
    meta.description.toLowerCase().includes('irreversible data loss') ||
    meta.description.toLowerCase().includes('block dangerous')
  ) {
    category = 'SAFETY_GUARDRAIL';
    recommendation = 'KEEP_GLOBAL';
    reason = 'Execution safety or data-loss guardrail protecting terminal commands. Recommended to keep global.';
    severity = 'warning';
  }
  // 3. Linked to Configured MCP Server
  else if (meta.linkedMcpServers.length > 0) {
    category = 'MCP_LINKED';
    recommendation = 'CONFIRM_USER';
    reason = `Directly integrates with configured MCP server(s): [${meta.linkedMcpServers.join(', ')}]. If used across all projects, keep global. If used only for specific projects, archive.`;
    severity = 'warning';
  }
  // 4. Generic MCP Reference
  else if (meta.hasGenericMcp) {
    category = 'MCP_GENERIC';
    recommendation = 'CONFIRM_USER';
    reason = 'References MCP server or tool execution. Ask user preference before archiving.';
    severity = 'warning';
  }
  // 5. Duplicate Check
  if (dupComparison.status === 'IDENTICAL') {
    reason += ' (Note: An identical copy is ALREADY safely stored in the library warehouse).';
  } else if (dupComparison.status === 'MODIFIED') {
    reason += ` (Caution: Library version differs - ${dupComparison.diff}).`;
  }

  return {
    ...meta,
    category,
    recommendation,
    reason,
    severity,
    duplicateStatus: dupComparison.status,
    duplicateDiff: dupComparison.diff
  };
}

function analyzeAllGlobalSkills() {
  const globalDir = getGlobalSkillsPath();
  const libraryDir = getLibraryPath();
  const configuredMcp = getConfiguredMcpServers();

  if (!fs.existsSync(globalDir)) {
    return { total: 0, skills: [], configuredMcp, summary: {} };
  }

  const entries = fs.readdirSync(globalDir, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const skillPath = path.join(globalDir, entry.name);
    const item = analyzeSkill(skillPath, libraryDir, configuredMcp);
    skills.push(item);
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));

  const summary = {
    core: skills.filter(s => s.category === 'CORE_SYSTEM'),
    safety: skills.filter(s => s.category === 'SAFETY_GUARDRAIL'),
    mcp: skills.filter(s => s.category === 'MCP_LINKED' || s.category === 'MCP_GENERIC'),
    specialized: skills.filter(s => s.category === 'SPECIALIZED'),
    identicalInWarehouse: skills.filter(s => s.duplicateStatus === 'IDENTICAL'),
    modifiedInWarehouse: skills.filter(s => s.duplicateStatus === 'MODIFIED'),
    totalTokens: skills.reduce((sum, s) => sum + s.tokenEstimate, 0)
  };

  return {
    total: skills.length,
    skills,
    configuredMcp,
    summary
  };
}

// ==========================================
// Catalog Re-Indexing (Hybrid: JSON + Markdown)
// ==========================================
function reindexCatalog(options = {}) {
  const libraryDir = getLibraryPath();
  const configuredMcp = getConfiguredMcpServers();
  const verbose = options.verbose !== false;

  if (!fs.existsSync(libraryDir)) {
    fs.mkdirSync(libraryDir, { recursive: true });
  }

  const entries = fs.readdirSync(libraryDir, { withFileTypes: true });
  const skills = [];
  const packs = loadPacks();

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

      const skillPath = path.join(libraryDir, entry.name);
      const meta = extractSkillMetadata(skillPath, configuredMcp);

      // Match with packs
      const matchedPacks = [];
      for (const [packKey, pack] of Object.entries(packs)) {
        if (pack.skills && pack.skills.includes(entry.name)) {
          matchedPacks.push(packKey);
        }
      }

      meta.packs = matchedPacks;
      skills.push(meta);
    }
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));

  const totalEstimatedTokens = skills.reduce((acc, s) => acc + s.tokenEstimate, 0);

  // 1. catalog.json
  const catalogJson = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    libraryPath: libraryDir,
    configuredMcpServers: configuredMcp,
    totalSkills: skills.length,
    estimatedTokensSaved: totalEstimatedTokens,
    packs: Object.keys(packs),
    skills
  };

  const jsonFilePath = path.join(libraryDir, 'catalog.json');
  fs.writeFileSync(jsonFilePath, JSON.stringify(catalogJson, null, 2), 'utf8');

  // Also sync to repository if inside repo
  const repoCatalogJson = path.join(__dirname, '..', 'catalog', 'catalog.json');
  if (fs.existsSync(path.dirname(repoCatalogJson))) {
    try {
      fs.writeFileSync(repoCatalogJson, JSON.stringify(catalogJson, null, 2), 'utf8');
    } catch (_) {}
  }

  // 2. CATALOG.md
  let mdContent = `# Local Agent Skill Warehouse Catalog\n\n`;
  mdContent += `> Generated on **${new Date().toLocaleDateString()}** by \`Antigravity Skill-Manager\`.\n`;
  mdContent += `> Total dormant skills: **${skills.length}** | Total packs: **${Object.keys(packs).length}** | Estimated prompt tokens saved: **~${totalEstimatedTokens.toLocaleString()} tokens/turn**\n\n`;
  mdContent += `This catalog indexes all skills stored offline in \`~/.gemini/skill-library\`.\n`;
  mdContent += `These skills remain dormant until summoned for a specific project (\`.agents/skills/\`) or globally.\n\n`;
  mdContent += `---\n\n`;

  if (configuredMcp.length > 0) {
    mdContent += `> ⚡ **Detected Configured MCP Servers:** \`${configuredMcp.join('`, `')}\`\n\n`;
  }

  // Render Packs
  for (const [packKey, pack] of Object.entries(packs)) {
    mdContent += `### 📦 Pack: ${pack.name} (\`${packKey}\`)\n`;
    mdContent += `${pack.description}\n\n`;
    mdContent += `*Tags:* \`${pack.tags.join('`, `')}\`\n\n`;
    mdContent += `| Skill | MCP | Description |\n`;
    mdContent += `| :--- | :---: | :--- |\n`;

    for (const skillName of pack.skills) {
      const found = skills.find(s => s.folderName === skillName);
      const desc = found ? found.description : 'Specialized pack skill';
      const mcpBadge = found && found.mcpRelated ? (found.linkedMcpServers.length ? `⚡ ${found.linkedMcpServers.join(',')}` : '⚡ MCP') : '-';
      mdContent += `| \`${skillName}\` | ${mcpBadge} | ${desc.replace(/\|/g, '\\|')} |\n`;
    }
    mdContent += `\n---\n\n`;
  }

  // Render All Skills Table
  mdContent += `## 📚 All Indexed Skills (${skills.length})\n\n`;
  mdContent += `| Skill | MCP Dependency | Packs | Description |\n`;
  mdContent += `| :--- | :---: | :--- | :--- |\n`;

  for (const s of skills) {
    const mcpBadge = s.mcpRelated ? (s.linkedMcpServers.length ? `⚡ ${s.linkedMcpServers.join(', ')}` : '⚡ MCP') : '-';
    const packsBadge = s.packs.length > 0 ? s.packs.map(p => `\`${p}\``).join(' ') : '-';
    mdContent += `| \`${s.name}\` | ${mcpBadge} | ${packsBadge} | ${s.description.replace(/\|/g, '\\|')} |\n`;
  }

  const mdFilePath = path.join(libraryDir, 'CATALOG.md');
  fs.writeFileSync(mdFilePath, mdContent, 'utf8');

  const repoCatalogMd = path.join(__dirname, '..', 'catalog', 'CATALOG.md');
  if (fs.existsSync(path.dirname(repoCatalogMd))) {
    try {
      fs.writeFileSync(repoCatalogMd, mdContent, 'utf8');
    } catch (_) {}
  }

  if (verbose) {
    console.log(`\x1b[32m✔ Catalog re-indexed successfully!\x1b[0m`);
    console.log(`  Indexed \x1b[1m${skills.length}\x1b[0m skills in \x1b[36m${libraryDir}\x1b[0m`);
    console.log(`  Detected MCP servers: \x1b[33m${configuredMcp.join(', ') || 'None'}\x1b[0m`);
    console.log(`  Prompt tokens saved per message turn: \x1b[32m~${totalEstimatedTokens.toLocaleString()} tokens\x1b[0m`);
    console.log(`  JSON index: \x1b[90m${jsonFilePath}\x1b[0m`);
    console.log(`  Markdown catalog: \x1b[90m${mdFilePath}\x1b[0m`);
  }

  return catalogJson;
}

function getCatalogData() {
  const jsonPath = path.join(getLibraryPath(), 'catalog.json');
  if (fs.existsSync(jsonPath)) {
    try {
      return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch (_) {}
  }
  return reindexCatalog({ verbose: false });
}

// ==========================================
// Skill Activation & Deactivation
// ==========================================
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function activateSkillOrPack(targetName, options = {}) {
  const libraryDir = getLibraryPath();
  const isGlobal = options.global === true;
  const targetRoot = isGlobal ? getGlobalSkillsPath() : getProjectSkillsPath();
  const packs = loadPacks();

  let skillsToActivate = [];

  if (packs[targetName]) {
    skillsToActivate = packs[targetName].skills;
    console.log(`\x1b[36mActivating pack "${targetName}" (${skillsToActivate.length} skills)...\x1b[0m`);
  } else {
    skillsToActivate = [targetName];
  }

  let successCount = 0;
  for (const skill of skillsToActivate) {
    const sourceDir = path.join(libraryDir, skill);
    const destinationDir = path.join(targetRoot, skill);

    if (!fs.existsSync(sourceDir)) {
      console.log(`\x1b[31m✖ Skill "${skill}" not found in local library (${libraryDir}).\x1b[0m`);
      console.log(`  Online search: npx skills find ${skill}`);
      console.log(`  Install find-skills: npx skills add https://github.com/vercel-labs/skills --skill find-skills`);
      continue;
    }

    try {
      copyDirSync(sourceDir, destinationDir);
      console.log(`  \x1b[32m✔ Activated:\x1b[0m ${skill} -> ${destinationDir}`);
      successCount++;
    } catch (err) {
      console.error(`  \x1b[31m✖ Failed to activate ${skill}:\x1b[0m`, err.message);
    }
  }

  if (successCount > 0) {
    const scope = isGlobal ? 'globally' : 'for current project';
    console.log(`\n\x1b[32m✔ Successfully activated ${successCount} skill(s) ${scope}.\x1b[0m`);
    if (!isGlobal) {
      console.log(`\x1b[90mActive skills located in: ${targetRoot}\x1b[0m`);
    }
  }
}

function deactivateSkill(targetName, options = {}) {
  const isGlobal = options.global === true;
  const targetRoot = isGlobal ? getGlobalSkillsPath() : getProjectSkillsPath();
  const destinationDir = path.join(targetRoot, targetName);

  if (!fs.existsSync(destinationDir)) {
    console.log(`\x1b[33mSkill "${targetName}" is not currently active in ${targetRoot}.\x1b[0m`);
    return;
  }

  try {
    fs.rmSync(destinationDir, { recursive: true, force: true });
    console.log(`\x1b[32m✔ Deactivated skill "${targetName}" from ${destinationDir}.\x1b[0m`);
  } catch (err) {
    console.error(`\x1b[31m✖ Failed to deactivate:\x1b[0m`, err.message);
  }
}

// ==========================================
// Ingest & Archive with Duplicate Control
// ==========================================
function archiveSkill(sourcePath, options = {}) {
  const libraryDir = getLibraryPath();
  const absSource = path.resolve(sourcePath);

  if (!fs.existsSync(absSource)) {
    console.log(`\x1b[31mSource skill path does not exist: ${absSource}\x1b[0m`);
    return;
  }

  const skillName = path.basename(absSource);
  const targetDir = path.join(libraryDir, skillName);

  const cmp = compareSkillDirectories(absSource, targetDir);

  if (cmp.status === 'IDENTICAL' && !options.force) {
    console.log(`\x1b[33mNotice: "${skillName}" already exists identically in the warehouse.\x1b[0m`);
  } else if (cmp.status === 'MODIFIED') {
    console.log(`\x1b[33mWarning: "${skillName}" already exists in warehouse with different content (${cmp.diff}).\x1b[0m`);
    if (options.backup) {
      const backupDir = path.join(libraryDir, `${skillName}.backup-${Date.now()}`);
      copyDirSync(targetDir, backupDir);
      console.log(`  \x1b[36mCreated backup at: ${backupDir}\x1b[0m`);
    }
  }

  copyDirSync(absSource, targetDir);

  const globalPath = getGlobalSkillsPath();
  if (absSource.startsWith(globalPath)) {
    try {
      fs.rmSync(absSource, { recursive: true, force: true });
      console.log(`\x1b[32m✔ Removed from global skills to liberate prompt tokens.\x1b[0m`);
    } catch (_) {}
  }

  reindexCatalog({ verbose: true });
  console.log(`\x1b[32m✔ Archived "${skillName}" successfully!\x1b[0m`);
}

// ==========================================
// Project Inspection & Skill Recommendation
// ==========================================
function inspectProjectEnvironment(projectDir) {
  const root = projectDir ? path.resolve(projectDir) : process.cwd();
  const techSignals = new Set();
  const detectedFiles = [];

  // Check package.json
  const pkgPath = path.join(root, 'package.json');
  if (fs.existsSync(pkgPath)) {
    detectedFiles.push('package.json');
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      const keys = Object.keys(deps).join(' ').toLowerCase();

      if (keys.includes('react')) techSignals.add('react');
      if (keys.includes('vue')) techSignals.add('vue');
      if (keys.includes('next')) techSignals.add('nextjs');
      if (keys.includes('tailwind')) techSignals.add('tailwind');
      if (keys.includes('typescript')) techSignals.add('typescript');
      if (keys.includes('jest') || keys.includes('vitest') || keys.includes('playwright')) techSignals.add('testing');
      if (keys.includes('remotion')) techSignals.add('remotion');
      if (keys.includes('shadcn') || keys.includes('radix')) techSignals.add('shadcn');
      if (keys.includes('stripe')) techSignals.add('stripe');
      if (keys.includes('supabase')) techSignals.add('supabase');
    } catch (_) {}
  }

  // Check Python
  const pyFiles = ['requirements.txt', 'pyproject.toml', 'Pipfile'];
  for (const pf of pyFiles) {
    if (fs.existsSync(path.join(root, pf))) {
      detectedFiles.push(pf);
      techSignals.add('python');
      try {
        const c = fs.readFileSync(path.join(root, pf), 'utf8').toLowerCase();
        if (c.includes('pandas') || c.includes('numpy') || c.includes('polars')) techSignals.add('data-science');
        if (c.includes('torch') || c.includes('tensorflow') || c.includes('transformers')) techSignals.add('ml');
        if (c.includes('bigquery') || c.includes('dbt')) techSignals.add('bigquery');
      } catch (_) {}
    }
  }

  // Check Docker
  if (fs.existsSync(path.join(root, 'Dockerfile')) || fs.existsSync(path.join(root, 'docker-compose.yml'))) {
    detectedFiles.push('Docker');
    techSignals.add('docker');
  }

  // Check Git
  if (fs.existsSync(path.join(root, '.git'))) {
    detectedFiles.push('Git repository');
    techSignals.add('git');
  }

  return { root, detectedFiles, techSignals: Array.from(techSignals) };
}

function recommendSkills(projectDir) {
  const envInfo = inspectProjectEnvironment(projectDir);
  const catalog = getCatalogData();
  const packs = loadPacks();

  console.log(`\n\x1b[1m══════════════════════════════════════════════════════════════════════════\x1b[0m`);
  console.log(`\x1b[1m                 Antigravity Project Skill Recommendations                \x1b[0m`);
  console.log(`\x1b[1m══════════════════════════════════════════════════════════════════════════\x1b[0m\n`);
  console.log(`Inspected Directory:     \x1b[36m${envInfo.root}\x1b[0m`);
  console.log(`Detected Indicators:     \x1b[33m${envInfo.detectedFiles.join(', ') || 'None found'}\x1b[0m`);
  console.log(`Identified Tech Signals: \x1b[32m${envInfo.techSignals.join(', ') || 'General Workflow'}\x1b[0m\n`);

  const recommendations = [];

  if (envInfo.techSignals.includes('react') || envInfo.techSignals.includes('tailwind')) {
    recommendations.push({
      type: 'pack',
      target: 'stitch-ui',
      reason: 'Detected React / Tailwind frontend. Stitch UI provides UI design synthesis, component scaffolding, and CSS cleanup.'
    });
    recommendations.push({
      type: 'skill',
      target: 'react-components',
      reason: 'Converts mockups and HTML into modular, production-ready React components.'
    });
  }

  if (envInfo.techSignals.includes('testing') || envInfo.techSignals.includes('git')) {
    recommendations.push({
      type: 'pack',
      target: 'dev-workflow',
      reason: 'Detected Git repository / testing tooling. Dev-workflow introduces TDD, code-review rigor, and bug diagnostics.'
    });
  }

  if (envInfo.techSignals.includes('bigquery') || envInfo.techSignals.includes('data-science')) {
    recommendations.push({
      type: 'pack',
      target: 'gcp-bigquery',
      reason: 'Detected data engineering or BigQuery assets. Provides dbt, Dataform, and SQL optimization skills.'
    });
  }

  if (envInfo.techSignals.includes('python')) {
    recommendations.push({
      type: 'skill',
      target: 'managing-python-dependencies',
      reason: 'Ensures isolated virtual environments, preventing accidental global pip installs.'
    });
  }

  if (envInfo.techSignals.includes('docker')) {
    recommendations.push({
      type: 'skill',
      target: 'docker',
      reason: 'Provides isolated sandbox container execution for tests and replication.'
    });
  }

  // Always suggest caveman token efficiency
  recommendations.push({
    type: 'pack',
    target: 'caveman',
    reason: 'Token optimization: Cuts token usage ~75% across long agentic sessions.'
  });

  console.log(`\x1b[1mRecommended Skills & Packs for This Workspace:\x1b[0m\n`);
  recommendations.forEach((rec, idx) => {
    const badge = rec.type === 'pack' ? '\x1b[35m[PACK]\x1b[0m' : '\x1b[36m[SKILL]\x1b[0m';
    console.log(`  ${idx + 1}. ${badge} \x1b[1m${rec.target}\x1b[0m`);
    console.log(`     \x1b[90m${rec.reason}\x1b[0m`);
    console.log(`     \x1b[32mActivate with:\x1b[0m skill-manager activate ${rec.target}\n`);
  });

  return { envInfo, recommendations };
}

// ==========================================
// Intelligent Migration & User Advisory
// ==========================================
async function runMigration(options = {}) {
  const analysis = analyzeAllGlobalSkills();
  const libraryDir = getLibraryPath();

  const tokensPerTurn = analysis.summary.totalTokens;
  const tokensPerSession20 = tokensPerTurn * 20;
  const specializedTokens = analysis.summary.specialized.reduce((acc, s) => acc + s.tokenEstimate, 0);
  const potentialSavingsSession = specializedTokens * 20;

  console.log(`\n\x1b[1m══════════════════════════════════════════════════════════════════════════\x1b[0m`);
  console.log(`\x1b[1m               Antigravity Global Skills Advisory & Migration             \x1b[0m`);
  console.log(`\x1b[1m══════════════════════════════════════════════════════════════════════════\x1b[0m\n`);

  console.log(`Detected Active MCP Servers: \x1b[33m${analysis.configuredMcp.join(', ') || 'None'}\x1b[0m`);
  console.log(`Current Global Active Skills: \x1b[36m${analysis.total}\x1b[0m\n`);

  console.log(`\x1b[1m📊 Token Overhead Economics:\x1b[0m`);
  console.log(`  • Current prompt overhead:     \x1b[33m~${tokensPerTurn.toLocaleString()} tokens per message turn\x1b[0m`);
  console.log(`  • Overhead in a 20-turn chat:  \x1b[31m~${tokensPerSession20.toLocaleString()} tokens wasted per session\x1b[0m`);
  console.log(`  • Potential tokens liberated:  \x1b[32m~${potentialSavingsSession.toLocaleString()} tokens saved per 20-turn session\x1b[0m\n`);

  // Group 1: Core Essentials
  console.log(`\x1b[32m[1] Core System Skills - MUST KEEP GLOBAL (${analysis.summary.core.length}):\x1b[0m`);
  analysis.summary.core.forEach(s => {
    console.log(`  • \x1b[1m${s.name}\x1b[0m \x1b[90m(${s.reason})\x1b[0m`);
  });

  // Group 2: Safety Guardrails
  console.log(`\n\x1b[33m[2] Safety Guardrails - RECOMMENDED TO KEEP GLOBAL (${analysis.summary.safety.length}):\x1b[0m`);
  analysis.summary.safety.forEach(s => {
    console.log(`  • \x1b[1m${s.name}\x1b[0m`);
    console.log(`    \x1b[90m${s.reason}\x1b[0m`);
  });

  // Group 3: MCP Linked
  console.log(`\n\x1b[35m[3] Configured MCP Integrations - GENTLE USER CONFIRMATION (${analysis.summary.mcp.length}):\x1b[0m`);
  analysis.summary.mcp.forEach(s => {
    console.log(`  • \x1b[1m${s.name}\x1b[0m \x1b[33m(Servers: ${s.linkedMcpServers.join(', ') || 'Generic MCP'})\x1b[0m`);
    console.log(`    \x1b[90m${s.reason}\x1b[0m`);
  });

  // Group 4: Specialized
  console.log(`\n\x1b[36m[4] Specialized Domain Skills - SAFE TO ARCHIVE (${analysis.summary.specialized.length}):\x1b[0m`);
  console.log(`  \x1b[90mMoving these to the library saves prompt tokens on every turn while keeping them accessible.\x1b[0m`);

  // Duplicate analysis
  console.log(`\n\x1b[1mWarehouse Duplicate Status:\x1b[0m`);
  console.log(`  • Identical copies already in warehouse: \x1b[32m${analysis.summary.identicalInWarehouse.length}\x1b[0m (100% safe to remove from global)`);
  console.log(`  • Modified copies in warehouse: \x1b[33m${analysis.summary.modifiedInWarehouse.length}\x1b[0m`);

  if (options.dryRun) {
    console.log(`\n\x1b[33m[DRY-RUN]: No changes executed.\x1b[0m\n`);
    return analysis;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (str) => new Promise(resolve => rl.question(str, resolve));

  // Step 1: Specialized skills
  if (analysis.summary.specialized.length > 0) {
    console.log('\n----------------------------------------------------------');
    const answer = options.yes ? 'y' : await question(`Archive all ${analysis.summary.specialized.length} specialized domain skills to warehouse? (y/N): `);
    if (answer.toLowerCase() === 'y') {
      for (const skill of analysis.summary.specialized) {
        const target = path.join(libraryDir, skill.folderName);
        copyDirSync(skill.path, target);
        fs.rmSync(skill.path, { recursive: true, force: true });
      }
      console.log(`\x1b[32m✔ Moved ${analysis.summary.specialized.length} skills to warehouse.\x1b[0m`);
    }
  }

  // Step 2: MCP Linked skills
  if (analysis.summary.mcp.length > 0) {
    console.log('\n----------------------------------------------------------');
    console.log('Reviewing MCP-linked skills:');
    for (const mcpSkill of analysis.summary.mcp) {
      const promptText = `Archive "${mcpSkill.name}" (${mcpSkill.linkedMcpServers.join(', ') || 'MCP'}) to warehouse? (y/N) [Default: N to keep global]: `;
      const ans = options.yes ? 'n' : await question(promptText);
      if (ans.toLowerCase() === 'y') {
        const target = path.join(libraryDir, mcpSkill.folderName);
        copyDirSync(mcpSkill.path, target);
        fs.rmSync(mcpSkill.path, { recursive: true, force: true });
        console.log(`  \x1b[32m✔ Moved ${mcpSkill.name} to warehouse.\x1b[0m`);
      } else {
        console.log(`  \x1b[90mPreserved ${mcpSkill.name} in global.\x1b[0m`);
      }
    }
  }

  // Step 3: Safety Guardrails
  if (analysis.summary.safety.length > 0) {
    console.log('\n----------------------------------------------------------');
    console.log('Safety guardrails: Defaulting to PRESERVE in global.');
  }

  rl.close();

  // Reindex catalog
  reindexCatalog({ verbose: true });
  console.log(`\n\x1b[32m✔ Optimization completed! Context window tokens successfully liberated.\x1b[0m\n`);
  return analysis;
}

// ==========================================
// CLI Command Dispatcher
// ==========================================
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  switch (command) {
    case 'reindex':
      reindexCatalog();
      break;

    case 'analyze':
    case 'check': {
      const analysis = analyzeAllGlobalSkills();
      console.log(`\n\x1b[1mAntigravity Global Skills Analysis:\x1b[0m`);
      console.log(`Total Global Skills: \x1b[36m${analysis.total}\x1b[0m (~${analysis.summary.totalTokens} prompt tokens/turn)`);
      console.log(`Detected MCP Servers: \x1b[33m${analysis.configuredMcp.join(', ') || 'None'}\x1b[0m`);
      console.log(`  • Core System:        \x1b[32m${analysis.summary.core.length}\x1b[0m`);
      console.log(`  • Safety Guardrails:  \x1b[33m${analysis.summary.safety.length}\x1b[0m`);
      console.log(`  • MCP Linked:         \x1b[35m${analysis.summary.mcp.length}\x1b[0m`);
      console.log(`  • Specialized Domain: \x1b[36m${analysis.summary.specialized.length}\x1b[0m`);
      console.log(`  • Identical in Lib:   \x1b[32m${analysis.summary.identicalInWarehouse.length}\x1b[0m\n`);
      break;
    }

    case 'duplicates': {
      const analysis = analyzeAllGlobalSkills();
      console.log(`\n\x1b[1mDuplicate Analysis between Global and Warehouse:\x1b[0m\n`);
      const dups = analysis.skills.filter(s => s.duplicateStatus !== 'UNIQUE');
      if (dups.length === 0) {
        console.log(`No duplicates found.`);
      } else {
        dups.forEach(d => {
          const color = d.duplicateStatus === 'IDENTICAL' ? '\x1b[32m' : '\x1b[33m';
          console.log(`  • \x1b[1m${d.name}\x1b[0m: ${color}${d.duplicateStatus}\x1b[0m - ${d.duplicateDiff}`);
        });
      }
      console.log('');
      break;
    }

    case 'search':
    case 'find': {
      const query = args[1];
      if (!query) {
        console.log('\x1b[33mPlease provide a keyword to search.\x1b[0m');
        process.exit(1);
      }
      const cat = getCatalogData();
      const q = query.toLowerCase();
      const results = cat.skills.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.packs.some(p => p.toLowerCase().includes(q))
      );

      console.log(`\nSearch results for "\x1b[36m${query}\x1b[0m" (${results.length} found):\n`);
      if (results.length > 0) {
        results.forEach(r => {
          const mcp = r.mcpRelated ? ' \x1b[33m[MCP]\x1b[0m' : '';
          const p = r.packs.length ? ` \x1b[90m(${r.packs.join(', ')})\x1b[0m` : '';
          console.log(`  • \x1b[1m\x1b[36m${r.name}\x1b[0m${mcp}${p}`);
          console.log(`    \x1b[90m${r.description}\x1b[0m\n`);
        });
      } else {
        console.log(`No local skill matched "${query}".`);
        console.log(`Try searching online: \x1b[36mnpx skills find ${query}\x1b[0m\n`);
      }
      break;
    }

    case 'list': {
      const cat = getCatalogData();
      console.log(`\n\x1b[1mOffline Skill Warehouse (${cat.totalSkills} skills, ~${cat.estimatedTokensSaved} tokens saved):\x1b[0m\n`);
      cat.skills.forEach(s => {
        const mcp = s.mcpRelated ? ' \x1b[33m[MCP]\x1b[0m' : '';
        const p = s.packs.length ? ` \x1b[90m[${s.packs.join(',')}]\x1b[0m` : '';
        console.log(`  • \x1b[36m${s.name}\x1b[0m${mcp}${p}`);
      });
      console.log('');
      break;
    }

    case 'packs': {
      const packs = loadPacks();
      console.log('\n\x1b[1mAvailable Skill Packs:\x1b[0m\n');
      for (const [key, p] of Object.entries(packs)) {
        console.log(`  📦 \x1b[1m\x1b[36m${key}\x1b[0m: ${p.name}`);
        console.log(`     ${p.description}`);
        console.log(`     Skills (${p.skills.length}): \x1b[90m${p.skills.join(', ')}\x1b[0m\n`);
      }
      break;
    }

    case 'activate': {
      const target = args[1];
      if (!target) {
        console.log('\x1b[31mUsage: skill-manager activate <skill-name|pack-name> [--global]\x1b[0m');
        process.exit(1);
      }
      activateSkillOrPack(target, { global: args.includes('--global') });
      break;
    }

    case 'deactivate': {
      const target = args[1];
      if (!target) {
        console.log('\x1b[31mUsage: skill-manager deactivate <skill-name> [--global]\x1b[0m');
        process.exit(1);
      }
      deactivateSkill(target, { global: args.includes('--global') });
      break;
    }

    case 'archive': {
      const target = args[1];
      if (!target) {
        console.log('\x1b[31mUsage: skill-manager archive <path-to-skill-folder>\x1b[0m');
        process.exit(1);
      }
      archiveSkill(target, { backup: args.includes('--backup'), force: args.includes('--force') });
      break;
    }

    case 'migrate': {
      const dryRun = args.includes('--dry-run');
      const yes = args.includes('--yes') || args.includes('-y');
      await runMigration({ dryRun, yes });
      break;
    }

    case 'recommend':
    case 'advise': {
      const targetDir = args[1] || process.cwd();
      recommendSkills(targetDir);
      break;
    }

    case 'status': {
      const cat = getCatalogData();
      const analysis = analyzeAllGlobalSkills();
      console.log('\n\x1b[1mAntigravity Skill Ecosystem Status:\x1b[0m');
      console.log(`  Warehouse location:     \x1b[36m${getLibraryPath()}\x1b[0m`);
      console.log(`  Dormant skills stored:  \x1b[32m${cat.totalSkills}\x1b[0m`);
      console.log(`  Tokens saved per turn:  \x1b[32m~${cat.estimatedTokensSaved} tokens\x1b[0m`);
      console.log(`  Global active skills:   \x1b[33m${analysis.total}\x1b[0m`);
      console.log(`  Configured MCP servers: \x1b[35m${analysis.configuredMcp.join(', ') || 'None'}\x1b[0m`);
      console.log(`  Workspace skills dir:   \x1b[36m${getProjectSkillsPath()}\x1b[0m\n`);
      break;
    }

    case 'help':
    default:
      console.log(`
\x1b[1mAntigravity Skill Manager\x1b[0m - Lightweight on-demand skill warehouse

\x1b[1mUSAGE:\x1b[0m
  skill-manager <command> [arguments]

\x1b[1mCOMMANDS:\x1b[0m
  \x1b[36mrecommend [dir]\x1b[0m          Inspect project tech stack and recommend relevant skills/packs
  \x1b[36manalyze\x1b[0m                  Intelligently inspect global skills, MCP links & token impact
  \x1b[36mduplicates\x1b[0m               Check for identical or conflicting copies in warehouse
  \x1b[36msearch <keyword>\x1b[0m         Search local warehouse by keyword, tag, or pack
  \x1b[36mactivate <name|pack>\x1b[0m     Activate skill or pack in current project (.agents/skills/)
  \x1b[36mactivate <name> --global\x1b[0m Activate skill globally (~/.gemini/config/skills/)
  \x1b[36mdeactivate <name>\x1b[0m        Remove skill from current project (.agents/skills/)
  \x1b[36mlist\x1b[0m                     List all dormant skills in the warehouse
  \x1b[36mpacks\x1b[0m                    List available curated skill packs
  \x1b[36mreindex\x1b[0m                  Regenerate catalog.json and CATALOG.md from warehouse
  \x1b[36marchive <dir>\x1b[0m            Ingest a skill directory into the warehouse and re-index
  \x1b[36mmigrate [--dry-run]\x1b[0m      Analyze, advise, and migrate global skills to warehouse
  \x1b[36mstatus\x1b[0m                   Display library and active skills statistics
  \x1b[36mhelp\x1b[0m                     Show this help screen
`);
      break;
  }
}

// Export internal functions for unit testing
module.exports = {
  getUserHome,
  getLibraryPath,
  getGlobalSkillsPath,
  getProjectSkillsPath,
  getConfiguredMcpServers,
  compareSkillDirectories,
  extractSkillMetadata,
  analyzeSkill,
  analyzeAllGlobalSkills,
  reindexCatalog,
  archiveSkill,
  activateSkillOrPack,
  deactivateSkill,
  inspectProjectEnvironment,
  recommendSkills
};

if (require.main === module) {
  main().catch(err => {
    console.error('\x1b[31mFatal error:\x1b[0m', err);
    process.exit(1);
  });
}
