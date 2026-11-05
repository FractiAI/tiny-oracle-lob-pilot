# AWS scenario extrapolation (from pilot)

## Plain speak

If a cloud like AWS held a lot of repetitive claim-style JSON LOBs, the pilot ratios say **stored bytes can fall a lot** on the share of data that actually rhymes. That shows up as **freed object-store space** and lower storage line items.

**CPU and read performance do not automatically improve.** Near-duplicate rebuild used about **2×–3×** materialize time vs reading a full copy. Identical copies were about even. Expect **storage down, rebuild-path compute up** unless you cache hot rebuilds or rebuild offline.

Client egress stays full-sized if the gateway returns complete documents. Cold GET into the gateway can shrink when only template+delta is fetched.

## Illustrative scenarios

| Scenario | Pool | Eligible share | Pilot cut | Freed space | Approx S3 $ / mo saved* | Read CPU vs full copy |
|---|---:|---:|---:|---:|---:|---|
| Claims archive on S3 (high rhyme) | 500 GiB | 70% | 65.6% | **229.6 GiB** | ~$5.28 | 2.097× (more_cycles_per_read) |
| Mixed LOB lake (medium rhyme) | 500 GiB | 50% | 56.76% | **141.9 GiB** | ~$3.26 | 2.341× (more_cycles_per_read) |
| Mostly unique documents (low rhyme) | 500 GiB | 80% | 25.53% | **102.1 GiB** | ~$2.35 | 2.778× (more_cycles_per_read) |
| Identical snapshot copies | 200 GiB | 100% | 95.21% | **190.4 GiB** | ~$4.38 | 0.972× (improved_or_parity) |

\*Rough S3 Standard list assumption ($0.023/GiB-month). Not a quote.

## Honesty

- Not an AWS account measurement.
- Only the repetitive LOB/JSON slice; not general data lakes.
- Materialize× is pilot-host Node timing, not Lambda/EC2 production profiling.
