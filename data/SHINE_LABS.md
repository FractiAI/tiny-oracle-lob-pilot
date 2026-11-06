# Where rhyming templates + nested vectors shine

Labs beyond JSON LOBs: **UI images**, **structural video**, **multidimensional pyramids**, **multi-agent worlds**. Always compared **after gzip** (and brotli) so we do not fool ourselves.

## Scoreboard

| Domain | Raw Tiny cut | Residual after gzip | Score |
|---|---:|---:|---|
| UI / dashboard images (shared layout) | 40.6% | **5.1%** | **WEAK_VS_COMPRESSION** |
| Structural video (HUD + changing pane) | 40.4% | **5.1%** | **WEAK_VS_COMPRESSION** |
| Nested vector pyramids — durable pack (high rhyme) | 4.6% | **4.6%** | **WEAK_VS_COMPRESSION** |
| Nested vector pyramids — selective working set (coarse-only task) | 99.5% | **99.5%** | **SHINES** |
| Nested vector pyramids — durable pack (low rhyme) | 4.8% | **4.6%** | **WEAK_VS_COMPRESSION** |
| Multi-agent shared world | 95.5% | **42.3%** | **SHINES** |
| Multi-agent (low shared structure) | 94.5% | **32%** | **PROMISING** |

## What shines

- **Nested vector pyramids — selective working set (coarse-only task)** — Selective reconstruction: ship/reference shared coarse template instead of every full pyramid. This is a DRAM/runtime win. (gzip residual **99.5%**)
- **Multi-agent shared world** — Naive stacks duplicate the world per agent; Tiny keeps one world + agent deltas. Big win when world >> agent state. (gzip residual **42.3%**)
- **Multi-agent (low shared structure)** — Still helps if world blob is duplicated; agent divergence matters less than world size. (gzip residual **32%**)

## What does not (enough)

- **UI / dashboard images (shared layout)** — residual **5.1%**. Organization (chrome/sidebar/footer) is stable; content pane changes. Tiny stores static regions once.
- **Structural video (HUD + changing pane)** — residual **5.1%**. Same as images over time. Frame-diff XOR is a codec-like baseline; Tiny is organizational layering.
- **Nested vector pyramids — durable pack (high rhyme)** — residual **4.6%**. As a stored blob, nested packing adds little once gzip runs — scales are already compressible.
- **Nested vector pyramids — durable pack (low rhyme)** — residual **4.6%**. When fine scales diverge, nested sharing weakens — compression catches more.

## Selective nested vectors (extra angle)

If a task only needs the coarse scale of a high-rhyme pyramid batch, Tiny working set is ~**99.5%** smaller than shipping full pyramids — a **runtime/selectivity** win, not only a storage win.

## Recommendation

Clearest shine after compression: multi-agent / multi-session shared-world state (stop duplicating the world). Clearest runtime shine: selective nested-vector working sets (coarse-only tasks). UI/video structural rhyme looks good raw but collapses under gzip — not a codec SKU. Still weak as generic photo/video or SQL storage.

Keep **DRAM/serving** as the lead product. Candidate *adjacent* bets (not SQL): **HUD/UI stream memory**, **shared-world multi-agent / multi-session state**, **selective multi-scale tensors**.

## Honesty

- Synthetic rasters and tensors — not H.264/AV1, not JPEG XL, not production game netcode.
- Gzip residual is the honesty bar; raw % alone is not enough to greenlight a SKU.
