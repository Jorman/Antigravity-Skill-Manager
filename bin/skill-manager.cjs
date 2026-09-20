#!/usr/bin/env node

/**
 * Antigravity Skill Manager (CLI)
 * Lightweight on-demand skill warehouse and loader for Google Antigravity.
 *
 * Zero external dependencies - pure Node.js built-ins.
 * Fully cross-platform (Windows, macOS, Linux) with dynamic user home resolution.
 * Completely dynamic: Zero hardcoded skill names, dynamically inspects user's MCP configurations,
 * detects duplicates, enforces indivisible skill bundles & dependency graphs,
 * manages global and project-scoped MCP server isolation,
 * and provides intelligent token-saving advice.
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

function sanitizePath(p) {
  if (!p) return '';
  const home = getUserHome();
  let sanitized = p;
  if (sanitized.startsWith(home)) {
    sanitized = '~' + sanitized.slice(home.length);
  } else if (sanitized.toLowerCase().startsWith(home.toLowerCase())) {
    sanitized = '~' + sanitized.slice(home.length);
  }
  return sanitized.replace(/\\/g, '/');
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
// Dynamic MCP Server Discovery & Management
// ==========================================
function getMcpConfigPath() {
  if (process.env.ANTIGRAVITY_MCP_CONFIG) {
    return path.resolve(process.env.ANTIGRAVITY_MCP_CONFIG);
  }
  return path.join(getUserHome(), '.gemini', 'config', 'mcp_config.json');
}

function loadMcpConfig() {
  const cfgPath = getMcpConfigPath();
  if (fs.existsSync(cfgPath)) {
    try {
      return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    } catch (_) {}
  }
  return { mcpServers: {} };
}

function saveMcpConfig(data) {
  const cfgPath = getMcpConfigPath();
  fs.mkdirSync(path.dirname(cfgPath), { recursive: true });
  fs.writeFileSync(cfgPath, JSON.stringify(data, null, 2), 'utf8');
}

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

function listMcpServersDetailed() {
  const config = loadMcpConfig();
  const servers = config.mcpServers || {};
  const serverNames = Object.keys(servers);

  console.log(`\n\x1b[1mConfigured MCP Servers (${getMcpConfigPath()}):\x1b[0m\n`);
  if (serverNames.length === 0) {
    console.log(`  No MCP servers configured.\n`);
    return;
  }

  for (const name of serverNames) {
    const s = servers[name];
    const isDisabled = s.disabled === true;
    const statusBadge = isDisabled ? '\x1b[33m[DISABLED (OFF)]\x1b[0m' : '\x1b[32m[ACTIVE (ON)]\x1b[0m';
    const transport = s.serverUrl ? `SSE (${s.serverUrl})` : `Stdio (${s.command} ${(s.args || []).join(' ')})`;
    console.log(`  • \x1b[1m\x1b[36m${name}\x1b[0m: ${statusBadge}`);
    console.log(`    \x1b[90mTransport: ${transport}\x1b[0m`);
  }
  console.log('');
  console.log(`\x1b[36mManagement Commands:\x1b[0m`);
  console.log(`  skill-manager mcp enable <name>     # Turn ON globally in mcp_config.json`);
  console.log(`  skill-manager mcp disable <name>    # Turn OFF globally (saves RAM/tokens)`);
  console.log(`  skill-manager mcp isolate <name>    # Isolate to current project (.agents/plugins/)\n`);
}

function toggleMcpServer(serverName, enable) {
  const config = loadMcpConfig();
  if (!config.mcpServers || !config.mcpServers[serverName]) {
    console.log(`\x1b[31m✖ Server "${serverName}" is not configured in mcp_config.json.\x1b[0m`);
    return false;
  }
  if (enable) {
    delete config.mcpServers[serverName].disabled;
    saveMcpConfig(config);
    console.log(`\x1b[32m✔ Enabled MCP server "${serverName}" globally (disabled: false).\x1b[0m`);
  } else {
    config.mcpServers[serverName].disabled = true;
    saveMcpConfig(config);
    console.log(`\x1b[33m✔ Disabled MCP server "${serverName}" globally (disabled: true).\x1b[0m`);
  }
  printReloadReminder();
  return true;
}

function isolateMcpServerToProject(serverName, targetProjectDir) {
  const config = loadMcpConfig();
  if (!config.mcpServers || !config.mcpServers[serverName]) {
    console.log(`\x1b[31m✖ Server "${serverName}" is not configured in global mcp_config.json.\x1b[0m`);
    return false;
  }

  const projectRoot = targetProjectDir ? path.resolve(targetProjectDir) : process.cwd();
  const pluginDir = path.join(projectRoot, '.agents', 'plugins', `${serverName}-mcp`);
  fs.mkdirSync(pluginDir, { recursive: true });

  // Clone server config without 'disabled' flag
  const serverDef = { ...config.mcpServers[serverName] };
  delete serverDef.disabled;

  // 1. plugin.json
  const pluginJson = {
    name: `${serverName}-mcp`,
    description: `Project-scoped MCP server plugin for ${serverName}`
  };
  fs.writeFileSync(path.join(pluginDir, 'plugin.json'), JSON.stringify(pluginJson, null, 2), 'utf8');

  // 2. mcp_config.json
  const projectMcpConfig = {
    mcpServers: {
      [serverName]: serverDef
    }
  };
  fs.writeFileSync(path.join(pluginDir, 'mcp_config.json'), JSON.stringify(projectMcpConfig, null, 2), 'utf8');

  console.log(`\n\x1b[32m✔ Successfully isolated MCP server "${serverName}" to current project workspace!\x1b[0m`);
  console.log(`  Plugin location: \x1b[36m${pluginDir}\x1b[0m`);
  console.log(`  \x1b[90mThis server will run ONLY when working inside this project workspace.\x1b[0m`);
  console.log(`  \x1b[90mOther projects will NOT load "${serverName}".\x1b[0m\n`);
  printReloadReminder();
  return true;
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
// Structural Dependency & Bundle Engine
// ==========================================
function scanSkillDependencies(skillDir, allKnownSkills = []) {
  const dependencies = new Set();
  if (!fs.existsSync(skillDir)) return [];

  let candidateFiles = [];
  try {
    const entries = fs.readdirSync(skillDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        candidateFiles.push(path.join(skillDir, entry.name));
      }
    }
  } catch (_) {
    return [];
  }

  const currentSkillName = path.basename(skillDir).toLowerCase();
  const knownLookup = new Map();
  for (const s of allKnownSkills) {
    if (s.toLowerCase() !== currentSkillName) {
      knownLookup.set(s.toLowerCase(), s);
    }
  }

  for (const file of candidateFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');

      // 1. Slash commands: /skill-name
      const slashMatches = content.matchAll(/\/([a-z0-9_-]{3,})/gi);
      for (const m of slashMatches) {
        const target = m[1].toLowerCase();
        if (knownLookup.has(target)) {
          dependencies.add(knownLookup.get(target));
        }
      }

      // 2. Relative markdown links: ../skill-name/SKILL.md or skills/.../skill-name
      const linkMatches = content.matchAll(/(?:\.\.\/|skills\/[^\/]+\/)([a-z0-9_-]+)\/SKILL\.md/gi);
      for (const m of linkMatches) {
        const target = m[1].toLowerCase();
        if (knownLookup.has(target)) {
          dependencies.add(knownLookup.get(target));
        }
      }

      // 3. Explicit Skill invocations: "Skill tool with `skill-name`" or "skill `skill-name`"
      const invokeMatches = content.matchAll(/(?:skill|Skill tool with|run|use)\s+[`"']([a-z0-9_-]+)[`"']/gi);
      for (const m of invokeMatches) {
        const target = m[1].toLowerCase();
        if (knownLookup.has(target)) {
          dependencies.add(knownLookup.get(target));
        }
      }
    } catch (_) {}
  }

  return Array.from(dependencies).sort();
}

function resolveSkillBundle(skillName, allSkillsList = [], packs = {}) {
  const target = skillName.toLowerCase();

  // 1. Check pack definitions with indivisible: true or bundle: true
  for (const [packKey, pack] of Object.entries(packs)) {
    if (pack.indivisible === true || pack.bundle === true) {
      const packSkills = (pack.skills || []).map(s => s.toLowerCase());
      if (packSkills.includes(target)) {
        return {
          isBundle: true,
          bundleKey: packKey,
          bundleName: pack.name,
          indivisible: true,
          skills: pack.skills,
          reason: `Part of indivisible ecosystem "${pack.name}". These ${pack.skills.length} skills call each other during execution and must remain together.`
        };
      }
    }
  }

  return {
    isBundle: false,
    bundleKey: null,
    bundleName: null,
    indivisible: false,
    skills: [skillName],
    reason: null
  };
}

function getSkillDependenciesRecursively(skillName, libraryDir, packs, visited = new Set()) {
  const result = new Set();
  const queue = [skillName];

  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);
    result.add(current);

    // If in an indivisible bundle, include all skills in the bundle
    const bundle = resolveSkillBundle(current, [], packs);
    if (bundle.isBundle && bundle.indivisible) {
      for (const s of bundle.skills) {
        result.add(s);
        visited.add(s);
      }
      continue;
    }

    // Also check scanned dependencies
    const skillPath = path.join(libraryDir, current);
    if (fs.existsSync(skillPath)) {
      let allKnown = [];
      try {
        allKnown = fs.readdirSync(libraryDir).filter(f => !f.startsWith('.'));
      } catch (_) {}
      const deps = scanSkillDependencies(skillPath, allKnown);
      for (const d of deps) {
        if (!visited.has(d)) {
          queue.push(d);
        }
      }
    }
  }

  return Array.from(result);
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

function extractSkillMetadata(skillDir, configuredMcpServers = [], allKnownSkills = [], packs = {}) {
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
  const linkedMcpServers = [];
  const lowerContent = rawContent.toLowerCase();

  for (const mcp of configuredMcpServers) {
    const regex = new RegExp(`\\b${mcp}\\b`, 'i');
    if (regex.test(lowerContent) || skillName.toLowerCase().includes(mcp)) {
      linkedMcpServers.push(mcp);
    }
  }

  // Generic MCP invocation
  const hasGenericMcp =
    lowerContent.includes('call_mcp_tool') ||
    lowerContent.includes('mcp_') ||
    lowerContent.includes('mcp server') ||
    lowerContent.includes('mcp tools');

  // Inter-skill dependencies & bundle
  const dependencies = scanSkillDependencies(skillDir, allKnownSkills);
  const bundle = resolveSkillBundle(skillName, allKnownSkills, packs);

  return {
    name,
    folderName: skillName,
    description,
    path: sanitizePath(skillDir),
    tokenEstimate,
    mcpRelated: linkedMcpServers.length > 0 || hasGenericMcp,
    linkedMcpServers: Array.from(new Set(linkedMcpServers)),
    hasGenericMcp,
    dependencies,
    isBundle: bundle.isBundle,
    bundleKey: bundle.bundleKey,
    bundleName: bundle.bundleName
  };
}

// ==========================================
// Deep Dynamic Analysis & Recommendation
// ==========================================
const CORE_SYSTEM_SKILLS = new Set([
  'skill-manager',
  'skill-archiver',
  'find-skills'
]);

function analyzeSkill(skillDir, libraryDir, configuredMcpServers, packs = {}, allKnownSkills = []) {
  const meta = extractSkillMetadata(skillDir, configuredMcpServers, allKnownSkills, packs);
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
  // 3. Interconnected Indivisible Bundle Ecosystem
  else if (meta.isBundle) {
    category = 'INTERCONNECTED_BUNDLE';
    recommendation = 'BUNDLE_DECISION';
    reason = `Part of indivisible suite "${meta.bundleName}". Interconnected skills call each other and MUST move or stay together.`;
    severity = 'warning';
  }
  // 4. Linked to Configured MCP Server
  else if (meta.linkedMcpServers.length > 0) {
    category = 'MCP_LINKED';
    recommendation = 'CONFIRM_USER';
    reason = `Directly integrates with configured MCP server(s): [${meta.linkedMcpServers.join(', ')}]. If used across all projects, keep global. If used only for specific projects, archive.`;
    severity = 'warning';
  }
  // 5. Generic MCP Reference
  else if (meta.hasGenericMcp) {
    category = 'MCP_GENERIC';
    recommendation = 'CONFIRM_USER';
    reason = 'References MCP server or tool execution. Ask user preference before archiving.';
    severity = 'warning';
  }

  // Duplicate Check note
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
  const packs = loadPacks();

  if (!fs.existsSync(globalDir)) {
    return { total: 0, skills: [], configuredMcp, summary: {} };
  }

  // Gather all known skill names from global and library
  const knownSkillNames = new Set();
  const scanDir = (dir) => {
    if (fs.existsSync(dir)) {
      try {
        fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
          if (e.isDirectory() && !e.name.startsWith('.')) knownSkillNames.add(e.name);
        });
      } catch (_) {}
    }
  };
  scanDir(globalDir);
  scanDir(libraryDir);
  const allKnownSkills = Array.from(knownSkillNames);

  const entries = fs.readdirSync(globalDir, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const skillPath = path.join(globalDir, entry.name);
    const item = analyzeSkill(skillPath, libraryDir, configuredMcp, packs, allKnownSkills);
    skills.push(item);
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));

  // Group bundle skills by bundleKey
  const bundlesMap = {};
  skills.filter(s => s.category === 'INTERCONNECTED_BUNDLE').forEach(s => {
    if (!bundlesMap[s.bundleKey]) {
      bundlesMap[s.bundleKey] = {
        key: s.bundleKey,
        name: s.bundleName,
        skills: []
      };
    }
    bundlesMap[s.bundleKey].skills.push(s);
  });

  const summary = {
    core: skills.filter(s => s.category === 'CORE_SYSTEM'),
    safety: skills.filter(s => s.category === 'SAFETY_GUARDRAIL'),
    bundles: Object.values(bundlesMap),
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
  const packs = loadPacks();

  if (!fs.existsSync(libraryDir)) {
    fs.mkdirSync(libraryDir, { recursive: true });
  }

  const entries = fs.readdirSync(libraryDir, { withFileTypes: true });
  const allKnownSkills = entries.filter(e => e.isDirectory() && !e.name.startsWith('.')).map(e => e.name);

  const skills = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

      const skillPath = path.join(libraryDir, entry.name);
      const meta = extractSkillMetadata(skillPath, configuredMcp, allKnownSkills, packs);

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

  // 1. catalog.json (Sanitized and Portable)
  const catalogJson = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    libraryPath: '~/.gemini/skill-library',
    configuredMcpServers: configuredMcp,
    totalSkills: skills.length,
    estimatedTokensSaved: totalEstimatedTokens,
    packs: Object.keys(packs),
    skills: skills.map(s => ({
      ...s,
      path: `~/.gemini/skill-library/${s.folderName}`
    }))
  };

  const jsonFilePath = path.join(libraryDir, 'catalog.json');
  fs.writeFileSync(jsonFilePath, JSON.stringify(catalogJson, null, 2), 'utf8');

  // Sync to repo catalog ONLY if not in test sandbox and repo directory exists
  const isTestOrCustom = !!(process.env.ANTIGRAVITY_SKILL_LIBRARY || process.env.NODE_ENV === 'test');
  const repoCatalogJson = path.join(__dirname, '..', 'catalog', 'catalog.json');
  if (!isTestOrCustom && fs.existsSync(path.dirname(repoCatalogJson))) {
    try {
      const cleanRepoCatalog = {
        ...catalogJson,
        configuredMcpServers: [] // Zero host-specific MCP servers in repo
      };
      fs.writeFileSync(repoCatalogJson, JSON.stringify(cleanRepoCatalog, null, 2), 'utf8');
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
    const indivisibleTag = pack.indivisible ? ' `[Indivisible Bundle]`' : '';
    mdContent += `### 📦 Pack: ${pack.name} (\`${packKey}\`)${indivisibleTag}\n`;
    mdContent += `${pack.description}\n\n`;
    mdContent += `*Tags:* \`${pack.tags.join('`, `')}\`\n\n`;
    mdContent += `| Skill | MCP | Dependencies | Description |\n`;
    mdContent += `| :--- | :---: | :--- | :--- |\n`;

    for (const skillName of pack.skills) {
      const found = skills.find(s => s.folderName === skillName);
      const desc = found ? found.description : 'Specialized pack skill';
      const mcpBadge = found && found.mcpRelated ? (found.linkedMcpServers.length ? `⚡ ${found.linkedMcpServers.join(',')}` : '⚡ MCP') : '-';
      const depBadge = found && found.dependencies && found.dependencies.length ? `\`${found.dependencies.slice(0, 3).join('`, `')}${found.dependencies.length > 3 ? '...' : ''}\`` : '-';
      mdContent += `| \`${skillName}\` | ${mcpBadge} | ${depBadge} | ${desc.replace(/\|/g, '\\|')} |\n`;
    }
    mdContent += `\n---\n\n`;
  }

  // Render All Skills Table
  mdContent += `## 📚 All Indexed Skills (${skills.length})\n\n`;
  mdContent += `| Skill | MCP | Bundle | Packs | Description |\n`;
  mdContent += `| :--- | :---: | :---: | :--- | :--- |\n`;

  for (const s of skills) {
    const mcpBadge = s.mcpRelated ? (s.linkedMcpServers.length ? `⚡ ${s.linkedMcpServers.join(', ')}` : '⚡ MCP') : '-';
    const bundleBadge = s.isBundle ? `📦 \`${s.bundleKey}\`` : '-';
    const packsBadge = s.packs.length > 0 ? s.packs.map(p => `\`${p}\``).join(' ') : '-';
    mdContent += `| \`${s.name}\` | ${mcpBadge} | ${bundleBadge} | ${packsBadge} | ${s.description.replace(/\|/g, '\\|')} |\n`;
  }

  const mdFilePath = path.join(libraryDir, 'CATALOG.md');
  fs.writeFileSync(mdFilePath, mdContent, 'utf8');

  const repoCatalogMd = path.join(__dirname, '..', 'catalog', 'CATALOG.md');
  if (!isTestOrCustom && fs.existsSync(path.dirname(repoCatalogMd))) {
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
// Skill Activation & Deactivation (Strictly Copies to Project)
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

function printReloadReminder() {
  console.log(`\x1b[36m💡 Tip: Start a new conversation or reload Antigravity (Ctrl+R) for skill changes to take effect in the active prompt.\x1b[0m\n`);
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
    // Check if skill belongs to an indivisible bundle or has dependencies
    const bundle = resolveSkillBundle(targetName, [], packs);
    if (bundle.isBundle && (options.bundle || bundle.indivisible)) {
      console.log(`\x1b[33mNotice: "${targetName}" belongs to indivisible bundle "${bundle.bundleName}".\x1b[0m`);
      console.log(`Copying entire kit (${bundle.skills.length} connected skills) into project to preserve runtime integrity...\n`);
      skillsToActivate = bundle.skills;
    } else {
      // Check if skill has direct/transitive dependencies
      const allRequired = getSkillDependenciesRecursively(targetName, libraryDir, packs);
      if (allRequired.length > 1) {
        console.log(`\x1b[36mNotice: "${targetName}" depends on ${allRequired.length - 1} companion skill(s).\x1b[0m`);
        console.log(`Copying full set: [${allRequired.join(', ')}] into project...\n`);
        skillsToActivate = allRequired;
      } else {
        skillsToActivate = [targetName];
      }
    }
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
      console.log(`  \x1b[32m✔ Activated: ${skill}\x1b[0m (copied to project: ${destinationDir})`);
      successCount++;
    } catch (err) {
      console.error(`  \x1b[31m✖ Failed to copy ${skill}:\x1b[0m`, err.message);
    }
  }

  if (successCount > 0) {
    const scope = isGlobal ? 'globally' : 'for current project';
    console.log(`\n\x1b[32m✔ Successfully copied ${successCount} skill(s) ${scope}.\x1b[0m`);
    if (!isGlobal) {
      console.log(`\x1b[90mWorkspace skills directory: ${targetRoot}\x1b[0m`);
      console.log(`\x1b[90m(Library warehouse remains 100% complete and intact)\x1b[0m`);
    }
    printReloadReminder();
  }
}

function deactivateSkill(targetName, options = {}) {
  const isGlobal = options.global === true;
  const targetRoot = isGlobal ? getGlobalSkillsPath() : getProjectSkillsPath();
  const packs = loadPacks();

  let targets = [targetName];
  if (packs[targetName]) {
    targets = packs[targetName].skills;
  } else {
    const bundle = resolveSkillBundle(targetName, [], packs);
    if (bundle.isBundle && options.bundle) {
      targets = bundle.skills;
    }
  }

  for (const name of targets) {
    const destinationDir = path.join(targetRoot, name);
    if (!fs.existsSync(destinationDir)) {
      console.log(`\x1b[33mSkill "${name}" is not currently active in ${targetRoot}.\x1b[0m`);
      continue;
    }

    try {
      fs.rmSync(destinationDir, { recursive: true, force: true });
      console.log(`\x1b[32m✔ Deactivated skill "${name}" from ${destinationDir}.\x1b[0m`);
    } catch (err) {
      console.error(`\x1b[31m✖ Failed to deactivate ${name}:\x1b[0m`, err.message);
    }
  }
  printReloadReminder();
}

// ==========================================
// Ingest & Archive with Duplicate Control
// ==========================================
function archiveSkill(sourcePath, options = {}) {
  const libraryDir = getLibraryPath();
  const absSource = path.resolve(sourcePath);
  const packs = loadPacks();

  if (!fs.existsSync(absSource)) {
    console.log(`\x1b[31mSource skill path does not exist: ${absSource}\x1b[0m`);
    return;
  }

  const skillName = path.basename(absSource);
  const bundle = resolveSkillBundle(skillName, [], packs);

  // Bundle integrity check
  if (bundle.isBundle && !options.bundle && !options.force) {
    console.log(`\n\x1b[33m⚠️ WARNING: "${skillName}" is part of an Indivisible Skill Bundle:\x1b[0m`);
    console.log(`  Bundle: \x1b[1m${bundle.bundleName}\x1b[0m (${bundle.skills.length} connected skills)`);
    console.log(`  \x1b[90mThese skills call each other at runtime (e.g. /wayfinder, /tdd, /implement).\x1b[0m`);
    console.log(`  \x1b[90mArchiving only this skill will break the workflow of the remaining active skills.\x1b[0m\n`);
    console.log(`  To archive the entire connected bundle together, run:`);
    console.log(`    \x1b[36mskill-manager archive "${sourcePath}" --bundle\x1b[0m\n`);
    console.log(`  To override and archive only this folder, use: \x1b[90m--force\x1b[0m\n`);
    return;
  }

  const skillsToArchive = (bundle.isBundle && options.bundle) ? bundle.skills : [skillName];
  const globalPath = getGlobalSkillsPath();

  for (const sName of skillsToArchive) {
    let srcDir = absSource;
    if (sName !== skillName) {
      srcDir = path.join(globalPath, sName);
      if (!fs.existsSync(srcDir)) continue;
    }

    const targetDir = path.join(libraryDir, sName);
    const cmp = compareSkillDirectories(srcDir, targetDir);

    if (cmp.status === 'IDENTICAL' && !options.force) {
      // safe
    } else if (cmp.status === 'MODIFIED') {
      if (options.backup) {
        const backupDir = path.join(libraryDir, `${sName}.backup-${Date.now()}`);
        copyDirSync(targetDir, backupDir);
        console.log(`  \x1b[36mCreated backup of existing warehouse version: ${backupDir}\x1b[0m`);
      }
    }

    copyDirSync(srcDir, targetDir);

    if (srcDir.startsWith(globalPath)) {
      try {
        fs.rmSync(srcDir, { recursive: true, force: true });
        console.log(`  \x1b[32m✔ Pruned global copy:\x1b[0m ${sName}`);
      } catch (_) {}
    }
  }

  reindexCatalog({ verbose: true });
  console.log(`\n\x1b[32m✔ Successfully archived ${skillsToArchive.length} skill(s) into warehouse!\x1b[0m`);
  printReloadReminder();
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
      target: 'aihero-mattpocock',
      reason: 'Detected Git repository / testing tooling. AI Hero & Matt Pocock suite introduces Socratic grilling, spec planning, TDD, and code-review.'
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

  // Suggest caveman token efficiency
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

  // Group 3: Interconnected Indivisible Bundles
  console.log(`\n\x1b[34m[3] Interconnected Ecosystems - INDIVISIBLE BUNDLES (${analysis.summary.bundles.length}):\x1b[0m`);
  analysis.summary.bundles.forEach(b => {
    console.log(`  📦 \x1b[1m${b.name}\x1b[0m (\x1b[36m${b.skills.length} active skills\x1b[0m)`);
    console.log(`     \x1b[90mSkills: ${b.skills.map(s => s.name).slice(0, 6).join(', ')}${b.skills.length > 6 ? '...' : ''}\x1b[0m`);
    console.log(`     \x1b[33m⚠️ STRUCTURAL INTEGRITY RULE: These skills call each other during execution.\x1b[0m`);
    console.log(`     \x1b[33mThey MUST be kept together or archived together as an indivisible unit.\x1b[0m`);
  });

  // Group 4: MCP Linked
  console.log(`\n\x1b[35m[4] Configured MCP Integrations - GENTLE USER CONFIRMATION (${analysis.summary.mcp.length}):\x1b[0m`);
  analysis.summary.mcp.forEach(s => {
    console.log(`  • \x1b[1m${s.name}\x1b[0m \x1b[33m(Servers: ${s.linkedMcpServers.join(', ') || 'Generic MCP'})\x1b[0m`);
    console.log(`    \x1b[90m${s.reason}\x1b[0m`);
  });

  // Group 5: Specialized
  console.log(`\n\x1b[36m[5] Specialized Domain Skills - SAFE TO ARCHIVE (${analysis.summary.specialized.length}):\x1b[0m`);
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

  // Step 1: Handle Indivisible Bundles
  for (const b of analysis.summary.bundles) {
    console.log('\n----------------------------------------------------------');
    const promptText = `Archive entire suite "${b.name}" (${b.skills.length} skills) to warehouse? (y/N) [Default: N to keep together globally]: `;
    const ans = options.yes ? 'n' : await question(promptText);
    if (ans.toLowerCase() === 'y') {
      for (const skill of b.skills) {
        const target = path.join(libraryDir, skill.folderName);
        copyDirSync(skill.path, target);
        fs.rmSync(skill.path, { recursive: true, force: true });
      }
      console.log(`  \x1b[32m✔ Moved bundle "${b.name}" (${b.skills.length} skills) to warehouse.\x1b[0m`);
    } else {
      console.log(`  \x1b[32m✔ Preserved bundle "${b.name}" intact globally (${b.skills.length} skills).\x1b[0m`);
    }
  }

  // Step 2: Specialized skills
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

  // Step 3: MCP Linked skills
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

        // Ask to disable MCP server if configured
        if (mcpSkill.linkedMcpServers.length > 0) {
          for (const sName of mcpSkill.linkedMcpServers) {
            const disPrompt = `Disable server "${sName}" in mcp_config.json to prevent background overhead? (y/N): `;
            const disAns = options.yes ? 'n' : await question(disPrompt);
            if (disAns.toLowerCase() === 'y') {
              toggleMcpServer(sName, false);
            }
          }
        }
      } else {
        console.log(`  \x1b[90mPreserved ${mcpSkill.name} in global.\x1b[0m`);
      }
    }
  }

  // Step 4: Safety Guardrails
  if (analysis.summary.safety.length > 0) {
    console.log('\n----------------------------------------------------------');
    console.log('Safety guardrails: Defaulting to PRESERVE in global.');
  }

  rl.close();

  // Reindex catalog
  reindexCatalog({ verbose: true });
  console.log(`\n\x1b[32m✔ Optimization completed! Context window tokens successfully liberated.\x1b[0m\n`);
  console.log(`\x1b[36m📦 How to recall archived skills whenever needed:\x1b[0m`);
  console.log(`  • \x1b[1mConversational (Recommended):\x1b[0m Simply ask Antigravity in chat:`);
  console.log(`    "Activate <skill-name or pack> in this project" (e.g. "Activate Matt Pocock suite here")`);
  console.log(`  • \x1b[1mCLI Terminal (Alternative):\x1b[0m`);
  console.log(`    node bin/skill-manager.cjs activate <name-or-pack>\n`);
  printReloadReminder();
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
      console.log(`  • Indivisible Bundles:\x1b[34m${analysis.summary.bundles.length}\x1b[0m`);
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

    case 'bundle': {
      const skillName = args[1];
      if (!skillName) {
        console.log('\x1b[31mUsage: skill-manager bundle <skill-name>\x1b[0m');
        process.exit(1);
      }
      const packs = loadPacks();
      const bundle = resolveSkillBundle(skillName, [], packs);
      if (bundle.isBundle) {
        console.log(`\n\x1b[1mBundle Info for "${skillName}":\x1b[0m`);
        console.log(`  Suite Name:   \x1b[36m${bundle.bundleName}\x1b[0m (\`${bundle.bundleKey}\`)`);
        console.log(`  Indivisible:  \x1b[32mYes\x1b[0m`);
        console.log(`  Total Skills: \x1b[1m${bundle.skills.length}\x1b[0m`);
        console.log(`  Members:      \x1b[90m${bundle.skills.join(', ')}\x1b[0m\n`);
      } else {
        console.log(`\n"${skillName}" is a standalone skill (not part of an indivisible bundle).\n`);
      }
      break;
    }

    case 'bundles': {
      const packs = loadPacks();
      console.log(`\n\x1b[1mIndivisible Skill Bundles & Ecosystems:\x1b[0m\n`);
      for (const [key, p] of Object.entries(packs)) {
        if (p.indivisible || p.bundle) {
          console.log(`  📦 \x1b[1m\x1b[36m${key}\x1b[0m: ${p.name}`);
          console.log(`     ${p.description}`);
          console.log(`     Connected Skills (${p.skills.length}): \x1b[90m${p.skills.join(', ')}\x1b[0m\n`);
        }
      }
      break;
    }

    case 'mcp': {
      const subAction = args[1];
      const targetServer = args[2];

      if (!subAction || subAction === 'list') {
        listMcpServersDetailed();
      } else if (subAction === 'enable') {
        if (!targetServer) {
          console.log('\x1b[31mUsage: skill-manager mcp enable <server-name>\x1b[0m');
          process.exit(1);
        }
        toggleMcpServer(targetServer, true);
      } else if (subAction === 'disable') {
        if (!targetServer) {
          console.log('\x1b[31mUsage: skill-manager mcp disable <server-name>\x1b[0m');
          process.exit(1);
        }
        toggleMcpServer(targetServer, false);
      } else if (subAction === 'isolate') {
        if (!targetServer) {
          console.log('\x1b[31mUsage: skill-manager mcp isolate <server-name> [project-dir]\x1b[0m');
          process.exit(1);
        }
        isolateMcpServerToProject(targetServer, args[3]);
      } else {
        console.log(`\x1b[31mUnknown mcp action: "${subAction}". Use: list, enable, disable, isolate.\x1b[0m`);
      }
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
          const b = r.isBundle ? ` \x1b[34m[Bundle: ${r.bundleKey}]\x1b[0m` : '';
          const p = r.packs.length ? ` \x1b[90m(${r.packs.join(', ')})\x1b[0m` : '';
          console.log(`  • \x1b[1m\x1b[36m${r.name}\x1b[0m${mcp}${b}${p}`);
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
        const b = s.isBundle ? ` \x1b[34m[${s.bundleKey}]\x1b[0m` : '';
        const p = s.packs.length ? ` \x1b[90m[${s.packs.join(',')}]\x1b[0m` : '';
        console.log(`  • \x1b[36m${s.name}\x1b[0m${mcp}${b}${p}`);
      });
      console.log('');
      break;
    }

    case 'packs': {
      const packs = loadPacks();
      console.log('\n\x1b[1mAvailable Skill Packs:\x1b[0m\n');
      for (const [key, p] of Object.entries(packs)) {
        const indivisibleTag = p.indivisible ? ' \x1b[33m[Indivisible Bundle]\x1b[0m' : '';
        console.log(`  📦 \x1b[1m\x1b[36m${key}\x1b[0m: ${p.name}${indivisibleTag}`);
        console.log(`     ${p.description}`);
        console.log(`     Skills (${p.skills.length}): \x1b[90m${p.skills.join(', ')}\x1b[0m\n`);
      }
      break;
    }

    case 'activate': {
      const target = args[1];
      if (!target) {
        console.log('\x1b[31mUsage: skill-manager activate <skill-name|pack-name> [--global] [--bundle]\x1b[0m');
        process.exit(1);
      }
      activateSkillOrPack(target, {
        global: args.includes('--global'),
        bundle: args.includes('--bundle')
      });
      break;
    }

    case 'deactivate': {
      const target = args[1];
      if (!target) {
        console.log('\x1b[31mUsage: skill-manager deactivate <skill-name> [--global] [--bundle]\x1b[0m');
        process.exit(1);
      }
      deactivateSkill(target, {
        global: args.includes('--global'),
        bundle: args.includes('--bundle')
      });
      break;
    }

    case 'archive': {
      const target = args[1];
      if (!target) {
        console.log('\x1b[31mUsage: skill-manager archive <path-to-skill-folder> [--bundle] [--backup] [--force]\x1b[0m');
        process.exit(1);
      }
      archiveSkill(target, {
        bundle: args.includes('--bundle'),
        backup: args.includes('--backup'),
        force: args.includes('--force')
      });
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
  \x1b[36manalyze\x1b[0m                  Intelligently inspect global skills, MCP links & indivisible bundles
  \x1b[36mbundles\x1b[0m                  List all indivisible skill bundles (e.g. AI Hero & Matt Pocock suite)
  \x1b[36mbundle <name>\x1b[0m            Check if a skill belongs to an indivisible bundle and list members
  \x1b[36mmcp [list]\x1b[0m               List all configured MCP servers and active/disabled state
  \x1b[36mmcp enable <server>\x1b[0m      Enable an MCP server globally (disabled: false)
  \x1b[36mmcp disable <server>\x1b[0m     Disable an MCP server globally to save background memory/tokens
  \x1b[36mmcp isolate <server>\x1b[0m     Isolate an MCP server to current project workspace (.agents/plugins/)
  \x1b[36mduplicates\x1b[0m               Check for identical or conflicting copies in warehouse
  \x1b[36msearch <keyword>\x1b[0m         Search local warehouse by keyword, tag, or pack
  \x1b[36mactivate <name|pack>\x1b[0m     Copy skill, kit, or pack to current project (.agents/skills/)
  \x1b[36mactivate <name> --global\x1b[0m Copy skill globally (~/.gemini/config/skills/)
  \x1b[36mdeactivate <name>\x1b[0m        Remove skill from current project (.agents/skills/)
  \x1b[36mlist\x1b[0m                     List all dormant skills in the warehouse
  \x1b[36mpacks\x1b[0m                    List available curated skill packs
  \x1b[36mreindex\x1b[0m                  Regenerate catalog.json and CATALOG.md with portable paths
  \x1b[36marchive <dir> [--bundle]\x1b[0m Ingest skill or entire bundle into the warehouse and re-index
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
  sanitizePath,
  getLibraryPath,
  getGlobalSkillsPath,
  getProjectSkillsPath,
  getConfiguredMcpServers,
  compareSkillDirectories,
  extractSkillMetadata,
  scanSkillDependencies,
  resolveSkillBundle,
  getSkillDependenciesRecursively,
  loadMcpConfig,
  saveMcpConfig,
  listMcpServersDetailed,
  toggleMcpServer,
  isolateMcpServerToProject,
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
