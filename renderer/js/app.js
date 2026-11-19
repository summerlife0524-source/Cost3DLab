/* ============================================================
   app.js  界面与学习逻辑
   ============================================================ */

const COMPONENTS = CIVIL_COMPS.concat(MEP_COMPS);
const COMP_MAP = {};
COMPONENTS.forEach(function (c) { COMP_MAP[c.id] = c; });

const CH_MAP = {};
CHAPTERS.forEach(function (c) { CH_MAP[c.id] = c; });

/* ---------- 题库索引 ---------- */
const Q_INDEX = {};
COMPONENTS.forEach(function (c) {
  c.quiz.forEach(function (q) { Q_INDEX[q.id] = Object.assign({}, q, { compId: c.id }); });
});
CHAPTERS.forEach(function (ch) {
  (ch.quizExtra || []).forEach(function (q) { Q_INDEX[q.id] = Object.assign({}, q, { chapterId: ch.id }); });
});

/* ---------- 状态 ---------- */
const STORE_KEY = 'cost3d_state_v2';
const DEFAULT_STATE = {
  xp: 0,
  viewed: {},
  quiz: {},
  wrong: [],
  read: {},
  chapterDone: {},
  caseDone: {},
  calcCount: 0
};
let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return Object.assign({}, DEFAULT_STATE, JSON.parse(raw));
  } catch (e) { }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}
function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { }
}
function addXp(n) {
  state.xp = (state.xp || 0) + n;
  saveState();
  renderTop();
}
function levelInfo() {
  const step = 120;
  const lv = Math.floor(state.xp / step) + 1;
  const inLv = state.xp % step;
  return { lv: lv, inLv: inLv, need: step };
}
function isMastered(id) {
  const c = COMP_MAP[id];
  if (!c) return false;
  return c.quiz.every(function (q) { const r = state.quiz[q.id]; return r && r.ok; });
}
function masteredCount() {
  return COMPONENTS.filter(function (c) { return isMastered(c.id); }).length;
}

/* ---------- 工具 ---------- */
function fmt(n, d) {
  if (d === undefined) d = 2;
  const v = Number(n);
  if (!isFinite(v)) return '—';
  return v.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: d });
}
function el(html) {
  const d = document.createElement('div');
  d.innerHTML = html.trim();
  return d.firstElementChild;
}
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/* ---------- 顶部状态 ---------- */
function renderTop() {
  const li = levelInfo();
  document.getElementById('lv').textContent = li.lv;
  document.getElementById('xpbar').style.width = (li.inLv / li.need * 100) + '%';
  document.getElementById('xptext').textContent = li.inLv + ' / ' + li.need + ' XP';
  document.getElementById('statMastered').textContent = masteredCount();
  document.getElementById('statWrong').textContent = state.wrong.length;
  document.getElementById('statViewed').textContent = Object.keys(state.viewed).length;
}

/* ---------- 视图切换 ---------- */
const VIEWS = ['model', 'lib', 'calc', 'chapter', 'case', 'wrong'];
let currentView = 'model';
function setView(v) {
  currentView = v;
  VIEWS.forEach(function (k) {
    const sec = document.getElementById('view-' + k);
    const btn = document.querySelector('.nav-item[data-view="' + k + '"]');
    if (sec) sec.classList.toggle('active', k === v);
    if (btn) btn.classList.toggle('active', k === v);
  });
  if (v === 'lib') renderLibrary();
  if (v === 'calc') renderCalcView();
  if (v === 'chapter') renderChapters();
  if (v === 'case') renderCase();
  if (v === 'wrong') renderWrong();
}

/* ---------- 知识卡 ---------- */
function renderQuiz(q, showNumber, n) {
  const rec = state.quiz[q.id];
  const opts = q.options.map(function (o, i) {
    let cls = 'opt';
    if (rec) {
      if (i === q.answer) cls += ' right';
      else if (i === rec.sel) cls += ' wrong';
      else cls += ' dim';
    }
    return '<button class="' + cls + '" data-qid="' + q.id + '" data-idx="' + i + '">' +
      '<i>' + LETTERS[i] + '</i><span>' + o + '</span></button>';
  }).join('');
  return '<div class="quiz" data-qid="' + q.id + '">' +
    '<p class="q-text">' + (showNumber ? (n + '. ') : '') + q.q + '</p>' +
    '<div class="opts">' + opts + '</div>' +
    '<div class="explain" ' + (rec ? '' : 'hidden') + '>' +
    '<b>' + (rec && rec.ok ? '答对了' : '正确答案：' + LETTERS[q.answer]) + '</b>' +
    '<span>' + q.explain + '</span></div></div>';
}

