// 문제·이론 데이터 검증
//   node tools/validate.js              전체 검증 (이론이 목차와 하나라도 어긋나면 실패)
//   node tools/validate.js --partial    이론 작성 중: 아직 없는 항목은 경고로만 표시
//   node tools/validate.js --coverage   항목별로 해당하는 필기·실기 문제 수를 함께 출력
const fs = require('fs'), vm = require('vm'), path = require('path');
const FLAGS = new Set(process.argv.slice(2));
const ctx = { window: {} }; vm.createContext(ctx);
for (const f of ['written.js', 'practical.js', 'written2.js', 'practical2.js', 'written3.js', 'practical3.js', 'toc.js', 'theory1.js', 'theory2.js', 'theory3.js', 'theory4.js', 'theory5.js']) {
  const p = path.join(__dirname, '..', 'data', f);
  if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f });
}
const D = ctx.window.EIP_DATA || {};
const WA = ['design', 'dev', 'ds', 'db', 'lang', 'basic', 'method', 'sys'];
const PA = ['se', 'test', 'db', 'sql', 'os', 'sec', 'code', 'algo'];
const TYPES = ['term', 'code', 'sql', 'desc'];
let errors = 0, warns = 0;
const err = (m) => { errors++; console.log('✗', m); };
const warn = (m) => { warns++; console.log('△', m); };

// 같은 개념을 필기(객관식)·실기(단답)로 따로 연습할 수 있으므로 중복 검사는 각 은행 안에서만 합니다
const seenW = new Set(), seenP = new Set();
const seededPerm = (() => { const m = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8').match(/function seededPerm[\s\S]*?\n  }\n/)[0]; return eval('(' + m.replace('function seededPerm', 'function') + ')'); })();
const dist = [0, 0, 0, 0], dist2 = [0, 0, 0, 0];
const hay = { w: [], p: [] }; // 이론 항목의 키워드 집계용 (앱의 thRelated 와 같은 방식)
const H = (...xs) => xs.flat().filter(Boolean).join('\n').toLowerCase();

console.log('— 필기 —'); let wt = 0;
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
    hay.w.push({ id, text: H(r[0], r[4], r[3], r[1]) });
  });
  wt += arr.length; console.log(area.padEnd(7), arr.length);
}
console.log('필기 합계', wt, '| 원본 정답 분포:', dist.join(' / '), '| 앱에서 섞은 뒤:', dist2.join(' / '));

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
    hay.p.push({ id, text: H(r[1], r[4], r[3], r[2]) });
  });
  pt += arr.length; console.log(area.padEnd(7), arr.length);
}
console.log('실기 합계', pt);

console.log('— 이론 —');
const balanced = (s) => ((s.match(/`/g) || []).length % 2 === 0) && ((s.replace(/`[^`]*`/g, '').match(/\*\*/g) || []).length % 2 === 0); // 코드 구간 안의 ** 는 제외
const needStr = (id, s, what) => { if (typeof s !== 'string' || !s.trim()) err(`${id}: ${what} 비어 있음`); else if (!balanced(s)) err(`${id}: ${what}에 ** 또는 \` 짝이 안 맞음 → ${s.slice(0, 30)}`); };
const toc = D.toc || [], T = D.theory || {};
const inToc = new Map();
toc.forEach((sub, si) => {
  if (!sub.n || !Array.isArray(sub.ch) || !sub.ch.length) err(`목차 과목 ${si + 1}: 형식 오류`);
  (sub.ch || []).forEach((c, ci) => {
    if (!c.n || !Array.isArray(c.nos) || !c.nos.length) err(`목차 ${sub.n} › 대단원 ${ci + 1}: 형식 오류`);
    (c.nos || []).forEach((no) => { if (inToc.has(no)) err(`목차: ${no}번이 두 번 들어 있음`); inToc.set(no, `${sub.n} › ${c.n}`); });
  });
});
const missing = [...inToc.keys()].filter((no) => !T[no]).sort((a, b) => a - b);
const orphan = Object.keys(T).map(Number).filter((no) => !inToc.has(no));
if (orphan.length) err(`목차에 없는 이론 항목: ${orphan.join(', ')}`);
if (missing.length) (FLAGS.has('--partial') ? warn : err)(`아직 작성되지 않은 이론 항목 ${missing.length}개: ${missing.join(' ')}`);
const GR = ['A', 'B', 'C', 'D']; const gradeCount = { A: 0, B: 0, C: 0, D: 0 };
const cover = [];
for (const no of Object.keys(T).map(Number).sort((a, b) => a - b)) {
  const t = T[no], id = `th-${String(no).padStart(3, '0')}`;
  if (t.no !== no) err(`${id}: no(${t.no})가 키와 다름`);
  if (!GR.includes(t.g)) err(`${id}: 등급 오류(${t.g})`); else gradeCount[t.g]++;
  if (!WA.includes(t.a)) err(`${id}: 영역 오류(${t.a})`);
  needStr(id, t.t, '제목'); needStr(id, t.s, '요약');
  if (!Array.isArray(t.kw) || !t.kw.length || t.kw.some((k) => typeof k !== 'string' || !(k.trim().length >= 2 || /^[가-힣]$/.test(k.trim())))) err(`${id}: 키워드(kw) 오류`);
  if (!Array.isArray(t.b) || t.b.length < 2) { err(`${id}: 본문 블록이 너무 적음`); continue; }
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
  if (Array.isArray(t.kw)) {
    const kws = t.kw.map((k) => k.toLowerCase());
    const w = hay.w.filter((q) => kws.some((k) => q.text.includes(k))).length, p = hay.p.filter((q) => kws.some((k) => q.text.includes(k))).length;
    cover.push({ no, t: t.t, g: t.g, w, p });
  }
}
console.log('이론 항목', Object.keys(T).length, '/ 목차', inToc.size, '| 등급 분포', JSON.stringify(gradeCount));
if (FLAGS.has('--coverage')) {
  console.log('\n— 항목별 해당 문제 수 (필기 / 실기) —');
  for (const c of cover) console.log(`${String(c.no).padStart(3, '0')} ${c.g} ${String(c.w).padStart(3)} /${String(c.p).padStart(3)}  ${c.t}${c.w + c.p === 0 ? '   ← 문제 없음' : c.w < 2 ? '   ← 필기 부족' : ''}`);
  const none = cover.filter((c) => c.w + c.p === 0).length, low = cover.filter((c) => c.w < 2).length;
  console.log(`\n문제가 전혀 없는 항목 ${none}개 · 필기가 2문제 미만인 항목 ${low}개 (전체 ${cover.length}개)`);
}
console.log(errors ? `\n오류 ${errors}건` : warns ? `\n✔ 검증 통과 (경고 ${warns}건)` : '\n✔ 검증 통과'); process.exit(errors ? 1 : 0);
