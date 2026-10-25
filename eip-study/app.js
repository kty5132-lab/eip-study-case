'use strict';
(() => {
  /* ───────── 기본 유틸 ───────── */
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KEY = 'eip.state.v1', CKEY = 'eip.custom.v1', SKEY = 'eip.session.v1';
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch { /* 저장소 사용 불가 시 무시 */ } },
  };
  const pad = (n) => String(n).padStart(2, '0');
  const ds = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => ds(new Date());
  const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const DAY = 864e5, INTERVALS = [0, 1, 3, 7, 14, 30];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const mmss = (s) => (s >= 3600 ? `${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}` : `${pad(Math.floor(s / 60))}:${pad(s % 60)}`);
  let toastT;
  const toast = (m) => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200); };
  const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
  // 이론 본문용: `코드` 구간을 먼저 분리(그 안의 ** 는 그대로 표시)하고, 나머지에서만 **굵게** 허용. 모든 텍스트는 이스케이프
  const fmt = (s) => String(s).split(/(`[^`]*`)/).map((seg) => (seg.length > 1 && seg[0] === '`' && seg.endsWith('`') ? `<code>${esc(seg.slice(1, -1))}</code>` : esc(seg).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'))).join('');

  /* ───────── 시험 구조 ───────── */
  const W_AREAS = {
    design: { n: '소프트웨어 설계', s: '요구사항·UML·아키텍처·디자인패턴' },
    dev: { n: '소프트웨어 개발', s: '모듈·통합·테스트·인터페이스' },
    ds: { n: '자료구조', s: '스택·큐·트리·정렬·알고리즘' },
    db: { n: '데이터베이스', s: '모델링·정규화·SQL·트랜잭션' },
    lang: { n: '프로그래밍 언어', s: 'C·Java·Python·객체지향' },
    basic: { n: 'OS·네트워크', s: '운영체제·네트워크·개발환경' },
    method: { n: '개발 방법론', s: '애자일·프로젝트 관리·비용산정' },
    sys: { n: '정보시스템 구축관리', s: '보안·품질·신기술' },
  };
  const P_AREAS = {
    se: { n: '소프트웨어 공학·설계', s: 'UML·디자인패턴·아키텍처' },
    test: { n: '테스트·품질', s: '테스트 기법·결합도/응집도' },
    db: { n: '데이터베이스 이론', s: '정규화·키·트랜잭션' },
    sql: { n: 'SQL', s: 'DDL·DML·DCL·조인' },
    os: { n: 'OS·네트워크', s: '스케줄링·메모리·프로토콜' },
    sec: { n: '보안', s: '암호·공격 기법·인증' },
    code: { n: '코드 분석', s: 'C·Java·Python 출력 결과' },
    algo: { n: '자료구조·알고리즘', s: '트리 순회·정렬·복잡도' },
  };
  const PROFILES = {
    2026: { label: '~2026년 (5과목·100문항·150분)', min: 150, per: 20, subjects: [
      { n: '소프트웨어 설계', a: ['design'] }, { n: '소프트웨어 개발', a: ['dev', 'ds'] }, { n: '데이터베이스 구축', a: ['db'] },
      { n: '프로그래밍 언어 활용', a: ['lang', 'basic'] }, { n: '정보시스템 구축관리', a: ['method', 'sys'] }] },
    2027: { label: '2027년~ (4과목·80문항·120분)', min: 120, per: 20, subjects: [
      { n: '소프트웨어 개발', a: ['design', 'dev', 'method'] }, { n: '데이터베이스 구축', a: ['db'] },
      { n: '프로그래밍 언어 활용', a: ['lang', 'basic', 'ds'] }, { n: '정보시스템 구축관리', a: ['sys'] }] },
  };
  const TYPES = { term: '단답형', code: '코드 결과', sql: 'SQL 작성', desc: '서술형' };

  /* ───────── 상태 ───────── */
  const DEF = { exam: '2027', examDate: '', goal: 30, theme: 'auto' };
  let S = Object.assign({ prog: {}, hist: [], daily: {}, theory: {} }, store.get(KEY, {}));
  for (const k of Object.keys(S.theory || {})) if (!/^t\d+$/.test(k)) delete S.theory[k]; // 이전 형식(영역:순번)의 이론 진도는 폐기
  S.settings = Object.assign({}, DEF, S.settings);
  const save = () => store.set(KEY, S);
  let session = store.get(SKEY, null);
  const saveSess = () => (session ? store.set(SKEY, session) : store.del(SKEY));

  // 같은 id면 항상 같은 순열 (풀이 기록·진행 중인 세션과 어긋나지 않도록 시드 고정)
  function seededPerm(n, seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    const rnd = () => { h = (h + 0x6d2b79f5) | 0; let t = Math.imul(h ^ (h >>> 15), 1 | h); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function buildQuestions() {
    const out = [];
    const D = window.EIP_DATA || {};
    for (const [area, arr] of Object.entries(D.written || {}))
      arr.forEach((r, i) => {
        const id = `w-${area}-${i + 1}`, perm = seededPerm(r[1].length, id); // 보기 순서는 문제별로 고정된 무작위 배열
        out.push({ id, kind: 'w', area, q: r[0], c: perm.map((k) => r[1][k]), a: perm.indexOf(r[2] - 1) + 1, e: r[3] || '', code: r[4] || '' });
      });
    for (const [area, arr] of Object.entries(D.practical || {}))
      arr.forEach((r, i) => out.push({ id: `p-${area}-${i + 1}`, kind: 'p', area, type: r[0], q: r[1], ans: r[2] || [], e: r[3] || '', code: r[4] || '' }));
    for (const c of store.get(CKEY, [])) out.push(c);
    return out;
  }
  let Q = buildQuestions(), QM = new Map(Q.map((q) => [q.id, q]));
  const reloadQ = () => { Q = buildQuestions(); QM = new Map(Q.map((q) => [q.id, q])); };
  const areas = (kind) => (kind === 'w' ? W_AREAS : P_AREAS);
  const areaName = (q) => (areas(q.kind)[q.area] || { n: q.area }).n;
  const prog = (id) => S.prog[id];
  const isWrong = (q) => prog(q.id)?.n > 0 && prog(q.id).lastOk === false;
  const isBm = (q) => !!prog(q.id)?.bm;
  const dueList = () => Q.filter((q) => prog(q.id)?.n > 0 && prog(q.id).due <= Date.now()).sort((a, b) => prog(a.id).due - prog(b.id).due);

  function record(id, ok) {
    const p = (S.prog[id] ||= { n: 0, ok: 0, box: 0, due: 0, lastOk: null, bm: false });
    p.n++; if (ok) p.ok++;
    p.lastOk = ok; p.last = Date.now();
    p.box = ok ? Math.min(5, p.box + 1) : 0;
    p.due = ok ? startOfDay(Date.now()) + INTERVALS[p.box] * DAY : Date.now();
    const d = (S.daily[today()] ||= { n: 0, ok: 0 });
    d.n++; if (ok) d.ok++;
    save();
  }

  /* ───────── 채점 ───────── */
  const norm = (t) => String(t ?? '').toLowerCase().replace(/[\s.,;'"`·]/g, '');
  function autoJudge(q, text) {
    if (q.type === 'desc' || !q.ans.length) return null;
    const n = norm(text);
    return n.length > 0 && q.ans.some((a) => norm(a) === n);
  }
  const isOk = (s, q) => (q.kind === 'w' ? s.ans[q.id] === q.a : s.ans[q.id]?.ok === true);

  /* ───────── 세션(풀이) ───────── */
  function go(h) { if (location.hash === h) route(); else location.hash = h; }
  function startSession(o, ids) {
    if (!ids.length) return toast('조건에 맞는 문제가 없어요');
    session = Object.assign({ idx: 0, ans: {}, rec: {}, started: Date.now(), done: false, ids }, o);
    saveSess(); go('#/quiz');
  }
  const cur = () => QM.get(session.ids[session.idx]);

  function finish() {
    const s = session;
    if (s.mode === 'mock') s.ids.forEach((id) => { const q = QM.get(id); const a = s.ans[id]; if (a !== undefined && !s.rec[id]) { record(id, a === q.a); s.rec[id] = 1; } });
    const ok = s.ids.filter((id) => isOk(s, QM.get(id))).length;
    const r = { ok, total: s.ids.length, pct: pct(ok, s.ids.length), sec: Math.round((Date.now() - s.started) / 1000) };
    if (s.mode === 'mock') {
      r.subs = s.subjects.map((sub) => { const g = sub.ids.filter((id) => isOk(s, QM.get(id))).length; return { n: sub.n, ok: g, total: sub.ids.length, pct: pct(g, sub.ids.length) }; });
      r.avg = Math.round(r.subs.reduce((a, b) => a + b.pct, 0) / (r.subs.length || 1));
      r.pass = r.subs.every((x) => x.pct >= 40) && r.avg >= 60;
      S.hist.unshift({ t: Date.now(), exam: s.exam, avg: r.avg, pass: r.pass, subs: r.subs, sec: r.sec });
      S.hist = S.hist.slice(0, 100); save();
    }
    s.result = r; s.done = true; saveSess(); go('#/result');
  }

  /* ───────── 화면 조각 ───────── */
  const item = (ico, t, s, href, extra = '') => `<a class="item" href="${href}"><span class="ico">${ico}</span><span class="grow"><div class="t">${t}</div><div class="s">${s}</div></span>${extra}<span class="chev">›</span></a>`;
  const bar = (v, cls = '') => `<div class="bar ${cls}"><span style="width:${Math.max(0, Math.min(100, v))}%"></span></div>`;
  const codeBlock = (c) => (c ? `<pre class="code">${esc(c)}</pre>` : '');
  const mark = (n) => '①②③④⑤'[n - 1] || n;

  function reviewBody(q, userAns, noQ) {
    let h = noQ ? '' : `<div class="qtext">${esc(q.q)}</div>${codeBlock(q.code)}`;
    if (q.kind === 'w') {
      h += '<div class="choices">' + q.c.map((t, i) => {
        const n = i + 1; const cls = n === q.a ? 'right' : (userAns === n ? 'wrong' : '');
        return `<div class="choice ${cls}"><span class="n">${n}</span><span class="tx">${esc(t)}</span></div>`;
      }).join('') + '</div>';
    } else {
      if (userAns?.text) h += `<div class="explain"><b>내 답</b>\n${esc(userAns.text)}</div>`;
      h += `<div class="explain"><b>정답</b>\n${esc(q.ans.length ? q.ans[0] : q.e)}${q.ans.length > 1 ? `\n<span class="muted">허용: ${esc(q.ans.slice(1).join(' / '))}</span>` : ''}</div>`;
    }
    if (q.e && !(q.kind === 'p' && !q.ans.length)) h += `<div class="explain">${esc(q.e)}</div>`;
    return h;
  }
  const qList = (qs, s) => qs.map((q) => {
    const good = s ? isOk(s, q) : null;
    const tag = good === null ? (isBm(q) ? '<span class="badge warn">★</span>' : '') : good ? '<span class="badge ok">정답</span>' : '<span class="badge bad">오답</span>';
    const body = reviewBody(q, s ? s.ans[q.id] : undefined);
    return `<details class="card"><summary class="row between" style="cursor:pointer"><span class="grow" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(q.q.split('\n')[0])}</span>${tag}</summary><div class="muted" style="margin-top:8px">${esc(areaName(q))}</div>${body}
      <div class="btn-row"><button class="btn" data-act="bm" data-arg="${q.id}">${isBm(q) ? '★ 북마크 해제' : '☆ 북마크'}</button>${q.kind === 'w' && thByArea(q.area).length ? `<a class="btn" href="#/theory/a/${q.area}">📖 이론 보기</a>` : ''}</div></details>`;
  }).join('');

  /* ───────── 화면(라우트) ───────── */
  const VIEWS = {};

  VIEWS.home = () => {
    const d = S.daily[today()] || { n: 0, ok: 0 };
    const due = dueList().length;
    const wq = Q.filter((q) => q.kind === 'w').length, pq = Q.length - wq;
    let h = '';
    if (session && !session.done) {
      h += `<div class="card"><div class="row between"><div><div class="t"><b>풀던 문제가 있어요</b></div><div class="muted">${esc(session.label)} · ${session.idx + 1}/${session.ids.length}</div></div></div>
        <div class="btn-row"><button class="btn danger" data-act="dropSession">버리기</button><a class="btn primary" href="#/quiz">이어서 풀기</a></div></div>`;
    } else if (session && session.done) {
      h += `<a class="item" href="#/result"><span class="ico">🧾</span><span class="grow"><div class="t">직전 결과 보기</div><div class="s">${esc(session.label)} · ${session.result.pct}점</div></span><span class="chev">›</span></a>`;
    }
    if (S.settings.examDate) {
      const diff = Math.round((startOfDay(new Date(S.settings.examDate + 'T00:00')) - startOfDay(Date.now())) / DAY);
      h += `<div class="card row between"><div><div class="muted">시험일 ${esc(S.settings.examDate)}</div><div class="big">${diff > 0 ? 'D-' + diff : diff === 0 ? 'D-DAY' : 'D+' + -diff}</div></div><div class="muted" style="text-align:right">${esc(PROFILES[S.settings.exam].label)}</div></div>`;
    }
    h += `<div class="card"><div class="row between"><b>오늘 학습</b><span class="muted">${d.n} / ${S.settings.goal}문제 · 정답 ${pct(d.ok, d.n)}%</span></div><div style="margin-top:8px">${bar(pct(d.n, S.settings.goal))}</div></div>`;
    h += `<h2>바로 시작</h2>`;
    h += item('🔁', `복습할 문제 <span class="badge ${due ? 'warn' : ''}">${due}</span>`, '틀린 문제는 바로, 맞힌 문제는 1·3·7·14·30일 뒤에 다시 나와요', '#/review');
    h += `<button class="item" data-act="quick" data-arg="w"><span class="ico">⚡</span><span class="grow"><div class="t">필기 랜덤 10문제</div><div class="s">안 푼 문제와 오래된 문제를 우선으로 섞어요</div></span><span class="chev">›</span></button>`;
    h += `<button class="item" data-act="quick" data-arg="p"><span class="ico">⚡</span><span class="grow"><div class="t">실기 랜덤 5문제</div><div class="s">단답·코드·SQL·서술</div></span><span class="chev">›</span></button>`;
    h += item('⏱️', '필기 모의고사', PROFILES[S.settings.exam].label, '#/mock');
    if (S.hist[0]) {
      const x = S.hist[0];
      h += `<h2>최근 모의고사</h2><div class="card row between"><span>${new Date(x.t).toLocaleDateString('ko-KR')}</span><span><b>${x.avg}점</b> <span class="badge ${x.pass ? 'ok' : 'bad'}">${x.pass ? '합격권' : '불합격'}</span></span></div>`;
    }
    h += `<p class="muted" style="text-align:center;margin-top:20px">문제 은행: 필기 ${wq}문항 · 실기 ${pq}문항</p>`;
    return { title: '정처기 학습', tab: 'home', html: h };
  };

  const menu = (kind) => {
    const A = areas(kind), qs = Q.filter((q) => q.kind === kind);
    const wrong = qs.filter(isWrong).length, bm = qs.filter(isBm).length;
    let h = kind === 'w' ? item('📖', '이론 공부', `5과목 · ${thProgress().total}개 항목 · 읽음 ${thProgress().read}`, '#/theory') : '';
    h += item('🎯', '영역별 연습', '영역·문제 수·범위를 골라서 풀기', `#/setup/${kind}`);
    if (kind === 'w') h += item('⏱️', '모의고사', PROFILES[S.settings.exam].label + ' · 타이머·과락 판정', '#/mock');
    h += item('❌', `오답노트 <span class="badge ${wrong ? 'bad' : ''}">${wrong}</span>`, '마지막에 틀린 문제', `#/list/wrong/${kind}`);
    h += item('⭐', `북마크 <span class="badge">${bm}</span>`, '표시해 둔 문제', `#/list/bm/${kind}`);
    h += '<h2>영역별 현황</h2>';
    h += Object.entries(A).map(([k, v]) => {
      const aq = qs.filter((q) => q.area === k), done = aq.filter((q) => prog(q.id)?.n > 0);
      const n = done.reduce((a, q) => a + prog(q.id).n, 0), ok = done.reduce((a, q) => a + prog(q.id).ok, 0);
      return `<div class="card"><div class="row between"><b>${v.n}</b><span class="muted">${done.length}/${aq.length}문제 · 정답률 ${pct(ok, n)}%</span></div><div class="muted">${v.s}</div><div style="margin-top:6px">${bar(pct(done.length, aq.length))}</div></div>`;
    }).join('');
    return { title: kind === 'w' ? '필기' : '실기', tab: kind === 'w' ? 'written' : 'practical', html: h };
  };
  VIEWS.written = () => menu('w');
  VIEWS.practical = () => menu('p');

  const SU = { w: { areas: [], n: 10, range: 'all' }, p: { areas: [], n: 5, range: 'all' } };
  VIEWS.setup = ([kind = 'w']) => {
    const u = SU[kind], A = areas(kind);
    const pool = poolFor(kind, u);
    const h = `<h2>영역 (선택 없으면 전체)</h2><div class="chips">${Object.entries(A).map(([k, v]) => `<button class="chip ${u.areas.includes(k) ? 'on' : ''}" data-act="suArea" data-arg="${kind}:${k}">${v.n}</button>`).join('')}</div>
      <h2>범위</h2><div class="seg">${[['all', '전체'], ['new', '안 푼 것'], ['wrong', '오답'], ['bm', '★']].map(([k, l]) => `<button class="${u.range === k ? 'on' : ''}" data-act="suRange" data-arg="${kind}:${k}">${l}</button>`).join('')}</div>
      <h2>문제 수</h2><div class="chips">${[5, 10, 20, 40, 0].map((n) => `<button class="chip ${u.n === n ? 'on' : ''}" data-act="suN" data-arg="${kind}:${n}">${n ? n + '문제' : '전부'}</button>`).join('')}</div>
      <p class="muted" style="margin-top:14px">조건에 맞는 문제 ${pool.length}개</p>
      <button class="btn primary block" data-act="suStart" data-arg="${kind}">시작하기</button>`;
    return { title: kind === 'w' ? '필기 연습' : '실기 연습', back: kind === 'w' ? '#/written' : '#/practical', tab: kind === 'w' ? 'written' : 'practical', html: h };
  };
  function poolFor(kind, u) {
    return Q.filter((q) => q.kind === kind && (!u.areas.length || u.areas.includes(q.area)) &&
      (u.range === 'all' || (u.range === 'new' && !(prog(q.id)?.n > 0)) || (u.range === 'wrong' && isWrong(q)) || (u.range === 'bm' && isBm(q))));
  }

  VIEWS.mock = () => {
    const prof = PROFILES[S.settings.exam];
    const rows = prof.subjects.map((sub) => {
      const pool = Q.filter((q) => q.kind === 'w' && sub.a.includes(q.area)).length;
      return `<tr><td>${sub.n}</td><td>${Math.min(pool, prof.per)} / ${prof.per}</td></tr>`;
    }).join('');
    const short = prof.subjects.some((sub) => Q.filter((q) => q.kind === 'w' && sub.a.includes(q.area)).length < prof.per);
    const h = `<div class="card"><b>${esc(prof.label)}</b><div class="muted">과목당 40점 이상 + 평균 60점 이상이면 합격</div>
      <table class="t" style="margin-top:8px"><tr><th>과목</th><th>출제 문항</th></tr>${rows}</table>
      ${short ? '<p class="muted">⚠️ 일부 과목은 문제 은행이 20문항보다 적어요. 설정 → 문제 추가로 늘릴 수 있어요.</p>' : ''}
      <p class="muted">제한시간 ${prof.min}분 · 제출 전에는 정답이 보이지 않아요.</p></div>
      <button class="btn primary block" data-act="mockStart">모의고사 시작</button>
      <p class="muted" style="text-align:center">시험 기준은 설정에서 바꿀 수 있어요.</p>`;
    return { title: '모의고사', back: '#/written', tab: 'written', html: h };
  };

  VIEWS.list = ([type, kind]) => {
    const qs = Q.filter((q) => q.kind === kind && (type === 'wrong' ? isWrong(q) : isBm(q)));
    const name = type === 'wrong' ? '오답노트' : '북마크';
    let h = qs.length ? `<button class="btn primary block" data-act="listStart" data-arg="${type}:${kind}" style="margin-bottom:12px">전부 풀기 (${qs.length})</button>${qList(qs.slice(0, 100), null)}` : `<div class="empty">${name}가 비어 있어요 👍</div>`;
    return { title: name, back: kind === 'w' ? '#/written' : '#/practical', tab: kind === 'w' ? 'written' : 'practical', html: h };
  };

  VIEWS.review = () => {
    const due = dueList();
    const boxes = [0, 0, 0, 0, 0, 0];
    Q.forEach((q) => { const p = prog(q.id); if (p?.n > 0) boxes[p.box]++; });
    const tomorrow = Q.filter((q) => { const p = prog(q.id); return p?.n > 0 && p.due > Date.now() && p.due <= startOfDay(Date.now()) + 2 * DAY; }).length;
    let h = `<div class="card"><div class="big">${due.length}<span class="muted" style="font-size:15px;font-weight:400"> 문제 대기</span></div><div class="muted">내일까지 예정 ${tomorrow}문제</div>
      ${due.length ? `<div class="btn-row"><button class="btn primary" data-act="reviewStart" data-arg="w">필기 복습</button><button class="btn primary" data-act="reviewStart" data-arg="p">실기 복습</button></div>` : '<p class="muted">오늘 복습할 문제를 모두 끝냈어요 🎉</p>'}</div>
      <h2>학습 단계별 문제 수</h2><div class="card">${['오늘 다시', '1일', '3일', '7일', '14일', '30일'].map((l, i) => `<div class="row between" style="padding:3px 0"><span>${l}</span><b>${boxes[i]}</b></div>`).join('')}</div>
      <p class="muted">맞히면 다음 단계(더 긴 간격)로, 틀리면 '오늘 다시'로 돌아가요.</p>`;
    return { title: '복습', tab: 'review', html: h };
  };

  VIEWS.stats = () => {
    let tn = 0, tok = 0;
    Object.values(S.prog).forEach((p) => { tn += p.n; tok += p.ok; });
    const seen = Q.filter((q) => prog(q.id)?.n > 0).length;
    const days = [];
    for (let i = 13; i >= 0; i--) { const k = ds(new Date(Date.now() - i * DAY)); days.push([k, S.daily[k]?.n || 0]); }
    const max = Math.max(10, ...days.map((d) => d[1]));
    let h = `<div class="grid2"><div class="card"><div class="muted">푼 문제</div><div class="big">${seen}<span class="muted" style="font-size:14px">/${Q.length}</span></div></div><div class="card"><div class="muted">누적 정답률</div><div class="big">${pct(tok, tn)}%</div></div></div>
      <h2>최근 14일 풀이 수</h2><div class="card"><div style="display:flex;align-items:flex-end;gap:4px;height:90px">${days.map(([k, n]) => `<div title="${k}: ${n}" style="flex:1;background:var(--primary);opacity:${n ? 1 : .15};height:${Math.max(3, (n / max) * 100)}%;border-radius:3px"></div>`).join('')}</div><div class="row between muted"><span>${days[0][0].slice(5)}</span><span>오늘</span></div></div>`;
    for (const kind of ['w', 'p']) {
      h += `<h2>${kind === 'w' ? '필기' : '실기'} 영역별 정답률</h2><div class="card">` + Object.entries(areas(kind)).map(([k, v]) => {
        const aq = Q.filter((q) => q.kind === kind && q.area === k);
        const n = aq.reduce((a, q) => a + (prog(q.id)?.n || 0), 0), ok = aq.reduce((a, q) => a + (prog(q.id)?.ok || 0), 0);
        const p = pct(ok, n);
        return `<div style="margin:8px 0"><div class="row between"><span>${v.n}</span><span class="muted">${n ? p + '%' : '-'} (${n}회)</span></div>${bar(p, n && p < 60 ? 'bad' : 'ok')}</div>`;
      }).join('') + '</div>';
    }
    h += '<h2>모의고사 기록</h2>' + (S.hist.length ? S.hist.slice(0, 10).map((x) => `<div class="card"><div class="row between"><span>${new Date(x.t).toLocaleDateString('ko-KR')} · ${x.exam}년 기준</span><span><b>${x.avg}점</b> <span class="badge ${x.pass ? 'ok' : 'bad'}">${x.pass ? '합격권' : '불합격'}</span></span></div><div class="muted">${x.subs.map((s) => `${s.n} ${s.pct}`).join(' · ')}</div></div>`).join('') : '<div class="empty">아직 기록이 없어요</div>');
    return { title: '통계', tab: 'stats', html: h };
  };

  /* ── 이론 공부 (목차 구조: 과목 → 대단원 → 001~157 항목) ── */
  const TH = () => (window.EIP_DATA || {}).theory || {};   // { 번호: { no, g(빈출 등급), a(영역), t, s, kw, b } }
  const TOC = () => (window.EIP_DATA || {}).toc || [];     // [{ n, ch: [{ n, nos }] }]
  const thKey = (no) => 't' + no;
  const thStat = (no) => (S.theory || {})[thKey(no)];
  const thNos = () => Object.keys(TH()).map(Number).sort((x, y) => x - y);
  const thByArea = (area) => thNos().filter((n) => TH()[n].a === area);
  const pad3 = (n) => String(n).padStart(3, '0');
  const GRADES = { A: '매 회차 출제', B: '2회에 1번꼴', C: '3회에 1번꼴', D: '4회에 1번꼴' };
  let thGrade = 'all'; // 출제 빈도 필터 (화면을 이동해도 유지)
  const thShow = (no) => thGrade === 'all' || TH()[no].g === thGrade;
  const gradeBadge = (g) => `<span class="gr gr-${g}" title="${GRADES[g] || ''}">${g}</span>`;
  const thBadge = (s) => (s === 'read' ? '<span class="badge ok">읽음</span>' : s === 'confused' ? '<span class="badge warn">헷갈림</span>' : '');
  function thProgress(nos) {
    nos = nos || thNos(); let read = 0, confused = 0;
    nos.forEach((n) => { const st = thStat(n); if (st === 'read') read++; else if (st === 'confused') confused++; });
    return { total: nos.length, read, confused };
  }
  let thLocMap = null;
  const thLoc = (no) => { // 번호 → 과목/대단원 위치
    if (!thLocMap) { thLocMap = new Map(); TOC().forEach((sub, si) => sub.ch.forEach((c, ci) => c.nos.forEach((n) => thLocMap.set(n, { si, ci })))); }
    return thLocMap.get(no);
  };
  function thBlock([k, x, y]) {
    if (k === 'p') return `<p>${fmt(x)}</p>`;
    if (k === 'ul' || k === 'ol') return `<${k}>${x.map((i) => `<li>${fmt(i)}</li>`).join('')}</${k}>`;
    if (k === 'table') return `<div class="tbl"><table class="th"><thead><tr>${x.map((c) => `<th>${fmt(c)}</th>`).join('')}</tr></thead><tbody>${y.map((r) => `<tr>${r.map((c) => `<td>${fmt(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    if (k === 'tip') return `<div class="tip">💡 ${fmt(x)}</div>`;
    if (k === 'code') return `<pre class="code">${esc(x)}</pre>`;
    return '';
  }
  const qText = new Map(); // 관련 문제 검색용 소문자 평문 캐시
  const qHay = (q) => { let t = qText.get(q.id); if (t === undefined) { t = [q.q, q.code, q.e, ...(q.c || []), ...(q.ans || [])].join('\n').toLowerCase(); qText.set(q.id, t); } return t; };
  function thRelated(no, kind) { // 항목의 키워드(kw)가 문제 본문·보기·정답·해설에 들어 있는 문제
    const t = TH()[no]; if (!t || !t.kw || !t.kw.length) return [];
    const kws = t.kw.map((k) => k.toLowerCase());
    return Q.filter((q) => q.kind === kind && kws.some((k) => qHay(q).includes(k)));
  }
  const thItem = (no) => { const t = TH()[no]; return `<a class="item" href="#/theory/t/${no}"><span class="no">${pad3(no)}</span><span class="grow"><div class="t">${esc(t.t)}</div><div class="s">${esc(t.s)}</div></span>${gradeBadge(t.g)}${thBadge(thStat(no))}<span class="chev">›</span></a>`; };
  const gradeChips = () => `<div class="chips" style="margin:6px 0 4px">${['all', 'A', 'B', 'C', 'D'].map((g) => `<button class="chip ${thGrade === g ? 'on' : ''}" data-act="thGrade" data-arg="${g}">${g === 'all' ? '전체' : g + ' 등급'}</button>`).join('')}</div><div class="muted" style="font-size:12px;margin-bottom:6px">출제 빈도: A 매 회차 · B 2회에 1번 · C 3회에 1번 · D 4회에 1번꼴 (교재 목차의 표시를 따랐고 일부는 추정)</div>`;
  let thIndex = null; // 검색용 평문 색인 (최초 검색 시 생성)
  function thSearch(q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    if (!thIndex) {
      thIndex = thNos().map((no) => {
        const t = TH()[no];
        const text = [t.t, t.s, ...(t.kw || []), ...t.b.map((b) => (b[0] === 'table' ? [...b[1], ...b[2].flat()].join(' ') : Array.isArray(b[1]) ? b[1].join(' ') : b[1]))].join(' ').toLowerCase();
        return { no, t: t.t, s: t.s, g: t.g, title: t.t.toLowerCase(), key: pad3(no), text };
      });
    }
    return thIndex.map((e) => ({ e, score: (e.key === q || String(e.no) === q ? 5 : 0) + (e.title.includes(q) ? 3 : 0) + (e.text.includes(q) ? 1 : 0) })).filter((x) => x.score).sort((x, y) => y.score - x.score || x.e.no - y.e.no).slice(0, 30).map((x) => x.e);
  }

  function thIndexView() {
    const all = thProgress(), toc = TOC();
    let h = `<div class="card"><div class="row between"><b>이론 진도</b><span class="muted">읽음 ${all.read} · 헷갈림 ${all.confused} / ${all.total}</span></div><div style="margin-top:8px">${bar(pct(all.read, all.total))}</div></div>
      <input id="th-q" type="search" placeholder="이론 검색 (예: 정규화, OSI, 067)" autocomplete="off" enterkeyhint="search" data-search="1" style="margin-bottom:6px"><div id="th-results"></div><div id="th-list">${gradeChips()}`;
    h += toc.map((sub, si) => {
      const nos = sub.ch.flatMap((c) => c.nos).filter((n) => TH()[n]), shown = nos.filter(thShow), p = thProgress(nos);
      return `<a class="item" href="#/theory/s/${si}"><span class="no">${si + 1}</span><span class="grow"><div class="t">${esc(sub.n)}</div><div class="s">대단원 ${sub.ch.length}개 · 항목 ${thGrade === 'all' ? nos.length : `${shown.length}/${nos.length}`}개</div><div style="margin-top:6px">${bar(pct(p.read, p.total))}</div></span><span class="muted">${p.read}/${p.total}</span><span class="chev">›</span></a>`;
    }).join('');
    h += `<h2>영역별로 보기</h2><div class="chips">${Object.entries(W_AREAS).filter(([k]) => thByArea(k).length).map(([k, v]) => `<a class="chip" style="display:inline-flex;align-items:center;text-decoration:none" href="#/theory/a/${k}">${esc(v.n)} ${thByArea(k).length}</a>`).join('')}</div></div>`;
    return { title: '이론 공부', back: '#/written', tab: 'written', html: h };
  }
  function thSubject(si) {
    const sub = TOC()[si];
    let h = `<div class="muted" style="margin:0 2px">${esc(sub.n)} · 대단원 ${sub.ch.length}개</div>${gradeChips()}`;
    sub.ch.forEach((c, ci) => {
      const nos = c.nos.filter((n) => TH()[n]), shown = nos.filter(thShow), p = thProgress(nos);
      h += `<h2>${ci + 1}. ${esc(c.n)} <span style="font-weight:400">· ${p.read}/${p.total} 읽음</span></h2>`;
      h += shown.length ? shown.map(thItem).join('') : '<div class="muted" style="margin:0 2px 8px">선택한 등급의 항목이 없어요</div>';
    });
    return { title: sub.n, back: '#/theory', tab: 'written', html: h };
  }
  function thArea(area) {
    const nos = thByArea(area), n = Q.filter((q) => q.kind === 'w' && q.area === area).length;
    let h = `<p class="muted" style="margin:0 2px 4px">${esc(W_AREAS[area].s)}</p>${gradeChips()}`;
    h += nos.filter(thShow).map(thItem).join('') || '<div class="muted" style="margin:0 2px 8px">선택한 등급의 항목이 없어요</div>';
    h += `<button class="btn primary block" data-act="thPractice" data-arg="${area}" style="margin-top:12px">이 영역 문제 풀기 (필기 ${n}문제 중 10문제)</button>`;
    return { title: W_AREAS[area].n, back: '#/theory', tab: 'written', html: h };
  }
  function thTopic(no) {
    const t = TH()[no], st = thStat(no), loc = thLoc(no), toc = TOC(), nos = thNos(), idx = nos.indexOf(no);
    const where = loc ? `${toc[loc.si].n} › ${toc[loc.si].ch[loc.ci].n}` : '';
    const rw = thRelated(no, 'w').length, rp = thRelated(no, 'p').length;
    let h = `<div class="muted" style="margin:0 2px 4px">${esc(where)}</div><h3 class="th-title"><span class="no">${pad3(no)}</span> ${esc(t.t)} ${gradeBadge(t.g)}</h3><div class="th-body">${t.b.map(thBlock).join('')}</div>
      <div class="btn-row"><button class="btn ${st === 'confused' ? 'primary' : ''}" data-act="thMark" data-arg="${no}:confused">❓ 헷갈려요</button><button class="btn ${st === 'read' ? 'primary' : ''}" data-act="thMark" data-arg="${no}:read">✓ 읽었어요</button></div>
      <h2>이 주제 문제 풀기</h2>
      <div class="btn-row" style="margin-top:0"><button class="btn" data-act="thRelated" data-arg="${no}:w" ${rw ? '' : 'disabled'}>📝 필기 ${rw}문제</button><button class="btn" data-act="thRelated" data-arg="${no}:p" ${rp ? '' : 'disabled'}>⌨️ 실기 ${rp}문제</button></div>
      <div class="btn-row">${idx > 0 ? `<a class="btn" href="#/theory/t/${nos[idx - 1]}">‹ ${pad3(nos[idx - 1])}</a>` : '<span></span>'}${idx < nos.length - 1 ? `<a class="btn" href="#/theory/t/${nos[idx + 1]}">${pad3(nos[idx + 1])} ›</a>` : '<span></span>'}</div>`;
    return { title: `${pad3(no)} ${t.t}`, back: loc ? `#/theory/s/${loc.si}` : '#/theory', tab: 'written', html: h };
  }
  VIEWS.theory = ([mode, arg]) => {
    if (!thNos().length) return { title: '이론 공부', back: '#/written', tab: 'written', html: '<div class="empty">이론 데이터가 없어요</div>' };
    if (mode === 't' && TH()[+arg]) return thTopic(+arg);
    if (mode === 's' && TOC()[+arg]) return thSubject(+arg);
    if (mode === 'a' && W_AREAS[arg]) return thArea(arg);
    return thIndexView();
  };

  /* ── 퀴즈 ── */
  VIEWS.quiz = () => {
    const s = session;
    if (!s) return { redirect: '#/' };
    if (s.done) return { redirect: '#/result' };
    s.ids = s.ids.filter((id) => QM.has(id));
    if (!s.ids.length) { session = null; saveSess(); return { redirect: '#/' }; }
    s.idx = Math.min(s.idx, s.ids.length - 1);
    const q = cur(), n = s.ids.length, mock = s.mode === 'mock';
    const head = `<div class="progress"><div class="qno">${s.idx + 1} / ${n} · ${esc(areaName(q))}${q.type ? ' · ' + TYPES[q.type] : ''}${isBm(q) ? ' · ★' : ''}</div>${bar(((s.idx + 1) / n) * 100)}</div>`;
    const last = s.idx === n - 1;
    const star = `<button class="btn star ${isBm(q) ? 'on' : ''}" data-act="bm" data-arg="${q.id}" aria-label="북마크">${isBm(q) ? '★' : '☆'}</button>`;
    let body = `<div class="qtext">${esc(q.q)}</div>${codeBlock(q.code)}`, bottom = '';
    if (q.kind === 'w') {
      const sel = s.ans[q.id], reveal = !mock && sel !== undefined;
      body += '<div class="choices">' + q.c.map((t, i) => {
        const k = i + 1; let cls = '';
        if (reveal) cls = k === q.a ? 'right' : k === sel ? 'wrong' : ''; else if (sel === k) cls = 'sel';
        return `<button class="choice ${cls}" data-act="pick" data-arg="${k}"><span class="n">${k}</span><span class="tx">${esc(t)}</span></button>`;
      }).join('') + '</div>';
      if (reveal) body += `<div class="explain"><div class="verdict ${sel === q.a ? 'ok' : 'bad'}">${sel === q.a ? '정답!' : sel === 0 ? `모르겠음 → 정답 ${mark(q.a)}` : `오답 → 정답 ${mark(q.a)}`}</div>${esc(q.e)}${thByArea(q.area).length ? `\n<a class="th-link" href="#/theory/a/${q.area}">📖 ${esc(areaName(q))} 이론 보기</a>` : ''}</div>`;
      if (mock) {
        body += `<h2>문항 이동</h2><div class="chips">${s.ids.map((id, i) => `<button class="chip ${i === s.idx ? 'on' : ''}" style="min-width:42px;padding:0 8px;${s.ans[id] !== undefined && i !== s.idx ? 'border-color:var(--primary)' : ''}" data-act="jump" data-arg="${i}">${i + 1}</button>`).join('')}</div>
          <p class="muted">답한 문항 ${Object.keys(s.ans).length}/${n} · 파란 테두리는 답한 문항</p><button class="btn block" data-act="submit" style="margin-top:8px">제출하기</button>`;
        bottom = `${star}<button class="btn" data-act="prev" ${s.idx === 0 ? 'disabled' : ''}>이전</button><button class="btn primary" data-act="${last ? 'submit' : 'next'}">${last ? '제출' : '다음'}</button>`;
      } else if (reveal) bottom = `${star}<button class="btn primary" data-act="next">${last ? '결과 보기' : '다음 문제'}</button>`;
      else bottom = `${star}<button class="btn" data-act="skip">모르겠어요</button>`;
    } else {
      const a = s.ans[q.id];
      if (!a) {
        const multi = q.type === 'sql' || q.type === 'desc';
        body += `<label class="field" for="ans-input">내 답안</label>${multi ? '<textarea id="ans-input" rows="4" autocomplete="off" autocapitalize="off" spellcheck="false" style="font-family:inherit;font-size:16px"></textarea>' : '<input id="ans-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done">'}`;
        bottom = `${star}<button class="btn" data-act="reveal" data-arg="skip">모르겠어요</button><button class="btn primary" data-act="reveal">정답 확인</button>`;
      } else {
        const sug = a.auto;
        body += reviewBody(q, a, true);
        body += `<p class="muted">${sug === null ? '서술형은 직접 채점해 주세요.' : sug ? '✅ 자동 채점: 정답으로 보여요.' : '❌ 자동 채점: 정답과 달라요. (표현 차이라면 직접 맞음 처리)'}</p>`;
        bottom = `${star}<button class="btn ${sug === false ? 'primary' : ''}" data-act="judge" data-arg="0">✗ 틀림</button><button class="btn ${sug ? 'primary' : ''}" data-act="judge" data-arg="1">✓ 맞음</button>`;
      }
    }
    return {
      title: s.label, back: '#/', focus: true,
      html: `${head}<div class="card">${body}</div><div class="actionbar">${bottom}</div>`,
      timer: mock,
    };
  };

  VIEWS.result = () => {
    const s = session;
    if (!s || !s.done) return { redirect: '#/' };
    const r = s.result, mock = s.mode === 'mock';
    let h = '<div class="card" style="text-align:center">';
    if (mock) {
      h += `<div class="muted">${esc(PROFILES[s.exam].label)}</div><div class="score-ring ${r.pass ? 'pass' : 'fail'}">${r.avg}점</div><div class="verdict ${r.pass ? 'ok' : 'bad'}">${r.pass ? '합격권 🎉' : r.subs.some((x) => x.pct < 40) ? '과락 과목이 있어요' : '평균 60점 미만'}</div><div class="muted">소요 ${mmss(r.sec)}</div></div>
        <h2>과목별 점수 (과락 40점)</h2><div class="card">${r.subs.map((x) => `<div style="margin:8px 0"><div class="row between"><span>${esc(x.n)}</span><b class="${x.pct < 40 ? 'fail' : ''}">${x.pct}점 <span class="muted">(${x.ok}/${x.total})</span></b></div>${bar(x.pct, x.pct < 40 ? 'bad' : 'ok')}</div>`).join('')}</div>`;
    } else {
      h += `<div class="score-ring">${r.ok}<span class="muted" style="font-size:20px"> / ${r.total}</span></div><div class="muted">정답률 ${r.pct}% · ${mmss(r.sec)}</div></div>`;
    }
    const wrong = s.ids.filter((id) => !isOk(s, QM.get(id)));
    h += `<div class="btn-row">${wrong.length ? `<button class="btn primary" data-act="retryWrong">틀린 ${wrong.length}문제 다시</button>` : ''}<button class="btn" data-act="closeResult">홈으로</button></div>`;
    h += '<h2>문항별 결과</h2>' + qList(s.ids.map((id) => QM.get(id)), s);
    return { title: '결과', focus: false, tab: 'home', html: h };
  };

  /* ── 설정 ── */
  const ADD = { kind: 'w' };
  VIEWS.settings = ([sub]) => {
    if (sub === 'add') return vAdd();
    if (sub === 'data') return vData();
    const st = S.settings;
    const h = `<h2>시험 기준</h2><div class="seg">${Object.keys(PROFILES).map((k) => `<button class="${st.exam === k ? 'on' : ''}" data-act="setExam" data-arg="${k}">${k === '2026' ? '~2026년' : '2027년~'}</button>`).join('')}</div>
      <p class="muted">${esc(PROFILES[st.exam].label)}<br>2027년 개편(4과목)은 교재·강의 정보 기준이라, 응시 전 Q-Net 공고를 꼭 확인하세요.</p>
      <label class="field" for="s-date">시험일 (D-day)</label><input id="s-date" type="date" value="${esc(st.examDate)}" data-change="examDate">
      <label class="field" for="s-goal">하루 목표 문제 수</label><input id="s-goal" type="number" inputmode="numeric" min="5" max="500" value="${st.goal}" data-change="goal">
      <h2>화면</h2><div class="seg">${[['auto', '자동'], ['light', '라이트'], ['dark', '다크']].map(([k, l]) => `<button class="${st.theme === k ? 'on' : ''}" data-act="setTheme" data-arg="${k}">${l}</button>`).join('')}</div>
      <h2>문제 · 데이터</h2>${item('✏️', '문제 추가·관리', '내가 가진 기출·오답 문제 직접 입력, JSON 가져오기', '#/settings/add')}${item('💾', '백업 · 복원 · 초기화', '기기를 바꾸거나 브라우저 데이터를 지우기 전에 백업', '#/settings/data')}
      <h2>설치 방법</h2><div class="card muted">📱 <b>iPhone</b>: Safari 공유 버튼 → ‘홈 화면에 추가’<br>🤖 <b>Android</b>: Chrome 메뉴 → ‘앱 설치/홈 화면에 추가’<br>설치하면 전체 화면으로 실행되고 오프라인에서도 동작해요.</div>`;
    return { title: '설정', tab: 'settings', html: h };
  };

  function vAdd() {
    const k = ADD.kind, A = areas(k);
    const custom = store.get(CKEY, []);
    const h = `<div class="seg"><button class="${k === 'w' ? 'on' : ''}" data-act="addKind" data-arg="w">필기(객관식)</button><button class="${k === 'p' ? 'on' : ''}" data-act="addKind" data-arg="p">실기</button></div>
      <label class="field" for="f-area">영역</label><select id="f-area">${Object.entries(A).map(([a, v]) => `<option value="${a}">${v.n}</option>`).join('')}</select>
      ${k === 'p' ? `<label class="field" for="f-type">유형</label><select id="f-type">${Object.entries(TYPES).map(([a, v]) => `<option value="${a}">${v}</option>`).join('')}</select>` : ''}
      <label class="field" for="f-q">문제</label><textarea id="f-q" rows="3" style="font-family:inherit;font-size:16px"></textarea>
      <label class="field" for="f-code">코드 (선택)</label><textarea id="f-code" rows="3" spellcheck="false" autocapitalize="off"></textarea>
      ${k === 'w' ? [1, 2, 3, 4].map((i) => `<label class="field" for="f-c${i}">보기 ${i}</label><input id="f-c${i}" type="text">`).join('') + `<label class="field" for="f-a">정답 번호</label><select id="f-a">${[1, 2, 3, 4].map((i) => `<option>${i}</option>`).join('')}</select>`
        : '<label class="field" for="f-ans">정답 (줄바꿈으로 여러 표현 허용, 첫 줄이 대표 정답)</label><textarea id="f-ans" rows="3" autocapitalize="off" style="font-family:inherit;font-size:16px"></textarea>'}
      <label class="field" for="f-e">해설</label><textarea id="f-e" rows="3" style="font-family:inherit;font-size:16px"></textarea>
      <button class="btn primary block" data-act="addSave" style="margin-top:12px">추가</button>
      <h2>내가 추가한 문제 (${custom.length})</h2>${custom.length ? custom.map((c) => `<div class="card row between"><span class="grow" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.kind === 'w' ? '필기' : '실기'} · ${esc(c.q.split('\n')[0])}</span><button class="btn danger" style="min-height:38px" data-act="addDel" data-arg="${c.id}">삭제</button></div>`).join('') : '<div class="empty">없음</div>'}`;
    return { title: '문제 추가', back: '#/settings', tab: 'settings', html: h };
  }

  function vData() {
    const h = `<h2>백업</h2><div class="card"><p class="muted" style="margin-top:0">학습 기록·설정·추가한 문제를 하나의 파일로 저장해요.</p><div class="btn-row"><button class="btn primary" data-act="exportFile">파일로 저장</button><button class="btn" data-act="exportCopy">텍스트 복사</button></div></div>
      <h2>복원</h2><div class="card"><p class="muted" style="margin-top:0">백업 파일 또는 복사해 둔 텍스트를 붙여 넣으세요. 현재 기록은 덮어써져요.</p><input type="file" id="restore-file" accept=".json,application/json" style="margin-bottom:8px"><textarea id="restore-text" placeholder="백업 JSON 붙여넣기"></textarea><button class="btn block" data-act="restore" style="margin-top:8px">복원</button></div>
      <h2>문제 JSON 가져오기</h2><div class="card"><p class="muted" style="margin-top:0">형식 예시는 README의 ‘문제 추가’ 항목을 참고하세요. 같은 문제는 중복 추가되지 않아요.</p><textarea id="import-text" placeholder='[{"kind":"w","area":"db","q":"문제","c":["1","2","3","4"],"a":2,"e":"해설"}]'></textarea><button class="btn block" data-act="importQ" style="margin-top:8px">가져오기</button></div>
      <h2>초기화</h2><button class="btn danger block" data-act="reset">학습 기록 모두 지우기</button>`;
    return { title: '백업 · 복원', back: '#/settings', tab: 'settings', html: h };
  }

  /* ───────── 문제 가져오기/검증 ───────── */
  function normalizeQ(o) {
    if (!o || typeof o.q !== 'string' || !o.q.trim()) return null;
    const base = { kind: o.kind, area: o.area, q: o.q.trim(), e: String(o.e || ''), code: String(o.code || ''), custom: true };
    if (o.kind === 'w') {
      if (!W_AREAS[o.area] || !Array.isArray(o.c) || o.c.length < 2 || o.c.length > 5 || !o.c.every((x) => typeof x === 'string' && x.trim())) return null;
      if (!Number.isInteger(o.a) || o.a < 1 || o.a > o.c.length) return null;
      return Object.assign(base, { c: o.c.map((x) => x.trim()), a: o.a, id: 'c-' + hash('w' + o.area + o.q.trim()) });
    }
    if (o.kind === 'p') {
      if (!P_AREAS[o.area] || !TYPES[o.type] || !Array.isArray(o.ans)) return null;
      const ans = o.ans.map((x) => String(x).trim()).filter(Boolean);
      if (!ans.length && o.type !== 'desc') return null;
      return Object.assign(base, { type: o.type, ans, id: 'c-' + hash('p' + o.area + o.q.trim()) });
    }
    return null;
  }
  function addCustom(list) {
    const cur2 = store.get(CKEY, []), have = new Set(cur2.map((c) => c.id));
    let added = 0, bad = 0;
    for (const o of list) { const q = normalizeQ(o); if (!q) bad++; else if (!have.has(q.id)) { cur2.push(q); have.add(q.id); added++; } }
    if (!store.set(CKEY, cur2)) toast('저장 공간을 사용할 수 없어요');
    reloadQ();
    return { added, bad };
  }

  /* ───────── 액션 ───────── */
  const A = {
    quick(kind) {
      const n = kind === 'w' ? 10 : 5;
      const pool = Q.filter((q) => q.kind === kind);
      // 안 푼 문제 → 오래된 문제 순으로 우선, 같은 구간은 무작위
      const key = new Map(pool.map((q) => [q.id, (prog(q.id)?.n > 0 ? prog(q.id).last : 0) + Math.random() * 1e6]));
      const ids = pool.sort((a, b) => key.get(a.id) - key.get(b.id)).slice(0, n).map((q) => q.id);
      startSession({ kind, mode: 'practice', label: kind === 'w' ? '필기 랜덤' : '실기 랜덤' }, shuffle(ids));
    },
    suArea(arg) { const [k, a] = arg.split(':'); const u = SU[k]; u.areas = u.areas.includes(a) ? u.areas.filter((x) => x !== a) : [...u.areas, a]; route(); },
    suRange(arg) { const [k, r] = arg.split(':'); SU[k].range = r; route(); },
    suN(arg) { const [k, n] = arg.split(':'); SU[k].n = +n; route(); },
    suStart(kind) {
      const u = SU[kind]; let ids = shuffle(poolFor(kind, u).map((q) => q.id));
      if (u.n) ids = ids.slice(0, u.n);
      startSession({ kind, mode: 'practice', label: kind === 'w' ? '필기 연습' : '실기 연습' }, ids);
    },
    mockStart() {
      const prof = PROFILES[S.settings.exam], subjects = [];
      for (const sub of prof.subjects) {
        const pool = shuffle(Q.filter((q) => q.kind === 'w' && sub.a.includes(q.area))).slice(0, prof.per);
        subjects.push({ n: sub.n, ids: pool.map((q) => q.id) });
      }
      const ids = subjects.flatMap((s) => s.ids);
      if (!ids.length) return toast('필기 문제가 없어요');
      startSession({ kind: 'w', mode: 'mock', label: '모의고사', exam: S.settings.exam, subjects, limit: prof.min * 60 }, ids);
    },
    listStart(arg) {
      const [type, kind] = arg.split(':');
      const ids = shuffle(Q.filter((q) => q.kind === kind && (type === 'wrong' ? isWrong(q) : isBm(q))).map((q) => q.id));
      startSession({ kind, mode: 'practice', label: type === 'wrong' ? '오답 다시 풀기' : '북마크 풀기' }, ids);
    },
    reviewStart(kind) { startSession({ kind, mode: 'review', label: '복습' }, dueList().filter((q) => q.kind === kind).slice(0, 20).map((q) => q.id)); },
    retryWrong() { const s = session; const ids = s.ids.filter((id) => !isOk(s, QM.get(id))); startSession({ kind: s.kind, mode: 'review', label: '틀린 문제 다시' }, shuffle(ids)); },
    closeResult() { session = null; saveSess(); go('#/'); },
    dropSession() { if (confirm('풀던 내용을 버릴까요? (이미 채점된 문제의 기록은 유지돼요)')) { session = null; saveSess(); route(); } },
    pick(n) {
      n = +n; const q = cur(), s = session;
      if (s.mode === 'mock') { if (s.ans[q.id] === n) delete s.ans[q.id]; else s.ans[q.id] = n; }
      else { if (s.ans[q.id] !== undefined) return; s.ans[q.id] = n; record(q.id, n === q.a); s.rec[q.id] = 1; }
      saveSess(); route();
    },
    skip() { const q = cur(); if (session.ans[q.id] !== undefined) return; session.ans[q.id] = 0; record(q.id, false); session.rec[q.id] = 1; saveSess(); route(); },
    next() { if (session.idx < session.ids.length - 1) { session.idx++; saveSess(); window.scrollTo(0, 0); route(); } else finish(); },
    prev() { if (session.idx > 0) { session.idx--; saveSess(); window.scrollTo(0, 0); route(); } },
    jump(i) { session.idx = +i; saveSess(); window.scrollTo(0, 0); route(); },
    submit() {
      const un = session.ids.length - Object.keys(session.ans).length;
      if (confirm(un ? `답하지 않은 문항이 ${un}개 있어요. 제출할까요?` : '제출할까요?')) finish();
    },
    reveal(arg) {
      const q = cur(), el = $('#ans-input'), text = arg === 'skip' ? '' : (el ? el.value.trim() : '');
      session.ans[q.id] = { text, auto: arg === 'skip' ? (q.type === 'desc' ? null : false) : autoJudge(q, text) };
      saveSess(); route();
    },
    judge(arg) {
      const q = cur(), a = session.ans[q.id], ok = arg === '1';
      if (a.ok === undefined) { a.ok = ok; record(q.id, ok); session.rec[q.id] = 1; }
      saveSess(); A.next();
    },
    bm(id) { const p = (S.prog[id] ||= { n: 0, ok: 0, box: 0, due: 0, lastOk: null, bm: false }); p.bm = !p.bm; save(); route(); },
    thMark(arg) {
      const [no, st] = arg.split(':'); const k = thKey(no);
      S.theory ||= {};
      if (S.theory[k] === st) delete S.theory[k]; else S.theory[k] = st;
      save(); toast(S.theory[k] === 'read' ? '읽음으로 표시했어요' : S.theory[k] === 'confused' ? '헷갈림으로 표시했어요' : '표시를 해제했어요'); route();
    },
    thGrade(g) { thGrade = g; route(); },
    thPractice(area) {
      const ids = shuffle(Q.filter((q) => q.kind === 'w' && q.area === area).map((q) => q.id)).slice(0, 10);
      startSession({ kind: 'w', mode: 'practice', label: `${W_AREAS[area].n} 연습` }, ids);
    },
    thRelated(arg) {
      const [no, kind] = arg.split(':'); const t = TH()[+no];
      startSession({ kind, mode: 'practice', label: `${pad3(+no)} ${t.t}` }, shuffle(thRelated(+no, kind).map((q) => q.id)).slice(0, 10));
    },
    setExam(k) { S.settings.exam = k; save(); route(); },
    setTheme(k) { S.settings.theme = k; save(); applyTheme(); route(); },
    addKind(k) { ADD.kind = k; route(); },
    addSave() {
      const v = (id) => ($('#' + id)?.value ?? '').trim();
      const o = { kind: ADD.kind, area: v('f-area'), q: v('f-q'), code: $('#f-code').value.replace(/\s+$/, ''), e: v('f-e') };
      if (ADD.kind === 'w') { o.c = [1, 2, 3, 4].map((i) => v('f-c' + i)); o.a = +v('f-a'); } else { o.type = v('f-type'); o.ans = v('f-ans').split('\n'); }
      const r = addCustom([o]);
      if (r.added) { toast('추가했어요'); route(); } else toast(r.bad ? '입력을 확인해 주세요 (빈 칸/정답)' : '이미 있는 문제예요');
    },
    addDel(id) { if (!confirm('이 문제를 삭제할까요?')) return; store.set(CKEY, store.get(CKEY, []).filter((c) => c.id !== id)); reloadQ(); route(); },
    importQ() {
      try {
        let d = JSON.parse($('#import-text').value);
        if (!Array.isArray(d)) d = d.questions || d.custom || [];
        const r = addCustom(d); toast(`추가 ${r.added}개${r.bad ? ` · 형식 오류 ${r.bad}개` : ''}`); if (r.added) $('#import-text').value = '';
      } catch { toast('JSON 형식이 올바르지 않아요'); }
    },
    exportFile() {
      const blob = new Blob([exportText()], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `eip-backup-${today()}.json`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast('백업 파일을 저장했어요');
    },
    async exportCopy() { try { await navigator.clipboard.writeText(exportText()); toast('복사했어요. 메모 앱 등에 붙여 두세요'); } catch { toast('복사 권한이 없어요. 파일로 저장을 이용하세요'); } },
    restore() { restoreFrom($('#restore-text').value); },
    reset() { if (confirm('학습 기록(추가한 문제는 유지)을 모두 지울까요? 되돌릴 수 없어요.')) { S.prog = {}; S.hist = []; S.daily = {}; S.theory = {}; save(); session = null; saveSess(); toast('초기화했어요'); route(); } },
  };
  const exportText = () => JSON.stringify({ app: 'eip-study', v: 1, exported: new Date().toISOString(), state: S, custom: store.get(CKEY, []) });
  function restoreFrom(text) {
    try {
      const d = JSON.parse(text);
      if (d.app !== 'eip-study' || !d.state) throw new Error('bad');
      if (!confirm('현재 기록을 백업 내용으로 덮어쓸까요?')) return;
      S = Object.assign({ prog: {}, hist: [], daily: {}, theory: {} }, d.state); S.settings = Object.assign({}, DEF, S.settings); save();
      store.set(CKEY, Array.isArray(d.custom) ? d.custom : []); reloadQ(); session = null; saveSess(); applyTheme(); toast('복원했어요'); go('#/');
    } catch { toast('백업 형식이 올바르지 않아요'); }
  }

  /* ───────── 이벤트 · 라우터 ───────── */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (el && A[el.dataset.act]) A[el.dataset.act](el.dataset.arg, el);
  });
  document.addEventListener('input', (e) => {
    if (!e.target.dataset?.search) return;
    const res = thSearch(e.target.value), box = $('#th-results'), list = $('#th-list');
    if (!box) return;
    const q = e.target.value.trim();
    if (list) list.hidden = !!q;
    box.innerHTML = !q ? '' : res.length ? res.map((r) => `<a class="item" href="#/theory/t/${r.no}"><span class="no">${pad3(r.no)}</span><span class="grow"><div class="t">${esc(r.t)}</div><div class="s">${esc(r.s)}</div></span>${gradeBadge(r.g)}<span class="chev">›</span></a>`).join('') : '<div class="empty">검색 결과가 없어요</div>';
  });
  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset?.change === 'examDate') { S.settings.examDate = el.value; save(); toast('저장했어요'); }
    else if (el.dataset?.change === 'goal') { S.settings.goal = Math.max(5, Math.min(500, +el.value || 30)); save(); toast('저장했어요'); }
    else if (el.id === 'restore-file' && el.files[0]) { const f = el.files[0]; f.text().then(restoreFrom); }
  });
  document.addEventListener('keydown', (e) => {
    if (location.hash !== '#/quiz' || !session || session.done || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (/^[1-5]$/.test(e.key) && cur()?.kind === 'w') A.pick(e.key);
    else if (e.key === 'Enter' || e.key === 'ArrowRight') { const b = document.querySelector('.actionbar .btn.primary'); if (b) b.click(); }
  });
  $('#back').addEventListener('click', () => { if (backTo) go(backTo); });

  let backTo = null, timerId = null;
  function applyTheme() {
    const t = S.settings.theme;
    if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
    const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.querySelector('meta[name=theme-color]').content = dark ? '#1a2030' : '#2f5bea';
  }
  function route() {
    clearInterval(timerId); timerId = null;
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    const view = VIEWS[parts[0] || 'home'] || VIEWS.home;
    const r = view(parts.slice(1));
    if (r.redirect) return location.replace(r.redirect);
    $('#title').textContent = r.title;
    backTo = r.back || null; $('#back').hidden = !backTo;
    document.body.classList.toggle('focus', !!r.focus);
    document.querySelectorAll('#tabs a').forEach((a) => a.classList.toggle('on', a.dataset.tab === r.tab));
    $('#view').innerHTML = r.html;
    document.querySelectorAll('#view .tbl').forEach((t) => { if (t.scrollWidth > t.clientWidth + 1) t.insertAdjacentHTML('afterend', '<div class="scroll-hint">↔ 표를 옆으로 밀어서 보세요</div>'); }); // 가로 스크롤이 필요한 표만 안내
    const tr = $('#topright'); tr.textContent = '';
    if (r.timer && session?.limit) {
      const tick = () => {
        const left = Math.round(session.limit - (Date.now() - session.started) / 1000);
        if (left <= 0) { clearInterval(timerId); toast('시간 종료! 자동 제출했어요'); finish(); return; }
        tr.textContent = mmss(left);
      };
      tick(); timerId = setInterval(tick, 1000);
    }
  }
  window.addEventListener('hashchange', () => { route(); window.scrollTo(0, 0); });

  applyTheme();
  route();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
  window.__eip = { get Q() { return Q; }, get S() { return S; } }; // 디버그/테스트용
})();
