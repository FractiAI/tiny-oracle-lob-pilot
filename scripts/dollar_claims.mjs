#!/usr/bin/env node
/**
 * Translate speakable X%/Y% into illustrative AWS dollars.
 * Not a quote. Rates are public-list assumptions (us-east-1 style).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// Speakable ratios (labeled)
const X_SESSIONS_PCT = 37; // weight-counted resident cut → more sessions
const X_SESSIONS_MULT = 1 + X_SESSIONS_PCT / 100; // 1.37
const Y_STORAGE_PCT = 66; // high-rhyme LOB pilot
const X_KV_ONLY_MULT = 6.25; // 84% KV-only — qualified

// Illustrative rates (Nov 2026 public list style)
const H100_GPU_HR = 6.88; // p5.48xlarge $55.04 / 8
const A100_80_GPU_HR = 3.43; // p4de.24xlarge ballpark / 8
const S3_GIB_MO = 0.023;
const EBS_GP3_GIB_MO = 0.08;
const HOURS_MO = 730;

function money(n) {
  return Math.round(n);
}

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

/** Same concurrency target: fewer GPUs needed when each GPU holds more sessions. */
function gpuFleetSavings({ gpus, gpuHr, label, mult }) {
  const gpusNeeded = gpus / mult;
  const gpusFreed = gpus - gpusNeeded;
  const monthlyBefore = gpus * gpuHr * HOURS_MO;
  const monthlyAfter = gpusNeeded * gpuHr * HOURS_MO;
  const monthlySaved = monthlyBefore - monthlyAfter;
  return {
    label,
    fleetGpusBefore: gpus,
    fleetGpusAfter: +gpusNeeded.toFixed(2),
    gpusFreed: +gpusFreed.toFixed(2),
    monthlyBeforeUsd: money(monthlyBefore),
    monthlyAfterUsd: money(monthlyAfter),
    monthlySavedUsd: money(monthlySaved),
    annualSavedUsd: money(monthlySaved * 12),
  };
}

/** Same GPU fleet: extra session capacity valued at avoided GPU-hours for that surplus. */
function capacityValueSameFleet({ gpus, gpuHr, mult }) {
  const extraSessionFraction = mult - 1;
  const monthly = gpus * gpuHr * HOURS_MO * extraSessionFraction;
  return {
    monthlyCapacityValueUsd: money(monthly),
    annualCapacityValueUsd: money(monthly * 12),
    note: 'Value of extra concurrent capacity if you keep the same GPU count (avoided expansion).',
  };
}

function storageSavings({ poolGiB, eligibleShare, freedPct, rateGiBMo, label }) {
  const freed = poolGiB * eligibleShare * (freedPct / 100);
  const monthly = freed * rateGiBMo;
  return {
    label,
    poolGiB,
    eligibleSharePct: eligibleShare * 100,
    freedGiB: +freed.toFixed(1),
    monthlySavedUsd: +monthly.toFixed(2),
    annualSavedUsd: +((monthly * 12).toFixed(2)),
  };
}

const fleets = [
  { name: '8× H100 (one p5.48xlarge)', gpus: 8, gpuHr: H100_GPU_HR },
  { name: '64× H100 (eight p5.48xlarge)', gpus: 64, gpuHr: H100_GPU_HR },
  { name: '8× A100 80GB-class', gpus: 8, gpuHr: A100_80_GPU_HR },
];

const sessionDollars = fleets.map((f) => ({
  fleet: f.name,
  claim: `~${X_SESSIONS_PCT}% more concurrent sessions (weight-counted)`,
  sameConcurrencyFewerGpus: gpuFleetSavings({ ...f, label: f.name, mult: X_SESSIONS_MULT }),
  sameFleetMoreCapacity: capacityValueSameFleet({ ...f, mult: X_SESSIONS_MULT }),
  kvOnlyQualified_sameConcurrency: gpuFleetSavings({
    ...f,
    label: f.name,
    mult: X_KV_ONLY_MULT,
  }),
}));

const storageDollars = [
  storageSavings({
    poolGiB: 500,
    eligibleShare: 0.7,
    freedPct: Y_STORAGE_PCT,
    rateGiBMo: S3_GIB_MO,
    label: '500 GiB S3 · 70% high-rhyme LOBs · 66% cut',
  }),
  storageSavings({
    poolGiB: 10_000,
    eligibleShare: 0.7,
    freedPct: Y_STORAGE_PCT,
    rateGiBMo: S3_GIB_MO,
    label: '10 TiB S3 · 70% high-rhyme LOBs · 66% cut',
  }),
  storageSavings({
    poolGiB: 50_000,
    eligibleShare: 0.7,
    freedPct: Y_STORAGE_PCT,
    rateGiBMo: S3_GIB_MO,
    label: '50 TiB S3 · 70% high-rhyme LOBs · 66% cut',
  }),
  storageSavings({
    poolGiB: 10_000,
    eligibleShare: 0.7,
    freedPct: Y_STORAGE_PCT,
    rateGiBMo: EBS_GP3_GIB_MO,
    label: '10 TiB EBS gp3-class · 70% eligible · 66% cut',
  }),
];

