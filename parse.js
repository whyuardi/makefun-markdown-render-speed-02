// parse.js — a fast CommonMark 0.31.2 + GFM renderer whose output matches
// marked 18.1.3 with default options (gfm on, breaks off). Written from
// scratch from the CommonMark and GFM specifications and the observed
// behaviour of the reference on the spec examples. No imports, no network,
// no clock, no caching between calls: every call is independent.

// ---- Named HTML entities (the ones the spec examples and generated
// documents use, plus the common Latin-1 / Greek / punctuation set) ----
const ENT = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0',
  copy: '\u00a9', reg: '\u00ae', trade: '\u2122', hellip: '\u2026',
  mdash: '\u2014', ndash: '\u2013', lsquo: '\u2018', rsquo: '\u2019',
  ldquo: '\u201c', rdquo: '\u201d', laquo: '\u00ab', raquo: '\u00bb',
  ouml: '\u00f6', auml: '\u00e4', uuml: '\u00fc', euml: '\u00eb',
  iuml: '\u00ef', Ouml: '\u00d6', Auml: '\u00c4', Uuml: '\u00dc',
  Euml: '\u00cb', Iuml: '\u00cf', aacute: '\u00e1', eacute: '\u00e9',
  iacute: '\u00ed', oacute: '\u00f3', uacute: '\u00fa', Aacute: '\u00c1',
  Eacute: '\u00c9', Iacute: '\u00cd', Oacute: '\u00d3', Uacute: '\u00da',
  agrave: '\u00e0', egrave: '\u00e8', igrave: '\u00ec', ograve: '\u00f2',
  ugrave: '\u00f9', Agrave: '\u00c0', Egrave: '\u00c8', Igrave: '\u00cc',
  Ograve: '\u00d2', Ugrave: '\u00d9', acirc: '\u00e2', ecirc: '\u00ea',
  icirc: '\u00ee', ocirc: '\u00f4', ucirc: '\u00fb', Acirc: '\u00c2',
  Ecirc: '\u00ca', Icirc: '\u00ce', Ocirc: '\u00d4', Ucirc: '\u00db',
  atilde: '\u00e3', otilde: '\u00f5', ntilde: '\u00f1', Atilde: '\u00c3',
  Otilde: '\u00d5', Ntilde: '\u00d1', aelig: '\u00e6', AElig: '\u00c6',
  oslash: '\u00f8', Oslash: '\u00d8', aring: '\u00e5', Aring: '\u00c5',
  ccedil: '\u00e7', Ccedil: '\u00c7', szlig: '\u00df', yuml: '\u00ff',
  Yuml: '\u0178', frac12: '\u00bd', frac14: '\u00bc', frac34: '\u00be',
  frac14_ : '', Dcaron: '\u010e', dcaron: '\u010f', Scaron: '\u0160',
  scaron: '\u0161', Zcaron: '\u017d', zcaron: '\u017e', Ccaron: '\u010c',
  ccaron: '\u010d', Ecaron: '\u011a', ecaron: '\u011b', Ncaron: '\u0147',
  ncaron: '\u0148', Rcaron: '\u0158', rcaron: '\u0159', Tcaron: '\u0164',
  tcaron: '\u0165', Yacute: '\u00dd', yacute: '\u00fd', thorn: '\u00fe',
  THORN: '\u00de', eth: '\u00f0', ETH: '\u00d0', sup1: '\u00b9',
  sup2: '\u00b2', sup3: '\u00b3', micro: '\u00b5', para: '\u00b6',
  sect: '\u00a7', deg: '\u00b0', plusmn: '\u00b1', middot: '\u00b7',
  bull: '\u2022', dagger: '\u2020', Dagger: '\u2021', permil: '\u2030',
  prime: '\u2032', Prime: '\u2033', oline: '\u203e', frasl: '\u2044',
  euro: '\u20ac', pound: '\u00a3', yen: '\u00a5', cent: '\u00a2',
  curren: '\u00a4', brvbar: '\u00a6', uml: '\u00a8', ordf: '\u00aa',
  ordm: '\u00ba', iexcl: '\u00a1', iquest: '\u00bf', acute: '\u00b4',
  cedil: '\u00b8', macr: '\u00af', shy: '\u00ad', Alpha: '\u0391',
  Beta: '\u0392', Gamma: '\u0393', Delta: '\u0394', Epsilon: '\u0395',
  Zeta: '\u0396', Eta: '\u0397', Theta: '\u0398', Iota: '\u0399',
  Kappa: '\u039a', Lambda: '\u039b', Mu: '\u039c', Nu: '\u039d',
  Xi: '\u039e', Omicron: '\u039f', Pi: '\u03a0', Rho: '\u03a1',
  Sigma: '\u03a3', Tau: '\u03a4', Upsilon: '\u03a5', Phi: '\u03a6',
  Chi: '\u03a7', Psi: '\u03a8', Omega: '\u03a9', alpha: '\u03b1',
  beta: '\u03b2', gamma: '\u03b3', delta: '\u03b4', epsilon: '\u03b5',
  zeta: '\u03b6', eta: '\u03b7', theta: '\u03b8', iota: '\u03b9',
  kappa: '\u03ba', lambda: '\u03bb', mu: '\u03bc', nu: '\u03bd',
  xi: '\u03be', omicron: '\u03bf', pi: '\u03c0', rho: '\u03c1',
  sigmaf: '\u03c2', sigma: '\u03c3', tau: '\u03c4', upsilon: '\u03c5',
  phi: '\u03c6', chi: '\u03c7', psi: '\u03c8', omega: '\u03c9',
  thetasym: '\u03d1', upsih: '\u03d2', piv: '\u03d6', ensp: '\u2002',
  emsp: '\u2003', thinsp: '\u2009', zwnj: '\u200c', zwj: '\u200d',
  lrm: '\u200e', rlm: '\u200f', lsaquo: '\u2039', rsaquo: '\u203a',
  sbquo: '\u201a', bdquo: '\u201e', lowast: '\u2217', minus: '\u2212',
  plus: '+', times: '\u00d7', divide: '\u00f7', ne: '\u2260',
  le: '\u2264', ge: '\u2265', infin: '\u221e', int: '\u222b',
  sum: '\u2211', prod: '\u220f', part: '\u2202', empty: '\u2205',
  isin: '\u2208', notin: '\u2209', ni: '\u220b', cap: '\u2229',
  cup: '\u222a', sub: '\u2282', sup: '\u2283', nsub: '\u2284',
  sube: '\u2286', supe: '\u2287', oplus: '\u2295', otimes: '\u2297',
  perp: '\u22a5', sdot: '\u22c5', lceil: '\u2308', rceil: '\u2309',
  lfloor: '\u230a', rfloor: '\u230b', lang: '\u27e8', rang: '\u27e9',
  loz: '\u25ca', spades: '\u2660', clubs: '\u2663', hearts: '\u2665',
  diams: '\u2666', crarr: '\u21b5', larr: '\u2190', uarr: '\u2191',
  rarr: '\u2192', darr: '\u2193', harr: '\u2194', forall: '\u2200',
  exist: '\u2203', nabla: '\u2207', equiv: '\u2261', asymp: '\u2248',
  cong: '\u2245', sime: '\u2243', prop: '\u221d', ang: '\u2220',
  and: '\u2227', or: '\u2228', there4: '\u2234', sim: '\u223c',
  fnof: '\u0192', weierp: '\u2118', image: '\u2111', real: '\u211c',
  alefsym: '\u2135', larrhk: '\u21a9', rarrhk: '\u21aa', uarrhk: '\u21a7',
  darrhk: '\u21a9', nearr: '\u2197', searr: '\u2198', nwarr: '\u2196',
  swarr: '\u2199', circ: '\u02c6', tilde: '\u02dc', ndash2: '',
  HilbertSpace: '\u210b', DifferentialD: '\u2145',
  ClockwiseContourIntegral: '\u2232', ngE: '\u2267\u0338',
  NotEqualTilde: '\u2242\u0338', nGg: '\u22d9\u0338',
  // a few long HTML5 names that show up in generated documents
  CounterClockwiseContourIntegral: '\u2233',
  DoubleLongLeftRightArrow: '\u27fa',
};
delete ENT.frac14_;
delete ENT.ndash2;

// ASCII punctuation, per CommonMark.
const ASCII_PUNCT = '!\"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
function isAsciiPunct(c) { return ASCII_PUNCT.indexOf(c) !== -1; }
function isSpaceCode(c) {
  return c === 32 || c === 9 || c === 10 || c === 11 || c === 12 || c === 13;
}
// Unicode whitespace (CommonMark): space, tab, LF, VT, FF, CR, NBSP and
// the Unicode Zs / Zl / Zp spaces.
function isUnicodeSpace(ch) {
  const c = ch.charCodeAt(0);
  return c === 32 || c === 9 || c === 10 || c === 11 || c === 12 || c === 13 ||
    c === 0xa0 || c === 0x1680 || (c >= 0x2000 && c <= 0x200a) ||
    c === 0x2028 || c === 0x2029 || c === 0x202f || c === 0x205f || c === 0x3000;
}
// Unicode punctuation (CommonMark): general categories P and S.
const RE_PUNCT = /[\p{P}\p{S}]/u;
function isUnicodePunct(ch) {
  const c = ch.charCodeAt(0);
  if (c < 128) return isAsciiPunct(ch);
  return RE_PUNCT.test(ch);
}

