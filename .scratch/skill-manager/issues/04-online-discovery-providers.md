# 04 - Online Discovery & Fallback Registry

Type: grilling
Status: resolved
Blocked by: 01

## Question

How should online search and fallback be handled when a requested skill is not in the local warehouse?
1. Support `skills.sh` via `npx skills find <query>` and `npx skills add <skill>`.
2. Support GitHub repository searches (e.g. searching GitHub topic `antigravity-skills` or curated repos).
3. Support direct Git clone / URL download (e.g. paste a repo URL or skill markdown link).
4. Tiered fallback: Local Warehouse -> Official Curated Index -> `skills.sh` -> Direct Git URL.

## Answer

Approved:
1. Search local offline warehouse (`~/.gemini/skill-library/`) first.
2. If not found, fallback to online search using `find-skills` skill (`npx skills find <query>`).
3. If `find-skills` is not yet installed in the environment, the migration & search skills must recommend and install it:
   `npx skills add https://github.com/vercel-labs/skills --skill find-skills`
4. Support direct installation/activation into the workspace (`.agents/skills/`) or global scope.