function buildKnowledgeHTML(comp) {
  const majorCls = comp.major === '安装' ? 'mep' : 'civ';
  const ch = CH_MAP[comp.chapter];
  const mastered = isMastered(comp.id);
  const points = comp.points.map(function (p) { return '<li>' + p + '</li>'; }).join('');
  const quota = comp.quota.map(function (q) {
    return '<div class="quota-row"><span class="quota-no">' + q.no + '</span><div><b>' + q.name + '</b><em>' + q.note + '</em></div></div>';
  }).join('');
  const traps = comp.traps.map(function (t) { return '<li>' + t + '</li>'; }).join('');
  const rel = (comp.related || []).map(function (id) {
    const c = COMP_MAP[id];
    if (!c) return '';
    return '<button class="chip" data-goto="' + id + '">' + c.name + '</button>';
  }).join('');
  const quizHTML = comp.quiz.map(function (q, i) { return renderQuiz(q, true, i + 1); }).join('');

  return '<div class="kb">' +
    '<div class="kb-head ' + majorCls + '">' +
    '<div class="kb-tags"><span class="tag-major">' + comp.major + '</span>' +
    '<span class="tag-ch">' + (ch ? ch.title : '') + '</span>' +
    '<span class="tag-std">' + (comp.major === '安装' ? 'GB/T 50856-2024' : 'GB/T 50854-2024') + '</span>' +
    (isMastered(comp.id) ? '<span class="tag-ok">已掌握</span>' : '<span class="tag-todo">待掌握</span>') +
    '</div>' +
    '<h2>' + comp.name + '</h2>' +
    '<p class="kb-sum">' + comp.summary + '</p>' +
    '</div>' +
    '<div class="kb-body">' +
    '<div class="kb-sec"><h3>清单项目</h3>' +
    '<div class="code-card"><div class="code"><span>' + comp.code + '</span><em>' + comp.codeName + '</em></div>' +
    '<div class="code-meta">计量单位 <b>' + comp.unit + '</b><span class="dot"></span>' + comp.codeChapter + '</div></div>' +
    '<p class="rule-text">' + comp.rule + '</p></div>' +
    '<div class="kb-sec"><h3>定额提示</h3>' + quota + '</div>' +
    '<div class="kb-sec"><h3>考点拆解</h3><ul class="pts">' + points + '</ul></div>' +
    '<div class="mnemonic-box"><span class="mn-label">口诀</span><p>' + comp.mnemonic + '</p></div>' +
    '<div class="kb-sec"><h3>常见陷阱</h3><ul class="traps">' + traps + '</ul></div>' +
    '<div class="kb-sec"><h3>真题小练习</h3>' + quizHTML + '</div>' +
    (rel ? '<div class="kb-sec"><h3>联动构件</h3><div class="chips">' + rel + '</div></div>' : '') +
    '<div class="kb-foot">' +
    '<button class="btn-line" data-focus="' + comp.id + '">在模型中定位</button>' +
    '<button class="btn-line" data-calc="' + comp.id + '">用计算器试算</button>' +
    '</div></div></div>';
}

function renderWelcome() {
  const quick = ['foundation', 'column', 'stair', 'roof', 'waterpipe', 'cabletray', 'insulation', 'airduct']
    .map(function (id) {
      const c = COMP_MAP[id];
      return '<button class="qchip" data-goto="' + id + '">' + c.name + '</button>';
    }).join('');
  const li = levelInfo();
  document.getElementById('panel-kb').innerHTML =
    '<div class="welcome">' +
    '<h2>点一下模型，开始学习</h2>' +
    '<p>这是一栋两层框架小楼：地下有独立基础，墙里有柱子，屋面上有防水，管道、桥架、风管、消火栓都按真实施工位置摆放。</p>' +
    '<p class="hintline">左键旋转 · 滚轮缩放 · 右键平移 · 点击构件看知识卡</p>' +
    '<div class="wquick">' + quick + '</div>' +
    '<div class="wstats"><div><b>' + masteredCount() + '</b><span>已掌握构件</span></div>' +
    '<div><b>' + Object.keys(state.viewed).length + '</b><span>已浏览</span></div>' +
    '<div><b>Lv.' + li.lv + '</b><span>当前等级</span></div></div>' +
    '<p class="wfoot">建议路径：先点“独立基础 → 柱 → 梁 → 板”把结构走一遍，再点“管道 → 桥架 → 风管 → 保温”进安装。</p>' +
    '</div>';
}

function selectComponent(id) {
  if (!id) {
    document.querySelectorAll('.mv-item').forEach(function (b) { b.classList.remove('on'); });
    Lab.select(null);
    renderWelcome();
    return;
  }
  const c = COMP_MAP[id];
  if (!c) return;
  if (!state.viewed[id]) { state.viewed[id] = 1; addXp(4); }
  Lab.select(id);
  // 看安装构件、楼梯、楼地面防水时自动剖切，露出内部
  if (c.major === '安装' || id === 'stair' || id === 'waterproof') {
    Lab.setCut(true);
    document.getElementById('btn-cut').classList.add('on');
  }
  document.getElementById('panel-kb').innerHTML = buildKnowledgeHTML(c);
  document.querySelectorAll('.mv-item').forEach(function (b) {
    b.classList.toggle('on', b.dataset.comp === id);
  });
  renderTop();
}

