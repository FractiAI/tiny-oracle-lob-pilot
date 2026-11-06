# Is a SQL / networking Tiny product worth it?

Decision brief for Player 1. Empirically compared **Tiny template+delta** vs **gzip/brotli** on the same claim-LOB corpus (`n=1024`). Receipt: `data/tiny_vs_compression.json`.

## Bottom line

| Surface | Meaningful beyond compression? | Worth a product now? |
|---|---|---|
| **DRAM / AI serving (current)** | **Yes** — live resident KV/working set is not “gzip the database” | **Yes — keep investing** |
| **Database durable storage** | **Weak** — after gzip, Tiny’s extra cut is usually ~**0–14%**, sometimes **worse** than brotli alone | **No as a lead product** |
| **Networking** | **Weak** — wire save after gzip is tiny; rebuild CPU usually **hurts latency** | **No as a lead product** |

## What the numbers say

### Storage (raw vs after compression)

| Corpus | Tiny cut (uncompressed) | Gzip alone on full docs | **Tiny residual AFTER gzip** | After brotli |
|---|---:|---:|---:|---:|
| Identical LOBs | ~95% | ~99% | ~47% | ~36% |
| High rhyme (target case) | ~67% | ~98% | **~14%** | **−11%** (Tiny+brotli loses) |
| Medium rhyme | ~58% | ~97% | **~14%** | ~0% |
| Low rhyme | ~28% | ~94% | **~9%** | ~2% |

Reading: compression already harvests most of the redundancy Tiny sees in structured JSON. The **dramatic % cuts in the earlier pilot were mostly pre-compression**. Against a DB that already runs HCC / Advanced Compression / zstd / columnar dictionary encoding, expect **single-digit to low-teens** incremental bytes at best — not another 66%.

### Networking

For a high-rhyme 1024-row batch after gzip:

- Wire time saved @ 1 Gbps: **~0.02 ms**
- Wire time saved @ 10 Gbps: **~0.002 ms**
- Tiny rebuild CPU extra (order of magnitude from prior pilot): **~9 ms**

So on normal datacenter links, **latency gets worse**, not better. Network *utilization* can drop a little (~10–14% residual after gzip on rhyming batches), but that is not a product-scale story next to existing TLS+gzip/brotli, protobuf, and columnar wire formats.

### Latency verdict

| Path | Likely effect of adding Tiny gateway |
|---|---|
| DB read (cold, compressed pages) | Neutral to worse (decompress + rebuild) |
| DB read (hot cache) | Worse (extra CPU) |
| Network RPC with gzip | Bandwidth: small win · Latency: usually lose |
| AI serving DRAM / KV residency | **Win** (this is the DRAM product) |

## Why DRAM is different

Compression algorithms shrink **bytes at rest or on the wire**. Tiny Footprint’s strong claim is **concurrent resident working set** next to inference — GPUs/hosts run out of HBM/DRAM holding duplicated live state. You cannot “gzip the KV cache” the way you gzip a tablespace and call it the same product. That is why **~37% more sessions (weights counted)** stays the lead commercial wedge.

## When DB/network *might* still be worth a thin experiment later

Only if one of these is true (none are proven at product grade yet):

1. Customer corpus is **repetitive but poorly compressed** (custom binary LOBs, already-encrypted payloads, or compression disabled).
2. You can **ship the template once** to many readers (fan-out) where gzip-per-message cannot share a dictionary across connections.
3. The win is **application semantics** (exact organizational rebuild, rhyme routing), not CapEx bytes.

Even then: treat as **adapters under the DRAM product**, not a second SKU.

## Recommendation

**Do not add a SQL storage product or networking SKU now.**  
Keep FractiSI focused on **Tiny Footprint memory / serving**. Optionally park a one-page “compression residual” lab in the pilot repo; revisit DB/net only if a design partner has an uncompressed or cross-session fan-out pain that columnar/zstd does not already cover.

## Honesty

- Lab = synthetic claim JSON + Node gzip/brotli, not Oracle HCC or AWS Nitro measured.
- Residual % will move with codec, block size, and encryption.
- Identical-doc residual looks better but gzip alone already removed ~99% of those bytes.
