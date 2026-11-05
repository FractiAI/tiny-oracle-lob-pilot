/**
 * Transparent delivery sketch for Oracle-like LOB/JSON data.
 *
 * Conventional path: each "LOB" row stores a full JSON document.
 * Tiny path: one shared template + per-row delta; rebuild full document on read
 * (what a JDBC/external-LOB gateway would return to the client).
 *
 * Honesty: this is an in-process simulation of serialized LOB payloads.
 * It is not Oracle RDBMS integration, not tablespace compression, not Exadata.
 */

import { diffDelta, deepEqual, measureBytes, mergeDelta, shapesMatch } from './codec.mjs';

export function createConventionalLobStore() {
  /** @type {Map<string, object>} */
  const rows = new Map();
  return {
    name: 'conventional_full_lob',
    put(id, doc) {
      rows.set(id, structuredClone(doc));
    },
    get(id) {
      const doc = rows.get(id);
      if (!doc) throw new Error(`missing ${id}`);
      return structuredClone(doc);
    },
    ids() {
      return [...rows.keys()];
    },
    footprintBytes() {
      let n = 0;
      for (const doc of rows.values()) n += measureBytes(doc);
      return n;
    },
    rowCount() {
      return rows.size;
    },
  };
}

export function createTinyLobGateway({ templateId = 'oracle_lob_v1' } = {}) {
  let template = null;
  /** @type {Map<string, object>} */
  const deltas = new Map();

  return {
    name: 'tiny_template_delta_gateway',
    templateId,
    /** First matching doc becomes the shared LOB template (transparent write path). */
    put(id, doc) {
      if (!template) {
        template = structuredClone(doc);
        deltas.set(id, {});
        return { mode: 'seed_template' };
      }
      if (!shapesMatch(template, doc)) {
        // Fallback: store full doc as an exception row (honest when shape breaks).
        deltas.set(id, { __full: structuredClone(doc) });
        return { mode: 'full_exception' };
      }
      deltas.set(id, diffDelta(template, doc) || {});
      return { mode: 'delta' };
    },
    get(id, { clone = true } = {}) {
      const d = deltas.get(id);
      if (d === undefined) throw new Error(`missing ${id}`);
      if (d && d.__full) return clone ? structuredClone(d.__full) : d.__full;
      return mergeDelta(template, d, { clone });
    },
    ids() {
      return [...deltas.keys()];
    },
    footprintBytes() {
      let n = template ? measureBytes({ templateId, template }) : 0;
      for (const [id, d] of deltas) n += measureBytes({ id, delta: d });
      return n;
    },
    templateBytes() {
      return template ? measureBytes(template) : 0;
    },
    rowCount() {
      return deltas.size;
    },
    exceptionCount() {
      let n = 0;
      for (const d of deltas.values()) if (d && d.__full) n += 1;
      return n;
    },
  };
}

export function verifyExactRebuild(sourceDocs, gateway) {
  let ok = 0;
  for (const [id, doc] of sourceDocs) {
    const rebuilt = gateway.get(id);
    if (deepEqual(rebuilt, doc)) ok += 1;
    else return { pass: false, ok, failId: id };
  }
  return { pass: true, ok, failId: null };
}

export function timeMaterialize(gateway, ids, rounds = 5, { clone = true } = {}) {
  // Default clone:true — client-facing rebuild must hand back independent documents,
  // matching conventional get() which always copies.
  const times = [];
  for (let r = 0; r < rounds; r++) {
    const t0 = performance.now();
    let sink = 0;
    for (const id of ids) {
      const doc = gateway.get ? gateway.get(id, { clone }) : gateway.get(id);
      sink += measureBytes(doc);
    }
    times.push({ ms: performance.now() - t0, sink });
  }
  times.sort((a, b) => a.ms - b.ms);
  return {
    p50Ms: times[Math.floor(times.length / 2)].ms,
    bestMs: times[0].ms,
    worstMs: times[times.length - 1].ms,
  };
}
