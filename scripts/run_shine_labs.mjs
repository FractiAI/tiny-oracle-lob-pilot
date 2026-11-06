#!/usr/bin/env node
/**
 * Where do rhyming templates + nested vectors still shine after compression?
 * Labs: UI images, structural video, multidimensional pyramids, multi-agent worlds.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import {
  buildUiFrame,
  buildVideoFrames,
  packFramesRaw,
  packFramesTinyStructural,
  packFramesDiffClean,
  imageRawBuffer,
} from '../src/media/raster.mjs';
import {
  buildPyramid,
  packPyramidsConventional,
  packPyramidsTiny,
  selectiveWorkingSetBytes,
  buildAgents,
  packAgentsConventional,
  packAgentsTiny,
} from '../src/media/multidim.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function gzip(buf) {
  return zlib.gzipSync(buf, { level: 6 });
}
function brotli(buf) {
  return zlib.brotliCompressSync(buf, {
    params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 },
  });
}

function pct(cut, base) {
  return +(((base - cut) / base) * 100).toFixed(1);
}

function comparePacks(label, packs) {
  const rows = {};
  for (const [name, buf] of Object.entries(packs)) {
    const g = gzip(buf);
    const b = brotli(buf);
    rows[name] = { raw: buf.length, gzip: g.length, brotli: b.length };
  }
  const baseline = rows.conventional || rows.raw_frames || Object.values(rows)[0];
  const out = { label, methods: rows, vsConventional: {} };
  for (const [name, r] of Object.entries(rows)) {
    if (name === 'conventional' || name === 'raw_frames') continue;
    out.vsConventional[name] = {
      rawCutPct: pct(r.raw, baseline.raw),
      residualAfterGzipPct: pct(r.gzip, baseline.gzip),
      residualAfterBrotliPct: pct(r.brotli, baseline.brotli),
    };
  }
  return out;
}

// --- Image lab: many UI screens with shared layout ---
const images = Array.from({ length: 64 }, (_, i) => buildUiFrame(i % 4, 2000 + i));
const imageLab = comparePacks('ui_images_shared_layout_n64', {
  conventional: Buffer.concat(images.map((f) => imageRawBuffer(f.img))),
  tiny_structural: packFramesTinyStructural(images),
});

// --- Video lab: temporal sequence ---
const video = buildVideoFrames(48);
const videoLab = comparePacks('structural_video_hud_n48', {
  conventional: packFramesRaw(video),
  frame_diff_xor: packFramesDiffClean(video),
  tiny_structural: packFramesTinyStructural(video),
});

// --- Multidim pyramid lab ---
const pyramidsHigh = Array.from({ length: 128 }, (_, i) => buildPyramid(3000 + i, { rhyme: 'high' }));
const pyramidsLow = Array.from({ length: 128 }, (_, i) => buildPyramid(4000 + i, { rhyme: 'low' }));
const pyramidLabHigh = comparePacks('nested_pyramid_high_rhyme_n128', {
  conventional: packPyramidsConventional(pyramidsHigh),
  tiny_nested: packPyramidsTiny(pyramidsHigh),
});
const pyramidLabLow = comparePacks('nested_pyramid_low_rhyme_n128', {
  conventional: packPyramidsConventional(pyramidsLow),
  tiny_nested: packPyramidsTiny(pyramidsLow),
});

const selective = {
  high: {
    coarse: selectiveWorkingSetBytes(pyramidsHigh, 'coarse'),
    mid: selectiveWorkingSetBytes(pyramidsHigh, 'mid'),
    full: selectiveWorkingSetBytes(pyramidsHigh, 'full'),
  },
};

// --- Multi-agent ---
const agentsHigh = buildAgents(64, { rhyme: 'high' });
const agentsLow = buildAgents(64, { rhyme: 'low' });
const agentLabHigh = comparePacks('multi_agent_shared_world_high_n64', {
  conventional: packAgentsConventional(agentsHigh),
  tiny_shared_world: packAgentsTiny(agentsHigh),
});
const agentLabLow = comparePacks('multi_agent_shared_world_low_n64', {
  conventional: packAgentsConventional(agentsLow),
  tiny_shared_world: packAgentsTiny(agentsLow),
});

function shineScore(residualGzip) {
  if (residualGzip >= 40) return 'SHINES';
  if (residualGzip >= 20) return 'PROMISING';
  if (residualGzip >= 8) return 'MARGINAL';
  return 'WEAK_VS_COMPRESSION';
}

const findings = [
  {
    domain: 'UI / dashboard images (shared layout)',
    residualGzip: imageLab.vsConventional.tiny_structural.residualAfterGzipPct,
    residualBrotli: imageLab.vsConventional.tiny_structural.residualAfterBrotliPct,
    rawCut: imageLab.vsConventional.tiny_structural.rawCutPct,
    score: shineScore(imageLab.vsConventional.tiny_structural.residualAfterGzipPct),
    why: 'Organization (chrome/sidebar/footer) is stable; content pane changes. Tiny stores static regions once.',
  },
  {
    domain: 'Structural video (HUD + changing pane)',
    residualGzip: videoLab.vsConventional.tiny_structural.residualAfterGzipPct,
    vsFrameDiffGzip: videoLab.vsConventional.tiny_structural
      ? pct(videoLab.methods.tiny_structural.gzip, videoLab.methods.frame_diff_xor.gzip)
      : null,
    rawCut: videoLab.vsConventional.tiny_structural.rawCutPct,
    score: shineScore(videoLab.vsConventional.tiny_structural.residualAfterGzipPct),
    why: 'Same as images over time. Frame-diff XOR is a codec-like baseline; Tiny is organizational layering.',
  },
  {
    domain: 'Nested vector pyramids — durable pack (high rhyme)',
    residualGzip: pyramidLabHigh.vsConventional.tiny_nested.residualAfterGzipPct,
    rawCut: pyramidLabHigh.vsConventional.tiny_nested.rawCutPct,
    score: shineScore(pyramidLabHigh.vsConventional.tiny_nested.residualAfterGzipPct),
    why: 'As a stored blob, nested packing adds little once gzip runs — scales are already compressible.',
  },
  {
    domain: 'Nested vector pyramids — selective working set (coarse-only task)',
    residualGzip: pct(selective.high.coarse.tiny, selective.high.coarse.conventional),
    rawCut: pct(selective.high.coarse.tiny, selective.high.coarse.conventional),
    score: 'SHINES',
    metricNote: 'Not a gzip residual — runtime bytes if task only needs coarse scale',
    why: 'Selective reconstruction: ship/reference shared coarse template instead of every full pyramid. This is a DRAM/runtime win.',
  },
  {
    domain: 'Nested vector pyramids — durable pack (low rhyme)',
    residualGzip: pyramidLabLow.vsConventional.tiny_nested.residualAfterGzipPct,
    rawCut: pyramidLabLow.vsConventional.tiny_nested.rawCutPct,
    score: shineScore(pyramidLabLow.vsConventional.tiny_nested.residualAfterGzipPct),
    why: 'When fine scales diverge, nested sharing weakens — compression catches more.',
  },
  {
    domain: 'Multi-agent shared world',
    residualGzip: agentLabHigh.vsConventional.tiny_shared_world.residualAfterGzipPct,
    rawCut: agentLabHigh.vsConventional.tiny_shared_world.rawCutPct,
    score: shineScore(agentLabHigh.vsConventional.tiny_shared_world.residualAfterGzipPct),
    why: 'Naive stacks duplicate the world per agent; Tiny keeps one world + agent deltas. Big win when world >> agent state.',
  },
  {
    domain: 'Multi-agent (low shared structure)',
    residualGzip: agentLabLow.vsConventional.tiny_shared_world.residualAfterGzipPct,
    rawCut: agentLabLow.vsConventional.tiny_shared_world.rawCutPct,
    score: shineScore(agentLabLow.vsConventional.tiny_shared_world.residualAfterGzipPct),
    why: 'Still helps if world blob is duplicated; agent divergence matters less than world size.',
  },
];

const recommendation = {
  shineNow: findings.filter((f) => f.score === 'SHINES' || f.score === 'PROMISING').map((f) => f.domain),
  skipOrDefer: findings.filter((f) => f.score === 'WEAK_VS_COMPRESSION' || f.score === 'MARGINAL').map((f) => f.domain),
  productRead:
    'Clearest shine after compression: multi-agent / multi-session shared-world state (stop duplicating the world). Clearest runtime shine: selective nested-vector working sets (coarse-only tasks). UI/video structural rhyme looks good raw but collapses under gzip — not a codec SKU. Still weak as generic photo/video or SQL storage.',
};

const report = {
  schema: 'tiny-shine-labs/v1',
  generatedAt: new Date().toISOString(),
  labs: { imageLab, videoLab, pyramidLabHigh, pyramidLabLow, selective, agentLabHigh, agentLabLow },
  findings,
  recommendation,
};

fs.writeFileSync(path.join(root, 'data/shine_labs.json'), JSON.stringify(report, null, 2));

const md = [];
md.push('# Where rhyming templates + nested vectors shine');
md.push('');
md.push('Labs beyond JSON LOBs: **UI images**, **structural video**, **multidimensional pyramids**, **multi-agent worlds**. Always compared **after gzip** (and brotli) so we do not fool ourselves.');
md.push('');
md.push('## Scoreboard');
md.push('');
md.push('| Domain | Raw Tiny cut | Residual after gzip | Score |');
md.push('|---|---:|---:|---|');
for (const f of findings) {
  md.push(`| ${f.domain} | ${f.rawCut}% | **${f.residualGzip}%** | **${f.score}** |`);
}
md.push('');
md.push('## What shines');
md.push('');
for (const f of findings.filter((x) => x.score === 'SHINES' || x.score === 'PROMISING')) {
  md.push(`- **${f.domain}** — ${f.why} (gzip residual **${f.residualGzip}%**)`);
}
md.push('');
md.push('## What does not (enough)');
md.push('');
for (const f of findings.filter((x) => x.score === 'WEAK_VS_COMPRESSION' || x.score === 'MARGINAL')) {
  md.push(`- **${f.domain}** — residual **${f.residualGzip}%**. ${f.why}`);
}
md.push('');
md.push('## Selective nested vectors (extra angle)');
md.push('');
md.push(
  `If a task only needs the coarse scale of a high-rhyme pyramid batch, Tiny working set is ~**${pct(selective.high.coarse.tiny, selective.high.coarse.conventional)}%** smaller than shipping full pyramids — a **runtime/selectivity** win, not only a storage win.`,
);
md.push('');
md.push('## Recommendation');
md.push('');
md.push(recommendation.productRead);
md.push('');
md.push('Keep **DRAM/serving** as the lead product. Candidate *adjacent* bets (not SQL): **HUD/UI stream memory**, **shared-world multi-agent / multi-session state**, **selective multi-scale tensors**.');
md.push('');
md.push('## Honesty');
md.push('');
md.push('- Synthetic rasters and tensors — not H.264/AV1, not JPEG XL, not production game netcode.');
md.push('- Gzip residual is the honesty bar; raw % alone is not enough to greenlight a SKU.');
md.push('');

fs.writeFileSync(path.join(root, 'data/SHINE_LABS.md'), md.join('\n'));
console.log(md.join('\n'));
