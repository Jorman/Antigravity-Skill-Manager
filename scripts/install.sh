#!/usr/bin/env bash
# Antigravity Skill-Manager Installer (macOS & Linux)
# Installs Skill-Manager and Skill-Archiver into ~/.gemini/config/skills/
# Initializes offline warehouse in ~/.gemini/skill-library/ and re-indexes the catalog.

set -e

echo ""
echo "======================================================="
echo "   Antigravity Skill-Manager Installer (Unix/macOS)    "
echo "======================================================="
echo ""

# Dynamic Home Resolution
USER_HOME="$HOME"
GEMINI_DIR="$USER_HOME/.gemini"
CONFIG_SKILLS_DIR="$GEMINI_DIR/config/skills"
LIBRARY_DIR="$GEMINI_DIR/skill-library"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "User Profile:       $USER_HOME"
echo "Global Skills Path: $CONFIG_SKILLS_DIR"
echo "Skill Library Path: $LIBRARY_DIR"

# Ensure directories exist
mkdir -p "$CONFIG_SKILLS_DIR"
mkdir -p "$LIBRARY_DIR"

# Copy Packs definition
if [ -f "$REPO_ROOT/catalog/packs.json" ]; then
    cp "$REPO_ROOT/catalog/packs.json" "$LIBRARY_DIR/packs.json"
    echo "✔ Curated packs definition installed."
fi

# Install Core Global Skills
for skill in skill-manager skill-archiver; do
    if [ -d "$REPO_ROOT/skills/$skill" ]; then
        rm -rf "$CONFIG_SKILLS_DIR/$skill"
        cp -R "$REPO_ROOT/skills/$skill" "$CONFIG_SKILLS_DIR/$skill"
        echo "✔ Installed global skill: $skill"
    fi
done

# Check / Install find-skills
if [ ! -d "$CONFIG_SKILLS_DIR/find-skills" ]; then
    echo ""
    echo "Checking for online fallback tool (find-skills)..."
    if command -v npx >/dev/null 2>&1; then
        npx skills add https://github.com/vercel-labs/skills --skill find-skills --yes || {
            echo "⚠ Could not auto-install find-skills via npx. Run manually:"
            echo "  npx skills add https://github.com/vercel-labs/skills --skill find-skills"
        }
    fi
fi

# Make CLI executable
chmod +x "$REPO_ROOT/bin/skill-manager.cjs"

# Rebuild catalog index
echo ""
echo "Rebuilding warehouse catalog index..."
node "$REPO_ROOT/bin/skill-manager.cjs" reindex

echo ""
echo "======================================================="
echo "✔ Antigravity Skill-Manager Installed Successfully!   "
echo "======================================================="
echo ""
echo "Usage:"
echo "  node $REPO_ROOT/bin/skill-manager.cjs search <query>"
echo "  node $REPO_ROOT/bin/skill-manager.cjs activate <name|pack>"
echo "  node $REPO_ROOT/bin/skill-manager.cjs migrate"
echo ""
