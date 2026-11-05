# Extra earnings per day from ~37% more concurrent sessions

**Claim:** ~**37% more concurrent sessions** when the box is limited by weight-counted resident memory.

**Earning identity (same fleet, demand absorbs the extra slots):**  
extra daily revenue ≈ **37% × what that fleet already earns per day from sessions**.

Two ways to put a dollar on that:

1. **Capacity proxy (cloud / infra):** treat sellable GPU time as the meter — on-demand H100 ≈ **$6.88/GPU-hr**. Extra earn/day = `0.37 × GPUs × $6.88 × 24`.
2. **Session ASP (app / API):** extra earn/day = `0.37 × baseline_sessions_per_day × $/session`.

## Lead table — capacity proxy (same GPUs, +37% sessions sold)

| Fleet | Baseline capacity value / day | **Extra earn / day (+37%)** | Extra / month (~30.4 d) |
|---|---:|---:|---:|
| 1× H100 | $165 | **~$61** | ~$1.9k |
| 8× H100 (one p5.48xlarge) | $1,321 | **~$489** | ~$15k |
| 64× H100 | $10,567 | **~$3,910** | ~$119k |
| 512× H100 pod | $84,536 | **~$31,280** | ~$952k |

One breath: **a 64× H100 fleet earns about ~$3.9k extra per day** if the +37% concurrent sessions are sold at the same effective GPU-capacity price; a **512-GPU pod ~$31k/day**.

## Session ASP examples (64× H100)

Illustrative baseline: 4 session-slots / GPU-hr → ~6,144 sessions/day before Tiny → **+~2,273 sessions/day** at +37%.

| ASP $/session | Extra sessions / day | **Extra earn / day** |
|---:|---:|---:|
| $0.05 | ~2,273 | **~$114** |
| $0.10 | ~2,273 | **~$227** |
| $0.25 | ~2,273 | **~$568** |
| $1.00 | ~2,273 | **~$2,273** |

Plug in your real ASP: `extra_$/day = 0.37 × your_sessions_per_day × your_$/session`.

## Honesty

- Requires **demand** for the extra concurrency — empty slots are not earnings.
- $6.88/GPU-hr is an illustrative public on-demand list proxy (p5.48xlarge ÷ 8), not private/spot revenue.
- This is **revenue / capacity value**, not GPU cost savings (those are the “fewer GPUs for same concurrency” tables).
- Not an AWS invoice.

Reproduce: `npm run dollars` (see also `data/DOLLAR_CLAIMS.md`).
