/* ============================================================
   data-calc.js  工程量计算器（输入尺寸 → 自动算量 → 套清单）
   清单编码与计算规则依据 GB/T 50854-2024（房建）、GB/T 50856-2024（安装）
   ============================================================ */

const fx = (n) => Math.round(n * 10000) / 10000;

const CALC_TYPES = [
  {
    id: 'c-earthpit', name: '挖基坑土方（清单量）', major: '土建', unit: 'm³',
    code: '010102001', codeName: '挖基坑土方', price: 35,
    inputs: [
      { k: 'a', label: '垫层底边长', unit: 'm', def: 2.4 },
      { k: 'b', label: '垫层底边宽', unit: 'm', def: 2.4 },
      { k: 'c', label: '工作面（每边）', unit: 'm', def: 0.3 },
      { k: 'H', label: '挖土深度', unit: 'm', def: 1.5 },
      { k: 'n', label: '基坑数量', unit: '个', def: 12 }
    ],
    formula: 'V = (a＋2c) × (b＋2c) × H × n（含工作面，不含放坡）',
    rule: '2024：按基础（含垫层）底面积另加工作面面积，乘以挖土深度计算；放坡工程量不计入清单量。',
    quota: '定额量＝清单量＋放坡，套“机械挖基坑土方”子目时用定额量，差额在综合单价里回收。',
    tip: '2024 最大的变化就是“清单加工作面、不加放坡”。2013 是两样都不加。',
    compute: (v) => {
      const A = (v.a + 2 * v.c) * (v.b + 2 * v.c);
      return [
        { label: '含工作面底面积', expr: `(${v.a}＋2×${v.c})×(${v.b}＋2×${v.c})`, val: fx(A) },
        { label: '单个基坑', expr: `${fx(A)}×${v.H}`, val: fx(A * v.H) },
        { label: '合计（清单量）', expr: `${fx(A * v.H)}×${v.n}`, val: fx(A * v.H * v.n) }
      ];
    }
  },
  {
    id: 'c-foundation', name: '独立基础混凝土', major: '土建', unit: 'm³',
    code: '010502001', codeName: '独立基础', price: 650,
    inputs: [
      { k: 'a', label: '基础底边长', unit: 'm', def: 2.0 },
      { k: 'b', label: '基础底边宽', unit: 'm', def: 2.0 },
      { k: 'h', label: '基础高度', unit: 'm', def: 0.5 },
      { k: 'n', label: '数量', unit: '个', def: 12 }
    ],
    formula: 'V = a × b × h × n',
    rule: '按设计图示尺寸以体积计算，不扣除伸入承台基础的桩头体积；基础类型在项目特征中描述。',
    quota: '现浇混凝土独立基础（第五章）；模板 010505002 已进分部分项，按接触面积单独列项。',
    tip: '垫层（010501001）不并入；模板（010505002）也不并入，三笔账分开算。',
    compute: (v) => [
      { label: '单个基础', expr: `${v.a}×${v.b}×${v.h}`, val: fx(v.a * v.b * v.h) },
      { label: '合计', expr: `${fx(v.a * v.b * v.h)}×${v.n}`, val: fx(v.a * v.b * v.h * v.n) }
    ]
  },
  {
    id: 'c-cushion', name: '基础垫层', major: '土建', unit: 'm³',
    code: '010501001', codeName: '基础垫层', price: 480,
    inputs: [
      { k: 'a', label: '基础底边长', unit: 'm', def: 2.0 },
      { k: 'b', label: '基础底边宽', unit: 'm', def: 2.0 },
      { k: 'e', label: '每边宽出', unit: 'm', def: 0.1 },
      { k: 't', label: '垫层厚度', unit: 'm', def: 0.1 },
      { k: 'n', label: '数量', unit: '个', def: 12 }
    ],
    formula: 'V = (a＋2e) × (b＋2e) × t × n',
    rule: '按设计图示尺寸以体积计算。2024 把垫层移到附录 E 的 E.1，只保留“基础垫层 010501001”“楼地面垫层 010501002”两项。',
    quota: '基础垫层（第五章），侧面模板 010505001 按接触面积另列。',
    tip: '垫层每边宽出 100mm 是常规做法，也是挖土深度的计算终点。',
    compute: (v) => {
      const A = (v.a + 2 * v.e) * (v.b + 2 * v.e);
      return [
        { label: '垫层平面尺寸', expr: `(${v.a}＋2×${v.e})×(${v.b}＋2×${v.e})`, val: fx(A) },
        { label: '单个垫层', expr: `${fx(A)}×${v.t}`, val: fx(A * v.t) },
        { label: '合计', expr: `${fx(A * v.t)}×${v.n}`, val: fx(A * v.t * v.n) }
      ];
    }
  },
  {
    id: 'c-column', name: '钢筋混凝土柱', major: '土建', unit: 'm³',
    code: '010502006', codeName: '钢筋混凝土柱', price: 700,
    inputs: [
      { k: 'b', label: '截面宽', unit: 'm', def: 0.4 },
      { k: 'h', label: '截面高', unit: 'm', def: 0.4 },
      { k: 'H', label: '柱高（算至上层楼板上表面）', unit: 'm', def: 3.3 },
      { k: 'n', label: '根数', unit: '根', def: 12 }
    ],
    formula: 'V = b × h × H × n',
    rule: '按体积计算；柱高自柱基上表面（或楼板上表面）算至上一层楼板上表面；无梁板柱算至柱帽下表面。',
    quota: '现浇混凝土柱（第五章），按断面周长分档；柱面模板 010505004 按接触面积另列。',
    tip: '2024 不再分“矩形柱/异形柱”，统一叫钢筋混凝土柱；构造柱仍单列 010502021。',
    compute: (v) => [
      { label: '单根体积', expr: `${v.b}×${v.h}×${v.H}`, val: fx(v.b * v.h * v.H) },
      { label: '合计', expr: `${fx(v.b * v.h * v.H)}×${v.n}`, val: fx(v.b * v.h * v.H * v.n) }
    ]
  },
  {
    id: 'c-beam', name: '钢筋混凝土梁', major: '土建', unit: 'm³',
    code: '010502011', codeName: '钢筋混凝土梁', price: 720,
    inputs: [
      { k: 'b', label: '梁宽', unit: 'm', def: 0.25 },
      { k: 'h', label: '梁高（全高）', unit: 'm', def: 0.5 },
      { k: 'L', label: '梁净长（算至柱侧面）', unit: 'm', def: 5.6 },
      { k: 'n', label: '根数', unit: '根', def: 8 }
    ],
    formula: 'V = b × h × L × n',
    rule: '按体积计算；梁与柱连接算至柱侧面，主次梁连接时次梁算至主梁侧面；梁板分别列项时梁按全高、板算至梁侧面。',
    quota: '现浇混凝土梁（第五章），按梁高分档；梁模板 010505006 按接触面积另列。',
    tip: '2024 取消有梁板，梁和板各算各的——这是今年最容易踩的坑。',
    compute: (v) => [
      { label: '单根体积', expr: `${v.b}×${v.h}×${v.L}`, val: fx(v.b * v.h * v.L) },
      { label: '合计', expr: `${fx(v.b * v.h * v.L)}×${v.n}`, val: fx(v.b * v.h * v.L * v.n) }
    ]
  },
  {
    id: 'c-slab', name: '实心楼板混凝土', major: '土建', unit: 'm³',
    code: '010502013', codeName: '实心楼板', price: 680,
    inputs: [
      { k: 'L', label: '板长', unit: 'm', def: 6 },
      { k: 'B', label: '板宽', unit: 'm', def: 4 },
      { k: 't', label: '板厚', unit: 'm', def: 0.12 },
      { k: 'n', label: '块数/层数', unit: '块', def: 2 }
    ],
    formula: 'V = L × B × t × n（只算板厚这一层）',
    rule: '按设计图示尺寸以体积计算，不扣除单个面积≤0.3m² 的孔洞；板与梁连接时板算至梁侧面，梁按全高另列。',
    quota: '现浇混凝土板（第五章），按板厚分档；板模板 010505007 按接触面积另列。',
    tip: '2024 的板家族：实心楼板、空心楼板、坡屋面板、坡道板、其他板——没有“有梁板”了。',
    compute: (v) => [
      { label: '单块板', expr: `${v.L}×${v.B}×${v.t}`, val: fx(v.L * v.B * v.t) },
      { label: '合计', expr: `${fx(v.L * v.B * v.t)}×${v.n}`, val: fx(v.L * v.B * v.t * v.n) }
    ]
  },
  {
    id: 'c-wall', name: '砌块墙', major: '土建', unit: 'm³',
    code: '010402001', codeName: '砌块墙', price: 520,
    inputs: [
      { k: 'L', label: '墙长（外墙中心线/内墙净长）', unit: 'm', def: 20 },
      { k: 'H', label: '墙高', unit: 'm', def: 3.0 },
      { k: 't', label: '墙厚', unit: 'm', def: 0.2 },
      { k: 'A', label: '门窗洞口面积合计', unit: 'm²', def: 6 }
    ],
    formula: 'V = L × H × t － A × t',
    rule: '按体积计算，扣除门窗洞口、嵌入墙内的柱梁板及壁龛、管槽、暖气槽、消火栓箱等所占体积；不扣梁头板头、铁件管道及≤0.3m² 孔洞。',
    quota: '砌块墙（第四章），按墙厚与砌块品种分档。',
    tip: '框架间墙一律按净长计算（2024 新增），别再按中心线。',
    compute: (v) => [
      { label: '墙身体积', expr: `${v.L}×${v.H}×${v.t}`, val: fx(v.L * v.H * v.t) },
      { label: '扣洞口', expr: `${v.A}×${v.t}`, val: fx(v.A * v.t) },
      { label: '净体积', expr: `${fx(v.L * v.H * v.t)}－${fx(v.A * v.t)}`, val: fx(v.L * v.H * v.t - v.A * v.t) }
    ]
  },
  {
    id: 'c-stair', name: '楼梯（按体积）', major: '土建', unit: 'm³',
    code: '010502020', codeName: '楼梯', price: 700,
    inputs: [
      { k: 'n1', label: '踏步数（级）', unit: '级', def: 18 },
      { k: 'b', label: '踏步宽', unit: 'm', def: 0.26 },
      { k: 'h', label: '踏步高', unit: 'm', def: 0.165 },
      { k: 'B', label: '梯段宽', unit: 'm', def: 1.2 },
      { k: 't', label: '梯段板厚', unit: 'm', def: 0.12 },
      { k: 'Lp', label: '休息平台长', unit: 'm', def: 1.2 },
      { k: 'layers', label: '楼层数', unit: '层', def: 2 }
    ],
    formula: 'V =（踏步三角 ＋ 斜板 ＋ 休息平台）× 层数',
    rule: '2024 改为按设计图示尺寸以体积计算（m³），含踏步、休息平台、梯段板及伸入砌体墙内部分；与楼板分界以楼梯梁外侧面为界，无梯梁时算至最上一级踏步外边缘加 300mm。',
    quota: '现浇混凝土楼梯（第五章）；楼梯模板 010505010 按接触面积 m² 另列。',
    tip: '楼梯是今年变化最大的构件：2013 按水平投影 m²，2024 按体积 m³——单位看错整题错。',
    compute: (v) => {
      const run = v.b * v.n1, rise = v.h * v.n1;
      const diag = Math.sqrt(run * run + rise * rise);
      const stepV = 0.5 * v.b * v.h * v.n1 * v.B;
      const slabV = v.B * v.t * diag;
      const platV = v.Lp * v.B * v.t;
      const per = stepV + slabV + platV;
      return [
        { label: '梯段水平投影长', expr: `${v.b}×${v.n1}`, val: fx(run) },
        { label: '梯段高', expr: `${v.h}×${v.n1}`, val: fx(rise) },
        { label: '斜长', expr: `√(${fx(run)}²＋${fx(rise)}²)`, val: fx(diag) },
        { label: '踏步体积', expr: `0.5×${v.b}×${v.h}×${v.n1}×${v.B}`, val: fx(stepV) },
        { label: '斜板体积（斜长×板厚×梯宽）', expr: `${fx(diag)}×${v.t}×${v.B}`, val: fx(slabV) },
        { label: '休息平台体积', expr: `${v.Lp}×${v.B}×${v.t}`, val: fx(platV) },
        { label: '单层楼梯', expr: `${fx(stepV)}＋${fx(slabV)}＋${fx(platV)}`, val: fx(per) },
        { label: '合计', expr: `${fx(per)}×${v.layers}`, val: fx(per * v.layers) }
      ];
    }
  },
  {
    id: 'c-roof', name: '屋面卷材防水', major: '土建', unit: 'm²',
    code: '010902001', codeName: '屋面卷材防水', price: 48,
    inputs: [
      { k: 'L', label: '屋面水平投影长', unit: 'm', def: 18 },
      { k: 'B', label: '屋面水平投影宽', unit: 'm', def: 12 },
      { k: 'i', label: '屋面坡度', unit: '%', def: 2 },
      { k: 'P', label: '女儿墙内周长', unit: 'm', def: 60 },
      { k: 'u', label: '上翻高度', unit: 'm', def: 0.25 }
    ],
    formula: 'S = L × B × √(1＋i²) ＋ P × u',
    rule: '按面积计算：斜屋顶（不含平屋顶找坡）按斜面积，平屋顶按水平投影面积；不扣烟囱、风帽底座、风道、小气窗、斜沟，其上翻不增加；女儿墙、伸缩缝、设备基础、天窗上翻并入。',
    quota: '屋面卷材防水（第九章），按卷材品种与层数分档；找平层保护层按 010902004 屋面刚性层列项。',
    tip: '“烟囱不扣、上翻也不加”是一对连着的表述，背的时候就一起背。',
    compute: (v) => {
      const k = v.i / 100;
      const coef = Math.sqrt(1 + k * k);
      return [
        { label: '坡度系数', expr: `√(1＋${k.toFixed(3)}²)`, val: fx(coef) },
        { label: '斜面积', expr: `${v.L}×${v.B}×${coef.toFixed(3)}`, val: fx(v.L * v.B * coef) },
        { label: '上翻部分', expr: `${v.P}×${v.u}`, val: fx(v.P * v.u) },
        { label: '防水面积', expr: `${fx(v.L * v.B * coef)}＋${fx(v.P * v.u)}`, val: fx(v.L * v.B * coef + v.P * v.u) }
      ];
    }
  },
  {
    id: 'c-floorwater', name: '楼（地）面防水（上翻判定）', major: '土建', unit: 'm²',
    code: '010904001', codeName: '楼（地）面卷材防水', price: 52,
    inputs: [
      { k: 'S', label: '主墙间净面积', unit: 'm²', def: 12 },
      { k: 'P', label: '上翻部位周长', unit: 'm', def: 14 },
      { k: 'u', label: '上翻高度', unit: 'm', def: 0.25 }
    ],
    formula: 'u≤0.3m 时并入：S＋P×u；u＞0.3m 时超出部分按墙面防水 010903001',
    rule: '按主墙间净面积计算，扣凸出地面的构筑物、设备基础及>0.3m² 的柱垛孔洞；上翻≤300mm 并入楼地面防水，>300mm 按墙面防水另列。',
    quota: '楼（地）面卷材防水（第九章）；上翻>300mm 部分按墙面防水 010903001。',
    tip: '门槛从 2013 的 500mm 改成 300mm，是今年必考的判断题。',
    compute: (v) => {
      const join = v.u <= 0.3;
      const area = join ? v.S + v.P * v.u : v.S + v.P * 0.3;
      return [
        { label: '上翻判定', expr: `${v.u}m ${join ? '≤300mm，并入' : '>300mm，按墙面防水'}`, val: fx(v.u) },
        { label: '并入的卷材面积', expr: `${v.S}＋${v.P}×${join ? v.u : 0.3}`, val: fx(area) },
        { label: '另列墙面防水的高度', expr: join ? '无' : `${v.u - 0.3}m`, val: fx(join ? 0 : v.u - 0.3) }
      ];
    }
  },
  {
    id: 'c-floor', name: '楼地面（找平面层）', major: '土建', unit: 'm²',
    code: '011101001', codeName: '水泥砂浆楼地面', price: 45,
    inputs: [
      { k: 'L', label: '主墙间净长', unit: 'm', def: 17.6 },
      { k: 'B', label: '主墙间净宽', unit: 'm', def: 11.6 },
      { k: 'd', label: '扣除面积（设备基础等）', unit: 'm²', def: 4 },
      { k: 'n', label: '层数', unit: '层', def: 2 }
    ],
    formula: 'S = (L × B － d) × n',
    rule: '按主墙间净面积计算；扣除凸出地面的构筑物、设备基础，不扣间壁墙、柱、垛及≤0.3m² 孔洞。',
    quota: '楼地面装饰（第十一章/附录 L），按面层做法分档。',
    tip: '“主墙间净面积”不是轴线面积，读图时先找净尺寸。',
    compute: (v) => [
      { label: '净面积', expr: `${v.L}×${v.B}－${v.d}`, val: fx(v.L * v.B - v.d) },
      { label: '合计', expr: `${fx(v.L * v.B - v.d)}×${v.n}`, val: fx((v.L * v.B - v.d) * v.n) }
    ]
  },
  {
    id: 'c-rebar', name: '钢筋重量（按构件列项）', major: '土建', unit: 't',
    code: '010506005', codeName: '现浇混凝土梁钢筋', price: 5200,
    inputs: [
      { k: 'd', label: '钢筋直径', unit: 'mm', def: 20 },
      { k: 'L', label: '单根长度', unit: 'm', def: 6 },
      { k: 'n', label: '根数', unit: '根', def: 120 }
    ],
    formula: 'G = 0.00617 × d² × L × n ÷ 1000（t）',
    rule: '按设计图示钢筋中心线长度乘以单位理论质量计算（t）；设计（含规范规定）标明的搭接和锚固长度并入计算。',
    quota: '现浇构件钢筋（第五章），按构件与规格分档；2024 把钢筋拆成 27 个细项。',
    tip: '0.00617 是 1m 长 φ10 钢筋重量的缩影：φ10≈0.617kg/m。',
    compute: (v) => {
      const kgPerM = 0.00617 * v.d * v.d;
      return [
        { label: '单位理论质量', expr: `0.00617×${v.d}²`, val: fx(kgPerM) },
        { label: '总重量(kg)', expr: `${fx(kgPerM)}×${v.L}×${v.n}`, val: fx(kgPerM * v.L * v.n) },
        { label: '换算为吨', expr: `${fx(kgPerM * v.L * v.n)}÷1000`, val: fx(kgPerM * v.L * v.n / 1000) }
      ];
    }
  },
  {
    id: 'c-formwork', name: '柱面模板', major: '土建', unit: 'm²',
    code: '010505004', codeName: '柱面模板', price: 55,
    inputs: [
      { k: 'b', label: '柱截面宽', unit: 'm', def: 0.4 },
      { k: 'h', label: '柱截面高', unit: 'm', def: 0.4 },
      { k: 'H', label: '柱高', unit: 'm', def: 3.3 },
      { k: 'n', label: '根数', unit: '根', def: 12 }
    ],
    formula: 'S = 2×(b＋h) × H × n',
    rule: '按模板与混凝土的接触面积计算，不扣≤0.3m² 孔洞。模板在 2024 已从措施项目移入附录 E 分部分项。',
    quota: '柱面模板（第五章 E.5，编码 010505），按模板形式分档。',
    tip: '接触面积就是“混凝土贴着模板的那一圈”，四面柱＝周长×高度。',
    compute: (v) => [
      { label: '截面周长', expr: `2×(${v.b}＋${v.h})`, val: fx(2 * (v.b + v.h)) },
      { label: '单根模板', expr: `${fx(2 * (v.b + v.h))}×${v.H}`, val: fx(2 * (v.b + v.h) * v.H) },
      { label: '合计', expr: `${fx(2 * (v.b + v.h) * v.H)}×${v.n}`, val: fx(2 * (v.b + v.h) * v.H * v.n) }
    ]
  },
  {
    id: 'c-backfill', name: '基础回填方', major: '土建', unit: 'm³',
    code: '010102007', codeName: '回填方', price: 28,
    inputs: [
      { k: 'V', label: '挖方清单量', unit: 'm³', def: 221.4 },
      { k: 'S', label: '地坪以下埋设体积', unit: 'm³', def: 30.9 }
    ],
    formula: 'V填 = V挖 － V埋设',
    rule: '基础回填＝挖方清单量－自然地坪以下埋设的基础（含垫层）体积；房心回填按主墙间面积×回填厚度。',
    quota: '基础回填土（第一章），含夯实与场内运输；余方弃置 010103002 另列。',
    tip: '2024 回填方编码从 010103001 改成 010102007，位置也搬到了基础土石方一节。',
    compute: (v) => [
      { label: '回填体积', expr: `${v.V}－${v.S}`, val: fx(v.V - v.S) },
      { label: '余方弃置', expr: `挖方－回填＝${fx(v.V - (v.V - v.S))}`, val: fx(v.V - (v.V - v.S)) }
    ]
  },
  {
    id: 'c-scaffold', name: '脚手架（按项）', major: '土建', unit: '项',
    code: '011601001', codeName: '脚手架', price: 32,
    inputs: [
      { k: 'L', label: '首层外墙外边线长（参考）', unit: 'm', def: 18.4 },
      { k: 'B', label: '首层外墙外边线宽（参考）', unit: 'm', def: 12.4 },
      { k: 'rate', label: '参考单方指标', unit: '元/m²', def: 32 }
    ],
    formula: '工程量 1 项；参考报价 ＝ 建筑面积 × 单方指标',
    rule: '2024 措施项目按“项”列项：脚手架 011601001、垂直运输 011601002，由投标人按施工方案自主报价，不再按建筑面积计量。',
    quota: '脚手架（第十七章），单位 项，按搭设方案、檐高、结构形式组价。',
    tip: '2013 的综合脚手架 m²（011701001）已经作废，案例题里写“216m²×32 元”就是旧口径。',
    compute: (v) => {
      const area = v.L * v.B;
      return [
        { label: '参考建筑面积', expr: `${v.L}×${v.B}`, val: fx(area) },
        { label: '工程量', expr: '1 项（不可计量，自主报价）', val: 1 },
        { label: '参考报价', expr: `${fx(area)}×${v.rate}`, val: fx(area * v.rate) }
      ];
    }
  },
  {
    id: 'm-pipe', name: '给水管道长度（镀锌钢管）', major: '安装', unit: 'm',
    code: '031001002', codeName: '镀锌钢管', price: 65,
    inputs: [
      { k: 'H', label: '水平管总长', unit: 'm', def: 62 },
      { k: 'V', label: '垂直管总长', unit: 'm', def: 18 },
      { k: 'n', label: '系统数量', unit: '个', def: 1 }
    ],
    formula: 'L = (H ＋ V) × n（中心线延长米）',
    rule: '按管道中心线长度以延长米计算，不扣除阀门、管件所占长度。',
    quota: '镀锌钢管安装（第十册），按公称直径分档；支架按 kg 另列。',
    tip: '2024 镀锌钢管编码是 031001002（2013 是 001），别抄错。',
    compute: (v) => [
      { label: '单系统长度', expr: `${v.H}＋${v.V}`, val: fx(v.H + v.V) },
      { label: '合计', expr: `${fx(v.H + v.V)}×${v.n}`, val: fx((v.H + v.V) * v.n) }
    ]
  },
  {
    id: 'm-duct-rect', name: '矩形风管展开面积', major: '安装', unit: 'm²',
    code: '030702001', codeName: '碳钢通风管道', price: 150,
    inputs: [
      { k: 'A', label: '风管截面长', unit: 'm', def: 0.6 },
      { k: 'B', label: '风管截面宽', unit: 'm', def: 0.4 },
      { k: 'L', label: '风管中心线长度', unit: 'm', def: 24 }
    ],
    formula: 'S = 2 × (A ＋ B) × L',
    rule: '按内径尺寸以展开面积计算，不扣除检查孔、测定孔、送风口、吸风口；长度含弯头、三通、变径，不含部件（阀门、风口）。',
    quota: '碳钢通风管道制作安装（第七册），按板厚与连接方式分档。',
    tip: '长度按中心线，弯头三通要算进去；但风阀、风口本身占的长度不算管长。',
    compute: (v) => [
      { label: '截面周长', expr: `2×(${v.A}＋${v.B})`, val: fx(2 * (v.A + v.B)) },
      { label: '展开面积', expr: `${fx(2 * (v.A + v.B))}×${v.L}`, val: fx(2 * (v.A + v.B) * v.L) }
    ]
  },
  {
    id: 'm-duct-round', name: '圆形风管展开面积', major: '安装', unit: 'm²',
    code: '030702001', codeName: '碳钢通风管道', price: 150,
    inputs: [
      { k: 'D', label: '风管直径（内径）', unit: 'm', def: 0.5 },
      { k: 'L', label: '风管中心线长度', unit: 'm', def: 18 }
    ],
    formula: 'S = π × D × L',
    rule: '按内径尺寸以展开面积计算，π 取 3.1416。',
    quota: '碳钢通风管道制作安装（第七册）。',
    tip: '圆形风管算的是“摊开的那张铁皮”的面积，不是截面积。',
    compute: (v) => [
      { label: '展开面积', expr: `3.1416×${v.D}×${v.L}`, val: fx(Math.PI * v.D * v.L) }
    ]
  },
  {
    id: 'm-tray', name: '电缆桥架长度', major: '安装', unit: 'm',
    code: '030412003', codeName: '桥架', price: 85,
    inputs: [
      { k: 'L', label: '桥架总长', unit: 'm', def: 86 },
      { k: 'n', label: '层数', unit: '层', def: 1 }
    ],
    formula: 'L = 桥架中心线长度 × n',
    rule: '按设计图示尺寸以长度计算。桥架安装含本体、跨接接地、隔板盖板等附件。',
    quota: '桥架安装（第四册），按规格（宽＋高）分档；支撑架按 kg 另列。',
    tip: '2024 桥架是 030412003（D.12 配管配线表），桥架按 m、支架按 kg、电缆按 m——三笔钱。',
    compute: (v) => [
      { label: '合计长度', expr: `${v.L}×${v.n}`, val: fx(v.L * v.n) }
    ]
  },
  {
    id: 'm-insul', name: '管道绝热体积 / 保护层面积', major: '安装', unit: 'm³',
    code: '031208002', codeName: '其他管道绝热', price: 900,
    inputs: [
      { k: 'D', label: '管道外径', unit: 'm', def: 0.108 },
      { k: 'd', label: '绝热层厚度 δ', unit: 'm', def: 0.05 },
      { k: 'L', label: '管道长度', unit: 'm', def: 30 }
    ],
    formula: 'V = π×(D＋1.033δ)×1.033δ×L；S = π×(D＋2.1δ)×L',
    rule: '绝热按体积（m³）计算；防潮层、保护层（031208007）按面积（m²）计算。',
    quota: '管道绝热（第十二册），按绝热材料与管径分档；保护层另列。',
    tip: '1.033＝1＋3.3% 厚度正偏差，2.1 用于保护层面积——这两个数一定要背下来。',
    compute: (v) => {
      const din = v.D + 1.033 * v.d;
      const V = Math.PI * din * 1.033 * v.d * v.L;
      const S = Math.PI * (v.D + 2.1 * v.d) * v.L;
      return [
        { label: '计算直径', expr: `${v.D}＋1.033×${v.d}`, val: fx(din) },
        { label: '绝热体积', expr: `3.1416×${fx(din)}×1.033×${v.d}×${v.L}`, val: fx(V) },
        { label: '保护层/防潮层面积', expr: `3.1416×(${v.D}＋2.1×${v.d})×${v.L}`, val: fx(S) }
      ];
    }
  },
  {
    id: 'm-paint', name: '管道刷油长度', major: '安装', unit: 'm',
    code: '031201001', codeName: '管道刷油', price: 22,
    inputs: [
      { k: 'L', label: '管道长度（中心线）', unit: 'm', def: 30 },
      { k: 'c', label: '涂刷遍数', unit: '遍', def: 2 }
    ],
    formula: 'L = 管道中心线长度；遍数只影响单价',
    rule: '按设计图示中心线以长度计算（m）。除锈级别、油漆品种、涂刷遍数、管道外径写进项目特征。',
    quota: '管道刷油（第十二册），按管径与漆种、遍数分档。',
    tip: '2024 管道刷油从 m² 改成 m！设备与矩形管道刷油才仍是 m²，金属结构按 kg/m²。',
    compute: (v) => [
      { label: '工程量', expr: `${v.L}`, val: fx(v.L) },
      { label: '说明', expr: `按 ${v.c} 遍套定额子目，工程量不乘遍数`, val: fx(v.c) }
    ]
  },
  {
    id: 'm-hydrant', name: '室内消火栓数量', major: '安装', unit: '套',
    code: '030901010', codeName: '室内消火栓', price: 1200,
    inputs: [
      { k: 'n', label: '消火栓数量', unit: '套', def: 4 }
    ],
    formula: 'N = 设计图示数量（套）',
    rule: '按设计图示数量以“套”计算，成套含箱体、消火栓、水枪、水带。',
    quota: '室内消火栓安装（第九册），按明装/暗装与规格分档。',
    tip: '2024 室内消火栓是 030901010（2013 的 007 现在是减压孔板）。',
    compute: (v) => [
      { label: '合计', expr: `${v.n}`, val: fx(v.n) }
    ]
  }
];
