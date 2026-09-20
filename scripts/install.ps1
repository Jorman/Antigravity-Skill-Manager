<#
.SYNOPSIS
    Antigravity Skill-Manager Windows Installer (PowerShell)
.DESCRIPTION
    Installs Skill-Manager and Skill-Archiver into Google Antigravity global configuration,
    initializes the offline skill warehouse (~/.gemini/skill-library), and generates the catalog index.
#>

[CmdletBinding()]
param (
    [switch]$SkipFindSkills,
    [switch]$MigrateNow
)

$ErrorActionPreference = "Stop"

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "   Antigravity Skill-Manager Installer (Windows)      " -ForegroundColor Cyan
Write-Host "=======================================================`n" -ForegroundColor Cyan

# 1. Resolve User Home Dynamically (Zero Hardcoding)
$userHome = [Environment]::GetFolderPath("UserProfile")
$geminiDir = Join-Path $userHome ".gemini"
$configSkillsDir = Join-Path $geminiDir "config\skills"
$libraryDir = Join-Path $geminiDir "skill-library"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptRoot

Write-Host "User Profile:       " -NoNewline; Write-Host $userHome -ForegroundColor Yellow
Write-Host "Global Skills Path: " -NoNewline; Write-Host $configSkillsDir -ForegroundColor Yellow
Write-Host "Skill Library Path: " -NoNewline; Write-Host $libraryDir -ForegroundColor Yellow

# 2. Ensure Directories Exist
if (-not (Test-Path $configSkillsDir)) {
    New-Item -Path $configSkillsDir -ItemType Directory -Force | Out-Null
}
if (-not (Test-Path $libraryDir)) {
    New-Item -Path $libraryDir -ItemType Directory -Force | Out-Null
}

# 3. Copy Packs Definition
$sourcePacks = Join-Path $repoRoot "catalog\packs.json"
$destPacks = Join-Path $libraryDir "packs.json"
if (Test-Path $sourcePacks) {
    Copy-Item -Path $sourcePacks -Destination $destPacks -Force
    Write-Host "✔ Curated packs definition installed." -ForegroundColor Green
}

# 4. Install Global Core Skills
$skillsToInstall = @("skill-manager", "skill-archiver")
foreach ($skill in $skillsToInstall) {
    $src = Join-Path $repoRoot "skills\$skill"
    $dest = Join-Path $configSkillsDir $skill
    if (Test-Path $src) {
        if (Test-Path $dest) { Remove-Item -Path $dest -Recurse -Force }
        Copy-Item -Path $src -Destination $dest -Recurse -Force
        Write-Host "✔ Installed global skill: $skill" -ForegroundColor Green
    }
}

# 5. Check / Install find-skills (Online Registry Tool)
$findSkillsPath = Join-Path $configSkillsDir "find-skills"
if (-not (Test-Path $findSkillsPath) -and -not $SkipFindSkills) {
    Write-Host "`nChecking for online fallback tool (find-skills)..." -ForegroundColor Cyan
    try {
        Write-Host "Installing find-skills via npx..." -ForegroundColor Gray
        npx skills add https://github.com/vercel-labs/skills --skill find-skills --yes
        Write-Host "✔ Installed find-skills successfully." -ForegroundColor Green
    } catch {
        Write-Host "⚠ Note: Could not auto-install find-skills via npx. You can run manually:" -ForegroundColor Yellow
        Write-Host "  npx skills add https://github.com/vercel-labs/skills --skill find-skills" -ForegroundColor Yellow
    }
}

# 6. Rebuild Catalog Index
$cliPath = Join-Path $repoRoot "bin\skill-manager.cjs"
if (Test-Path $cliPath) {
    Write-Host "`nRebuilding warehouse catalog index..." -ForegroundColor Cyan
    node $cliPath reindex
}

Write-Host "`n=======================================================" -ForegroundColor Green
Write-Host "✔ Antigravity Skill-Manager Installed Successfully!   " -ForegroundColor Green
Write-Host "=======================================================`n" -ForegroundColor Green

Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. To search skills:   node $cliPath search <query>" -ForegroundColor Gray
Write-Host "2. To activate a pack: node $cliPath activate stitch-ui" -ForegroundColor Gray
Write-Host "3. To optimize tokens: node $cliPath migrate" -ForegroundColor Yellow

if ($MigrateNow) {
    node $cliPath migrate
}
