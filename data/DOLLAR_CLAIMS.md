# Speakable claims → dollars

## Pair

- **~37% more concurrent sessions** → datacenter extra earn / day: **~$1.0M/day** on 16,384× H100 (see [`EARNINGS_PER_DAY.md`](./EARNINGS_PER_DAY.md)).
- **~66% storage freed** → datacenter **storage-unit CapEx avoided**: see [`STORAGE_SAVINGS_DATACENTER.md`](./STORAGE_SAVINGS_DATACENTER.md).

## $ saved · 66% storage utilization (AWS datacenter scale)

**Do not use the old ~$106/mo S3 retail line for datacenter talk.**

On a **10 PB** region-class pool (70% eligible rhyming LOBs):

| | |
|---|---|
| Freed | **4,620 TB** |
| Nearline HDD CapEx avoided (burdened) | **~$162k** |
| Enterprise NVMe CapEx avoided (burdened) | **~$2.4M – $4.9M** |
| ≈ 30 TB drives avoided | **~154** |
| Tiered carrying avoided | **~$83k/yr** (~$228/day) |

On a **100 PB** multi-AZ / campus class pool: **~$1.6M** HDD-class or **~$24M – $49M** NVMe-class CapEx avoided.

On a 64× H100 fleet, ~37% more concurrent sessions is about ~$3,910 extra per day if that capacity is sold at ~$6.88/GPU-hr equivalent; a 512-GPU pod is about ~$31,280/day.

---

## Correction

The earlier ~$106/mo figure was only a 10 TiB S3 Standard retail line — not datacenter economics and not storage-unit CapEx. Ignore it for facility-scale talk.

## One breath

About 37% more concurrent sessions and about 66% storage freed on rhyming LOBs.

At datacenter scale, ~37% more concurrent sessions on a **16,384× H100** hall-class fleet is about **$1,000,971/day** extra if that capacity sells ($365,604,530/yr). A **65,536× H100** campus-class fleet is about **$4,003,883/day**. Same concurrency with fewer GPUs avoids about **$22,223,497/mo** on the 16k fleet.

At datacenter scale, ~66% freed on a 10 PB pool with 70% eligible rhyming LOBs is ~4,620 TB avoided. That is roughly $161,700 burdened nearline-HDD CapEx avoided, or $2,360,820–$4,851,000 if that capacity would have been enterprise NVMe (365–750/TB media × 1.4× burden). Annual carrying (tiered TCO band) on that freed slice is about $83,160/yr.

## Y · storage freed → **storage-unit CapEx** (lead metric)

Freed TB = pool × **70% eligible** × **66% cut**. Burdened CapEx = freed TB × media $/TB × **1.4×** (chassis/controllers/spares sketch).

| Pool | Freed TB | Nearline HDD CapEx avoided* | NVMe CapEx avoided* | NVMe stressed CapEx* | Tiered TCO avoided / yr |
|---|---:|---:|---:|---:|---:|
| 100 TB rack slice | 46.2 | **$1,617** | $23,608 | $48,510 | $832 |
| 1 PB hall | 462 | **$16,170** | $236,082 | $485,100 | $8,316 |
| 10 PB region slice | 4,620 | **$161,700** | $2,360,820 | $4,851,000 | $83,160 |
| 100 PB multi-AZ class | 46,200 | **$1,617,000** | $23,608,200 | $48,510,000 | $831,600 |

\*Burdened. Media-only at $25/TB HDD · $365/TB NVMe · $750/TB stressed NVMe.

| Pool | ≈ 30 TB drives avoided (media count) |
|---|---:|
| 100 TB rack slice | ~1.5 |
| 1 PB hall | ~15.4 |
| 10 PB region slice | ~154 |
| 100 PB multi-AZ class | ~1540 |

### Why S3 $/mo looked “way off”

S3 Standard ~$0.023/GiB-mo on 10 TiB is a **retail object bill**, not the cost of buying and powering storage units in a hall. Hyperscalers care about **drives, enclosures, racks, power, and deferred CapEx**. Lead with CapEx-avoided / drives-avoided; keep S3 retail as a footnote for customer object bills only.

## X · sessions → GPU $

| Fleet | Monthly saved (same concurrency) | Annual | Capacity value if keep fleet / mo |
|---|---:|---:|---:|
| 8× H100 (one p5.48xlarge) | **$10,851** | $130,216 | $14,866 |
| 64× H100 (eight p5.48xlarge) | **$86,811** | $1,041,726 | $118,930 |
| 512× H100 (datacenter pod-scale) | **$694,484** | $8,333,811 | $951,443 |
| 8× A100 80GB-class | **$5,410** | $64,919 | $7,412 |

## Honesty

- Not an AWS or Oracle procurement quote; flash $/TB moved violently in 2026 reporting.
- Assumes 70% of the named pool is high-rhyme LOB/JSON — measure your corpus before using the $.
- CapEx avoided only lands if you **buy fewer units** or defer a refresh — not if the hall stays full of empty drives.
- Rebuild CPU cost not netted against these dollars.
