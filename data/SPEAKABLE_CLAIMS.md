# Speakable claims · X% more sessions · Y% storage freed

Use these as **labeled** lines. They come from measured ratios + a capacity identity:  
if concurrency is limited by memory pile \(M\), and Tiny cuts that pile by fraction \(r\), then  
**more sessions % ≈ \(1/(1-r) - 1\) × 100**.

## Recommended headline pair

> **~37% more concurrent sessions** when the box is limited by **total resident model + KV memory** (weights counted),  
> and **~66% storage freed** on **repetitive structured LOB/JSON** that shares organization (high-rhyme pilot).

| Knob | Number | Basis | Must say |
|---|---:|---|---|
| **X** more concurrent sessions | **~37%** (1.37×) | Open re-measure: ~**27%** resident cut **with weights** → \(1/0.73 - 1\) | Only when concurrency is bound by that total resident pile |
| **Y** storage freed | **~66%** | `tiny-oracle-lob-pilot` high-rhyme claims LOBs | Serialized LOB/JSON simulation — not full Oracle/AWS account |

## Stronger lines (use only with the qualifier)

| Line | Number | Qualifier |
|---|---:|---|
| More sessions on **KV-only** pile | **~525%** (6.25×) | ~**84%** KV residency cut **excluding weights**; weights must not be the limiter |
| Storage freed on **identical** LOBs | **~95%** | Exact duplicate documents; rare as a whole lake |
| Storage freed on **low-rhyme** LOBs | **~26%** | Mostly different leaves — weak Tiny case |

## What not to smash together

- **Y% storage freed** (durable LOB/S3/Oracle-like bytes) does **not** by itself equal **X% more GPU sessions**.  
  Sessions scale from **accelerator/host resident memory**; LOB storage scales from **durable document bytes**.
- Do **not** say “80% more sessions” or “80% cloud storage freed” as a universal AWS/Oracle guarantee.
- Read rebuild CPU in the LOB pilot was often **worse** (~2×–3× materialize) — storage win ≠ free CPU.

## One-breath versions

**Default (honest lead):**  
“About **37% more concurrent sessions** on weight-counted resident memory, and about **66% storage freed** on repetitive rhyming LOB/JSON.”

**KV-bound fleet (qualified):**  
“Up to about **6× concurrent sessions** on the **KV-resident** pile alone (~84% KV cut), when model weights are not what runs out first.”

Reproduce sessions math from serving receipts; storage from `npm run pilot` in this repo.

## Dollars (illustrative)

On an illustrative 64× H100 on-demand fleet, ~37% more sessions means roughly $86,811/mo less GPU spend for the same concurrency (or ~$118,930/mo of avoided expansion if you keep all 64). On 10 TiB of S3 with 70% high-rhyme LOBs, ~66% freed is about $106/mo storage (~$1,275/yr).

Full tables: [`DOLLAR_CLAIMS.md`](./DOLLAR_CLAIMS.md) · `npm run dollars`.
