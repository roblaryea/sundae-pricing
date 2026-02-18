#!/usr/bin/env npx tsx
/**
 * Release Notes Generator
 *
 * Compiles merged PRs into a categorized release notes document.
 * Uses GitHub CLI (gh) to fetch PR data.
 *
 * Usage:
 *   npx tsx scripts/release_notes.ts
 *   npx tsx scripts/release_notes.ts --since 2026-01-01
 *   npx tsx scripts/release_notes.ts --limit 100
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_PATH = join(__dirname, '..', 'docs', 'product', 'RELEASE_NOTES.md');

// Label → category mapping
const LABEL_CATEGORY_MAP: Record<string, string> = {
  'feature': 'New',
  'enhancement': 'New',
  'fix': 'Fixes',
  'bug': 'Fixes',
  'improvement': 'Improvements',
  'refactor': 'Improvements',
  'security': 'Security',
  'breaking': 'Breaking Changes',
  'internal': 'Internal',
};

// Title prefix → category mapping (fallback when labels missing)
const PREFIX_CATEGORY_MAP: Record<string, string> = {
  'feat': 'New',
  'feature': 'New',
  'fix': 'Fixes',
  'bug': 'Fixes',
  'chore': 'Improvements',
  'refactor': 'Improvements',
  'docs': 'Improvements',
  'style': 'Improvements',
  'perf': 'Improvements',
  'test': 'Internal',
  'ci': 'Internal',
  'build': 'Internal',
  'security': 'Security',
  'breaking': 'Breaking Changes',
};

interface PR {
  number: number;
  title: string;
  mergedAt: string;
  labels: { name: string }[];
  url: string;
}

function parseArgs(): { since?: string; limit: number } {
  const args = process.argv.slice(2);
  let since: string | undefined;
  let limit = 200;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--since' && args[i + 1]) {
      since = args[i + 1];
      i++;
    }
    if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    }
  }

  return { since, limit };
}

function fetchMergedPRs(limit: number, since?: string): PR[] {
  try {
    const sinceFilter = since ? `--search "merged:>=${since}"` : '';
    const cmd = `gh pr list --base develop --state merged --json number,title,mergedAt,labels,url --limit ${limit} ${sinceFilter}`;

    console.log(`Running: ${cmd}`);
    const output = execSync(cmd, { encoding: 'utf-8', timeout: 30000 });
    const prs: PR[] = JSON.parse(output);

    // Sort by mergedAt ascending
    prs.sort((a, b) => new Date(a.mergedAt).getTime() - new Date(b.mergedAt).getTime());

    return prs;
  } catch (error) {
    console.warn('Could not fetch PRs from GitHub. Generating empty release notes.');
    console.warn('Make sure `gh` is installed and authenticated, and the repo has a remote.');
    return [];
  }
}

function categorize(pr: PR): string {
  // First try labels
  for (const label of pr.labels) {
    const category = LABEL_CATEGORY_MAP[label.name.toLowerCase()];
    if (category) return category;
  }

  // Fallback to title prefix
  const match = pr.title.match(/^(\w+)[\s(:]/);
  if (match) {
    const prefix = match[1].toLowerCase();
    const category = PREFIX_CATEGORY_MAP[prefix];
    if (category) return category;
  }

  // Check if title contains "client" to determine visibility of ambiguous items
  if (pr.title.toLowerCase().includes('client')) {
    return 'Improvements';
  }

  return 'Improvements'; // Default
}

function isClientVisible(pr: PR, category: string): boolean {
  if (category === 'Internal') {
    // Internal items are excluded unless explicitly marked client-visible
    return pr.labels.some(l => l.name.toLowerCase() === 'client-visible') ||
           pr.title.toLowerCase().includes('client');
  }
  return true;
}

function generateMarkdown(prs: PR[]): string {
  const today = new Date().toISOString().split('T')[0];
  const categories: Record<string, PR[]> = {
    'Breaking Changes': [],
    'New': [],
    'Improvements': [],
    'Fixes': [],
    'Security': [],
  };

  for (const pr of prs) {
    const category = categorize(pr);
    if (!isClientVisible(pr, category)) continue;
    if (!categories[category]) categories[category] = [];
    categories[category].push(pr);
  }

  let md = `# Release Notes\n\n`;
  md += `> Generated on ${today}\n\n`;

  if (prs.length === 0) {
    md += `No merged PRs found. Ensure the repository has a GitHub remote and \`gh\` CLI is authenticated.\n\n`;
    md += `## How to Generate\n\n`;
    md += `\`\`\`bash\nnpx tsx scripts/release_notes.ts\nnpx tsx scripts/release_notes.ts --since 2026-01-01\n\`\`\`\n`;
    return md;
  }

  // Highlights (first 3 items from New or Improvements)
  const highlights = [...categories['New'], ...categories['Improvements']].slice(0, 3);
  if (highlights.length > 0) {
    md += `## Highlights\n\n`;
    for (const pr of highlights) {
      md += `- **${pr.title}** ([#${pr.number}](${pr.url}))\n`;
    }
    md += `\n`;
  }

  // Sections
  const sectionOrder = ['Breaking Changes', 'New', 'Improvements', 'Fixes', 'Security'];

  for (const section of sectionOrder) {
    const items = categories[section];
    if (!items || items.length === 0) continue;

    md += `## ${section}\n\n`;
    for (const pr of items) {
      const date = pr.mergedAt.split('T')[0];
      md += `- ${pr.title} ([#${pr.number}](${pr.url})) — ${date}\n`;
    }
    md += `\n`;
  }

  md += `---\n\n`;
  md += `*${prs.length} PRs included in this release.*\n`;

  return md;
}

// Main
const { since, limit } = parseArgs();
console.log('Fetching merged PRs...');
const prs = fetchMergedPRs(limit, since);
console.log(`Found ${prs.length} merged PRs`);

const markdown = generateMarkdown(prs);
writeFileSync(OUTPUT_PATH, markdown, 'utf-8');
console.log(`Release notes written to ${OUTPUT_PATH}`);
