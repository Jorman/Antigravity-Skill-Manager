/**
 * Automated Test Suite for Antigravity Skill-Manager
 * Validates cross-platform path resolution, indexing, search, and activation.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');
const { execSync } = require('child_process');

console.log('\n--- Running Antigravity Skill-Manager Test Suite ---\n');

const cliPath = path.join(__dirname, '..', 'bin', 'skill-manager.cjs');
assert(fs.existsSync(cliPath), 'CLI file must exist');

// Test 1: CLI Help Command
console.log('Test 1: CLI help command execution');
const helpOutput = execSync(`node "${cliPath}" help`, { encoding: 'utf8' });
assert(helpOutput.includes('Antigravity Skill Manager'), 'Help output must include banner');
assert(helpOutput.includes('reindex'), 'Help must list reindex command');
console.log('  ✔ Help command passed');

// Test 2: Temporary Sandbox Warehouse Operations
console.log('\nTest 2: Isolated sandbox indexing and activation');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-mgr-test-'));
const mockLibrary = path.join(tmpDir, 'skill-library');
const mockProject = path.join(tmpDir, 'mock-project');
fs.mkdirSync(mockLibrary, { recursive: true });
fs.mkdirSync(mockProject, { recursive: true });

// Create sample mock skills
const skill1Dir = path.join(mockLibrary, 'test-react-skill');
fs.mkdirSync(skill1Dir, { recursive: true });
fs.writeFileSync(
  path.join(skill1Dir, 'SKILL.md'),
  `---
name: test-react-skill
description: High-performance React UI testing components
---
# React Skill
Test body
`,
  'utf8'
);

const skill2Dir = path.join(mockLibrary, 'test-mcp-skill');
fs.mkdirSync(skill2Dir, { recursive: true });
fs.writeFileSync(
  path.join(skill2Dir, 'SKILL.md'),
  `---
name: test-mcp-skill
description: Tool using call_mcp_tool for database inspection
---
# MCP Skill
Calls mcp tools
`,
  'utf8'
);

// Run reindex in sandbox
const reindexCmd = `node "${cliPath}" reindex`;
const env = { ...process.env, ANTIGRAVITY_SKILL_LIBRARY: mockLibrary };
const reindexOut = execSync(reindexCmd, { env, encoding: 'utf8' });
assert(reindexOut.includes('Catalog re-indexed successfully'), 'Reindex must succeed');

// Verify catalog.json and CATALOG.md
const catalogJsonPath = path.join(mockLibrary, 'catalog.json');
const catalogMdPath = path.join(mockLibrary, 'CATALOG.md');
assert(fs.existsSync(catalogJsonPath), 'catalog.json must be created');
assert(fs.existsSync(catalogMdPath), 'CATALOG.md must be created');

const catalogData = JSON.parse(fs.readFileSync(catalogJsonPath, 'utf8'));
assert.strictEqual(catalogData.totalSkills, 2, 'Must have indexed 2 mock skills');

const mcpSkill = catalogData.skills.find(s => s.name === 'test-mcp-skill');
assert(mcpSkill && mcpSkill.mcpRelated === true, 'Must detect MCP relationship in test-mcp-skill');
console.log('  ✔ Sandbox indexing and hybrid catalog generation passed');

// Test 3: Search Functionality
console.log('\nTest 3: Search matching');
const searchOut = execSync(`node "${cliPath}" search react`, { env, encoding: 'utf8' });
assert(searchOut.includes('test-react-skill'), 'Search must find test-react-skill');
console.log('  ✔ Keyword search passed');

// Test 4: Project Activation
console.log('\nTest 4: Workspace Project Activation');
const activateCmd = `node "${cliPath}" activate test-react-skill`;
const actEnv = {
  ...env,
};
const activateOut = execSync(activateCmd, { env: actEnv, cwd: mockProject, encoding: 'utf8' });
const cleanActOut = activateOut.replace(/\x1b\[[0-9;]*m/g, '');
assert(cleanActOut.includes('Activated: test-react-skill'), 'Activation must succeed');

const projectSkillMd = path.join(mockProject, '.agents', 'skills', 'test-react-skill', 'SKILL.md');
assert(fs.existsSync(projectSkillMd), 'Activated skill must exist in .agents/skills/');
console.log('  ✔ Workspace project activation passed');

// Test 5: Deactivation
console.log('\nTest 5: Workspace Project Deactivation');
const deactCmd = `node "${cliPath}" deactivate test-react-skill`;
const deactOut = execSync(deactCmd, { env: actEnv, cwd: mockProject, encoding: 'utf8' });
const cleanDeactOut = deactOut.replace(/\x1b\[[0-9;]*m/g, '');
assert(cleanDeactOut.includes('Deactivated skill "test-react-skill"'), 'Deactivation must succeed');
assert(!fs.existsSync(projectSkillMd), 'Deactivated skill must be removed from .agents/skills/');
console.log('  ✔ Workspace project deactivation passed');

// Cleanup
fs.rmSync(tmpDir, { recursive: true, force: true });

console.log('\n=============================================');
console.log('✔ All 5 Antigravity Skill-Manager tests passed!');
console.log('=============================================\n');
