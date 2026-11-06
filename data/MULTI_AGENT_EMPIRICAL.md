# Tiny Footprint Multi-Agent — empirical findings

Flagship multi-agent case (256 agents, shared world): ~99.59% less pack size after gzip, ~99.55% less estimated resident shared-state bytes, ~182436.6% more agents in an 8 GiB budget (1825.37× density).

## Flagship

| Metric | Value |
|---|---|
| Agents | 256 |
| World map length | 8192 |
| Pack residual after gzip | **99.59%** |
| Resident shared-state cut (proxy) | **99.55%** |
| More agents in 8 GiB (proxy) | **182436.6%** (1825.37×) |

## Sweep (median residual after gzip)

Across 36 cases (rhyme × agent count × world size): median residual **98.31%**, best **99.9%**.

## Honesty

- In-process JSON + gzip lab — not production agent runtime, not GPU HBM attestation.
- Resident bytes are serialized-size proxies for structuredClone-style duplication, not RSS from a live engine.
- 8 GiB concurrency is a density arithmetic proxy.