/* ---------- 答题 ---------- */
function handleOpt(btn) {
  const qid = btn.dataset.qid;
  const idx = Number(btn.dataset.idx);
  const q = Q_INDEX[qid];
  if (!q) return;
  if (state.quiz[qid]) {
    // 已答过，只提示
    const box = btn.closest('.quiz');
    if (box) box.querySelector('.explain').hidden = false;
    return;
  }
  const ok = idx === q.answer;
  state.quiz[qid] = { sel: idx, ok: ok };
  if (!ok && state.wrong.indexOf(qid) < 0) state.wrong.push(qid);
  if (ok && state.wrong.indexOf(qid) >= 0) state.wrong.splice(state.wrong.indexOf(qid), 1);
  saveState();

  const box = btn.closest('.quiz');
  box.querySelectorAll('.opt').forEach(function (b) {
    const i = Number(b.dataset.idx);
    b.classList.remove('dim');
    if (i === q.answer) b.classList.add('right');
    else if (i === idx) b.classList.add('wrong');
    else b.classList.add('dim');
  });
  const ex = box.querySelector('.explain');
  ex.hidden = false;
  ex.querySelector('b').textContent = ok ? '答对了' : '正确答案：' + LETTERS[q.answer];
  addXp(ok ? 8 : 2);
  renderTop();

  // 更新所有同题的渲染
  document.querySelectorAll('.quiz[data-qid="' + qid + '"]').forEach(function (other) {
    if (other === box) return;
    other.outerHTML = renderQuiz(q, false);
  });
}

/* ---------- 构件库 ---------- */
let libFilter = 'all';
function renderLibrary() {
    const count = COMPONENTS.length;
    document.getElementById('lib-count').textContent = count;
    const cards = COMPONENTS.filter(function (c) {
      if (libFilter === 'civ') return c.major === '土建';
      if (libFilter === 'mep') return c.major === '安装';
      if (libFilter === 'mastered') return isMastered(c.id);
      return true;
    }).map(function (c) {
      const m = isMastered(c.id) ? '<span class="card-ok">已掌握</span>' : '<span class="card-dot"></span>';
      const tag = c.major === '安装' ? 'mep' : 'civ';
      return '<button class="lib-card ' + tag + '" data-detail="' + c.id + '">' +
        '<div class="lib-top"><span class="lib-icon">' + c.icon + '</span>' + m + '</div>' +
        '<h3>' + c.name + '</h3>' +
        '<p class="lib-code">' + c.code + '</p>' +
        '<div class="lib-foot"><span>' + CH_MAP[c.chapter].title + '</span><b>' + c.unit + '</b></div>' +
        '</button>';
    }).join('');
    document.getElementById('lib-grid').innerHTML = cards || '<p class="empty">该分类下暂无构件</p>';
}

/* ---------- 抽屉 ---------- */
function openDetail(id) {
  const c = COMP_MAP[id];
  if (!c) return;
  if (!state.viewed[id]) { state.viewed[id] = 1; addXp(4); }
  const drawer = document.getElementById('drawer');
  drawer.querySelector('.drawer-body').innerHTML = buildKnowledgeHTML(c);
  drawer.classList.add('open');
}
function closeDetail() {
  document.getElementById('drawer').classList.remove('open');
}

/* ---------- 计算器 ---------- */
let calcVals = {};
let calcHistory = [];
function renderCalcView() {
  const groups = { '土建': [], '安装': [] };
  CALC_TYPES.forEach(function (t) { groups[t.major].push(t); });
  const sel = document.getElementById('calc-type');
  if (!sel.dataset.filled) {
    sel.innerHTML =
      '<optgroup label="土建工程">' + groups['土建'].map(function (t) {
        return '<option value="' + t.id + '">' + t.name + '</option>';
      }).join('') + '</optgroup>' +
      '<optgroup label="安装工程">' + groups['安装'].map(function (t) {
        return '<option value="' + t.id + '">' + t.name + '</option>';
      }).join('') + '</optgroup>';
    sel.dataset.filled = '1';
  }
  renderCalcForm();
}

function currentCalcType() {
  const id = document.getElementById('calc-type').value || CALC_TYPES[0].id;
  return CALC_TYPES.filter(function (t) { return t.id === id; })[0] || CALC_TYPES[0];
}

function renderCalcForm() {
  const t = currentCalcType();
  if (!calcVals[t.id]) {
    calcVals[t.id] = {};
    t.inputs.forEach(function (i) { calcVals[t.id][i.k] = i.def; });
    calcVals[t.id].__price = t.price;
  }
  const v = calcVals[t.id];
  document.getElementById('calc-form').innerHTML =
    '<div class="form-row listen">' + t.inputs.map(function (i) {
      return '<label class="field"><span>' + i.label + '</span>' +
        '<div class="input-wrap"><input type="number" step="any" data-key="' + i.k + '" value="' + v[i.k] + '"><em>' + i.unit + '</em></div></label>';
    }).join('') +
    '<label class="field"><span>综合单价（示例）</span><div class="input-wrap"><input type="number" step="any" data-key="__price" value="' + v.__price + '"><em>元/' + t.unit + '</em></div></label>' +
    '</div>' +
    '<div class="calc-meta"><p><b>公式</b> ' + t.formula + '</p><p><b>规则</b> ' + t.rule + '</p><p><b>定额</b> ' + t.quota + '</p></div>';
  runCalc();
}

