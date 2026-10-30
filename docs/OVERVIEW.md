# Rare Token Miner: Overview

## Executive summary

**What we're building.** A machine that finds ideas that are true but not widely known, and problems that are real but that few people have noticed. StumbleUpon surfaced pages that were good but obscure. This aims to do the same for ideas, with a filter for truth.

**How it works.** It runs in five steps:

1. **Mine** obscure sources for rare terms and the claims behind them.
2. **Check rarity.** Look up the term's synonyms. A rare name for a popular idea doesn't count.
3. **Criticize.** An AI critic restates each claim in its strongest testable form, says what would refute it, and searches for prior art and counter-evidence.
4. **Score** each idea on three axes: novelty, content, and survival under criticism.
5. **Present** the survivors alongside their strongest criticism.

**Why this approach.** It follows Popper and Deutsch. We can't prove an idea true. We can only attack it and see whether it survives. Obscure ideas are mostly obscure because they are wrong, so most of the machine is an error filter. Finding novelty is the easy part.

**Where we are.** Pilot 1 is done: 25 ideas from a 2018 thread on Eric Weinstein, labeled by hand. Critic v1 is built and has been tested blind against those labels. It overturned several of them with evidence. Mining and rarity checks are still manual.

---

## 1. What counts as interesting

An idea is interesting when it scores well on all three axes. Each axis runs 0 to 3, and the three are multiplied, so a zero on any axis zeroes the score.

```mermaid
flowchart LR
    N["<b>Novelty</b><br/>How few people know it,<br/>counting its synonyms"]
    C["<b>Content</b><br/>How much it explains,<br/>and how far beyond its field"]
    S["<b>Survival</b><br/>How well it holds up<br/>against the best criticism"]
    N --> X(("N × C × S"))
    C --> X
    S --> X
    X --> I["Interestingness<br/>0 to 27"]
```

| Score | Novelty | Content | Survival |
|---|---|---|---|
| 0 | Everyone knows it | Says nothing testable | Refuted, or can't be tested |
| 1 | Known under another name | An anecdote | Contested or untested |
| 2 | Known mainly to specialists | Explains one field | Survives with caveats |
| 3 | Almost nobody says it | Explains across fields | Survives the best criticism found |

Novelty and survival together sort ideas into four groups. The chart plots a few pilot items using the hand labels, before critic review.

```mermaid
quadrantChart
    title Novelty vs survival, pilot 1 hand labels
    x-axis Weak under criticism --> Strong under criticism
    y-axis Widely known --> Rarely known
    quadrant-1 Interesting
    quadrant-2 Untested or crankery
    quadrant-3 Known errors
    quadrant-4 Known truths
    Self teacher succession: [0.62, 0.87]
    Gauge economics: [0.37, 0.87]
    Growth obligations: [0.62, 0.62]
    CPI as stealth tax: [0.87, 0.62]
    Russell conjugation: [0.87, 0.37]
    LD super learners: [0.37, 0.37]
    Hallucinogenic elite: [0.12, 0.62]
```

The top-left quadrant is the danger zone. Rare but untested ideas look exciting, and most are wrong. The critic's job is to push each of them right or down.

## 2. The pipeline

```mermaid
flowchart TD
    A["<b>Sources</b><br/>old papers, mid-cited research, patents,<br/>non-English work, deep forum threads,<br/>practitioner knowledge"]
    B["<b>1. Mine</b><br/>extract rare terms<br/>and the claims behind them"]
    C["<b>2. Check rarity</b><br/>search volume, trend shape,<br/>specialist vs general frequency"]
    D["<b>Canonicalize</b><br/>find synonyms;<br/>check their popularity"]
    E["<b>3. Criticize</b><br/>critic agents attack each claim"]
    F["<b>4. Score</b><br/>N × C × S"]
    G["<b>5. Present</b><br/>claim + strongest criticism<br/>+ why it survived"]
    H["<b>Reader feedback</b><br/>treated as criticism"]

    A --> B --> C --> D --> E --> F --> G --> H
    H -. "refines critic<br/>and scoring" .-> E

    classDef built fill:#d4edda,stroke:#28a745,color:#000
    classDef manual fill:#fff3cd,stroke:#d39e00,color:#000
    classDef planned fill:#f8f9fa,stroke:#adb5bd,color:#000,stroke-dasharray: 4 3
    class E,F built
    class B,C,D manual
    class A,G,H planned
```

Green: built. Yellow: done by hand so far. Grey: planned.

