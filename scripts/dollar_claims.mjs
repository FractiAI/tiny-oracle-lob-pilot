#!/usr/bin/env node
/**
 * Translate speakable X%/Y% into dollars.
 * Storage $ is CapEx / datacenter-unit economics first — not a toy S3 10 TiB retail line.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const X_SESSIONS_PCT = 37;
const X_SESSIONS_MULT = 1 + X_SESSIONS_PCT / 100;
const Y_STORAGE_PCT = 66;
const X_KV_ONLY_MULT = 6.25;
const ELIGIBLE = 0.7; // share of pool that is high-rhyme LOB/JSON

const H100_GPU_HR = 6.88;
const A100_80_GPU_HR = 3.43;
const HOURS_MO = 730;

/** Media CapEx bands (illustrative 2025–2026 public reporting — not a procurement quote). */
const MEDIA = {
  nearlineHdd: {
    label: 'Nearline HDD media',
    usdPerTb: 25,
    note: '~$19–25/TB class nearline / Exos-style; use $25/TB',
  },
  enterpriseNvme: {
    label: 'Enterprise NVMe media',
    usdPerTb: 365,
    note: 'Q1 2026-style ~$365/TB TLC band (volatile; later-2026 prints much higher)',
  },
  enterpriseNvmeStressed: {
    label: 'Enterprise NVMe media (stressed 2026 band)',
    usdPerTb: 750,
    note: '~$750/TB class when 30TB TLC prints near ~$22.6k/drive',
  },
};

/** Rough fully-burdened multiplier: chassis, controllers, networking, spares. */
const BURDEN = 1.4;

/** 5-year TCO-ish annual carrying cost bands ($/TB-year), datacenterdisk-style. */
const ANNUAL_TCO = {
  tiered: { label: 'Tiered (NVMe hot + HDD capacity)', usdPerTbYear: 18 },
  allFlash: { label: 'All-flash NVMe TCO band', usdPerTbYear: 120 },
};

function fmt(n, digits = 0) {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: digits,
  });
}

function money(n) {
  return Math.round(n);
}

function gpuFleetSavings({ gpus, gpuHr, mult }) {
  const gpusNeeded = gpus / mult;
  const monthlyBefore = gpus * gpuHr * HOURS_MO;
  const monthlyAfter = gpusNeeded * gpuHr * HOURS_MO;
  const monthlySaved = monthlyBefore - monthlyAfter;
  return {
    fleetGpusBefore: gpus,
    fleetGpusAfter: +gpusNeeded.toFixed(2),
    monthlyBeforeUsd: money(monthlyBefore),
    monthlyAfterUsd: money(monthlyAfter),
    monthlySavedUsd: money(monthlySaved),
    annualSavedUsd: money(monthlySaved * 12),
  };
}

function capacityValueSameFleet({ gpus, gpuHr, mult }) {
  const monthly = gpus * gpuHr * HOURS_MO * (mult - 1);
  return {
    monthlyCapacityValueUsd: money(monthly),
    annualCapacityValueUsd: money(monthly * 12),
  };
}

/**
 * @param {number} poolTb usable pool before Tiny
 * @param {number} eligibleShare
 * @param {number} freedPct 0–100
 */
function storageCapex(poolTb, eligibleShare, freedPct, media) {
  const eligibleTb = poolTb * eligibleShare;
  const freedTb = eligibleTb * (freedPct / 100);
  const mediaCapexAvoided = freedTb * media.usdPerTb;
  const burdenedCapexAvoided = mediaCapexAvoided * BURDEN;
  return {
    poolTb,
    eligibleTb: +eligibleTb.toFixed(1),
    freedTb: +freedTb.toFixed(1),
    mediaUsdPerTb: media.usdPerTb,
    mediaCapexAvoidedUsd: money(mediaCapexAvoided),
    burdenedCapexAvoidedUsd: money(burdenedCapexAvoided),
    drivesAvoided_if30Tb: +(freedTb / 30).toFixed(1),
  };
}

function storageAnnualTco(poolTb, eligibleShare, freedPct, tco) {
  const freedTb = poolTb * eligibleShare * (freedPct / 100);
  const annual = freedTb * tco.usdPerTbYear;
  return {
    freedTb: +freedTb.toFixed(1),
    usdPerTbYear: tco.usdPerTbYear,
    annualCarryingAvoidedUsd: money(annual),
    monthlyCarryingAvoidedUsd: money(annual / 12),
  };
}

const fleets = [
  { name: '8× H100 (one p5.48xlarge)', gpus: 8, gpuHr: H100_GPU_HR },
  { name: '64× H100 (eight p5.48xlarge)', gpus: 64, gpuHr: H100_GPU_HR },
  { name: '512× H100 (datacenter pod-scale)', gpus: 512, gpuHr: H100_GPU_HR },
  { name: '8× A100 80GB-class', gpus: 8, gpuHr: A100_80_GPU_HR },
];