function runCalc() {
  const t = currentCalcType();
  const v = calcVals[t.id];
  const steps = t.compute(v);
  const qty = steps[steps.length - 1].val;
  const price = Number(v.__price) || 0;
  const amount = qty * price;
  const codeStr = t.code;
  document.getElementById('calc-result').innerHTML =
    '<div class="res-head"><span class="res-lab">工程量</span>' +
    '<div class="res-num"><b>' + fmt(qty, 3) + '</b><em>' + t.unit + '</em></div></div>' +
    '<table class="res-table"><thead><tr><th>计算步骤</th><th>算式</th><th>结果</th></tr></thead><tbody>' +
    steps.map(function (s) {
      return '<tr><td>' + s.label + '</td><td class="mono">' + s.expr + '</td><td class="mono">' + fmt(s.val, 3) + ' ' + t.unit + '</td></tr>';
    }).join('') +
    '</tbody></table>' +
    '<div class="bill-card"><div class="bill-top"><span class="bill-code">' + codeStr + '</span><span class="bill-name">' + t.codeName + '</span><b>' + t.unit + '</b></div>' +
    '<div class="bill-rows"><div><span>工程量</span><b>' + fmt(qty, 3) + ' ' + t.unit + '</b></div>' +
    '<div><span>综合单价</span><b>' + fmt(price) + ' 元/' + t.unit + '</b></div>' +
    '<div class="bill-sum"><span>合价</span><b>' + fmt(amount) + ' 元</b></div></div></div>' +
    '<p class="calc-tip">' + t.tip + '</p>' +
    '<div class="calc-actions"><button class="btn-primary" id="calc-save">记入算量清单</button>' +
    '<button class="btn-line" id="calc-copy">复制结果</button></div>';

  document.getElementById('calc-save').onclick = function () {
    calcHistory.unshift({
      name: t.name, code: codeStr, codeName: t.codeName, unit: t.unit,
      qty: qty, price: price, amount: amount
    });
    calcHistory = calcHistory.slice(0, 8);
    state.calcCount = (state.calcCount || 0) + 1;
    addXp(3);
    renderCalcHistory();
  };
  document.getElementById('calc-copy').onclick = function () {
    const txt = t.name + '：' + fmt(qty, 3) + ' ' + t.unit + '（清单 ' + codeStr + ' ' + t.codeName + '），合价 ' + fmt(amount) + ' 元';
    if (navigator.clipboard) navigator.clipboard.writeText(txt);
  };
}

function renderCalcHistory() {
  const box = document.getElementById('calc-history');
  if (!calcHistory.length) { box.innerHTML = '<p class="empty">还没有记录，点击“记入算量清单”把结果存下来。</p>'; return; }
  let total = 0;
  calcHistory.forEach(function (h) { total += h.amount; });
  box.innerHTML = '<table class="hist-table"><thead><tr><th>项目</th><th>编码</th><th>工程量</th><th>合价(元)</th></tr></thead><tbody>' +
    calcHistory.map(function (h) {
      return '<tr><td>' + h.name + '</td><td class="mono">' + h.code + '</td><td class="mono">' + fmt(h.qty, 3) + ' ' + h.unit + '</td><td class="mono">' + fmt(h.amount) + '</td></tr>';
    }).join('') +
    '</tbody></table><p class="hist-total">合计 <b>' + fmt(total) + '</b> 元</p>';
}

/* ---------- 章节 ---------- */
function chapterQuestions(ch) {
    let qs = [];
    (ch.comps || []).forEach(function (cid) {
      const c = COMP_MAP[cid];
      if (c) qs = qs.concat(c.quiz);
    });
    qs = qs.concat(ch.quizExtra || []);
    const picked = [];
    for (let i = 0; i < qs.length && picked.length < 5; i += Math.max(1, Math.floor(qs.length / 5))) {
      picked.push(qs[i]);
    }
    return picked.slice(0, 5);
}

function chapterProgress(ch) {
  let total = ch.items.length + (ch.comps || []).length;
  let done = 0;
  ch.items.forEach(function (it, i) { if (state.read[ch.id + '-i' + i]) done++; });
  (ch.comps || []).forEach(function (cid) { if (state.viewed[cid]) done++; });
  return { done: done, total: total, pct: total ? Math.round(done / total * 100) : 0 };
}

let chFilter = 'all';
const CH_BOOK = { civil: '土建计量', mep: '安装计量', cost: '计价/案例' };

