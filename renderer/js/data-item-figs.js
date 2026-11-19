/* ============================================================
   data-item-figs.js  知识点级小图解（模板化 SVG + 图例）
   每章每个知识点一张小图，图形由模板 + 数据生成，离线可用
   ============================================================ */

const FIG_PALETTE = ['#c98b3c', '#8fa3b4', '#4b7d8c', '#4fd2e6', '#7a8fa6', '#6f8fa4'];
const FIG_TEXT = '#cfe0ec';
const FIG_MUTED = '#7d95a8';

function figCut(s, n) {
  s = String(s || '');
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function figColor(arr, i) {
  const c = arr[i] && arr[i].c ? arr[i].c : FIG_PALETTE[i % FIG_PALETTE.length];
  return c;
}

/* ---------- 模板 ---------- */
const ITEM_FIG_TPL = {
  /* 分类树：1 个母项 → 2~4 个子项 */
  tree: function (d) {
    const bs = d.branches || [];
    const n = bs.length;
    const w = Math.floor(282 / n) - 4;
    let s = '<svg viewBox="0 0 300 108" xmlns="http://www.w3.org/2000/svg">';
    s += '<rect x="78" y="4" width="144" height="18" rx="4" fill="#22323f" stroke="#4fd2e6" stroke-width="1"/>' +
      '<text x="150" y="17" font-size="9" fill="' + FIG_TEXT + '" text-anchor="middle">' + figCut(d.root, 12) + '</text>';
    s += '<line x1="150" y1="22" x2="150" y2="30" stroke="' + FIG_MUTED + '" stroke-width="1"/>';
    s += '<line x1="' + (8 + w / 2) + '" y1="30" x2="' + (8 + (n - 1) * (w + 4) + w / 2) + '" y2="30" stroke="' + FIG_MUTED + '" stroke-width="1"/>';
    for (let i = 0; i < n; i++) {
      const x = 8 + i * (w + 4);
      const b = bs[i];
      const c = figColor(bs, i);
      s += '<line x1="' + (x + w / 2) + '" y1="30" x2="' + (x + w / 2) + '" y2="38" stroke="' + FIG_MUTED + '" stroke-width="1"/>';
      s += '<rect x="' + x + '" y="38" width="' + w + '" height="34" rx="3" fill="' + c + '" fill-opacity="0.16" stroke="' + c + '" stroke-width="1"/>';
      s += '<text x="' + (x + w / 2) + '" y="55" font-size="8.5" fill="' + FIG_TEXT + '" text-anchor="middle">' + figCut(b.t, 6) + '</text>';
      s += '<text x="' + (x + w / 2) + '" y="67" font-size="6.8" fill="' + FIG_MUTED + '" text-anchor="middle">' + figCut(b.sub, 14) + '</text>';
    }
    if (d.hint) s += '<text x="150" y="96" font-size="7" fill="' + FIG_MUTED + '" text-anchor="middle">' + figCut(d.hint, 40) + '</text>';
    return s + '</svg>';
  },

  /* 分层 / 叠层构造 */
  layers: function (d) {
    const rows = d.rows || [];
    const n = rows.length;
    const h = 88 / n;
    let s = '<svg viewBox="0 0 300 104" xmlns="http://www.w3.org/2000/svg">';
    for (let i = 0; i < n; i++) {
      const y = 4 + i * h;
      const c = figColor(rows, i);
      s += '<rect x="8" y="' + y + '" width="284" height="' + (h - 1) + '" fill="' + c + '" fill-opacity="0.85"/>';
      s += '<text x="15" y="' + (y + h / 2 + 3) + '" font-size="' + (n > 5 ? 7.2 : 8.4) + '" fill="#0d1a24">' + figCut(rows[i].t, 10) + '</text>';
      if (rows[i].sub) s += '<text x="286" y="' + (y + h / 2 + 3) + '" font-size="6.8" fill="#0d1a24" text-anchor="end">' + figCut(rows[i].sub, 18) + '</text>';
    }
    return s + '</svg>';
  },

  /* 递进台阶（阶段、档位） */
  steps: function (d) {
    const its = d.items || [];
    const n = its.length;
    const w = Math.floor(276 / n) - 4;
    let s = '<svg viewBox="0 0 300 108" xmlns="http://www.w3.org/2000/svg">';
    for (let i = 0; i < n; i++) {
      const x = 8 + i * (w + 4);
      const hh = 18 + i * (52 / Math.max(1, n - 1));
      const y = 84 - hh;
      const c = figColor(its, i);
      s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" rx="2" fill="' + c + '" fill-opacity="0.3" stroke="' + c + '" stroke-width="1"/>';
      s += '<text x="' + (x + w / 2) + '" y="' + (84 - hh / 2 + 3) + '" font-size="8" fill="' + FIG_TEXT + '" text-anchor="middle">' + (i + 1) + '</text>';
      s += '<text x="' + (x + w / 2) + '" y="98" font-size="7" fill="' + FIG_MUTED + '" text-anchor="middle">' + figCut(its[i].t, 6) + '</text>';
      if (its[i].sub) s += '<text x="' + (x + w / 2) + '" y="' + (30) + '" font-size="6.5" fill="' + FIG_MUTED + '" text-anchor="middle">' + figCut(its[i].sub, 8) + '</text>';
    }
    return s + '</svg>';
  },

  /* 双栏对比 */
  compare: function (d) {
    const L = d.left || { rows: [] };
    const R = d.right || { rows: [] };
    let s = '<svg viewBox="0 0 300 104" xmlns="http://www.w3.org/2000/svg">';
    s += '<rect x="8" y="2" width="136" height="17" rx="3" fill="#c98b3c" fill-opacity="0.18" stroke="#c98b3c" stroke-width="1"/>' +
      '<text x="76" y="14.5" font-size="8.5" fill="' + FIG_TEXT + '" text-anchor="middle">' + figCut(L.title, 10) + '</text>';
    s += '<rect x="156" y="2" width="136" height="17" rx="3" fill="#4fd2e6" fill-opacity="0.16" stroke="#4fd2e6" stroke-width="1"/>' +
      '<text x="224" y="14.5" font-size="8.5" fill="' + FIG_TEXT + '" text-anchor="middle">' + figCut(R.title, 10) + '</text>';
    s += '<line x1="150" y1="24" x2="150" y2="94" stroke="#2f4a5f" stroke-width="1" stroke-dasharray="4 4"/>';
    for (let i = 0; i < 3; i++) {
      if (L.rows[i]) s += '<text x="12" y="' + (36 + i * 20) + '" font-size="7.2" fill="' + FIG_TEXT + '">· ' + figCut(L.rows[i], 15) + '</text>';
      if (R.rows[i]) s += '<text x="160" y="' + (36 + i * 20) + '" font-size="7.2" fill="' + FIG_TEXT + '">· ' + figCut(R.rows[i], 15) + '</text>';
    }
    if (d.hint) s += '<text x="150" y="100" font-size="6.8" fill="' + FIG_MUTED + '" text-anchor="middle">' + figCut(d.hint, 42) + '</text>';
    return s + '</svg>';
  },

  /* 横向流程 */
  flow: function (d) {
    const its = d.items || [];
    const n = its.length;
    const w = (284 - 8 * (n - 1)) / n;
    let s = '<svg viewBox="0 0 300 104" xmlns="http://www.w3.org/2000/svg">';
    for (let i = 0; i < n; i++) {
      const x = 8 + i * (w + 8);
      const c = figColor(its, i);
      s += '<rect x="' + x + '" y="26" width="' + w + '" height="34" rx="4" fill="' + c + '" fill-opacity="0.18" stroke="' + c + '" stroke-width="1"/>';
      s += '<text x="' + (x + w / 2) + '" y="42" font-size="' + (n <= 3 ? 8 : 7) + '" fill="' + FIG_TEXT + '" text-anchor="middle">' + figCut(its[i].t, n <= 3 ? 7 : 5) + '</text>';
      if (its[i].sub) s += '<text x="' + (x + w / 2) + '" y="54" font-size="' + (n >= 5 ? 5.8 : 6.4) + '" fill="' + FIG_MUTED + '" text-anchor="middle">' + figCut(its[i].sub, n <= 3 ? 10 : 7) + '</text>';
      if (i < n - 1) {
        const ax = x + w;
        s += '<line x1="' + (ax + 1) + '" y1="43" x2="' + (ax + 7) + '" y2="43" stroke="' + FIG_MUTED + '" stroke-width="1.2"/>' +
          '<path d="M' + (ax + 4) + ' 40 L' + (ax + 8) + ' 43 L' + (ax + 4) + ' 46 Z" fill="' + FIG_MUTED + '"/>';
      }
    }
    if (d.hint) s += '<text x="150" y="80" font-size="7" fill="' + FIG_MUTED + '" text-anchor="middle">' + figCut(d.hint, 40) + '</text>';
    return s + '</svg>';
  },

  /* 刻度和阈值 */
  gauge: function (d) {
    const marks = d.marks || [];
    let s = '<svg viewBox="0 0 300 104" xmlns="http://www.w3.org/2000/svg">';
    s += '<line x1="14" y1="58" x2="288" y2="58" stroke="#5d7286" stroke-width="1.4"/>';
    s += '<path d="M288 54 L294 58 L288 62 Z" fill="#5d7286"/>';
    for (let i = 0; i < marks.length; i++) {
      const m = marks[i];
      const x = 14 + Math.max(0, Math.min(1, m.p)) * 274;
      const c = figColor(marks, i);
      s += '<line x1="' + x + '" y1="48" x2="' + x + '" y2="68" stroke="' + c + '" stroke-width="1.6"/>';
      s += '<circle cx="' + x + '" cy="58" r="3" fill="' + c + '"/>';
      s += '<text x="' + x + '" y="42" font-size="7.4" fill="' + FIG_TEXT + '" text-anchor="middle">' + figCut(m.label, 8) + '</text>';
      if (m.sub) s += '<text x="' + x + '" y="80" font-size="6.6" fill="' + FIG_MUTED + '" text-anchor="middle">' + figCut(m.sub, 10) + '</text>';
    }
    if (d.hint) s += '<text x="150" y="96" font-size="7" fill="' + FIG_MUTED + '" text-anchor="middle">' + figCut(d.hint, 40) + '</text>';
    return s + '</svg>';
  },

  /* 横条比例 */
  bars: function (d) {
    const rows = d.rows || [];
    const n = rows.length;
    let s = '<svg viewBox="0 0 300 104" xmlns="http://www.w3.org/2000/svg">';
    for (let i = 0; i < n; i++) {
      const r = rows[i];
      const y = 8 + i * (n <= 3 ? 24 : 20);
      const c = figColor(rows, i);
      s += '<text x="8" y="' + (y + 9) + '" font-size="7.4" fill="' + FIG_TEXT + '">' + figCut(r.t, 9) + '</text>';
      s += '<rect x="96" y="' + y + '" width="156" height="11" rx="2" fill="#22323f"/>';
      s += '<rect x="96" y="' + y + '" width="' + (156 * Math.max(0.04, Math.min(1, r.pct))) + '" height="11" rx="2" fill="' + c + '"/>';
      s += '<text x="284" y="' + (y + 9) + '" font-size="7.2" fill="' + FIG_MUTED + '" text-anchor="end">' + figCut(r.v, 9) + '</text>';
    }
    if (d.hint) s += '<text x="8" y="100" font-size="7" fill="' + FIG_MUTED + '">' + figCut(d.hint, 44) + '</text>';
    return s + '</svg>';
  },

  /* 格状卡片 */
  grid: function (d) {
    const cells = d.cells || [];
    const n = cells.length;
    const cols = n <= 4 ? 2 : 3;
    const rows = Math.ceil(n / cols);
    const w = cols === 2 ? 138 : 90;
    const h = n === 2 ? 48 : (rows === 2 ? 37 : 28);
    let s = '<svg viewBox="0 0 300 104" xmlns="http://www.w3.org/2000/svg">';
    for (let i = 0; i < n; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 8 + col * (w + 8);
      const y = 4 + row * (h + 7);
      const c = figColor(cells, i);
      s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" fill="' + c + '" fill-opacity="0.14" stroke="' + c + '" stroke-width="1"/>';
      s += '<text x="' + (x + 8) + '" y="' + (y + 16) + '" font-size="8.2" fill="' + FIG_TEXT + '">' + figCut(cells[i].t, cols === 2 ? 12 : 7) + '</text>';
      if (cells[i].sub) s += '<text x="' + (x + 8) + '" y="' + (y + 16 + h / 2) + '" font-size="7" fill="' + FIG_MUTED + '">' + figCut(cells[i].sub, cols === 2 ? 18 : 11) + '</text>';
    }
    if (d.hint) s += '<text x="150" y="102" font-size="6.8" fill="' + FIG_MUTED + '" text-anchor="middle">' + figCut(d.hint, 42) + '</text>';
    return s + '</svg>';
  }
};

/* 自动图例：模板没有显式 legend 时，用图元名称生成 */
function figAutoLegend(d) {
  if (d.legend) return d.legend;
  const out = [];
  const push = function (list, noteKey) {
    (list || []).forEach(function (x, i) {
      out.push({ c: figColor(list, i), t: (x.t || x.label || '') + (x[noteKey] ? '：' + x[noteKey] : '') });
    });
  };
  if (d.type === 'tree') push(d.branches, 'sub');
  else if (d.type === 'layers') push(d.rows, 'sub');
  else if (d.type === 'steps') push(d.items, 'sub');
  else if (d.type === 'compare') push([{ t: d.left.title }, { t: d.right.title }], 'sub');
  else if (d.type === 'flow') push(d.items, 'sub');
  else if (d.type === 'gauge') push(d.marks, 'sub');
  else if (d.type === 'bars') push(d.rows, 'v');
  else if (d.type === 'grid') push(d.cells, 'sub');
  return out;
}

/* ---------- 每章每个知识点的小图数据 ---------- */
const ITEM_FIGS = {
  /* 第 1 章 工程地质 */
  'ch1-i0': {
    type: 'tree', root: '岩石三大成因',
    branches: [
      { t: '岩浆岩', sub: '花岗岩·玄武岩' },
      { t: '沉积岩', sub: '石灰岩·页岩 75%' },
      { t: '变质岩', sub: '大理岩·石英岩' }
    ],
    hint: '沉积岩分布最广，约占陆壳 75%（高频考点）'
  },
  'ch1-i1': {
    type: 'steps',
    items: [{ t: '碎石土' }, { t: '砂土' }, { t: '粉土', sub: 'IP≤10' }, { t: '黏性土', sub: 'IP＞10' }],
    hint: '按颗粒由粗到细排列；IP＞10 才是黏性土'
  },
  'ch1-i2': {
    type: 'compare',
    left: { title: '明排水', rows: ['水位较低', '土质较好', '沟槽＋集水井'] },
    right: { title: '井点降水', rows: ['水位高', '粉砂·细砂', '渗透系数大'] },
    hint: '选方案先看“水位高低 + 土质渗透性”'
  },
  'ch1-i3': {
    type: 'flow',
    items: [
      { t: '可研勘察', sub: '选址' },
      { t: '初步勘察', sub: '初设' },
      { t: '详细勘察', sub: '施工图 ★' },
      { t: '施工勘察', sub: '施工中' }
    ],
    hint: '详细勘察为施工图设计提供依据——最常考'
  },
  'ch1-i4': {
    type: 'grid',
    cells: [
      { t: '滑坡', sub: '排水·支挡·减重·反压' },
      { t: '崩塌', sub: '避让·清除危岩' },
      { t: '泥石流', sub: '拦挡·排导' },
      { t: '岩溶', sub: '注浆·跨越' }
    ]
  },

  /* 第 2 章 工程构造 */
  'ch2-i0': {
    type: 'bars',
    rows: [
      { t: '低层', v: '1~3 层', pct: 0.3 },
      { t: '多层', v: '4~6 层', pct: 0.45 },
      { t: '中高层', v: '7~9 层', pct: 0.65 },
      { t: '高层', v: '≥10 层', pct: 0.9 }
    ],
    hint: '公共建筑＞24m 为高层（不含单层）'
  },
  'ch2-i1': {
    type: 'grid',
    cells: [
      { t: '条形基础', sub: '墙下，连续梁式' },
      { t: '独立基础', sub: '柱下，单独一块' },
      { t: '筏板基础', sub: '整块板，高层常用' },
      { t: '箱形基础', sub: '筏板＋顶板，刚度大' }
    ],
    hint: '另有桩基础：靠桩把荷载传到深层土'
  },
  'ch2-i2': {
    type: 'compare',
    left: { title: '单向板', rows: ['长短边比 >2', '仅短边配受力筋', '荷载单向传递'] },
    right: { title: '双向板', rows: ['长短边比 ≤2', '两方向都配筋', '荷载双向传递'] },
    hint: '墙体按受力分承重墙 / 非承重墙'
  },
  'ch2-i3': {
    type: 'gauge',
    marks: [
      { p: 0.12, label: '2h+b=600', sub: '踏步高宽关系' },
      { p: 0.55, label: '梯段', sub: '踏步＋斜板' },
      { p: 0.9, label: '平台·扶手', sub: '休息平台' }
    ],
    hint: '楼梯由梯段、休息平台、栏杆扶手组成'
  },
  'ch2-i4': {
    type: 'bars',
    rows: [
      { t: '材料找坡', v: '2%', pct: 0.4 },
      { t: '结构找坡', v: '3%', pct: 0.6 },
      { t: '卷材屋面', v: '≥2%', pct: 0.4 }
    ],
    hint: '变形缝：伸缩缝 / 沉降缝 / 防震缝'
  },
  'ch2-i5': {
    type: 'layers',
    rows: [
      { t: '屋盖结构', sub: '屋架·屋面板' },
      { t: '柱', sub: '柱距 6m 常见' },
      { t: '吊车梁', sub: '承受吊车荷载' },
      { t: '基础', sub: '独立基础为主' }
    ],
    hint: '柱距、跨度是厂房基本参数，也是算量起点'
  },

  /* 第 3 章 工程材料 */
  'ch3-i0': {
    type: 'gauge',
    marks: [
      { p: 0.05, label: '0', sub: '加水' },
      { p: 0.3, label: '≥45min', sub: '初凝' },
      { p: 0.85, label: '≤10h', sub: '终凝' }
    ],
    hint: '安定性不良＝游离氧化钙（f-CaO）作怪'
  },
  'ch3-i1': {
    type: 'bars',
    rows: [
      { t: 'C15', v: '垫层', pct: 0.25 },
      { t: 'C30', v: '梁板柱', pct: 0.5 },
      { t: 'C50', v: '高层结构', pct: 0.7 },
      { t: 'C80', v: '高强', pct: 0.95 }
    ],
    hint: '和易性＝流动性＋黏聚性＋保水性，坍落度看流动性'
  },
  'ch3-i2': {
    type: 'compare',
    left: { title: 'HPB300', rows: ['光圆钢筋', '屈服 300', '箍筋·拉结'] },
    right: { title: 'HRB400', rows: ['热轧带肋', '屈服 400', '主筋常用'] },
    hint: '带肋与混凝土粘结好，是主筋主力军'
  },
  'ch3-i3': {
    type: 'grid',
    cells: [
      { t: '烧结普通砖', sub: '传统墙材' },
      { t: '蒸压灰砂砖', sub: '不宜用于高温' },
      { t: '加气砌块', sub: '轻质保温·填充墙' },
      { t: '砌筑砂浆', sub: '强度 M 系列' }
    ],
    hint: '加气砌块吸水率高，砌前需润湿'
  },
  'ch3-i4': {
    type: 'compare',
    left: { title: '防水卷材', rows: ['SBS / APP', 'PVC / TPO', '按拉力·低温柔性分级'] },
    right: { title: '防水涂料', rows: ['聚氨酯', '聚合物水泥基', '复杂部位更好施工'] },
    hint: '卷材看低温柔性，涂料看固体含量'
  },
  'ch3-i5': {
    type: 'bars',
    rows: [
      { t: 'A 级', v: '不燃·岩棉', pct: 0.95 },
      { t: 'B1 级', v: '难燃·XPS', pct: 0.7 },
      { t: 'B2 级', v: '可燃·EPS', pct: 0.45 },
      { t: 'B3 级', v: '易燃·禁用', pct: 0.2 }
    ],
    hint: '保温材料先记燃烧等级，再记导热系数'
  },

  /* 第 4 章 施工技术 */
  'ch4-i0': {
    type: 'compare',
    left: { title: '清单量', rows: ['含工作面', '不含放坡', '按图示尺寸'] },
    right: { title: '定额量', rows: ['含工作面', '含放坡', '按实际开挖'] },
    hint: '2024 两量之差只剩“放坡”一项'
  },
  'ch4-i1': {
    type: 'bars',
    rows: [
      { t: '轻型井点', v: '3~6m', pct: 0.28 },
      { t: '喷射井点', v: '8~20m', pct: 0.62 },
      { t: '管井降水', v: '更深', pct: 0.9 }
    ],
    hint: '支护：土钉墙 / 排桩 / 地下连续墙 / SMW'
  },
  'ch4-i2': {
    type: 'compare',
    left: { title: '预制桩', rows: ['锤击·静压', '挤土明显', '质量稳定'] },
    right: { title: '灌注桩', rows: ['钻孔·沉管', '沉管易缩颈', '无挤土'] },
    hint: '沉管灌注桩防“缩颈、断桩”'
  },
  'ch4-i3': {
    type: 'flow',
    items: [
      { t: '浇筑', sub: '先柱后梁板' },
      { t: '振捣', sub: '不漏振不过振' },
      { t: '养护', sub: '≥7d / ≥14d' }
    ],
    hint: '掺缓凝剂或抗渗要求：养护不少于 14d'
  },
  'ch4-i4': {
    type: 'bars',
    rows: [
      { t: '板跨 ≤2m', v: '50%', pct: 0.5 },
      { t: '2~8m', v: '75%', pct: 0.75 },
      { t: '>8m', v: '100%', pct: 1 }
    ],
    hint: '侧模：棱角不损坏即可拆；底模看强度百分比'
  },
  'ch4-i5': {
    type: 'gauge',
    marks: [
      { p: 0.18, label: '<3%', sub: '平行屋脊' },
      { p: 0.55, label: '3%~15%', sub: '平行或垂直' },
      { p: 0.92, label: '>15%', sub: '垂直屋脊' }
    ],
    hint: '搭接：长边≥100mm；抹灰分底·中·面层'
  },

  /* 第 5 章 计量规则 */
  'ch5-i0': {
    type: 'grid',
    cells: [
      { t: 'm³ 体积', sub: '混凝土·砌体·土方·楼梯' },
      { t: 'm² 面积', sub: '防水·楼地面·门窗·保温' },
      { t: 'm 长度', sub: '管道·桥架·刷油·栏杆' },
      { t: '个/套/台', sub: '阀门·消火栓·配电箱' }
    ],
    hint: '措施项目 011601 一律按“项”'
  },
  'ch5-i1': {
    type: 'grid',
    cells: [
      { t: '模板转列', sub: '进 010505' },
      { t: '措施按项', sub: '011601' },
      { t: '取消有梁板', sub: '梁板分别列项' },
      { t: '楼梯改 m³', sub: '010502020' },
      { t: '门窗 m²', sub: '取消“樘”' }
    ],
    hint: '2024 五项结构性变化，考前默写一遍'
  },
  'ch5-i2': {
    type: 'flow',
    items: [
      { t: '柱', sub: '算到上层板面' },
      { t: '梁', sub: '算到柱侧面' },
      { t: '板', sub: '算到梁侧面' }
    ],
    hint: '楼梯与楼板以梯梁外侧面为界，无梯梁 +300mm'
  },
  'ch5-i3': {
    type: 'gauge',
    marks: [
      { p: 0.12, label: '≤0.3m²', sub: '孔洞不扣' },
      { p: 0.55, label: '梁头·板头', sub: '不扣' },
      { p: 0.88, label: '烟囱·风道', sub: '屋面不扣' }
    ],
    hint: '三个“不扣除”记一句话：小洞、梁头、屋面管井'
  },
  'ch5-i4': {
    type: 'gauge',
    marks: [
      { p: 0.35, label: '<2.2m', sub: '算 1/2' },
      { p: 0.6, label: '≥2.2m', sub: '全面积' },
      { p: 0.85, label: '雨篷≥2.10m', sub: '算 1/2' }
    ],
    hint: '室外楼梯按水平投影 1/2 计算'
  },

  /* 第 6 章 安装材料与施工 */
  'ch6-i0': {
    type: 'grid',
    cells: [
      { t: '焊接钢管', sub: '镀锌·水煤气' },
      { t: '无缝钢管', sub: '高压·高温' },
      { t: '铸铁管', sub: '排水·埋地' },
      { t: '塑料管', sub: 'PPR 给水·UPVC 排水' }
    ],
    hint: '复合管：钢塑复合，兼顾强度与耐蚀'
  },
  'ch6-i1': {
    type: 'grid',
    cells: [
      { t: '闸阀', sub: '全开全关·阻力小' },
      { t: '截止阀', sub: '可调节·阻力大' },
      { t: '止回阀', sub: '防倒流' },
      { t: '蝶阀', sub: '大口径·可调节' }
    ],
    hint: '另有安全阀：超压泄放'
  },
  'ch6-i2': {
    type: 'flow',
    items: [
      { t: '螺纹', sub: 'DN≤100' },
      { t: '法兰', sub: '大口径·可拆' },
      { t: '焊接', sub: '无缝·高压' },
      { t: '承插', sub: '铸铁·塑料' }
    ],
    hint: '镀锌管别焊接——会破坏镀锌层'
  },
  'ch6-i3': {
    type: 'compare',
    left: { title: '焊接', rows: ['电弧焊', '氩弧焊·不锈钢', '气焊·铜管'] },
    right: { title: '切割', rows: ['氧-乙炔', '等离子', '砂轮'] },
    hint: '薄壁不锈钢用氩弧焊，小口径铜管用气焊'
  },
  'ch6-i4': {
    type: 'grid',
    cells: [
      { t: 'YJV', sub: '交联聚乙烯电缆' },
      { t: 'BV', sub: '铜芯塑料导线' },
      { t: '桥架', sub: '030412003' },
      { t: '配管', sub: 'SC 焊接·JDG 紧定' }
    ],
    hint: 'YJ＝交联聚乙烯绝缘，V＝聚氯乙烯护套'
  },
  'ch6-i5': {
    type: 'layers',
    rows: [
      { t: '镀锌钢板风管', sub: '咬口连接' },
      { t: '不锈钢板风管', sub: '焊接' },
      { t: '复合风管', sub: '保温一体' },
      { t: '部件', sub: '法兰·风阀·风口' }
    ],
    hint: '风管按展开面积，部件另列'
  },

  /* 第 7 章 管道与设备计量 */
  'ch7-i0': {
    type: 'compare',
    left: { title: '计入长度', rows: ['中心线延长米', '方形补偿器', '弯头·三通'] },
    right: { title: '不扣除', rows: ['阀门', '管件·水表', '减压器·疏水器'] },
    hint: '一律按中心线，阀门管件不扣长度'
  },
  'ch7-i1': {
    type: 'grid',
    cells: [
      { t: '托架', sub: '沿墙支撑' },
      { t: '吊架', sub: '吊在楼板下' },
      { t: '卡架', sub: '固定管道' }
    ],
    hint: '支架按 kg 计算，与管道分别列项'
  },
  'ch7-i2': {
    type: 'grid',
    cells: [
      { t: '穿楼板套管', sub: '按“个”' },
      { t: '穿墙套管', sub: '按“个”' }
    ],
    hint: '套管一般单独列项，别漏'
  },
  'ch7-i3': {
    type: 'grid',
    cells: [
      { t: '机械设备', sub: '按“台”·按重量分档' },
      { t: '静置设备', sub: '按“台”' },
      { t: '仪器仪表', sub: '按“台/个”' }
    ],
    hint: '设备看“台”，管道看“米”，支架看“公斤”'
  },

  /* 第 8 章 电气 / 通风 / 消防 / 绝热 */
  'ch8-i0': {
    type: 'compare',
    left: { title: '矩形风管', rows: ['S＝2×(A+B)×L', '含弯头三通', '不含部件'] },
    right: { title: '圆形风管', rows: ['S＝π×D×L', '按中心线长', '不含阀门风口'] },
    hint: '风管展开面积按 m²，长度按中心线'
  },
  'ch8-i1': {
    type: 'layers',
    rows: [
      { t: '管道', sub: '外径 D' },
      { t: '绝热层', sub: '厚度 δ·1.033 系数' },
      { t: '防潮层', sub: 'S＝π×(D+2.1δ)×L' },
      { t: '保护层', sub: '按 m²' }
    ],
    hint: 'V＝π×(D+1.033δ)×1.033δ×L'
  },
  'ch8-i2': {
    type: 'compare',
    left: { title: '2024 口径', rows: ['管道刷油按 m', '031201001', '设备矩形管 m²'] },
    right: { title: '2013 旧口径', rows: ['管道刷油按 m²', '容易记混', '已废止'] },
    hint: '金属结构刷油 031201003 按 kg 或 m²'
  },
  'ch8-i3': {
    type: 'grid',
    cells: [
      { t: '电缆', sub: '030409·按 m' },
      { t: '配管', sub: '030412001·m' },
      { t: '线槽/桥架', sub: '002/003·按 m' },
      { t: '配电箱', sub: '030402011·台' }
    ],
    hint: '配线 030412004 也按 m，别和电缆混'
  },
  'ch8-i4': {
    type: 'grid',
    cells: [
      { t: '喷淋钢管', sub: '030901001·m' },
      { t: '消火栓钢管', sub: '030901002·m' },
      { t: '喷头', sub: '030901003·个' },
      { t: '室内消火栓', sub: '030901010·套' }
    ],
    hint: '室外消火栓 011 套，水泵接合器 012 套'
  },

  /* 第 9 章 计价与案例 */
  'ch9-i0': {
    type: 'layers',
    rows: [
      { t: '分部分项工程费', sub: '量×综合单价' },
      { t: '措施项目费', sub: '按项报价' },
      { t: '其他项目费', sub: '暂列·计日工' },
      { t: '规费', sub: '按费率' },
      { t: '税金', sub: '增值税 9%' }
    ]
  },
  'ch9-i1': {
    type: 'layers',
    rows: [
      { t: '人工费' },
      { t: '材料费' },
      { t: '施工机具使用费' },
      { t: '企业管理费' },
      { t: '利润 + 风险' }
    ],
    hint: '规费和税金单列，不含在综合单价里'
  },
  'ch9-i2': {
    type: 'steps',
    items: [{ t: '估算指标' }, { t: '概算指标' }, { t: '概算定额' }, { t: '预算定额' }, { t: '施工定额' }],
    hint: '由粗到细；预算定额是编综合单价的直接依据'
  },
  'ch9-i3': {
    type: 'gauge',
    marks: [
      { p: 0.35, label: '±15%', sub: '可调综合单价' },
      { p: 0.65, label: '物价波动', sub: '信息价/调值' },
      { p: 0.9, label: '不可抗力', sub: '按约定分担' }
    ],
    hint: '工程量偏差超 15% 才有调价空间'
  },
  'ch9-i4': {
    type: 'flow',
    items: [
      { t: '读图列项', sub: '不漏项' },
      { t: '算量', sub: '写公式带单位' },
      { t: '套价', sub: '清单＋定额' },
      { t: '汇总', sub: '措施·规费·税金' }
    ],
    hint: '评分按步骤给分，公式和单位比结果重要'
  },

  /* ---------- 第 10 章 公路工程构造 ---------- */
  'ch10-i0': {
    type: 'grid',
    cells: [
      { t: '路基', sub: '公路主体·承载' },
      { t: '路面', sub: '直接受车轮荷载' },
      { t: '桥涵', sub: '跨河跨谷' },
      { t: '隧道', sub: '穿山' },
      { t: '沿线设施', sub: '护栏·标志·照明' }
    ],
    hint: '一条路＝路基＋路面＋桥涵＋隧道＋沿线设施'
  },
  'ch10-i1': {
    type: 'compare',
    left: { title: '填方路基', rows: ['填土分层压实', '边坡 1:1.5', '压实度按重型击实'] },
    right: { title: '挖方路基', rows: ['开挖到设计标高', '边坡同样放坡', '石方需爆破'] },
    hint: '路基宽度由车道数与路肩决定'
  },
  'ch10-i2': {
    type: 'layers',
    rows: [
      { t: '面层', sub: '耐磨防滑·直接受荷' },
      { t: '基层', sub: '承重·传力' },
      { t: '垫层', sub: '排水·找平·防冻' },
      { t: '路基', sub: '最终持力层' }
    ],
    hint: '沥青混凝土与水泥混凝土是两大面层类型'
  },
  'ch10-i3': {
    type: 'bars',
    rows: [
      { t: '特大桥', v: '>1000m', pct: 0.95 },
      { t: '大桥', v: '100~1000m', pct: 0.7 },
      { t: '中桥', v: '30~100m', pct: 0.45 },
      { t: '小桥', v: '8~30m', pct: 0.25 }
    ],
    hint: '<8m 为涵洞；桥梁＝上部结构＋下部结构＋基础'
  },
  'ch10-i4': {
    type: 'compare',
    left: { title: '隧道', rows: ['围岩Ⅰ~Ⅵ级', '钻爆·盾构·沉管', '按延米计'] },
    right: { title: '涵洞', rows: ['圆管·盖板·箱涵', '跨径 <8m', '按延米/座计'] },
    hint: '围岩级别越高数字越大，Ⅵ级最差'
  },

  /* ---------- 第 11 章 公路工程计量与计价 ---------- */
  'ch11-i0': {
    type: 'grid',
    cells: [
      { t: 'JTG 3830', sub: '概算预算编制办法' },
      { t: 'JTG/T 3832', sub: '公路工程预算定额' },
      { t: '机械台班定额', sub: '配套使用' }
    ],
    hint: '交通专业不套 GB/T 50854 房建清单'
  },
  'ch11-i1': {
    type: 'compare',
    left: { title: '挖方', rows: ['断面面积×长度', '自然方计量', '弃方另计运距'] },
    right: { title: '填方', rows: ['断面面积×长度', '压实方计量', '需计洒水碾压'] },
    hint: '自然方、压实方、松方三种状态别混用'
  },
  'ch11-i2': {
    type: 'layers',
    rows: [
      { t: '面层', sub: '按 m²·厚度进特征' },
      { t: '基层', sub: '按 m²·分层' },
      { t: '垫层', sub: '按 m²' },
      { t: '透层·粘层·封层', sub: '按 m² 另计' }
    ],
    hint: '路面按面积，不按体积'
  },
  'ch11-i3': {
    type: 'grid',
    cells: [
      { t: '混凝土', sub: 'm³' },
      { t: '钢筋', sub: 't' },
      { t: '桩基', sub: 'm' },
      { t: '隧道', sub: '延米' }
    ],
    hint: '支座按个、伸缩缝按 m，别漏小构件'
  },
  'ch11-i4': {
    type: 'flow',
    items: [
      { t: '估算', sub: '立项' },
      { t: '概算', sub: '最高限额' },
      { t: '预算', sub: '施工图' },
      { t: '控制价', sub: '招标' },
      { t: '结算', sub: '竣工' }
    ],
    hint: '五算顺序：估算→概算→预算→控制价→结算'
  },

  /* ---------- 第 12 章 水工建筑物 ---------- */
  'ch12-i0': {
    type: 'steps',
    items: [{ t: 'Ⅰ等' }, { t: 'Ⅱ等' }, { t: 'Ⅲ等' }, { t: 'Ⅳ等' }, { t: 'Ⅴ等' }],
    hint: '工程分Ⅰ~Ⅴ等，建筑物分 1~5 级'
  },
  'ch12-i1': {
    type: 'layers',
    rows: [
      { t: '坝顶', sub: '交通·启闭机' },
      { t: '坝体', sub: '自重抗滑·三角形' },
      { t: '帷幕灌浆', sub: '坝基防渗' },
      { t: '排水廊道', sub: '降扬压力' }
    ],
    hint: '重力坝靠自重稳定，不是靠坝基摩擦'
  },
  'ch12-i2': {
    type: 'layers',
    rows: [
      { t: '防渗体', sub: '心墙·斜墙' },
      { t: '反滤层', sub: '防管涌' },
      { t: '护坡', sub: '防浪·防冲刷' },
      { t: '坝身排水', sub: '排渗水' }
    ],
    hint: '土石坝就地取材，关键是防渗与反滤'
  },
  'ch12-i3': {
    type: 'grid',
    cells: [
      { t: '溢洪道', sub: '控制段·泄槽·消能' },
      { t: '渠道', sub: '断面·边坡·糙率' },
      { t: '隧洞', sub: '进水口·洞身·出口' }
    ],
    hint: '泄水建筑物保坝，输水建筑物供水'
  },
  'ch12-i4': {
    type: 'compare',
    left: { title: '水闸', rows: ['闸室', '上游连接段', '下游连接段·消能'] },
    right: { title: '泵站', rows: ['水泵机组', '进出水建筑物', '电气与管道'] },
    hint: '水闸靠闸门控水，泵站靠水泵提水'
  },

  /* ---------- 第 13 章 水利工程计量与计价 ---------- */
  'ch13-i0': {
    type: 'grid',
    cells: [
      { t: '概(估)算编制规定', sub: '水利部编规' },
      { t: '预算定额', sub: '水利建筑工程' },
      { t: '台时费定额', sub: '施工机械' }
    ],
    hint: '水利走行业编规，不与房建清单混用'
  },
  'ch13-i1': {
    type: 'grid',
    cells: [
      { t: '自然方', sub: '原地未扰动' },
      { t: '压实方', sub: '填筑压实后' },
      { t: '松方', sub: '开挖松散后' }
    ],
    hint: '三种方量状态换算系数不同，套定额前先换'
  },
  'ch13-i2': {
    type: 'grid',
    cells: [
      { t: '混凝土', sub: 'm³' },
      { t: '钢筋', sub: 't' },
      { t: '模板', sub: 'm²' },
      { t: '温控·接缝灌浆', sub: '大体积专项' }
    ],
    hint: '大坝混凝土还要计温控与接缝灌浆'
  },
  'ch13-i3': {
    type: 'compare',
    left: { title: '灌浆', rows: ['帷幕·固结', '按 m 计', '钻孔与灌浆分列'] },
    right: { title: '金属结构', rows: ['闸门·启闭机', '按 t 或台', '防腐另计'] },
    hint: '灌浆按米、金属结构按吨，单位别写反'
  },
  'ch13-i4': {
    type: 'grid',
    cells: [
      { t: '导流工程', sub: '按项/按量' },
      { t: '围堰', sub: '填筑·拆除' },
      { t: '施工交通', sub: '临时道路' },
      { t: '造价文件', sub: '估算·概算·预算' }
    ],
    hint: '临时工程最容易漏，案例题要单独列'
  }
};

/* 渲染一个知识点的小图（返回 HTML，含图例） */
function renderItemFigure(chId, idx) {
  const d = ITEM_FIGS[chId + '-i' + idx];
  if (!d || !ITEM_FIG_TPL[d.type]) return '';
  const svg = ITEM_FIG_TPL[d.type](d);
  const legend = figAutoLegend(d).filter(function (l) { return l.t; });
  if (!legend.length) return '';
  return '<div class="kp-fig">' +
    '<div class="kp-fig-svg">' + svg + '</div>' +
    '<div class="kp-fig-side"><span class="kp-fig-cap">图例</span>' +
    '<div class="kp-fig-items">' + legend.map(function (l) {
      return '<div class="kp-fig-item"><i style="background:' + l.c + '"></i><span>' + l.t + '</span></div>';
    }).join('') + '</div></div></div>';
}
