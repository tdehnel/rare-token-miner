# Interestingness

See [docs/OVERVIEW.md](docs/OVERVIEW.md) for the full process with diagrams.

A machine that finds ideas that are true, or problems that are real, but not widely known.

## Definition

Following Popper and Deutsch, "true" means unrefuted and hard to vary, and "known" is relative to an audience. An idea scores on three axes, each 0 to 3:

- **Novelty**: how unknown the idea is, net of synonyms. A rare name for a popular idea is not novel.
- **Content**: how much it explains, and how far beyond its home domain (reach).
- **Survival**: how well it holds up against the strongest criticism found.

`interestingness = novelty × content × survival`. A zero on any axis zeroes the score.

## Pipeline (planned)

1. **Mine** long-tail sources for coined terms and claims.
2. **Score rarity** with cheap signals: search volume, trend shape, specialist-to-general frequency ratio.
3. **Canonicalize**: map each coined term to its specialist synonyms and check *their* popularity.
4. **Criticize**: state what would refute the claim, then search for refutations and prior art.
5. **Present** the claim, its strongest criticism, and why it survived.

## Files

- `data/weinstein-2018.json`: 25 candidates from a 2018 thread on Eric Weinstein's ideas, each hand-labeled with claim, refutation condition, synonyms, prior art, and scores.
- `score.js`: ranks a dataset. Run `node score.js [file]`.
- `critic/prompt.md`, `critic/schema.json`: the critic agent's instructions and output format.
- `compare.js`: compares a critic run with the hand labels. Run `node compare.js runs/<dir>`.
- `runs/2026-10-30-v1/`: first blind critic run, one JSON file per claim, plus `REPORT.md`.

## Pilot 1: Weinstein thread

Source: Zen Black's thread (June 2018) and expanded topics page. The critic step was done by hand.

**The rare-term signal mostly detects rebranding.** Seven of the eight top-scoring items have specialist prior art that the source does not cite:

| Coined term | Prior art |
|---|---|
| Excellence vs genius | March, exploration vs exploitation (1991) |
| Russell conjugate crawler | Gentzkow & Shapiro, media slant (2010) |
| War on design constraints | Campisi, cancer vs aging (2003) |
| Embedded growth obligations | Goodstein, "The Big Crunch" (1994) |
| CPI as closet tax | Boskin Commission (1996); chained CPI in 2017 tax law |
| Crosshairs of software | Autor, Levy & Murnane, routine-biased change (2003) |
| Mind sandboxes | Mill (1859); Caplan's ideological Turing test (2011) |
| Canonical design | Altshuller's TRIZ |

Only three items look original: the self-teacher succession problem, artificial out-telligence, and gauge-theoretic economics (from Malaney's 1996 thesis).

**Lessons for the machine**

1. Canonicalization (step 3) is the core step, not a cleanup. The popularity of a term's synonyms reveals novelty better than the term's own search volume ("Russell conjugation" 260/mo vs "framing effect" 6,600/mo).
2. A rebranded idea is still worth surfacing. Linking a vivid coinage to its evidence base is Swanson's "undiscovered public knowledge" run in reverse: the popularizer has the audience, the specialists have the tests.
3. Popularity follows the author, not the idea. Weinstein's most criticized idea, Geometric Unity, is his only coinage with rising search interest. Spread should be measured net of author fame.
4. Strong forms fail where weak forms survive (learning disabilities). The critic must state the strongest testable version of a claim and judge that version, then note what remains.
5. Some items are self-sealing or anecdotal. These score zero on survival until someone states what would refute them.

**Untested, cheap to test**

- *Truffle hound*: do academics who refuse compelled public statements out-publish department peers? Bibliometrics can answer this.
- *Gauge economics*: does the geometric index give different answers from chained CPI on real data?
- *Self-teacher succession*: do self-taught eminent scientists have fewer eminent students than institutionally trained ones?