function renderChapters() {
  const groups = [
    { k: 'all', label: '全部' },
    { k: 'civil', label: '土建计量' },
    { k: 'mep', label: '安装计量' },
    { k: 'cost', label: '计价 / 案例' }
  ];
  const tabs = groups.map(function (g) {
    const n = g.k === 'all' ? CHAPTERS.length : CHAPTERS.filter(function (c) { return c.book === CH_BOOK[g.k]; }).length;
    return '<button class="ch-tab' + (chFilter === g.k ? ' on' : '') + '" data-chfilter="' + g.k + '">' +
      g.label + '<em>' + n + '</em></button>';
  }).join('');
  const box = document.getElementById('ch-filter');
  if (box) box.innerHTML = tabs;

  const list = CHAPTERS.filter(function (ch) {
    return chFilter === 'all' || ch.book === CH_BOOK[chFilter];
  });
  const html = list.map(function (ch) {
    const pr = chapterProgress(ch);
    const done = state.chapterDone[ch.id];
    return '<div class="ch-card" data-ch="' + ch.id + '">' +
      '<div class="ch-head"><div class="ch-no">' + (ch.book === '安装计量' ? '安' : ch.book === '计价/案例' ? '价' : '土') + '</div>' +
      '<div class="ch-title"><h3>' + ch.title + '</h3><p>' + ch.book + ' · 第 ' + ch.order + ' 章</p></div>' +
      '<div class="ch-right">' + (done ? '<span class="tag-ok">已通关</span>' : '<span class="tag-todo">未通关</span>') +
      '<div class="ch-bar"><i style="width:' + pr.pct + '%"></i></div><em>' + pr.done + '/' + pr.total + '</em></div></div>' +
      '<p class="ch-intro">' + ch.intro + '</p>' +
      '<div class="ch-body" hidden>' + chapterBody(ch) + '</div>' +
      '</div>';
  }).join('');
  document.getElementById('chapter-list').innerHTML = html;
}

function chapterBody(ch) {
  const items = ch.items.map(function (it, i) {
    const key = ch.id + '-i' + i;
    const read = state.read[key];
    const fig = (typeof renderItemFigure === 'function') ? renderItemFigure(ch.id, i) : '';
    return '<div class="kp' + (read ? ' read' : '') + '" data-read="' + key + '">' +
      '<div class="kp-head"><h4>' + it.t + '</h4><button class="kp-btn">' + (read ? '已读' : '标记已读') + '</button></div>' +
      '<p>' + it.c + '</p>' + fig + '</div>';
  }).join('');
  const comps = (ch.comps || []).map(function (cid) {
    return '<button class="chip" data-goto="' + cid + '">' + COMP_MAP[cid].name + '</button>';
  }).join('');
  const qn = chapterQuestions(ch).length;
  const needN = Math.max(1, Math.ceil(qn * 0.8));
  return chapterFigure(ch) +
    '<div class="kp-list">' + items + '</div>' +
    (comps ? '<div class="ch-links"><span>本章构件：</span><div class="chips">' + comps + '</div></div>' : '') +
    '<div class="ch-actions"><button class="btn-primary" data-test="' + ch.id + '">开始章节小测（' + qn + ' 题）</button>' +
    '<span class="ch-note">答对 ' + needN + ' 题及以上即通关，+10 XP</span></div>';
}

function chapterFigure(ch) {
  const fig = (typeof CH_FIGURES !== 'undefined') ? CH_FIGURES[ch.id] : null;
  if (!fig) return '';
  return '<div class="ch-figure">' +
    '<div class="fig-main"><div class="fig-name">' + fig.title + '</div>' + fig.svg + '</div>' +
    '<div class="fig-side"><div class="fig-cap">图例</div>' +
    '<div class="fig-items">' + fig.legend.map(function (l) {
      return '<div class="fig-item"><i style="background:' + l.c + '"></i><span>' + l.t + '</span></div>';
    }).join('') + '</div>' +
    (fig.note ? '<p class="fig-note">' + fig.note + '</p>' : '') +
    '</div></div>';
}

function openChapterTest(chId) {
  const ch = CH_MAP[chId];
  const qs = chapterQuestions(ch).slice();
  // 每次开考都清空本章题目的作答记录，否则重考会停留在上一次的选项状态、无法再选
  qs.forEach(function (q) { delete state.quiz[q.id]; });
  saveState();
  // 重考时打乱出题顺序，避免形成“记住第几题选 C”的假记忆
  for (let i = qs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = qs[i]; qs[i] = qs[j]; qs[j] = tmp;
  }
  const need = Math.max(1, Math.ceil(qs.length * 0.8));
  const body = qs.map(function (q, i) { return renderQuiz(q, true, i + 1); }).join('') +
    '<div class="test-foot"><button class="btn-primary" id="test-submit">提交小测</button>' +
    '<p class="test-hint">共 ' + qs.length + ' 题，答对 ' + need + ' 题通关</p></div>';
  openModal(ch.title + ' · 章节小测', body);
  document.getElementById('test-submit').onclick = function () {
    let right = 0;
    qs.forEach(function (q) { if (state.quiz[q.id] && state.quiz[q.id].ok) right++; });
    let unanswered = qs.filter(function (q) { return !state.quiz[q.id]; }).length;
    const pass = right >= need;
    if (pass && !state.chapterDone[chId]) {
      state.chapterDone[chId] = 1;
      saveState();
      addXp(10);
    }
    openModal(ch.title + ' · 小测结果',
      '<div class="test-result ' + (pass ? 'pass' : 'fail') + '">' +
      '<h3>' + (pass ? '通关成功' : '还没通关') + '</h3>' +
      '<p>答对 <b>' + right + '</b> / ' + qs.length + ' 题' + (unanswered ? '，还有 ' + unanswered + ' 题未作答' : '') + '</p>' +
      '<p class="note">' + (pass ? '本章进度已记录，可以进入下一章了。' : '把答错的题看一遍解析，再来一次。') + '</p>' +
      '<button class="btn-primary" id="test-close">继续</button></div>');
    document.getElementById('test-close').onclick = function () {
      closeModal();
      renderChapters();
      renderTop();
    };
    renderTop();
  };
}