const sessionDollars = fleets.map((f) => ({
  fleet: f.name,
  sameConcurrencyFewerGpus: gpuFleetSavings({ ...f, mult: X_SESSIONS_MULT }),
  sameFleetMoreCapacity: capacityValueSameFleet({ ...f, mult: X_SESSIONS_MULT }),
  kvOnlyQualified_sameConcurrency: gpuFleetSavings({ ...f, mult: X_KV_ONLY_MULT }),
}));

/** Datacenter / AI-factory storage pools — not 10 TiB retail demos. */
const POOLS_TB = [
  { name: '100 TB rack slice', tb: 100 },
  { name: '1 PB hall', tb: 1000 },
  { name: '10 PB region slice', tb: 10_000 },
  { name: '100 PB multi-AZ class', tb: 100_000 },
];

const storageRows = [];
for (const pool of POOLS_TB) {
  for (const media of Object.values(MEDIA)) {
    const cap = storageCapex(pool.tb, ELIGIBLE, Y_STORAGE_PCT, media);
    storageRows.push({
      pool: pool.name,
      media: media.label,
      ...cap,
      annualTier: {
        tiered: storageAnnualTco(pool.tb, ELIGIBLE, Y_STORAGE_PCT, ANNUAL_TCO.tiered),
        allFlash: storageAnnualTco(pool.tb, ELIGIBLE, Y_STORAGE_PCT, ANNUAL_TCO.allFlash),
      },
    });
  }
}

const pb1 = storageRows.filter((r) => r.pool === '1 PB hall');
const pb10 = storageRows.filter((r) => r.pool === '10 PB region slice');

const headline = {
  speak: `About ${X_SESSIONS_PCT}% more concurrent sessions and about ${Y_STORAGE_PCT}% storage freed on rhyming LOBs.`,
  correction:
    'The earlier ~$106/mo figure was only a 10 TiB S3 Standard retail line — not datacenter economics and not storage-unit CapEx. Ignore it for facility-scale talk.',
  dollarsSpeak_storageCapex: (() => {
    const hdd = pb10.find((r) => r.media.includes('HDD'));
    const nvme = pb10.find((r) => r.media === 'Enterprise NVMe media');
    const nvmeHot = pb10.find((r) => r.media.includes('stressed'));
    return (
      `At datacenter scale, ~${Y_STORAGE_PCT}% freed on a 10 PB pool with 70% eligible rhyming LOBs is ~${hdd.freedTb.toLocaleString()} TB avoided. ` +
      `That is roughly ${fmt(hdd.burdenedCapexAvoidedUsd)} burdened nearline-HDD CapEx avoided, ` +
      `or ${fmt(nvme.burdenedCapexAvoidedUsd)}–${fmt(nvmeHot.burdenedCapexAvoidedUsd)} if that capacity would have been enterprise NVMe ` +
      `(${MEDIA.enterpriseNvme.usdPerTb}–${MEDIA.enterpriseNvmeStressed.usdPerTb}/TB media × ${BURDEN}× burden). ` +
      `Annual carrying (tiered TCO band) on that freed slice is about ${fmt(hdd.annualTier.tiered.annualCarryingAvoidedUsd)}/yr.`
    );
  })(),
  dollarsSpeak_sessions: (() => {
    const pod = sessionDollars.find((s) => s.fleet.includes('512'));
    return (
      `On an illustrative 512× H100 pod, ~${X_SESSIONS_PCT}% more sessions is about ` +
      `${fmt(pod.sameConcurrencyFewerGpus.monthlySavedUsd)}/mo less on-demand GPU spend for the same concurrency ` +
      `(~${fmt(pod.sameConcurrencyFewerGpus.annualSavedUsd)}/yr), or ~${fmt(pod.sameFleetMoreCapacity.monthlyCapacityValueUsd)}/mo of avoided expansion if you keep all 512.`
    );
  })(),
};

const payload = {
  schema: 'tiny-oracle-lob-pilot/dollar-claims/v2',
  generatedAt: new Date().toISOString(),
  ratios: {
    moreConcurrentSessionsPct: X_SESSIONS_PCT,
    storageFreedPct: Y_STORAGE_PCT,
    eligibleShare: ELIGIBLE,
    kvOnlySessionMultiplierQualified: X_KV_ONLY_MULT,
  },
  assumptions: {
    mediaCapexUsdPerTb: Object.fromEntries(
      Object.entries(MEDIA).map(([k, v]) => [k, { usdPerTb: v.usdPerTb, note: v.note }]),
    ),
    burdenMultiplier: BURDEN,
    annualTcoUsdPerTbYear: ANNUAL_TCO,
    demoted: 'S3 Standard $/GiB-mo retail on <50 TiB is demoted — not the lead storage $ story',
  },
  headline,
  sessionDollars,
  storageCapexRows: storageRows,
  notClaimed: [
    'AWS private pricing or datacenter BOM quote',
    'That every PB in a region is 70% rhyming LOBs',
    'Flash spot prices (volatile through 2026)',
  ],
};

fs.writeFileSync(path.join(root, 'data/dollar_claims.json'), JSON.stringify(payload, null, 2));

