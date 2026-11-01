// Build the review page: embeds hand labels and a critic run into template.html.
// Usage: node review/build.js [runs/<dir>] [data/file.json]

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const runDir = process.argv[2] || path.join(root, 'runs', '2026-10-30-v1');
const dataFile = process.argv[3] || path.join(root, 'data', 'weinstein-2018.json');

const hand = JSON.parse(fs.readFileSync(dataFile, 'utf8')).items;
const critic = Object.fromEntries(
  fs.readdirSync(runDir).filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(runDir, f), 'utf8')))
    .map((it) => [it.id, it])
);

const score = (it) => it.novelty * it.content * it.survival;
const items = hand.filter((h) => critic[h.id]).map((h) => {
  const c = critic[h.id];
  return {
    id: h.id, term: h.term, claim: h.claim, quote: h.quote,
    hand: {
      kind: h.kind, verdict: h.verdict, novelty: h.novelty, content: h.content, survival: h.survival,
      score: score(h), refuted_if: h.refuted_if, synonyms: h.synonyms, prior_art: h.prior_art, notes: h.notes,
    },
    critic: {
      kind: c.kind, verdict: c.verdict, novelty: c.novelty, content: c.content, survival: c.survival,
      score: score(c), confidence: c.confidence, strong_form: c.strong_form, weak_form: c.weak_form || null,
      refuted_if: c.refuted_if, synonyms: c.synonyms, prior_art: c.prior_art, criticism: c.strongest_criticism,
    },
  };
});

const run = path.basename(runDir);
const html = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8')
  .replace('__DATA__', () => JSON.stringify({ run, items }).replace(/</g, '\\u003c'));
fs.writeFileSync(path.join(__dirname, 'review.html'), html);
console.log(`review.html: ${items.length} items from ${run}`);
