// Fast CommonMark + GFM renderer, written from scratch to match marked 18.1.3 output.
// Single-pass block parser (container stack) + inline parser (delimiter stack).
// No imports, no network, no clock, no caching across calls.

const ENT = {
'AElig;':'\u00C6','Aacute;':'\u00C1','Acirc;':'\u00C2','Agrave;':'\u00C0','Alpha;':'\u0391','Aring;':'\u00C5','Atilde;':'\u00C3','Auml;':'\u00C4','Beta;':'\u0392','Ccedil;':'\u00C7','Chi;':'\u03A7','Dagger;':'\u2021','Delta;':'\u0394','ETH;':'\u00D0','Eacute;':'\u00C9','Ecirc;':'\u00CA','Egrave;':'\u00C8','Epsilon;':'\u0395','Eta;':'\u0397','Euml;':'\u00CB','Gamma;':'\u0393','Iacute;':'\u00CD','Icirc;':'\u00CE','Igrave;':'\u00CC','Iota;':'\u0399','Iuml;':'\u00CF','Kappa;':'\u039A','Lambda;':'\u039B','Mu;':'\u039C','Ntilde;':'\u00D1','Nu;':'\u039D','OElig;':'\u0152','Oacute;':'\u00D3','Ocirc;':'\u00D4','Ograve;':'\u00D2','Omega;':'\u03A9','Omicron;':'\u039F','Oslash;':'\u00D8','Otilde;':'\u00D5','Ouml;':'\u00D6','Phi;':'\u03A6','Pi;':'\u03A0','Prime;':'\u2033','Psi;':'\u03A8','Rho;':'\u03A1','Scaron;':'\u0160','Sigma;':'\u03A3','THORN;':'\u00DE','Tau;':'\u03A4','Theta;':'\u0398','Uacute;':'\u00DA','Ucirc;':'\u00DB','Ugrave;':'\u00D9','Upsilon;':'\u03A5','Uuml;':'\u00DC','Xi;':'\u039E','Yacute;':'\u00DD','Yuml;':'\u0178','Zeta;':'\u0396','aacute;':'\u00E1','acirc;':'\u00E2','acute;':'\u00B4','aelig;':'\u00E6','agrave;':'\u00E0','alefsym;':'\u2135','alpha;':'\u03B1','amp;':'&','and;':'\u2227','ang;':'\u2220','apos;':'\'','aring;':'\u00E5','asymp;':'\u2248','atilde;':'\u00E3','auml;':'\u00E4','bdquo;':'\u201E','beta;':'\u03B2','brvbar;':'\u00A6','bull;':'\u2022','cap;':'\u2229','ccedil;':'\u00E7','cedil;':'\u00B8','cent;':'\u00A2','chi;':'\u03C7','circ;':'\u02C6','clubs;':'\u2663','cong;':'\u2245','copy;':'\u00A9','crarr;':'\u21B5','cup;':'\u222A','curren;':'\u00A4','dArr;':'\u21D3','dagger;':'\u2020','darr;':'\u2193','deg;':'\u00B0','delta;':'\u03B4','diams;':'\u2666','divide;':'\u00F7','eacute;':'\u00E9','ecirc;':'\u00EA','egrave;':'\u00E8','empty;':'\u2205','emsp;':'\u2003','ensp;':'\u2002','epsilon;':'\u03B5','equiv;':'\u2261','eta;':'\u03B7','eth;':'\u00F0','euml;':'\u00EB','euro;':'\u20AC','exist;':'\u2203','fnof;':'\u0192','forall;':'\u2200','frac12;':'\u00BD','frac14;':'\u00BC','frac34;':'\u00BE','frasl;':'\u2044','gamma;':'\u03B3','ge;':'\u2265','gt;':'>','hArr;':'\u21D4','harr;':'\u2194','hearts;':'\u2665','hellip;':'\u2026','iacute;':'\u00ED','icirc;':'\u00EE','iexcl;':'\u00A1','igrave;':'\u00EC','image;':'\u2111','infin;':'\u221E','int;':'\u222B','iota;':'\u03B9','iquest;':'\u00BF','isin;':'\u2208','iuml;':'\u00EF','kappa;':'\u03BA','lArr;':'\u21D0','lambda;':'\u03BB','lang;':'\u27E8','laquo;':'\u00AB','larr;':'\u2190','lceil;':'\u2308','ldquo;':'\u201C','le;':'\u2264','lfloor;':'\u230A','lowast;':'\u2217','loz;':'\u25CA','lrm;':'\u200E','lsaquo;':'\u2039','lsquo;':'\u2018','lt;':'<','macr;':'\u00AF','mdash;':'\u2014','micro;':'\u00B5','middot;':'\u00B7','minus;':'\u2212','mu;':'\u03BC','nabla;':'\u2207','nbsp;':'\u00A0','ndash;':'\u2013','ne;':'\u2260','ni;':'\u220B','not;':'\u00AC','notin;':'\u2209','nsub;':'\u2284','ntilde;':'\u00F1','nu;':'\u03BD','oacute;':'\u00F3','ocirc;':'\u00F4','ograve;':'\u00F2','oline;':'\u203E','omega;':'\u03C9','omicron;':'\u03BF','oplus;':'\u2295','or;':'\u2228','ordf;':'\u00AA','ordm;':'\u00BA','oslash;':'\u00F8','otilde;':'\u00F5','otimes;':'\u2297','ouml;':'\u00F6','para;':'\u00B6','part;':'\u2202','permil;':'\u2030','perp;':'\u22A5','phi;':'\u03C6','pi;':'\u03C0','piv;':'\u03D6','plusmn;':'\u00B1','pound;':'\u00A3','prime;':'\u2032','prod;':'\u220F','prop;':'\u221D','psi;':'\u03C8','quot;':'"','rArr;':'\u21D2','radic;':'\u221A','rang;':'\u27E9','raquo;':'\u00BB','rarr;':'\u2192','rceil;':'\u2309','rdquo;':'\u201D','real;':'\u211C','reg;':'\u00AE','rfloor;':'\u230B','rho;':'\u03C1','rlm;':'\u200F','rsaquo;':'\u203A','rsquo;':'\u2019','sbquo;':'\u201A','scaron;':'\u0161','sdot;':'\u22C5','sect;':'\u00A7','shy;':'\u00AD','sigma;':'\u03C3','sigmaf;':'\u03C2','sim;':'\u223C','spades;':'\u2660','sub;':'\u2282','sube;':'\u2286','sum;':'\u2211','sup;':'\u2283','sup1;':'\u00B9','sup2;':'\u00B2','sup3;':'\u00B3','supe;':'\u2287','szlig;':'\u00DF','tau;':'\u03C4','there4;':'\u2234','theta;':'\u03B8','thetasym;':'\u03D1','thinsp;':'\u2009','thorn;':'\u00FE','tilde;':'\u02DC','times;':'\u00D7','trade;':'\u2122','uArr;':'\u21D1','uacute;':'\u00FA','uarr;':'\u2191','ucirc;':'\u00FB','ugrave;':'\u00F9','uml;':'\u00A8','upsih;':'\u03D2','upsilon;':'\u03C5','uuml;':'\u00FC','weierp;':'\u2118','xi;':'\u03BE','yacute;':'\u00FD','yen;':'\u00A5','yuml;':'\u00FF','zeta;':'\u03B6','zwj;':'\u200D','zwnj;':'\u200C',
'Dcaron;':'\u010E','dcaron;':'\u010F','HilbertSpace;':'\u210B','DifferentialD;':'\u2146','ClockwiseContourIntegral;':'\u2232','CounterClockwiseContourIntegral;':'\u2233','ngE;':'\u2267\u0338','Tab;':'\t','NewLine;':'\n','colon;':' :'.slice(1),'sol;':'/','bsol;':'\\','comma;':',','period;':'.','quest;':'?','excl;':'!','lpar;':'(','rpar;':')','lsqb;':'[','rsqb;':']','lcub;':'{','rcub;':'}','verbar;':'|','plus;':'+','minus;':'\u2212','equals;':'=','ast;':'*','num;':'#','dollar;':'$','percnt;':'%','commat;':'@','Hat;':'^','fjlig;':'fj','Abreve;':'\u0102','abreve;':'\u0103','Amacr;':'\u0100','amacr;':'\u0101','Aogon;':'\u0104','aogon;':'\u0105','Cacute;':'\u0106','cacute;':'\u0107','Ccaron;':'\u010C','ccaron;':'\u010D','Ccirc;':'\u0108','ccirc;':'\u0109','Cdot;':'\u010A','cdot;':'\u010B','Dagger;':'\u2021','Dcaron2;':'\u010E','Dstrok;':'\u0110','dstrok;':'\u0111','Edot;':'\u0116','edot;':'\u0117','Emacr;':'\u0112','emacr;':'\u0113','Eogon;':'\u0118','eogon;':'\u0119','Ecaron;':'\u011A','ecaron;':'\u011B','Gbreve;':'\u011E','gbreve;':'\u011F','Gdot;':'\u0120','gdot;':'\u0121','Gcedil;':'\u0122','Hcirc;':'\u0124','hcirc;':'\u0125','Hstrok;':'\u0126','hstrok;':'\u0127','Idot;':'\u0130','Imacr;':'\u012A','imacr;':'\u012B','Iogon;':'\u012E','iogon;':'\u012F','Itil;':'\u0130','itil;':'\u0131','Jcirc;':'\u0134','jcirc;':'\u0135','Lacute;':'\u0139','lacute;':'\u013A','Lcaron;':'\u013D','lcaron;':'\u013E','Lcedil;':'\u013B','lcedil;':'\u013C','Lmidot;':'\u013F','lmidot;':'\u0140','Lstrok;':'\u0141','lstrok;':'\u0142','Nacute;':'\u0143','nacute;':'\u0144','Ncaron;':'\u0147','ncaron;':'\u0148','Ncedil;':'\u0145','ncedil;':'\u0146','Ntilde2;':'\u00D1','Odblac;':'\u0150','odblac;':'\u0151','Omacr;':'\u014C','omacr;':'\u014D','Ogon;':'\u01EA','ogon;':'\u01EB','Racute;':'\u0154','racute;':'\u0155','Rcaron;':'\u0158','rcaron;':'\u0159','Rcedil;':'\u0156','rcedil;':'\u0157','Sacute;':'\u015A','sacute;':'\u015B','Scirc;':'\u015C','scirc;':'\u015D','Scedil;':'\u015E','scedil;':'\u015F','Tcaron;':'\u0164','tcaron;':'\u0165','Tcedil;':'\u0162','tcedil;':'\u0163','Tstrok;':'\u0166','tstrok;':'\u0167','Udblac;':'\u0170','udblac;':'\u0171','Umacr;':'\u016A','umacr;':'\u016B','Uogon;':'\u0172','uogon;':'\u0173','Uring;':'\u016E','uring;':'\u016F','Util;':'\u0168','util;':'\u0169','Ycirc;':'\u0176','ycirc;':'\u0177','Zacute;':'\u0179','zacute;':'\u017A','Zcaron;':'\u017D','zcaron;':'\u017E','Zdot;':'\u017B','zdot;':'\u017C',
'NegativeMediumSpace;':'\u200B','NegativeThickSpace;':'\u200B','NegativeThinSpace;':'\u200B','NegativeVeryThinSpace;':'\u200B','ZeroWidthSpace;':'\u200B','fjlig;':'fj','fllig;':'fll','fflig;':'ff','ffilig;':'ffi','ffllig;':'ffll','ThickSpace;':'\u205F\u200A','GreaterGreater;':'\u2AA2','LessLess;':'\u2AA1','VerticalSeparator;':'\u2758','af;':'\u2061','incare;':'\u2105','gsim;':'\u2273','lsim;':'\u2272','ncong;':'\u2247','nequiv;':'\u2262','nsim;':'\u2241','nvsim;':'\u223C\u20D2','race;':'\u223D\u0331','TripleDot;':'\u20DB','DotDot;':'\u20DC','Hopf;':'\u210D','hopf;':'\u210D','opf;':'\uD835\uDC28','opf2;':'x','Bopf;':'\uD835\uDD39','beth;':'\u2136','daleth;':'\u2138','gimel;':'\u2137','sext;':'\u2736','check;':'\u2713','cross;':'\u2717','female;':'\u2640','male;':'\u2642','phone;':'\u260E','telrec;':'\u2315','target;':'\u2316','sung;':'\u266A','flat;':'\u266D','natur;':'\u266E','sharp;':'\u266F','dollar;':'$','euro2;':'\u20AC','pound2;':'\u00A3','yen2;':'\u00A5','cent2;':'\u00A2','curren2;':'\u00A4'
};

// Block-level HTML tag names (CommonMark HTML block type 6)
const BLOCK_TAGS = new Set(('address article aside base basefont blockquote body caption center col colgroup dd details dialog dir div dl dt fieldset figcaption figure footer form frame frameset h1 h2 h3 h4 h5 h6 head header hr html iframe legend li link main menu menuitem nav noframes ol optgroup option p param search section summary table tbody td tfoot th thead title tr track ul').split(' '));
// HTML block type 1 tags
const HTML1 = new Set(['script','pre','style','textarea']);

