# Tiny · Oracle-transparent LOB pilot

**Standalone simulation** of delivering Tiny Gateway benefits to Oracle-*like* data without changing what the client eventually reads.

> Not an Oracle product. Not JDBC/OCI. Not tablespace / ASM / Exadata measurement.  
> Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox · FractiAI / FractiSI research pilot.

## Idea

Oracle apps often store large repetitive JSON/XML **LOB** payloads (claims, policies, invoices) that share organization and differ in a few fields.

Transparent Tiny path:

1. **Write:** map document → shared template + per-row delta (or full exception if shape breaks).  
2. **Persist:** store template once + deltas (here: in-process; production would be external store / LOB codec).  
3. **Read:** rebuild full document before the client sees it.

Apps still receive ordinary documents. SQL dialect does not change in this sketch.

## Run

```bash
npm test
npm run pilot
```

Receipts:

- `data/pilot_report.json` — machine receipt  
- `data/FINDINGS.md` — plain-speak findings  

## Speakable X% / Y% (+ $)

Recommended: **~37% more concurrent sessions** + **~66% storage freed** (labeled).

Dollars: [`data/DOLLAR_CLAIMS.md`](./data/DOLLAR_CLAIMS.md) — `npm run dollars`.

Claims ledger: [`data/SPEAKABLE_CLAIMS.md`](./data/SPEAKABLE_CLAIMS.md).

## AWS scenario (extrapolation)

```bash
npm run pilot
npm run scenario:aws
```

See `data/AWS_SCENARIO.md` — illustrative freed S3 space from pilot ratios; read CPU generally rises on rebuild.

## Related

- Product kit: [tiny-footprint-workstation](https://github.com/FractiAI/tiny-footprint-workstation)  
- Engine paper shelf: Tiny Gateway · Rhyming Templates (ENGINE_SHELF #52)
