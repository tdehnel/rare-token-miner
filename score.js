// Rank labeled candidates by interestingness = novelty x content x survival.
// A zero on any axis zeroes the score: an idea that is known, empty, or refuted is not interesting.
// Usage: node score.js [data/file.json]

const fs = require('fs');
const path = require('path');

const file = process.argv[2] || path.join(__dirname, 'data', 'weinstein-2018.json');
const { items } = JSON.parse(fs.readFileSync(file, 'utf8'));

const score = (it) => it.novelty * it.content * it.survival;

// Flags a coined term whose idea is popular under another name.
function rebrand(it) {
  const sv = it.search_volume || {};
  const own = it.term ? sv[it.term.toLowerCase()] : undefined;
  const best = Math.max(0, ...Object.entries(sv)
    .filter(([k]) => !it.term || k !== it.term.toLowerCase())
    .map(([, v]) => v || 0));
  return own != null && best >= 10 * Math.max(own, 1);
}

const ranked = items
  .map((it) => ({ ...it, score: score(it) }))
  .sort((a, b) => b.score - a.score || b.novelty - a.novelty);

const pad = (s, n) => String(s).padEnd(n);
console.log(pad('score', 6) + pad('N C S', 7) + pad('kind', 10) + pad('verdict', 25) + 'id');
for (const it of ranked) {
  const flag = rebrand(it) ? '  [rare name, known idea]' : '';
  console.log(
    pad(it.score, 6) +
    pad(`${it.novelty} ${it.content} ${it.survival}`, 7) +
    pad(it.kind, 10) +
    pad(it.verdict, 25) +
    it.id + flag
  );
}

const withPriorArt = ranked.filter((it) => it.score >= 9 && it.prior_art.length).length;
const top = ranked.filter((it) => it.score >= 9).length;
console.log(`\n${top} items score >= 9; ${withPriorArt} of them have specialist prior art.`);