/* ---------- 案例 ---------- */
function renderCase() {
  const cs = CASE_STUDY;
  let total = 0;
  const stepHTML = cs.steps.map(function (s, si) {
    let sub = 0;
    const rows = s.rows.map(function (r) {
      const amt = r.qty * r.price;
      sub += amt;
      return '<tr><td>' + r.item + '</td><td class="mono">' + r.code + '</td><td class="mono">' + r.unit + '</td>' +
        '<td class="mono">' + fmt(r.qty, 3) + '</td><td class="mono">' + fmt(r.price) + '</td><td class="mono">' + fmt(amt) + '</td></tr>';
    }).join('');
    total += sub;
    const opened = state.caseDone[s.id];
    return '<div class="case-step" data-step="' + s.id + '">' +
      '<div class="case-head"><div class="case-no">' + (si + 1) + '</div>' +
      '<div class="case-t"><h3>' + s.title + '</h3><p>' + s.teach + '</p></div>' +
      '<div class="case-sum"><b>' + fmt(sub) + '</b><em>元</em></div>' +
      '<button class="case-toggle">' + (opened ? '收起' : '展开计算') + '</button></div>' +
      '<div class="case-body" ' + (opened ? '' : 'hidden') + '>' +
      '<table class="case-table"><thead><tr><th>清单项目</th><th>项目编码</th><th>单位</th><th>工程量</th><th>综合单价</th><th>合价(元)</th></tr></thead>' +
      '<tbody>' + rows + '</tbody><tfoot><tr><td colspan="5">小计</td><td class="mono">' + fmt(sub) + '</td></tr></tfoot></table></div></div>';
  }).join('');

  const other = total * cs.summary.otherRate;
  const fee = (total + other) * cs.summary.feeRate;
  const tax = (total + other + fee) * cs.summary.taxRate;
  const final = total + other + fee + tax;

  const qs = cs.questions.map(function (q, i) {
    return '<div class="case-q"><div class="case-q-head"><h4>思考题 ' + (i + 1) + '</h4><button class="case-q-btn">看答案</button></div>' +
      '<p class="case-q-q">' + q.q + '</p><p class="case-q-a" hidden>' + q.a + '</p></div>';
  }).join('');

  document.getElementById('case-root').innerHTML =
    '<div class="case-banner"><h2>' + cs.title + '</h2><p>' + cs.subtitle + '</p>' +
    '<div class="case-params">' + cs.params.map(function (p) {
      return '<div><span>' + p[0] + '</span><b>' + p[1] + '</b></div>';
    }).join('') + '</div></div>' +
    stepHTML +
    '<div class="case-total-card"><h3>造价汇总（示例口径）</h3>' +
    '<div class="total-rows">' +
    '<div><span>分部分项＋措施项目</span><b>' + fmt(total) + ' 元</b></div>' +
    '<div><span>其他项目费（' + (cs.summary.otherRate * 100) + '%）</span><b>' + fmt(other) + ' 元</b></div>' +
    '<div><span>规费（' + (cs.summary.feeRate * 100) + '%）</span><b>' + fmt(fee) + ' 元</b></div>' +
    '<div><span>税金（' + (cs.summary.taxRate * 100) + '%）</span><b>' + fmt(tax) + ' 元</b></div>' +
    '<div class="total-final"><span>工程造价</span><b>' + fmt(final) + ' 元</b></div></div>' +
    '<p class="note">' + cs.priceNote + '</p></div>' +
    '<div class="case-qs">' + qs + '</div>';

  document.querySelectorAll('.case-toggle').forEach(function (btn) {
    btn.onclick = function () {
      const step = btn.closest('.case-step');
      const body = step.querySelector('.case-body');
      const id = step.dataset.step;
      const hidden = body.hidden;
      body.hidden = !hidden;
      btn.textContent = hidden ? '收起' : '展开计算';
      if (hidden && !state.caseDone[id]) {
        state.caseDone[id] = 1;
        saveState();
        addXp(12);
      }
    };
  });
  document.querySelectorAll('.case-q-btn').forEach(function (btn) {
    btn.onclick = function () {
      const a = btn.closest('.case-q').querySelector('.case-q-a');
      a.hidden = !a.hidden;
      btn.textContent = a.hidden ? '看答案' : '收起答案';
    };
  });
}

