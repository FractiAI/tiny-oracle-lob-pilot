# Oracle-transparent Tiny LOB pilot — findings

## Plain speak

We asked: if Oracle-like claim packets (JSON LOBs) shared one organization and only some fields changed, could a Tiny-style gateway store a template once, keep small deltas, and rebuild the full document on read — without changing what the client eventually sees?

**Yes, in this simulation.** Every workload rebuilt documents exactly (byte-for-byte JSON equality). Footprint fell a lot when documents nearly matched; it fell less when almost every leaf differed. Exact-identical LOBs rebuilt at about the same speed as cloning full copies; near-duplicate rebuilds cost about **2×–3×** materialize time for the storage win.

## Numbers (serialized bytes)

| Workload | Rows | Conventional | Tiny gateway | Reduction | Rebuild exact | Tiny materialize vs conventional |
|---|---:|---:|---:|---:|---|---:|
| identical_lobs_n1024 | 1024 | 588800 B | 28179 B | **95.21%** | yes | 0.972× |
| high_rhyme_claims_n1024 | 1024 | 666831 B | 229361 B | **65.6%** | yes | 2.097× |
| medium_rhyme_claims_n1024 | 1024 | 655864 B | 283601 B | **56.76%** | yes | 2.341× |
| low_rhyme_claims_n1024 | 1024 | 667766 B | 497279 B | **25.53%** | yes | 2.778× |
| high_rhyme_claims_n4096 | 4096 | 2667324 B | 919146 B | **65.54%** | yes | 2.079× |

Best cut in this run: **95.21%** on `identical_lobs_n1024`.

## What improved

- **Storage of repetitive LOBs:** large cuts when packets rhyme (same schema, few field changes) or are identical.
- **Transparency of the read:** client still gets a full rebuilt document; no SQL dialect change in this sketch.
- **Safety rail:** shape-break rows fall back to full storage instead of silent corruption.

## What did not improve / costs

- **Materialize time:** see the × column (Tiny p50 ÷ conventional p50). Values above 1× mean rebuild cost more than reading a full copy; below 1× means this host rebuilt faster than cloning full docs.
- **Low-rhyme corpus:** much smaller savings — Tiny is not magic compression for unrelated documents.
- **Not measured:** Oracle indexes, redo, block format, ASM, Exadata, or network round-trips.

## Honesty

- Not claimed: Oracle product integration
- Not claimed: Measured Oracle RDBMS CapEx or tablespace savings
- Not claimed: JDBC/OCI production proxy

Reproduce: `npm run pilot`
