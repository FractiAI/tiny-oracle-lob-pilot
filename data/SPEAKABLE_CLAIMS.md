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





## $ saved from ~66% storage utilization (AWS datacenter)

Lead with storage-unit CapEx — not S3 retail:

| Pool | Freed TB | HDD CapEx avoided | NVMe CapEx avoided |
|---|---:|---:|---:|
| 10 PB region-class | 4,620 | **~$162k** | **~$2.4M – $4.9M** |
| 100 PB campus-class | 46,200 | **~$1.6M** | **~$24M – $49M** |

Full write-up: [`STORAGE_SAVINGS_DATACENTER.md`](./STORAGE_SAVINGS_DATACENTER.md).

## Extra $ earned per day (from +37% sessions)

Same fleet, demand fills the new slots:

| Fleet | **Extra earn / day** |
|---|---:|
| 8× H100 | **~$489** |
| 64× H100 | **~$3,910** |
| 512× H100 pod | **~$31,280** |

One breath: **~$3.9k extra per day** on 64× H100 (capacity proxy at ~$6.88/GPU-hr).  

Full note: [`EARNINGS_PER_DAY.md`](./EARNINGS_PER_DAY.md).


## Dollars (illustrative · CapEx first)

The earlier ~$106/mo figure was only a 10 TiB S3 Standard retail line — not datacenter economics and not storage-unit CapEx. Ignore it for facility-scale talk.

On an illustrative 512× H100 pod, ~37% more sessions is about $694,484/mo less on-demand GPU spend for the same concurrency (~$8,333,811/yr), or ~$951,443/mo of avoided expansion if you keep all 512.

At datacenter scale, ~66% freed on a 10 PB pool with 70% eligible rhyming LOBs is ~4,620 TB avoided. That is roughly $161,700 burdened nearline-HDD CapEx avoided, or $2,360,820–$4,851,000 if that capacity would have been enterprise NVMe (365–750/TB media × 1.4× burden). Annual carrying (tiered TCO band) on that freed slice is about $83,160/yr.

Full tables: [`DOLLAR_CLAIMS.md`](./DOLLAR_CLAIMS.md) · `npm run dollars`.
