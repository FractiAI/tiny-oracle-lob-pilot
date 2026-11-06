# Tiny Footprint Multi-Agent

**Product brief** · FractiSI / Tiny Footprint family  
**Lab basis:** `npm run multi-agent` · `data/MULTI_AGENT_EMPIRICAL.md` ·  shared-world multi-agent pack still cut **~42% after gzip** (and ~32% when agent state diverges more) vs naive per-agent world copies · `npm run shine` · `data/SHINE_LABS.md`

---

## One sentence

**Tiny Footprint Multi-Agent** keeps one shared world (or shared context) for many agents — and only the per-agent difference — so concurrent agents stop paying full-world rent in memory, on the wire, and in storage.

## The problem (why this is the cloud)

Modern AI is not one chat, one process. It is **many agents** — tools, workers, simulators, copilots, services — running across sessions, hosts, and regions, each needing the **same organizational context**:

- shared tools / policies / environment maps  
- shared retrieval corpora or “world” state  
- shared system prompts, schemas, playbooks  
- shared simulation or game state  

Today’s default is expensive and dumb: **copy the world into every agent**. That burns:

| Layer | What gets duplicated |
|---|---|
| **DRAM / HBM** | Live resident world × agent count (concurrency killer) |
| **Networking** | Fan-out messages that re-embed the world |
| **SQL / object storage** | Per-row LOBs that each store the same world blob |

Compression (gzip/zstd/HCC) helps **inside one copy**. It does **not** remove **cross-agent copies**. That is the gap Tiny closes.

## What the product is

| Piece | Role |
|---|---|
| **Rhyming template** | The shared world / shared organizational context (registered once) |
| **Nested vectors** | Multi-scale world parts; agents pull only the scales they need |
| **Per-agent delta** | Pose, inventory, goals, local memory, session difference |
| **Selective reconstruct** | Rebuild a full agent view on demand — without every peer holding a full world |

**Edition name:** Tiny Footprint Multi-Agent  
**Engine:** same Tiny Gateway spine as Tiny Footprint (Workstation / Server / Cloud)  
**Not a new physics claim** — a productization of shared-context concurrency.

## Who buys it

1. **AI platforms / agent runtimes** — LangGraph-class, multi-agent orchestrators, tool-using fleets  
2. **Inference / session hosts** — many concurrent agents on one box or pod (DRAM-bound)  
3. **Simulation / digital twin / games** — many actors, one world  
4. **Enterprise agent ops** — many workers sharing policy + knowledge packs  

## Proof we already have (labeled)

| Evidence | Number | Meaning |
|---|---:|---|
| Multi-agent shared world vs naive per-agent world copies | **~42% residual after gzip** | Compression alone leaves a large cross-copy tax |
| Same pattern, lower shared structure | **~32% after gzip** | Still meaningful when agents diverge more |
| Selective nested pyramid (coarse-only task) | **~99.5% less runtime bytes** | Nested vectors shine when agents don’t need the full stack |
| Serving / weight-counted concurrent sessions | **~37% more sessions** | Same family: concurrency from shared resident state |

Honesty: shine labs are synthetic; not a claim that “the entire internet” is already instrumented. The **pattern** (global multi-agent cloud) is the market; the **receipt** is the lab.

## Speakable line

> **Tiny Footprint Multi-Agent:** one shared world for many agents — about **40%+ less duplicated shared-context footprint even after gzip**, and a path to **~37% more concurrent agent sessions** when memory is the limiter.

(Always keep the “after gzip / shared-world duplication” qualifier in diligence rooms.)

## Surfaces (do not split into three companies)

| Surface | Role under Multi-Agent |
|---|---|
| **DRAM (lead delivery)** | Concurrent agents on a host/pod — primary money and primary pain |
| **Networking** | Optional: fan-out without re-sending the world |
| **SQL / object** | Optional: durable template + delta instead of per-row world LOBs |

These are **adapters**, not separate products.

---

## Strategy: only Multi-Agent, or DRAM too?

### Recommendation: **one product, one name wedge — do not dilute**

| Option | Verdict |
|---|---|
| Ship **only** “DRAM Tiny Footprint” and soft-pedal agents | Too abstract; harder story |
| Ship **Multi-Agent** and **DRAM** and **SQL** and **Networking** as four SKUs | Dilution; four sales motions; weak |
| Ship **Tiny Footprint Multi-Agent** as the **flagship product**, with DRAM as the **engine/runtime**, SQL/net as **later adapters** | **Do this** |

### Why not “Multi-Agent only” and kill DRAM language?

Because **Multi-Agent’s hardest money is still DRAM**: agents die on resident memory long before they die on gzip’d disk. If you market only “storage/network after gzip,” you undersell the concurrency ($/day) story. If you market only “DRAM” without agents, you undersell the cloud narrative.

**Framing that holds both without dilution:**

> **Product:** Tiny Footprint Multi-Agent  
> **Mechanism:** Tiny Gateway rhyming templates + nested vectors + selective reconstruct  
> **Primary runtime:** DRAM beside the agent host / serving stack  
> **Secondary:** network fan-out and durable template stores (phase 2)

So: **you need the DRAM capability inside this product**, not a second competing SKU. You do **not** need a separate SQL product or networking product to start.

### Phase plan

1. **Now — Multi-Agent + DRAM**  
   Workstation / Server kit: register shared world template, spawn N agents as deltas, measure resident set + gzip’d pack residual, concurrency density.

2. **Next — design partners**  
   Agent orchestrators and inference hosts; prove fewer GPUs / more agents for same world.

3. **Later — adapters**  
   Network: shared-context bus. SQL/object: template+delta LOB store. Only if partners pull.

---

## What we are not claiming

- Not that Tiny replaces H.264, AV1, or JPEG  
- Not that Tiny beats zstd on arbitrary SQL tables  
- Not that the lab equals a measured global internet deployment  
- Not CapEx guarantees without partner measurement  

## Close

The multi-agent shared world **is** the cloud-shaped story. Make **Tiny Footprint Multi-Agent** the product name customers hear. Keep **DRAM** as the engine that makes concurrency pay. Do **not** dilute into parallel SQL/networking SKUs until Multi-Agent is selling.

→ ∞^∞
