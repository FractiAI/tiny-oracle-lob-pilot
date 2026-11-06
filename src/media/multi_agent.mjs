/**
 * Tiny Footprint Multi-Agent empirical primitives.
 * Shared world template + per-agent deltas vs naive per-agent world copies.
 */

function mulberry(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/**
 * @param {object} opts
 * @param {number} opts.nAgents
 * @param {number} opts.worldMapLen - shared map vector length (scales world blob)
 * @param {number} opts.landmarks
 * @param {number} opts.policyDocs - shared policy/tool docs size (chars-ish via repeats)
 * @param {'high'|'medium'|'low'} opts.rhyme
 */
export function buildMultiAgentWorld(opts = {}) {
  const nAgents = opts.nAgents ?? 64;
  const worldMapLen = opts.worldMapLen ?? 4096;
  const landmarks = opts.landmarks ?? 64;
  const policyDocs = opts.policyDocs ?? 8;
  const rhyme = opts.rhyme ?? 'high';
  const rand = mulberry(opts.seed ?? 42);

  const world = {
    schema: 'tiny.multi_agent.world.v1',
    map: Array.from({ length: worldMapLen }, () => rand() * 2 - 1),
    rules: {
      gravity: 9.8,
      tick: 1 / 60,
      teams: 8,
      tools: ['search', 'code', 'browse', 'memory', 'act'],
    },
    landmarks: Array.from({ length: landmarks }, (_, i) => ({
      id: i,
      x: rand() * 1000,
      y: rand() * 1000,
      kind: ['depot', 'gate', 'cache', 'npc'][i % 4],
    })),
    policy: Array.from({ length: policyDocs }, (_, i) => ({
      id: `policy_${i}`,
      text: `SHARED_POLICY_${i}_`.repeat(40 + (i % 5) * 10),
    })),
  };

  const agents = [];
  for (let i = 0; i < nAgents; i++) {
    if (rhyme === 'high') {
      agents.push({
        id: i,
        pose: { x: i * 0.25, y: 0, z: 0 },
        goal: `task_${i % 16}`,
        inventory: [1, 0, i % 4],
        localMemory: [`note_${i}`],
      });
    } else if (rhyme === 'medium') {
      agents.push({
        id: i,
        pose: { x: rand() * 10, y: rand() * 10, z: rand() },
        goal: `task_${i % 32}`,
        inventory: [i % 7, i % 5, i % 3],
        localMemory: [`note_${i}`, `ctx_${i % 9}`],
      });
    } else {
      agents.push({
        id: i,
        pose: { x: rand() * 100, y: rand() * 100, z: rand() * 100 },
        goal: `unique_goal_${i}_${rand().toFixed(4)}`,
        inventory: Array.from({ length: 8 }, () => Math.floor(rand() * 100)),
        localMemory: Array.from({ length: 6 }, (_, k) => `mem_${i}_${k}_${rand().toFixed(3)}`),
      });
    }
  }
  return { world, agents, meta: { nAgents, worldMapLen, landmarks, policyDocs, rhyme } };
}

export function packConventionalDuplicateWorld({ world, agents }) {
  return Buffer.from(JSON.stringify(agents.map((a) => ({ ...a, world }))));
}

export function packTinySharedWorld({ world, agents }) {
  return Buffer.from(JSON.stringify({ world, agents }));
}

/** Approximate live resident bytes if each agent holds a structuredClone of world+self. */
export function residentConventionalBytes({ world, agents }) {
  const worldBytes = Buffer.byteLength(JSON.stringify(world), 'utf8');
  let agentBytes = 0;
  for (const a of agents) agentBytes += Buffer.byteLength(JSON.stringify(a), 'utf8');
  return worldBytes * agents.length + agentBytes;
}

/** Tiny resident: one world + all agent deltas. */
export function residentTinyBytes({ world, agents }) {
  const worldBytes = Buffer.byteLength(JSON.stringify(world), 'utf8');
  let agentBytes = 0;
  for (const a of agents) agentBytes += Buffer.byteLength(JSON.stringify(a), 'utf8');
  return worldBytes + agentBytes;
}

/**
 * Concurrency density proxy: how many agents fit in a fixed DRAM budget.
 * @param {number} budgetBytes
 */
export function agentsInBudget(budgetBytes, perAgentConventional, tinyFixedWorld, perAgentTiny) {
  const conventional = Math.floor(budgetBytes / perAgentConventional);
  // Tiny: first pay for world once, then agents
  const tiny = tinyFixedWorld >= budgetBytes ? 0 : Math.floor((budgetBytes - tinyFixedWorld) / perAgentTiny);
  return {
    conventional,
    tiny,
    moreAgentsPct: conventional > 0 ? +(((tiny - conventional) / conventional) * 100).toFixed(1) : null,
    densityGain: conventional > 0 ? +(tiny / conventional).toFixed(2) : null,
  };
}
