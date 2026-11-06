#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import {
  buildMultiAgentWorld,
  packConventionalDuplicateWorld,
  packTinySharedWorld,
  residentConventionalBytes,
  residentTinyBytes,
  agentsInBudget,
} from '../src/media/multi_agent.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function gzip(buf) {
  return zlib.gzipSync(buf, { level: 6 });
}

function runCase(opts) {
  const built = buildMultiAgentWorld(opts);
  const convBuf = packConventionalDuplicateWorld(built);
  const tinyBuf = packTinySharedWorld(built);
  const convGz = gzip(convBuf);
  const tinyGz = gzip(tinyBuf);
  const resConv = residentConventionalBytes(built);
  const resTiny = residentTinyBytes(built);
  const worldBytes = Buffer.byteLength(JSON.stringify(built.world), 'utf8');
  const perAgentOnly = built.agents.reduce(
    (n, a) => n + Buffer.byteLength(JSON.stringify(a), 'utf8'),
    0,
  ) / built.agents.length;
  const perAgentConv = worldBytes + perAgentOnly;
  const density = agentsInBudget(8 * 1024 ** 3, perAgentConv, worldBytes, perAgentOnly); // 8 GiB box

  return {
    ...built.meta,
    pack: {
      conventionalBytes: convBuf.length,
      tinyBytes: tinyBuf.length,
      rawReductionPct: +(((convBuf.length - tinyBuf.length) / convBuf.length) * 100).toFixed(2),
      conventionalGzip: convGz.length,
      tinyGzip: tinyGz.length,
      residualAfterGzipPct: +(((convGz.length - tinyGz.length) / convGz.length) * 100).toFixed(2),
    },
    resident: {
      conventionalBytes: resConv,
      tinyBytes: resTiny,
      reductionPct: +(((resConv - resTiny) / resConv) * 100).toFixed(2),
      worldBytes,
      perAgentOnlyBytes: +perAgentOnly.toFixed(1),
    },
    concurrency8GiB: density,
  };
}

const sweep = [];
for (const rhyme of ['high', 'medium', 'low']) {
  for (const nAgents of [16, 64, 256, 1024]) {
    for (const worldMapLen of [1024, 4096, 16384]) {
      sweep.push(runCase({ nAgents, worldMapLen, landmarks: 64, policyDocs: 8, rhyme, seed: 7 }));
    }
  }
}

// Flagship case used in product copy
const flagship = runCase({
  nAgents: 256,
  worldMapLen: 8192,
  landmarks: 128,
  policyDocs: 16,
  rhyme: 'high',
  seed: 11,
});

const headline = {
  flagshipResidualAfterGzipPct: flagship.pack.residualAfterGzipPct,
  flagshipResidentReductionPct: flagship.resident.reductionPct,
  flagshipMoreAgentsIn8GiBPct: flagship.concurrency8GiB.moreAgentsPct,
  flagshipDensityGain: flagship.concurrency8GiB.densityGain,
  medianResidualAfterGzipPct: (() => {
    const xs = sweep.map((s) => s.pack.residualAfterGzipPct).sort((a, b) => a - b);
    return xs[Math.floor(xs.length / 2)];
  })(),
  bestResidualAfterGzipPct: Math.max(...sweep.map((s) => s.pack.residualAfterGzipPct)),
  speak:
    `Flagship multi-agent case (256 agents, shared world): ~${flagship.pack.residualAfterGzipPct}% less pack size after gzip, ` +
    `~${flagship.resident.reductionPct}% less estimated resident shared-state bytes, ` +
    `~${flagship.concurrency8GiB.moreAgentsPct}% more agents in an 8 GiB budget (${flagship.concurrency8GiB.densityGain}× density).`,
};

const report = {
  schema: 'tiny-footprint-multi-agent/empirical/v1',
  generatedAt: new Date().toISOString(),
  operator: 'SynthOBS Autonomous Agent · Syntheverse Sandbox',
  title: 'Tiny Footprint Multi-Agent empirical sweep',
  headline,
  flagship,
  sweep,
  honesty: [
    'In-process JSON + gzip lab — not production agent runtime, not GPU HBM attestation.',
    'Resident bytes are serialized-size proxies for structuredClone-style duplication, not RSS from a live engine.',
    '8 GiB concurrency is a density arithmetic proxy.',
  ],
};

fs.mkdirSync(path.join(root, 'data'), { recursive: true });
fs.writeFileSync(path.join(root, 'data/multi_agent_empirical.json'), JSON.stringify(report, null, 2));

const md = [];
md.push('# Tiny Footprint Multi-Agent — empirical findings');
md.push('');
md.push(headline.speak);
md.push('');
md.push('## Flagship');
md.push('');
md.push('| Metric | Value |');
md.push('|---|---|');
md.push(`| Agents | ${flagship.nAgents} |`);
md.push(`| World map length | ${flagship.worldMapLen} |`);
md.push(`| Pack residual after gzip | **${flagship.pack.residualAfterGzipPct}%** |`);
md.push(`| Resident shared-state cut (proxy) | **${flagship.resident.reductionPct}%** |`);
md.push(`| More agents in 8 GiB (proxy) | **${flagship.concurrency8GiB.moreAgentsPct}%** (${flagship.concurrency8GiB.densityGain}×) |`);
md.push('');
md.push('## Sweep (median residual after gzip)');
md.push('');
md.push(`Across ${sweep.length} cases (rhyme × agent count × world size): median residual **${headline.medianResidualAfterGzipPct}%**, best **${headline.bestResidualAfterGzipPct}%**.`);
md.push('');
md.push('## Honesty');
md.push('');
for (const h of report.honesty) md.push(`- ${h}`);
md.push('');
fs.writeFileSync(path.join(root, 'data/MULTI_AGENT_EMPIRICAL.md'), md.join('\n'));
console.log(headline.speak);
console.log(`Wrote data/multi_agent_empirical.json (${sweep.length} sweep rows)`);
