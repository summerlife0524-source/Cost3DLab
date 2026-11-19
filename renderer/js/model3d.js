/* ============================================================
   model3d.js  三维构件模型（three.js r128）
   ============================================================ */
const Lab = (function () {
  let scene, camera, renderer, controls, raycaster;
  let root, labelLayer, container;
  let lights = null;
  const meshIndex = {};      // compId -> [mesh]
  const anchors = [];        // {id, pos:Vector3, el}
  let selectedId = null;
  let hoverId = null;
  let cutMode = false;
  let showLabels = true;
  let showScaffold = false;
  let autoRotate = false;
  let camAnim = null;
  let onPickCb = null;
  let onHoverCb = null;
  let sceneKey = 'building';
  const pointer = new THREE.Vector2();

  const C = {
    ground: 0x0c1826,
    soil: 0x6b4f34,
    cushion: 0x8d9199,
    foundation: 0xa8a094,
    concrete: 0xb8b3aa,
    concrete2: 0xc3bdb2,
    asphalt: 0x2e3540,
    asphaltTop: 0x3a4551,
    steel: 0x9fb0bd,
    water: 0x2f6f9e,
    hill: 0x4b4034,
    wall: 0xe6dcc8,
    wall2: 0xd8cdb6,
    stair: 0xc9c0b0,
    roofWater: 0x2f8f83,
    doorWood: 0x8b5a2b,
    glass: 0x9fd9ee,
    pipeWater: 0x3f8fd2,
    pipeDrain: 0x9aa3ab,
    insulation: 0xe8b44b,
    tray: 0x8e9aa6,
    duct: 0xb9c6cf,
    red: 0xd4483f,
    box: 0x8c98a4,
    scaffold: 0xd98324
  };

  function mat(color, opts) {
    opts = opts || {};
    const alpha = opts.opacity === undefined ? 1 : opts.opacity;
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: opts.rough === undefined ? 0.78 : opts.rough,
      metalness: opts.metal === undefined ? 0.06 : opts.metal,
      transparent: alpha < 1,
      opacity: alpha,
      depthWrite: alpha >= 1 ? true : (opts.depthWrite === undefined ? false : opts.depthWrite),
      emissive: 0x000000,
      flatShading: false
    });
  }

  function reg(mesh, id, part) {
    mesh.userData.compId = id;
    mesh.userData.part = part || '';
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    (meshIndex[id] = meshIndex[id] || []).push(mesh);
    root.add(mesh);
    return mesh;
  }

  function box(id, w, h, d, x, y, z, color, opts) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
    m.position.set(x, y, z);
    return reg(m, id, opts && opts.part);
  }

  function cyl(id, r, h, x, y, z, color, opts) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 20), mat(color, opts));
    m.position.set(x, y, z);
    return reg(m, id, opts && opts.part);
  }

  function buildBuilding() {
    // ---------- 场地与土体 ----------
    const grid = new THREE.GridHelper(30, 30, 0x21405c, 0x152c40);
    grid.position.y = 0.006;
    root.add(grid);

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 34),
      new THREE.MeshStandardMaterial({ color: 0x08131f, roughness: 1, transparent: true, opacity: 0.95, depthWrite: false })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.02;
    plane.receiveShadow = true;
    root.add(plane);

    // 土体（挖方示意，半透明）
    box('earthwork', 8.2, 1.1, 6.4, 0, -0.55, 0, C.soil, { opacity: 0.14, rough: 1, part: '土体' });
    box('earthwork', 8.2, 0.06, 6.4, 0, -1.12, 0, C.soil, { opacity: 0.35, rough: 1, part: '坑底' });

    // ---------- 基础 ----------
    const cols = [[-2.8, -1.8], [2.8, -1.8], [-2.8, 1.8], [2.8, 1.8]];
    cols.forEach(function (c) {
      box('cushion', 1.0, 0.15, 1.0, c[0], -0.875, c[1], C.cushion, { rough: 0.95, part: '垫层' });
      box('foundation', 0.8, 0.51, 0.8, c[0], -0.55, c[1], C.foundation, { part: '独立基础' });
    });

    // 基础梁
    [-1.8, 1.8].forEach(function (z) {
      box('beam', 5.2, 0.51, 0.25, 0, -0.05, z, C.concrete, { part: '基础梁' });
    });
    [-2.8, 2.8].forEach(function (x) {
      box('beam', 0.25, 0.51, 3.4, x, -0.05, 0, C.concrete, { part: '基础梁' });
    });

    // ---------- 柱 ----------
    cols.forEach(function (c) {
      const cx = c[0] > 0 ? 2.78 : -2.78;
      const cz = c[1] > 0 ? 1.78 : -1.78;
      box('column', 0.4, 6.91, 0.4, cx, 3.15, cz, C.concrete2, { part: '框架柱' });
      // 柱顶节点板（视觉装饰）
      box('column', 0.5, 0.09, 0.5, cx, 6.585, cz, C.concrete, { part: '柱帽' });
    });

    // ---------- 梁、板 ----------
    [3.36, 6.6].forEach(function (top, idx) {
      const yc = top - 0.25;
      [-1.8, 1.8].forEach(function (z) {
        box('beam', 6.0, 0.51, 0.25, 0, yc, z, C.concrete, { part: idx ? '屋面梁' : '楼面梁' });
      });
      [-2.8, 2.8].forEach(function (x) {
        box('beam', 0.25, 0.51, 3.6, x, yc, 0, C.concrete, { part: idx ? '屋面梁' : '楼面梁' });
      });
      box('slab', 6.0, 0.12, 4.0, 0, top - 0.06, 0, C.concrete2, { part: idx ? '屋面板' : '楼板' });
    });

    // ---------- 墙（可剖切） ----------
    const wallOpt = { part: '外墙' };
    // 一层：z=+2 前墙（留门洞 1.2m）
    box('wall', 4.2, 3.37, 0.2, -0.9, 1.68, 1.9, C.wall, wallOpt);
    box('wall', 0.6, 3.37, 0.2, 2.7, 1.68, 1.9, C.wall, wallOpt);
    // 一层：z=-2 后墙
    box('wall', 6.0, 3.37, 0.2, 0, 1.68, -1.9, C.wall, wallOpt);
    // 一层：x=±3 侧墙（略外移并加深，避免与前后墙、柱外表面共面产生闪烁）
    box('wall', 0.2, 3.37, 3.7, -2.92, 1.68, 0, C.wall, wallOpt);
    box('wall', 0.2, 3.37, 3.7, 2.92, 1.68, 0, C.wall, wallOpt);
    // 二层（底边压在一层墙顶之上，避免两面共面）
    box('wall', 6.0, 3.24, 0.2, 0, 4.99, 1.9, C.wall2, wallOpt);
    box('wall', 6.0, 3.24, 0.2, 0, 4.99, -1.9, C.wall2, wallOpt);
    box('wall', 0.2, 3.24, 3.7, -2.92, 4.99, 0, C.wall2, wallOpt);
    box('wall', 0.2, 3.24, 3.7, 2.92, 4.99, 0, C.wall2, wallOpt);

    // ---------- 门窗 ----------
    box('door', 1.2, 2.1, 0.06, 1.8, 1.05, 1.9, C.doorWood, { part: '门' });
    const winOpt = { opacity: 0.62, rough: 0.35, metal: 0.08, part: '窗' };
    box('door', 1.5, 1.5, 0.05, -1.6, 1.7, -2.04, C.glass, winOpt);
    box('door', 1.5, 1.5, 0.05, 1.6, 1.7, -2.04, C.glass, winOpt);
    box('door', 1.5, 1.5, 0.05, -1.6, 4.9, -2.04, C.glass, winOpt);
    box('door', 1.5, 1.5, 0.05, 1.6, 4.9, -2.04, C.glass, winOpt);
    box('door', 0.06, 1.5, 1.5, 3.04, 4.9, 0, C.glass, winOpt);
    // 正立面窗（朝向镜头）
    box('door', 1.3, 1.4, 0.05, -1.7, 1.75, 2.04, C.glass, winOpt);
    box('door', 1.3, 1.4, 0.05, -1.7, 4.9, 2.04, C.glass, winOpt);
    box('door', 1.3, 1.4, 0.05, 0.3, 4.9, 2.04, C.glass, winOpt);

    // ---------- 楼梯（直形楼梯，20 级，坡度约 32°） ----------
    const stRise = 0.165, stTread = 0.26, stW = 1.0, stX0 = -2.5, stZ = -1.15;
    for (let i = 0; i < 20; i++) {
      const y = stRise * (i + 1);
      box('stair', stTread + 0.02, 0.055, stW, stX0 + stTread * (i + 0.5), y - 0.028, stZ, C.stair, { rough: 0.9, part: '楼梯踏步' });
      box('stair', 0.035, stRise, stW, stX0 + stTread * i, y - stRise / 2, stZ, C.stair, { rough: 0.9, part: '楼梯踏步' });
    }
    const waist = box('stair', Math.hypot(5.2, 3.3) + 0.1, 0.1, stW, stX0 + 2.6, 1.62, stZ, C.stair, { rough: 0.9, part: '梯段底板' });
    waist.rotation.z = -Math.atan2(3.3, 5.2);

    // ---------- 屋面防水 + 女儿墙 ----------
    box('roof', 6.16, 0.04, 4.16, 0, 6.66, 0, C.roofWater, { rough: 0.5, part: '卷材防水' });
    box('roof', 6.16, 0.42, 0.13, 0, 6.82, 2.01, C.wall2, { part: '女儿墙' });
    box('roof', 6.16, 0.42, 0.13, 0, 6.82, -2.01, C.wall2, { part: '女儿墙' });
    box('roof', 0.13, 0.42, 4.16, -3.01, 6.82, 0, C.wall2, { part: '女儿墙' });
    box('roof', 0.13, 0.42, 4.16, 3.01, 6.82, 0, C.wall2, { part: '女儿墙' });

    // ---------- 楼地面防水（卫生间示意） ----------
    box('waterproof', 2.0, 0.03, 1.2, 1.5, 0.02, 1.2, 0x4fa8c8, { opacity: 0.55, rough: 0.4, part: '防水层' });

    // ---------- 安装：给水、排水、保温 ----------
    cyl('waterpipe', 0.05, 6.4, 2.55, 3.2, -1.72, C.pipeWater, { metal: 0.55, rough: 0.35, part: '给水立管' });
    const wq = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 16), mat(C.pipeWater, { metal: 0.55, rough: 0.35 }));
    wq.rotation.z = Math.PI / 2;
    wq.position.set(1.65, 1.0, -1.72);
    reg(wq, 'waterpipe', '给水横管');

    cyl('drainpipe', 0.07, 6.4, -2.55, 3.2, -1.72, C.pipeDrain, { metal: 0.4, part: '排水立管' });
    cyl('insulation', 0.105, 2.0, 2.55, 4.4, -1.72, C.insulation, { rough: 0.9, part: '绝热层' });

    // 阀门
    const vbox = box('valve', 0.16, 0.16, 0.16, 1.45, 1.0, -1.72, C.red, { metal: 0.3, part: '阀门' });

    // ---------- 安装：消防 ----------
    box('hydrant', 0.36, 0.9, 0.2, -2.55, 1.4, 1.66, C.red, { metal: 0.25, rough: 0.5, part: '消火栓箱' });

    // ---------- 安装：桥架、风管 ----------
    box('cabletray', 5.2, 0.12, 0.36, 0, 6.28, 0.55, C.tray, { metal: 0.6, rough: 0.45, part: '电缆桥架' });
    box('cabletray', 0.10, 0.10, 3.4, 1.4, 6.28, -0.35, C.tray, { metal: 0.6, part: '桥架' });
    box('airduct', 3.8, 0.45, 0.7, 0.9, 5.86, -1.05, C.duct, { metal: 0.55, rough: 0.4, part: '风管' });

    // ---------- 安装：配电箱 ----------
    box('distribution', 0.5, 0.7, 0.18, -2.7, 1.6, 0.9, C.box, { metal: 0.3, part: '配电箱' });

    // ---------- 措施：脚手架（可开关） ----------
    const sc = new THREE.Group();
    [[-3.35, 2.45], [3.35, 2.45], [-3.35, -2.45], [3.35, -2.45], [0, 2.45], [0, -2.45]].forEach(function (p) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 7.2, 12), mat(C.scaffold, { metal: 0.4, rough: 0.5 }));
      m.position.set(p[0], 3.6, p[1]);
      m.userData.compId = 'scaffold';
      m.castShadow = true;
      (meshIndex['scaffold'] = meshIndex['scaffold'] || []).push(m);
      sc.add(m);
    });
    [1.2, 3.6, 6.0].forEach(function (y) {
      [[0, 2.45, 6.9, 0.06], [0, -2.45, 6.9, 0.06]].forEach(function (b) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(b[2], b[3], b[3]), mat(C.scaffold, { metal: 0.4 }));
        m.position.set(b[0], y, b[1]);
        m.userData.compId = 'scaffold';
        (meshIndex['scaffold'] = meshIndex['scaffold'] || []).push(m);
        sc.add(m);
      });
      [[2.45, 0], [-2.45, 0]].forEach(function (b) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 4.9), mat(C.scaffold, { metal: 0.4 }));
        m.position.set(b[0], y, b[1]);
        m.userData.compId = 'scaffold';
        (meshIndex['scaffold'] = meshIndex['scaffold'] || []).push(m);
        sc.add(m);
      });
    });
    sc.name = 'scaffoldGroup';
    root.add(sc);
    root.userData.scaffold = sc;
    sc.visible = false;

    // ---------- 标注锚点 ----------
    const A = [
      ['column', '2.8', '1.55', '1.8'],
      ['slab', '0', '3.45', '0'],
      ['beam', '-2.8', '3.1', '0'],
      ['foundation', '-2.8', '-0.55', '1.8'],
      ['earthwork', '-3.9', '-0.9', '2.7'],
      ['wall', '-2.95', '2.3', '0.5'],
      ['stair', '2.0', '1.7', '-1.15'],
      ['roof', '0', '7.3', '0'],
      ['door', '1.8', '1.2', '2.05'],
      ['waterpipe', '2.55', '5.0', '-1.72'],
      ['drainpipe', '-2.55', '4.9', '-1.72'],
      ['insulation', '2.55', '4.4', '-1.72'],
      ['hydrant', '-2.55', '1.5', '1.8'],
      ['valve', '1.45', '1.25', '-1.72'],
      ['cabletray', '2.2', '6.45', '0.55'],
      ['airduct', '2.2', '6.05', '-1.05']
    ];
    A.forEach(function (a) {
      anchors.push({ id: a[0], pos: new THREE.Vector3(+a[1], +a[2], +a[3]), el: null });
    });
  }

  /* ---------- 场景公用 ---------- */
  function ground() {
    const grid = new THREE.GridHelper(30, 30, 0x21405c, 0x152c40);
    grid.position.y = 0.006;
    root.add(grid);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 34),
      new THREE.MeshStandardMaterial({ color: 0x08131f, roughness: 1, transparent: true, opacity: 0.95, depthWrite: false })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.02;
    plane.receiveShadow = true;
    root.add(plane);
  }

  function prism(id, pts, depth, zc, color, opts) {
    const sh = new THREE.Shape();
    sh.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]);
    const g = new THREE.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: false });
    const m = new THREE.Mesh(g, mat(color, opts));
    m.position.z = zc - depth / 2;
    return reg(m, id, opts && opts.part);
  }

  function addAnchor(id, x, y, z) {
    anchors.push({ id: id, pos: new THREE.Vector3(x, y, z), el: null });
  }

  /* ---------- 场景二：公路工程 ---------- */
  function buildHighway() {
    sceneKey = 'highway';
    ground();

    // 桥下河道（跟着桥梁构件一起选中）
    box('hw-bridge', 14, 0.4, 6.0, 0, -0.28, 0.7, 0x11242f, { rough: 1, part: '桥下河道' });
    box('hw-bridge', 13.6, 0.06, 5.6, 0, -0.04, 0.7, 0x1d4763, { opacity: 0.55, rough: 0.4, part: '桥下河道' });

    // 路堤（两段，中间是桥）
    const emb = [[-6.2, 0], [6.2, 0], [3.6, 1.9], [-3.6, 1.9]];
    prism('hw-subgrade', emb, 7.0, -5.5, C.soil, { rough: 0.95, part: '填方路基' });
    prism('hw-subgrade', emb, 5.6, 6.2, C.soil, { rough: 0.95, part: '填方路基' });

    // 路面三层
    const segs = [{ c: -5.5, d: 7.0 }, { c: 6.2, d: 5.6 }];
    segs.forEach(function (s) {
      box('hw-pavement', 7.2, 0.12, s.d, 0, 1.96, s.c, 0x6f7276, { rough: 0.95, part: '垫层' });
      box('hw-pavement', 7.1, 0.18, s.d, 0, 2.11, s.c, 0x8e8a80, { rough: 0.9, part: '基层' });
      box('hw-pavement', 7.0, 0.10, s.d, 0, 2.25, s.c, 0x2b323c, { rough: 0.8, part: '沥青面层' });
    });

    // 桥梁：桥面 + 梁体 + 桥台 + 桥墩 + 桥面护栏
    box('hw-bridge', 7.0, 0.36, 5.6, 0, 2.12, 0.7, C.concrete2, { part: '桥面' });
    box('hw-bridge', 7.0, 0.10, 5.6, 0, 2.35, 0.7, 0x2b323c, { rough: 0.8, part: '桥面铺装' });
    [-2.0, 2.0].forEach(function (x) {
      box('hw-bridge', 0.45, 0.5, 5.4, x, 1.8, 0.7, C.concrete, { part: '梁体' });
    });
    [-2.15, 3.55].forEach(function (z) {
      box('hw-bridge', 7.3, 2.2, 0.6, 0, 1.0, z, C.concrete, { part: '桥台' });
    });
    [-2.4, 2.4].forEach(function (x) {
      cyl('hw-bridge', 0.45, 1.9, x, 0.9, 0.7, C.concrete, { part: '桥墩' });
      box('hw-bridge', 1.06, 0.18, 1.0, x, 1.82, 0.7, C.concrete2, { part: '墩帽' });
    });
    [-3.35, 3.35].forEach(function (x) {
      box('hw-bridge', 0.1, 0.14, 5.4, x, 2.98, 0.7, C.steel, { metal: 0.6, part: '桥面护栏' });
      for (let z = -1.8; z <= 3.2; z += 0.9) box('hw-bridge', 0.08, 0.5, 0.08, x, 2.7, z, C.steel, { metal: 0.6, part: '桥面护栏' });
    });

    // 涵洞（管涵穿过路基，两端露出）
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 13.4, 20), mat(C.concrete2, { rough: 0.9 }));
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(0, 0.85, -6.6);
    reg(pipe, 'hw-culvert', '管身');
    [-6.5, 6.5].forEach(function (x) {
      box('hw-culvert', 0.4, 1.7, 1.9, x, 0.85, -6.6, C.concrete, { part: '端墙' });
      box('hw-culvert', 0.9, 0.14, 2.3, x, 0.05, -6.6, 0x6f7276, { part: '铺底' });
    });

    // 隧道洞门 + 山体
    box('hw-tunnel', 12, 5.4, 4.4, 0, 2.6, -17.5, C.hill, { rough: 1, part: '山体' });
    box('hw-tunnel', 7.6, 4.9, 0.5, 0, 2.5, -15.2, 0x8a857b, { rough: 0.95, part: '洞门墙' });
    box('hw-tunnel', 5.2, 4.1, 0.18, 0, 1.9, -14.9, 0x0a1016, { rough: 1, part: '洞身' });
    box('hw-tunnel', 5.6, 0.45, 0.36, 0, 4.0, -14.95, 0x9c968b, { part: '洞门墙' });

    // 边沟（路基右侧）
    box('hw-drain', 0.9, 0.1, 6.4, 6.85, 0.12, -5.5, C.concrete, { rough: 0.95, part: '沟底' });
    [6.42, 7.28].forEach(function (x) {
      box('hw-drain', 0.12, 0.45, 6.4, x, 0.4, -5.5, C.cushion, { rough: 0.95, part: '沟壁' });
    });

    // 波形梁护栏（两段路基）
    segs.forEach(function (s) {
      [-3.45, 3.45].forEach(function (x) {
        box('hw-guard', 0.1, 0.16, s.d, x, 2.72, s.c, C.steel, { metal: 0.6, part: '波形梁板' });
        for (let z = s.c - s.d / 2 + 0.6; z < s.c + s.d / 2; z += 1.5) {
          box('hw-guard', 0.09, 0.62, 0.09, x, 2.46, z, C.steel, { metal: 0.6, part: '立柱' });
        }
      });
    });

    addAnchor('hw-subgrade', -5.9, 0.9, 6.0);
    addAnchor('hw-pavement', 0, 2.45, 6.0);
    addAnchor('hw-bridge', 0, 3.1, 0.7);
    addAnchor('hw-culvert', -6.4, 0.9, -6.6);
    addAnchor('hw-tunnel', 0, 4.4, -14.9);
    addAnchor('hw-drain', 6.85, 0.75, -5.5);
    addAnchor('hw-guard', 3.5, 3.0, -4.0);
  }

  /* ---------- 场景三：水利枢纽 ---------- */
  function buildWater() {
    sceneKey = 'water';
    ground();

    // 上游水库（装饰，不参与点选）
    const wplane = new THREE.Mesh(
      new THREE.PlaneGeometry(13, 12),
      new THREE.MeshStandardMaterial({ color: 0x24506e, roughness: 0.4, transparent: true, opacity: 0.42, depthWrite: false })
    );
    wplane.rotation.x = -Math.PI / 2;
    wplane.position.set(-6.6, 2.94, -0.5);
    root.add(wplane);

    // 重力坝（三角形断面）
    prism('wt-dam', [[0, 0], [0, 4.6], [0.9, 4.6], [4.2, 0]], 10, -1.0, 0x6d675e, { rough: 0.94, part: '坝体混凝土' });
    box('wt-dam', 1.1, 0.24, 10, 0.45, 4.72, -1.0, 0x8a8478, { part: '坝顶' });
    box('wt-dam', 0.2, 0.5, 10, -0.05, 5.05, -1.0, 0x8a8478, { part: '防浪墙' });
    box('wt-dam', 0.7, 0.7, 0.7, 3.2, 0.7, -1.0, 0x141c23, { part: '排水廊道' });

    // 溢洪道：控制段 + 闸墩 + 泄槽 + 消能段（整体放在坝下游右侧，避免与坝面重叠）
    box('wt-spillway', 2.6, 0.9, 3.0, 5.6, 3.6, 7.0, 0x9a9488, { part: '控制段' });
    [4.7, 6.5].forEach(function (x) {
      box('wt-spillway', 0.35, 1.5, 3.0, x, 4.5, 7.0, 0xa39d91, { part: '闸墩' });
    });
    const chute = box('wt-spillway', 6.2, 0.3, 2.9, 9.6, 2.2, 7.0, 0x9a9488, { part: '泄槽' });
    chute.rotation.z = -0.48;
    [-1.45, 1.45].forEach(function (dz) {
      const w = box('wt-spillway', 6.2, 0.45, 0.16, 9.6, 2.4, 7.0 + dz, 0x6a655c, { part: '泄槽边墙' });
      w.rotation.z = -0.48;
    });
    box('wt-spillway', 4.0, 0.42, 3.9, 13.6, 0.3, 7.0, 0x7d776c, { part: '消力池' });
    box('wt-spillway', 0.28, 0.8, 3.9, 15.7, 0.4, 7.0, 0x9a9488, { part: '尾坎' });

    // 闸门 + 启闭机（立在溢洪道控制段上）
    box('wt-gate', 0.14, 1.5, 2.4, 5.3, 4.5, 7.0, 0x4e6577, { metal: 0.55, rough: 0.45, part: '平面闸门' });
    [4.6, 6.0].forEach(function (x) {
      box('wt-gate', 0.14, 1.8, 0.14, x, 5.2, 7.0, 0x6f8494, { metal: 0.55, part: '启闭机架' });
    });
    box('wt-gate', 1.6, 0.16, 0.35, 5.3, 6.1, 7.0, 0x6f8494, { metal: 0.55, part: '启闭机架' });

    // 渠道（下游输水，U 形断面：底板 + 两侧边墙）
    box('wt-canal', 6.4, 0.24, 3.0, 9.4, 0.26, -4.6, 0x879296, { part: '渠底' });
    [-1.5, 1.5].forEach(function (z) {
      box('wt-canal', 6.4, 1.0, 0.24, 9.4, 0.75, -4.6 + z, 0x929da1, { part: '边坡衬砌' });
    });
    box('wt-canal', 6.2, 0.06, 2.7, 9.4, 0.62, -4.6, 0x24506e, { opacity: 0.45, rough: 0.35, part: '渠水' });

    // 压力钢管 + 镇墩
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 7.2, 18), mat(0x6f8494, { metal: 0.62, rough: 0.38 }));
    pen.rotation.z = Math.PI / 2 + 0.2;
    pen.position.set(3.0, 1.15, -4.2);
    reg(pen, 'wt-penstock', '压力钢管');
    box('wt-penstock', 0.9, 0.9, 0.9, 0.4, 1.1, -4.2, 0x6d675e, { part: '镇墩' });
    box('wt-penstock', 0.8, 0.7, 0.8, 5.9, 0.6, -4.2, 0x6d675e, { part: '支墩' });

    // 下游围堰（临时工程，放在坝后右前方空地）
    prism('wt-coffer', [[13.0, 0], [16.0, 0], [15.6, 1.7], [13.4, 1.7]], 3.6, 2.4, C.soil, { rough: 0.95, opacity: 0.92, part: '围堰填筑' });

    addAnchor('wt-dam', 2.3, 5.4, -1.0);
    addAnchor('wt-spillway', 9.6, 3.0, 7.0);
    addAnchor('wt-gate', 5.3, 6.4, 7.0);
    addAnchor('wt-canal', 9.4, 1.9, -4.6);
    addAnchor('wt-penstock', 3.0, 1.9, -4.2);
    addAnchor('wt-coffer', 14.5, 2.1, 2.4);
  }

  function clearScene() {
    anchors.length = 0;
    Object.keys(meshIndex).forEach(function (k) { delete meshIndex[k]; });
    if (labelLayer) labelLayer.innerHTML = '';
    if (!root) return;
    for (let i = root.children.length - 1; i >= 0; i--) {
      const ch = root.children[i];
      root.remove(ch);
      ch.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach(function (m) { m.dispose(); });
          else o.material.dispose();
        }
      });
    }
    root.userData.scaffold = null;
  }

  const CAM_PRESET = {
    building: { p: [14.5, 9.5, 17], t: [0, 3.2, 0] },
    highway: { p: [20.0, 13.0, 21.0], t: [0, 1.6, -1.0] },
    water: { p: [18.0, 11.0, 24.0], t: [7.0, 2.1, 4.0] }
  };

  function buildScene(key) {
    clearScene();
    sceneKey = key || 'building';
    if (sceneKey === 'highway') buildHighway();
    else if (sceneKey === 'water') buildWater();
    else { sceneKey = 'building'; buildBuilding(); }
    // 分场景灯光：房建亮一点，公路/水利压暗避免大面积混凝土过曝
    if (lights) {
      if (sceneKey === 'building') { lights.hemi.intensity = 0.6; lights.dir.intensity = 0.72; lights.fill.intensity = 0.24; }
      else if (sceneKey === 'highway') { lights.hemi.intensity = 0.66; lights.dir.intensity = 0.78; lights.fill.intensity = 0.26; }
      else { lights.hemi.intensity = 0.62; lights.dir.intensity = 0.72; lights.fill.intensity = 0.24; }
    }
    if (renderer && THREE.ACESFilmicToneMapping !== undefined) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = sceneKey === 'building' ? 1.2 : 1.05;
    }
    // 场景切换后重置相机
    const ps = CAM_PRESET[sceneKey] || CAM_PRESET.building;
    if (camera) {
      camera.position.set(ps.p[0], ps.p[1], ps.p[2]);
      controls.target.set(ps.t[0], ps.t[1], ps.t[2]);
      controls.update();
    }
    makeLabels();
  }

  function makeLabels() {
    if (!labelLayer) return;
    labelLayer.innerHTML = '';
    anchors.forEach(function (a) {
      const c = document.createElement('div');
      c.className = 'lbl';
      const comp = COMP_MAP[a.id];
      if (comp && comp.major === '安装') c.classList.add('mep');
      else if (comp && comp.major === '交通运输') c.classList.add('trans');
      else if (comp && comp.major === '水利') c.classList.add('hydro');
      c.dataset.comp = a.id;
      const nm = comp ? comp.name.replace(/（[^）]*）/g, '') : a.id;
      c.innerHTML = '<i></i><span>' + nm + '</span>';
      c.addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (onPickCb) onPickCb(a.id);
      });
      labelLayer.appendChild(c);
      a.el = c;
    });
  }

  function init(el, pickCb, hoverCb) {
    container = el;
    onPickCb = pickCb;
    onHoverCb = hoverCb;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1420);
    scene.fog = new THREE.Fog(0x0a1420, 30, 60);

    camera = new THREE.PerspectiveCamera(42, el.clientWidth / el.clientHeight, 0.8, 160);
    camera.position.set(14.5, 9.5, 17);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, logarithmicDepthBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (renderer.outputEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
    if (THREE.ACESFilmicToneMapping !== undefined) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
    }
    el.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 3.2, 0);
    controls.minDistance = 5;
    controls.maxDistance = 55;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.autoRotateSpeed = 0.9;

    // 灯光
    const hemi = new THREE.HemisphereLight(0xdfeaf5, 0x24313d, 0.9);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(11, 18, 9);
    dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    dir.shadow.camera.left = -14;
    dir.shadow.camera.right = 14;
    dir.shadow.camera.top = 16;
    dir.shadow.camera.bottom = -8;
    dir.shadow.camera.near = 1;
    dir.shadow.camera.far = 50;
    dir.shadow.bias = -0.0006;
    dir.shadow.normalBias = 0.06;
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xa9c4dd, 0.3);
    fill.position.set(-10, 6, -12);
    scene.add(fill);
    lights = { hemi: hemi, dir: dir, fill: fill };

    root = new THREE.Group();
    scene.add(root);

    labelLayer = document.createElement('div');
    labelLayer.className = 'label-layer';
    container.appendChild(labelLayer);

    buildScene('building');

    raycaster = new THREE.Raycaster();

    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointerleave', function () { setHover(null); });

    let downX = 0, downY = 0, downT = 0;
    function onDown(e) { downX = e.clientX; downY = e.clientY; downT = Date.now(); }
    function onUp(e) {
      if (Date.now() - downT < 400 && Math.abs(e.clientX - downX) < 5 && Math.abs(e.clientY - downY) < 5) {
        doPick(e);
      }
    }
    function onMove(e) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(root.children, true);
      let id = null;
      for (let i = 0; i < hits.length; i++) {
        if (hits[i].object.userData.compId && hits[i].object.visible) { id = hits[i].object.userData.compId; break; }
      }
      setHover(id);
    }
    function doPick(e) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(root.children, true);
      let id = null;
      for (let i = 0; i < hits.length; i++) {
        if (hits[i].object.userData.compId) { id = hits[i].object.userData.compId; break; }
      }
      if (onPickCb) onPickCb(id);
    }

    function onResize() {
      if (!renderer) return;
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);
    if (window.ResizeObserver) new ResizeObserver(onResize).observe(el);

    animate();
  }

  function animate() {
    requestAnimationFrame(animate);
    if (controls) {
      controls.autoRotate = autoRotate;
      controls.update();
    }
    if (camAnim) {
      camAnim.t += 0.045;
      const t = camAnim.t > 1 ? 1 : camAnim.t;
      const e = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(camAnim.fromP, camAnim.toP, e);
      controls.target.lerpVectors(camAnim.fromT, camAnim.toT, e);
      if (t >= 1) camAnim = null;
    }
    if (renderer) {
      renderer.render(scene, camera);
      updateLabels();
    }
  }

  const INSIDE = { waterpipe: 1, drainpipe: 1, insulation: 1, cabletray: 1, airduct: 1, hydrant: 1, valve: 1, distribution: 1, stair: 1, waterproof: 1 };

  function updateLabels() {
    if (!labelLayer) return;
    const w = container.clientWidth, h = container.clientHeight;
    const placed = [];
    anchors.forEach(function (a) {
      if (!a.el) return;
      const hiddenByCut = cutMode && sceneKey === 'building' && (a.id === 'wall' || a.id === 'roof' || a.id === 'door');
      const hiddenInside = !cutMode && sceneKey === 'building' && INSIDE[a.id];
      const visible = showLabels && !hiddenByCut && !hiddenInside;
      if (!visible) { a.el.style.display = 'none'; return; }
      const p = a.pos.clone();
      p.project(camera);
      if (p.z > 1 || p.z < -1) { a.el.style.display = 'none'; return; }
      let x = (p.x * 0.5 + 0.5) * w;
      let y = (-p.y * 0.5 + 0.5) * h;
      a.el.style.display = 'flex';
      const bw = (a.el.offsetWidth || 74), bh = 18;
      if (x - bw / 2 < 172 || y < 46 || x > w - 20 || y > h - 30) { a.el.style.display = 'none'; return; }
      // 简易避让：与已放置的标签重叠时下移
      for (let k = 0; k < 8; k++) {
        let hit = false;
        for (let j = 0; j < placed.length; j++) {
          const r = placed[j];
          if (Math.abs(r.x - x) < (r.w + bw) / 2 - 6 && Math.abs(r.y - y) < bh - 3) { hit = true; break; }
        }
        if (!hit) break;
        y += bh;
      }
      placed.push({ x: x, y: y, w: bw });
      a.el.style.display = 'flex';
      a.el.style.transform = 'translate(-50%,-50%) translate(' + x + 'px,' + y + 'px)';
      a.el.classList.toggle('active', a.id === selectedId);
    });
  }

  function setHover(id) {
    if (id === hoverId) return;
    hoverId = id;
    if (renderer) renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
    if (onHoverCb) onHoverCb(id);
  }

  function applyColor(id, mode) {
    const list = meshIndex[id] || [];
    list.forEach(function (m) {
      if (!m.material || !m.material.emissive) return;
      if (mode === 'select') { m.material.emissive.setHex(0x0f3341); m.material.emissiveIntensity = 0.32; }
      else if (mode === 'hover') { m.material.emissive.setHex(0x0a2330); m.material.emissiveIntensity = 0.16; }
      else { m.material.emissive.setHex(0x000000); m.material.emissiveIntensity = 1; }
    });
  }

  function select(id) {
    if (selectedId && selectedId !== id) applyColor(selectedId, 'none');
    selectedId = id;
    if (id) applyColor(id, 'select');
    if (id && id !== hoverId) applyColor(id, 'select');
  }

  function setCut(on) {
    if (sceneKey !== 'building') { cutMode = false; return; }
    cutMode = on;
    ['wall', 'roof', 'door'].forEach(function (id) {
      (meshIndex[id] || []).forEach(function (m) { m.visible = !on; });
    });
    // 屋面梁、屋面板属于有梁板构件，剖切时也一起隐藏，才看得见二层内部
    ['屋面梁', '屋面板', '柱帽'].forEach(function (part) {
      Object.keys(meshIndex).forEach(function (id) {
        meshIndex[id].forEach(function (m) {
          if (m.userData.part === part) m.visible = !on;
        });
      });
    });
  }

  function setLabels(on) {
    showLabels = on;
    if (labelLayer) labelLayer.style.display = on ? 'block' : 'none';
  }

  function setScaffold(on) {
    showScaffold = on;
    if (root && root.userData.scaffold) root.userData.scaffold.visible = on;
  }

  function setAutoRotate(on) { autoRotate = on; }

  function resetView() {
    const ps = CAM_PRESET[sceneKey] || CAM_PRESET.building;
    camAnim = {
      t: 0,
      fromP: camera.position.clone(),
      fromT: controls.target.clone(),
      toP: new THREE.Vector3(ps.p[0], ps.p[1], ps.p[2]),
      toT: new THREE.Vector3(ps.t[0], ps.t[1], ps.t[2])
    };
  }

  function focus(id) {
    const list = meshIndex[id] || [];
    if (!list.length) return;
    const box3 = new THREE.Box3();
    list.forEach(function (m) { box3.expandByObject(m); });
    const center = box3.getCenter(new THREE.Vector3());
    const size = box3.getSize(new THREE.Vector3()).length();
    const dist = Math.max(8, size * 2.5);
    // 低位构件（一层内部、基础等）用更平缓的视角，否则会被楼板挡住
    const ry = center.y < 3.4 ? 0.3 : 0.75;
    const dirv = new THREE.Vector3(1, ry, 1).normalize();
    camAnim = {
      t: 0,
      fromP: camera.position.clone(),
      fromT: controls.target.clone(),
      toP: center.clone().add(dirv.multiplyScalar(dist)),
      toT: center.clone()
    };
  }

  function pickAt(nx, ny) {
    if (!raycaster) return [];
    raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
    return raycaster.intersectObjects(root.children, true).slice(0, 6).map(function (h) {
      const u = h.object.userData || {};
      const mat0 = h.object.material || {};
      const p = h.object.position;
      return {
        id: u.compId || '', part: u.part || '',
        color: mat0.color ? mat0.color.getHexString() : '',
        op: mat0.opacity, tr: !!mat0.transparent,
        pos: [p.x, p.y, p.z].map(function (v) { return +v.toFixed(2); }),
        dist: +h.distance.toFixed(2)
      };
    });
  }

  function setScene(key) {
    selectedId = null;
    hoverId = null;
    cutMode = false;
    if (root && root.userData.scaffold) root.userData.scaffold.visible = false;
    buildScene(key);
  }

  function screenInfo() {
    const vis = {};
    Object.keys(meshIndex).forEach(function (k) {
      const list = meshIndex[k];
      vis[k] = list.filter(function (m) { return m.visible; }).length + '/' + list.length;
    });
    return { scene: sceneKey, meshes: Object.keys(meshIndex).length, cut: cutMode, vis: vis };
  }

  return {
    init: init, select: select, focus: focus, setCut: setCut, setLabels: setLabels,
    setScaffold: setScaffold, setAutoRotate: setAutoRotate, resetView: resetView,
    setScene: setScene, info: screenInfo, pickAt: pickAt
  };
})();




