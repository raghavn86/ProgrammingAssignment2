const fs = require('fs');
const SRC = '/home/user/ProgrammingAssignment2/worksheets/four-digit-addition-subtraction-a4.html';
const src = fs.readFileSync(SRC, 'utf8');
const css = src.match(/<style>([\s\S]*?)<\/style>/)[1];
const f400 = fs.readFileSync('a400.b64', 'utf8');
const f700 = fs.readFileSync('a700.b64', 'utf8');

function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function make(seed, mode, want, count){
  const rand = mulberry32(seed);
  const rnd = (a,b) => a + Math.floor(rand()*(b-a+1));
  const carries = (a,b) => { let c=0; while(a>0||b>0){ if((a%10)+(b%10)+c>9) return true; c=0; a=Math.floor(a/10); b=Math.floor(b/10);} return false; };
  const borrows = (a,b) => { while(b>0){ if(a%10 < b%10) return true; a=Math.floor(a/10); b=Math.floor(b/10);} return false; };
  const out = [];
  for(let i=0;i<count;i++){
    const sub = mode==='sub' ? true : mode==='add' ? false : rand() < 0.55;
    let p = null;
    for(let t=0;t<400 && !p;t++){
      if(sub){
        const a=rnd(2000,9999), b=rnd(1000,a-1), has=borrows(a,b);
        if(want==='always' && !has) continue;
        if(want==='none' && has) continue;
        p = {a,b,op:'−',ans:a-b};
      } else {
        const a=rnd(1000,8999), b=rnd(1000,8999), has=carries(a,b);
        if(want==='always' && !has) continue;
        if(want==='none' && has) continue;
        p = {a,b,op:'+',ans:a+b};
      }
    }
    out.push(p || {a:1234,b:2345,op:'+',ans:3579});
  }
  return out;
}

const pad = (n,len) => String(n).padStart(len,' ');
const digitCells = n => pad(n,4).split('').map(c => '<div class="cell">'+(c===' '?'':c)+'</div>').join('');
const answerCells = n => pad(n,5).split('').map(c => '<div class="cell"><span>'+(c===' '?'&nbsp;':c)+'</span></div>').join('');

const prob = p => '<div class="prob">'
  + '<div class="cols labels"><span class="pad"></span><span>Thou</span><span>Hun</span><span>Tens</span><span>Ones</span></div>'
  + '<div class="cols work"><div class="pad"></div><div></div><div></div><div></div><div></div></div>'
  + '<div class="cols row first"><div></div>' + digitCells(p.a) + '</div>'
  + '<div class="cols row second"><div class="op">' + p.op + '</div>' + digitCells(p.b) + '</div>'
  + '<div class="rule"></div>'
  + '<div class="cols row answer">' + answerCells(p.ans) + '</div>'
  + '</div>';

const PAPER = process.argv[2] === 'letter' ? 'letter' : 'a4';
const page = (probs, label, seed, key) =>
  '<div class="sheet' + (key ? ' show-answers' : '') + '" data-paper="' + PAPER + '">'
  + '<div class="name-row"><span class="fld">Name:<span class="line"></span></span><span class="fld">Date:<span class="line"></span></span></div>'
  + '<div class="grid">' + probs.map(prob).join('') + '</div>'
  + '<div class="foot"><span>' + label + (key ? ' &mdash; ANSWER KEY' : '') + '</span><span>Set ' + seed + '</span></div>'
  + '</div>';

const sets = [
  { seed: 4101, mode: 'mixed', want: 'always', label: 'Mixed addition &amp; subtraction &middot; regrouping in every problem' },
  { seed: 4202, mode: 'mixed', want: 'always', label: 'Mixed addition &amp; subtraction &middot; regrouping in every problem' },
  { seed: 4303, mode: 'add',   want: 'always', label: 'Addition with carrying &middot; four digits' },
  { seed: 4404, mode: 'sub',   want: 'always', label: 'Subtraction with borrowing &middot; four digits' }
];

const built = sets.map(s => ({ s, probs: make(s.seed, s.mode, s.want, 24) }));
const body = built.map(b => page(b.probs, b.s.label, b.s.seed, false)).join('')
           + built.map(b => page(b.probs, b.s.label, b.s.seed, true)).join('');

const html = '<!doctype html><html><head><meta charset="utf-8"><title>4-Digit Column Practice</title><style>'
  + '@font-face{font-family:"Andika";font-style:normal;font-weight:400;src:url(data:font/woff2;base64,' + f400 + ') format("woff2");}'
  + '@font-face{font-family:"Andika";font-style:normal;font-weight:700;src:url(data:font/woff2;base64,' + f700 + ') format("woff2");}'
  + css
  + 'body{margin:0;background:#fff;} .toolbar,.hint{display:none;}'
  + '@page{size:' + (PAPER === 'letter' ? '215.9mm 279.4mm' : '210mm 297mm') + ';margin:0;}'
  + '.sheet{box-shadow:none;margin:0;width:var(--page-w);height:var(--page-h);min-height:0;break-after:page;page-break-after:always;overflow:hidden;}'
  + '.sheet:last-child{break-after:auto;page-break-after:auto;}'
  + '@media screen and (max-width:900px){.sheet{zoom:1;}}'
  + '</style></head><body>' + body + '</body></html>';

fs.writeFileSync('print-' + PAPER + '.html', html);
console.log(PAPER, 'pages:', built.length * 2);
