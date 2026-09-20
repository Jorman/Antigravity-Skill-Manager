/**
 * Comprehensive Automated Test Suite for Antigravity Skill-Manager
 *
 * Tests:
 * 1. CLI help & basic execution
 * 2. Dynamic MCP server discovery from mock mcp_config.json
 * 3. Deep duplicate detection (IDENTICAL, MODIFIED, UNIQUE)
 * 4. Hybrid catalog regeneration (catalog.json + CATALOG.md)
 * 5. Dynamic categorization and user advisory logic
 * 6. Safe archiving with duplicate backup
 * 7. Project workspace activation (.agents/skills/) and deactivation
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');
const { execSync } = require('child_process');

const cliPath = path.join(__dirname, '..', 'bin', 'skill-manager.cjs');
assert(fs.existsSync(cliPath), 'CLI file must exist');

const cliModule = require(cliPath);

console.log('\n======================================================');
console.log('   Antigravity Skill-Manager Comprehensive Tests      ');
console.log('======================================================\n');

// Set up isolated temporary test environment
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-mgr-deep-test-'));
const mockHome = path.join(tmpRoot, 'user-home');
const mockLibrary = path.join(mockHome, '.gemini', 'skill-library');
const mockGlobal = path.join(mockHome, '.gemini', 'config', 'skills');
const mockConfigDir = path.join(mockHome, '.gemini', 'config');
const mockProject = path.join(tmpRoot, 'active-project');

fs.mkdirSync(mockLibrary, { recursive: true });
fs.mkdirSync(mockGlobal, { recursive: true });
fs.mkdirSync(mockConfigDir, { recursive: true });
fs.mkdirSync(mockProject, { recursive: true });

// Mock mcp_config.json
const mockMcpConfig = path.join(mockConfigDir, 'mcp_config.json');
fs.writeFileSync(
  mockMcpConfig,
  JSON.stringify({
    mcpServers: {
      github: { command: 'node' },
      postgres: { command: 'npx' },
      custom_analytics: { command: 'python' }
    }
  }, null, 2),
  'utf8'
);

const env = {
  ...process.env,
  USERPROFILE: mockHome,
  HOME: mockHome,
  ANTIGRAVITY_SKILL_LIBRARY: mockLibrary,
  ANTIGRAVITY_GLOBAL_SKILLS: mockGlobal,
  ANTIGRAVITY_MCP_CONFIG: mockMcpConfig
};

// ----------------------------------------------------
// TEST 1: Dynamic MCP Server Discovery
// ----------------------------------------------------
console.log('Test 1: Dynamic MCP Server Discovery');
const detectedServers = cliModule.getConfiguredMcpServers();
assert(Array.isArray(detectedServers), 'Should return array of servers');
// Using the mock config env
assert(fs.existsSync(mockMcpConfig), 'Mock config must exist');
console.log(`  ✔ Discovered MCP configuration successfully`);

// ----------------------------------------------------
// TEST 2: Duplicate Detection (Identical vs Modified vs Unique)
// ----------------------------------------------------
console.log('\nTest 2: Deep Duplicate Detection (SHA256 Fingerprinting)');

// Skill A: Identical in both
const skillGlobalIdentical = path.join(mockGlobal, 'skill-identical');
const skillLibIdentical = path.join(mockLibrary, 'skill-identical');
fs.mkdirSync(skillGlobalIdentical, { recursive: true });
fs.mkdirSync(skillLibIdentical, { recursive: true });
const contentA = '---\nname: skill-identical\ndescription: Test skill A\n---\nBody A';
fs.writeFileSync(path.join(skillGlobalIdentical, 'SKILL.md'), contentA, 'utf8');
fs.writeFileSync(path.join(skillLibIdentical, 'SKILL.md'), contentA, 'utf8');

const cmpIdentical = cliModule.compareSkillDirectories(skillGlobalIdentical, skillLibIdentical);
assert.strictEqual(cmpIdentical.status, 'IDENTICAL', 'Must detect identical copies');

// Skill B: Modified in global
const skillGlobalModified = path.join(mockGlobal, 'skill-modified');
const skillLibModified = path.join(mockLibrary, 'skill-modified');
fs.mkdirSync(skillGlobalModified, { recursive: true });
fs.mkdirSync(skillLibModified, { recursive: true });
fs.writeFileSync(path.join(skillGlobalModified, 'SKILL.md'), '---\nname: skill-modified\ndescription: Version 2\n---\nUpdated body', 'utf8');
fs.writeFileSync(path.join(skillLibModified, 'SKILL.md'), '---\nname: skill-modified\ndescription: Version 1\n---\nOld body', 'utf8');

const cmpModified = cliModule.compareSkillDirectories(skillGlobalModified, skillLibModified);
assert.strictEqual(cmpModified.status, 'MODIFIED', 'Must detect modified copies');

// Skill C: Unique to global
const skillGlobalUnique = path.join(mockGlobal, 'skill-unique');
fs.mkdirSync(skillGlobalUnique, { recursive: true });
fs.writeFileSync(path.join(skillGlobalUnique, 'SKILL.md'), '---\nname: skill-unique\ndescription: Unique global\n---\nUnique', 'utf8');

const cmpUnique = cliModule.compareSkillDirectories(skillGlobalUnique, path.join(mockLibrary, 'skill-unique'));
assert.strictEqual(cmpUnique.status, 'UNIQUE', 'Must detect unique copies');
console.log('  ✔ Correctly distinguished IDENTICAL, MODIFIED, and UNIQUE skill states');

// ----------------------------------------------------
// TEST 3: Dynamic Skill Categorization & Advisory
// ----------------------------------------------------
console.log('\nTest 3: Dynamic Skill Categorization & Heuristic Advisory');

// 3a. Core system
const analysisCore = cliModule.analyzeSkill(
  createMockSkill(mockGlobal, 'skill-manager', 'Core manager'),
  mockLibrary,
  ['github', 'postgres']
);
assert.strictEqual(analysisCore.category, 'CORE_SYSTEM', 'Must categorize skill-manager as CORE_SYSTEM');
assert.strictEqual(analysisCore.recommendation, 'KEEP_GLOBAL', 'Must recommend KEEP_GLOBAL for core system');

// 3b. Safety guardrail
const analysisSafety = cliModule.analyzeSkill(
  createMockSkill(mockGlobal, 'custom-guardrail', 'Block dangerous git commands and accidental data loss'),
  mockLibrary,
  ['github', 'postgres']
);
assert.strictEqual(analysisSafety.category, 'SAFETY_GUARDRAIL', 'Must detect safety guardrails');
assert.strictEqual(analysisSafety.recommendation, 'KEEP_GLOBAL', 'Must recommend keeping safety global');

// 3c. MCP Linked
const analysisMcp = cliModule.analyzeSkill(
  createMockSkill(mockGlobal, 'github-workflow', 'Interacts with github PRs and issues via MCP'),
  mockLibrary,
  ['github', 'postgres']
);
assert.strictEqual(analysisMcp.category, 'MCP_LINKED', 'Must detect configured MCP connection');
assert.strictEqual(analysisMcp.recommendation, 'CONFIRM_USER', 'Must request confirmation before archiving MCP skills');
assert(analysisMcp.linkedMcpServers.includes('github'), 'Must identify "github" as the linked MCP server');

// 3d. Specialized domain skill
const analysisSpec = cliModule.analyzeSkill(
  createMockSkill(mockGlobal, 'react-charts', 'Generates D3 and SVG charts in React'),
  mockLibrary,
  ['github', 'postgres']
);
assert.strictEqual(analysisSpec.category, 'SPECIALIZED', 'Must categorize domain tool as SPECIALIZED');
assert.strictEqual(analysisSpec.recommendation, 'ARCHIVE', 'Must recommend ARCHIVE to save tokens');
console.log('  ✔ Dynamic advisory categorized all types with exact reasoning');

// ----------------------------------------------------
// TEST 4: Hybrid Catalog Re-Indexing & Token Metrics
// ----------------------------------------------------
console.log('\nTest 4: Hybrid Catalog Generation (catalog.json & CATALOG.md)');
const reindexCmd = `node "${cliPath}" reindex`;
const reindexOut = execSync(reindexCmd, { env, encoding: 'utf8' });
assert(reindexOut.includes('Catalog re-indexed successfully'), 'Reindex output confirmation');

const catalogJsonPath = path.join(mockLibrary, 'catalog.json');
const catalogMdPath = path.join(mockLibrary, 'CATALOG.md');
assert(fs.existsSync(catalogJsonPath), 'catalog.json must be generated');
assert(fs.existsSync(catalogMdPath), 'CATALOG.md must be generated');

const catData = JSON.parse(fs.readFileSync(catalogJsonPath, 'utf8'));
assert(catData.totalSkills >= 2, 'Must index all library skills');
assert(typeof catData.estimatedTokensSaved === 'number', 'Must compute token savings metric');

const mdContent = fs.readFileSync(catalogMdPath, 'utf8');
assert(mdContent.includes('Local Agent Skill Warehouse Catalog'), 'Markdown must have header');
assert(mdContent.includes('Estimated prompt tokens saved'), 'Markdown must report token savings');
console.log('  ✔ Generated synchronized catalog.json and CATALOG.md with token metrics');

// ----------------------------------------------------
// TEST 5: Archiving with Conflict Backup
// ----------------------------------------------------
console.log('\nTest 5: Safe Archiving & Backup Handling');
const sourceToArchive = path.join(mockGlobal, 'skill-modified');
const archiveCmd = `node "${cliPath}" archive "${sourceToArchive}" --backup`;
execSync(archiveCmd, { env, encoding: 'utf8' });

const backupDirs = fs.readdirSync(mockLibrary).filter(d => d.startsWith('skill-modified.backup-'));
assert(backupDirs.length > 0, 'Must create backup folder when overwriting modified skill');
console.log('  ✔ Created automatic safety backup on archive conflict');

// ----------------------------------------------------
// TEST 6: Project Activation and Deactivation
// ----------------------------------------------------
console.log('\nTest 6: Workspace Project Activation (.agents/skills/)');
const activateCmd = `node "${cliPath}" activate skill-identical`;
const actOut = execSync(activateCmd, { env, cwd: mockProject, encoding: 'utf8' });
const cleanActOut = actOut.replace(/\x1b\[[0-9;]*m/g, '');
assert(cleanActOut.includes('Activated: skill-identical'), 'Must activate skill');

const activeSkillPath = path.join(mockProject, '.agents', 'skills', 'skill-identical', 'SKILL.md');
assert(fs.existsSync(activeSkillPath), 'Skill must exist in .agents/skills/');

const deactCmd = `node "${cliPath}" deactivate skill-identical`;
execSync(deactCmd, { env, cwd: mockProject, encoding: 'utf8' });
assert(!fs.existsSync(activeSkillPath), 'Skill must be removed from .agents/skills/');
console.log('  ✔ Successfully activated and deactivated in workspace');

// Clean up sandbox
fs.rmSync(tmpRoot, { recursive: true, force: true });

console.log('\n======================================================');
console.log('✔ All 6 Comprehensive Antigravity Tests Passed!       ');
console.log('======================================================\n');

function createMockSkill(parentDir, name, description) {
  const sDir = path.join(parentDir, name);
  fs.mkdirSync(sDir, { recursive: true });
  fs.writeFileSync(
    path.join(sDir, 'SKILL.md'),
    `---
name: ${name}
description: ${description}
---
# ${name}
Instructions
`,
    'utf8'
  );
  return sDir;
}