// ---- HTML escaping ----
// Strict: escape every & < > " ' (used for code and attribute values that
// come from raw text). `escText` keeps valid entity references intact.
const RE_ESC = /[&<>"']/g;
function escStrict(s) {
  return s.replace(RE_ESC, (ch) => ch === '&' ? '&amp;' : ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : ch === '"' ? '&quot;' : '&#39;');
}
// Keep &-sequences that look like character references (&name; &#123;
// &#x1F;) untouched; escape every other & and the other three/four chars.
// This is what the reference does for ordinary text, titles and hrefs.
const RE_ESC_NOENC = /[&<>"']/g;
function escText(s) {
  if (s.indexOf('&') === -1) return escStrict(s);
  let out = '';
  let i = 0;
  const n = s.length;
  while (i < n) {
    const c = s.charCodeAt(i);
    if (c === 38) { // &
      const semi = s.indexOf(';', i + 1);
      if (semi !== -1 && semi - i <= 34) {
        const body = s.slice(i + 1, semi);
        if (/^(#\d+|#[xX][0-9a-fA-F]+|[A-Za-z][\w]*)$/.test(body) && body.length > 0) {
          // numeric references are decoded by the caller before escaping;
          // a surviving numeric-looking one is invalid (too big) -> escape
          if (body[0] === '#') { out += '&amp;'; i++; continue; }
          out += s.slice(i, semi + 1); i = semi + 1; continue;
        }
      }
      out += '&amp;'; i++;
    } else if (c === 60) { out += '&lt;'; i++; }
    else if (c === 62) { out += '&gt;'; i++; }
    else if (c === 34) { out += '&quot;'; i++; }
    else if (c === 39) { out += '&#39;'; i++; }
    else { out += s[i]; i++; }
  }
  return out;
}

// encodeURI, as the reference applies it to link destinations and
// autolink hrefs. Native encodeURI leaves exactly the unreserved +
// reserved set alone; that matches the observed outputs.
function cleanHref(raw) {
  // encodeURI, but % is left as-is (valid %XX and bare % alike).
  return encodeURI(raw).replace(/%25/g, '%');
}

// Decode a numeric character reference body (without the leading #).
// Returns the character, or null when the reference is invalid.
function decodeNumeric(body) {
  let n;
  if (body[0] === 'x' || body[0] === 'X') {
    if (!/^[xX][0-9a-fA-F]+$/.test(body)) return null;
    n = parseInt(body.slice(1), 16);
  } else {
    if (!/^\d+$/.test(body)) return null;
    n = parseInt(body, 10);
  }
  if (n === 0 || (n >= 0xD800 && n <= 0xDFFF)) return '\uFFFD';
  if (n > 0x10FFFF) return null;
  return String.fromCodePoint(n);
}

// Try to match a character reference at s[i] === '&'.
// Returns [decodedText, endIndex] where decodedText is the text to emit
// (a single decoded char, or the verbatim &name; reference), or null.
function matchEntity(s, i) {
  const semi = s.indexOf(';', i + 1);
  if (semi === -1 || semi - i > 33) return null;
  const body = s.slice(i + 1, semi);
  if (body.length === 0) return null;
  if (body[0] === '#') {
    const ch = decodeNumeric(body.slice(1));
    if (ch === null) return null;
    return [ch, semi + 1];
  }
  if (/^[A-Za-z][A-Za-z0-9]*$/.test(body)) {
    // Named reference: the reference passes through verbatim whether or
    // not it is a real HTML5 entity (the reference does the same).
    return [s.slice(i, semi + 1), semi + 1];
  }
  return null;
}

// Resolve backslash escapes and character references in a link
// destination or title (raw text -> cleaned text, entities kept verbatim).
function cleanLinkText(raw) {
  let out = '';
  let i = 0;
  const n = raw.length;
  while (i < n) {
    const c = raw[i];
    if (c === '\\' && i + 1 < n && isAsciiPunct(raw[i + 1])) { out += raw[i + 1]; i += 2; continue; }
    if (c === '&') {
      const m = matchEntity(raw, i);
      if (m) { out += m[0]; i = m[1]; continue; }
    }
    out += c; i++;
  }
  return out;
}

// Resolve backslash escapes in an info string (first word only).
function cleanInfo(raw) {
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === '\\' && i + 1 < raw.length && isAsciiPunct(raw[i + 1])) { out += raw[i + 1]; i++; continue; }
    out += c;
  }
  return out;
}

// Normalize a link label: collapse whitespace runs to one space, trim,
// lowercase. (CommonMark label normalization.)
function normalizeLabel(raw) {
  return raw.replace(/\s+/g, ' ').trim().toLowerCase().replace(/ß/g, 'ss');
}

// ---- Line views (tab-aware) ----
// A line is {s, i, col, rem, base, lz, nl}: s the raw line string, i the
// char index where the line's content starts, col the column there, rem
// the spaces left of a partially consumed tab at i, base the absolute
// column of the container's content start for this line (virtual
// columns are col - base), lz a lazy-continuation flag, nl whether the
// line ended with a newline in the source.
function copyView(L) { return { s: L.s, i: L.i, col: L.col, rem: L.rem, base: L.base === undefined ? L.col : L.base }; }
function vch(v) { return v.rem > 0 ? ' ' : (v.i < v.s.length ? v.s[v.i] : ''); }
// Advance exactly one column (a tab is consumed one column at a time).
function vadvCol(v) {
  if (v.rem > 0) { v.rem--; v.col++; if (v.rem === 0) v.i++; return; }
  const c = v.s[v.i];
  if (c === '\t') {
    const w = 4 - (v.col % 4);
    if (w > 1) { v.rem = w - 1; v.col++; } else { v.i++; v.col++; }
  } else { v.i++; v.col++; }
}
function vadv(v) {
  if (v.rem > 0) { v.rem--; v.col++; if (v.rem === 0) v.i++; return; }
  const c = v.s[v.i];
  v.i++;
  v.col += c === '\t' ? 4 - (v.col % 4) : 1;
}
// Advance over spaces/tabs up to column n.
function vskip(v, n) {
  while (v.col < n) {
    const c = vch(v);
    if (c !== ' ' && c !== '\t') break;
    if (c === '\t' && v.rem === 0) {
      const w = 4 - (v.col % 4);
      if (v.col + w > n) { v.rem = v.col + w - n; v.col = n; break; }
    }
    vadv(v);
  }
  return v.col;
}
function vskipAll(v) { while (true) { const c = vch(v); if (c !== ' ' && c !== '\t') break; vadv(v); } }
function vrest(v) { return v.rem > 0 ? ' '.repeat(v.rem) + v.s.slice(v.i + 1) : v.s.slice(v.i); }
function viewIsBlank(v) { const w = copyView(v); vskipAll(w); return vch(w) === ''; }
function lineIsBlank(L) { return viewIsBlank(L); }

// ---- Block parsing ----
// Node types: doc/para/head/code/hr/html/quote/list/item/table.
// A paragraph node holds raw text (s); a heading holds raw inline text;
// code holds content + optional lang; table holds align/head/rows of raw
// cell strings; list holds items; item holds children + task flag.

const BLOCK_TAGS = new Set(('address article aside base basefont blockquote body caption center col colgroup dd details dialog dir div dl dt fieldset figcaption figure footer form frame frameset h1 h2 h3 h4 h5 h6 head header hr html iframe legend li link main menu menuitem meta nav noframes ol optgroup option p param section source summary table tbody td tfoot th thead title tr track ul').split(' '));

// Match an HTML tag at s[i] (s[i] === '<'). Returns the index just past
// the closing '>' or -1. Attributes are validated (name, optional =
// value: double-quoted, single-quoted or unquoted), so something like
// <https://...> is not a tag.
function matchTagEnd(s, i) {
  const n = s.length;
  let j = i + 1;
  let closing = false;
  if (s[j] === '/') { closing = true; j++; }
  if (j >= n || !/[A-Za-z]/.test(s[j])) return -1;
  while (j < n && /[A-Za-z0-9-]/.test(s[j])) j++;
  if (closing) {
    // A closing tag has no attributes: only whitespace then >.
    while (j < n && (s[j] === ' ' || s[j] === '\t' || s[j] === '\n')) j++;
    if (j < n && s[j] === '>') return j + 1;
    return -1;
  }
  while (true) {
    if (j < n && s[j] === '>') return j + 1;
    if (j < n && s[j] === '/' && s[j + 1] === '>') return j + 2;
    // An attribute must be preceded by whitespace.
    let sp = 0;
    while (j < n && (s[j] === ' ' || s[j] === '\t' || s[j] === '\n')) { j++; sp++; }
    if (j >= n) return -1;
    if (s[j] === '>') return j + 1;
    if (s[j] === '/' && s[j + 1] === '>') return j + 2;
    if (sp === 0) return -1;
    if (!/[A-Za-z_:]/.test(s[j])) return -1;
    while (j < n && /[A-Za-z0-9_.:-]/.test(s[j])) j++;
    // Optional value: look ahead for = without consuming the separator.
    let k = j;
    while (k < n && (s[k] === ' ' || s[k] === '\t' || s[k] === '\n')) k++;
    if (s[k] === '=') {
      j = k + 1;
      while (j < n && (s[j] === ' ' || s[j] === '\t' || s[j] === '\n')) j++;
      if (s[j] === '"' || s[j] === "'") {
        const q = s[j]; j++;
        while (j < n && s[j] !== q) j++;
        if (j >= n) return -1;
        j++;
      } else {
        if (j >= n || /[\s"'=<>`]/.test(s[j])) return -1;
        while (j < n && !/[\s"'=<>`]/.test(s[j])) j++;
      }
    }
  }
}

// HTML block type for the line starting at view v (indent < 4):
// 0 none, 1 script/pre/style/textarea, 2 comment, 3 PI, 4 declaration,
// 5 CDATA, 6 block tag, 7 complete tag alone on the line.
function htmlBlockType(v) {
  const s = v.s;
  let i = v.i;
  if (s[i] !== '<') return 0;
  const rest = s.slice(i + 1).toLowerCase();
  if (rest.startsWith('!--')) return 2;
  if (rest.startsWith('?')) return 3;
  if (rest.startsWith('![cdata[')) return 5;
  if (rest[0] === '!') {
    if (/[a-z]/.test(rest[1] || '')) return 4;
    return 0;
  }
  let nameStart = i + 1;
  let closing = false;
  if (s[nameStart] === '/') { closing = true; nameStart++; }
  if (!/[A-Za-z]/.test(s[nameStart] || '')) return 0;
  let j = nameStart;
  while (/[A-Za-z0-9-]/.test(s[j] || '')) j++;
  const name = s.slice(nameStart, j).toLowerCase();
  const after = s[j] || '';
  if (!closing && (name === 'script' || name === 'pre' || name === 'style' || name === 'textarea')) {
    if (after === '' || after === ' ' || after === '\t' || after === '>') return 1;
    return 0;
  }
  if (BLOCK_TAGS.has(name)) {
    if (after === '' || after === ' ' || after === '\t' || after === '>' || after === '/') return 6;
    return 0;
  }
  // Type 7: a complete open/close tag alone on the line.
  const end = matchTagEnd(s, i);
  if (end !== -1) {
    let k = end;
    while (k < s.length && (s[k] === ' ' || s[k] === '\t')) k++;
    if (k >= s.length) return 7;
  }
  return 0;
}

function isThematicBreak(v) {
  const w = copyView(v);
  const ch = vch(w);
  if (ch !== '-' && ch !== '_' && ch !== '*') return false;
  let n = 0;
  while (true) {
    const c = vch(w);
    if (c === ch) { n++; vadv(w); }
    else if (c === ' ' || c === '\t') vadv(w);
    else if (c === '') break;
    else return false;
  }
  return n >= 3;
}

// Setext underline level for a line view: 1 for '=', 2 for '-', 0 none.
// The signs must be contiguous (no spaces between them).
function setextLevel(L) {
  const v = copyView(L);
  vskip(v, v.col + 3);
  const ch = vch(v);
  if (ch !== '=' && ch !== '-') return 0;
  while (vch(v) === ch) vadv(v);
  const w = copyView(v);
  vskipAll(w);
  if (vch(w) !== '') return 0;
  return ch === '=' ? 1 : 2;
}

function tryAtx(v) {
  const w = copyView(v);
  let n = 0;
  while (vch(w) === '#') { vadv(w); n++; }
  if (n === 0 || n > 6) return null;
  const c = vch(w);
  if (c !== '' && c !== ' ' && c !== '\t') return null;
  let rest = vrest(w);
  rest = rest.replace(/[ \t]+$/, '');
  rest = rest.replace(/[ \t]+#+$/, '');
  rest = rest.replace(/^[ \t]+/, '').replace(/[ \t]+$/, '');
  return { t: 'head', lv: n, s: rest };
}

// Is the line a fenced-code start? (indent < 4, 3+ backticks/tildes;
// for backticks the info string must not contain a backtick.)
function fenceStart(v) {
  const ch = vch(v);
  if (ch !== '`' && ch !== '~') return null;
  const w = copyView(v);
  let n = 0;
  while (vch(w) === ch) { vadv(w); n++; }
  if (n < 3) return null;
  const info = vrest(w).replace(/^[ \t]+/, '').replace(/[ \t]+$/, '');
  if (ch === '`' && info.indexOf('`') !== -1) return null;
  return { ch, n, info };
}

function tryListStart(v) {
  const ch = vch(v);
  if (ch === '-' || ch === '+' || ch === '*') {
    const w = copyView(v);
    vadv(w);
    const c = vch(w);
    if (c !== '' && c !== ' ' && c !== '\t') return null;
    return { ordered: false, bullet: ch, delim: '', start: 0, markerLen: 1, markerCol: v.col - v.base };
  }
  if (ch >= '0' && ch <= '9') {
    const w = copyView(v);
    let num = 0, ndig = 0;
    while (true) {
      const c = vch(w);
      if (c >= '0' && c <= '9') { num = num * 10 + (c.charCodeAt(0) - 48); ndig++; vadv(w); } else break;
    }
    if (ndig === 0 || ndig > 9) return null;
    const d = vch(w);
    if (d !== '.' && d !== ')') return null;
    vadv(w);
    const c = vch(w);
    if (c !== '' && c !== ' ' && c !== '\t') return null;
    return { ordered: true, bullet: '', delim: d, start: num, markerLen: ndig + 1, markerCol: v.col - v.base };
  }
  return null;
}

// Content indent (virtual columns) and content view for a list item's
// marker line. The content view's base is the absolute content column,
// so the content's virtual column is 0.
function listContent(v, marker) {
  const w = copyView(v);
  vskip(w, v.base + marker.markerCol);
  for (let k = 0; k < marker.markerLen; k++) vadv(w);
  const startCol = w.col;
  // Count whitespace columns after the marker, up to 5.
  let spaces = 0;
  const u = copyView(w);
  while (spaces < 5) {
    const c = vch(u);
    if (c !== ' ' && c !== '\t') break;
    vadvCol(u);
    spaces++;
  }
  let contentIndent;
  if (spaces === 0) {
    contentIndent = marker.markerCol + marker.markerLen + 1;
  } else if (spaces <= 4) {
    contentIndent = marker.markerCol + marker.markerLen + spaces;
    for (let k = 0; k < spaces; k++) vadvCol(w);
  } else {
    contentIndent = marker.markerCol + marker.markerLen + 1;
    vadvCol(w);
  }
  w.base = w.col;
  return { indent: contentIndent, view: w };
}

// Does this line start a new item of the list at listIndent (virtual
// columns)? The marker may be indented 0-3 columns past the list's
// indent and still belong to the same list.
function matchListItem(L, listIndent, ordered, bullet, delim) {
  if (lineIsBlank(L) || L.lz) return null;
  const w = copyView(L);
  vskipAll(w);
  const vc = w.col - L.base;
  // A later item may be indented up to 3 past the list indent, or up
  // to 3 before it (a list whose first item is indented still takes
  // siblings at a lesser indent).
  if (vc < listIndent - 3 || vc > listIndent + 3) return null;
  if (isThematicBreak(w)) return null;
  const m = tryListStart(w);
  if (!m) return null;
  if (m.ordered !== ordered) return null;
  if (ordered && m.delim !== delim) return null;
  if (!ordered && m.bullet !== bullet) return null;
  return m;
}

// Can this line interrupt a paragraph? ignoreLz lets a lazy line be
// tested for being a block start anyway.
function canInterrupt(L, ignoreLz) {
  if (L.lz && !ignoreLz) return false;
  const v = copyView(L);
  vskipAll(v);
  if (v.col - L.col >= 4) return false;
  const ch = vch(v);
  if (ch === '') return false;
  if (ch === '#') return !!tryAtx(v);
  if (ch === '`' || ch === '~') return !!fenceStart(v);
  if (ch === '-' || ch === '_' || ch === '*') {
    if (isThematicBreak(v)) return true;
  }
  if (ch === '<') {
    const t = htmlBlockType(v);
    if (t >= 1 && t <= 6) return true;
  }
  if (ch === '>') return true;
  const m = tryListStart(v);
  if (m) {
    // A list interrupts unless the item is empty; an ordered list must
    // start at 1.
    if (m.ordered && m.start !== 1) return false;
    const lc = listContent(v, m);
    if (viewIsBlank(lc.view)) return false;
    return true;
  }
  return false;
}

// Join lines [a, b) as block text: lines joined with '\n', plus a
// trailing '\n' when the last line had one.
function joinLinesText(lines, a, b) {
  let out = '';
  for (let k = a; k < b; k++) {
    out += vrest(lines[k]);
    if (k < b - 1 || lines[k].nl) out += '\n';
  }
  return out;
}

function parseIndentedCode(lines, i, end) {
  const parts = [];
  let j = i;
  let lastNonBlank = -1;
  while (j < end) {
    const L = lines[j];
    if (L.lz) break;
    if (lineIsBlank(L)) {
      const bv = copyView(L);
      vskip(bv, bv.col + 4);
      parts.push({ t: vrest(bv), nl: L.nl });
      j++;
      continue;
    }
    const v = copyView(L);
    const startCol = v.col;
    const c = vskip(v, startCol + 4);
    if (c < startCol + 4) break;
    parts.push({ t: vrest(v), nl: L.nl });
    lastNonBlank = parts.length - 1;
    j++;
  }
  let content = '';
  for (let k = 0; k <= lastNonBlank; k++) {
    content += parts[k].t;
    if (parts[k].nl) content += '\n';
  }
  return [{ t: 'code', s: content, lang: '', fenced: false }, j];
}

function parseFenced(lines, i, end, v, fs) {
  // Content lines lose up to the opening fence's indentation.
  const fenceIndent = v.col - lines[i].col;
  const parts = [];
  let j = i + 1;
  let closed = false;
  while (j < end) {
    const L = lines[j];
    if (L.lz) break;
    const w = copyView(L);
    vskipAll(w);
    if (w.col - L.col < 4) {
      let m = 0;
      const w2 = copyView(w);
      while (vch(w2) === fs.ch) { vadv(w2); m++; }
      if (m >= fs.n) {
        const w3 = copyView(w2);
        vskipAll(w3);
        if (vch(w3) === '') { closed = true; j++; break; }
      }
    }
    const cw = copyView(L);
    vskip(cw, cw.col + fenceIndent);
    let ct = vrest(cw);
    // A leading tab expands to spaces when the fence is indented
    // (column > 0); at column 0 the tab is kept verbatim.
    if (ct.charCodeAt(0) === 9 && cw.col > 0) {
      ct = ' '.repeat(4 - (cw.col % 4)) + ct.slice(1);
    }
    parts.push({ t: ct, nl: L.nl });
    j++;
  }
  // An unclosed fence does not keep trailing blank lines.
  if (!closed) {
    while (parts.length > 0 && /^[ \t]*$/.test(parts[parts.length - 1].t)) parts.pop();
  }
  let content = '';
  for (let k = 0; k < parts.length; k++) {
    content += parts[k].t;
    // The last line contributes its newline only when it is non-empty.
    if (parts[k].nl && (k < parts.length - 1 || parts[k].t !== '')) content += '\n';
  }
  let lang = '';
  if (fs.info.length > 0) {
    const sp = fs.info.search(/[ \t]/);
    lang = sp === -1 ? fs.info : fs.info.slice(0, sp);
    lang = cleanInfo(lang);
  }
  return [{ t: 'code', s: content, lang, fenced: true }, j];
}

// HTML block: returns [node, nextI] or null. `top` is true when the
// lines array is the document (not a container's inner lines): a block
// at the end of a container loses its trailing newline, one at EOF
// keeps it.
function parseHtmlBlock(lines, i, end, v, type, top) {
  let j = i;
  // Determine the end marker for types 1-5.
  let endTag = '';
  if (type === 1) {
    const s = v.s.slice(v.i + 1).toLowerCase();
    const m = /^(script|pre|style|textarea)/.exec(s);
    endTag = '</' + (m ? m[1] : 'script') + '>';
  } else if (type === 2) endTag = '-->';
  else if (type === 3) endTag = '?>';
  else if (type === 4) endTag = '>';
  else if (type === 5) endTag = ']]>';
  if (type >= 1 && type <= 5) {
    // The block includes lines until the line containing the end marker.
    while (j < end) {
      const L = lines[j];
      if (L.lz) break;
      if (lineIsBlank(L)) { j++; continue; }
      const text = vrest(L).toLowerCase();
      j++;
      if (text.indexOf(endTag) !== -1) break;
    }
  } else {
    // Types 6-7 end at the first blank line.
    while (j < end) {
      const L = lines[j];
      if (L.lz) break;
      if (lineIsBlank(L)) break;
      j++;
    }
  }
  // The trailing newline of the last line is kept unless the block is
  // followed by a truly empty line, or the block ends because its
  // container ends (not at the document's end). A whitespace-only line
  // still keeps the newline.
  let text = '';
  for (let k = i; k < j; k++) {
    text += vrest(lines[k]);
    if (k < j - 1) text += '\n';
    else if (j < end && vrest(lines[j]) !== '' && !lines[j].lz) text += '\n';
    else if (j >= end && top && lines[k].nl) text += '\n';
  }
  return [{ t: 'html', s: text }, j];
}

function parseBlockquote(lines, i, end, refs) {
  let j = i;
  const inner = [];
  let prevBlank = false;
  while (j < end) {
    const L = lines[j];
    if (lineIsBlank(L)) break;
    const v = copyView(L);
    vskip(v, v.base + 3);
    if (vch(v) === '>') {
      vadv(v);
      if (vch(v) === ' ' || vch(v) === '\t') vadvCol(v);
      const nv = { s: L.s, i: v.i, col: v.col, rem: v.rem, base: v.col, lz: 0, nl: L.nl };
      prevBlank = viewIsBlank(nv);
      inner.push(nv);
      j++;
      continue;
    }
    if (prevBlank) break;
    inner.push({ s: L.s, i: L.i, col: L.col, rem: L.rem, base: L.base, lz: 1, nl: L.nl });
    prevBlank = false;
    j++;
  }
  const r = parseBlocks(inner, 0, inner.length, refs, false);
  return [{ t: 'quote', c: r[0] }, Math.max(i + 1, i + r[1])];
}


// ---- Link reference definitions ----
// Skip spaces/tabs/newlines in text starting at p.
function skipWsText(text, p) {
  while (p < text.length) {
    const c = text[p];
    if (c === ' ' || c === '\t' || c === '\n') p++;
    else break;
  }
  return p;
}
// Skip spaces/tabs only (same line).
function skipSpacesText(text, p) {
  while (p < text.length && (text[p] === ' ' || text[p] === '\t')) p++;
  return p;
}
// Parse a link title starting at text[p] (opener ", ' or (). Returns
// [rawTitle, endIndex] or null.
function parseTitleText(text, p) {
  const open = text[p];
  if (open === '"' || open === "'") {
    let q = p + 1;
    let out = '';
    while (q < text.length) {
      const c = text[q];
      if (c === '\\' && q + 1 < text.length && isAsciiPunct(text[q + 1])) { out += text[q + 1]; q += 2; continue; }
      if (c === open) return [out, q + 1];
      out += c; q++;
    }
    return null;
  }
  if (open === '(') {
    let q = p + 1;
    let out = '';
    let depth = 1;
    while (q < text.length) {
      const c = text[q];
      if (c === '\\' && q + 1 < text.length && isAsciiPunct(text[q + 1])) { out += text[q + 1]; q += 2; continue; }
      if (c === '(') { depth++; out += c; q++; continue; }
      if (c === ')') {
        depth--;
        if (depth === 0) return [out, q + 1];
        out += c; q++; continue;
      }
      out += c; q++;
    }
    return null;
  }
  return null;
}

// Try to parse a link reference definition starting at lines[i].
// Returns the line index just past the definition, or -1.
function tryRefdef(lines, i, end, refs) {
  let text = '';
  let k = i;
  let count = 0;
  while (k < end && count < 20) {
    const L = lines[k];
    if (lineIsBlank(L) || L.lz) break;
    text += vrest(L) + '\n';
    count++;
    k++;
  }
  if (count === 0) return -1;
  const n = text.length;
  let p = 0;
  let col = 0;
  while (p < n && (text[p] === ' ' || text[p] === '\t') && col < 3) {
    col += text[p] === '\t' ? 4 - (col % 4) : 1;
    p++;
  }
  if (text[p] !== '[') return -1;
  let label = '';
  let q = p + 1;
  let labelEnd = -1;
  while (q < n) {
    const c = text[q];
    if (c === '\\' && q + 1 < n && isAsciiPunct(text[q + 1])) { label += '\\' + text[q + 1]; q += 2; continue; }
    if (c === '[') return -1;
    if (c === ']') { labelEnd = q; break; }
    label += c;
    q++;
  }
  if (labelEnd === -1 || label.length > 999) return -1;
  const norm = normalizeLabel(label);
  if (norm === '') return -1;
  p = labelEnd + 1;
  p = skipSpacesText(text, p);
  if (text[p] !== ':') return -1;
  p++;
  p = skipWsText(text, p);
  // Destination.
  let dest = '';
  let destEnd = -1;
  if (text[p] === '<') {
    let q2 = p + 1;
    let ok = false;
    while (q2 < n) {
      const c = text[q2];
      if (c === '\n') break;
      if (c === '\\' && q2 + 1 < n && isAsciiPunct(text[q2 + 1])) { dest += text[q2 + 1]; q2 += 2; continue; }
      if (c === '<') break;
      if (c === '>') { ok = true; break; }
      dest += c;
      q2++;
    }
    if (!ok) return -1;
    destEnd = q2 + 1;
  } else {
    let depth = 0;
    let q2 = p;
    while (q2 < n) {
      const c = text[q2];
      if (c === ' ' || c === '\t' || c === '\n') break;
      if (c.charCodeAt(0) < 32) break;
      if (c === '\\' && q2 + 1 < n && isAsciiPunct(text[q2 + 1])) { dest += text[q2 + 1]; q2 += 2; continue; }
      if (c === '(') depth++;
      else if (c === ')') { if (depth === 0) break; depth--; }
      dest += c;
      q2++;
    }
    if (dest.length === 0 || depth !== 0) return -1;
    destEnd = q2;
  }
  // Attempt with title, then dest-only.
  let title = null;
  let endPos = -1;
  const afterDest = skipWsText(text, destEnd);
  const tc = text[afterDest];
  if (tc === '"' || tc === "'" || tc === '(') {
    // A title needs whitespace between it and the destination.
    if (afterDest === destEnd) return -1;
    const tp = parseTitleText(text, afterDest);
    if (tp) {
      const eol = skipSpacesText(text, tp[1]);
      if (text[eol] === '\n' || eol >= n) { title = tp[0]; endPos = eol; }
    }
  }
  if (endPos === -1) {
    const eol = skipSpacesText(text, destEnd);
    if (text[eol] === '\n' || eol >= n) endPos = eol;
    else return -1;
  }
  const linesUsed = text.slice(0, endPos).split('\n').length;
  if (!refs.has(norm)) {
    refs.set(norm, { href: cleanLinkText(dest), title: title === null ? null : cleanLinkText(title) });
  }
  return i + linesUsed;
}

// ---- Tables (GFM) ----
// Split a table row line into cells, honouring \| escapes and `code`.
function splitTableRow(text) {
  const cells = [];
  let cur = '';
  let i = 0;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (c === '\\' && i + 1 < n && text[i + 1] === '|') { cur += '|'; i += 2; continue; }
    if (c === '\\' && i + 1 < n && isAsciiPunct(text[i + 1])) { cur += text[i] + text[i + 1]; i += 2; continue; }
    if (c === '`') {
      let m = 0;
      while (i + m < n && text[i + m] === '`') m++;
      let j = i + m;
      let found = -1;
      while (j < n) {
        if (text[j] === '`') {
          let kk = 0;
          while (j + kk < n && text[j + kk] === '`') kk++;
          if (kk === m) { found = j; break; }
          j += kk;
        } else j++;
      }
      if (found === -1) { cur += text.slice(i, i + m); i += m; continue; }
      cur += text.slice(i, found + m).replace(/\\\|/g, '|');
      i = found + m;
      continue;
    }
    if (c === '|') { cells.push(cur); cur = ''; i++; continue; }
    cur += c;
    i++;
  }
  cells.push(cur);
  // Drop a leading empty cell when the line starts with | and a trailing
  // empty cell when it ends with | (ignoring surrounding spaces).
  let start = 0;
  while (start < text.length && (text[start] === ' ' || text[start] === '\t')) start++;
  let stop = text.length;
  while (stop > 0 && (text[stop - 1] === ' ' || text[stop - 1] === '\t')) stop--;
  if (text[start] === '|') cells.shift();
  if (stop > 0 && text[stop - 1] === '|') cells.pop();
  return cells;
}

// Try to parse a table starting at lines[j] (header) / lines[j+1]
// (delimiter). Returns [node, nextI] or null.
function tryTable(lines, j, end) {
  // The delimiter row may be indented at most 3 columns.
  const dv = copyView(lines[j + 1]);
  vskipAll(dv);
  if (dv.col - lines[j + 1].col > 3) return null;
  const delimCells = splitTableRow(vrest(lines[j + 1]));
  const aligns = [];
  for (const c of delimCells) {
    const t = c.replace(/^[ \t]+/, '').replace(/[ \t]+$/, '');
    if (!/^:?-+:?$/.test(t)) return null;
    aligns.push(t[0] === ':' && t[t.length - 1] === ':' ? 'center' : t[0] === ':' ? 'left' : t[t.length - 1] === ':' ? 'right' : null);
  }
  if (aligns.length === 0) return null;
  const headCells = splitTableRow(vrest(lines[j]));
  if (headCells.length !== aligns.length) return null;
  const rows = [];
  let k = j + 2;
  while (k < end) {
    const L = lines[k];
    // A line with no characters at all ends the table, but a
    // whitespace-only line is an (empty) row, not a blank line.
    if (vrest(L) === '' && !L.lz) break;
    if (L.lz) { rows.push(splitTableRow(vrest(L))); k++; continue; }
    if (canInterrupt(L)) break;
    rows.push(splitTableRow(vrest(L)));
    k++;
  }
  return [{ t: 'table', align: aligns, head: headCells, rows }, k];
}

// ---- Lists ----
function parseItem(lines, i, end, refs, marker, listIndent, ordered, bullet, delim) {
  const lc = listContent(copyView(lines[i]), marker);
  let ci = lc.indent;
  const inner = [];
  const first = lc.view;
  inner.push({ s: lines[i].s, i: first.i, col: first.col, rem: first.rem, base: first.base, lz: 0, nl: lines[i].nl });
  let j = i + 1;
  let prevBlank = viewIsBlank(first);
  let hasContent = !prevBlank;
  // Fenced-code tracking: content lines of a fence opened inside this
  // item belong to the item even when less indented than ci, so they
  // must not be marked lazy (a lazy line ends a fenced block). But a
  // less-indented line before the fence has any content ends the fence
  // (empty) and the item: it is not part of the item at all.
  let fenceCh = null;
  let fenceN = 0;
  let fenceHasContent = false;
  {
    const fv = copyView(first);
    vskip(fv, fv.base + 3);
    const fs0 = fenceStart(fv);
    if (fs0) { fenceCh = fs0.ch; fenceN = fs0.n; }
  }
  // An item starting with a blank line takes its content indent from
  // the first non-blank line that follows immediately, unless that
  // line is indented more than 4 past the marker (then it is code).
  if (!hasContent && i + 1 < end) {
    const NL = lines[i + 1];
    if (!lineIsBlank(NL) && !NL.lz) {
      const nv = copyView(NL);
      vskipAll(nv);
      const nvc = nv.col - NL.base;
      if (nvc > marker.markerCol && nvc <= marker.markerCol + 4) ci = nvc;
    }
  }
  while (j < end) {
    const L = lines[j];
    if (lineIsBlank(L)) {
      // An item can begin with at most one blank line.
      if (!hasContent && prevBlank) break;
      inner.push({ s: '', i: 0, col: 0, rem: 0, base: 0, lz: 0, nl: L.nl });
      if (fenceCh) fenceHasContent = true;
      prevBlank = true;
      j++;
      continue;
    }
    const mm = matchListItem(L, listIndent, ordered, bullet, delim);
    // A marker at or past this item's content indent starts a nested
    // list inside the item, not a sibling item.
    if (mm && mm.markerCol < ci) break;
    const v = copyView(L);
    const c = vskip(v, L.base + ci);
    // Inside a fenced block, every non-blank line is content (even when
    // less indented than ci); a closing fence ends the block. But before
    // the fence has any content, a less-indented non-closing line ends
    // the fence (empty) and the item.
    if (fenceCh) {
      const w = copyView(L);
      vskipAll(w);
      let m = 0;
      const w2 = copyView(w);
      while (vch(w2) === fenceCh) { vadv(w2); m++; }
      let closed = false;
      if (m >= fenceN && w.col - (L.base + ci) < 4) {
        const w3 = copyView(w2);
        vskipAll(w3);
        if (vch(w3) === '') closed = true;
      }
      if (!closed && !fenceHasContent && c - L.base < ci) break;
      if (c - L.base >= ci) {
        inner.push({ s: L.s, i: v.i, col: v.col, rem: v.rem, base: L.base + ci, lz: 0, nl: L.nl });
        fenceHasContent = true;
      } else {
        inner.push({ s: L.s, i: L.i, col: L.col, rem: L.rem, base: L.base, lz: 0, nl: L.nl });
        fenceHasContent = true;
      }
      if (closed) { fenceCh = null; fenceN = 0; fenceHasContent = false; }
      prevBlank = false;
      hasContent = true;
      j++;
      continue;
    }
    if (c - L.base >= ci) {
      inner.push({ s: L.s, i: v.i, col: v.col, rem: v.rem, base: L.base + ci, lz: 0, nl: L.nl });
      prevBlank = false;
      hasContent = true;
      // A regular line may open a fenced block.
      {
        const fv = copyView(v);
        vskip(fv, fv.base + 3);
        const fs1 = fenceStart(fv);
        if (fs1) { fenceCh = fs1.ch; fenceN = fs1.n; }
      }
      j++;
      continue;
    }
    if (prevBlank) break;
    inner.push({ s: L.s, i: L.i, col: L.col, rem: L.rem, base: L.base, lz: 1, nl: L.nl });
    prevBlank = false;
    hasContent = true;
    j++;
  }
  while (inner.length > 0 && lineIsBlank(inner[inner.length - 1])) inner.pop();
  const r = parseBlocks(inner, 0, inner.length, refs, false);
  const nodes = r[0];
  // The item is loose when its direct children are separated by a
  // blank line (blank lines inside a nested container do not count).
  const internalBlank = r[2];
  // Task list item: the first paragraph starts with [ ] / [x] / [X].
  let task = 0;
  if (nodes.length > 0 && nodes[0].t === 'para') {
    const s = nodes[0].s;
    const m = /^\[([ xX])\](?:[ \t]|\n|$)/.exec(s);
    if (m) {
      task = m[1] === ' ' ? 1 : 2;
      let rest = s.slice(4);
      if (rest[0] === '\n') rest = rest.slice(1);
      else if (rest[0] === ' ' || rest[0] === '\t') rest = rest.slice(1);
      if (rest === '') nodes.shift();
      else nodes[0].s = rest;
    }
  }
  return [{ t: 'item', c: nodes, task }, Math.max(i + 1, i + r[1]), internalBlank];
}

function parseList(lines, i, end, refs, firstMarker) {
  const listIndent = firstMarker.markerCol;
  const ordered = firstMarker.ordered;
  const bullet = firstMarker.bullet;
  const delim = firstMarker.delim;
  const start = firstMarker.start;
  const items = [];
  let loose = false;
  let j = i;
  while (j < end) {
    const m = matchListItem(lines[j], listIndent, ordered, bullet, delim);
    if (!m) break;
    const r = parseItem(lines, j, end, refs, m, listIndent, ordered, bullet, delim);
    items.push(r[0]);
    if (r[2]) loose = true;
    j = r[1];
    let k = j;
    let blanks = 0;
    while (k < end && lineIsBlank(lines[k])) { blanks++; k++; }
    if (k < end && matchListItem(lines[k], listIndent, ordered, bullet, delim)) {
      if (blanks > 0) loose = true;
      j = k;
      continue;
    }
    break;
  }
  return [{ t: 'list', ordered, start, tight: !loose, c: items }, j];
}

// A line ends a paragraph when it is blank; a line whose content
// (after its container marker) is non-empty whitespace is a paragraph
// continuation inside a container (e.g. `>  ` contributes a space).
function isParaBlank(L) {
  if (!lineIsBlank(L)) return false;
  if (L.i > 0 && vrest(L) !== '') return false;
  return true;
}

// ---- Paragraphs ----
function parseParagraph(lines, i, end, refs, nested) {
  let j = i;
  while (j < end) {
    const L = lines[j];
    if (lineIsBlank(L) || L.lz) break;
    const r = tryRefdef(lines, j, end, refs);
    if (r < 0) break;
    j = r;
  }
  if (j >= end || lineIsBlank(lines[j]) || lines[j].lz) return [null, j];
  if (j + 1 < end && setextLevel(lines[j + 1]) === 0) {
    const t = tryTable(lines, j, end);
    if (t) return t;
  }
  const parts = [];
  let k = j;
  while (k < end) {
    const L = lines[k];
    if (isParaBlank(L)) break;
    if (L.lz) {
      const se = setextLevel(L);
      if (se > 0 && parts.length > 0) {
        if (se === 2) break;
        parts.push('    ' + vrest(L));
        k++;
        continue;
      }
      if (canInterrupt(L, true)) break;
      // A lazy line that starts a (non-empty) list item ends the item
      // even when the item could not interrupt a paragraph (e.g. an
      // ordered item not starting at 1).
      {
        const lv = copyView(L);
        vskipAll(lv);
        if (lv.col - L.base < 4) {
          const lm = tryListStart(lv);
          if (lm) {
            const lc = listContent(lv, lm);
            if (!viewIsBlank(lc.view)) break;
          }
        }
      }
      // A lazy line loses its leading whitespace.
      const w = copyView(L);
      vskipAll(w);
      parts.push(vrest(w));
      k++;
      continue;
    }
    const se = setextLevel(L);
    if (se > 0 && parts.length > 0) {
      const node = { t: 'head', lv: se, s: parts.join('\n').replace(/^[ \t\n]+/, '').replace(/[ \t\n]+$/, '') };
      return [node, k + 1];
    }
    if (canInterrupt(L)) break;
    // Inside a container, a line starting a (non-empty) nested list
    // ends the paragraph even when the list could not interrupt a
    // paragraph at the top level (e.g. an ordered item not starting
    // at 1).
    if (nested) {
      const lv = copyView(L);
      vskipAll(lv);
      if (lv.col - L.base < 4) {
        const lm = tryListStart(lv);
        if (lm) {
          const lc = listContent(lv, lm);
          if (!viewIsBlank(lc.view)) break;
        }
      }
    }
    parts.push(vrest(L));
    k++;
  }
  if (parts.length === 0) return [null, k];
  return [{ t: 'para', s: parts.join('\n') }, k];
}

function parseBlocks(lines, i, end, refs, top) {
  const nodes = [];
  let hadBlankBetween = false;
  let seenBlank = false;
  let hasNode = false;
  while (i < end) {
    const L = lines[i];
    if (lineIsBlank(L)) { seenBlank = true; i++; continue; }
    if (L.lz) break;
    const v = copyView(L);
    vskipAll(v);
    const col = v.col;
    if (col - L.col >= 4) {
      const r = parseIndentedCode(lines, i, end);
      if (seenBlank && hasNode) hadBlankBetween = true;
      seenBlank = false;
      hasNode = true;
      nodes.push(r[0]);
      i = r[1];
      continue;
    }
    const ch = vch(v);
    if (ch === '`' || ch === '~') {
      const fs = fenceStart(v);
      if (fs) {
        const r = parseFenced(lines, i, end, v, fs);
        if (seenBlank && hasNode) hadBlankBetween = true;
        seenBlank = false;
        hasNode = true;
        nodes.push(r[0]);
        i = r[1];
        continue;
      }
    }
    if (ch === '#') {
      const h = tryAtx(v);
      if (h) { if (seenBlank && hasNode) hadBlankBetween = true; seenBlank = false; hasNode = true; nodes.push(h); i++; continue; }
    }
    if (ch === '-' || ch === '_' || ch === '*') {
      if (isThematicBreak(v)) { if (seenBlank && hasNode) hadBlankBetween = true; seenBlank = false; hasNode = true; nodes.push({ t: 'hr' }); i++; continue; }
    }
    if (ch === '<') {
      const ht = htmlBlockType(v);
      if (ht > 0) {
        const r = parseHtmlBlock(lines, i, end, v, ht, top);
        if (seenBlank && hasNode) hadBlankBetween = true;
        seenBlank = false;
        hasNode = true;
        nodes.push(r[0]);
        i = r[1];
        continue;
      }
    }
    if (ch === '>') {
      const r = parseBlockquote(lines, i, end, refs);
      if (seenBlank && hasNode) hadBlankBetween = true;
      seenBlank = false;
      hasNode = true;
      nodes.push(r[0]);
      i = r[1];
      continue;
    }
    const lm = tryListStart(v);
    if (lm) {
      const r = parseList(lines, i, end, refs, lm);
      if (seenBlank && hasNode) hadBlankBetween = true;
      seenBlank = false;
      hasNode = true;
      nodes.push(r[0]);
      i = r[1];
      continue;
    }
    const r = parseParagraph(lines, i, end, refs, !top);
    if (r[0]) {
      if (seenBlank && hasNode) hadBlankBetween = true;
      seenBlank = false;
      hasNode = true;
      nodes.push(r[0]);
    } else if (r[1] > i) {
      // A refdef-only paragraph still counts as a block for looseness.
      if (seenBlank && hasNode) hadBlankBetween = true;
      seenBlank = false;
      hasNode = true;
    }
    i = r[1] > i ? r[1] : i + 1;
  }
  return [nodes, i, hadBlankBetween];
}

// ---- Inline parsing ----
// Flat node list; markers are nodes too (link/em/strong/del open/close).
// Node types:
const NT_TEXT = 0, NT_CODE = 1, NT_HTML = 2, NT_BR = 3;
const NT_LINK_O = 4, NT_LINK_C = 5;
const NT_EM_O = 6, NT_EM_C = 7;
const NT_STR_O = 8, NT_STR_C = 9;
const NT_DEL_O = 10, NT_DEL_C = 11;
const NT_IMG = 12;

const EMAIL_LOCAL = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.!#$%&'*+/=?^_`{|}~-";
function isEmailLocalCh(ch) { return EMAIL_LOCAL.indexOf(ch) !== -1; }
function isAlnumCode(c) { return (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122); }
// A character that may precede an extended autolink.
function isAutolinkBoundary(prev) {
  if (prev === undefined || prev === '') return true;
  const c = prev.charCodeAt(0);
  if (c === 32 || c === 9 || c === 10) return true;
  if (isAlnumCode(c)) return false;
  if (isEmailLocalCh(prev) || prev === '/' || prev === '@') return false;
  return true;
}
// Could an extended autolink (www./scheme/email) start at s[j]?
function maybeAutolink(s, j) {
  if (s.slice(j, j + 4) === 'www.') return true;
  const n = s.length;
  const lim = Math.min(n, j + 64);
  for (let k = j; k < lim; k++) {
    const c = s[k];
    if (c === ':' || c === '@') return true;
    if (c === ' ' || c === '\t' || c === '\n' || c === '<') return false;
  }
  return false;
}

// Match a domain (labels separated by dots) starting at s[i].
// Returns the end index, or -1. Requires at least two labels.
function matchDomain(s, i) {
  let p = i;
  let labels = 0;
  let lastEnd = -1;
  let lastLabelStart = -1;
  while (true) {
    const c = s[p];
    if (c === undefined || !/[A-Za-z0-9]/.test(c)) return -1;
    lastLabelStart = p;
    p++;
    while (/[A-Za-z0-9-]/.test(s[p] || '')) p++;
    while (p > lastLabelStart && s[p - 1] === '-') p--;
    if (p === lastLabelStart) return -1;
    labels++;
    lastEnd = p;
    if (s[p] === '.' && /[A-Za-z0-9]/.test(s[p + 1] || '')) { p++; continue; }
    break;
  }
  if (labels < 2) return -1;
  return lastEnd;
}

// Trim an autolink tail [start, end) with the GFM trailing rules:
// an &name; entity ending, trailing punctuation, unbalanced ')'.
function trimAutolinkTail(s, start, end) {
  let changed = true;
  while (changed) {
    changed = false;
    // Entity ending: &alnum+; at the end.
    let amp = -1;
    for (let k = end - 2; k >= start; k--) {
      if (s[k] === '&') { amp = k; break; }
      if (s[k] === ';') break;
    }
    if (amp !== -1 && end - amp >= 3 && s[end - 1] === ';') {
      let ok = true;
      for (let k = amp + 1; k < end - 1; k++) {
        if (!/[A-Za-z0-9]/.test(s[k])) { ok = false; break; }
      }
      if (ok) { end = amp; changed = true; continue; }
    }
    // Trailing punctuation.
    if (end > start) {
      const c = s[end - 1];
      if (c === '?' || c === '!' || c === '.' || c === ',' || c === ':' || c === ';' || c === '*' || c === '_' || c === '~') {
        end--; changed = true; continue;
      }
    }
    // Unbalanced trailing ')'.
    if (end > start && s[end - 1] === ')') {
      let open = 0, close = 0;
      for (let k = start; k < end; k++) {
        if (s[k] === '(') open++;
        else if (s[k] === ')') close++;
      }
      if (close > open) { end--; changed = true; continue; }
    }
  }
  return end;
}

// Match the tail of a URL autolink (everything up to whitespace or '<').
function matchUrlTail(s, i) {
  let p = i;
  while (p < s.length) {
    const c = s[p];
    if (c === ' ' || c === '\t' || c === '\n' || c === '<') break;
    p++;
  }
  return trimAutolinkTail(s, i, p);
}

// Match an email address starting at s[i]. Returns the end index or -1.
function matchEmail(s, i) {
  let p = i;
  while (p < s.length && isEmailLocalCh(s[p])) p++;
  if (p === i || s[p] !== '@') return -1;
  p++;
  const d = matchDomain(s, p);
  if (d === -1) return -1;
  const c = s[d];
  if (c !== undefined && /[A-Za-z0-9_-]/.test(c)) return -1;
  return d;
}

// Try an extended autolink (www. / scheme: / email) at s[i].
// Returns {href, end} or null; the link text is s.slice(i, end).
function tryExtendedAutolink(s, i) {
  // www.
  if (s[i] === 'w' && s.slice(i, i + 4) === 'www.') {
    const d = matchDomain(s, i + 4);
    if (d !== -1) {
      const end = matchUrlTail(s, d);
      if (end > d) return { href: 'http://' + s.slice(i, end), end };
      return { href: 'http://' + s.slice(i, d), end: d };
    }
    return null;
  }
  // Scheme: 2-32 chars, then ':'.
  const colon = s.indexOf(':', i);
  if (colon !== -1 && colon - i >= 2 && colon - i <= 32) {
    let okScheme = true;
    for (let k = i; k < colon; k++) {
      const c = s[k];
      if (!/[A-Za-z0-9+.-]/.test(c)) { okScheme = false; break; }
    }
    if (okScheme && /[A-Za-z]/.test(s[i])) {
      if (s[colon + 1] === '/' && s[colon + 2] === '/') {
        const end = matchUrlTail(s, colon + 1);
        if (end > colon + 1) return { href: s.slice(i, end), end };
        return null;
      }
      const em = matchEmail(s, colon + 1);
      if (em !== -1) {
        // Optional single /segment after the email.
        let end = em;
        if (s[end] === '/') {
          let q = end + 1;
          while (q < s.length) {
            const c = s[q];
            if (c === ' ' || c === '\t' || c === '\n' || c === '<' || c === '/') break;
            q++;
          }
          if (q > end + 1) end = trimAutolinkTail(s, end + 1, q);
        }
        return { href: s.slice(i, end), end };
      }
      return null;
    }
  }
  // Bare email.
  const em = matchEmail(s, i);
  if (em !== -1) return { href: 'mailto:' + s.slice(i, em), end: em };
  return null;
}

// Match an inline HTML tag (or comment/PI/declaration/CDATA) at s[i].
// Returns the end index or -1.
function matchHtmlInline(s, i) {
  if (s.slice(i, i + 4) === '<!--') {
    if (s.slice(i, i + 5) === '<!-->') return i + 5;
    if (s.slice(i, i + 6) === '<!--->') return i + 6;
    const e = s.indexOf('-->', i + 4);
    return e === -1 ? -1 : e + 3;
  }
  if (s.slice(i, i + 2) === '<?') {
    const e = s.indexOf('?>', i + 2);
    return e === -1 ? -1 : e + 2;
  }
  if (s.slice(i, i + 9) === '<![CDATA[') {
    const e = s.indexOf(']]>', i + 9);
    return e === -1 ? -1 : e + 3;
  }
  if (s[i + 1] === '!') {
    if (/[A-Za-z]/.test(s[i + 2] || '')) {
      const e = s.indexOf('>', i + 2);
      return e === -1 ? -1 : e + 1;
    }
    return -1;
  }
  return matchTagEnd(s, i);
}

// Parse a link destination/title suffix starting at s[p] === '('.
// Returns {href, title, end} or null. href/title are raw (uncleaned).
function parseInlineSuffix(s, p) {
  const n = s.length;
  let q = p + 1;
  q = skipWsText(s, q);
  let href = '';
  let hrefEnd = -1;
  if (s[q] === '<') {
    let r = q + 1;
    let ok = false;
    while (r < n) {
      const c = s[r];
      if (c === '\n') break;
      if (c === '\\' && r + 1 < n && isAsciiPunct(s[r + 1])) { href += s[r + 1]; r += 2; continue; }
      if (c === '<') break;
      if (c === '>') { ok = true; break; }
      href += c;
      r++;
    }
    if (!ok) return null;
    hrefEnd = r + 1;
  } else {
    let depth = 0;
    let r = q;
    while (r < n) {
      const c = s[r];
      if (c === ' ' || c === '\t' || c === '\n') break;
      if (c.charCodeAt(0) < 32) break;
      if (c === '\\' && r + 1 < n && isAsciiPunct(s[r + 1])) { href += s[r + 1]; r += 2; continue; }
      if (c === '(') depth++;
      else if (c === ')') { if (depth === 0) break; depth--; }
      href += c;
      r++;
    }
    if (depth !== 0) return null;
    hrefEnd = r;
  }
  let title = null;
  let end = hrefEnd;
  const after = skipWsText(s, hrefEnd);
  const tc = s[after];
  if (tc === '"' || tc === "'" || tc === '(') {
    // A title needs whitespace between it and the destination.
    if (after === hrefEnd) return null;
    const tp = parseTitleText(s, after);
    if (!tp) return null;
    title = tp[0];
    end = tp[1];
  }
  const close = skipWsText(s, end);
  if (s[close] !== ')') return null;
  return { href, title, end: close + 1 };
}

// Parse a reference label starting at s[p] === '['. Returns
// {label, end} (end just past ']') or null.
function parseRefLabel(s, p) {
  let label = '';
  let q = p + 1;
  while (q < s.length) {
    const c = s[q];
    if (c === '\\' && q + 1 < s.length && isAsciiPunct(s[q + 1])) { label += '\\' + s[q + 1]; q += 2; continue; }
    if (c === '[') return null;
    if (c === ']') return { label, end: q + 1 };
    label += c;
    q++;
  }
  return null;
}

// The plain text of nodes[a..b) for labels and image alt text.
function plainTextOf(nodes, a, b) {
  let out = '';
  for (let k = a; k < b; k++) {
    const nd = nodes[k];
    if (nd.t === NT_TEXT || nd.t === NT_CODE || nd.t === NT_HTML) out += nd.s;
    else if (nd.t === NT_BR) out += '\n';
    else if (nd.t === NT_IMG) out += nd.alt;
  }
  return out;
}

// Alt text: plain text with emphasis delimiter runs stripped.
function altTextOf(nodes, a, b, delims) {
  const delimNodes = new Set();
  for (const d of delims) delimNodes.add(d.node);
  let out = '';
  for (let k = a; k < b; k++) {
    const nd = nodes[k];
    if (nd.t === NT_TEXT || nd.t === NT_CODE || nd.t === NT_HTML) {
      if (!delimNodes.has(nd)) out += nd.s;
    } else if (nd.t === NT_BR) out += '\n';
    else if (nd.t === NT_IMG) out += nd.alt;
  }
  return out;
}

function parseInline(s, refs) {
  const nodes = [];
  const delims = [];
  const brackets = [];
  // Delimiter-index ranges that a link text spans: an opener and a closer
  // may not pair across one of these ranges.
  const barriers = [];
  let buf = '';
  const n = s.length;
  let i = 0;

  function flush() {
    if (buf !== '') { nodes.push({ t: NT_TEXT, s: buf }); buf = ''; }
  }
  function emitLink(a) {
    flush();
    nodes.push({ t: NT_LINK_O, href: a.href, title: null, auto: 'ext' });
    nodes.push({ t: NT_TEXT, s: s.slice(i, a.end) });
    nodes.push({ t: NT_LINK_C, auto: 'ext' });
  }

  while (i < n) {
    const cc = s.charCodeAt(i);
    // Extended autolinks at word starts.
    if (isAlnumCode(cc) && (i === 0 || isAutolinkBoundary(s[i - 1]))) {
      const a = tryExtendedAutolink(s, i);
      if (a) { emitLink(a); i = a.end; continue; }
    }
    if (cc === 96) { // backtick
      let m = 0;
      while (i + m < n && s[i + m] === '`') m++;
      let j = i + m;
      let found = -1;
      while (j < n) {
        if (s[j] === '`') {
          let kk = 0;
          while (j + kk < n && s[j + kk] === '`') kk++;
          if (kk === m) { found = j; break; }
          j += kk;
        } else j++;
      }
      if (found !== -1) {
        let content = s.slice(i + m, found).replace(/\n/g, ' ');
        if (content.length >= 2 && content[0] === ' ' && content[content.length - 1] === ' ' && /[^ ]/.test(content)) {
          content = content.slice(1, -1);
        }
        flush();
        nodes.push({ t: NT_CODE, s: content });
        i = found + m;
        continue;
      }
      buf += s.slice(i, i + m);
      i += m;
      continue;
    }
    if (cc === 42 || cc === 95 || cc === 126) { // * _ ~
      const ch = s[i];
      let m = 0;
      while (i + m < n && s[i + m] === ch) m++;
      if (ch === '~' && m > 2) { buf += s.slice(i, i + m); i += m; continue; }
      const prev = i > 0 ? s[i - 1] : '';
      const next = i + m < n ? s[i + m] : '';
      const leftFlank = next !== '' && !isUnicodeSpace(next) && (!isUnicodePunct(next) || prev === '' || isUnicodePunct(prev) || isUnicodeSpace(prev));
      const rightFlank = prev !== '' && !isUnicodeSpace(prev) && (!isUnicodePunct(prev) || next === '' || isUnicodePunct(next) || isUnicodeSpace(next));
      let canOpen, canClose;
      if (ch === '_') {
        canOpen = leftFlank && (!rightFlank || isUnicodePunct(prev));
        canClose = rightFlank && (!leftFlank || isUnicodePunct(next));
      } else {
        canOpen = leftFlank;
        canClose = rightFlank;
      }
      flush();
      const node = { t: NT_TEXT, s: s.slice(i, i + m) };
      nodes.push(node);
      delims.push({ cc: ch, node, len: m, canOpen, canClose, active: true });
      i += m;
      continue;
    }
    if (cc === 91) { // [
      flush();
      const node = { t: NT_TEXT, s: '[' };
      nodes.push(node);
      brackets.push({ node, image: false, active: true, pos: i });
      i++;
      continue;
    }
    if (cc === 33) { // !
      if (s[i + 1] === '[') {
        flush();
        const bang = { t: NT_TEXT, s: '!' };
        nodes.push(bang);
        const node = { t: NT_TEXT, s: '[' };
        nodes.push(node);
        brackets.push({ node, bang, image: true, active: true, pos: i + 1 });
        i += 2;
        continue;
      }
      buf += '!';
      i++;
      continue;
    }
    if (cc === 93) { // ]
      flush();
      const closeNode = { t: NT_TEXT, s: ']' };
      nodes.push(closeNode);
      i++;
      // Try to form a link or image.
      let bi = -1;
      for (let k = brackets.length - 1; k >= 0; k--) {
        if (brackets[k].active) { bi = k; break; }
      }
      if (bi !== -1) {
        const br = brackets[bi];
        const openIdx = nodes.indexOf(br.node);
        let closeIdx = nodes.indexOf(closeNode);
        // Label from the raw source slice (backslashes preserved).
        const labelText = s.slice(br.pos + 1, i - 1);
        let href = null;
        let title = null;
        let endPos = i;
        let isImage = br.image;
        // A link's text may not contain another (bracket) link; an
        // autolink inside is absorbed as plain text (images may).
        let hasLink = false;
        if (!br.image) {
          for (let k = openIdx + 1; k < closeIdx; k++) {
            if (nodes[k].t === NT_LINK_O && !nodes[k].auto) { hasLink = true; break; }
          }
        }
        if (!hasLink && s[i] === '(') {
          const suf = parseInlineSuffix(s, i);
          if (suf) { href = suf.href; title = suf.title; endPos = suf.end; }
          else if (labelText !== '') {
            const ref = refs.get(normalizeLabel(labelText));
            if (ref) { href = ref.href; title = ref.title; }
          }
        } else if (!hasLink && labelText !== '') {
          if (s[i] === '[') {
            const lb = parseRefLabel(s, i);
            if (lb) {
              if (lb.label === '') {
                const ref = refs.get(normalizeLabel(labelText));
                if (ref) { href = ref.href; title = ref.title; endPos = lb.end; }
              } else {
                const ref = refs.get(normalizeLabel(lb.label));
                if (ref) { href = ref.href; title = ref.title; endPos = lb.end; }
                // A failed full reference does not fall back to shortcut.
                else href = null;
              }
            } else {
              const ref = refs.get(normalizeLabel(labelText));
              if (ref) { href = ref.href; title = ref.title; }
            }
          } else {
            const ref = refs.get(normalizeLabel(labelText));
            if (ref) { href = ref.href; title = ref.title; }
          }
        }
        if (href !== null) {
          href = cleanLinkText(href);
          if (title !== null) title = cleanLinkText(title);
          // Deactivate brackets inside the link text.
          for (let k = bi + 1; k < brackets.length; k++) brackets[k].active = false;
          brackets[bi].active = false;
          if (isImage) {
            const alt = altTextOf(nodes, openIdx + 1, closeIdx, delims);
            // Remove the children and deactivate their delimiters.
            for (let k = openIdx + 1; k < closeIdx; k++) {
              const nd = nodes[k];
              for (const d of delims) if (d.active && d.node === nd) d.active = false;
            }
            const bangIdx = nodes.indexOf(br.bang);
            nodes.splice(openIdx, closeIdx - openIdx + 1);
            nodes.splice(bangIdx, 1, { t: NT_IMG, src: href, title, alt });
            i = endPos;
          } else {
            // Strip bare-URL autolink wrappers inside the link text:
            // the URL becomes plain text of the outer link. Angle-
            // bracket autolinks are kept as nested links.
            let removed = 0;
            for (let k = closeIdx - 1; k > openIdx; k--) {
              const nd = nodes[k];
              if ((nd.t === NT_LINK_O || nd.t === NT_LINK_C) && nd.auto === 'ext') { nodes.splice(k, 1); removed++; }
            }
            closeIdx -= removed;
            // Record the link-text barrier for emphasis pairing.
            let lo = 1e9, hi = -1;
            const inside = new Set();
            for (let k = openIdx + 1; k < closeIdx; k++) inside.add(nodes[k]);
            for (let d = 0; d < delims.length; d++) {
              if (inside.has(delims[d].node)) { if (d < lo) lo = d; if (d > hi) hi = d; }
            }
            if (lo <= hi) barriers.push([lo, hi]);
            nodes.splice(closeIdx, 1);
            nodes.splice(openIdx, 1);
            nodes.splice(openIdx, 0, { t: NT_LINK_O, href, title });
            nodes.splice(closeIdx, 0, { t: NT_LINK_C });
            i = endPos;
          }
          continue;
        } else {
          // A `]` consumes its matching `[` even when no link forms.
          brackets[bi].active = false;
        }
      }
      continue;
    }
    if (cc === 60) { // <
      // Autolink <scheme:...> or <email>.
      let matched = false;
      const gt = s.indexOf('>', i + 1);
      if (gt !== -1 && gt - i <= 100) {
        const inner = s.slice(i + 1, gt);
        if (/^[A-Za-z][A-Za-z0-9+.-]{1,31}:[^<>\s]*$/.test(inner) || /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(inner)) {
          const isEmail = inner.indexOf(':') === -1;
          flush();
          nodes.push({ t: NT_LINK_O, href: isEmail ? 'mailto:' + inner : inner, title: null, auto: 'angle' });
          nodes.push({ t: NT_TEXT, s: inner });
          nodes.push({ t: NT_LINK_C, auto: 'angle' });
          i = gt + 1;
          matched = true;
        }
      }
      if (matched) continue;
      const he = matchHtmlInline(s, i);
      if (he !== -1) {
        flush();
        nodes.push({ t: NT_HTML, s: s.slice(i, he) });
        i = he;
        continue;
      }
      buf += '<';
      i++;
      continue;
    }
    if (cc === 38) { // &
      const m = matchEntity(s, i);
      if (m) {
        flush();
        nodes.push({ t: NT_TEXT, s: m[0] });
        i = m[1];
        continue;
      }
      buf += '&';
      i++;
      continue;
    }
    if (cc === 92) { // backslash
      const nx = s[i + 1];
      if (nx === '\n') {
        flush();
        nodes.push({ t: NT_BR });
        i += 2;
        // Leading whitespace after a hard break is stripped.
        while (i < n && (s[i] === ' ' || s[i] === '\t')) i++;
        continue;
      }
      if (nx !== undefined && isAsciiPunct(nx)) {
        if (nx === '&') { flush(); nodes.push({ t: NT_TEXT, s: '&' }); i += 2; continue; }
        buf += nx; i += 2; continue;
      }
      buf += '\\';
      i++;
      continue;
    }
    if (cc === 10) { // newline: soft break, or hard break after 2+ spaces
      let sp = 0;
      let k = buf.length - 1;
      while (k >= 0 && buf[k] === ' ') { sp++; k--; }
      if (sp >= 2) {
        buf = buf.slice(0, buf.length - sp);
        flush();
        nodes.push({ t: NT_BR });
        i++;
        // Leading whitespace after a hard break is stripped.
        while (i < n && (s[i] === ' ' || s[i] === '\t')) i++;
        continue;
      }
      buf += '\n';
      i++;
      continue;
    }
    // Ordinary text run.
    let j = i + 1;
    while (j < n) {
      const d = s.charCodeAt(j);
      if (d === 96 || d === 42 || d === 95 || d === 126 || d === 91 || d === 93 || d === 33 || d === 60 || d === 38 || d === 92 || d === 10) break;
      if (isAlnumCode(d) && isAutolinkBoundary(s[j - 1]) && maybeAutolink(s, j)) break;
      j++;
    }
    buf += s.slice(i, j);
    i = j;
  }
  flush();

  // Phase 2: emphasis / strikethrough.
  const openersBottom = { '*': 0, '_': 0, '~': 0 };
  // Formed emphasis spans [openerIdx, closerIdx]: a later closer may not
  // use an opener trapped inside one of these spans.
  const spans = [];
  function insideSpan(oi) {
    for (let q = 0; q < spans.length; q++) {
      if (spans[q][0] < oi && oi < spans[q][1]) return true;
    }
    return false;
  }
  function acrossBarrier(oi, ci) {
    for (let q = 0; q < barriers.length; q++) {
      const b = barriers[q];
      const oiIn = oi >= b[0] && oi <= b[1];
      const ciIn = ci >= b[0] && ci <= b[1];
      if (oiIn !== ciIn) return true;
    }
    return false;
  }
  for (let ci = 0; ci < delims.length; ci++) {
    const closer = delims[ci];
    if (!closer.active || !closer.canClose) continue;
    const cc = closer.cc;
    while (closer.len > 0) {
      let openerIdx = -1;
      let skipped = false;
      for (let oi = ci - 1; oi >= openersBottom[cc]; oi--) {
        const opener = delims[oi];
        if (!opener.active || opener.cc !== cc || !opener.canOpen) continue;
        if (insideSpan(oi) || acrossBarrier(oi, ci)) { skipped = true; continue; }
        if ((opener.canClose || closer.canOpen) && (opener.len + closer.len) % 3 === 0 && !(opener.len % 3 === 0 && closer.len % 3 === 0)) { skipped = true; continue; }
        openerIdx = oi;
        break;
      }
      if (openerIdx === -1) { if (!skipped) openersBottom[cc] = ci; break; }
      const opener = delims[openerIdx];
      const use = opener.len >= 2 && closer.len >= 2 ? 2 : 1;
      const oi2 = nodes.indexOf(opener.node);
      const ci2 = nodes.indexOf(closer.node);
      if (oi2 === -1 || ci2 === -1 || oi2 >= ci2) { openersBottom[cc] = ci; break; }
      // Trim the used delimiters off the runs.
      opener.node.s = opener.node.s.slice(0, opener.node.s.length - use);
      closer.node.s = closer.node.s.slice(use);
      opener.len -= use;
      closer.len -= use;
      const openT = cc === '~' ? NT_DEL_O : use === 2 ? NT_STR_O : NT_EM_O;
      const closeT = cc === '~' ? NT_DEL_C : use === 2 ? NT_STR_C : NT_EM_C;
      nodes.splice(oi2 + 1, 0, { t: openT });
      // The closer shifted by one.
      const ci3 = nodes.indexOf(closer.node);
      nodes.splice(ci3, 0, { t: closeT });
      spans.push([openerIdx, ci]);
      if (opener.len === 0) opener.active = false;
      if (closer.len === 0) { closer.active = false; break; }
    }
  }

  // Render the flat node list.
  let out = '';
  for (const nd of nodes) {
    if (nd.t === NT_TEXT) { if (nd.s !== '') out += escText(nd.s); }
    else if (nd.t === NT_CODE) out += '<code>' + escStrict(nd.s) + '</code>';
    else if (nd.t === NT_HTML) out += nd.s;
    else if (nd.t === NT_BR) out += '<br>';
    else if (nd.t === NT_LINK_O) {
      out += '<a href="' + escText(cleanHref(nd.href)) + '"';
      if (nd.title !== null && nd.title !== undefined) out += ' title="' + escText(nd.title) + '"';
      out += '>';
    }
    else if (nd.t === NT_LINK_C) out += '</a>';
    else if (nd.t === NT_EM_O) out += '<em>';
    else if (nd.t === NT_EM_C) out += '</em>';
    else if (nd.t === NT_STR_O) out += '<strong>';
    else if (nd.t === NT_STR_C) out += '</strong>';
    else if (nd.t === NT_DEL_O) out += '<del>';
    else if (nd.t === NT_DEL_C) out += '</del>';
    else if (nd.t === NT_IMG) {
      out += '<img src="' + escText(cleanHref(nd.src)) + '" alt="' + escText(nd.alt) + '"';
      if (nd.title !== null && nd.title !== undefined) out += ' title="' + escText(nd.title) + '"';
      out += '>';
    }
  }
  return out;
}

// ---- Rendering ----
function renderNodes(nodes, refs, tight) {
  let out = '';
  for (const nd of nodes) {
    if (nd.t === 'para') {
      if (tight) out += parseInline(nd.s, refs);
      else out += '<p>' + parseInline(nd.s, refs) + '</p>\n';
    } else if (nd.t === 'head') {
      out += '<h' + nd.lv + '>' + parseInline(nd.s, refs) + '</h' + nd.lv + '>\n';
    } else if (nd.t === 'code') {
      out += '<pre><code';
      if (nd.lang) out += ' class="language-' + escText(nd.lang) + '"';
      out += '>' + escStrict(nd.s) + '</code></pre>\n';
    } else if (nd.t === 'hr') {
      out += '<hr>\n';
    } else if (nd.t === 'html') {
      out += nd.s;
    } else if (nd.t === 'quote') {
      out += '<blockquote>\n' + renderNodes(nd.c, refs, false) + '</blockquote>\n';
    } else if (nd.t === 'list') {
      out += nd.ordered ? (nd.start !== 1 ? '<ol start="' + nd.start + '">\n' : '<ol>\n') : '<ul>\n';
      for (const it of nd.c) {
        out += '<li>';
        const hasPara = it.c.length > 0 && it.c[0].t === 'para';
        if (it.task !== 0 && hasPara && !nd.tight) {
          // Loose list: the checkbox goes inside the first <p>.
          out += '<p>';
          if (it.task === 1) out += '<input disabled="" type="checkbox">';
          else out += '<input checked="" disabled="" type="checkbox">';
          out += ' ' + parseInline(it.c[0].s, refs) + '</p>\n';
          out += renderNodes(it.c.slice(1), refs, nd.tight);
        } else {
          if (it.task === 1) out += '<input disabled="" type="checkbox">';
          else if (it.task === 2) out += '<input checked="" disabled="" type="checkbox">';
          if (it.task !== 0 && hasPara) out += ' ';
          out += renderNodes(it.c, refs, nd.tight);
        }
        out += '</li>\n';
      }
      out += nd.ordered ? '</ol>\n' : '</ul>\n';
    } else if (nd.t === 'table') {
      out += '<table>\n<thead>\n<tr>\n';
      for (let k = 0; k < nd.head.length; k++) {
        const a = nd.align[k];
        out += '<th' + (a ? ' align="' + a + '"' : '') + '>' + parseInline(nd.head[k].replace(/^[ \t]+/, '').replace(/[ \t]+$/, ''), refs) + '</th>\n';
      }
      out += '</tr>\n</thead>\n';
      if (nd.rows.length > 0) {
        out += '<tbody>';
        for (const row of nd.rows) {
          out += '<tr>\n';
          for (let k = 0; k < nd.head.length; k++) {
            const cell = k < row.length ? row[k] : '';
            const a = nd.align[k];
            out += '<td' + (a ? ' align="' + a + '"' : '') + '>' + parseInline(cell.replace(/^[ \t]+/, '').replace(/[ \t]+$/, ''), refs) + '</td>\n';
          }
          out += '</tr>\n';
        }
        out += '</tbody>';
      }
      out += '</table>\n';
    }
  }
  return out;
}

export function parse(src) {
  if (typeof src !== 'string') src = String(src);
  src = src.replace(/\r\n?/g, '\n').replace(/\0/g, '\uFFFD');
  const pieces = src.split('\n');
  if (pieces.length > 0 && pieces[pieces.length - 1] === '') pieces.pop();
  const lastNl = src.endsWith('\n');
  const lines = pieces.map((s, idx) => ({ s, i: 0, col: 0, rem: 0, base: 0, lz: 0, nl: idx < pieces.length - 1 || lastNl }));
  const refs = new Map();
  const r = parseBlocks(lines, 0, lines.length, refs, true);
  return renderNodes(r[0], refs, false);
}