const md = [];
md.push('# Speakable claims → dollars (datacenter / CapEx first)');
md.push('');
md.push('## Correction');
md.push('');
md.push(headline.correction);
md.push('');
md.push('## One breath');
md.push('');
md.push(headline.speak);
md.push('');
md.push(headline.dollarsSpeak_sessions);
md.push('');
md.push(headline.dollarsSpeak_storageCapex);
md.push('');
md.push('## Y · storage freed → **storage-unit CapEx** (lead metric)');
md.push('');
md.push(
  `Freed TB = pool × **${ELIGIBLE * 100}% eligible** × **${Y_STORAGE_PCT}% cut**. Burdened CapEx = freed TB × media $/TB × **${BURDEN}×** (chassis/controllers/spares sketch).`,
);
md.push('');
md.push('| Pool | Freed TB | Nearline HDD CapEx avoided* | NVMe CapEx avoided* | NVMe stressed CapEx* | Tiered TCO avoided / yr |');
md.push('|---|---:|---:|---:|---:|---:|');
for (const pool of POOLS_TB) {
  const hdd = storageRows.find((r) => r.pool === pool.name && r.media.includes('HDD'));
  const nvme = storageRows.find((r) => r.pool === pool.name && r.media === 'Enterprise NVMe media');
  const hot = storageRows.find((r) => r.pool === pool.name && r.media.includes('stressed'));
  md.push(
    `| ${pool.name} | ${hdd.freedTb.toLocaleString()} | **${fmt(hdd.burdenedCapexAvoidedUsd)}** | ${fmt(nvme.burdenedCapexAvoidedUsd)} | ${fmt(hot.burdenedCapexAvoidedUsd)} | ${fmt(hdd.annualTier.tiered.annualCarryingAvoidedUsd)} |`,
  );
}
md.push('');
md.push(
  `\\*Burdened. Media-only at $${MEDIA.nearlineHdd.usdPerTb}/TB HDD · $${MEDIA.enterpriseNvme.usdPerTb}/TB NVMe · $${MEDIA.enterpriseNvmeStressed.usdPerTb}/TB stressed NVMe.`,
);
md.push('');
md.push('| Pool | ≈ 30 TB drives avoided (media count) |');
md.push('|---|---:|');
for (const pool of POOLS_TB) {
  const hdd = storageRows.find((r) => r.pool === pool.name && r.media.includes('HDD'));
  md.push(`| ${pool.name} | ~${hdd.drivesAvoided_if30Tb} |`);
}
md.push('');
md.push('### Why S3 $/mo looked “way off”');
md.push('');
md.push(
  'S3 Standard ~$0.023/GiB-mo on 10 TiB is a **retail object bill**, not the cost of buying and powering storage units in a hall. Hyperscalers care about **drives, enclosures, racks, power, and deferred CapEx**. Lead with CapEx-avoided / drives-avoided; keep S3 retail as a footnote for customer object bills only.',
);
md.push('');
md.push('## X · sessions → GPU $');
md.push('');
md.push('| Fleet | Monthly saved (same concurrency) | Annual | Capacity value if keep fleet / mo |');
md.push('|---|---:|---:|---:|');
for (const s of sessionDollars) {
  const a = s.sameConcurrencyFewerGpus;
  const b = s.sameFleetMoreCapacity;
  md.push(
    `| ${s.fleet} | **${fmt(a.monthlySavedUsd)}** | ${fmt(a.annualSavedUsd)} | ${fmt(b.monthlyCapacityValueUsd)} |`,
  );
}
md.push('');
md.push('## Honesty');
md.push('');
md.push('- Not an AWS or Oracle procurement quote; flash $/TB moved violently in 2026 reporting.');
md.push('- Assumes 70% of the named pool is high-rhyme LOB/JSON — measure your corpus before using the $.');
md.push('- CapEx avoided only lands if you **buy fewer units** or defer a refresh — not if the hall stays full of empty drives.');
md.push('- Rebuild CPU cost not netted against these dollars.');
md.push('');

fs.writeFileSync(path.join(root, 'data/DOLLAR_CLAIMS.md'), md.join('\n'));

const speakPath = path.join(root, 'data/SPEAKABLE_CLAIMS.md');
let speak = fs.readFileSync(speakPath, 'utf8');
const dollarSection = `\n\n## Dollars (illustrative · CapEx first)\n\n${headline.correction}\n\n${headline.dollarsSpeak_sessions}\n\n${headline.dollarsSpeak_storageCapex}\n\nFull tables: [\`DOLLAR_CLAIMS.md\`](./DOLLAR_CLAIMS.md) · \`npm run dollars\`.\n`;
if (speak.includes('## Dollars')) {
  speak = speak.replace(/\n## Dollars[\s\S]*$/m, dollarSection);
} else {
  speak = speak.trimEnd() + dollarSection;
}
fs.writeFileSync(speakPath, speak);

console.log(headline.correction);
console.log(headline.dollarsSpeak_storageCapex);
console.log('Wrote data/DOLLAR_CLAIMS.md v2');
