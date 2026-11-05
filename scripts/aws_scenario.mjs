#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const report = JSON.parse(fs.readFileSync(path.join(root, 'data/pilot_report.json'), 'utf8'));
const by = (pred) => report.results.find(pred);

const scenarios = [
  { name: 'Claims archive on S3 (high rhyme)', storageGiB: 500, rhymeShare: 0.70, row: by((r) => r.mode === 'high_rhyme' && r.n === 1024) },
  { name: 'Mixed LOB lake (medium rhyme)', storageGiB: 500, rhymeShare: 0.50, row: by((r) => r.mode === 'medium_rhyme') },
  { name: 'Mostly unique documents (low rhyme)', storageGiB: 500, rhymeShare: 0.80, row: by((r) => r.mode === 'low_rhyme') },
  { name: 'Identical snapshot copies', storageGiB: 200, rhymeShare: 1.0, row: by((r) => r.mode === 'identical') },
];

const S3 = 0.023;
const out = scenarios.map((s) => {
  const eligible = s.storageGiB * s.rhymeShare;
  const freed = eligible * s.row.reductionRatio;
  const mat = s.row.materialize.tinyVsConventional;
  return {
    scenario: s.name,
    inputStorageGiB: s.storageGiB,
    eligibleSharePct: +(s.rhymeShare * 100).toFixed(1),
    pilotReductionPct: s.row.reductionPct,
    freedGiB: +freed.toFixed(1),
    remainingGiB: +(s.storageGiB - freed).toFixed(1),
    approxS3StandardMonthlyUsdSaved: +(freed * S3).toFixed(2),
    readMaterializeFactorVsFullCopy: mat,
    cpuCyclesOnRead: mat < 1 ? 'improved_or_parity' : 'more_cycles_per_read',
  };
});

const payload = {
  schema: 'tiny-oracle-lob-pilot/aws-scenario/v1',
  generatedAt: new Date().toISOString(),
  basis: 'Pilot ratios applied to illustrative S3 capacities. Not an AWS measurement.',
  pricingNote: 'S3 Standard ~$0.023/GiB-month illustrative list assumption.',
  pilotHeadline: report.headline,
  scenarios: out,
  verdict: {
    freedSpace: 'Yes on eligible repetitive LOB bytes = pool × eligibleShare × pilotReduction.',
    performanceCpu: 'Near-duplicate rebuild used ~2–3× materialize CPU vs full copy. Storage improves; read CPU generally does not.',
  },
};

fs.writeFileSync(path.join(root, 'data/aws_scenario.json'), JSON.stringify(payload, null, 2));

const md = [];
md.push('# AWS scenario extrapolation (from pilot)');
md.push('');
md.push('## Plain speak');
md.push('');
md.push('If a cloud like AWS held a lot of repetitive claim-style JSON LOBs, the pilot ratios say **stored bytes can fall a lot** on the share of data that actually rhymes. That shows up as **freed object-store space** and lower storage line items.');
md.push('');
md.push('**CPU and read performance do not automatically improve.** Near-duplicate rebuild used about **2×–3×** materialize time vs reading a full copy. Identical copies were about even. Expect **storage down, rebuild-path compute up** unless you cache hot rebuilds or rebuild offline.');
md.push('');
md.push('Client egress stays full-sized if the gateway returns complete documents. Cold GET into the gateway can shrink when only template+delta is fetched.');
md.push('');
md.push('## Illustrative scenarios');
md.push('');
md.push('| Scenario | Pool | Eligible share | Pilot cut | Freed space | Approx S3 $ / mo saved* | Read CPU vs full copy |');
md.push('|---|---:|---:|---:|---:|---:|---|');
for (const s of out) {
  md.push(`| ${s.scenario} | ${s.inputStorageGiB} GiB | ${s.eligibleSharePct}% | ${s.pilotReductionPct}% | **${s.freedGiB} GiB** | ~$${s.approxS3StandardMonthlyUsdSaved} | ${s.readMaterializeFactorVsFullCopy}× (${s.cpuCyclesOnRead}) |`);
}
md.push('');
md.push('\\*Rough S3 Standard list assumption ($0.023/GiB-month). Not a quote.');
md.push('');
md.push('## Honesty');
md.push('');
md.push('- Not an AWS account measurement.');
md.push('- Only the repetitive LOB/JSON slice; not general data lakes.');
md.push('- Materialize× is pilot-host Node timing, not Lambda/EC2 production profiling.');
md.push('');
fs.writeFileSync(path.join(root, 'data/AWS_SCENARIO.md'), md.join('\n'));
console.log(JSON.stringify(payload.verdict, null, 2));
console.log('Wrote data/aws_scenario.json and data/AWS_SCENARIO.md');
