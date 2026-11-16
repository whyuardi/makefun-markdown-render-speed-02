// Driver for the markdown-render-speed-02 entry.
// Reads cases from MAKEFUN_INPUT_DIR (default '/input') + '/cases.json'
// (an array of {id, markdown}), renders each case alone with parse(),
// and writes MAKEFUN_OUTPUT_DIR (default '/output') + '/html.json'
// (an array of HTML strings, in the same order).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { parse } from './parse.js';

type Case = { id: string; markdown: string };

const inputDir = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const cases: Case[] = JSON.parse(readFileSync(inputDir + '/cases.json', 'utf8'));
// Render each case alone with a fresh parse() call: parse() holds no
// state between calls, so one case can never affect the next.
const html: string[] = [];
for (const c of cases) html.push(parse(c.markdown));

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputDir + '/html.json', JSON.stringify(html));
