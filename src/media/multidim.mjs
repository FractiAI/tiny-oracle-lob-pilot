/**
 * Multidimensional / nested-vector labs.
 * - Octave pyramid: shared coarse structure + per-item fine deltas
 * - Batch of nested feature maps with selective working-set reconstruction
 * - Multi-agent world: shared scene template + per-agent state deltas
 */

function f32buf(arr) {
  return Buffer.from(Float32Array.from(arr).buffer);
}

function measureF32(arr) {
  return arr.length * 4;
}

/** Build a 3-level pyramid [coarse, mid, fine] for one sample. */
export function buildPyramid(seed, { rhyme = 'high' } = {}) {
  let s = seed >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s / 0xffffffff) * 2 - 1;
  };
  const coarse = Array.from({ length: 16 }, () => rand());
  const mid = Array.from({ length: 64 }, (_, i) => coarse[i % 16] * 0.5 + rand() * (rhyme === 'high' ? 0.05 : 0.5));
  const fine = Array.from({ length: 256 }, (_, i) => mid[i % 64] * 0.5 + rand() * (rhyme === 'high' ? 0.08 : 0.8));
  return { coarse, mid, fine };
}

export function packPyramidsConventional(items) {
  const parts = items.map((p) => ({
    coarse: p.coarse,
    mid: p.mid,
    fine: p.fine,
  }));
  return Buffer.from(JSON.stringify(parts));
}

/**
 * Tiny nested: one shared coarse(+optional mid) template; per-item fine (+ mid residual).
 * Selective reconstruct can fetch only the scales a task needs.
 */
export function packPyramidsTiny(items) {
  const template = {
    coarse: items[0].coarse,
    mid: items[0].mid,
  };
  const deltas = items.map((p, i) => {
    if (i === 0) return { i, fine: p.fine, midDelta: null };
    const midDelta = p.mid.map((v, j) => v - template.mid[j]);
    return { i, fine: p.fine, midDelta };
  });
  return Buffer.from(JSON.stringify({ template, deltas }));
}

/** Working-set sizes if a task only needs coarse, or coarse+mid, or full. */
export function selectiveWorkingSetBytes(items, level) {
  // Conventional always ships full pyramid per item
  const fullEach = measureF32(items[0].coarse) + measureF32(items[0].mid) + measureF32(items[0].fine);
  const conventional = fullEach * items.length;

  // Tiny: shared template once + only requested scales per item
  let tiny = measureF32(items[0].coarse) + measureF32(items[0].mid); // template
  for (let i = 0; i < items.length; i++) {
    if (level === 'coarse') {
      // reference template only
      tiny += 4; // id
    } else if (level === 'mid') {
      if (i === 0) tiny += 0;
      else tiny += measureF32(items[i].mid); // midDelta same length
    } else {
      tiny += measureF32(items[i].fine);
      if (i > 0) tiny += measureF32(items[i].mid);
    }
  }
  return { conventional, tiny, level };
}

/** Multi-agent: shared world map + per-agent pose/inventory. */
export function buildAgents(n = 32, { rhyme = 'high' } = {}) {
  const world = {
    map: Array.from({ length: 128 }, (_, i) => Math.sin(i / 3)),
    rules: { gravity: 9.8, tick: 1 / 60, teams: 4 },
    landmarks: Array.from({ length: 16 }, (_, i) => ({ x: i * 2, y: (i * 3) % 17 })),
  };
  const agents = [];
  for (let i = 0; i < n; i++) {
    agents.push({
      id: i,
      pose: rhyme === 'high' ? { x: i * 0.1, y: 0, z: 0 } : { x: Math.sin(i), y: Math.cos(i), z: i },
      inventory: rhyme === 'high' ? [1, 0, 0, i % 3] : [i, i * 2, i % 5, i % 7],
      worldRef: 'shared',
    });
  }
  return { world, agents };
}

export function packAgentsConventional({ world, agents }) {
  // Duplicate world into every agent packet (common naive game/net pattern)
  const packets = agents.map((a) => ({ ...a, world }));
  return Buffer.from(JSON.stringify(packets));
}

export function packAgentsTiny({ world, agents }) {
  return Buffer.from(JSON.stringify({ world, agents }));
}
