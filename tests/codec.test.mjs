import test from 'node:test';
import assert from 'node:assert/strict';
import { diffDelta, mergeDelta, deepEqual } from '../src/codec.mjs';
import { createTinyLobGateway, createConventionalLobStore, verifyExactRebuild } from '../src/oracle-transparent-gateway.mjs';
import { buildCorpus } from '../src/corpus.mjs';

test('diff+merge round-trips a nested change', () => {
  const base = { a: 1, nest: { x: 1, y: 2 } };
  const expr = { a: 1, nest: { x: 9, y: 2 } };
  const d = diffDelta(base, expr);
  const out = mergeDelta(base, d);
  assert.equal(deepEqual(out, expr), true);
});

test('tiny gateway exact rebuild on high_rhyme corpus', () => {
  const { docs } = buildCorpus({ n: 64, mode: 'high_rhyme' });
  const tiny = createTinyLobGateway();
  const conv = createConventionalLobStore();
  for (const [id, doc] of docs) {
    conv.put(id, doc);
    tiny.put(id, doc);
  }
  const v = verifyExactRebuild(docs, tiny);
  assert.equal(v.pass, true);
  assert.ok(tiny.footprintBytes() < conv.footprintBytes());
});
