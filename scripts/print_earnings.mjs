import fs from 'node:fs';
const j = JSON.parse(fs.readFileSync(new URL('../data/earnings_per_day.json', import.meta.url)));
console.log(j.oneBreath);
console.log('\nPer fleet:');
for (const f of j.fleets) {
  console.log(`- ${f.name}: $${f.extraEarnPerDayUsd.toLocaleString()}/day`);
}
