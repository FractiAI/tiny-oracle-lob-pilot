/**
 * Minimal template + nested-delta codec for the Oracle LOB pilot.
 * Same idea as Tiny Gateway expression encoding: shared pattern once, field deltas, exact rebuild.
 */

export function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function measureBytes(obj) {
  return Buffer.byteLength(JSON.stringify(obj), 'utf8');
}

/** Deep field-level delta: nested objects merge; arrays/leaves replace. */
export function diffDelta(base, expr) {
  if (deepEqual(base, expr)) return undefined;
  if (
    base &&
    expr &&
    typeof base === 'object' &&
    typeof expr === 'object' &&
    !Array.isArray(base) &&
    !Array.isArray(expr)
  ) {
    const delta = {};
    const keys = new Set([...Object.keys(base), ...Object.keys(expr)]);
    for (const k of keys) {
      if (!(k in expr)) {
        delta[k] = { __missing: true };
        continue;
      }
      if (!(k in base)) {
        delta[k] = structuredClone(expr[k]);
        continue;
      }
      const d = diffDelta(base[k], expr[k]);
      if (d !== undefined) delta[k] = d;
    }
    return Object.keys(delta).length ? delta : undefined;
  }
  return structuredClone(expr);
}

export function mergeDelta(base, delta, { clone = true } = {}) {
  const copy = (v) => (clone ? structuredClone(v) : v);
  if (delta === undefined) return copy(base);
  if (delta && typeof delta === 'object' && delta.__missing === true) return undefined;
  if (
    base &&
    delta &&
    typeof base === 'object' &&
    typeof delta === 'object' &&
    !Array.isArray(base) &&
    !Array.isArray(delta)
  ) {
    const out = clone ? structuredClone(base) : { ...base };
    for (const k of Object.keys(delta)) {
      const merged = mergeDelta(base[k], delta[k], { clone });
      if (merged === undefined && delta[k] && delta[k].__missing) delete out[k];
      else out[k] = merged;
    }
    return out;
  }
  return copy(delta);
}

export function shapesMatch(a, b) {
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b);
  if (typeof a !== 'object') return true;
  const ak = Object.keys(a).sort();
  const bk = Object.keys(b).sort();
  if (ak.length !== bk.length) return false;
  for (let i = 0; i < ak.length; i++) {
    if (ak[i] !== bk[i]) return false;
    if (!shapesMatch(a[ak[i]], b[bk[i]])) return false;
  }
  return true;
}
