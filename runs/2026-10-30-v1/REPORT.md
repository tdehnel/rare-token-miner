# Critic run v1 vs hand labels

**Setup.** Five critic subagents, five claims each, using `critic/prompt.md` v1. Each critic saw only the claim text and a quote, with the author hidden and no access to the hand labels. Same model family as the hand labeler. Citations come from web search, but nobody fetched the pages to check them.

**Run:** `node compare.js runs/2026-10-30-v1`

## Agreement

| Axis | Exact match | Mean abs. diff | Critic minus hand |
|---|---|---|---|
| Novelty | 11/25 | 0.60 | −0.60 |
| Content | 16/25 | 0.36 | +0.20 |
| Survival | 12/25 | 0.56 | −0.40 |

- Score rank correlation (Spearman): 0.54.
- Same verdict: 7 of 25.
- Citations: 125, five per item.

## Where the critic was right

The critic caught errors that its sources support:

- **looped-work.** The hand label cited Autor, Levy & Murnane (2003) in support. The paper actually says the opposite for the computer era: software replaced routine middle-skill work and *complemented* educated workers. Only LLM-era exposure studies (Eloundou et al., 2023) point the claim's way. Hand label wrong.
- **gauge-economics.** The critic found Nguyen's 2021 review ([arXiv:2112.03460](https://arxiv.org/abs/2112.03460)): mathematically sound, but it reduces to a Divisia index once you choose a transport rule, and one key result is tautological. Prior art also exists (Divisia path dependence; Ilinski 1997). Novelty and survival should both drop.
- **cancer-senescence.** "Super p53/Arf" mice resist cancer *and* live as long or longer (García-Cao 2002; Matheu 2007). So the trade-off is real but not a hard constraint. Also, US cancer mortality has fallen about a third since 1991, so "stalled" overstates it.
- **self-teacher-succession.** Einstein trained at ETH, so he is a poor example of a self-teacher. No study has run the matched comparison, so the claim is untested, not surviving.
- **excellence-vs-genius.** Zuckerman's lineage data cut against the claim: elite credentialed pipelines concentrate tail talent rather than suppress it.

## Where the hand label is defensible

- **umbrella.** The critic judged the stated claim and gave novelty 0. The hand label credited a reframing (why do solved designs fail to spread?) that the source never made. Both readings are defensible. The critic should be told whether to score reframings.

## Problems with the critic

1. **Score compression.** The critic rarely gives a 3, so the multiplicative score bunches between 2 and 6 and stops separating candidates. Either anchor the scale with examples or sum the axes instead of multiplying them.
2. **Weak sources.** About a third of citations are blogs, forums, Substacks, or press coverage. Some are mislabeled: a 2017 Scientometrics paper is cited as Zuckerman's 1977 book.
3. **Author leaks.** Searches surfaced the source's own pages (a Big Think article, The Portal Wiki), which reveal the author. Blinding the input text isn't enough. Search results would need filtering too.
4. **No citation check.** URLs come from search snippets. A verification pass should fetch each one and confirm it says what the critic claims.

## Next

- Adjudicate the disagreements and record the hand label's changes, keeping the v1 labels as a baseline.
- Critic v2: scale anchors, a source-quality rule, a citation-fetch check, and a ruling on reframings.
- Check bias with a critic from a different model family.
