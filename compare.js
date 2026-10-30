// Compare a critic run against the hand labels.
// Usage: node compare.js [runs/<dir>] [data/file.json]

const fs = require('fs');
const path = require('path');

const runDir = process.argv[2] || path.join(__dirname, 'runs', '2026-10-30-v1');
const dataFile = process.argv[3] || path.join(__dirname, 'data', 'weinstein-2018.json');

const hand = Object.fromEntries(JSON.parse(fs.readFileSync(dataFile, 'utf8')).items.map((it) => [it.id, it]));
const critic = Object.fromEntries(
  fs.readdirSync(runDir).filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(runDir, f), 'utf8')))
    .map((it) => [it.id, it])
);

const ids = Object.keys(hand).filter((id) => critic[id]);
const missing = Object.keys(hand).filter((id) => !critic[id]);
const score = (it) => it.novelty * it.content * it.survival;

// Spearman rank correlation with average ranks for ties.
function ranks(xs) {
  const order = xs.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]);
  const r = new Array(xs.length);
  for (let i = 0; i < order.length;) {
    let j = i;
    while (j + 1 < order.length && order[j + 1][0] === order[i][0]) j++;
    for (let k = i; k <= j; k++) r[order[k][1]] = (i + j) / 2 + 1;
    i = j + 1;
  }
  return r;
}
function spearman(a, b) {
  const ra = ranks(a), rb = ranks(b), n = a.length;
  const ma = ra.reduce((s, x) => s + x, 0) / n, mb = rb.reduce((s, x) => s + x, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    num += (ra[i] - ma) * (rb[i] - mb);
    da += (ra[i] - ma) ** 2;
    db += (rb[i] - mb) ** 2;
  }
  return num / Math.sqrt(da * db);
}

console.log(`Compared ${ids.length} items${missing.length ? `; missing: ${missing.join(', ')}` : ''}\n`);

for (const axis of ['novelty', 'content', 'survival']) {
  const exact = ids.filter((id) => hand[id][axis] === critic[id][axis]).length;
  const mad = ids.reduce((s, id) => s + Math.abs(hand[id][axis] - critic[id][axis]), 0) / ids.length;
  const bias = ids.reduce((s, id) => s + (critic[id][axis] - hand[id][axis]), 0) / ids.length;
  console.log(`${axis.padEnd(9)} exact ${exact}/${ids.length}  mean |diff| ${mad.toFixed(2)}  critic - hand ${bias >= 0 ? '+' : ''}${bias.toFixed(2)}`);
}

const rho = spearman(ids.map((id) => score(hand[id])), ids.map((id) => score(critic[id])));
const sameVerdict = ids.filter((id) => hand[id].verdict === critic[id].verdict).length;
const cited = ids.reduce((s, id) => s + critic[id].prior_art.length, 0);
console.log(`\nscore rank correlation (Spearman) ${rho.toFixed(2)}`);
console.log(`same verdict ${sameVerdict}/${ids.length}`);
console.log(`critic citations ${cited} (${(cited / ids.length).toFixed(1)} per item)\n`);

const rows = ids
  .map((id) => ({ id, h: score(hand[id]), c: score(critic[id]), hv: hand[id].verdict, cv: critic[id].verdict }))
  .sort((a, b) => Math.abs(b.h - b.c) - Math.abs(a.h - a.c));
console.log('hand  critic  hand verdict             critic verdict           id');
for (const r of rows) {
  console.log(`${String(r.h).padEnd(6)}${String(r.c).padEnd(8)}${r.hv.padEnd(25)}${r.cv.padEnd(25)}${r.id}`);
}
