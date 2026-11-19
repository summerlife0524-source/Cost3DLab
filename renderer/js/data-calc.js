/* ============================================================
   data-calc.js  工程量计算器（输入尺寸 → 自动算量 → 套清单）
   ============================================================ */

const fx = (n) => Math.round(n * 10000) / 10000;

const CALC_TYPES = [
  {
    id: 'c-earthpit', name: '挖基坑土方（清单量）', major: '土建', unit: 'm³',
    code: '010101004', codeName: '挖基坑土方', price: 35,
    inputs: [
      { k: 'a', label: '垫层底边长', unit: 'm', def: 2.4 },
      { k: 'b', label: '垫层底边宽', unit: 'm', def: 2.4 },
      { k: 'H', label: '挖土深度', unit: 'm', def: 1.5 },
      { k: 'n', label: '基坑数量', unit: '个', def: 12 }
    ],
    formula: 'V = a × b × H × n（垫层底面积×挖深）',
    rule: '按设计图示尺寸以基础垫层底面积乘以挖土深度计算，不考虑放坡与工作面。',
    quota: '定额量需另加放坡与工作面，套“机械挖基坑土方”子目时用定额量。',
    tip: '这是清单量与定额量差异最典型的例子：清单这里算出来的只是“净量”，实际挖土更多。',
    compute: (v) => [
      { label: '单个基坑', expr: `${v.a}×${v.b}×${v.H}`, val: fx(v.a * v.b * v.H) },
      { label: '合计（清单量）', expr: `${fx(v.a * v.b * v.H)}×${v.n}`, val: fx(v.a * v.b * v.H * v.n) }
    ]
  },
  {
    id: 'c-foundation', name: '独立基础混凝土', major: '土建', unit: 'm³',
    code: '010501003', codeName: '独立基础', price: 650,
    inputs: [
      { k: 'a', label: '基础底边长', unit: 'm', def: 2.0 },
      { k: 'b', label: '基础底边宽', unit: 'm', def: 2.0 },
      { k: 'h', label: '基础高度', unit: 'm', def: 0.5 },
      { k: 'n', label: '数量', unit: '个', def: 12 }
    ],
    formula: 'V = a × b × h × n',
    rule: '按设计图示尺寸以体积计算，不扣除伸入承台基础的桩头体积。',
    quota: '现浇混凝土独立基础（第五章），模板按接触面积另列措施项目。',
    tip: '垫层体积、模板面积都不并入；基础与柱的分界在基础上表面。',
    compute: (v) => [
      { label: '单个基础', expr: `${v.a}×${v.b}×${v.h}`, val: fx(v.a * v.b * v.h) },
      { label: '合计', expr: `${fx(v.a * v.b * v.h)}×${v.n}`, val: fx(v.a * v.b * v.h * v.n) }
    ]
  },
  {
    id: 'c-cushion', name: '混凝土垫层', major: '土建', unit: 'm³',
    code: '010501001', codeName: '垫层', price: 480,
    inputs: [
      { k: 'a', label: '基础底边长', unit: 'm', def: 2.0 },
      { k: 'b', label: '基础底边宽', unit: 'm', def: 2.0 },
      { k: 'e', label: '每边宽出', unit: 'm', def: 0.1 },
      { k: 't', label: '垫层厚度', unit: 'm', def: 0.1 },
      { k: 'n', label: '数量', unit: '个', def: 12 }
    ],
    formula: 'V = (a＋2e) × (b＋2e) × t × n',
    rule: '按设计图示尺寸以体积计算，垫层与基础分别列项。',
    quota: '混凝土垫层（第五章），侧面模板按接触面积另计。',
    tip: '垫层每边宽出 100mm 是常规做法，也是挖土深度的计算终点。',
    compute: (v) => [
      { label: '垫层平面尺寸', expr: `(${v.a}＋2×${v.e})×(${v.b}＋2×${v.e})`, val: fx((v.a + 2 * v.e) * (v.b + 2 * v.e)) },
      { label: '单个垫层', expr: `${fx((v.a + 2 * v.e) * (v.b + 2 * v.e))}×${v.t}`, val: fx((v.a + 2 * v.e) * (v.b + 2 * v.e) * v.t) },
      { label: '合计', expr: `${fx((v.a + 2 * v.e) * (v.b + 2 * v.e) * v.t)}×${v.n}`, val: fx((v.a + 2 * v.e) * (v.b + 2 * v.e) * v.t * v.n) }
    ]
  },
  {
    id: 'c-column', name: '矩形柱混凝土', major: '土建', unit: 'm³',
    code: '010502001', codeName: '矩形柱', price: 700,
    inputs: [
      { k: 'b', label: '截面宽', unit: 'm', def: 0.4 },
      { k: 'h', label: '截面高', unit: 'm', def: 0.4 },
      { k: 'H', label: '柱高（算至板上表面）', unit: 'm', def: 3.3 },
      { k: 'n', label: '根数', unit: '根', def: 12 }
    ],
    formula: 'V = b × h × H × n',
    rule: '按体积计算；有梁板柱高算至上一层楼板上表面，框架柱算至柱顶，牛腿并入柱身。',
    quota: '现浇混凝土矩形柱（第五章），按断面周长分档；模板按接触面积另列。',
    tip: '柱模板面积＝截面周长×柱高×根数，先用下面的模板计算器算一遍，加深印象。',
    compute: (v) => [
      { label: '单根体积', expr: `${v.b}×${v.h}×${v.H}`, val: fx(v.b * v.h * v.H) },
      { label: '合计', expr: `${fx(v.b * v.h * v.H)}×${v.n}`, val: fx(v.b * v.h * v.H * v.n) }
    ]
  },
  {
    id: 'c-beam', name: '矩形梁混凝土', major: '土建', unit: 'm³',
    code: '010503002', codeName: '矩形梁', price: 720,
    inputs: [
      { k: 'b', label: '梁宽', unit: 'm', def: 0.25 },
      { k: 'h', label: '梁高', unit: 'm', def: 0.5 },
      { k: 'L', label: '梁净长（算至柱侧面）', unit: 'm', def: 5.6 },
      { k: 'n', label: '根数', unit: '根', def: 8 }
    ],
    formula: 'V = b × h × L × n',
    rule: '按体积计算；梁与柱连接算至柱侧面，主次梁连接时次梁算至主梁侧面。',
    quota: '现浇混凝土矩形梁（第五章），按梁高分档。',
    tip: '若梁与板整浇，应并入“有梁板”，不能再单列矩形梁。',
    compute: (v) => [
      { label: '单根体积', expr: `${v.b}×${v.h}×${v.L}`, val: fx(v.b * v.h * v.L) },
      { label: '合计', expr: `${fx(v.b * v.h * v.L)}×${v.n}`, val: fx(v.b * v.h * v.L * v.n) }
    ]
  },
  {
    id: 'c-slab', name: '有梁板混凝土', major: '土建', unit: 'm³',
    code: '010505001', codeName: '有梁板', price: 680,
    inputs: [
      { k: 'L', label: '板长', unit: 'm', def: 6 },
      { k: 'B', label: '板宽', unit: 'm', def: 4 },
      { k: 't', label: '板厚', unit: 'm', def: 0.12 },
      { k: 'bv', label: '板下梁体积合计', unit: 'm³', def: 1.2 },
      { k: 'n', label: '块数/层数', unit: '块', def: 2 }
    ],
    formula: 'V = (L × B × t ＋ 梁体积) × n',
    rule: '按体积计算，包括主梁、次梁与板；不扣除单个面积 ≤0.3m² 的孔洞。',
    quota: '现浇混凝土有梁板（第五章），按板厚分档。',
    tip: '有梁板是“板＋梁合并”，这是清单里最容易被拆错的一项。',
    compute: (v) => [
      { label: '板体积', expr: `${v.L}×${v.B}×${v.t}`, val: fx(v.L * v.B * v.t) },
      { label: '单块有梁板', expr: `${fx(v.L * v.B * v.t)}＋${v.bv}`, val: fx(v.L * v.B * v.t + v.bv) },
      { label: '合计', expr: `${fx(v.L * v.B * v.t + v.bv)}×${v.n}`, val: fx((v.L * v.B * v.t + v.bv) * v.n) }
    ]
  },
  {
    id: 'c-wall', name: '砌块墙', major: '土建', unit: 'm³',
    code: '010402001', codeName: '砌块墙', price: 520,
    inputs: [
      { k: 'L', label: '墙长（中心线）', unit: 'm', def: 20 },
      { k: 'H', label: '墙高', unit: 'm', def: 3.0 },
      { k: 't', label: '墙厚', unit: 'm', def: 0.2 },
      { k: 'A', label: '门窗洞口面积合计', unit: 'm²', def: 6 }
    ],
    formula: 'V = L × H × t － A × t',
    rule: '按体积计算，扣除门窗洞口、过梁、圈梁、构造柱及嵌入墙身的混凝土柱梁板；不扣梁头、板头、铁件、管道及 ≤0.3m² 孔洞。',
    quota: '砌块墙（第四章），按墙厚与砌块品种分档。',
    tip: '洞口面积×墙厚＝洞口所占的体积，这一步最容易漏。',
    compute: (v) => [
      { label: '墙身体积', expr: `${v.L}×${v.H}×${v.t}`, val: fx(v.L * v.H * v.t) },
      { label: '扣洞口', expr: `${v.A}×${v.t}`, val: fx(v.A * v.t) },
      { label: '净体积', expr: `${fx(v.L * v.H * v.t)}－${fx(v.A * v.t)}`, val: fx(v.L * v.H * v.t - v.A * v.t) }
    ]
  },
  {
    id: 'c-stair', name: '直形楼梯（水平投影）', major: '土建', unit: 'm²',
    code: '010506001', codeName: '直形楼梯', price: 260,
    inputs: [
      { k: 'L', label: '梯段水平投影长', unit: 'm', def: 3.0 },
      { k: 'B', label: '楼梯宽', unit: 'm', def: 1.2 },
      { k: 'w', label: '楼梯井宽', unit: 'm', def: 0.3 },
      { k: 'wL', label: '楼梯井长', unit: 'm', def: 2.0 },
      { k: 'n', label: '楼层数', unit: '层', def: 2 }
    ],
    formula: 'S = (L × B － 井宽×井长[＞0.5m 才扣]) × n',
    rule: '按水平投影面积计算，不扣除宽度 ≤500mm 的楼梯井，伸入墙内部分不计算。',
    quota: '直形楼梯（第五章），按 m²；楼梯模板同样按水平投影面积。',
    tip: '楼梯是混凝土构件里唯一按 m² 计价的“异类”，单位别写错。',
    compute: (v) => {
      const well = v.w > 0.5 ? v.w * v.wL : 0;
      return [
        { label: '投影面积', expr: `${v.L}×${v.B}`, val: fx(v.L * v.B) },
        { label: '楼梯井扣除', expr: v.w > 0.5 ? `${v.w}×${v.wL}` : '井宽≤500mm，不扣', val: fx(well) },
        { label: '单层净面积', expr: `${fx(v.L * v.B)}－${fx(well)}`, val: fx(v.L * v.B - well) },
        { label: '合计', expr: `${fx(v.L * v.B - well)}×${v.n}`, val: fx((v.L * v.B - well) * v.n) }
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
      { k: 'u', label: '弯起高度', unit: 'm', def: 0.25 }
    ],
    formula: 'S = L × B × √(1＋i²) ＋ P × u',
    rule: '按面积计算，斜屋面按斜面积；不扣烟囱、风道、小气窗、斜沟；女儿墙等弯起部分并入（无规定时按 250mm）。',
    quota: '屋面卷材防水（第九章），按卷材种类与层数分档。',
    tip: '坡度系数 √(1＋i²)：坡 2% 时几乎等于 1，坡 10% 时约 1.005——斜屋面千万别直接加面积。',
    compute: (v) => {
      const k = v.i / 100;
      const coef = Math.sqrt(1 + k * k);
      return [
        { label: '坡度系数', expr: `√(1＋${k.toFixed(3)}²)`, val: fx(coef) },
        { label: '斜面积', expr: `${v.L}×${v.B}×${coef.toFixed(3)}`, val: fx(v.L * v.B * coef) },
        { label: '弯起部分', expr: `${v.P}×${v.u}`, val: fx(v.P * v.u) },
        { label: '防水面积', expr: `${fx(v.L * v.B * coef)}＋${fx(v.P * v.u)}`, val: fx(v.L * v.B * coef + v.P * v.u) }
      ];
    }
  },
  {
    id: 'c-floor', name: '楼地面（找平/防水基层）', major: '土建', unit: 'm²',
    code: '011101001', codeName: '水泥砂浆楼地面', price: 45,
    inputs: [
      { k: 'L', label: '主墙间净长', unit: 'm', def: 17.6 },
      { k: 'B', label: '主墙间净宽', unit: 'm', def: 11.6 },
      { k: 'd', label: '扣除面积（设备基础等）', unit: 'm²', def: 4 },
      { k: 'n', label: '层数', unit: '层', def: 2 }
    ],
    formula: 'S = (L × B － d) × n',
    rule: '按主墙间净面积计算；扣除凸出地面的构筑物、设备基础，不扣间壁墙、柱、垛及 ≤0.3m² 孔洞。',
    quota: '楼地面装饰（第十一章），按面层做法分档。',
    tip: '“主墙间净面积”不是轴线面积，读图时先找净尺寸。',
    compute: (v) => [
      { label: '净面积', expr: `${v.L}×${v.B}－${v.d}`, val: fx(v.L * v.B - v.d) },
      { label: '合计', expr: `${fx(v.L * v.B - v.d)}×${v.n}`, val: fx((v.L * v.B - v.d) * v.n) }
    ]
  },
  {
    id: 'c-rebar', name: '钢筋重量', major: '土建', unit: 't',
    code: '010515001', codeName: '现浇构件钢筋', price: 5200,
    inputs: [
      { k: 'd', label: '钢筋直径', unit: 'mm', def: 20 },
      { k: 'L', label: '单根长度', unit: 'm', def: 6 },
      { k: 'n', label: '根数', unit: '根', def: 120 }
    ],
    formula: 'G = 0.00617 × d² × L × n ÷ 1000（t）',
    rule: '按设计图示钢筋长度乘单位理论质量计算；设计标明的搭接计入，未标明的不另计。',
    quota: '现浇构件钢筋（第五章），按钢筋品种、规格分档。',
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
    id: 'c-formwork', name: '柱模板（措施）', major: '土建', unit: 'm²',
    code: '011702002', codeName: '矩形柱模板', price: 55,
    inputs: [
      { k: 'b', label: '柱截面宽', unit: 'm', def: 0.4 },
      { k: 'h', label: '柱截面高', unit: 'm', def: 0.4 },
      { k: 'H', label: '柱高', unit: 'm', def: 3.3 },
      { k: 'n', label: '根数', unit: '根', def: 12 }
    ],
    formula: 'S = 2×(b＋h) × H × n',
    rule: '按模板与混凝土的接触面积计算，不扣 ≤0.3m² 孔洞；支模高度 >3.6m 部分另计超高支撑增加费。',
    quota: '柱模板（第十七章 措施项目），按材质分子目。',
    tip: '接触面积就是“混凝土贴着模板的那一圈”，四面柱＝周长×高度。',
    compute: (v) => [
      { label: '截面周长', expr: `2×(${v.b}＋${v.h})`, val: fx(2 * (v.b + v.h)) },
      { label: '单根模板', expr: `${fx(2 * (v.b + v.h))}×${v.H}`, val: fx(2 * (v.b + v.h) * v.H) },
      { label: '合计', expr: `${fx(2 * (v.b + v.h) * v.H)}×${v.n}`, val: fx(2 * (v.b + v.h) * v.H * v.n) }
    ]
  },
  {
    id: 'c-backfill', name: '基础回填方', major: '土建', unit: 'm³',
    code: '010103001', codeName: '回填方', price: 28,
    inputs: [
      { k: 'V', label: '挖方体积', unit: 'm³', def: 221.4 },
      { k: 'S', label: '自然地坪以下埋设体积', unit: 'm³', def: 30.9 }
    ],
    formula: 'V填 = V挖 － V埋设',
    rule: '基础回填＝挖方体积－自然地坪以下埋设的基础体积（含基础、垫层等）。',
    quota: '基础回填土（第一章），含夯实；余土运输另列。',
    tip: '埋设体积要把基础和垫层都算进去，别只扣基础。',
    compute: (v) => [
      { label: '回填体积', expr: `${v.V}－${v.S}`, val: fx(v.V - v.S) },
      { label: '余方弃置', expr: `挖方－回填＝${fx(v.V - (v.V - v.S))}`, val: fx(v.V - (v.V - v.S)) }
    ]
  },
  {
    id: 'c-scaffold', name: '综合脚手架', major: '土建', unit: 'm²',
    code: '011701001', codeName: '综合脚手架', price: 32,
    inputs: [
      { k: 'L', label: '首层外墙外边线长', unit: 'm', def: 18.4 },
      { k: 'B', label: '首层外墙外边线宽', unit: 'm', def: 12.4 },
      { k: 'n', label: '层数', unit: '层', def: 1 }
    ],
    formula: 'S = L × B × n（按建筑面积）',
    rule: '综合脚手架按建筑面积计算；檐高超过 20m 部分可另计超高施工增加费。',
    quota: '综合脚手架（第十七章），按檐高分档。',
    tip: '综合脚手架已含砌筑、浇筑、装饰用架，不再另计单项脚手架。',
    compute: (v) => [
      { label: '单层面积', expr: `${v.L}×${v.B}`, val: fx(v.L * v.B) },
      { label: '合计', expr: `${fx(v.L * v.B)}×${v.n}`, val: fx(v.L * v.B * v.n) }
    ]
  },
  {
    id: 'm-pipe', name: '管道长度（给水/排水）', major: '安装', unit: 'm',
    code: '031001001', codeName: '镀锌钢管', price: 65,
    inputs: [
      { k: 'H', label: '水平管总长', unit: 'm', def: 62 },
      { k: 'V', label: '垂直管总长', unit: 'm', def: 18 },
      { k: 'n', label: '系统数量', unit: '个', def: 1 }
    ],
    formula: 'L = (H ＋ V) × n（中心线延长米）',
    rule: '按管道中心线长度以延长米计算，不扣除阀门、管件所占长度。',
    quota: '镀锌钢管安装（第十册），按公称直径分档；支架按 kg 另列。',
    tip: '阀门、管件占的长度不扣；但支架、套管要另外算钱。',
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
    code: '030408003', codeName: '电缆桥架', price: 85,
    inputs: [
      { k: 'L', label: '桥架总长', unit: 'm', def: 86 },
      { k: 'n', label: '层数', unit: '层', def: 1 }
    ],
    formula: 'L = 桥架中心线长度 × n',
    rule: '按设计图示尺寸以长度计算。',
    quota: '电缆桥架安装（第四册），按规格（宽＋高）分档；支撑架按 kg 另列。',
    tip: '桥架按 m、支架按 kg、电缆按 m——三笔钱，别混。',
    compute: (v) => [
      { label: '合计长度', expr: `${v.L}×${v.n}`, val: fx(v.L * v.n) }
    ]
  },
  {
    id: 'm-insul', name: '管道绝热体积 / 保护层面积', major: '安装', unit: 'm³',
    code: '031208002', codeName: '管道绝热', price: 900,
    inputs: [
      { k: 'D', label: '管道外径', unit: 'm', def: 0.108 },
      { k: 'd', label: '绝热层厚度 δ', unit: 'm', def: 0.05 },
      { k: 'L', label: '管道长度', unit: 'm', def: 30 }
    ],
    formula: 'V = π×(D＋1.033δ)×1.033δ×L；S = π×(D＋2.1δ)×L',
    rule: '绝热按体积（m³）计算；防潮层、保护层按面积（m²）计算。',
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
    id: 'm-paint', name: '管道刷油面积', major: '安装', unit: 'm²',
    code: '031201001', codeName: '管道刷油', price: 22,
    inputs: [
      { k: 'D', label: '管道外径', unit: 'm', def: 0.108 },
      { k: 'L', label: '管道长度', unit: 'm', def: 30 },
      { k: 'c', label: '涂刷遍数', unit: '遍', def: 2 }
    ],
    formula: 'S = π × D × L × 遍数系数（面积按一遍计，遍数影响单价）',
    rule: '按设计图示表面积计算；刷油遍数与漆种在项目特征中描述，套不同遍数的定额子目。',
    quota: '管道刷油（第十二册），按漆种、遍数分档。',
    tip: '面积只算一次，遍数体现在“套哪个子目”，不是把面积乘遍数。',
    compute: (v) => [
      { label: '外表面积', expr: `3.1416×${v.D}×${v.L}`, val: fx(Math.PI * v.D * v.L) }
    ]
  },
  {
    id: 'm-hydrant', name: '室内消火栓数量', major: '安装', unit: '套',
    code: '030901007', codeName: '室内消火栓', price: 1200,
    inputs: [
      { k: 'n', label: '消火栓数量', unit: '套', def: 4 }
    ],
    formula: 'N = 设计图示数量（套）',
    rule: '按设计图示数量以“套”计算，成套含箱体、栓、水枪、水带。',
    quota: '室内消火栓安装（第九册），按明装/暗装与规格分档。',
    tip: '消火栓按套、管道按米、灭火器按具——三个单位要分清。',
    compute: (v) => [
      { label: '合计', expr: `${v.n}`, val: fx(v.n) }
    ]
  }
];
