# $ saved from ~66% storage utilization cut — AWS datacenter scale

## Correction

The old **~$106/mo** line was a **10 TiB S3 Standard retail** footnote. It is **not** what an AWS-scale datacenter saves on storage units. Lead with **CapEx avoided / drives deferred** below.

## Identity

**Freed TB** = pool × **70% eligible** rhyming LOBs × **66% cut**.

**Burdened CapEx avoided** = freed TB × media $/TB × **1.4×** (chassis, controllers, networking, spares sketch).

Media bands (illustrative, not a BOM quote): nearline HDD **$25/TB** · enterprise NVMe **$365/TB** · stressed-2026 NVMe **$750/TB**.

## Lead table — CapEx / units avoided

| AWS-scale pool | Freed TB | Nearline HDD CapEx avoided | NVMe CapEx avoided | Stressed NVMe CapEx | ≈ 30 TB drives avoided | Tiered carrying avoided / yr |
|---|---:|---:|---:|---:|---:|---:|
| 100 TB rack slice | 46.2 | **$1,617** | $23,608 | $48,510 | ~1.5 | $832 |
| 1 PB (AWS hall / AZ slice) | 462 | **$16,170** | $236,082 | $485,100 | ~15.4 | $8,316 |
| 10 PB (region-class storage) | 4,620 | **$161,700** | $2,360,820 | $4,851,000 | ~154 | $83,160 |
| 100 PB (multi-AZ / campus class) | 46,200 | **$1,617,000** | $23,608,200 | $48,510,000 | ~1540 | $831,600 |

## One breath

On a **10 PB** region-class pool with 70% eligible rhyming LOBs, ~66% freed is **4,620 TB** — about **$161,700** burdened nearline CapEx avoided, or **$2,360,820–$4,851,000** if that capacity would have been enterprise NVMe (~154× 30 TB drives). Annual tiered carrying on that slice: ~**$83,160/yr** (~**$228/day**).

For a **100 PB** multi-AZ / campus class pool: **$1,617,000** HDD-class CapEx avoided, or **$23,608,200–$48,510,000** NVMe-class.

## Daily carrying saved (tiered TCO band @ $18/TB-year)

| Pool | Freed TB | **$/day carrying avoided** | $/yr |
|---|---:|---:|---:|
| 100 TB rack slice | 46.2 | **$2** | $832 |
| 1 PB (AWS hall / AZ slice) | 462 | **$23** | $8,316 |
| 10 PB (region-class storage) | 4,620 | **$228** | $83,160 |
| 100 PB (multi-AZ / campus class) | 46,200 | **$2,278** | $831,600 |

## Honesty

- Not an AWS private BOM or region inventory.
- Only applies to the eligible rhyming LOB/JSON share (here assumed 70% of the named pool) — measure the corpus.
- CapEx lands when you **buy fewer units or defer refresh**, not when empty drives stay racked.
- Flash $/TB was volatile in 2026 public reporting; bands will move.