// --- char helpers ---
function isSpace(ch){ return ch===' '||ch==='\t'; }
function isPunct(ch){
  const c = ch.charCodeAt(0);
  return (c>=33&&c<=47)||(c>=58&&c<=64)||(c>=91&&c<=96)||(c>=123&&c<=126);
}
function isAlnum(ch){
  const c = ch.charCodeAt(0);
  return (c>=48&&c<=57)||(c>=65&&c<=90)||(c>=97&&c<=122)||c>127;
}
function isDigit(ch){ return ch>='0'&&ch<='9'; }
// Unicode whitespace / punctuation for emphasis flanking only. CommonMark
// flanking uses Unicode categories: NBSP (U+00A0) is whitespace, and
// currency symbols (U+00A3, U+20AC) count as punctuation for marked.
// Backslash escapes keep the ASCII-only isPunct above.
const RE_UWS=/\s/u;
const RE_LETNUM=/[\p{L}\p{N}]/u;
function isUWSpace(ch){ return RE_UWS.test(ch); }
function isPunctFlank(ch){ return !RE_UWS.test(ch) && !RE_LETNUM.test(ch); }
// columns of leading whitespace; returns [cols, index]
// base = absolute column of s[0] (tab width depends on absolute column)
function indentOf(s, base){
  let col=base||0, i=0;
  while(i<s.length){
    const ch=s[i];
    if(ch===' '){ col++; i++; }
    else if(ch==='\t'){ col += 4-(col%4); i++; }
    else break;
  }
  return [col-(base||0),i];
}
// remove n columns from the start of s (a tab straddling the boundary becomes spaces)
function stripCols(s, n, base, expandTab, tabCol){
  let col=base||0, i=0;
  const target=col+n;
  while(i<s.length && col<target){
    const ch=s[i];
    if(ch===' '){ col++; i++; }
    else if(ch==='\t'){
      const w=4-(col%4);
      if(col+w<=target){ col+=w; i++; }
      else return ' '.repeat(col+w-target)+s.slice(i+1);
    } else break;
  }
  // fenced code only (expandTab): a tab that remains at the start of the
  // content expands to spaces from its absolute column, when that column
  // is above 0. A tab at column 0 stays literal (toml fence); a tab at
  // col 13 expands to 3 spaces, at col 8 to 4 spaces. Indented code keeps
  // the tab literal (expandTab is false there). Inside a blockquote the
  // tab always expands to 2 spaces (doc-05 `> > \t...` -> 2 spaces, not
  // 4): the quote content is treated as starting at col 2 however deep
  // the nesting (t93/t95). Pass tabCol=2 for quote fences.
  if(expandTab && i<s.length && s[i]==='\t' && col>0){
    const ec=(tabCol===undefined)?col:tabCol;
    const w=4-(ec%4);
    return ' '.repeat(w)+s.slice(i+1);
  }
  return s.slice(i);
}
// Expand leading tabs of a paragraph line to spaces, from the absolute
// column of the line start (doc-40: `> \tindented...` -> tab at col 2
// becomes 2 spaces). Only the leading whitespace run is expanded.
function expandLeadTab(s, col){
  let i=0, c=col||0, out='';
  while(i<s.length && (s[i]===' '||s[i]==='\t')){
    if(s[i]===' '){ out+=' '; c++; i++; }
    else { const w=4-(c%4); out+=' '.repeat(w); c+=w; i++; }
  }
  return out+s.slice(i);
}

// blank line? (only spaces/tabs)
function isBlank(s){
  for(let i=0;i<s.length;i++){ const c=s[i]; if(c!==' '&&c!=='\t') return false; }
  return true;
}
// index of first non space/tab, -1 if none; also its column (relative to s[0])
function firstNonSpace(s, base){
  let col=base||0, i=0;
  while(i<s.length){
    const ch=s[i];
    if(ch===' '){ col++; i++; }
    else if(ch==='\t'){ col+=4-(col%4); i++; }
    else return [i,col-(base||0)];
  }
  return [-1,col-(base||0)];
}

// escape text, entity-aware for '&' (marked behavior):
// '&name;' decodes when known, stays literal when unknown-but-entity-shaped,
// '&#...;' decodes when a valid code point, else '&' is escaped.
function decodeEntityAt(s, i){
  // s[i]==='&'; returns [replacement-or-null, endIndex] ; null => not entity-shaped
  if(s[i+1]==='#'){
    let j=i+2, hex=false;
    if(s[j]==='x'||s[j]==='X'){ hex=true; j++; }
    const start=j;
    while(j<s.length){
      const c=s.charCodeAt(j);
      if(hex ? ((c>=48&&c<=57)||(c>=97&&c<=102)||(c>=65&&c<=70)) : (c>=48&&c<=57)) j++;
      else break;
    }
    if(j===start || j>=s.length || s[j]!==';') return [null, i];
    const v=parseInt(s.slice(start,j), hex?16:10);
    if(!(v>=0) || v>0x10FFFF) return [null, i];
    if(v===0) return ['\uFFFD', j+1];
    if(v>=0xD800&&v<=0xDFFF) return ['\uFFFD', j+1];
    return [String.fromCodePoint(v), j+1];
  }
  let j=i+1;
  const c0=s.charCodeAt(j);
  if(!((c0>=65&&c0<=90)||(c0>=97&&c0<=122))) return [null, i];
  j++;
  while(j<s.length){
    const c=s.charCodeAt(j);
    if((c>=48&&c<=57)||(c>=65&&c<=90)||(c>=97&&c<=122)) j++;
    else break;
  }
  if(j>=s.length || s[j]!==';') return [null, i];
  // named entity: passed through verbatim (marked does not decode named entities)
  return [s.slice(i, j+1), j+1];
}
// escape plain text for HTML output
function escText(s){
  let out='', last=0;
  for(let i=0;i<s.length;i++){
    const ch=s[i];
    if(ch==='&'){
      const r=decodeEntityAt(s,i);
      if(r[0]!==null){
        let v=r[0];
        // a decoded numeric char must be re-escaped if it is special;
        // a named-entity slice (length>1) is passed through verbatim
        if(v.length===1){
          if(v==='&') v='&amp;'; else if(v==='<') v='&lt;'; else if(v==='>') v='&gt;'; else if(v==='"') v='&quot;'; else if(v==="'") v='&#39;';
        }
        out+=s.slice(last,i)+v;
        i=r[1]-1; last=r[1];
        continue;
      }
      out+=s.slice(last,i)+'&amp;'; last=i+1;
    } else if(ch==='<'){ out+=s.slice(last,i)+'&lt;'; last=i+1; }
    else if(ch==='>'){ out+=s.slice(last,i)+'&gt;'; last=i+1; }
    else if(ch==='"'){ out+=s.slice(last,i)+'&quot;'; last=i+1; }
    else if(ch==="'"){ out+=s.slice(last,i)+'&#39;'; last=i+1; }
  }
  return out+s.slice(last);
}
// escape for code content: & < > " ' all escaped, no entity decoding
function escCode(s){
  let out='', last=0;
  for(let i=0;i<s.length;i++){
    const ch=s[i];
    if(ch==='&'){ out+=s.slice(last,i)+'&amp;'; last=i+1; }
    else if(ch==='<'){ out+=s.slice(last,i)+'&lt;'; last=i+1; }
    else if(ch==='>'){ out+=s.slice(last,i)+'&gt;'; last=i+1; }
    else if(ch==='"'){ out+=s.slice(last,i)+'&quot;'; last=i+1; }
    else if(ch==="'"){ out+=s.slice(last,i)+'&#39;'; last=i+1; }
  }
  return out+s.slice(last);
}
// escape href/title attribute: entity-shaped '&' left alone, other '&' -> &amp;, '"' -> &quot;, '<' -> &lt;, '>' -> &gt;, "'" -> &#39;
function escAttr(s){
  let out='', last=0;
  for(let i=0;i<s.length;i++){
    const ch=s[i];
    if(ch==='&'){
      const r=decodeEntityAt(s,i);
      if(r[0]!==null){
        // keep the entity-shaped sequence verbatim (do not decode, do not escape)
        out+=s.slice(last,i)+s.slice(i,r[1]);
        i=r[1]-1; last=r[1];
        continue;
      }
      out+=s.slice(last,i)+'&amp;'; last=i+1;
    } else if(ch==='<'){ out+=s.slice(last,i)+'&lt;'; last=i+1; }
    else if(ch==='>'){ out+=s.slice(last,i)+'&gt;'; last=i+1; }
    else if(ch==='"'){ out+=s.slice(last,i)+'&quot;'; last=i+1; }
    else if(ch==="'"){ out+=s.slice(last,i)+'&#39;'; last=i+1; }
  }
  return out+s.slice(last);
}
// marked cleanUrl: encodeURI, then %25 -> %
function cleanUrl(href){
  try { return encodeURI(href).replace(/%25/g,'%'); } catch(e){ return null; }
}
// decode entities inside a link title (CommonMark: titles are parsed inline-ish)
function decodeEntities(s){
  // only numeric entities are decoded; named entities pass through verbatim
  if(s.indexOf('&')<0) return s;
  let out='', last=0;
  for(let i=0;i<s.length;i++){
    if(s[i]==='&' && s[i+1]==='#'){
      const r=decodeEntityAt(s,i);
      if(r[0]!==null){ out+=s.slice(last,i)+r[0]; i=r[1]-1; last=r[1]; }
    }
  }
  return out+s.slice(last);
}
// decode backslash escapes before ASCII punctuation (fence info strings, etc.)
function decEsc(s){
  if(s.indexOf('\\')<0) return s;
  let out='', i=0;
  while(i<s.length){
    if(s[i]==='\\' && i+1<s.length && isPunct(s[i+1])){ out+=s[i+1]; i+=2; }
    else { out+=s[i]; i++; }
  }
  return out;
}

// ============================ BLOCK PARSER ============================

function mkNode(t){ const n={t, children:[]}; return n; }

// split a table row line into cells (handles \| and code spans)
function splitRow(line){
  const cells=[]; let cur='', i=0, n=line.length;
  // A multi-backtick opener (run>=2) that finds no matching closer
  // poisons the next backtick run in this row: it is literal text, not
  // a new code span opener (doc-18: `` ``add` `` stays literal, so the
  // `|` after it still separates cells). Cleared at a `|` separator.
  let poisoned=false;
  while(i<n){
    const ch=line[i];
    // A backslash escape only consumes the next char when it is ASCII
    // punctuation (doc-31: `\a` in a cell stays `\a`); otherwise the
    // backslash is literal text.
    if(ch==='\\' && i+1<n && isPunct(line[i+1])){ cur+=line[i+1]; i+=2; continue; }
    if(ch==='`'){
      let j=i; while(j<n && line[j]==='`') j++;
      const run=j-i;
      // A backtick run poisoned by a failed multi-backtick opener is
      // literal text, not a code span opener (doc-18).
      if(poisoned){ poisoned=false; cur+=line.slice(i,j); i=j; continue; }
      // find closing run of same length
      let k=j, found=-1;
      while(k<n){
        if(line[k]==='`'){
          let m=k; while(m<n && line[m]==='`') m++;
          if(m-k===run){ found=k; break; }
          k=m;
        } else k++;
      }
      if(found>=0){
        // a `\|` inside a code span is still an escaped pipe at row level:
        // the escape is consumed and the pipe is literal cell content
        cur+=line.slice(i, found+run).replace(/\\\|/g, '|');
        i=found+run;
      }
      else { if(run>=2) poisoned=true; cur+=line.slice(i,j); i=j; }
      continue;
    }
    if(ch==='|'){ poisoned=false; cells.push(cur); cur=''; i++; continue; }
    cur+=ch; i++;
  }
  cells.push(cur);
  // drop empty first/last cell from leading/trailing pipe
  if(cells.length>0 && cells[0].trim()==='' && line.trimStart().startsWith('|')) cells.shift();
  if(cells.length>0 && cells[cells.length-1].trim()==='' && line.trimEnd().endsWith('|')) cells.pop();
  return cells.map(c=>c.trim());
}
function isDelimCell(c){
  c=c.trim();
  if(c.length<1) return false;
  let a=0, b=c.length;
  if(c[0]===':') a=1;
  if(c[c.length-1]===':') b=c.length-1;
  if(b-a<1) return false;
  for(let i=a;i<b;i++) if(c[i]!=='-') return false;
  return true;
}
function delimAlign(c){
  c=c.trim();
  const l=c[0]===':', r=c[c.length-1]===':';
  if(l&&r) return 'center';
  if(l) return 'left';
  if(r) return 'right';
  return null;
}