/* ---------- 错题本 ---------- */
function renderWrong() {
  const box = document.getElementById('wrong-root');
  if (!state.wrong.length) {
    box.innerHTML = '<div class="empty-big"><h3>错题本是空的</h3><p>答错的题会自动收进来，考前翻一遍比刷十套新题更有用。</p>' +
      '<button class="btn-primary" data-view-go="model">去模型里练几题</button></div>';
    return;
  }
  const qs = state.wrong.slice().reverse().map(function (qid) {
    const q = Q_INDEX[qid];
    if (!q) return '';
    const rec = state.quiz[qid];
    const from = q.compId ? COMP_MAP[q.compId].name : (CH_MAP[q.chapterId] ? CH_MAP[q.chapterId].title : '');
    return '<div class="wrong-card"><div class="wrong-head"><span class="wrong-from">' + from + '</span>' +
      '<button class="btn-line" data-retry="' + qid + '">再练一次</button></div>' +
      '<p class="q-text">' + q.q + '</p>' +
      '<div class="wrong-ans"><span class="mine">你的答案：' + (rec ? LETTERS[rec.sel] + '. ' + q.options[rec.sel] : '未答') + '</span>' +
      '<span class="right">正确答案：' + LETTERS[q.answer] + '. ' + q.options[q.answer] + '</span></div>' +
      '<div class="wrong-exp">' + q.explain + '</div></div>';
  }).join('');
  box.innerHTML = '<div class="wrong-top"><h2>错题本（' + state.wrong.length + '）</h2>' +
    '<button class="btn-line" id="wrong-clear">清空错题</button></div>' + qs;
  document.getElementById('wrong-clear').onclick = function () {
    if (confirm('确定清空错题本？')) { state.wrong = []; saveState(); renderWrong(); renderTop(); }
  };
  box.querySelectorAll('[data-retry]').forEach(function (btn) {
    btn.onclick = function () {
      const qid = btn.dataset.retry;
      delete state.quiz[qid];
      const i = state.wrong.indexOf(qid);
      if (i >= 0) state.wrong.splice(i, 1);
      saveState();
      renderWrong();
      renderTop();
      setTimeout(function () { openModal('重做这道题', renderQuiz(Q_INDEX[qid], false)); }, 0);
    };
  });
}

/* ---------- 弹窗 ---------- */
function openModal(title, body) {
  const m = document.getElementById('modal');
  m.querySelector('.modal-title').textContent = title;
  m.querySelector('.modal-body').innerHTML = body;
  m.classList.add('open');
}
function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

/* ---------- 事件 ---------- */
document.addEventListener('click', function (e) {
  const opt = e.target.closest('.opt');
  if (opt) { handleOpt(opt); return; }

  const chTab = e.target.closest('[data-chfilter]');
  if (chTab) {
    chFilter = chTab.dataset.chfilter;
    renderChapters();
    return;
  }

  const nav = e.target.closest('.nav-item');
  if (nav) { setView(nav.dataset.view); return; }

  const detail = e.target.closest('[data-detail]');
  if (detail) { openDetail(detail.dataset.detail); return; }

  const goto = e.target.closest('[data-goto]');
  if (goto) {
    closeDetail();
    setView('model');
    selectComponent(goto.dataset.goto);
    const c = COMP_MAP[goto.dataset.goto];
    if (c) Lab.focus(goto.dataset.goto);
    return;
  }

  const focusBtn = e.target.closest('[data-focus]');
  if (focusBtn) { Lab.focus(focusBtn.dataset.focus); return; }

  const calcBtn = e.target.closest('[data-calc]');
  if (calcBtn) {
    setView('calc');
    const id = calcBtn.dataset.calc;
    const map = { foundation: 'c-foundation', column: 'c-column', beam: 'c-beam', slab: 'c-slab',
      stair: 'c-stair', roof: 'c-roof', wall: 'c-wall', cushion: 'c-cushion', earthwork: 'c-earthpit',
      reinforcement: 'c-rebar', formwork: 'c-formwork', scaffold: 'c-scaffold', backfill: 'c-backfill',
      waterproof: 'c-floor', waterpipe: 'm-pipe', drainpipe: 'm-pipe', airduct: 'm-duct-rect',
      insulation: 'm-insul', painting: 'm-paint', cabletray: 'm-tray', hydrant: 'm-hydrant' };
    const target = map[id];
    if (target) {
      const sel = document.getElementById('calc-type');
      sel.value = target;
      delete calcVals[target];
      renderCalcForm();
    }
    return;
  }

  const test = e.target.closest('[data-test]');
  if (test) { openChapterTest(test.dataset.test); return; }

  const kp = e.target.closest('.kp-btn');
  if (kp) {
    const box = kp.closest('.kp');
    const key = box.dataset.read;
    if (!state.read[key]) { state.read[key] = 1; addXp(3); }
    box.classList.add('read');
    kp.textContent = '已读';
    saveState();
    const chId = key.split('-i')[0];
    const node = document.querySelector('.ch-card[data-ch="' + chId + '"]');
    if (node) {
      const prEl = node.querySelector('.ch-right');
      const pr = chapterProgress(CH_MAP[chId]);
      prEl.querySelector('.ch-bar i').style.width = pr.pct + '%';
      prEl.querySelector('em').textContent = pr.done + '/' + pr.total;
    }
    return;
  }

  const chHead = e.target.closest('.ch-head');
  if (chHead) {
    const body = chHead.parentElement.querySelector('.ch-body');
    body.hidden = !body.hidden;
    return;
  }

  const viewGo = e.target.closest('[data-view-go]');
  if (viewGo) { setView(viewGo.dataset.viewGo); return; }

  const mv = e.target.closest('.mv-item');
  if (mv) { selectComponent(mv.dataset.comp); Lab.focus(mv.dataset.comp); return; }

  if (e.target.closest('.drawer-close') || e.target.closest('.drawer-mask')) { closeDetail(); return; }
  if (e.target.closest('.modal-close') || e.target.closest('.modal-mask')) { closeModal(); return; }
});

