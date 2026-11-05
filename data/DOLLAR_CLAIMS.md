# Extra earnings per day (+37% sessions)

On a 64× H100 fleet, ~37% more concurrent sessions is about ~$3,910 extra per day if that capacity is sold at ~$6.88/GPU-hr equivalent; a 512-GPU pod is about ~$31,280/day.

See [`EARNINGS_PER_DAY.md`](./EARNINGS_PER_DAY.md).

---

# Speakable claims → dollars (illustrative AWS)

## One breath

About 37% more concurrent sessions and about 66% storage freed on rhyming LOBs.

On an illustrative 64× H100 on-demand fleet, ~37% more sessions means roughly $86,811/mo less GPU spend for the same concurrency (or ~$118,930/mo of avoided expansion if you keep all 64). On 10 TiB of S3 with 70% high-rhyme LOBs, ~66% freed is about $106/mo storage (~$1,275/yr).

## X · session capacity → GPU $

Identity: **~37% more sessions** ⇒ same concurrency needs only **1/1.37 ≈ 73%** of the GPUs ⇒ **~27% of that fleet’s GPU bill avoided**.

| Fleet | Monthly before | Monthly after (same concurrency) | **Monthly saved** | Annual saved | Same fleet · capacity value / mo |
|---|---:|---:|---:|---:|---:|
| 8× H100 (one p5.48xlarge) | $40,179 | $29,328 | **$10,851** | $130,216 | $14,866 |
| 64× H100 (eight p5.48xlarge) | $321,434 | $234,623 | **$86,811** | $1,041,726 | $118,930 |
| 8× A100 80GB-class | $20,031 | $14,621 | **$5,410** | $64,919 | $7,412 |

Qualified KV-only (~6.25× sessions / ~84% KV cut, weights excluded):

| Fleet | Monthly saved if concurrency KV-bound only |
|---|---:|
| 8× H100 (one p5.48xlarge) | $33,751 |
| 64× H100 (eight p5.48xlarge) | $270,004 |
| 8× A100 80GB-class | $16,826 |

## Y · storage freed → storage $

| Scenario | Freed | Monthly | Annual |
|---|---:|---:|---:|
| 500 GiB S3 · 70% high-rhyme LOBs · 66% cut | 231 GiB | **$5** | $64 |
| 10 TiB S3 · 70% high-rhyme LOBs · 66% cut | 4620 GiB | **$106** | $1,275 |
| 50 TiB S3 · 70% high-rhyme LOBs · 66% cut | 23100 GiB | **$531** | $6,376 |
| 10 TiB EBS gp3-class · 70% eligible · 66% cut | 4620 GiB | **$370** | $4,435 |

## Rates used (illustration only)

- H100: **$6.88/GPU-hr** (p5.48xlarge ~$55.04/hr ÷ 8)
- A100 80GB-class: **$3.43/GPU-hr**
- S3 Standard: **$0.023/GiB-mo** · EBS gp3-class: **$0.08/GiB-mo**
- Hours/month: **730**

## Honesty

- Not an AWS invoice, Private Pricing, or Savings Plan.
- Session $ assumes concurrency was memory-bound in the way the X% claim states.
- Storage $ applies only to the eligible rhyming LOB share.
- Rebuild CPU often rises in the LOB pilot — not subtracted here.