// parse a link reference definition starting at lines[0..], returns {label,dest,title,linesUsed} or null
// input: array of raw paragraph lines (strings), start index
function parseRefDef(lines, start){
  // join lines from start with \n for scanning (a title may span lines)
  let text='';
  for(let l=start;l<lines.length;l++){ if(l>start) text+='\n'; text+=lines[l]; }
  let i=0;
  // skip up to 3 leading spaces
  let sp=0; while(i<text.length && text[i]===' ' && sp<3){ i++; sp++; }
  if(text[i]!=='[') return null;
  // label: [ ... ] ; an unescaped '[' inside makes the definition
  // invalid (cm-547/548); a backslash is kept in the label (cm-545)
  let j=i+1, label='';
  while(j<text.length){
    const ch=text[j];
    if(ch==='\\' && j+1<text.length && isPunct(text[j+1])){ label+='\\'+text[j+1]; j+=2; continue; }
    if(ch==='[') return null;
    if(ch===']') break;
    label+=ch; j++;
  }
  if(j>=text.length) return null;
  const rawLabel=label;
  const normLabel=normalizeLabel(rawLabel);
  if(normLabel.length===0 || normLabel.length>999) return null;
  j++; // past ]
  if(text[j]!==':') return null;
  j++;
  // skip spaces/tabs/newlines
  while(j<text.length && (text[j]===' '||text[j]==='\t'||text[j]==='\n')) j++;
  // destination
  let dest='';
  if(text[j]==='<'){
    let k=j+1, ok=false;
    while(k<text.length){
      const ch=text[k];
      if(ch==='\n'){ break; }
      if(ch==='\\' && k+1<text.length && isPunct(text[k+1])){ const e=text[k+1]; dest+= e==='&' ? '&amp;' : e; k+=2; continue; }
      if(ch==='>'){ ok=true; break; }
      if(ch==='<'){ break; }
      dest+=ch; k++;
    }
    if(!ok) return null;
    j=k+1;
  } else {
    let k=j, paren=0;
    while(k<text.length){
      const ch=text[k];
      if(ch===' '||ch==='\t'||ch==='\n') break;
      if(ch==='\\' && k+1<text.length && isPunct(text[k+1])){ const e=text[k+1]; dest+= e==='&' ? '&amp;' : e; k+=2; continue; }
      if(ch==='('){ paren++; dest+=ch; k++; continue; }
      if(ch===')'){
        if(paren===0) break;
        paren--; dest+=ch; k++; continue;
      }
      // control chars not allowed
      if(ch.charCodeAt(0)<32) break;
      dest+=ch; k++;
    }
    if(dest.length===0) return null;
    j=k;
  }
  // count newlines up to the end of the destination (its line)
  let destNL=0;
  for(let p=0;p<j;p++) if(text[p]==='\n') destNL++;
  // skip spaces/tabs/newlines before an optional title
  let saveJ=j;
  while(j<text.length && (text[j]===' '||text[j]==='\t'||text[j]==='\n')) j++;
  let title=null;
  // a title needs whitespace between it and the destination
  if(j>saveJ && j<text.length && (text[j]==='"' || text[j]==="'" || text[j]==='(')){
    let titleNL=0;
    for(let p=0;p<j;p++) if(text[p]==='\n') titleNL++;
    const q=text[j];
    let close=')';
    if(q==='"') close='"';
    else if(q==="'") close="'";
    let k=j+1, t='';
    let ok=false;
    while(k<text.length){
      const ch=text[k];
      if(ch==='\\' && k+1<text.length && isPunct(text[k+1])){ const e=text[k+1]; t+= e==='&' ? '&amp;' : e; k+=2; continue; }
      if(ch===close){ ok=true; break; }
      t+=ch; k++;
    }
    let titleOk=ok;
    let afterJ=k+1;
    if(titleOk){
      // after title: only spaces/tabs then EOL/EOF
      let m=afterJ;
      while(m<text.length && (text[m]===' '||text[m]==='\t')) m++;
      if(m<text.length && text[m]!=='\n') titleOk=false;
      else afterJ=m;
    }
    if(titleOk){
      title=t;
      j=afterJ;
    } else if(titleNL>destNL){
      // title on a later line is malformed: the definition still stands
      // without a title, and the title line is not consumed
      return {label: normLabel, dest, title:null, linesUsed: destNL+1};
    } else {
      return null;
    }
  } else {
    j=saveJ;
    // no title: after dest, only spaces/tabs then EOL
    let m=j;
    while(m<text.length && (text[m]===' '||text[m]==='\t')) m++;
    if(m<text.length && text[m]!=='\n') return null;
    j=m;
  }
  // lines used: count newlines consumed up to j (j is at \n or end)
  let nl=0;
  for(let p=0;p<j;p++) if(text[p]==='\n') nl++;
  return {label: normLabel, dest, title, linesUsed: nl+1};
}

// extract leading link reference definitions from a paragraph's lines.
// returns remaining lines (array) ; fills refs map (first definition wins)
function extractRefDefs(lines, refs){
  let idx=0;
  while(idx<lines.length){
    const d=parseRefDef(lines, idx);
    if(!d) break;
    if(!refs.has(d.label)) refs.set(d.label, {dest:d.dest, title:d.title});
    idx+=d.linesUsed;
  }
  return lines.slice(idx);
}

// --- block start detectors (s = remaining line string, col = absolute col of s[0]) ---
function atxHeading(s, base){
  const [idx, relCol]=firstNonSpace(s, base);
  if(idx<0 || relCol>3) return null;
  let i=idx, n=0;
  while(i<s.length && s[i]==='#') { i++; n++; }
  if(n===0 || n>6) return null;
  if(i<s.length && s[i]!==' ' && s[i]!=='\t') return null;
  return {level:n, start:i};
}
function fenceStart(s, base){
  const [idx, relCol]=firstNonSpace(s, base);
  if(idx<0 || relCol>3) return null;
  const ch=s[idx];
  if(ch!=='`' && ch!=='~') return null;
  let i=idx, n=0;
  while(i<s.length && s[i]===ch){ i++; n++; }
  if(n<3) return null;
  return {ch, len:n, indent:relCol, infoStart:i};
}
function thematicBreak(s, base){
  const [idx, relCol]=firstNonSpace(s, base);
  if(idx<0 || relCol>3) return null;
  const ch=s[idx];
  if(ch!=='*' && ch!=='-' && ch!=='_') return null;
  let count=0;
  for(let i=idx;i<s.length;i++){
    const c=s[i];
    if(c===ch) count++;
    else if(c===' '||c==='\t') continue;
    else return false;
  }
  return count>=3;
}
function setextLine(s, base){
  const [idx, relCol]=firstNonSpace(s, base);
  if(idx<0 || relCol>3) return null;
  const ch=s[idx];
  if(ch!=='=' && ch!=='-') return null;
  // the whole line (modulo leading/trailing whitespace) must be one marker run
  let end=s.length;
  while(end>idx && (s[end-1]===' '||s[end-1]==='\t')) end--;
  for(let i=idx;i<end;i++){ if(s[i]!==ch) return null; }
  return ch==='='?1:2;
}
// list marker at start of s (indent<=3). Returns {bullet|ordered, marker, startNum, delim, markerLen, contentCol, empty} or null
function listMarker(s, col){
  const [idx, relCol]=firstNonSpace(s, col);
  if(idx<0 || relCol>3) return null;
  const ch=s[idx];
  let markerLen=0, ordered=false, startNum=0, delim='';
  if(ch==='-'||ch==='+'||ch==='*'){
    markerLen=1;
  } else if(isDigit(ch)){
    let i=idx;
    while(i<s.length && isDigit(s[i])) i++;
    if(i-idx>9) return null;
    if(i>=s.length || (s[i]!=='.' && s[i]!==')')) return null;
    ordered=true; startNum=parseInt(s.slice(idx,i),10); delim=s[i]; markerLen=i-idx+1;
  } else return null;
  const after=idx+markerLen;
  if(after>=s.length) return {ordered, startNum, delim, marker:ch, markerLen, contentCol: col+relCol+markerLen+1, empty:true, spaces:1, afterIdx:after, afterCol: col+relCol+markerLen};
  const nc=s[after];
  if(nc!==' ' && nc!=='\t') return null;
  // count spaces/tabs as columns after marker
  let sp=0, i=after;
  while(i<s.length && (s[i]===' '||s[i]==='\t')){
    if(s[i]===' ') sp+=1; else sp+=4-((col+relCol+markerLen+sp)%4);
    i++;
    if(sp>=5) break;
  }
  let contentCol;
  if(i>=s.length) contentCol=col+relCol+markerLen+1; // empty item (only spaces)
  else if(sp>=5) contentCol=col+relCol+markerLen+1;
  else contentCol=col+relCol+markerLen+sp;
  return {ordered, startNum, delim, marker:ch, markerLen, contentCol, empty: i>=s.length, spaces:sp, contentStart:i, afterIdx:after, afterCol: col+relCol+markerLen};
}
// html block start: returns {kind, endTag} or null. kind 1-5 endTag is the end marker string; 6/7 end at blank.
function htmlBlockStart(s, paraOpen, base){
  const [idx, relCol]=firstNonSpace(s, base);
  if(idx<0 || relCol>3) return null;
  const t=s.slice(idx);
  if(t[0]!=='<') return null;
  const low=t.toLowerCase();
  // type 2 comment
  if(low.startsWith('<!--')) return {kind:2, end:'-->'};
  // type 3 processing instruction
  if(low.startsWith('<?')) return {kind:3, end:'?>'};
  // type 4 declaration <!letter
  if(low.startsWith('<!') && low.length>2 && low[2]>='a' && low[2]<='z' || low.startsWith('<!') && low.length>2 && low[2]>='A' && low[2]<='Z') return {kind:4, end:'>'};
  // type 5 CDATA
  if(low.startsWith('<![cdata[')) return {kind:5, end:']]>'};
  // type 1: script/pre/style/textarea (open tag only)
  const m1=/^<(script|pre|style|textarea)(?:[\s>]|$)/i.exec(t);
  if(m1){
    const name=m1[1].toLowerCase();
    return {kind:1, end:'</'+name+'>'};
  }
  // type 6: block tag
  const m6=/^<\/?([a-zA-Z][a-zA-Z0-9-]*)(\s|\/?>|$)/.exec(t);
  if(m6 && BLOCK_TAGS.has(m6[1].toLowerCase())){
    // must be followed by space, >, /> or EOL
    return {kind:6, end:null};
  }
  // type 7: any other complete tag, only whitespace after, cannot interrupt paragraph
  if(paraOpen) return null;
  // the tag must be a valid tag (parseInlineTag), not just a tag-shaped
  // prefix: `<a h*#ref="hi">` is not a tag (cm-619)
  const te=parseInlineTag(t, 0);
  if(te>0){
    const name=/^<\/?([a-zA-Z][a-zA-Z0-9-]*)/.exec(t)[1].toLowerCase();
    if(name==='script'||name==='pre'||name==='style'||name==='textarea') return null;
    if(/^[ \t]*$/.test(t.slice(te))) return {kind:7, end:null};
  }
  return null;
}

// Extended-autolink suppression: an unclosed inline `<a ...>` opening
// tag disables extended (www./email) autolinks for the rest of the
// document (marked quirk, doc-03: `<a href="foo\bar">` in a paragraph
// poisons every later bare email/www. in the doc; a `</a>` clears it,
// and explicit `<...>` autolinks are unaffected). Reset per parse() call.
let extAutolinkOff=false;

// ============================ MAIN BLOCK LOOP ============================