/* ---------- 初始化 ---------- */
function initUI() {
  // 模型构件列表
  const modelIds = ['foundation', 'cushion', 'beam', 'column', 'slab', 'wall', 'stair', 'roof', 'waterproof',
    'door', 'earthwork', 'waterpipe', 'drainpipe', 'insulation', 'valve', 'hydrant', 'cabletray',
    'airduct', 'distribution', 'scaffold'];
  const shortName = {
    foundation: '独立基础', cushion: '基础垫层', beam: '钢筋砼梁', column: '钢筋砼柱', slab: '实心楼板',
    wall: '砌块墙', stair: '楼梯', roof: '屋面防水', waterproof: '楼地面防水', door: '门窗',
    earthwork: '土方', waterpipe: '给水管道', drainpipe: '排水管道', insulation: '管道保温',
    valve: '阀门', hydrant: '消火栓', cabletray: '电缆桥架', airduct: '通风管道',
    distribution: '配电箱', scaffold: '脚手架'
  };
  document.getElementById('model-list').innerHTML = modelIds.map(function (id) {
    const c = COMP_MAP[id];
    return '<button class="mv-item" data-comp="' + id + '"><span class="mv-ic ' + (c.major === '安装' ? 'mep' : 'civ') + '">' + c.icon + '</span>' + (shortName[id] || c.name) + '</button>';
  }).join('');

  Lab.init(document.getElementById('scene'), function (id) {
    if (id) { selectComponent(id); }
    else { selectComponent(null); }
  }, null);
  renderWelcome();
  renderTop();

  document.getElementById('btn-cut').onclick = function () {
    const on = !this.classList.contains('on');
    this.classList.toggle('on', on);
    Lab.setCut(on);
  };
  document.getElementById('btn-label').onclick = function () {
    const on = !this.classList.contains('on');
    this.classList.toggle('on', on);
    Lab.setLabels(on);
  };
  document.getElementById('btn-scaffold').onclick = function () {
    const on = !this.classList.contains('on');
    this.classList.toggle('on', on);
    Lab.setScaffold(on);
  };
  document.getElementById('btn-rotate').onclick = function () {
    const on = !this.classList.contains('on');
    this.classList.toggle('on', on);
    Lab.setAutoRotate(on);
  };
  document.getElementById('btn-reset').onclick = function () { Lab.resetView(); };

  document.getElementById('calc-type').onchange = function () { renderCalcForm(); };
  document.getElementById('calc-form').addEventListener('input', function (e) {
    const input = e.target.closest('input[data-key]');
    if (!input) return;
    const t = currentCalcType();
    calcVals[t.id][input.dataset.key] = Number(input.value);
    runCalc();
  });
  renderCalcHistory();

  document.getElementById('lib-search').addEventListener('input', function (e) {
    const kw = e.target.value.trim();
    document.querySelectorAll('.lib-card').forEach(function (card) {
      const txt = card.textContent;
      card.style.display = kw === '' || txt.indexOf(kw) >= 0 ? '' : 'none';
    });
  });
  document.querySelectorAll('.lib-tab').forEach(function (tab) {
    tab.onclick = function () {
      document.querySelectorAll('.lib-tab').forEach(function (t) { t.classList.remove('on'); });
      tab.classList.add('on');
      libFilter = tab.dataset.filter;
      renderLibrary();
    };
  });

  document.getElementById('btn-reset-progress').onclick = function () {
    if (confirm('确定要重置全部学习进度（XP、已掌握、错题）？')) {
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      saveState();
      renderTop();
      renderWelcome();
      renderLibrary();
      renderChapters();
      renderWrong();
    }
  };
}

window.addEventListener('DOMContentLoaded', function () {
  initUI();
  setView('model');
});
