#!/usr/bin/env node

/**
 * Antigravity Skill Manager (CLI)
 * Lightweight on-demand skill warehouse and loader for Google Antigravity.
 *
 * Zero external dependencies - pure Node.js built-ins.
 * Fully cross-platform (Windows, macOS, Linux) with dynamic user home resolution.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { execSync } = require('child_process');

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
  // Look in repository catalog/packs.json or local warehouse packs.json
  const repoPacks = path.join(__dirname, '..', 'catalog', 'packs.json');
  if (fs.existsSync(repoPacks)) return repoPacks;

  const libraryPacks = path.join(getLibraryPath(), 'packs.json');
  if (fs.existsSync(libraryPacks)) return libraryPacks;

  return null;
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

function extractSkillMetadata(skillDir) {
  const skillName = path.basename(skillDir);
  const skillMdPath = path.join(skillDir, 'SKILL.md');

  let name = skillName;
  let description = 'No description provided';
  let mcpRelated = false;
  let rawContent = '';

  if (fs.existsSync(skillMdPath)) {
    try {
      rawContent = fs.readFileSync(skillMdPath, 'utf8');
      const parsed = parseYamlFrontmatter(rawContent);
      if (parsed.name) name = parsed.name;
      if (parsed.description) description = parsed.description;
    } catch (e) {
      // Fallback to defaults
    }
  }

  // Detect MCP references
  if (rawContent.toLowerCase().includes('mcp') || rawContent.includes('call_mcp_tool')) {
    mcpRelated = true;
  }

  return {
    name,
    folderName: skillName,
    description,
    mcpRelated,
    path: skillDir
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
  } catch (e) {
    return {};
  }
}

// ==========================================
// Catalog Re-Indexing (Hybrid: JSON + Markdown)
// ==========================================
function reindexCatalog(options = {}) {
  const libraryDir = getLibraryPath();
  const verbose = options.verbose !== false;

  if (!fs.existsSync(libraryDir)) {
    fs.mkdirSync(libraryDir, { recursive: true });
  }

  const entries = fs.readdirSync(libraryDir, { withFileTypes: true });
  const skills = [];
  const packs = loadPacks();

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const skillPath = path.join(libraryDir, entry.name);
      // Ignore hidden or meta folders
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

      const meta = extractSkillMetadata(skillPath);

      // Associate with packs
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

  // Sort alphabetically
  skills.sort((a, b) => a.name.localeCompare(b.name));

  // 1. Generate catalog.json
  const catalogJson = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    libraryPath: libraryDir,
    totalSkills: skills.length,
    packs: Object.keys(packs),
    skills
  };

  const jsonFilePath = path.join(libraryDir, 'catalog.json');
  fs.writeFileSync(jsonFilePath, JSON.stringify(catalogJson, null, 2), 'utf8');

  // Also sync to repository catalog/ if running inside repo
  const repoCatalogJson = path.join(__dirname, '..', 'catalog', 'catalog.json');
  if (fs.existsSync(path.dirname(repoCatalogJson))) {
    try {
      fs.writeFileSync(repoCatalogJson, JSON.stringify(catalogJson, null, 2), 'utf8');
    } catch (_) {}
  }

  // 2. Generate CATALOG.md
  let mdContent = `# Local Agent Skill Warehouse Catalog\n\n`;
  mdContent += `> Automatically generated on **${new Date().toLocaleDateString()}** by \`Antigravity Skill-Manager\`.\n`;
  mdContent += `> Total dormant skills: **${skills.length}** | Total packs: **${Object.keys(packs).length}**\n\n`;
  mdContent += `This catalog indexes all skills stored locally in the offline warehouse at \`~/.gemini/skill-library\`.\n`;
  mdContent += `These skills are kept dormant to eliminate token overhead in standard chats (~15k+ tokens saved per prompt turn).\n`;
  mdContent += `They can be activated on-demand for a single project (\`.agents/skills/\`) or globally.\n\n`;
  mdContent += `---\n\n`;

  // Render Packs sections
  for (const [packKey, pack] of Object.entries(packs)) {
    mdContent += `### 📦 Pack: ${pack.name} (\`${packKey}\`)\n`;
    mdContent += `${pack.description}\n\n`;
    mdContent += `*Tags:* \`${pack.tags.join('`, `')}\`\n\n`;
    mdContent += `| Skill | Description |\n`;
    mdContent += `| :--- | :--- |\n`;

    for (const skillName of pack.skills) {
      const found = skills.find(s => s.folderName === skillName);
      const desc = found ? found.description : 'Specialized pack skill';
      mdContent += `| \`${skillName}\` | ${desc.replace(/\|/g, '\\|')} |\n`;
    }
    mdContent += `\n---\n\n`;
  }

  // Render All Skills Table
  mdContent += `## 📚 All Indexed Skills (${skills.length})\n\n`;
  mdContent += `| Skill | MCP | Packs | Description |\n`;
  mdContent += `| :--- | :---: | :--- | :--- |\n`;

  for (const s of skills) {
    const mcpBadge = s.mcpRelated ? '⚡ MCP' : '-';
    const packsBadge = s.packs.length > 0 ? s.packs.map(p => `\`${p}\``).join(' ') : '-';
    mdContent += `| \`${s.name}\` | ${mcpBadge} | ${packsBadge} | ${s.description.replace(/\|/g, '\\|')} |\n`;
  }

  const mdFilePath = path.join(libraryDir, 'CATALOG.md');
  fs.writeFileSync(mdFilePath, mdContent, 'utf8');

  // Also sync to repository catalog/CATALOG.md if applicable
  const repoCatalogMd = path.join(__dirname, '..', 'catalog', 'CATALOG.md');
  if (fs.existsSync(path.dirname(repoCatalogMd))) {
    try {
      fs.writeFileSync(repoCatalogMd, mdContent, 'utf8');
    } catch (_) {}
  }

  if (verbose) {
    console.log(`\x1b[32m✔ Catalog re-indexed successfully!\x1b[0m`);
    console.log(`  Indexed \x1b[1m${skills.length}\x1b[0m skills in \x1b[36m${libraryDir}\x1b[0m`);
    console.log(`  JSON catalog: \x1b[90m${jsonFilePath}\x1b[0m`);
    console.log(`  Markdown catalog: \x1b[90m${mdFilePath}\x1b[0m`);
  }

  return catalogJson;
}

// ==========================================
// Catalog Query & Search
// ==========================================
function getCatalogData() {
  const jsonPath = path.join(getLibraryPath(), 'catalog.json');
  if (fs.existsSync(jsonPath)) {
    try {
      return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch (e) {}
  }
  // Reindex on the fly if missing
  return reindexCatalog({ verbose: false });
}

function searchSkills(query) {
  if (!query || !query.trim()) {
    console.log('\x1b[33mPlease provide a search keyword or tag.\x1b[0m');
    return;
  }

  const q = query.toLowerCase().trim();
  const catalog = getCatalogData();
  const packs = loadPacks();

  console.log(`\n\x1b[1mSearching for:\x1b[0m "\x1b[36m${query}\x1b[0m" in local warehouse...\n`);

  const results = catalog.skills.filter(skill => {
    return (
      skill.name.toLowerCase().includes(q) ||
      skill.description.toLowerCase().includes(q) ||
      skill.packs.some(p => p.toLowerCase().includes(q))
    );
  });

  if (results.length > 0) {
    console.log(`\x1b[32mFound ${results.length} matching skill(s) locally:\x1b[0m\n`);
    for (const r of results) {
      const mcpTag = r.mcpRelated ? ' \x1b[33m[MCP]\x1b[0m' : '';
      const packsTag = r.packs.length > 0 ? ` \x1b[90m(${r.packs.join(', ')})\x1b[0m` : '';
      console.log(`  • \x1b[1m\x1b[36m${r.name}\x1b[0m${mcpTag}${packsTag}`);
      console.log(`    \x1b[90m${r.description}\x1b[0m\n`);
    }

    console.log(`\x1b[34mTip: To activate a skill for your current project, run:\x1b[0m`);
    console.log(`  skill-manager activate ${results[0].name}\n`);
    return results;
  }

  // Check if query matched a pack name
  const matchedPackKeys = Object.keys(packs).filter(k => k.includes(q) || packs[k].name.toLowerCase().includes(q));
  if (matchedPackKeys.length > 0) {
    console.log(`\x1b[32mFound matching Skill Pack(s):\x1b[0m\n`);
    for (const pk of matchedPackKeys) {
      const pack = packs[pk];
      console.log(`  📦 \x1b[1m\x1b[36m${pk}\x1b[0m - ${pack.name}`);
      console.log(`     ${pack.description}`);
      console.log(`     Skills (${pack.skills.length}): \x1b[90m${pack.skills.join(', ')}\x1b[0m\n`);
    }
    return [];
  }

  // Fallback notice
  console.log(`\x1b[33mNo local skill matched "${query}".\x1b[0m\n`);
  console.log(`\x1b[1mOnline Fallback Discovery:\x1b[0m`);
  console.log(`You can search the public registry with:`);
  console.log(`  \x1b[36mnpx skills find ${query}\x1b[0m\n`);
  console.log(`If \`find-skills\` is not installed, add it with:`);
  console.log(`  \x1b[36mnpx skills add https://github.com/vercel-labs/skills --skill find-skills\x1b[0m\n`);

  return [];
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

  // Check if it's a pack
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
      console.log(`\x1b[90mActivated skills live in: ${targetRoot}\x1b[0m`);
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
// Ingestion & Archiving
// ==========================================
function archiveSkill(sourcePath) {
  const libraryDir = getLibraryPath();
  const absSource = path.resolve(sourcePath);

  if (!fs.existsSync(absSource)) {
    console.log(`\x1b[31mSource skill path does not exist: ${absSource}\x1b[0m`);
    return;
  }

  const skillName = path.basename(absSource);
  const targetDir = path.join(libraryDir, skillName);

  console.log(`Archiving "${skillName}" into library...`);
  copyDirSync(absSource, targetDir);

  // If source was in global config, remove it to clean global prompt
  const globalPath = getGlobalSkillsPath();
  if (absSource.startsWith(globalPath)) {
    try {
      fs.rmSync(absSource, { recursive: true, force: true });
      console.log(`\x1b[32m✔ Removed from global skills to save token overhead.\x1b[0m`);
    } catch (_) {}
  }

  reindexCatalog({ verbose: true });
  console.log(`\x1b[32m✔ Archived "${skillName}" successfully!\x1b[0m`);
}

// ==========================================
// Gentle Global Migration & Pre-Analysis
// ==========================================
const ESSENTIAL_GLOBAL_SKILLS = new Set([
  'skill-manager',
  'skill-archiver',
  'find-skills'
]);

function analyzeGlobalSkills() {
  const globalDir = getGlobalSkillsPath();
  if (!fs.existsSync(globalDir)) {
    return { essentials: [], important: [], projectSpecific: [] };
  }

  const entries = fs.readdirSync(globalDir, { withFileTypes: true });
  const essentials = [];
  const important = [];
  const projectSpecific = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    const skillPath = path.join(globalDir, name);

    if (ESSENTIAL_GLOBAL_SKILLS.has(name)) {
      essentials.push({ name, path: skillPath, reason: 'Skill-Manager core ecosystem' });
      continue;
    }

    const meta = extractSkillMetadata(skillPath);

    // Identify important skills
    if (meta.mcpRelated) {
      important.push({
        name,
        path: skillPath,
        reason: 'Integrates with MCP Servers / External Tools'
      });
    } else if (
      name.includes('guardrail') ||
      name.includes('prevention') ||
      name.includes('safety') ||
      name.includes('pilot') ||
      name.includes('governance')
    ) {
      important.push({
        name,
        path: skillPath,
        reason: 'Execution safety or governance rule'
      });
    } else {
      projectSpecific.push({
        name,
        path: skillPath,
        reason: 'Specialized domain/project workflow'
      });
    }
  }

  return { essentials, important, projectSpecific };
}

async function runMigration(options = {}) {
  const analysis = analyzeGlobalSkills();
  const libraryDir = getLibraryPath();
  const globalDir = getGlobalSkillsPath();

  console.log(`\n\x1b[1m══════════════════════════════════════════════════════════\x1b[0m`);
  console.log(`\x1b[1m        Antigravity Global Skills Analysis & Migration   \x1b[0m`);
  console.log(`\x1b[1m══════════════════════════════════════════════════════════\x1b[0m\n`);
  console.log(`Global directory: \x1b[36m${globalDir}\x1b[0m`);
  console.log(`Library warehouse: \x1b[36m${libraryDir}\x1b[0m\n`);

  console.log(`\x1b[32m✔ Core Essentials to KEEP in Global (${analysis.essentials.length}):\x1b[0m`);
  if (analysis.essentials.length === 0) {
    console.log(`  (None currently present. Remember to install skill-manager!)`);
  } else {
    analysis.essentials.forEach(e => console.log(`  • ${e.name} \x1b[90m(${e.reason})\x1b[0m`));
  }

  console.log(`\n\x1b[33m⚡ Important Skills Identified (${analysis.important.length}):\x1b[0m`);
  console.log(`  \x1b[90mThese skills are linked to MCP tools or safety guardrails.\x1b[0m`);
  analysis.important.forEach(i => console.log(`  • \x1b[1m${i.name}\x1b[0m - \x1b[33m${i.reason}\x1b[0m`));

  console.log(`\n\x1b[36m📦 Specialized Skills Recommended for Warehouse Migration (${analysis.projectSpecific.length}):\x1b[0m`);
  console.log(`  \x1b[90mMoving these to the warehouse eliminates prompt token bloat in every chat.\x1b[0m`);
  analysis.projectSpecific.forEach(p => console.log(`  • ${p.name}`));

  if (analysis.projectSpecific.length === 0 && analysis.important.length === 0) {
    console.log(`\n\x1b[32mGlobal skills directory is already clean and optimal!\x1b[0m\n`);
    return;
  }

  if (options.dryRun) {
    console.log(`\n\x1b[33mDry-run mode: No files were moved.\x1b[0m\n`);
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (str) => new Promise(resolve => rl.question(str, resolve));

  console.log('\n----------------------------------------------------------');
  const answerGeneral = options.yes ? 'y' : await question(`Archive all ${analysis.projectSpecific.length} specialized skills to the local warehouse? (y/N): `);

  if (answerGeneral.toLowerCase() === 'y') {
    for (const skill of analysis.projectSpecific) {
      const dest = path.join(libraryDir, skill.name);
      copyDirSync(skill.path, dest);
      fs.rmSync(skill.path, { recursive: true, force: true });
    }
    console.log(`\x1b[32m✔ Archived ${analysis.projectSpecific.length} specialized skills.\x1b[0m`);
  }

  if (analysis.important.length > 0) {
    console.log('\n----------------------------------------------------------');
    console.log('Now reviewing Important / MCP-related skills:');
    for (const imp of analysis.important) {
      const ans = options.yes ? 'n' : await question(`Archive "${imp.name}" (${imp.reason}) to warehouse? (y/N) [Default: N to keep global]: `);
      if (ans.toLowerCase() === 'y') {
        const dest = path.join(libraryDir, imp.name);
        copyDirSync(imp.path, dest);
        fs.rmSync(imp.path, { recursive: true, force: true });
        console.log(`  \x1b[32m✔ Moved ${imp.name} to warehouse.\x1b[0m`);
      } else {
        console.log(`  \x1b[90mKept ${imp.name} in global.\x1b[0m`);
      }
    }
  }

  rl.close();

  // Reindex library after changes
  reindexCatalog({ verbose: true });
  console.log(`\n\x1b[32m✔ Migration process complete! Context window tokens successfully liberated.\x1b[0m\n`);
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

    case 'search':
    case 'find':
      searchSkills(args[1]);
      break;

    case 'list': {
      const cat = getCatalogData();
      console.log(`\n\x1b[1mOffline Skill Warehouse (${cat.totalSkills} skills):\x1b[0m`);
      cat.skills.forEach(s => {
        const pTag = s.packs.length ? ` \x1b[90m[${s.packs.join(',')}]\x1b[0m` : '';
        console.log(`  • \x1b[36m${s.name}\x1b[0m${pTag}`);
      });
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

    case 'activate':
    case 'enable': {
      const target = args[1];
      if (!target) {
        console.log('\x1b[31mUsage: skill-manager activate <skill-name|pack-name> [--global]\x1b[0m');
        process.exit(1);
      }
      const isGlobal = args.includes('--global');
      activateSkillOrPack(target, { global: isGlobal });
      break;
    }

    case 'deactivate':
    case 'disable': {
      const target = args[1];
      if (!target) {
        console.log('\x1b[31mUsage: skill-manager deactivate <skill-name> [--global]\x1b[0m');
        process.exit(1);
      }
      const isGlobal = args.includes('--global');
      deactivateSkill(target, { global: isGlobal });
      break;
    }

    case 'archive':
    case 'ingest': {
      const targetPath = args[1];
      if (!targetPath) {
        console.log('\x1b[31mUsage: skill-manager archive <path-to-skill-folder>\x1b[0m');
        process.exit(1);
      }
      archiveSkill(targetPath);
      break;
    }

    case 'migrate': {
      const dryRun = args.includes('--dry-run');
      const yes = args.includes('--yes') || args.includes('-y');
      await runMigration({ dryRun, yes });
      break;
    }

    case 'status': {
      const cat = getCatalogData();
      const analysis = analyzeGlobalSkills();
      console.log('\n\x1b[1mAntigravity Skill Ecosystem Status:\x1b[0m');
      console.log(`  Warehouse location: \x1b[36m${getLibraryPath()}\x1b[0m`);
      console.log(`  Dormant skills stored: \x1b[32m${cat.totalSkills}\x1b[0m`);
      console.log(`  Global active skills: \x1b[33m${analysis.essentials.length + analysis.important.length + analysis.projectSpecific.length}\x1b[0m`);
      console.log(`  Workspace skills dir: \x1b[36m${getProjectSkillsPath()}\x1b[0m\n`);
      break;
    }

    case 'help':
    default:
      console.log(`
\x1b[1mAntigravity Skill Manager\x1b[0m - Lightweight on-demand skill warehouse

\x1b[1mUSAGE:\x1b[0m
  skill-manager <command> [arguments]

\x1b[1mCOMMANDS:\x1b[0m
  \x1b[36msearch <keyword>\x1b[0m         Search local warehouse by keyword, tag, or pack
  \x1b[36mactivate <name|pack>\x1b[0m     Activate skill or pack in current project (.agents/skills/)
  \x1b[36mactivate <name> --global\x1b[0m Activate skill globally (~/.gemini/config/skills/)
  \x1b[36mdeactivate <name>\x1b[0m        Remove skill from current project (.agents/skills/)
  \x1b[36mlist\x1b[0m                     List all dormant skills in the warehouse
  \x1b[36mpacks\x1b[0m                    List available curated skill packs
  \x1b[36mreindex\x1b[0m                  Regenerate catalog.json and CATALOG.md from warehouse
  \x1b[36marchive <dir>\x1b[0m            Ingest a skill directory into the warehouse and re-index
  \x1b[36mmigrate [--dry-run]\x1b[0m      Analyze and gently migrate global skills to the warehouse
  \x1b[36mstatus\x1b[0m                   Display library and active skills statistics
  \x1b[36mhelp\x1b[0m                     Show this help screen
`);
      break;
  }
}

main().catch(err => {
  console.error('\x1b[31mFatal error:\x1b[0m', err);
  process.exit(1);
});