const headline = {
  speak:
    `About ${X_SESSIONS_PCT}% more concurrent sessions and about ${Y_STORAGE_PCT}% storage freed on rhyming LOBs.`,
  dollarsSpeak_default: (() => {
    const h64 = sessionDollars.find((s) => s.fleet.startsWith('64'));
    const s10 = storageDollars.find((s) => s.label.startsWith('10 TiB S3'));
    return (
      `On an illustrative 64× H100 on-demand fleet, ~${X_SESSIONS_PCT}% more sessions means roughly ` +
      `${fmt(h64.sameConcurrencyFewerGpus.monthlySavedUsd)}/mo less GPU spend for the same concurrency ` +
      `(or ~${fmt(h64.sameFleetMoreCapacity.monthlyCapacityValueUsd)}/mo of avoided expansion if you keep all 64). ` +
      `On 10 TiB of S3 with 70% high-rhyme LOBs, ~${Y_STORAGE_PCT}% freed is about ` +
      `${fmt(s10.monthlySavedUsd)}/mo storage (~${fmt(s10.annualSavedUsd)}/yr).`
    );
  })(),
  rates: {
    h100GpuHrUsd: H100_GPU_HR,
    a100_80GpuHrUsd: A100_80_GPU_HR,
    s3GiBMonthUsd: S3_GIB_MO,
    ebsGp3GiBMonthUsd: EBS_GP3_GIB_MO,
    hoursPerMonth: HOURS_MO,
    asOfNote: 'Illustrative public-list style rates (e.g. p5.48xlarge ~$55.04/hr → ~$6.88/GPU-hr). Not an AWS quote.',
  },
};

const payload = {
  schema: 'tiny-oracle-lob-pilot/dollar-claims/v1',
  generatedAt: new Date().toISOString(),
  ratios: {
    moreConcurrentSessionsPct: X_SESSIONS_PCT,
    storageFreedPct: Y_STORAGE_PCT,
    kvOnlySessionMultiplierQualified: X_KV_ONLY_MULT,
  },
  headline,
  sessionDollars,
  storageDollars,
  notClaimed: [
    'Customer AWS invoice guarantee',
    'Reserved/Spot/Savings Plan effective rates',
    'That rebuild CPU savings offset GPU dollars',
  ],
};

fs.writeFileSync(path.join(root, 'data/dollar_claims.json'), JSON.stringify(payload, null, 2));

const md = [];
md.push('# Speakable claims → dollars (illustrative AWS)');
md.push('');
md.push('## One breath');
md.push('');
md.push(headline.speak);
md.push('');
md.push(headline.dollarsSpeak_default);
md.push('');
md.push('## X · session capacity → GPU $');
md.push('');
md.push('Identity: **~37% more sessions** ⇒ same concurrency needs only **1/1.37 ≈ 73%** of the GPUs ⇒ **~27% of that fleet’s GPU bill avoided**.');
md.push('');
md.push('| Fleet | Monthly before | Monthly after (same concurrency) | **Monthly saved** | Annual saved | Same fleet · capacity value / mo |');
md.push('|---|---:|---:|---:|---:|---:|');
for (const s of sessionDollars) {
  const a = s.sameConcurrencyFewerGpus;
  const b = s.sameFleetMoreCapacity;
  md.push(
    `| ${s.fleet} | ${fmt(a.monthlyBeforeUsd)} | ${fmt(a.monthlyAfterUsd)} | **${fmt(a.monthlySavedUsd)}** | ${fmt(a.annualSavedUsd)} | ${fmt(b.monthlyCapacityValueUsd)} |`,
  );
}
md.push('');
md.push('Qualified KV-only (~6.25× sessions / ~84% KV cut, weights excluded):');
md.push('');
md.push('| Fleet | Monthly saved if concurrency KV-bound only |');
md.push('|---|---:|');
for (const s of sessionDollars) {
  md.push(`| ${s.fleet} | ${fmt(s.kvOnlyQualified_sameConcurrency.monthlySavedUsd)} |`);
}
md.push('');
md.push('## Y · storage freed → storage $');
md.push('');
md.push('| Scenario | Freed | Monthly | Annual |');
md.push('|---|---:|---:|---:|');
for (const s of storageDollars) {
  md.push(`| ${s.label} | ${s.freedGiB} GiB | **${fmt(s.monthlySavedUsd)}** | ${fmt(s.annualSavedUsd)} |`);
}
md.push('');
md.push('## Rates used (illustration only)');
md.push('');
md.push(`- H100: **$${H100_GPU_HR}/GPU-hr** (p5.48xlarge ~$55.04/hr ÷ 8)`);
md.push(`- A100 80GB-class: **$${A100_80_GPU_HR}/GPU-hr**`);
md.push(`- S3 Standard: **$${S3_GIB_MO}/GiB-mo** · EBS gp3-class: **$${EBS_GP3_GIB_MO}/GiB-mo**`);
md.push(`- Hours/month: **${HOURS_MO}**`);
md.push('');
md.push('## Honesty');
md.push('');
md.push('- Not an AWS invoice, Private Pricing, or Savings Plan.');
md.push('- Session $ assumes concurrency was memory-bound in the way the X% claim states.');
md.push('- Storage $ applies only to the eligible rhyming LOB share.');
md.push('- Rebuild CPU often rises in the LOB pilot — not subtracted here.');
md.push('');

fs.writeFileSync(path.join(root, 'data/DOLLAR_CLAIMS.md'), md.join('\n'));

// Append dollars blurb to SPEAKABLE_CLAIMS.md when missing.
const speak = fs.readFileSync(path.join(root, 'data/SPEAKABLE_CLAIMS.md'), 'utf8');
if (!speak.includes('## Dollars')) {
  fs.writeFileSync(
    path.join(root, 'data/SPEAKABLE_CLAIMS.md'),
    speak.trimEnd() +
      `\n\n## Dollars (illustrative)\n\n${headline.dollarsSpeak_default}\n\nFull tables: [\`DOLLAR_CLAIMS.md\`](./DOLLAR_CLAIMS.md) · \`npm run dollars\`.\n`,
  );
}

console.log(headline.dollarsSpeak_default);
console.log('Wrote data/DOLLAR_CLAIMS.md and data/dollar_claims.json');
