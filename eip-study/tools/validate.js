// 문제 데이터 검증: node tools/validate.js
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = { window: {} }; vm.createContext(ctx);
for (const f of ['written.js', 'practical.js']) {
  const p = path.join(__dirname, '..', 'data', f);
  if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f });
}
const D = ctx.window.EIP_DATA || {};
const WA = ['design', 'dev', 'ds', 'db', 'lang', 'basic', 'method', 'sys'];
const PA = ['se', 'test', 'db', 'sql', 'os', 'sec', 'code', 'algo'];
const TYPES = ['term', 'code', 'sql', 'desc'];
let errors = 0; const err = (m) => { errors++; console.log('✗', m); };
const seen = new Set();
console.log('— 필기 —'); let wt = 0; const dist = [0, 0, 0, 0, 0];
for (const [area, arr] of Object.entries(D.written || {})) {
  if (!WA.includes(area)) err(`알 수 없는 필기 영역: ${area}`);
  arr.forEach((r, i) => {
    const id = `w-${area}-${i + 1}`;
    if (typeof r[0] !== 'string' || !r[0].trim()) err(`${id}: 문제 없음`);
    if (!Array.isArray(r[1]) || r[1].length !== 4 || r[1].some((c) => typeof c !== 'string' || !c.trim())) err(`${id}: 보기 4개 필요`);
    else if (new Set(r[1]).size !== 4) err(`${id}: 보기 중복`);
    if (!Number.isInteger(r[2]) || r[2] < 1 || r[2] > 4) err(`${id}: 정답 번호 오류(${r[2]})`); else dist[r[2] - 1]++;
    if (!r[3]) err(`${id}: 해설 없음`);
    const key = r[0] + (r[4] || ''); if (seen.has(key)) err(`${id}: 중복 문제`); seen.add(key);
  });
  wt += arr.length; console.log(area.padEnd(7), arr.length);
}
console.log('필기 합계', wt, '| 정답 분포 1~4:', dist.slice(0, 4).join(' / '));
console.log('— 실기 —'); let pt = 0;
for (const [area, arr] of Object.entries(D.practical || {})) {
  if (!PA.includes(area)) err(`알 수 없는 실기 영역: ${area}`);
  arr.forEach((r, i) => {
    const id = `p-${area}-${i + 1}`;
    if (!TYPES.includes(r[0])) err(`${id}: 유형 오류(${r[0]})`);
    if (typeof r[1] !== 'string' || !r[1].trim()) err(`${id}: 문제 없음`);
    if (!Array.isArray(r[2]) || (r[0] !== 'desc' && !r[2].length) || r[2].some((a) => typeof a !== 'string' || !a.trim())) err(`${id}: 정답 오류`);
    if (!r[3]) err(`${id}: 해설 없음`);
    const key = r[1] + (r[4] || ''); if (seen.has(key)) err(`${id}: 중복 문제`); seen.add(key);
  });
  pt += arr.length; console.log(area.padEnd(7), arr.length);
}
console.log('실기 합계', pt);
console.log(errors ? `\n오류 ${errors}건` : '\n✔ 검증 통과'); process.exit(errors ? 1 : 0);
