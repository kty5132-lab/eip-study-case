// 문제 데이터 검증: node tools/validate.js
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = { window: {} }; vm.createContext(ctx);
for (const f of ['written.js', 'practical.js', 'written2.js', 'practical2.js', 'theory.js']) {
  const p = path.join(__dirname, '..', 'data', f);
  if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f });
}
const D = ctx.window.EIP_DATA || {};
const WA = ['design', 'dev', 'ds', 'db', 'lang', 'basic', 'method', 'sys'];
const PA = ['se', 'test', 'db', 'sql', 'os', 'sec', 'code', 'algo'];
const TYPES = ['term', 'code', 'sql', 'desc'];
let errors = 0; const err = (m) => { errors++; console.log('✗', m); };
const seenW = new Set(), seenP = new Set(); // 같은 개념을 필기(객관식)·실기(단답)로 따로 연습할 수 있으므로 중복 검사는 각 은행 안에서만 합니다
const seededPerm = (() => { const m = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8').match(/function seededPerm[\s\S]*?\n  }\n/)[0]; return eval('(' + m.replace('function seededPerm', 'function') + ')'); })();
const dist2 = [0, 0, 0, 0];
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
    const key = r[0] + (r[4] || ''); if (seenW.has(key)) err(`${id}: 중복 문제`); seenW.add(key);
    if (Array.isArray(r[1]) && r[1].length === 4 && r[2] >= 1 && r[2] <= 4) dist2[seededPerm(4, id).indexOf(r[2] - 1)]++;
  });
  wt += arr.length; console.log(area.padEnd(7), arr.length);
}
console.log('필기 합계', wt, '| 원본 정답 분포:', dist.slice(0, 4).join(' / '), '| 앱에서 섞은 뒤:', dist2.join(' / '));
console.log('— 실기 —'); let pt = 0;
for (const [area, arr] of Object.entries(D.practical || {})) {
  if (!PA.includes(area)) err(`알 수 없는 실기 영역: ${area}`);
  arr.forEach((r, i) => {
    const id = `p-${area}-${i + 1}`;
    if (!TYPES.includes(r[0])) err(`${id}: 유형 오류(${r[0]})`);
    if (typeof r[1] !== 'string' || !r[1].trim()) err(`${id}: 문제 없음`);
    if (!Array.isArray(r[2]) || (r[0] !== 'desc' && !r[2].length) || r[2].some((a) => typeof a !== 'string' || !a.trim())) err(`${id}: 정답 오류`);
    if (!r[3]) err(`${id}: 해설 없음`);
    const key = r[1] + (r[4] || ''); if (seenP.has(key)) err(`${id}: 중복 문제`); seenP.add(key);
  });
  pt += arr.length; console.log(area.padEnd(7), arr.length);
}
console.log('실기 합계', pt);
console.log('— 이론 —'); let tt = 0;
const balanced = (s) => ((s.match(/`/g) || []).length % 2 === 0) && ((s.replace(/`[^`]*`/g, '').match(/\*\*/g) || []).length % 2 === 0); // 코드 구간 안의 ** 는 제외
const needStr = (id, s, what) => { if (typeof s !== 'string' || !s.trim()) err(`${id}: ${what} 비어 있음`); else if (!balanced(s)) err(`${id}: ${what}에 ** 또는 \` 짝이 안 맞음 → ${s.slice(0, 30)}`); };
for (const [area, list] of Object.entries(D.theory || {})) {
  if (!WA.includes(area)) err(`알 수 없는 이론 영역: ${area}`);
  if (!Array.isArray(list) || !list.length) err(`이론 ${area}: 주제 없음`);
  const titles = new Set();
  list.forEach((t, i) => {
    const id = `th-${area}-${i + 1}`;
    needStr(id, t.t, '제목'); needStr(id, t.s, '요약'); if (titles.has(t.t)) err(`${id}: 제목 중복`); titles.add(t.t);
    if (!Array.isArray(t.b) || !t.b.length) { err(`${id}: 본문 없음`); return; }
    t.b.forEach((b, j) => {
      const bid = `${id} 블록${j + 1}(${b[0]})`;
      if (b[0] === 'p' || b[0] === 'tip') needStr(bid, b[1], '텍스트');
      else if (b[0] === 'code') { if (typeof b[1] !== 'string' || !b[1].trim()) err(`${bid}: 코드 비어 있음`); }
      else if (b[0] === 'ul' || b[0] === 'ol') { if (!Array.isArray(b[1]) || !b[1].length) err(`${bid}: 항목 없음`); else b[1].forEach((x) => needStr(bid, x, '항목')); }
      else if (b[0] === 'table') {
        if (!Array.isArray(b[1]) || !Array.isArray(b[2]) || !b[2].length) { err(`${bid}: 표 형식 오류`); return; }
        b[1].forEach((x) => needStr(bid, x, '표 머리글'));
        b[2].forEach((r, k) => { if (!Array.isArray(r) || r.length !== b[1].length) err(`${bid}: ${k + 1}번째 행의 칸 수(${r && r.length})가 머리글(${b[1].length})과 다름`); else r.forEach((x) => needStr(bid, x, '표 셀')); });
      } else err(`${bid}: 알 수 없는 블록 종류`);
    });
  });
  tt += list.length; console.log(area.padEnd(7), list.length);
}
console.log('이론 주제 합계', tt);
console.log(errors ? `\n오류 ${errors}건` : '\n✔ 검증 통과'); process.exit(errors ? 1 : 0);