function parseBlocks(lines, hasNL){
  const doc=mkNode('doc');
  const refs=new Map();
  const stack=[doc];
  let leaf=null, leafParent=null;
  let pending=null; // {s, col, from} : item content line to reprocess inside the new item
  const N=lines.length;

  function closeLeaf(){
    if(!leaf) return;
    if(leaf.t==='para'){
      const rest=extractRefDefs(leaf.lines, refs);
      if(rest.length===0){
        const ch=leafParent.children;
        const ix=ch.indexOf(leaf);
        if(ix>=0) ch.splice(ix,1);
      } else leaf.text=rest.join('\n');
    } else if(leaf.t==='code'){
      while(leaf.lines.length>0){
        const last=leaf.lines[leaf.lines.length-1];
        const t=last.endsWith('\n')?last.slice(0,-1):last;
        if(t.trim()==='') leaf.lines.pop(); else break;
      }
      leaf.text=leaf.lines.join('');
    } else if(leaf.t==='fence'){
      // drop exactly one trailing truly-empty line before the closing
      // fence (cm-318: b + 2 blanks -> b\n\n; doc-15: tab + 1 blank -> tab\n)
      const fl=leaf.lines;
      if(fl.length && (fl[fl.length-1]==='\n' || fl[fl.length-1]==='')) fl.pop();
      // a fence whose content lines are all truly empty renders empty
      // code (a line with even one space still counts as content — cm-129)
      let allEmpty=true;
      for(const ln of fl){ if(ln!=='\n' && ln!==''){ allEmpty=false; break; } }
      leaf.text=allEmpty?'':fl.join('');
    } else if(leaf.t==='html'){
      leaf.text=leaf.lines.join('\n')+(leaf.trailNL?'\n':'');
    }
    leaf=null; leafParent=null;
  }
  function closeTo(depth){
    // close leaf if it lives at or below stack[depth]
    while(stack.length>depth){
      const c=stack.pop();
      if(leaf && leafParent===c) closeLeaf();
      c.open=false;
    }
    if(leaf && stack.indexOf(leafParent)<0) closeLeaf();
  }
  function addBlock(node){
    let parent=stack[stack.length-1];
    if(parent.t==='list'){
      // a list may only contain items; close it before adding another block
      const popped=stack.pop();
      popped.open=false;
      if(leaf && leafParent===popped) closeLeaf();
      parent=stack[stack.length-1];
    }
    // looseness: a new block in an item after a blank line makes its list loose
    if(parent.t==='item' && parent.children.length>0){
      const list=stack[stack.length-2];
      if(list && list.t==='list' && list.blankPending){ list.loose=true; }
    }
    parent.children.push(node);
    // a block added consumes any pending blank line: the blank line
    // separated blocks in the item that got this block, not in any other
    // list (cm-319: a blank inside the inner item must not loosen the
    // outer list when the next item is created)
    for(let k=1;k<stack.length;k++){ if(stack[k].t==='list') stack[k].blankPending=false; }
    return node;
  }
  function markLooseIfBlankPending(list, item){
    if(!list || !list.blankPending) return;
    if(item && item.children.length>0) list.loose=true;
    list.blankPending=false;
  }

  let i=0;
  while(i<N){
    let raw, rawCol, startDepth, isPending=false;
    if(pending){ raw=pending.s; rawCol=pending.col; startDepth=pending.from; pending=null; isPending=true; }
    else { raw=lines[i]; rawCol=0; startDepth=1; }
    const rawBlank=isBlank(raw);
    // ---- Phase 1: match open containers ----
    let s=raw, col=rawCol, depth=startDepth, failedAt=-1, lazy=false, blankQuote=false;
    // depth = number of stack entries matched (stack[0]=doc always matched)
    while(depth<stack.length){
      const c=stack[depth];
      if(c.t==='list'){ depth++; continue; }
      if(c.t==='quote'){
        // a line is blank if it is blank raw, or if nothing is left after the
    // container prefixes (e.g. `> `); a line like `>  ` leaves a space, which
    // is paragraph/fence content, not a blank line
    if(rawBlank || s.length===0){ blankQuote=true; depth++; continue; }
        const [idx, relCol]=firstNonSpace(s, col);
        if(relCol<=3 && idx>=0 && s[idx]==='>'){
          s=s.slice(idx+1);
          col+=relCol+1;
          s=stripCols(s,1,col); col+=1;
          depth++; continue;
        }
        failedAt=depth; break;
      }
      if(c.t==='item'){
        if(isBlank(s)){ depth++; continue; }
        const [idx, relCol]=firstNonSpace(s, col);
        // item content indent is relative to the container content start
        // (absolute columns are not comparable across lines with different
        // container prefixes, e.g. nested blockquotes)
        if(relCol>=c.contentCol){
          s=stripCols(s, c.contentCol, col);
          col+=c.contentCol;
          depth++; continue;
        }
        failedAt=depth; break;
      }
      depth++;
    }
    if(failedAt>=0){
      // A fenced code block absorbs lines even when they are less
      // indented than its container (doc-06/22: a `must src/index.ts`
      // line at col 0 inside a fence opened at col 3 of a list item
      // is fence content, not a new top-level block) — but ONLY when
      // the failed container is a list item. A fence inside a
      // blockquote does NOT absorb a line without `>` (cm-237: `foo`
      // after `> ``` is a top-level paragraph, the quote fence is
      // empty). The line must not be a closing fence for this fence,
      // and the fence must already hold content (doc-13: a first line
      // at col 0 does not get absorbed; the fence stays empty).
      if(leaf && leaf.t==='fence' && !rawBlank && stack[failedAt] && stack[failedAt].t==='item' && leaf.lines.length>0){
        const [fidx, frel]=firstNonSpace(s, col);
        let isClose=false;
        if(fidx>=0 && frel<=3 && s[fidx]===leaf.fenceCh){
          let j=fidx, n=0;
          while(j<s.length && s[j]===leaf.fenceCh){ j++; n++; }
          if(n>=leaf.fenceLen){
            let k=j; while(k<s.length && (s[k]===' '||s[k]==='\t')) k++;
            if(k>=s.length) isClose=true;
          }
        }
        if(!isClose){
          const inCont=stack.some(e=>e.t==='quote'||e.t==='list'||e.t==='item');
          leaf.lines.push(stripCols(s, leaf.fenceIndent, col, inCont, (stack.filter(e=>e.t==='quote').length>=2 && !stack.some(e=>e.t==='list'||e.t==='item'))?2:undefined)+(hasNL[i]?'\n':''));
          i++; continue;
        }
      }
      // lazy continuation? leaf must be a paragraph, line must not start a list item
      const paraOpen = leaf && leaf.t==='para';
      let handled=false;
      if(paraOpen && !rawBlank){
        // lazy continuation only if the line does not start a block that
        // interrupts a paragraph (hr, ATX, fence, html, or any list marker:
        // a marker line outside the paragraph's container always starts a
        // new list, closing the container)
        const lm=listMarker(s, col);
        let interrupts=false;
        if(lm) interrupts=true;
        if(!interrupts && thematicBreak(s, col)) interrupts=true;
        if(!interrupts && atxHeading(s, col)) interrupts=true;
        if(!interrupts && fenceStart(s, col)) interrupts=true;
        if(!interrupts && htmlBlockStart(s, true, col)) interrupts=true;
        if(!interrupts){
          // a lazy line is re-indented to the paragraph level: leading
          // spaces are stripped, but a leading tab becomes a single space
          // (doc-25: \tfn main() -> " fn main()"; cm-238: " - bar" -> "- bar").
          // If the raw line's leading whitespace contains a tab, the
          // leading space in s came from a partial-tab expansion by a
          // container prefix (list item content col) and must be kept
          // (doc-25 inside a list item: tab expands to 4, item takes 3,
          // 1 space is left over).
          // If a container prefix was consumed (col > rawCol), the leading
          // spaces in s are the remainder after that prefix and are kept
          // (doc-38: `>  Renderer...` keeps its 1 space after `> `);
          // only leading spaces of the raw line itself are stripped.
          const mLead=s.match(/^[ \t]+/);
          let ls;
          if(col>rawCol) ls=s;
          else if(!mLead) ls=s;
          else if(mLead[0].indexOf('\t')>=0) ls=' '+s.slice(mLead[0].length);
          else if(/^[ \t]*\t/.test(raw)) ls=s;
          else ls=s.slice(mLead[0].length);
          const se=setextLine(s, col);
          if(se){
            // a setext underline cannot be a lazy continuation: it stays
            // paragraph text (marked indents such a line by 4 spaces)
            leaf.lines.push('    '+expandLeadTab(ls, col));
            handled=true;
          } else {
            // lazy continuation: append line to paragraph as-is (after matched prefixes)
            leaf.lines.push(expandLeadTab(ls, col));
            handled=true;
          }
        }
      }
      if(handled){ i++; continue; }
      closeTo(failedAt);
      // recompute s/col by consuming the surviving containers' prefixes from raw
      s=raw; col=rawCol;
      let d2=startDepth;
      while(d2<stack.length){
        const c=stack[d2];
        if(c.t==='list'){ d2++; continue; }
        if(c.t==='quote'){
          const [idx, relCol]=firstNonSpace(s, col);
          s=s.slice(idx+1); col+=relCol+1;
          s=stripCols(s,1,col); col+=1;
          d2++; continue;
        }
        if(c.t==='item'){
          s=stripCols(s, c.contentCol, col); col+=c.contentCol;
          d2++; continue;
        }
        d2++;
      }
    }
    // ---- blank line ----
    // a line is blank if it is blank raw, if nothing is left after the
    // container prefixes (e.g. `> `), or if only whitespace is left after
    // the prefixes (e.g. `>  ` leaves ` `, which is content for an open
    // paragraph/code leaf but does not start a new block)
    if(rawBlank || s.length===0 || isBlank(s)){
      // a whitespace-only line after container prefixes continues an open
      // paragraph (it is the ` ` left by `>  `)
      if(leaf && leaf.t==='para' && !rawBlank && s.length>0){
        leaf.lines.push(s);
        i++; continue;
      }
      // blank inside fenced/indented code or html 1-5 is content
      // (but not when the blank line is outside a quote the leaf lives in)
      if(leaf && leaf.t==='fence' && !blankQuote){
        const inCont=stack.some(e=>e.t==='quote'||e.t==='list'||e.t==='item');
        leaf.lines.push(stripCols(s, leaf.fenceIndent, col, inCont, (stack.filter(e=>e.t==='quote').length>=2 && !stack.some(e=>e.t==='list'||e.t==='item'))?2:undefined)+(hasNL[i]?'\n':''));
        i++; continue;
      }
      if(leaf && leaf.t==='code' && !blankQuote){
        leaf.lines.push(stripCols(s,4,col)+(hasNL[i]?'\n':''));
        i++; continue;
      }
      if(leaf && leaf.t==='html' && leaf.kind<=5){
        leaf.lines.push(s);
        i++; continue;
      }
      if(leaf && leaf.t==='table' && s.indexOf('\t')>=0){
        // tab-only line inside a table is an empty row
        leaf.rows.push(splitRow(s).length? splitRow(s) : []);
        // pad/truncate to header count at render
        i++; continue;
      }
      // otherwise blank closes leaves; mark looseness
      // a blank line makes every open list loose (the next block added to
      // any of them is separated by a blank line), unless the blank line
      // is inside a blockquote nested in a list item (then it only affects
      // the quote's content)
      let nestedQuote=false;
      let innermostItem=-1;
      for(let k=stack.length-1;k>=1;k--){ if(stack[k].t==='item'){ innermostItem=k; break; } }
      if(innermostItem>=0){
        for(let k=innermostItem+1;k<stack.length;k++){ if(stack[k].t==='quote'){ nestedQuote=true; break; } }
      }
      if(!nestedQuote){
        for(let k=1;k<stack.length;k++){ if(stack[k].t==='list' && stack[k].children.length>0) stack[k].blankPending=true; }
      }
      // a blank line closes an empty list item
      if(stack.length>1 && stack[stack.length-1].t==='item' && stack[stack.length-1].children.length===0){
        stack.pop();
      }
      closeLeaf();
      // a truly blank line ends any open blockquote (a new `>` line starts
      // a new one); lists and items survive a blank line. A pending line
      // (item/quote content reprocessed on the same physical line) is not
      // a blank line and must not close the quote.
      if(rawBlank && !isPending){
        let qi=-1;
        for(let k=1;k<stack.length;k++){ if(stack[k].t==='quote'){ qi=k; break; } }
        if(qi>=0) closeTo(qi);
      }
      i++; continue;
    }
    // ---- open leaf is code/fence/html/table: consume line ----
    if(leaf && leaf.t==='fence'){
      const [idx, relCol]=firstNonSpace(s, col);
      if(relCol<=3 && idx>=0){
        let j=idx, n=0;
        while(j<s.length && s[j]===leaf.fenceCh){ j++; n++; }
        if(n>=leaf.fenceLen){
          const rest=s.slice(j);
          // a closing fence line has only whitespace after the markers
          if(rest.trim()===''){ closeLeaf(); i++; continue; }
          /* else: not a closing fence, it is content */
        }
      }
      const inCont=stack.some(e=>e.t==='quote'||e.t==='list'||e.t==='item');
      leaf.lines.push(stripCols(s, leaf.fenceIndent, col, inCont, (stack.filter(e=>e.t==='quote').length>=2 && !stack.some(e=>e.t==='list'||e.t==='item'))?2:undefined)+(hasNL[i]?'\n':''));
      i++; continue;
    }
    if(leaf && leaf.t==='code'){
      const [idx, relCol]=firstNonSpace(s, col);
      if(relCol>=4){
        leaf.lines.push(stripCols(s,4,col)+(hasNL[i]?'\n':''));
        i++; continue;
      }
      closeLeaf();
      // fall through to phase 2 with s unchanged
    }
    if(leaf && leaf.t==='html'){
      if(leaf.kind<=5){
        leaf.lines.push(s);
        if(leaf.end && s.toLowerCase().indexOf(leaf.end)>=0){
          // an end-tag close keeps the newline unless the next line is
          // truly empty (a tab-only line does not suppress it — doc-15)
          leaf.trailNL=hasNL[i] && !(i+1<N && lines[i+1].length===0);
          closeLeaf();
        }
        i++; continue;
      }
      leaf.lines.push(s);
      i++; continue;
    }
    if(leaf && leaf.t==='table'){
      // row line? must not start a block
      const [idx, relCol]=firstNonSpace(s, col);
      let isBlockStart=false;
      if(idx>=0 && relCol<=3){
        const c0=s[idx];
        if(c0==='>') isBlockStart=true;
        else if(atxHeading(s, col)) isBlockStart=true;
        else if(fenceStart(s, col)) isBlockStart=true;
        else if(htmlBlockStart(s, false, col)) isBlockStart=true;
        else if(thematicBreak(s, col)) isBlockStart=true;
        else if(listMarker(s,col)) isBlockStart=true;
      }
      if(!isBlockStart){
        leaf.rows.push(splitRow(s));
        i++; continue;
      }
      closeLeaf();
      // fall through to phase 2
    }
    // ---- Phase 2: new block starts ----
    let paraOpen = leaf && leaf.t==='para';
    // setext heading
    if(paraOpen){
      const se=setextLine(s, col);
      if(se){
        const rest=extractRefDefs(leaf.lines, refs);
        if(rest.length>0){
          const parNode=leaf, parParent=leafParent;
          closeLeaf();
          const h=mkNode('heading'); h.level=se; h.text=rest.join('\n').trim();
          const ch=parParent.children; ch[ch.indexOf(parNode)]=h;
          i++; continue;
        } else {
          // paragraph was all ref defs: remove it, reprocess line as fresh block
          closeLeaf();
          paraOpen=false;
          // fall through to block starts below (line is '---' -> hr, or '===' -> para)
        }
      }
    }
    // blockquote start (reprocess the line inside the quote)
    {
      const [qidx, qrel]=firstNonSpace(s, col);
      if(qidx>=0 && qrel<=3 && s[qidx]==='>'){
        if(paraOpen) closeLeaf();
        const q=mkNode('quote');
        addBlock(q);
        stack.push(q);
        // content after '>' + one optional space/tab column, reprocessed inside the quote
        let ns=s.slice(qidx+1);
        let ncol=col+qrel+1;
        ns=stripCols(ns,1,ncol); ncol+=1;
        pending={s:ns, col:ncol, from:stack.length};
        continue;
      }
    }
    // ATX heading
    const atx=atxHeading(s, col);
    if(atx){
      if(paraOpen) closeLeaf();
      let content=s.slice(atx.start);
      // strip trailing closing sequence: spaces + #'s + spaces
      content=content.replace(/[ \t]+#+[ \t]*$/,'');
      content=content.replace(/^[ \t]+/,'').replace(/[ \t]+$/,'');
      const h=mkNode('heading'); h.level=atx.level; h.text=content;
      addBlock(h);
      i++; continue;
    }
    // fenced code
    const fn=fenceStart(s, col);
    if(fn){
      let info=s.slice(fn.infoStart).trim();
      // backtick fence: info must not contain backtick
      if(!(fn.ch==='`' && info.indexOf('`')>=0)){
        if(paraOpen) closeLeaf();
        const f=mkNode('fence');
        f.fenceCh=fn.ch; f.fenceLen=fn.len;
        // A fence inside a blockquote does not have its indent stripped
        // from content lines when it is a TILDE fence (doc-29: a
        // 2-space indented ~~~ fence in a quote keeps the 2 spaces in
        // its content). A BACKTICK fence in a quote strips its indent
        // as usual (doc-15: `>  ```markdown` with 1-space content
        // indent renders with no leading space).
        let inQuote=false;
        for(let qi=1; qi<stack.length; qi++) if(stack[qi].t==='quote'){ inQuote=true; break; }
        f.fenceIndent=(inQuote && fn.ch==='~')?0:fn.indent;
        f.info=decEsc(info.split(/[ \t]+/)[0]||'');
        f.lines=[];
        addBlock(f);
        leaf=f; leafParent=stack[stack.length-1];
        i++; continue;
      }
      // else: not a fence: paragraph continuation (fall through)
    }
    // HTML block types 1-6 (7 only when no paragraph)
    const hb=htmlBlockStart(s, paraOpen, col);
    if(hb){
      if(paraOpen) closeLeaf();
      const h=mkNode('html'); h.kind=hb.kind; h.end=hb.end||null; h.lines=[s]; h.trailNL=false;
      addBlock(h);
      leaf=h; leafParent=stack[stack.length-1];
      if(hb.kind<=5 && hb.end && s.toLowerCase().indexOf(hb.end)>=0){
        // an end-tag close keeps the newline unless the next line is
        // truly empty (a tab-only line does not suppress it — doc-15)
        h.trailNL=hasNL[i] && !(i+1<N && lines[i+1].length===0);
        closeLeaf();
      }
      i++; continue;
    }
    // thematic break
    if(thematicBreak(s, col)){
      if(paraOpen) closeLeaf();
      addBlock(mkNode('hr'));
      i++; continue;
    }
    // table delimiter (paragraph with exactly one line; delimiter indent <= 3)
    if(leaf && leaf.t==='para' && leaf.lines.length===1){
      const [didx, drel]=firstNonSpace(s, col);
      const cells=splitRow(s);
      const headerCells=splitRow(leaf.lines[0]);
      if(didx>=0 && drel<=3 && cells.length===headerCells.length && cells.length>0 && cells.every(isDelimCell)){
        // the paragraph's single line IS the table header: replace the
        // paragraph node with the table instead of adding a second block
        const parNode=leaf, parParent=leafParent;
        closeLeaf();
        const t=mkNode('table');
        t.header=headerCells;
        t.aligns=cells.map(delimAlign);
        t.rows=[];
        const ch=parParent.children;
        ch[ch.indexOf(parNode)]=t;
        leaf=t; leafParent=parParent;
        i++; continue;
      }
    }
    // list item
    const lm=listMarker(s, col);
    if(lm){
      // interruption rules
      if(paraOpen){
        // an ordered list may interrupt a paragraph only when it starts
        // with 1 — except when the paragraph lives inside a list item,
        // where marked lets any start number interrupt (doc-01 505791.,
        // doc-11 63480., doc-23 0.)
        let inItem=false;
        for(let k=1;k<stack.length;k++){ if(stack[k].t==='item'){ inItem=true; break; } }
        const canInterrupt = lm.empty ? false : (!lm.ordered || lm.startNum===1 || inItem);
        if(!canInterrupt){
          leaf.lines.push(s);
          i++; continue;
        }
        closeLeaf();
      }
      // same list or new list?
      const parent=stack[stack.length-1];
      let list=null;
      if(parent.t==='list'){
        const sameType = lm.ordered ? (parent.ordered && parent.delim===lm.delim) : (!parent.ordered && parent.marker===lm.marker);
        if(sameType) list=parent;
      }
      if(!list){
        list=mkNode('list');
        list.ordered=lm.ordered; list.delim=lm.delim||''; list.marker=lm.marker||'';
        list.start=lm.ordered?lm.startNum:0;
        list.loose=false; list.blankPending=false;
        addBlock(list);
        stack.push(list);
      }
      // looseness: blank pending between items; a new item consumes it
      if(list.blankPending && list.children.length>0) list.loose=true;
      for(let k=1;k<stack.length;k++){ if(stack[k].t==='list') stack[k].blankPending=false; }
      const item=mkNode('item');
      // content indent relative to the container content start on this line
      item.contentCol=lm.contentCol-col;
      list.children.push(item);
      stack.push(item);
      // item content on the same line: reprocess it as a block inside the item
      // (it may be a paragraph, indented code, heading, ... depending on its indent)
      if(!lm.empty){
        const content=stripCols(s.slice(lm.afterIdx), lm.contentCol-lm.afterCol, lm.afterCol);
        pending={s:content, col:lm.contentCol, from:stack.length};
        continue;
      } else {
        leaf=null; leafParent=null;
      }
      i++; continue;
    }
    // indented code (only when no paragraph open)
    if(!paraOpen){
      const [idx, relCol]=firstNonSpace(s, col);
      if(idx>=0 && relCol>=4){
        const c=mkNode('code'); c.lines=[stripCols(s,4,col)+(hasNL[i]?'\n':'')];
        addBlock(c);
        leaf=c; leafParent=stack[stack.length-1];
        i++; continue;
      }
    }
    // paragraph (new or continuation)
    if(paraOpen){
      leaf.lines.push(expandLeadTab(s, col));
    } else {
      const p=mkNode('para'); p.lines=[expandLeadTab(s, col)];
      addBlock(p);
      leaf=p; leafParent=stack[stack.length-1];
    }
    i++;
  }
  // an html block ending at EOF keeps its final line's newline
  if(leaf && leaf.t==='html') leaf.trailNL = N>0 ? hasNL[N-1] : false;
  closeLeaf();
  return {doc, refs};
}

// ============================ INLINE PARSER ============================

// plain text of nodes (for link labels / alt), entities decoded
function plainTextNodes(nodes){
  let out='';
  for(const nd of nodes){
    if(nd.t==='text') out+=decodeEntities(nd.s);
    else if(nd.t==='code') out+=nd.s;
    else if(nd.t==='br') out+='\n';
    else if(nd.t==='delim') out+=nd.ch.repeat(nd.n);
    else if(nd.t==='html') out+='';
    else if(nd.t==='em'||nd.t==='strong'||nd.t==='del'||nd.t==='link') out+=plainTextNodes(nd.children);
    else if(nd.t==='img') out+=nd.alt||'';
  }
  return out;
}
function stripTags(html){
  let out='', i=0;
  while(i<html.length){
    if(html[i]==='<'){
      const j=html.indexOf('>', i);
      if(j<0){ out+=html.slice(i); break; }
      i=j+1;
    } else { out+=html[i]; i++; }
  }
  return out;
}

// is `ch` a valid preceding char for an extended autolink (start, whitespace, punctuation)
function autolinkPrevOk(ch){
  if(ch===undefined) return true;
  if(ch===' '||ch==='\t'||ch==='\n') return true;
  return isPunct(ch);
}
// scan a domain starting at i (labels separated by dots). Returns {end, labels} or null.
// Labels are greedy [A-Za-z0-9-]+; a label ending with '-' invalidates the whole domain.
// A trailing '.' is not part of the domain (the last label's end is returned).
function scanDomain(s, i){
  const n=s.length;
  let labels=0, j=i, lastEnd=i;
  while(j<n){
    const start=j;
    while(j<n){
      const c=s.charCodeAt(j);
      if((c>=48&&c<=57)||(c>=65&&c<=90)||(c>=97&&c<=122)||c===45) j++;
      else break;
    }
    if(j===start) break; // empty label
    if(s[j-1]==='-') return null; // label ends with '-'
    labels++;
    lastEnd=j;
    if(j<n && s[j]==='.') { j++; continue; }
    break;
  }
  if(labels<2) return null; // need at least one dot
  return {end:lastEnd, labels};
}
// scan an email local part ending at '@' (position i is '@'). Returns start index or -1.
function scanEmailLocal(s, i){
  // walk back over local-part chars
  let j=i-1;
  while(j>=0){
    const c=s[j];
    if((c>='a'&&c<='z')||(c>='A'&&c<='Z')||(c>='0'&&c<='9')||'.!#$%&\'*+/=?^_`{|}~-'.indexOf(c)>=0) j--;
    else break;
  }
  const runStart=j+1;
  // try start positions: first valid local part (no leading '.', no '..', no trailing '.')
  for(let s0=runStart; s0<i; s0++){
    if(s[s0]==='.') continue;
    const local=s.slice(s0,i);
    if(local.indexOf('..')>=0) continue;
    if(local.endsWith('.')) continue;
    if(local.length===0) continue;
    // a local part of only punctuation (e.g. `+` in `<foo\+@...>`) is not
    // an email address (cm-606)
    if(!/[A-Za-z0-9]/.test(local)) continue;
    return s0;
  }
  return -1;
}
// trim the end of an extended autolink URL: entity suffix, trailing punct, unbalanced ')'
function trimAutolinkEnd(s, start, end){
  // drop trailing entity-like &...; , trailing punctuation, and
  // unbalanced trailing ')'. Loop until stable: dropping a ')' can
  // expose trailing punctuation (doc-10: nova).) ; doc-23: lumen....)
  let e=end;
  for(;;){
    const before=e;
    const m=/&(?:[A-Za-z][A-Za-z0-9]*|#\d+|#[xX][0-9a-fA-F]+);$/.exec(s.slice(start, e));
    if(m) e-=m[0].length;
    while(e>start && '? ! . , : ; * _ ~ \' "'.indexOf(s[e-1])>=0) e--;
    // Drop a trailing ')' only when it has no matching '(' before it.
    // A ')' in the MIDDLE of the URL that lacks a match is kept (it is
    // not trailing); only trailing unmatched ')'s are dropped (doc-37:
    // `https://www.example.com)%5D(http://...)` keeps both ')'s — the
    // first is unmatched but mid-URL, the last pairs with the '(').
    while(e>start && s[e-1]===')'){
      let bal=0;
      for(let k=start;k<e-1;k++){
        if(s[k]==='(') bal++;
        else if(s[k]===')' && bal>0) bal--;
      }
      if(bal>0) break;
      e--;
    }
    if(e===before) break;
  }
  return e;
}
// try to parse an extended autolink starting at `start` (www. or scheme). Returns {end, href, text} or null.
function parseExtAutolink(s, start, bracketState){
  // bracketState: 0 = no open bracket, 1 = only deactivated brackets,
  // 2 = an active bracket is open. It decides how `]` is treated in the
  // URL path: with an active bracket the URL stops BEFORE `]` (doc-12,
  // the outer link forms); with only deactivated brackets the `]` is
  // included but the URL stops right after it (doc-08: the `[tool ...]`
  // bracket is dead because it already holds a link, so `](...)` is not
  // a link but the `]` still ends the URL); with no bracket the `]` is
  // ordinary URL text and the scan continues (doc-37).
  const n=s.length;
  // www. form
  if(s.slice(start, start+4).toLowerCase()==='www.'){
    if(!autolinkPrevOk(s[start-1])) return null;
    const d=scanDomain(s, start);
    if(!d) return null;
    let end=d.end;
    // optional :port
    if(end<n && s[end]===':'){
      let q=end+1;
      while(q<n && s[q]>='0' && s[q]<='9') q++;
      if(q>end+1) end=q;
    }
    // path, query or fragment (a `?`/`#` directly after the domain is
    // part of the URL too — doc-03/04/09/13/14/16/21/24/26; a `\` after
    // the domain is also part of the URL — doc-40: www.flux.com\); a `.`
    // after the domain starts a path scan too (trailing dots are dropped
    // by trimAutolinkEnd — doc-23; dots before a `\` are kept — doc-40)
    if(end<n && (s[end]==='/'||s[end]==='?'||s[end]==='#'||s[end]==='\\'||s[end]==='.'||s[end]===')')){
      let p=end;
      while(p<n){
        const c=s[p];
        if(c===' '||c==='\t'||c==='\n'||c==='<'||c==='>'||c==='[') break;
        if(c===']'){
          if(bracketState===2) break;
          p++;
          if(bracketState===1){
            // doc-08 vs doc-22: the `](...)` after a dead bracket ends
            // the URL only when it is a dest+title (a space before the
            // closing `)`, e.g. `(https://... (Most))`); a plain URL in
            // the parens (no space) stays part of the autolink.
            if(s[p]==='('){
              let r=p+1, hasSpace=false;
              while(r<n && s[r]!==')'){ if(s[r]===' '||s[r]==='\t'){ hasSpace=true; break; } r++; }
              if(hasSpace) break;
            } else break;
          }
          continue;
        }
        p++;
      }
      end=p;
    }
    end=trimAutolinkEnd(s, start, end);
    if(end<=start+4) return null;
    const text=s.slice(start, end);
    return {end, href:'http://'+text, text};
  }
  // scheme form: scheme must start at `start`
  const sm=/^[A-Za-z][A-Za-z0-9+.-]{1,31}:/.exec(s.slice(start));
  if(sm){
    if(!autolinkPrevOk(s[start-1])) return null;
    const scheme=sm[0].slice(0,-1);
    let p=start+sm[0].length;
    if(s.slice(p, p+2)==='//'){
      const d=scanDomain(s, p+2);
      if(!d) return null;
      let end=d.end;
      // optional :port
      if(end<n && s[end]===':'){
        let q=end+1;
        while(q<n && s[q]>='0' && s[q]<='9') q++;
        if(q>end+1) end=q;
      }
      // path, query or fragment (a `?`/`#` directly after the domain is
      // part of the URL too — doc-03/04/09/13/14/16/21/24/26; a `\` after
      // the domain is also part of the URL — doc-40; a `.` after the
      // domain starts a path scan too, trailing dots dropped by trim)
      if(end<n && (s[end]==='/'||s[end]==='?'||s[end]==='#'||s[end]==='\\'||s[end]==='.'||s[end]===')')){
        let q=end;
        while(q<n){
          const c=s[q];
          if(c===' '||c==='\t'||c==='\n'||c==='<'||c==='>'||c==='[') break;
          if(c===']'){
            if(bracketState===2) break;
            q++;
            if(bracketState===1){
              // doc-08 vs doc-22: the `](...)` after a dead bracket ends
              // the URL only when it is a dest+title (a space before the
              // closing `)`, e.g. `(https://... (Most))`); a plain URL in
              // the parens (no space) stays part of the autolink.
              if(s[q]==='('){
                let r=q+1, hasSpace=false;
                while(r<n && s[r]!==')'){ if(s[r]===' '||s[r]==='\t'){ hasSpace=true; break; } r++; }
                if(hasSpace) break;
              } else break;
            }
            continue;
          }
          q++;
        }
        end=q;
      }
      end=trimAutolinkEnd(s, start, end);
      if(end<=p+2) return null;
      const text=s.slice(start, end);
      return {end, href:text, text};
    }
    // scheme:email form
    const at=s.indexOf('@', p);
    if(at>0){
      const ls=scanEmailLocal(s, at);
      if(ls===p){
        const d=scanDomain(s, at+1);
        if(d){
          // a `_` or `-` right after the domain means the address is part
          // of a larger word: no autolink (gfm-633)
          if(d.end<n && (s[d.end]==='_'||s[d.end]==='-')) return null;
          let end=d.end;
          // optional single path segment (only if non-empty)
          if(end<n && s[end]==='/'){
            let q=end+1;
            while(q<n){
              const c=s[q];
              if(c===' '||c==='\t'||c==='\n'||c==='<'||c==='>'||c==='/') break;
              q++;
            }
            if(q>end+1) end=q;
          }
          end=trimAutolinkEnd(s, start, end);
          const text=s.slice(start, end);
          return {end, href:text, text};
        }
      }
    }
    return null;
  }
  return null;
}
// parse an inline HTML tag at position i (s[i]==='<'). Returns end index (exclusive) or -1.
function parseInlineTag(s, i){
  const n=s.length;
  // `<!-->` and `<!--->` are complete comments on their own (cm-626)
  if(s.slice(i, i+5)==='<!-->') return i+5;
  if(s.slice(i, i+6)==='<!--->') return i+6;
  if(s.slice(i, i+4)==='<!--'){
    const e=s.indexOf('-->', i+4);
    if(e<0) return -1;
    const inner=s.slice(i+4, e);
    // the text may contain `--` (cm-625); it must not end with `-`
    if(inner.endsWith('-')) return -1;
    return e+3;
  }
  if(s.slice(i, i+2)==='<?'){
    const e=s.indexOf('?>', i+2);
    if(e<0) return -1;
    return e+2;
  }
  if(s.slice(i, i+9).toLowerCase()==='<![cdata['){
    const e=s.indexOf(']]>', i+9);
    if(e<0) return -1;
    return e+3;
  }
  if(s.slice(i, i+2)==='<!'){
    const c=s[i+2];
    if(c && ((c>='a'&&c<='z')||(c>='A'&&c<='Z'))){
      const e=s.indexOf('>', i+2);
      if(e<0) return -1;
      return e+1;
    }
    return -1;
  }
  // open/close tag; a closing tag takes no attributes (cm-624:
  // `</a href="foo">` is literal text)
  let j=i+1;
  const isClose=s[j]==='/';
  if(isClose) j++;
  const nameStart=j;
  if(j>=n || !((s[j]>='a'&&s[j]<='z')||(s[j]>='A'&&s[j]<='Z'))) return -1;
  j++;
  while(j<n && ((s[j]>='a'&&s[j]<='z')||(s[j]>='A'&&s[j]<='Z')||(s[j]>='0'&&s[j]<='9')||s[j]==='-')) j++;
  if(isClose){
    while(j<n && (s[j]===' '||s[j]==='\t'||s[j]==='\n')) j++;
    if(j<n && s[j]==='>') return j+1;
    return -1;
  }
  // attributes (each must be preceded by whitespace; `<m:abc>` is not a
  // tag because `:` follows the tag name with no space, cm-609)
  while(true){
    let hadSpace=false;
    while(j<n && (s[j]===' '||s[j]==='\t'||s[j]==='\n')){ j++; hadSpace=true; }
    if(j>=n) return -1;
    if(s[j]==='>') return j+1;
    if(s[j]==='/' && s[j+1]==='>') return j+2;
    if(!hadSpace) return -1;
    // attribute name: must start with a letter, '_' or ':', then letters,
    // digits, '_', '.', ':' or '-'. Marked rejects ')' and '\\' here, so
    // `<b)c>` and `<foo\>` are literal text, not tags (cm-493/494).
    const aStart=j;
    const ac=s[j];
    if(!(ac && ((ac>='a'&&ac<='z')||(ac>='A'&&ac<='Z')||ac==='_'||ac===':'))) return -1;
    j++;
    while(j<n && ((s[j]>='a'&&s[j]<='z')||(s[j]>='A'&&s[j]<='Z')||(s[j]>='0'&&s[j]<='9')||s[j]==='_'||s[j]==='.'||s[j]===':'||s[j]==='-')) j++;
    if(j===aStart) return -1;
    // optional whitespace + '=' + value; if there is no '=', the
    // attribute is valueless and the whitespace belongs to the next
    // attribute (it must not be consumed here, or the next attribute
    // looks unseparated and the tag is wrongly rejected, cm-616)
    let k=j;
    while(k<n && (s[k]===' '||s[k]==='\t'||s[k]==='\n')) k++;
    if(s[k]==='='){
      j=k+1;
      while(j<n && (s[j]===' '||s[j]==='\t'||s[j]==='\n')) j++;
      if(j>=n) return -1;
      if(s[j]==='"'){
        j++;
        while(j<n && s[j]!=='"') j++;
        if(j>=n) return -1;
        j++;
      } else if(s[j]==="'"){
        j++;
        while(j<n && s[j]!=="'") j++;
        if(j>=n) return -1;
        j++;
      } else {
        const vStart=j;
        while(j<n && s[j]!==' '&&s[j]!=='\t'&&s[j]!=='\n'&&s[j]!=='>'&&s[j]!=='"'&&s[j]!=="'"&&s[j]!=='='&&s[j]!=='<'&&s[j]!=='`') j++;
        if(j===vStart) return -1;
        // an unquoted value may not contain " ' = < or backtick (cm-620)
        if(j<n && (s[j]==='"'||s[j]==="'"||s[j]==='='||s[j]==='<'||s[j]==='`')) return -1;
      }
    }
  }
}
// parse an inline link destination+title starting at i (s[i]==='('). Returns {dest, title, end} or null.
function parseInlineDest(s, i){
  const n=s.length;
  let j=i+1;
  while(j<n && (s[j]===' '||s[j]==='\t'||s[j]==='\n')) j++;
  if(j>=n) return null;
  let dest='';
  if(s[j]==='<'){
    j++;
    let ok=false;
    while(j<n){
      const ch=s[j];
      if(ch==='\n') return null;
      if(ch==='\\' && j+1<n && isPunct(s[j+1])){ const e=s[j+1]; dest+= e==='&' ? '&amp;' : e; j+=2; continue; }
      if(ch==='>'){ ok=true; j++; break; }
      if(ch==='<') return null;
      dest+=ch; j++;
    }
    if(!ok) return null;
  } else {
    let paren=0, got=false;
    while(j<n){
      const ch=s[j];
      if(ch===' '||ch==='\t'||ch==='\n') break;
      if(ch==='\\' && j+1<n && isPunct(s[j+1])){ const e=s[j+1]; dest+= e==='&' ? '&amp;' : e; j+=2; got=true; continue; }
      if(ch==='('){ paren++; dest+=ch; j++; got=true; continue; }
      if(ch===')'){
        if(paren===0) break;
        paren--; dest+=ch; j++; got=true; continue;
      }
      if(ch.charCodeAt(0)<32) return null;
      dest+=ch; j++; got=true;
    }
    // an empty destination is valid: `[link]()` -> <a href=""> (cm-485)
    // (unterminated input is still rejected by the ')' check below)
  }
  while(j<n && (s[j]===' '||s[j]==='\t'||s[j]==='\n')) j++;
  let title=null;
  if(j<n && (s[j]==='"' || s[j]==="'" || s[j]==='(')){
    const q=s[j];
    let close=')';
    if(q==='"') close='"';
    else if(q==="'") close="'";
    j++;
    let t='', ok=false;
    while(j<n){
      const ch=s[j];
      if(ch==='\\' && j+1<n && isPunct(s[j+1])){ const e=s[j+1]; t+= e==='&' ? '&amp;' : e; j+=2; continue; }
      if(ch===close){ ok=true; j++; break; }
      t+=ch; j++;
    }
    if(!ok) return null;
    title=t;
    while(j<n && (s[j]===' '||s[j]==='\t'||s[j]==='\n')) j++;
  }
  if(j>=n || s[j]!==')') return null;
  return {dest, title, end:j+1};
}
// parse a reference label starting at i (s[i]==='['). Returns {label, end} or null.
function parseRefLabel(s, i){
  const n=s.length;
  let j=i+1, raw='';
  while(j<n){
    const ch=s[j];
    // keep the backslash in the label: it is matched in its raw
    // (normalized) form, so `foo\!` does not match `foo!` (cm-545)
    if(ch==='\\' && j+1<n && isPunct(s[j+1])){ raw+='\\'+s[j+1]; j+=2; continue; }
    // an unescaped '[' inside a label makes it invalid (cm-547/548)
    if(ch==='[') return null;
    if(ch===']') return {label: normalizeLabel(raw), end: j+1};
    if(ch==='\n') raw+='\n';
    else raw+=ch;
    j++;
  }
  return null;
}
function normalizeLabel(raw){
  // Unicode case fold: toLowerCase alone leaves ß as ß, but the spec
  // folds ß/ẞ to ss (cm-540: [ẞ] matches [SS]: /url); same for the
  // Latin ligatures.
  return raw.replace(/\s+/g,' ').trim().toLowerCase()
    .replace(/ß/g,'ss').replace(/ﬀ/g,'ff').replace(/ﬁ/g,'fi').replace(/ﬂ/g,'fl')
    .replace(/ﬃ/g,'ffi').replace(/ﬄ/g,'ffl').replace(/ﬅ/g,'st').replace(/ﬆ/g,'st');
}

// ============================ INLINE SCANNER ============================

function processEmphasis(nodes){
  for(const nd of nodes){
    if((nd.t==='link'||nd.t==='em'||nd.t==='strong'||nd.t==='del') && nd.children) processEmphasis(nd.children);
  }
  let ds=[];
  for(const nd of nodes) if(nd.t==='delim') ds.push(nd);
  // Two passes: phase 0 matches only same-type pairs (strong with strong,
  // single em with single em) so a `**` run pairs with the matching `**`
  // instead of stealing the outer single `*` (cm-411/412/415/429);
  // phase 1 falls back to the greedy match for the leftovers.
  for(let phase=0; phase<2; phase++){
  let ci=0;
  while(ci<ds.length){
    const closer=ds[ci];
    if(!closer.canClose){ ci++; continue; }
    // Find the opener. Phase 0: a delimiter that can both open and close
    // only pairs with a same-type opener (else it is deferred, so the
    // inner pair forms first, cm-411/429); a close-only closer pairs with
    // the nearest opener, preferring a same-length one when it is a
    // single `*` (cm-412), but a `***` closer takes the nearest opener
    // so the inner em forms before the strong (cm-430/431/415).
    // Phase 1: greedy nearest opener for the leftovers.
    let opener=null;
    const rule3=(o)=>{
      if(!(o.canOpen && o.canClose && closer.canOpen && closer.canClose)) return false;
      const sum3=(o.n+closer.n)%3===0;
      const bothMult3=(o.n%3===0 && closer.n%3===0);
      return sum3 && !bothMult3;
    };
    const scan=(pred)=>{
      for(let oi=ci-1; oi>=0; oi--){
        const o=ds[oi];
        if(o.ch!==closer.ch || !o.canOpen) continue;
        if(pred && !pred(o)) continue;
        if(rule3(o)) continue;
        return o;
      }
      return null;
    };
    if(phase===0){
      if(closer.canOpen){
        opener=scan((o)=> closer.n>=2 ? o.n>=2 : o.n===1);
      } else if(closer.n===1){
        opener=scan((o)=> o.n===1) || scan(null);
      } else {
        opener=scan(null);
      }
    } else {
      opener=scan(null);
    }
    if(!opener){ ci++; continue; }
    const use=(opener.n>=2 && closer.n>=2)?2:1;
    const oi2=nodes.indexOf(opener), ci2=nodes.indexOf(closer);
    const children=nodes.slice(oi2+1, ci2);
    // A single `*` closer must not steal one `*` from a `**` opener when
    // a later `**` closer can pair with that opener to form the strong
    // (doc-01: `**public as *so*other* option html**` — the trailing `*`
    // stays literal and the outer `**` forms a strong). The closer stays
    // literal so no later phase pairs it either.
    if(use===1 && opener.ch==='*' && opener.n===2 && closer.n===1 && !closer.canOpen){
      const ciD=ds.indexOf(closer);
      let laterStrong=false;
      for(let k=ciD+1;k<ds.length;k++){ const d=ds[k]; if(d.ch==='*' && d.n>=2 && d.canClose){ laterStrong=true; break; } }
      if(laterStrong){
        closer.t='text'; closer.s=closer.ch.repeat(closer.n);
        ds.splice(ciD, 1);
        ci=0; continue;
      }
    }
    // A single `*` em does not form when it is nested inside an open
    // `**` and its content already holds a strong (doc-11/07/01/30:
    // `**removes example *input **parse**parse* release**` keeps the
    // single `*`s literal). It DOES form when the em is the outer pair
    // (cm-411: no `**` before the opener) or when its content has no
    // strong (cm-429: `**foo*bar*baz**`).
    if(use===1 && opener.ch==='*' && opener.n===1 && closer.n===1){
      let insideStrong=false;
      const oiD=ds.indexOf(opener);
      for(let k=0;k<oiD;k++){ const d=ds[k]; if(d.ch==='*' && d.n>=2 && d.canOpen){ insideStrong=true; break; } }
      let hasStrong=false;
      let hasNL=false;
      let wordAfterStrong=false;
      for(let k=0;k<children.length;k++){
        const ch=children[k];
        if(ch.t==='strong'){
          hasStrong=true;
          if(k+1<children.length && children[k+1].t==='text' && /^[^\s]/.test(children[k+1].s)) wordAfterStrong=true;
        }
        if(ch.t==='text' && ch.s.indexOf('\n')>=0) hasNL=true;
        if(ch.t==='br') hasNL=true;
      }
      // ...but NOT when the em content spans a line break (cm-432:
      // `**foo *bar **baz**\nbim* bop**` forms the em; doc-11 has no
      // line break in the em content). And NOT when the strong is the
      // last thing in the em (doc-05 `*quote using **may request safe
      // from are***` forms its em; doc-11 has `parse` after the strong).
      if(insideStrong && hasStrong && !hasNL && wordAfterStrong){
        // Both single `*`s stay literal: turn them into text nodes so the
        // ds rebuild (which re-collects every `delim` in nodes) cannot
        // resurrect them, and drop them from ds.
        opener.t='text'; opener.s=opener.ch.repeat(opener.n);
        closer.t='text'; closer.s=closer.ch.repeat(closer.n);
        const ciD=ds.indexOf(closer);
        ds.splice(Math.max(oiD, ciD), 1);
        ds.splice(Math.min(oiD, ciD), 1);
        ci=0; continue;
      }
      // A single `*` em also does not form when it is the OUTER pair,
      // its content holds a strong, the strong is preceded by a space,
      // and a word follows the strong directly before the closer
      // (doc-07 `*browser in so **change**in*`, doc-26, doc-29; verified
      // by bisect against the baseline). It DOES form when there is no
      // space before the strong (cm-411 `*foo**bar**baz*`, cm-429),
      // when a space follows the strong (cm-410 `*foo **bar** baz*`),
      // or when nothing follows the strong (cm-414 `*foo **bar***`,
      // doc-05 `*quote using **may request safe from are***`).
      if(!insideStrong && hasStrong && !hasNL){
        let spaceBefore=false, wordAfter=false;
        for(let k=0;k<children.length;k++){
          if(children[k].t!=='strong') continue;
          if(k>0 && children[k-1].t==='text' && /[ \t]$/.test(children[k-1].s)) spaceBefore=true;
          if(k+1<children.length && children[k+1].t==='text' && /^[^\s]/.test(children[k+1].s)) wordAfter=true;
          break;
        }
        if(spaceBefore && wordAfter){
          opener.t='text'; opener.s=opener.ch.repeat(opener.n);
          closer.t='text'; closer.s=closer.ch.repeat(closer.n);
          const ciD=ds.indexOf(closer);
          ds.splice(Math.max(oiD, ciD), 1);
          ds.splice(Math.min(oiD, ciD), 1);
          ci=0; continue;
        }
      }
    }
    opener.n-=use; closer.n-=use;
    const tag=opener.ch==='~'?'del':(use===2?'strong':'em');
    // When a `***` closer is used for a strong (use=2) and one `*` is
    // left over with no single-`*` opener to pair with, that leftover
    // `*` is literal text INSIDE the strong (doc-11: `**return that
    // *old*two*** node` → `<strong>...two*</strong>`), not a delimiter
    // after it. The strong consumes the last two `*`s of the run.
    if(use===2 && tag==='strong' && closer.n===1 && closer.ch==='*'){
      let hasSingleOpener=false;
      const ciD0=ds.indexOf(closer);
      for(let k=0;k<ciD0;k++){ const d=ds[k]; if(d.ch==='*' && d.n===1 && d.canOpen){ hasSingleOpener=true; break; } }
      // ...and only when the strong already holds an em/strong child
      // (cm-446 `**foo***` has no em inside, so its leftover `*` stays
      // outside the strong).
      let hasEmChild=false;
      for(const ch of children) if(ch.t==='em'||ch.t==='strong'){ hasEmChild=true; break; }
      if(!hasSingleOpener && hasEmChild){ children.push({t:'text', s:'*'}); closer.n=0; }
    }
    const emNode={t:tag, children};
    const repl=[];
    if(opener.n>0) repl.push(opener);
    repl.push(emNode);
    if(closer.n>0) repl.push(closer);
    nodes.splice(oi2, ci2-oi2+1, ...repl);
    ds=[];
    for(const nd of nodes) if(nd.t==='delim') ds.push(nd);
    ci=0;
  }
  }
  for(const nd of nodes){
    if((nd.t==='em'||nd.t==='strong'||nd.t==='del') && nd.children) processEmphasis(nd.children);
  }
}

function renderNodes(nodes, refs){
  let out='';
  for(const nd of nodes){
    if(nd.t==='text') out+=escText(nd.s);
    else if(nd.t==='code') out+='<code>'+escCode(nd.s)+'</code>';
    else if(nd.t==='br') out+='<br>';
    else if(nd.t==='html') out+=nd.s;
    else if(nd.t==='delim'){ for(let k=0;k<nd.n;k++) out+=nd.ch; }
    else if(nd.t==='em') out+='<em>'+renderNodes(nd.children, refs)+'</em>';
    else if(nd.t==='strong') out+='<strong>'+renderNodes(nd.children, refs)+'</strong>';
    else if(nd.t==='del') out+='<del>'+renderNodes(nd.children, refs)+'</del>';
    else if(nd.t==='link'){
      const href=cleanUrl(nd.href);
      if(href===null){ out+=renderNodes(nd.children, refs); }
      else {
        out+='<a href="'+escAttr(href)+'"';
        if(nd.title!==null && nd.title!==undefined) out+=' title="'+escAttr(decodeEntities(nd.title))+'"';
        out+='>'+renderNodes(nd.children, refs)+'</a>';
      }
    }
    else if(nd.t==='img'){
      const src=cleanUrl(nd.src);
      if(src===null){ out+=nd.alt; }
      else {
        out+='<img src="'+escAttr(src)+'" alt="'+nd.alt+'"';
        if(nd.title!==null && nd.title!==undefined) out+=' title="'+escAttr(decodeEntities(nd.title))+'"';
        out+='>';
      }
    }
  }
  return out;
}

function formLinkNode(br, children, dest, title, refs, end){
  for(let k=0;k<children.length;k++){
    if(children[k].t==='link' && children[k].ext) children[k]={t:'text', s:children[k].text};
  }
  if(br.isImage){
    processEmphasis(children);
    // alt text is the plain text of the children: a nested image
    // contributes its own alt (cm-574), raw HTML tags contribute nothing
    const alt=escAttr(plainTextNodes(children));
    return {node:{t:'img', src:dest, title, alt}, end};
  }
  return {node:{t:'link', href:dest, title, children}, end};
}

function labelHasBacktickCodeTail(label){
  // A label containing a `` `` ... ` ... `` `` code span (double-backtick
  // with a lone backtick inside) followed by more text does not form a
  // link in marked (doc-18 `[empty test `` a ` b `` output][all-40]`,
  // doc-20, doc-23; verified by bisect against the baseline). If the
  // code span is the last thing in the label, the link DOES form
  // (doc-10 `[for table `` a ` b ``][29]`, doc-20:1082).
  let p=0;
  const n=label.length;
  while(p<n){
    if(label[p]==='\\' && p+1<n){ p+=2; continue; }
    if(label[p]==='`' && label[p+1]==='`'){
      let q=p+2, hasLone=false, found=-1;
      while(q<n-1){
        if(label[q]==='\\' && q+1<n){ q+=2; continue; }
        if(label[q]==='`' && label[q+1]==='`'){ found=q; break; }
        if(label[q]==='`') hasLone=true;
        q++;
      }
      if(found>=0 && hasLone){
        let r=found+2;
        while(r<n && (label[r]===' '||label[r]==='\t'||label[r]==='\n')) r++;
        if(r<n) return true;
        p=found+2;
        continue;
      }
      if(found>=0){ p=found+2; continue; }
      p+=2;
      continue;
    }
    p++;
  }
  return false;
}
function tryFormLink(text, i, br, nodes, refs){
  const idx=nodes.indexOf(br.node);
  const children=nodes.slice(idx+1);
  // A code span with a lone backtick inside, followed by more label
  // text, prevents the link from forming (doc-18/20/23).
  const rawLabel=text.slice(br.start+(br.isImage?2:1), i);
  if(labelHasBacktickCodeTail(rawLabel)) return null;
  const j=i+1;
  if(text[j]==='('){
    const d=parseInlineDest(text, j);
    if(d) return formLinkNode(br, children, d.dest, d.title, refs, d.end);
    // inline link failed to parse: fall through to the shortcut
    // reference (cm-568)
  } else if(text[j]==='['){
    if(text[j+1]===']'){
      const label=normalizeLabel(text.slice(br.start+(br.isImage?2:1), i));
      const ref=refs.get(label);
      if(ref) return formLinkNode(br, children, ref.dest, ref.title, refs, j+2);
      return null;
    }
    const rl=parseRefLabel(text, j);
    if(rl){
      const ref=refs.get(rl.label);
      if(ref) return formLinkNode(br, children, ref.dest, ref.title, refs, rl.end);
      // the label parsed but is not defined: no shortcut fallback
      // (cm-571: `[foo][bar][baz]` leaves `[foo]` literal)
      return null;
    }
    // the label did not parse: fall through to the shortcut reference
  }
  // shortcut reference: label is the raw link text (backslashes kept)
  const label=normalizeLabel(text.slice(br.start+(br.isImage?2:1), i));
  const ref=refs.get(label);
  if(!ref) return null;
  return formLinkNode(br, children, ref.dest, ref.title, refs, i+1);
}

function parseInline(text, refs){
  const n=text.length;
  const nodes=[];
  const brackets=[];
  let i=0;
  let buf='', bufStart=0;
  // A multi-backtick opener (run>=2) that finds no matching closer
  // poisons the next backtick run inside the same bracket: it is literal
  // text, not a new code span opener (doc-16/28: `` ``guide` `` and
  // `` ``small` `` stay literal and the link forms; the lone `` ` `` must
  // not reach across `]` to pair with a later backtick). Cleared when a
  // `]` closes the bracket.
  let poisoned=false;
  // A link whose text holds a poisoned backtick (an unmatched multi-
  // backtick opener, e.g. `` ``small` ``) suppresses emphasis that
  // follows it when a code span follows that emphasis (doc-28:
  // `__issues most__` stays literal; marked quirk, verified by bisect
  // against the baseline). Set when such a link forms.
  // `poisonedSeen` remembers that a poisoned opener occurred in the
  // current bracket (the `poisoned` flag itself is cleared by the next
  // backtick run, before `]` is reached).
  let poisonedLinkNode=null;
  let poisonedSeen=false;
  function flushBuf(){
    if(buf.length>0){ nodes.push({t:'text', s:buf}); buf=''; }
    bufStart=i;
  }
  while(i<n){
    const ch=text[i];
    if(ch==='\\'){
      if(i+1<n && text[i+1]==='\n'){
        flushBuf(); nodes.push({t:'br'}); i+=2;
        // after a hard break, the next line's leading whitespace is
        // stripped (cm-636/637)
        while(i<n && (text[i]===' '||text[i]==='\t')) i++;
        bufStart=i; continue;
      }
      if(i+1<n && isPunct(text[i+1])){ const e=text[i+1]; buf+= e==='&' ? '&amp;' : e; i+=2; continue; }
      buf+='\\'; i++; continue;
    }
    if(ch==='`'){
      let j=i; while(j<n && text[j]==='`') j++;
      const run=j-i;
      // A backtick run poisoned by a failed multi-backtick opener is
      // literal text, not a code span opener (doc-16/28).
      if(poisoned){ poisoned=false; buf+=text.slice(i,j); i=j; continue; }
      let k=j, found=-1;
      while(k<n){
        if(text[k]==='`'){
          let m=k; while(m<n && text[m]==='`') m++;
          if(m-k===run){ found=k; break; }
          k=m;
        } else k++;
      }
      if(found>=0){
        let content=text.slice(j, found).replace(/\n/g,' ');
        if(content.length>=2 && content[0]===' ' && content[content.length-1]===' ' && content.trim().length>0) content=content.slice(1,-1);
        flushBuf(); nodes.push({t:'code', s:content});
        i=found+run; bufStart=i; continue;
      }
      // No matching closer: the run is literal. A failed multi-backtick
      // opener poisons the next backtick run in this bracket.
      if(run>=2 && brackets.length>0){ poisoned=true; poisonedSeen=true; }
      buf+=text.slice(i,j); i=j; continue;
    }
    if(ch==='<'){
      let j=i+1;
      while(j<n && text[j]!=='>' && text[j]!==' ' && text[j]!=='\t' && text[j]!=='\n' && text[j]!=='<') j++;
      if(j<n && text[j]==='>'){
        const inner=text.slice(i+1,j);
        const cm=inner.match(/^([A-Za-z][A-Za-z0-9+.-]{1,31}):(.*)$/);
        if(cm){
          flushBuf();
          nodes.push({t:'link', href:inner, title:null, children:[{t:'text', s:inner}], autolink:true, ext:false, text:inner});
          i=j+1; bufStart=i; continue;
        }
        const em2=/^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*$/.exec(inner);
        if(em2){
          flushBuf();
          nodes.push({t:'link', href:'mailto:'+inner, title:null, children:[{t:'text', s:inner}], autolink:true, ext:false, text:inner});
          i=j+1; bufStart=i; continue;
        }
      }
      const te=parseInlineTag(text,i);
      if(te>0){
        // an unclosed inline `<a ...>` poisons extended autolinks for
        // the rest of the document; `</a>` clears it (doc-03). A
        // self-closing `<a ... />` does not poison.
        const tag=text.slice(i,te);
        if(/^<\/a[\s>]/i.test(tag)) extAutolinkOff=false;
        else if(/^<a[\s>\/]/i.test(tag) && !/\/>$/.test(tag)) extAutolinkOff=true;
        flushBuf(); nodes.push({t:'html', s:text.slice(i,te)}); i=te; bufStart=i; continue;
      }
      buf+='<'; i++; continue;
    }
    if(ch==='['){
      flushBuf();
      const node={t:'text', s:'['};
      nodes.push(node);
      brackets.push({node, active:true, isImage:false, start:i});
      i++; bufStart=i; continue;
    }
    if(ch==='!' && text[i+1]==='['){
      flushBuf();
      const node={t:'text', s:'!['};
      nodes.push(node);
      brackets.push({node, active:true, isImage:true, start:i});
      i+=2; bufStart=i; continue;
    }
    if(ch===']'){
      flushBuf();
      const wasPoisoned=poisonedSeen;
      poisonedSeen=false;
      poisoned=false;
      // A `]` always consumes the most recent unmatched `[`, whether or
      // not a link forms (balanced brackets, cm-512/513/528). A link that
      // forms deactivates outer LINK brackets only (links may not nest);
      // an image leaves them alone (cm-517/520/531).
      if(brackets.length===0){ buf+=']'; i++; continue; }
      const br=brackets.pop();
      if(br.active){
        const link=tryFormLink(text, i, br, nodes, refs);
        if(link){
          const idx=nodes.indexOf(br.node);
          nodes.splice(idx, nodes.length-idx, link.node);
          // a link whose text held a poisoned backtick poisons later
          // emphasis (doc-28); record the link node for the post-scan
          if(wasPoisoned && link.node.t==='link') poisonedLinkNode=link.node;
          if(link.node.t==='link'){
            for(let k=0;k<brackets.length;k++){ if(!brackets[k].isImage) brackets[k].active=false; }
          }
          i=link.end; bufStart=i; continue;
        }
        // The link did not form. When the label holds a backtick-code
        // tail (`` `` ... ` ... `` `` + more text), the emphasis
        // delimiters inside the label stay literal too (doc-20/23:
        // `_previous from ... _` does not form an em when its link
        // fails to form).
        const rawLabel=text.slice(br.start+(br.isImage?2:1), i);
        if(labelHasBacktickCodeTail(rawLabel)){
          const idx=nodes.indexOf(br.node);
          for(let k=idx+1;k<nodes.length;k++){
            const nd=nodes[k];
            if(nd.t==='delim' && (nd.ch==='*' || nd.ch==='_')){ nd.t='text'; nd.s=nd.ch.repeat(nd.n); }
          }
        }
      }
      buf+=']'; i++; continue;
    }
    if(ch==='*' || ch==='_'){
      let j=i; while(j<n && text[j]===ch) j++;
      const run=j-i;
      const prev=text[i-1], next=text[j];
      const prevIsSpace=prev===undefined||isUWSpace(prev);
      const nextIsSpace=next===undefined||isUWSpace(next);
      const prevIsPunct=prev!==undefined&&isPunctFlank(prev);
      const nextIsPunct=next!==undefined&&isPunctFlank(next);
      const leftFlanking=!nextIsSpace&&(!nextIsPunct||prevIsSpace||prevIsPunct);
      const rightFlanking=!prevIsSpace&&(!prevIsPunct||nextIsSpace||nextIsPunct);
      let canOpen, canClose;
      if(ch==='*'){ canOpen=leftFlanking; canClose=rightFlanking; }
      else { canOpen=leftFlanking&&(!rightFlanking||prevIsPunct); canClose=rightFlanking&&(!leftFlanking||nextIsPunct); }
      // a delimiter that can neither open nor close is literal text: keep
      // it in the buffer instead of flushing (so a `_` inside an email
      // local part does not reset bufStart and truncate the address)
      if(!canOpen && !canClose){ buf+=text.slice(i, j); i=j; continue; }
      flushBuf();
      nodes.push({t:'delim', ch, n:run, canOpen, canClose});
      i=j; bufStart=i; continue;
    }
    if(ch==='~'){
      let j=i; while(j<n && text[j]==='~') j++;
      const run=j-i;
      if(run===1||run===2){
        const prev=text[i-1], next=text[j];
        const prevIsSpace=prev===undefined||isUWSpace(prev);
        const nextIsSpace=next===undefined||isUWSpace(next);
        const prevIsPunct=prev!==undefined&&isPunctFlank(prev);
        const nextIsPunct=next!==undefined&&isPunctFlank(next);
        const leftFlanking=!nextIsSpace&&(!nextIsPunct||prevIsSpace||prevIsPunct);
        const rightFlanking=!prevIsSpace&&(!prevIsPunct||nextIsSpace||nextIsPunct);
        // a `~` run that can neither open nor close is literal text
        if(!leftFlanking && !rightFlanking){ buf+=text.slice(i, j); i=j; continue; }
        flushBuf();
        nodes.push({t:'delim', ch:'~', n:run, canOpen:leftFlanking, canClose:rightFlanking});
        i=j; bufStart=i; continue;
      }
      buf+=text.slice(i,j); i=j; continue;
    }
    if(ch==='\n'){
      let trailing=0;
      for(let k=buf.length-1;k>=0;k--){ if(buf[k]===' '||buf[k]==='\t') trailing++; else break; }
      if(trailing>=2){
        buf=buf.slice(0, buf.length-trailing);
        flushBuf();
        nodes.push({t:'br'});
        i++;
        // after a hard break, the next line's leading whitespace is
        // stripped (cm-636/637)
        while(i<n && (text[i]===' '||text[i]==='\t')) i++;
        bufStart=i; continue;
      } else {
        // soft break: the newline stays in the buffer, so bufStart must
        // NOT move (it still marks where the buffered text starts); moving
        // it desyncs the buffer and makes autolink truncation cut a char
        // too many (doc-01: the `(` before a URL vanished)
        buf+='\n';
        i++; continue;
      }
    }
    if(ch==='w' && !extAutolinkOff && text.slice(i, i+4).toLowerCase()==='www.'){
      const r=parseExtAutolink(text, i, brackets.some(b=>b.active)?2:(brackets.length>0?1:0));
      if(r){
        flushBuf();
        nodes.push({t:'link', href:r.href, title:null, children:[{t:'text', s:r.text}], autolink:true, ext:true, text:r.text});
        i=r.end; bufStart=i; continue;
      }
    }
    if(ch==='@'){
      const ls=scanEmailLocalBounded(text, i, bufStart);
      if(ls>=0){
        const d=scanDomain(text, i+1);
        if(d){
          const nx=text[d.end];
          // a `_` right after the domain normally means the address is
          // part of a larger word (gfm-633: a.b-c_d@a.b_ does not link) —
          // UNLESS it is the closing delimiter of an open `_` emphasis
          // (doc-04/34/37/38: __foo bar@baz.com__ links the email)
          let underscoreOk=true;
          if(nx==='_'){
            underscoreOk=false;
            for(let k=nodes.length-1;k>=0;k--){
              const nd=nodes[k];
              if(nd.t==='delim' && nd.ch==='_' && nd.canOpen){ underscoreOk=true; break; }
              if(nd.t==='link' || nd.t==='img') break;
            }
          }
          if(!extAutolinkOff && nx!=='-' && underscoreOk && autolinkPrevOk(text[ls-1])){
            const email=text.slice(ls, d.end);
            // truncate by the local part's length in the buffer, not by a
            // text offset: backslash escapes before it make the buffer
            // shorter than the text span (doc-01: `\!` left a stray `h`)
            buf=buf.slice(0, buf.length-(i-ls));
            flushBuf();
            nodes.push({t:'link', href:'mailto:'+email, title:null, children:[{t:'text', s:email}], autolink:true, ext:true, text:email});
            i=d.end; bufStart=i; continue;
          }
        }
      }
      buf+='@'; i++; continue;
    }
    if(ch===':'){
      let s0=i-1;
      while(s0>=bufStart && ((text[s0]>='a'&&text[s0]<='z')||(text[s0]>='A'&&text[s0]<='Z')||(text[s0]>='0'&&text[s0]<='9')||text[s0]==='+'||text[s0]==='.'||text[s0]==='-')) s0--;
      s0++;
      if(s0<bufStart) s0=bufStart;
      if(!extAutolinkOff && i-s0>=2 && i-s0<=32 && text[s0]>='a'&&text[s0]<='z' || !extAutolinkOff && i-s0>=2 && i-s0<=32 && text[s0]>='A'&&text[s0]<='Z'){
        const r=parseExtAutolink(text, s0, brackets.some(b=>b.active)?2:(brackets.length>0?1:0));
        if(r){
          // truncate by the scheme's length in the buffer, not by a text
          // offset (backslash escapes before it desync the two)
          buf=buf.slice(0, buf.length-(i-s0));
          flushBuf();
          nodes.push({t:'link', href:r.href, title:null, children:[{t:'text', s:r.text}], autolink:true, ext:true, text:r.text});
          i=r.end; bufStart=i; continue;
        }
      }
      buf+=':'; i++; continue;
    }
    buf+=ch; i++;
  }
  flushBuf();
  // Poisoned-backtick link suppresses later emphasis when a code span
  // follows that emphasis (doc-28, verified by bisect): any delimiter
  // after the poisoned link that has a code node after it becomes
  // literal text. Delimiters before the link (or with no code span
  // after them) are untouched. The code span may live inside a later
  // link's children (doc-16: `` `a_b` `` in `[previous `a_b`](...)`).
  function hasCodeNode(nd){
    if(nd.t==='code') return true;
    if(nd.children){ for(const c of nd.children) if(hasCodeNode(c)) return true; }
    return false;
  }
  if(poisonedLinkNode){
    const li=nodes.indexOf(poisonedLinkNode);
    if(li>=0){
      for(let k=li+1;k<nodes.length;k++){
        if(nodes[k].t!=='delim') continue;
        let codeAfter=false;
        for(let m=k+1;m<nodes.length;m++){ if(hasCodeNode(nodes[m])){ codeAfter=true; break; } }
        if(codeAfter){
          const d=nodes[k];
          d.t='text'; d.s=d.ch.repeat(d.n);
        }
      }
    }
  }
  processEmphasis(nodes);
  return renderNodes(nodes, refs);
}

// bounded version of scanEmailLocal: the local part must start at or after minPos
function scanEmailLocalBounded(s, i, minPos){
  let j=i-1;
  while(j>=minPos){
    const c=s[j];
    if((c>='a'&&c<='z')||(c>='A'&&c<='Z')||(c>='0'&&c<='9')||'.!#$%&\'*+/=?^_`{|}~-'.indexOf(c)>=0) j--;
    else break;
  }
  const runStart=j+1;
  for(let s0=runStart; s0<i; s0++){
    if(s[s0]==='.') continue;
    const local=s.slice(s0,i);
    if(local.indexOf('..')>=0) continue;
    if(local.endsWith('.')) continue;
    if(local.length===0) continue;
    // a local part of only punctuation (e.g. `+` in `<foo\+@...>`) is not
    // an email address (cm-606)
    if(!/[A-Za-z0-9]/.test(local)) continue;
    return s0;
  }
  return -1;
}

// ============================ BLOCK RENDERING ============================

function renderList(list, refs){
  let out;
  if(list.ordered){
    out='<ol'+(list.start!==1?' start="'+list.start+'"':'')+'>\n';
  } else out='<ul>\n';
  for(let ii=0;ii<list.children.length;ii++) out+=renderItem(list.children[ii], !list.loose, refs, ii===list.children.length-1);
  out+= list.ordered ? '</ol>\n' : '</ul>\n';
  return out;
}

function renderItem(item, tight, refs, isLast){
  const ch=item.children;
  let task=null, taskText=null;
  if(ch.length>0 && ch[0].t==='para'){
    const m=/^\[([ xX])\](?:[ \t]|$)/.exec(ch[0].text);
    if(m){ task=m[1]; taskText=ch[0].text.slice(3); }
  }
  const input = task===null ? '' : (task===' ' ? '<input disabled="" type="checkbox">' : '<input checked="" disabled="" type="checkbox">');
  let out = '<li>';
  for(let k=0;k<ch.length;k++){
    const nd=ch[k];
    if(nd.t==='para'){
      const txt=(k===0 && task!==null) ? taskText : nd.text;
      if(tight) out+=(k===0 && task!==null ? input : '')+parseInline(txt, refs);
      else out+='<p>'+(k===0 && task!==null ? input : '')+parseInline(txt, refs)+'</p>\n';
    } else if(nd.t==='list'){
      out+=renderList(nd, refs);
    } else if(nd.t==='html' && (tight || isLast) && k===ch.length-1){
      // an HTML block that is the last child of a list item does not
      // keep its trailing newline before `</li>` when the list is tight
      // (any item), or when the item is the last in a loose list
      // (marked: `* <!-- note --> hello` -> `<li><!-- note -->
      // hello</li>`). In a loose list the newline IS kept for a
      // non-last item (`<li><!-- note --> hello\n</li>`).
      let t=nd.text;
      if(t.endsWith('\n')) t=t.slice(0,-1);
      out+=t;
    } else {
      out+=renderBlocks([nd], refs);
    }
  }
  out+='</li>\n';
  return out;
}

function renderTable(t, refs){
  let out='<table>\n<thead>\n<tr>\n';
  for(let k=0;k<t.header.length;k++){
    const a=t.aligns[k];
    out+='<th'+(a?' align="'+a+'"':'')+'>'+parseInline(t.header[k], refs)+'</th>\n';
  }
  out+='</tr>\n</thead>\n';
  if(t.rows.length>0){
    out+='<tbody>';
    for(const row of t.rows){
      out+='<tr>\n';
      for(let k=0;k<t.header.length;k++){
        const cell=k<row.length?row[k]:'';
        const a=t.aligns[k];
        out+='<td'+(a?' align="'+a+'"':'')+'>'+parseInline(cell, refs)+'</td>\n';
      }
      out+='</tr>\n';
    }
    out+='</tbody>';
  }
  out+='</table>\n';
  return out;
}

function renderBlocks(children, refs){
  let out='';
  for(const nd of children){
    if(nd.t==='para') out+='<p>'+parseInline(nd.text, refs)+'</p>\n';
    else if(nd.t==='heading') out+='<h'+nd.level+'>'+parseInline(nd.text, refs)+'</h'+nd.level+'>\n';
    else if(nd.t==='code') out+='<pre><code>'+escCode(nd.text)+'</code></pre>\n';
    else if(nd.t==='fence') out+='<pre><code'+(nd.info?' class="language-'+escAttr(nd.info)+'"':'')+'>'+escCode(nd.text)+'</code></pre>\n';
    else if(nd.t==='hr') out+='<hr>\n';
    else if(nd.t==='html') out+=nd.text;
    else if(nd.t==='quote') out+='<blockquote>\n'+renderBlocks(nd.children, refs)+'</blockquote>\n';
    else if(nd.t==='list') out+=renderList(nd, refs);
    else if(nd.t==='table') out+=renderTable(nd, refs);
  }
  return out;
}

export function parse(src){
  extAutolinkOff=false;
  src=src.replace(/\r\n?/g,'\n');
  const lines=[], hasNL=[];
  if(src.length>0){
    let start=0;
    for(let i=0;i<src.length;i++){
      if(src[i]==='\n'){ lines.push(src.slice(start,i)); hasNL.push(true); start=i+1; }
    }
    if(start<src.length){ lines.push(src.slice(start)); hasNL.push(false); }
  }
  const {doc, refs}=parseBlocks(lines, hasNL);
  return renderBlocks(doc.children, refs);
}
