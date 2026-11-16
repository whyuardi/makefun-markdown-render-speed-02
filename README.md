# markdown-render-speed-02

A fast, dependency-free Markdown renderer written from scratch. It produces byte-for-byte the same HTML as `marked` 18.1.3 with default options (GFM on, breaks off), covering CommonMark 0.31.2 plus GitHub Flavoured Markdown extensions: tables, task lists, strikethrough, autolinks and footnotes-free inline parsing.

[![make.fun](https://make.fun/badge/markdown-render-speed-02.svg)](https://make.fun/competitions/markdown-render-speed-02)
[![rank](https://make.fun/badge/markdown-render-speed-02/whyuardi/makefun-markdown-render-speed-02/rank.svg)](https://make.fun/competitions/markdown-render-speed-02)
[![reward](https://make.fun/badge/markdown-render-speed-02/whyuardi/makefun-markdown-render-speed-02/reward.svg)](https://make.fun/competitions/markdown-render-speed-02)

## Usage

```js
import { parse } from './parse.js';

parse('# Hello\n\nSome *emphasised* text.');
// '<h1>Hello</h1>\n<p>Some <em>emphasised</em> text.</p>\n'
```

`parse(markdown)` takes a Markdown string and returns the rendered HTML string. No dependencies, no network access, no per-call caching.

## Files

- `parse.js` — the renderer (ES module, no imports).
- `main.ts` — the make.fun driver: reads `cases.json`, renders each case, writes `html.json`.
