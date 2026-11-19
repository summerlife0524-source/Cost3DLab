/* 章节图例：每章一张示意图 + 图例说明（纯 SVG，离线可用） */
const CH_FIGURES = {
  ch1: {
    title: '地层剖面与地下水',
    note: '看图顺序：从上往下读地层，遇到虚线先找“潜水面”。',
    svg: `
<svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="18" width="238" height="34" fill="#73604a"/>
  <rect x="10" y="52" width="238" height="30" fill="#8a7050"/>
  <rect x="10" y="82" width="238" height="30" fill="#a08a6a"/>
  <rect x="10" y="112" width="238" height="30" fill="#4b545f"/>
  <g stroke="#38424c" stroke-width="1">
    <line x1="16" y1="126" x2="42" y2="112"/><line x1="46" y1="126" x2="72" y2="112"/>
    <line x1="76" y1="126" x2="102" y2="112"/><line x1="106" y1="126" x2="132" y2="112"/>
    <line x1="136" y1="126" x2="162" y2="112"/><line x1="166" y1="126" x2="192" y2="112"/>
  </g>
  <line x1="10" y1="63" x2="248" y2="63" stroke="#4fd2e6" stroke-width="1.5" stroke-dasharray="6 4"/>
  <path d="M34 56 L44 56 L39 63 Z" fill="none" stroke="#4fd2e6" stroke-width="1.2"/>
  <line x1="10" y1="18" x2="248" y2="18" stroke="#cfe0ec" stroke-width="1.2"/>
  <g font-size="9" fill="#cfe0ec">
    <text x="252" y="40">① 填土</text>
    <text x="252" y="71">② 粉质黏土</text>
    <text x="252" y="100">③ 中砂 · 透水</text>
    <text x="252" y="131">④ 强风化岩</text>
    <text x="52" y="58" fill="#4fd2e6">潜水面</text>
  </g>
</svg>`,
    legend: [
      { c: '#73604a', t: '填土：松散、压缩性大，不能作持力层' },
      { c: '#8a7050', t: '粉质黏土：IP 10~17，常见地基土' },
      { c: '#a08a6a', t: '中砂：透水强，降水方案分界线' },
      { c: '#4b545f', t: '强风化岩：可作高层持力层' },
      { c: '#4fd2e6', t: '潜水面：判断明排还是井点降水' }
    ]
  },
  ch2: {
    title: '房屋解剖：从基础到屋面',
    note: '算量时按这个顺序自上而下或自下而上走一遍，就不会漏构件。',
    svg: `
<svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg">
  <line x1="14" y1="132" x2="306" y2="132" stroke="#46586a" stroke-width="1.5"/>
  <rect x="70" y="32" width="180" height="7" fill="#d8d0c0"/>
  <rect x="70" y="27" width="180" height="4" fill="#8fa3b4"/>
  <rect x="76" y="39" width="10" height="93" fill="#e6dfd2"/>
  <rect x="234" y="39" width="10" height="93" fill="#e6dfd2"/>
  <rect x="76" y="80" width="168" height="7" fill="#d8d0c0"/>
  <rect x="62" y="118" width="32" height="14" fill="#a99f8f"/>
  <rect x="226" y="118" width="32" height="14" fill="#a99f8f"/>
  <rect x="74" y="50" width="14" height="24" fill="#a8d8e8" stroke="#7fb6c8" stroke-width="0.8"/>
  <path d="M150 132 L150 119 L162 119 L162 109 L174 109 L174 99 L186 99 L186 89 L198 89 L198 80 L210 80"
        fill="none" stroke="#cfc7b8" stroke-width="5" stroke-linejoin="miter"/>
  <g font-size="9" fill="#cfe0ec">
    <text x="126" y="20">屋面 + 卷材防水</text>
    <text x="96" y="64" fill="#a8d8e8">门窗（m²）</text>
    <text x="196" y="150">楼梯</text>
    <text x="6" y="112">独立基础</text>
  </g>
  <g stroke="#7d95a8" stroke-width="0.9">
    <line x1="60" y1="106" x2="74" y2="118"/>
    <line x1="200" y1="144" x2="200" y2="132"/>
  </g>
  <text x="112" y="98" font-size="8" fill="#7d95a8">楼板</text>
  <text x="92" y="112" font-size="8.5" fill="#7d95a8">砌块墙</text>
</svg>`,
    legend: [
      { c: '#a99f8f', t: '基础：垫层＋独立基础＋基础梁' },
      { c: '#d8d0c0', t: '楼板：与梁分别列项（无“有梁板”）' },
      { c: '#e6dfd2', t: '墙：砌块墙扣门窗、过梁' },
      { c: '#8fa3b4', t: '屋面：防水＋保温＋保护层' },
      { c: '#a8d8e8', t: '门窗：一律按洞口面积 m²' }
    ]
  },
  ch3: {
    title: '四类主材：看形识价',
    note: '材料章考点：一句材料配一句指标，别背整段。',
    svg: `
<svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg">
  <g>
    <rect x="16" y="40" width="60" height="56" rx="6" fill="#b9c3cc"/>
    <rect x="16" y="40" width="60" height="10" rx="4" fill="#9fabb6"/>
    <text x="46" y="72" font-size="9" fill="#243444" text-anchor="middle">P·O</text>
    <text x="46" y="84" font-size="9" fill="#243444" text-anchor="middle">42.5</text>
    <text x="46" y="112" font-size="9" fill="#cfe0ec" text-anchor="middle">水泥</text>
  </g>
  <g>
    <path d="M92 62 L112 52 L132 62 L132 88 L112 98 L92 88 Z" fill="#cfc7b8"/>
    <path d="M92 62 L112 72 L132 62 L112 52 Z" fill="#e2dbcd"/>
    <text x="112" y="112" font-size="9" fill="#cfe0ec" text-anchor="middle">混凝土 C30</text>
  </g>
  <g>
    <rect x="146" y="60" width="66" height="12" rx="6" fill="#8fa3b4"/>
    <g stroke="#5d7286" stroke-width="1">
      <line x1="158" y1="60" x2="158" y2="72"/><line x1="168" y1="60" x2="168" y2="72"/>
      <line x1="178" y1="60" x2="178" y2="72"/><line x1="188" y1="60" x2="188" y2="72"/>
      <line x1="198" y1="60" x2="198" y2="72"/>
    </g>
    <text x="179" y="112" font-size="9" fill="#cfe0ec" text-anchor="middle">钢筋 HRB400</text>
    <text x="179" y="50" font-size="8" fill="#7d95a8" text-anchor="middle">带肋＝与混凝土粘结好</text>
  </g>
  <g>
    <rect x="230" y="58" width="70" height="8" fill="#4b7d8c"/>
    <rect x="230" y="70" width="70" height="8" fill="#4b7d8c"/>
    <rect x="230" y="82" width="70" height="8" fill="#4b7d8c"/>
    <text x="265" y="112" font-size="9" fill="#cfe0ec" text-anchor="middle">SBS 卷材</text>
  </g>
  <line x1="12" y1="124" x2="308" y2="124" stroke="#2f4a5f" stroke-width="1"/>
  <g font-size="8.5" fill="#7d95a8">
    <text x="16" y="138">初凝≥45min · 终凝≤10h</text>
    <text x="146" y="138">和易性看坍落度</text>
    <text x="228" y="138">坡度&gt;15% 垂直铺贴</text>
  </g>
</svg>`,
    legend: [
      { c: '#b9c3cc', t: '水泥：安定性看游离氧化钙' },
      { c: '#cfc7b8', t: '混凝土：C 后面是立方体抗压强度' },
      { c: '#8fa3b4', t: '钢筋：HPB 光圆 / HRB 带肋' },
      { c: '#4b7d8c', t: '卷材：SBS、APP、PVC、TPO' }
    ]
  },
  ch4: {
    title: '基坑剖面：工作面与放坡',
    note: '2024 口径：清单量含工作面、不含放坡；放坡只进定额量。',
    svg: `
<svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg">
  <line x1="12" y1="46" x2="308" y2="46" stroke="#46586a" stroke-width="1.5"/>
  <path d="M78 46 L120 118 L200 118 L242 46 Z" fill="#73604a"/>
  <rect x="126" y="118" width="68" height="9" fill="#cfc7b8"/>
  <rect x="138" y="104" width="44" height="14" fill="#a99f8f"/>
  <line x1="70" y1="46" x2="78" y2="46" stroke="#7d95a8" stroke-width="1"/>
  <g stroke="#f0b25e" stroke-width="1">
    <line x1="98" y1="80" x2="112" y2="80"/>
    <line x1="200" y1="80" x2="186" y2="80"/>
  </g>
  <text x="120" y="74" font-size="8.5" fill="#f0b25e">放坡 K</text>
  <text x="186" y="74" font-size="8.5" fill="#f0b25e">1:0.5</text>
  <g stroke="#4fd2e6" stroke-width="1">
    <line x1="240" y1="48" x2="240" y2="118"/>
    <path d="M236 52 L240 46 L244 52 M236 114 L240 120 L244 114" fill="none"/>
  </g>
  <text x="246" y="86" font-size="9" fill="#4fd2e6">H 挖深</text>
  <g stroke="#8fa3b4" stroke-width="1">
    <line x1="124" y1="132" x2="124" y2="118"/>
    <line x1="196" y1="132" x2="196" y2="118"/>
  </g>
  <text x="128" y="142" font-size="8.5" fill="#8fa3b4">工作面 c（并入清单量）</text>
  <text x="20" y="66" font-size="8.5" fill="#7d95a8">自然地面</text>
</svg>`,
    legend: [
      { c: '#6d5b48', t: '土方：挖基坑 010102001（含工作面）' },
      { c: '#cfc7b8', t: '垫层 010501001（基础垫层）' },
      { c: '#a99f8f', t: '独立基础 010502001' },
      { c: '#f0b25e', t: '放坡：只计入定额量，清单不体现' },
      { c: '#4fd2e6', t: '挖深 H：影响放坡系数与降水方案' }
    ]
  },
  ch5: {
    title: '四把尺子：量什么用什么单位',
    note: '看到构件先问“它用哪把尺子”，单位错了整题白算。',
    svg: `
<svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg">
  <g>
    <path d="M28 54 L52 44 L76 54 L76 86 L52 96 L28 86 Z" fill="#cfc7b8"/>
    <path d="M28 54 L52 64 L76 54 L52 44 Z" fill="#e2dbcd"/>
    <text x="52" y="112" font-size="11" fill="#f0b25e" text-anchor="middle">m³</text>
    <text x="52" y="126" font-size="8" fill="#7d95a8" text-anchor="middle">混凝土 · 砌体 · 土方</text>
  </g>
  <g>
    <rect x="96" y="50" width="60" height="40" fill="none" stroke="#8fa3b4" stroke-width="1.2"/>
    <g stroke="#3a4d5e" stroke-width="1">
      <line x1="108" y1="50" x2="108" y2="90"/><line x1="120" y1="50" x2="120" y2="90"/>
      <line x1="132" y1="50" x2="132" y2="90"/><line x1="144" y1="50" x2="144" y2="90"/>
      <line x1="96" y1="62" x2="156" y2="62"/><line x1="96" y1="74" x2="156" y2="74"/>
    </g>
    <text x="126" y="112" font-size="11" fill="#f0b25e" text-anchor="middle">m²</text>
    <text x="126" y="126" font-size="8" fill="#7d95a8" text-anchor="middle">防水 · 门窗 · 保温</text>
  </g>
  <g>
    <line x1="176" y1="70" x2="248" y2="70" stroke="#4fd2e6" stroke-width="2"/>
    <path d="M176 66 L168 70 L176 74 M248 66 L256 70 L248 74" fill="none" stroke="#4fd2e6" stroke-width="1.2"/>
    <text x="212" y="112" font-size="11" fill="#f0b25e" text-anchor="middle">m</text>
    <text x="212" y="126" font-size="8" fill="#7d95a8" text-anchor="middle">管道 · 桥架 · 刷油</text>
  </g>
  <g>
    <rect x="278" y="52" width="10" height="10" fill="#8fa3b4"/>
    <rect x="292" y="52" width="10" height="10" fill="#8fa3b4"/>
    <rect x="278" y="66" width="10" height="10" fill="#8fa3b4"/>
    <text x="290" y="112" font-size="9" fill="#f0b25e" text-anchor="middle">个/套/台</text>
    <text x="276" y="126" font-size="7.2" fill="#7d95a8" text-anchor="middle">阀门·消火栓·箱柜</text>
  </g>
  <line x1="12" y1="34" x2="308" y2="34" stroke="#2f4a5f" stroke-width="1"/>
  <text x="12" y="26" font-size="9" fill="#cfe0ec">约定：一切按设计图示尺寸，规则只解决“扣不扣、算到哪儿”</text>
</svg>`,
    legend: [
      { c: '#f0b25e', t: '体积 m³：混凝土、砌体、土方、楼梯' },
      { c: '#f0b25e', t: '面积 m²：防水、楼地面、门窗、保温' },
      { c: '#4fd2e6', t: '长度 m：管道、桥架、刷油、栏杆' },
      { c: '#8fa3b4', t: '数量：阀门、消火栓、配电箱' },
      { c: '#7d95a8', t: '措施项目 011601 全部按“项”' }
    ]
  },
  ch6: {
    title: '安装四件套：管、阀、支架、法兰',
    note: '认全这四个零件，管道章节的题目就只剩“扣不扣长度”。',
    svg: `
<svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg">
  <rect x="30" y="64" width="90" height="14" rx="7" fill="#8fa3b4"/>
  <rect x="120" y="58" width="6" height="26" fill="#5d7286"/>
  <rect x="126" y="58" width="4" height="26" fill="#cfc7b8"/>
  <path d="M130 62 L154 71 L130 80 Z" fill="#4fd2e6"/>
  <path d="M176 62 L152 71 L176 80 Z" fill="#4fd2e6"/>
  <rect x="176" y="64" width="86" height="14" rx="7" fill="#8fa3b4"/>
  <g stroke="#7d95a8" stroke-width="1">
    <line x1="60" y1="78" x2="60" y2="102"/>
    <line x1="46" y1="102" x2="74" y2="102"/>
    <line x1="50" y1="108" x2="70" y2="108"/>
  </g>
  <g font-size="8.5" fill="#cfe0ec">
    <text x="30" y="54">管道（按中心线 m）</text>
    <text x="112" y="46">法兰</text>
    <text x="148" y="54" fill="#4fd2e6">阀门（个）</text>
    <text x="34" y="122">支架（kg）</text>
  </g>
  <text x="206" y="100" font-size="8" fill="#7d95a8">焊接 / 法兰 / 螺纹 / 承插</text>
</svg>`,
    legend: [
      { c: '#8fa3b4', t: '管道：DN 表示公称直径，量中心线长度' },
      { c: '#4fd2e6', t: '阀门：按个计，031002001 金属阀门' },
      { c: '#5d7286', t: '法兰：按副/片计，随管径分档' },
      { c: '#cfc7b8', t: '支架：按 kg 计，需算型钢长度' }
    ]
  },
  ch7: {
    title: '管道计量：一条中心线到底',
    note: '口诀：管按米、阀按个、支架按公斤，阀门管件不扣长度。',
    svg: `
<svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg">
  <rect x="30" y="58" width="260" height="16" rx="8" fill="#8fa3b4"/>
  <line x1="26" y1="66" x2="294" y2="66" stroke="#4fd2e6" stroke-width="1" stroke-dasharray="5 4"/>
  <path d="M154 54 L174 66 L154 78 Z" fill="#4fd2e6"/>
  <path d="M196 54 L176 66 L196 78 Z" fill="#4fd2e6"/>
  <g stroke="#f0b25e" stroke-width="1">
    <line x1="30" y1="96" x2="290" y2="96"/>
    <path d="M30 92 L22 96 L30 100 M290 92 L298 96 L290 100" fill="none"/>
  </g>
  <text x="160" y="112" font-size="9" fill="#f0b25e" text-anchor="middle">L ＝ 中心线长度（m）</text>
  <g stroke="#7d95a8" stroke-width="1" stroke-dasharray="3 3">
    <line x1="176" y1="76" x2="176" y2="92"/>
  </g>
  <text x="182" y="44" font-size="8.5" fill="#7d95a8">阀门、管件占的长度不扣</text>
  <text x="30" y="40" font-size="9" fill="#cfe0ec">031001002 镀锌钢管 · 按 m</text>
  <text x="30" y="132" font-size="8.5" fill="#7d95a8">室内外界限：以外墙皮 1.5m 为界，界外算室外管道</text>
</svg>`,
    legend: [
      { c: '#8fa3b4', t: '管道本体：按中心线长度，不扣阀门长度' },
      { c: '#4fd2e6', t: '阀门：另列清单，按“个”计' },
      { c: '#f0b25e', t: '尺寸线：只量直线段，弯曲段按规定折算' }
    ]
  },
  ch8: {
    title: '风管展开与绝热三公式',
    note: '风管按展开面积，绝热按体积，保护层按面积——三个单位别串。',
    svg: `
<svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg">
  <text x="18" y="32" font-size="9" fill="#cfe0ec">矩形风管断面</text>
  <rect x="20" y="40" width="76" height="56" fill="none" stroke="#8fa3b4" stroke-width="1.4"/>
  <rect x="28" y="48" width="60" height="40" fill="none" stroke="#4fd2e6" stroke-width="1.2"/>
  <rect x="32" y="52" width="52" height="32" fill="#2b3d4d"/>
  <text x="22" y="110" font-size="8" fill="#8fa3b4">a</text>
  <text x="100" y="70" font-size="8" fill="#8fa3b4">b</text>
  <text x="18" y="128" font-size="8" fill="#4fd2e6">展开面积＝2×(a+b)×L</text>
  <text x="18" y="142" font-size="8" fill="#7d95a8">圆形：S＝π×D×L</text>

  <text x="126" y="32" font-size="9" fill="#cfe0ec">桥架（含电缆）</text>
  <rect x="128" y="40" width="64" height="56" fill="#3a4d5e" stroke="#8fa3b4" stroke-width="1.2"/>
  <rect x="134" y="46" width="52" height="44" fill="#4b7d8c"/>
  <circle cx="146" cy="60" r="3" fill="#cfe0ec"/>
  <circle cx="160" cy="60" r="3" fill="#cfe0ec"/>
  <circle cx="174" cy="60" r="3" fill="#cfe0ec"/>
  <text x="126" y="128" font-size="8" fill="#4fd2e6">030412003 · 按 m 计</text>

  <circle cx="246" cy="68" r="19" fill="#8fa3b4"/>
  <circle cx="246" cy="68" r="13" fill="#3a4d3d"/>
  <circle cx="246" cy="68" r="8" fill="#4fd2e6"/>
  <text x="272" y="60" font-size="9" fill="#cfe0ec">保温层</text>
  <text x="272" y="74" font-size="8" fill="#7d95a8">厚度 δ</text>
  <text x="272" y="88" font-size="8" fill="#7d95a8">外径 D</text>
  <text x="212" y="128" font-size="8" fill="#4fd2e6">V＝π×(D+1.033δ)</text>
  <text x="212" y="142" font-size="8" fill="#4fd2e6">　　×1.033δ×L</text>
</svg>`,
    legend: [
      { c: '#4fd2e6', t: '风管：展开面积 m²，030702001' },
      { c: '#8fa3b4', t: '桥架：按长度 m，030412003' },
      { c: '#8fa3b4', t: '绝热：按体积 m³，031208002' },
      { c: '#7d95a8', t: '保护层：S＝π×(D+2.1δ)×L，按 m²' }
    ]
  },
  ch9: {
    title: '造价构成：钱是怎么堆起来的',
    note: '案例题先写“分部分项”，再逐层加措施、其他、规费、税金。',
    svg: `
<svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg">
  <g>
    <rect x="28" y="40" width="158" height="22" fill="#c98b3c"/>
    <rect x="186" y="40" width="30" height="22" fill="#8fa3b4"/>
    <rect x="216" y="40" width="26" height="22" fill="#6f8fa4"/>
    <rect x="242" y="40" width="24" height="22" fill="#4b7d8c"/>
    <rect x="266" y="40" width="22" height="22" fill="#4fd2e6"/>
  </g>
  <text x="107" y="55" font-size="9" fill="#1d2b36" text-anchor="middle">分部分项</text>
  <g stroke="#7d95a8" stroke-width="0.8">
    <line x1="201" y1="62" x2="201" y2="84"/>
    <line x1="229" y1="62" x2="229" y2="84"/>
    <line x1="254" y1="62" x2="254" y2="84"/>
    <line x1="277" y1="62" x2="277" y2="84"/>
  </g>
  <g font-size="8" fill="#cfe0ec">
    <text x="196" y="96">措施</text>
    <text x="222" y="96">其他</text>
    <text x="246" y="96">规费</text>
    <text x="270" y="96">税金</text>
  </g>
  <rect x="28" y="110" width="260" height="1" fill="#2f4a5f"/>
  <text x="28" y="126" font-size="9" fill="#f0b25e">综合单价 ＝ 人 + 材 + 机 + 管理费 + 利润</text>
  <text x="28" y="141" font-size="8.5" fill="#7d95a8">其中“量”来自清单，“价”来自定额与信息价</text>
</svg>`,
    legend: [
      { c: '#c98b3c', t: '分部分项：量 × 综合单价' },
      { c: '#8fa3b4', t: '措施项目：按“项”报价，2024 全部自主报价' },
      { c: '#6f8fa4', t: '其他项目费：暂列金额、计日工等' },
      { c: '#4b7d8c', t: '规费：按费率计取' },
      { c: '#4fd2e6', t: '税金：增值税 9%' }
    ]
  }
};
