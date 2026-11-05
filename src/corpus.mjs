/**
 * Synthetic Oracle-like LOB corpora: repetitive JSON documents (claims, policies, invoices).
 * Same organizational shape, different field values — the transparent Tiny target.
 */

function claimTemplate() {
  return {
    schema: 'oracle.claim_packet.v1',
    carrier: 'ACME_HEALTH',
    region: 'US-WEST',
    policy: {
      product: 'PPO_GOLD',
      network: 'BROAD',
      rider: 'RX_PLUS',
      meta: { version: 3, channel: 'EDI_837' },
    },
    member: {
      segment: 'EMPLOYER_GROUP',
      planYear: 2026,
      attributes: { tobacco: false, family: true, cobra: false },
    },
    claim: {
      type: 'OUTPATIENT',
      placeOfService: '11',
      diagnosisPrefix: 'Z00',
      lines: [
        { code: '99213', units: 1, modifiers: ['25'] },
        { code: '36415', units: 1, modifiers: [] },
      ],
    },
    audit: {
      source: 'CLEARINGHOUSE',
      compliance: ['HIPAA', 'ACA'],
      notes: 'standard outpatient packet',
    },
  };
}

function mutateClaim(i, mode) {
  const doc = structuredClone(claimTemplate());
  if (mode === 'identical') return doc;

  // Always vary the claim identity fields a little.
  doc.claim.claimId = `CLM-${100000 + i}`;
  doc.member.memberId = `MBR-${200000 + (i % 500)}`;
  doc.claim.serviceDate = `2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`;

  if (mode === 'high_rhyme') {
    // Same shape; only a few leaves change (near-duplicate LOBs).
    doc.claim.lines[0].units = 1 + (i % 3);
    doc.audit.notes = i % 5 === 0 ? 'standard outpatient packet · flagged' : 'standard outpatient packet';
    return doc;
  }

  if (mode === 'medium_rhyme') {
    doc.region = i % 2 === 0 ? 'US-WEST' : 'US-EAST';
    doc.policy.product = i % 3 === 0 ? 'PPO_GOLD' : 'HMO_SILVER';
    doc.claim.type = i % 4 === 0 ? 'INPATIENT' : 'OUTPATIENT';
    doc.claim.lines[0].code = i % 2 === 0 ? '99213' : '99214';
    doc.claim.lines[0].units = 1 + (i % 4);
    doc.audit.notes = `packet variant ${i % 17}`;
    return doc;
  }

  // low_rhyme: still same keys/shape, but many leaf values differ.
  doc.carrier = `CARRIER_${i % 40}`;
  doc.region = `R${i % 20}`;
  doc.policy.product = `PROD_${i % 25}`;
  doc.policy.network = `NET_${i % 15}`;
  doc.policy.rider = `RIDER_${i % 12}`;
  doc.member.segment = `SEG_${i % 18}`;
  doc.claim.type = `TYPE_${i % 10}`;
  doc.claim.placeOfService = String(10 + (i % 9));
  doc.claim.diagnosisPrefix = `D${i % 50}`;
  doc.claim.lines[0].code = `C${i % 80}`;
  doc.claim.lines[0].units = 1 + (i % 7);
  doc.claim.lines[1].code = `L${i % 60}`;
  doc.audit.source = `SRC_${i % 8}`;
  doc.audit.notes = `unique narrative for claim ${i} `.repeat(2).trim();
  return doc;
}

/**
 * @param {{ n?: number, mode?: 'identical'|'high_rhyme'|'medium_rhyme'|'low_rhyme', seedName?: string }} opts
 */
export function buildCorpus(opts = {}) {
  const n = opts.n ?? 1024;
  const mode = opts.mode ?? 'high_rhyme';
  /** @type {Map<string, object>} */
  const docs = new Map();
  for (let i = 0; i < n; i++) {
    docs.set(`row_${i}`, mutateClaim(i, mode));
  }
  return {
    name: opts.seedName ?? `claims_${mode}_n${n}`,
    mode,
    n,
    docs,
  };
}

export const WORKLOADS = [
  { mode: 'identical', n: 1024, seedName: 'identical_lobs_n1024' },
  { mode: 'high_rhyme', n: 1024, seedName: 'high_rhyme_claims_n1024' },
  { mode: 'medium_rhyme', n: 1024, seedName: 'medium_rhyme_claims_n1024' },
  { mode: 'low_rhyme', n: 1024, seedName: 'low_rhyme_claims_n1024' },
  { mode: 'high_rhyme', n: 4096, seedName: 'high_rhyme_claims_n4096' },
];
