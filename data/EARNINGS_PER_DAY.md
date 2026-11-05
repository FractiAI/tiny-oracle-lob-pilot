# Extra earnings per day from ~37% more concurrent sessions — **datacenter scale**

## Identity

Same fleet, demand fills the new slots:

**extra $/day ≈ 37% × GPUs × $6.88/GPU-hr × 24**

(Illustrative on-demand H100 capacity proxy — p5.48xlarge ÷ 8. Not private pricing.)

## Lead table

| Fleet | Baseline capacity value / day | **Extra earn / day (+37%)** | Extra / month | Extra / year |
|---|---:|---:|---:|---:|
| 512× H100 (pod) | $84,541 | **$31,280** | $952,095 | $11,425,142 |
| 2,048× H100 (cluster) | $338,166 | **$125,121** | $3,808,381 | $45,700,566 |
| 8,192× H100 (AZ / superpod slice) | $1,352,663 | **$500,485** | $15,233,522 | $182,802,265 |
| 16,384× H100 (datacenter hall-class) | $2,705,326 | **$1,000,971** | $30,467,044 | $365,604,530 |
| 65,536× H100 (multi-hall / campus-class) | $10,821,304 | **$4,003,883** | $121,868,177 | $1,462,418,119 |

## One breath

At datacenter scale, ~37% more concurrent sessions on a **16,384× H100** hall-class fleet is about **$1,000,971/day** extra if that capacity sells ($365,604,530/yr). A **65,536× H100** campus-class fleet is about **$4,003,883/day**. Same concurrency with fewer GPUs avoids about **$22,223,497/mo** on the 16k fleet.

## Same concurrency · GPU bill avoided (datacenter fleets)

If you hold concurrency flat and shrink the fleet by ~27% (1/1.37):

| Fleet | **GPU $ saved / month** | / year |
|---|---:|---:|
| 512× H100 (pod) | **$694,484** | $8,333,811 |
| 2,048× H100 (cluster) | **$2,777,937** | $33,335,245 |
| 8,192× H100 (AZ / superpod slice) | **$11,111,748** | $133,340,981 |
| 16,384× H100 (datacenter hall-class) | **$22,223,497** | $266,681,961 |
| 65,536× H100 (multi-hall / campus-class) | **$88,893,987** | $1,066,727,846 |

## Pair with storage CapEx (66% freed)

See [`STORAGE_SAVINGS_DATACENTER.md`](./STORAGE_SAVINGS_DATACENTER.md) — e.g. 10 PB → ~$2.4M–$4.9M NVMe CapEx avoided.

## Honesty

- Fleet sizes are **illustrative datacenter classes**, not a named AWS region headcount.
- Earnings require demand for the extra concurrency.
- $6.88/GPU-hr is a public list proxy, not AWS private/spot revenue.