**Canonicalization is the core step.** In pilot 1, seven of the eight top-scoring ideas already existed in specialist literature under other names. "Russell conjugation" gets 260 searches a month. "Framing effect," the same idea, gets 6,600. Novelty has to be measured on the idea, not the label.

Rebranded ideas still have value. Linking a vivid coinage to the evidence behind it is Swanson's "undiscovered public knowledge" in reverse: the popularizer has the audience, and the specialists have the tests.

## 3. The critic

Each claim goes through the same eight steps (`critic/prompt.md`). The output is one JSON record per claim (`critic/schema.json`).

```mermaid
flowchart TD
    IN["Claim + quote<br/>(author hidden)"] --> S1["Restate the strongest<br/>testable version"]
    S1 --> S2["Classify: claim, problem,<br/>heuristic, label, anecdote"]
    S2 --> S3{"Can it be<br/>refuted?"}
    S3 -- No --> Z["Survival = 0<br/>unfalsifiable as stated"]
    S3 -- Yes --> S4["Search: synonyms, prior art,<br/>counter-evidence, support"]
    S4 --> S5["Write the strongest criticism"]
    S5 --> S6["Score N, C, S<br/>verdict + confidence"]
    Z --> S6
    S6 --> OUT["JSON record<br/>with cited URLs"]
```

The rules:
- Popularity and authority are not evidence. Only arguments count.
- Being contrarian earns a claim no credit.
- Cite only sources actually found, never from memory.
- A plausible claim nobody has tested scores survival 1, not 3.

## 4. Testing the machine

Before the critic sees new material, we test it on claims we have already labeled. The critic works blind. Where it disagrees with the hand labels, either side can be wrong, and the user settles it.

```mermaid
sequenceDiagram
    participant H as Hand labeler
    participant K as Critic agents (blind)
    participant M as compare.js
    participant U as User (final judge)

    H->>M: 25 labeled claims
    K->>M: 25 independent verdicts
    M->>U: agreement stats + ranked disagreements
    U->>H: corrections to hand labels
    U->>K: rule changes for critic v2
    Note over H,K: v1 labels stay frozen as a baseline
```

**Critic v1 results** (`runs/2026-10-30-v1/REPORT.md`):

| Measure | Result |
|---|---|
| Score rank correlation with hand labels | 0.54 |
| Same verdict | 7 of 25 |
| Critic bias vs hand | Harsher on novelty (−0.6) and survival (−0.4) |
| Citations | 125, about 5 per claim |

The critic overturned five hand labels with evidence. The clearest case: the hand label cited Autor, Levy & Murnane (2003) in support of a claim. The paper actually argues against it.

**Known weaknesses of critic v1:**
1. **Score compression.** It rarely gives a 3, so scores bunch between 2 and 6.
2. **Weak sources.** About a third of its citations are blogs, forums, or press coverage.
3. **Author leaks.** Searches surface the source's own pages, which breaks the blinding.
4. **Unchecked citations.** URLs come from search snippets and haven't been fetched to confirm them.
5. **Shared blind spots.** The critic and the hand labeler are the same model family, so agreement between them proves less than it seems.

## 5. Roadmap

| Step | Status |
|---|---|
| Concept and scoring rubric | Done |
| Pilot 1: 25 hand-labeled claims | Done |
| Critic v1 + blind comparison | Done |
| Adjudicate v1 disagreements | Next, needs the user |
| Critic v2: scale anchors, source-quality rule, citation fetch check, scoring reframings | Next |
| Critic from a different model family | Planned |
| Automated mining from long-tail sources | Planned |
| Automated rarity and synonym checks | Planned |
| Historical test: run on a 2008 web snapshot and check whether it finds ideas accepted later | Planned |
| Reader-facing "stumble" interface | Planned |

**The historical test is the real proof.** If the machine, run on an old snapshot, can't separate ideas that later proved true from ideas that stayed obscure because they were wrong, the design is refuted.

## 6. Repo map

| Path | What it is |
|---|---|
| `README.md` | Short intro and pilot 1 findings |
| `docs/OVERVIEW.md` | This document |
| `data/weinstein-2018.json` | Pilot 1: 25 hand-labeled claims |
| `score.js` | Ranks a dataset by N × C × S |
| `critic/prompt.md` | Critic instructions (v1) |
| `critic/schema.json` | Critic output format |
| `compare.js` | Compares a critic run with hand labels |
| `runs/2026-10-30-v1/` | First blind critic run + report |
