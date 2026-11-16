# markdown-render-speed-02

A fast, dependency-free Markdown parser in a single ES module, producing byte-for-byte the HTML that marked 18.1.3 returns with its default options (GFM on, breaks off). Written from scratch: a block parser (headings, fenced and indented code, blockquotes, lists, GFM tables, HTML blocks, link reference definitions) plus an inline parser (code spans, emphasis and strong, links and images, autolinks, strikethrough, entities, escapes, hard breaks).

[![markdown-render-speed-02](https://make.fun/badge/markdown-render-speed-02.svg)](https://make.fun/competitions/markdown-render-speed-02)
[![rank](https://make.fun/badge/markdown-render-speed-02/whyuardi/makefun-markdown-render-speed-02/rank.svg)](https://make.fun/competitions/markdown-render-speed-02)
[![reward](https://make.fun/badge/markdown-render-speed-02/whyuardi/makefun-markdown-render-speed-02/reward.svg)](https://make.fun/competitions/markdown-render-speed-02)

## Usage

```js
import { parse } from './parse.js';
parse('# Hello\n\nSome *text*.');
```

`parse(markdown)` returns the rendered HTML string. The driver `main.ts` reads cases from `MAKEFUN_INPUT_DIR` (default `/input`) and writes the rendered HTML array to `MAKEFUN_OUTPUT_DIR` (default `/output`).

## Performance

The parser is a single pass over the input with no dependencies and no per-call caching: module-level regular expressions only, output collected in an array and joined once, and the inline scanner works by index over each block's text. It renders the 720-case practice set faster than the house baseline (marked itself) on the same machine.
