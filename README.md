# Tiny Footprint Multi-Agent

### One shared world. Many agents.

**FractiSI** · empirical suite + product paper · powered by **Tiny Gateway™**

[![Product](https://img.shields.io/badge/product-Tiny%20Footprint%20Multi--Agent-c9a227)](./data/PRODUCT_TINY_FOOTPRINT_MULTI_AGENT.md)
[![Paper](https://img.shields.io/badge/paper-WP--FRACTISI--MULTI--AGENT-0b1424)](./docs/TINY_FOOTPRINT_MULTI_AGENT_2026-11.md)
[![Site](https://img.shields.io/badge/site-fractisi.vercel.app-0b1424)](https://fractisi.vercel.app)
[![Suite](https://img.shields.io/badge/suite-in--process%20JSON%20%2B%20gzip%20lab-444)](./data/MULTI_AGENT_EMPIRICAL.md)

> Operator: **SynthOBS Autonomous Agent · Syntheverse Sandbox** · FractiAI / FractiSI  
> Document ID: `WP-FRACTISI-TINY-FOOTPRINT-MULTI-AGENT-2026-11`

---

## What this repository is

The **lab home** for **Tiny Footprint Multi-Agent** — FractiSI’s flagship product.

Modern agent fleets default to an expensive habit: **copy the shared world into every agent**. Compression (gzip/zstd) shrinks each copy; it does **not** remove cross-agent duplication. This suite measures that gap and shows the Tiny Gateway remedy:

| Piece | Role |
|-------|------|
| **Rhyming template** | Shared world / organizational context — registered once |
| **Per-agent delta** | Pose, goals, inventory, local memory |
| **Nested vectors** | Multi-scale world parts; agents pull only what they need |
| **Selective reconstruct** | Full agent view on demand — peers do not each hold the world |

**Product name:** Tiny Footprint Multi-Agent  
**Primary runtime:** DRAM concurrency (more agents in the same memory budget)  
**Engine:** same Tiny Gateway spine as the [Workstation kit](https://github.com/FractiAI/tiny-footprint-workstation)  
**Not a new physics claim** — productization of shared-context concurrency.

Live product story: [fractisi.vercel.app/product](https://fractisi.vercel.app/product/) · paper on site: [/library/papers/tiny-footprint-multi-agent](https://fractisi.vercel.app/library/papers/tiny-footprint-multi-agent/)

---

## Quick start

**Requirements:** Node.js 18+

```bash
git clone https://github.com/FractiAI/tiny-oracle-lob-pilot.git
cd tiny-oracle-lob-pilot
npm test
npm run multi-agent   # flagship Multi-Agent sweep + receipts
npm run shine         # cross-domain honesty (images / video / nested / agents)
```

Receipts land under `data/`:

| Artifact | What it is |
|----------|------------|
| [`data/MULTI_AGENT_EMPIRICAL.md`](./data/MULTI_AGENT_EMPIRICAL.md) | Plain-speak Multi-Agent findings |
| [`data/multi_agent_empirical.json`](./data/multi_agent_empirical.json) | Machine receipt (sweep + flagship) |
| [`data/SHINE_LABS.md`](./data/SHINE_LABS.md) | After-gzip scoreboard across domains |
| [`docs/TINY_FOOTPRINT_MULTI_AGENT_2026-11.md`](./docs/TINY_FOOTPRINT_MULTI_AGENT_2026-11.md) | Product / research paper |
| [`data/PRODUCT_TINY_FOOTPRINT_MULTI_AGENT.md`](./data/PRODUCT_TINY_FOOTPRINT_MULTI_AGENT.md) | Product brief (no SKU dilution) |

---

## What the evidence shows

### Flagship Multi-Agent case (256 agents · large shared world)

| Metric | Value |
|--------|------:|
| Pack residual **after gzip** vs naive per-agent world copies | **~99.59%** |
| Resident shared-state cut (serialized proxy) | **~99.55%** |
| Agents in an 8 GiB budget (density arithmetic proxy) | **~1825×** vs naive copies |

### Sweep (36 cases · rhyme × agent count × world size)

Median pack residual after gzip: **~98.31%** · best **~99.9%** — when the shared world dominates per-agent state.

### Smaller-world shine lab (honesty peer)

Earlier multi-agent shared-world case: **~42%** residual after gzip (still shines). Lower shared structure: **~32%**. Selective nested-vector coarse-only tasks: **~99.5%** less runtime working-set bytes.

### Speakable line (labeled)

> **Tiny Footprint Multi-Agent:** one shared world for many agents — about **40%+ less** duplicated shared-context footprint even after gzip in smaller-world labs, and **much larger** cuts when the world dominates agent state — with a path to **order-of-magnitude more concurrent agents** in a fixed DRAM budget.

Always keep the “after gzip / shared-world duplication / lab proxy” qualifier in diligence rooms.

Full ledger: [`data/SPEAKABLE_CLAIMS.md`](./data/SPEAKABLE_CLAIMS.md) · dollars: [`data/DOLLAR_CLAIMS.md`](./data/DOLLAR_CLAIMS.md) · [`data/STORAGE_SAVINGS_DATACENTER.md`](./data/STORAGE_SAVINGS_DATACENTER.md)

---

## Product stance (do not dilute)

| Do | Don’t |
|----|-------|
| Lead with **Tiny Footprint Multi-Agent** | Four SKUs: DRAM / SQL / Networking / Agents |
| Keep **DRAM** as the engine inside Multi-Agent | Kill DRAM language |
| Phase-2 adapters: network fan-out, durable template store | Generic “beat zstd everywhere” marketing |

| Surface | Role under Multi-Agent |
|---------|------------------------|
| **DRAM (lead delivery)** | Concurrent agents on a host/pod — primary money and primary pain |
| **Networking** | Optional: fan-out without re-sending the world |
| **SQL / object** | Optional: durable template + delta instead of per-row world LOBs |

These are **adapters**, not separate products. Brief: [`data/PRODUCT_TINY_FOOTPRINT_MULTI_AGENT.md`](./data/PRODUCT_TINY_FOOTPRINT_MULTI_AGENT.md).

---

## Repository layout

```
tiny-oracle-lob-pilot/
├── src/media/multi_agent.mjs     ← shared-world vs duplicate packs
├── scripts/
│   ├── run_multi_agent_empirical.mjs   ← npm run multi-agent
│   ├── run_shine_labs.mjs              ← npm run shine
│   ├── run_pilot.mjs                   ← legacy LOB transparency pilot
│   └── …
├── data/                         ← receipts (md + json)
├── docs/
│   ├── TINY_FOOTPRINT_MULTI_AGENT_2026-11.md
│   └── HONESTY.md
├── tests/
└── package.json
```

---

## All scripts

```bash
npm test              # unit / contract tests
npm run multi-agent   # flagship Multi-Agent empirical suite
npm run shine         # images · video · nested vectors · multi-agent vs gzip
npm run pilot         # legacy Oracle-like LOB transparency pilot
npm run scenario:aws  # illustrative AWS/S3 extrapolation from LOB ratios
npm run dollars       # CapEx / session $ tables from speakable claims
npm run earnings      # daily earnings proxy from +sessions
```

---

## Legacy · Oracle-transparent LOB pilot

This repo began as a **simulation** of a transparent Tiny path for Oracle-*like* JSON/XML LOB payloads (claims, policies, invoices) that share organization and differ in a few fields. That path remains available as a **phase-2 durable-store adapter** under the Multi-Agent product — not a separate SKU.

```bash
npm run pilot
```

Findings: [`data/FINDINGS.md`](./data/FINDINGS.md) · honesty: [`docs/HONESTY.md`](./docs/HONESTY.md)

> Not an Oracle product. Not JDBC/OCI. Not tablespace / ASM / Exadata measurement.

High-rhyme LOB storage freed ≈ **~66%** (serialized). Exact-identical LOBs ≈ **~95%**. Materialize often costs **~2×–3×** vs reading a full copy — storage win ≠ free CPU.

---

## Honesty boundary

| Tier | Claims | Does not claim |
|------|--------|----------------|
| Architecture | Shared world template + per-agent deltas; selective reconstruct | That every multi-agent framework already ships this |
| Empirical (this suite) | JSON structured-state lab: pack size vs naive copies; gzip residual; resident-byte proxy; 8 GiB density arithmetic | Live GPU HBM RSS; production LangGraph/AutoGen bake-off; global internet measurement |
| Product | Tiny Footprint Multi-Agent names the commercial wedge | CapEx guarantee; replacement for H.264 / SQL HCC as general compressors |
| LOB pilot | Exact JSON rebuild; serialized footprint vs duplicated LOBs | Oracle CapEx, redo/undo, indexes, ASM, Exadata, JDBC/OCI |

Evidence classification: **digital lab + product architecture**. Not a fab campaign; not a third-party cloud attestation.

---

## Related

| Surface | Link |
|---------|------|
| **Product kit (Workstation)** | [FractiAI/tiny-footprint-workstation](https://github.com/FractiAI/tiny-footprint-workstation) |
| **Commercial site** | [fractisi.vercel.app](https://fractisi.vercel.app) |
| **Multi-Agent paper (site)** | [/library/papers/tiny-footprint-multi-agent](https://fractisi.vercel.app/library/papers/tiny-footprint-multi-agent/) |
| **Engine shelf** | Tiny Gateway · Rhyming Templates (ENGINE_SHELF #52) |
| **Contact / validation** | valetpru@gmail.com |

→ ∞^∞
