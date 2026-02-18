# Release Notes Pipeline

> How the automated release notes system works.

## Overview

The `scripts/release_notes.ts` script fetches merged PRs from GitHub and compiles them into a categorized Markdown document at `docs/product/RELEASE_NOTES.md`.

## Prerequisites

- **GitHub CLI (`gh`)** must be installed and authenticated
- The repository must have a GitHub remote configured
- PRs should be merged into the `develop` branch

## How to Run

```bash
# Generate release notes (all merged PRs)
npm run release:notes

# Generate since a specific date
npx tsx scripts/release_notes.ts --since 2026-01-01

# Limit number of PRs fetched
npx tsx scripts/release_notes.ts --limit 50

# As part of full pricing audit
npm run pricing:audit:full
```

## How It Works

### 1. Fetch PRs

The script runs:
```bash
gh pr list --base develop --state merged --json number,title,mergedAt,labels,url
```

PRs are sorted by `mergedAt` ascending (oldest first).

### 2. Categorize

Each PR is categorized using a two-tier system:

**Priority 1: Labels**

| Label | Category |
|-------|----------|
| `feature`, `enhancement` | New |
| `fix`, `bug` | Fixes |
| `improvement`, `refactor` | Improvements |
| `security` | Security |
| `breaking` | Breaking Changes |
| `internal` | Internal (excluded from client notes) |

**Priority 2: Title Prefix (fallback)**

| Prefix | Category |
|--------|----------|
| `feat:`, `feature:` | New |
| `fix:`, `bug:` | Fixes |
| `chore:`, `refactor:`, `docs:`, `style:`, `perf:` | Improvements |
| `test:`, `ci:`, `build:` | Internal |
| `security:` | Security |
| `breaking:` | Breaking Changes |

### 3. Filter

- `internal` labeled PRs are excluded unless they also have the `client-visible` label or contain "client" in the title
- All other categories are included

### 4. Generate Markdown

Output structure:
```
# Release Notes
> Generated on YYYY-MM-DD

## Highlights
- Top 3 items from New + Improvements

## Breaking Changes
## New
## Improvements
## Fixes
## Security
```

Each item: `- PR title (#number) — merge date`

## Output

**File:** `docs/product/RELEASE_NOTES.md`

## Integration

The release notes can be generated:
1. Manually via `npm run release:notes`
2. As part of the full pricing audit via `npm run pricing:audit:full`
3. In CI/CD as a pre-release step
4. Automatically via a GitHub Action on release

## Recommended GitHub Action

```yaml
name: Generate Release Notes
on:
  release:
    types: [published]
jobs:
  notes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run release:notes -- --since ${{ github.event.release.created_at }}
      - uses: actions/upload-artifact@v4
        with:
          name: release-notes
          path: docs/product/RELEASE_NOTES.md
```
