/* ==========================================================
   NUCORE — app.js
   Three.js scenes + interactions
   ========================================================== */

(function () {
  'use strict';
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => Array.from(r.querySelectorAll(q));
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const GREEN = 0x76b900;
  const GREEN_BRIGHT = 0xa8ff4d;
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------
     Cursor
     -------------------------------------------------------- */
  const cursor = $('#cursor');
  const cursorRing = $('#cursor-ring');
  let cX = window.innerWidth / 2, cY = window.innerHeight / 2;
  let rX = cX, rY = cY;
  if (cursor && cursorRing) {
    window.addEventListener('pointermove', (e) => {
      cX = e.clientX; cY = e.clientY;
      cursor.style.transform = `translate(${cX}px,${cY}px) translate(-50%,-50%)`;
    }, { passive: true });
    const loop = () => {
      rX = lerp(rX, cX, 0.18);
      rY = lerp(rY, cY, 0.18);
      cursorRing.style.transform = `translate(${rX}px,${rY}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    const addHover = (sel) => $$(sel).forEach((el) => {
      el.addEventListener('pointerenter', () => cursorRing.classList.add('hover'));
      el.addEventListener('pointerleave', () => cursorRing.classList.remove('hover'));
    });
    addHover('a, button, .opt, input, select, .tilt, .prod, .stream, .seg, .moat-item');
  }

  /* --------------------------------------------------------
     Nav scroll state
     -------------------------------------------------------- */
  const nav = $('#nav');
  window.addEventListener('scroll', () => {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }, { passive: true });

  /* --------------------------------------------------------
     Reveal on scroll
     -------------------------------------------------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  $$('.section-head, .layer, .prod, .stream, .seg, .intel-card, .moat-item, .thermal-compare, .certificate').forEach((el) => {
    el.classList.add('fade-in');
    io.observe(el);
  });

  /* --------------------------------------------------------
     Hero readout — count-up numbers
     -------------------------------------------------------- */
  const countUp = (el) => {
    const target = parseFloat(el.dataset.target);
    const neg = target < 0;
    const abs = Math.abs(target);
    const dur = 1200;
    const t0 = performance.now();
    const step = (t) => {
      const p = clamp((t - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(abs * eased);
      el.textContent = (neg ? '-' : '') + v;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        countUp(e.target);
        countObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  $$('.ro-number').forEach((el) => countObs.observe(el));

  /* --------------------------------------------------------
     Three.js shared helpers
     -------------------------------------------------------- */
  const THREE = window.THREE;
  if (!THREE) {
    console.warn('three.js not loaded');
    return;
  }

  function makeGPU({ color = GREEN, scale = 1, dual = false, rack = false } = {}) {
    const group = new THREE.Group();
    const col = new THREE.Color(color);

    const buildOne = (xOffset = 0) => {
      const card = new THREE.Group();

      // PCB
      const pcbMat = new THREE.MeshStandardMaterial({
        color: 0x0f1114, metalness: 0.7, roughness: 0.55, emissive: 0x0b0d10, emissiveIntensity: 0.4
      });
      const pcb = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.18, 1.3), pcbMat);
      card.add(pcb);

      // Shroud
      const shroudMat = new THREE.MeshStandardMaterial({
        color: 0x17191d, metalness: 0.8, roughness: 0.35, emissive: 0x0a0c0f, emissiveIntensity: 0.3
      });
      const shroud = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.55, 1.22), shroudMat);
      shroud.position.y = 0.35;
      card.add(shroud);

      // Heatsink fins (stack)
      const finMat = new THREE.MeshStandardMaterial({
        color: 0x2a2e33, metalness: 0.9, roughness: 0.25
      });
      for (let i = 0; i < 18; i++) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.48, 0.035), finMat);
        fin.position.set(0, 0.35, -0.55 + i * 0.062);
        card.add(fin);
      }

      // Fans (cylinders)
      const fanHubMat = new THREE.MeshStandardMaterial({
        color: 0x0a0c0f, metalness: 0.9, roughness: 0.2,
        emissive: col, emissiveIntensity: 0.55
      });
      const fanRingMat = new THREE.MeshStandardMaterial({
        color: 0x14171b, metalness: 0.4, roughness: 0.7
      });
      const bladesMat = new THREE.MeshStandardMaterial({
        color: 0x1c1f24, metalness: 0.6, roughness: 0.35, transparent: true, opacity: 0.55
      });
      const fans = [];
      [-1.1, 1.1].forEach((fx) => {
        const fanGroup = new THREE.Group();
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.04, 16, 36), fanRingMat);
        ring.rotation.x = Math.PI / 2;
        fanGroup.add(ring);
        // blades
        for (let b = 0; b < 9; b++) {
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.02, 0.16), bladesMat);
          blade.rotation.y = (b / 9) * Math.PI * 2;
          blade.position.y = 0.02;
          fanGroup.add(blade);
        }
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 24), fanHubMat);
        fanGroup.add(hub);
        fanGroup.position.set(fx, 0.65, 0);
        fanGroup.userData.fan = true;
        fans.push(fanGroup);
        card.add(fanGroup);
      });

      // Glow strip along top edge
      const stripMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.92 });
      const strip = new THREE.Mesh(new THREE.BoxGeometry(3.35, 0.035, 0.045), stripMat);
      strip.position.set(0, 0.635, -0.6);
      card.add(strip);

      // Side strip (brand mark analogue)
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.45, 0.1), stripMat);
      side.position.set(1.72, 0.35, 0);
      card.add(side);

      // Display/IO (dark end)
      const io = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.55, 1.22),
        new THREE.MeshStandardMaterial({ color: 0x0b0d10, metalness: 0.8, roughness: 0.4 })
      );
      io.position.set(-1.76, 0.35, 0);
      card.add(io);

      card.position.x = xOffset;
      card.userData.fans = fans;
      card.userData.strip = stripMat;
      card.userData.ledStrip = strip;
      return card;
    };

    if (rack) {
      // Rack chassis
      const chassisMat = new THREE.MeshStandardMaterial({
        color: 0x0f1114, metalness: 0.75, roughness: 0.45, emissive: 0x0a0c0f, emissiveIntensity: 0.3
      });
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.9, 2.8), chassisMat);
      group.add(chassis);
      // LED bar
      const ledMat = new THREE.MeshBasicMaterial({ color: col });
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.6, 0.04), ledMat);
      led.position.set(-2.33, 0, 1.43);
      group.add(led);
      // ventilation
      for (let i = -6; i <= 6; i++) {
        const v = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 1.4, 0.02),
          new THREE.MeshStandardMaterial({ color: 0x20242a, metalness: 0.6, roughness: 0.6 })
        );
        v.position.set(i * 0.18, 0, 1.42);
        group.add(v);
      }
      // internal cards (mini)
      for (let i = 0; i < 4; i++) {
        const mini = new THREE.Mesh(
          new THREE.BoxGeometry(3.4, 0.18, 0.48),
          new THREE.MeshStandardMaterial({
            color: 0x16191d, metalness: 0.7, roughness: 0.4,
            emissive: col, emissiveIntensity: 0.18
          })
        );
        mini.position.set(0.1, -0.6 + i * 0.4, 0.3);
        group.add(mini);
      }
      group.userData.isRack = true;
    } else if (dual) {
      const a = buildOne(-1.0);
      const b = buildOne(1.0);
      a.rotation.y = 0.04;
      b.rotation.y = -0.04;
      // NVLink bridge
      const bridgeMat = new THREE.MeshStandardMaterial({
        color: 0x1a1d22, metalness: 0.8, roughness: 0.3,
        emissive: col, emissiveIntensity: 0.35
      });
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.14, 0.5), bridgeMat);
      bridge.position.set(0, 0.5, 0);
      group.add(bridge, a, b);
      group.userData.cards = [a, b];
    } else {
      const one = buildOne(0);
      group.add(one);
      group.userData.cards = [one];
    }

    group.scale.setScalar(scale);
    return group;
  }

  function setupLights(scene, accent = GREEN_BRIGHT) {
    const amb = new THREE.AmbientLight(0x16181b, 0.8);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.55);
    dir.position.set(5, 8, 6);
    scene.add(dir);
    const p1 = new THREE.PointLight(accent, 1.8, 14);
    p1.position.set(-2, 2.5, 2.5);
    scene.add(p1);
    const p2 = new THREE.PointLight(0x66aaff, 0.8, 12);
    p2.position.set(3, -1, -2);
    scene.add(p2);
    const p3 = new THREE.PointLight(accent, 0.6, 16);
    p3.position.set(0, -3, 3);
    scene.add(p3);
    return { amb, dir, p1, p2, p3 };
  }

  function addParticleField(scene, count = 320, range = 14, color = GREEN_BRIGHT) {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * range;
      pos[i * 3 + 1] = (Math.random() - 0.5) * range * 0.7;
      pos[i * 3 + 2] = (Math.random() - 0.5) * range;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({
      color, size: 0.025, transparent: true, opacity: 0.55, depthWrite: false,
      blending: THREE.AdditiveBlending, sizeAttenuation: true
    });
    const pts = new THREE.Points(g, m);
    scene.add(pts);
    return pts;
  }

  function addHoloRings(group, color = GREEN_BRIGHT) {
    const rings = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.25, side: THREE.DoubleSide
    });
    for (let i = 0; i < 3; i++) {
      const r = 2.2 + i * 0.25;
      const ring = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.01, 64), mat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.55 + i * 0.02;
      rings.add(ring);
    }
    const gridMat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.08, side: THREE.DoubleSide, wireframe: true
    });
    const pad = new THREE.Mesh(new THREE.CircleGeometry(3, 48), gridMat);
    pad.rotation.x = Math.PI / 2;
    pad.position.y = -0.58;
    rings.add(pad);
    group.add(rings);
    return rings;
  }

  /* --------------------------------------------------------
     HERO scene
     -------------------------------------------------------- */
  function initHero() {
    const canvas = $('#hero-canvas');
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
    camera.position.set(0, 0.8, 7.4);
    camera.lookAt(0, 0.1, 0);
    setupLights(scene);

    const stage = new THREE.Group();
    scene.add(stage);

    const gpu = makeGPU({ scale: 1.12 });
    stage.add(gpu);
    addHoloRings(stage);
    addParticleField(scene, 420, 16);

    let mx = 0, my = 0, tMx = 0, tMy = 0;
    window.addEventListener('pointermove', (e) => {
      tMx = (e.clientX / window.innerWidth - 0.5) * 2;
      tMy = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(canvas);
    resize();

    const fans = gpu.userData.cards[0].userData.fans;
    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      mx = lerp(mx, tMx, 0.06);
      my = lerp(my, tMy, 0.06);
      gpu.rotation.y = t * 0.22 + mx * 0.35;
      gpu.rotation.x = Math.sin(t * 0.5) * 0.07 + my * -0.18;
      gpu.position.y = Math.sin(t * 0.8) * 0.06;
      fans.forEach((f) => (f.rotation.y -= 0.26));
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
  }

  /* --------------------------------------------------------
     LAYER scene (engineering) — stateful GPU
     -------------------------------------------------------- */
  function initLayers() {
    const canvas = $('#layer-canvas');
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
    camera.position.set(0, 0.9, 7);
    camera.lookAt(0, 0.1, 0);
    setupLights(scene);
    addParticleField(scene, 220, 12);

    const gpu = makeGPU({ scale: 1 });
    scene.add(gpu);
    addHoloRings(gpu);

    // Disassembly state — move shroud up, fins separate, fans separate
    const cards = gpu.userData.cards;
    const card = cards[0];
    const shroud = card.children[1];
    const fins = card.children.slice(2, 20);
    const fans = card.userData.fans;
    const ledStrip = card.userData.ledStrip;

    const hudLayer = $('#hud-layer');
    const hudTemp = $('#hud-temp');
    const hudVcore = $('#hud-vcore');
    const hudState = $('#hud-state');

    let activeLayer = 1;
    const setLayer = (n) => {
      activeLayer = n;
      if (hudLayer) hudLayer.textContent = '0' + n;
      const labels = {
        1: ['INTAKE', '72°C', '1.050 V'],
        2: ['THERMAL', '54°C', '1.050 V'],
        3: ['TUNING', '61°C', '0.938 V'],
        4: ['CERTIFIED', '66°C', '0.938 V']
      };
      const [state, temp, vcore] = labels[n];
      if (hudState) hudState.textContent = state;
      if (hudTemp) hudTemp.textContent = temp;
      if (hudVcore) hudVcore.textContent = vcore;
    };
    window.__layerSet = setLayer;

    // Scroll driver — bind to .layer elements
    const layers = $$('.layer');
    const onScroll = () => {
      let best = { layer: 1, dist: Infinity };
      layers.forEach((el) => {
        const r = el.getBoundingClientRect();
        const mid = r.top + r.height / 2;
        const d = Math.abs(mid - window.innerHeight / 2);
        if (d < best.dist) best = { layer: parseInt(el.dataset.layer, 10), dist: d };
      });
      layers.forEach((el) => {
        const n = parseInt(el.dataset.layer, 10);
        el.classList.toggle('active', n === best.layer);
      });
      if (best.layer !== activeLayer) setLayer(best.layer);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(canvas);
    resize();

    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      const breathe = Math.sin(t * 0.7) * 0.04;

      gpu.rotation.y = t * 0.12;
      gpu.position.y = breathe;

      // Disassembly — Layer 2
      const dis = activeLayer === 2 ? 1 : 0;
      const dT = dis * 0.9 + (1 - dis) * 0;
      shroud.position.y = lerp(shroud.position.y, 0.35 + dT, 0.08);
      fins.forEach((fin, i) => {
        const base = -0.55 + i * 0.062;
        const spread = dis ? (i - fins.length / 2) * 0.08 : 0;
        fin.position.z = lerp(fin.position.z, base + spread, 0.08);
        fin.position.y = lerp(fin.position.y, 0.35 + dis * 0.35, 0.08);
      });
      fans.forEach((f, i) => {
        const tx = dis ? (i === 0 ? -1.8 : 1.8) : (i === 0 ? -1.1 : 1.1);
        f.position.x = lerp(f.position.x, tx, 0.08);
        f.position.y = lerp(f.position.y, 0.65 + dis * 0.7, 0.08);
        f.rotation.y -= 0.18 + (activeLayer >= 3 ? 0.06 : 0);
      });

      // Tuning — Layer 3 pulses LED intensity
      if (ledStrip && ledStrip.material) {
        const targetOp = activeLayer >= 3 ? 0.5 + Math.abs(Math.sin(t * 2.4)) * 0.5 : 0.8;
        ledStrip.material.opacity = lerp(ledStrip.material.opacity, targetOp, 0.15);
      }

      // Certification — Layer 4 camera gentle zoom
      const tZ = activeLayer === 4 ? 6.2 : 7;
      camera.position.z = lerp(camera.position.z, tZ, 0.04);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
  }

  /* --------------------------------------------------------
     CONFIGURATOR scene
     -------------------------------------------------------- */
  function initConfigurator() {
    const canvas = $('#cfg-canvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
    camera.position.set(0, 0.8, 7);
    camera.lookAt(0, 0.1, 0);
    const lights = setupLights(scene);
    addParticleField(scene, 180, 10);

    const holder = new THREE.Group();
    scene.add(holder);
    addHoloRings(holder);

    let gpu = makeGPU({ scale: 1 });
    holder.add(gpu);

    const platformMap = {
      '3060':  { dual: false, rack: false, scale: 0.92 },
      '3070':  { dual: false, rack: false, scale: 0.95 },
      '3090':  { dual: false, rack: false, scale: 1.05 },
      '5070':  { dual: false, rack: false, scale: 1.0 },
      '4090':  { dual: false, rack: false, scale: 1.15 },
      'a6000': { dual: false, rack: false, scale: 1.1 },
      'dual3090': { dual: true, rack: false, scale: 0.85 },
      'cluster':  { dual: false, rack: true, scale: 0.95 }
    };

    let currentPlatform = '4090';
    let currentWorkload = 'ai';

    const rebuildGPU = (plat) => {
      const cfg = platformMap[plat] || platformMap['4090'];
      holder.remove(gpu);
      gpu.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material.dispose();
        }
      });
      gpu = makeGPU({ scale: cfg.scale, dual: cfg.dual, rack: cfg.rack });
      holder.add(gpu);
      setAccent(currentWorkload);
    };

    const setAccent = (wk) => {
      const colors = {
        ai: GREEN_BRIGHT,
        creative: 0x8ab4ff,
        gaming: 0xff7a33,
        lab: 0xd58bff
      };
      const hex = colors[wk] || GREEN_BRIGHT;
      const col = new THREE.Color(hex);
      lights.p1.color.setHex(hex);
      // Update all strips/emissives
      holder.traverse((o) => {
        if (!o.material) return;
        if (o.userData && o.userData.fan) return;
        if (o.material.emissive && o.material.emissiveIntensity !== undefined) {
          // Only update materials that had accent emissive (fan hubs, mini cards, bridge, led)
          if (o.material.emissiveIntensity > 0.1) {
            o.material.emissive.copy(col);
          }
        }
        if (o.material.isMeshBasicMaterial && o.material.color) {
          // strips
          if (o.material.color.r + o.material.color.g + o.material.color.b > 0.5) {
            o.material.color.copy(col);
          }
        }
      });
    };

    // option handlers
    $$('.cfg-options[data-group="platform"] .opt').forEach((b) => {
      b.addEventListener('click', () => {
        $$('.cfg-options[data-group="platform"] .opt').forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
        currentPlatform = b.dataset.val;
        rebuildGPU(currentPlatform);
        recompute();
      });
    });
    $$('.cfg-options[data-group="workload"] .opt').forEach((b) => {
      b.addEventListener('click', () => {
        $$('.cfg-options[data-group="workload"] .opt').forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
        currentWorkload = b.dataset.val;
        setAccent(currentWorkload);
        // default TDP per workload
        const tdp = parseInt(b.dataset.tdp, 10);
        const slTdp = $('#sl-tdp');
        if (slTdp) { slTdp.value = tdp; $('#val-tdp').textContent = tdp + '%'; }
        recompute();
      });
    });

    // sliders
    const slTdp = $('#sl-tdp');
    const slUv = $('#sl-uv');
    const slFan = $('#sl-fan');
    slTdp && slTdp.addEventListener('input', () => { $('#val-tdp').textContent = slTdp.value + '%'; recompute(); });
    slUv && slUv.addEventListener('input', () => { $('#val-uv').textContent = '-' + slUv.value + ' mV'; recompute(); });
    slFan && slFan.addEventListener('input', () => { $('#val-fan').textContent = slFan.value + '%'; recompute(); });

    const workloadName = { ai: 'AI / Inference', creative: 'Creative Studio', gaming: 'Gaming', lab: 'ML Lab' };
    const platformName = {
      '3060': 'RTX 3060', '3070': 'RTX 3070', '3090': 'RTX 3090', '5070': 'RTX 5070',
      '4090': 'RTX 4090', 'a6000': 'NVIDIA A6000', 'dual3090': 'Dual RTX 3090 NVLink', 'cluster': '4× GPU Cluster'
    };

    function randomSerial() {
      const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ';
      const d = () => Math.floor(Math.random() * 10);
      const a = () => chars[Math.floor(Math.random() * chars.length)];
      return `NC-${currentPlatform.toUpperCase()}-${a()}${d()}${d()}${d()}${d()}`;
    }
    let serial = randomSerial();

    function recompute() {
      const pActive = $('.cfg-options[data-group="platform"] .opt.active');
      const vram = parseInt(pActive.dataset.vram, 10);
      const basePrice = parseInt(pActive.dataset.price, 10);
      const tdp = parseInt(slTdp ? slTdp.value : 80, 10);
      const uv = parseInt(slUv ? slUv.value : 112, 10);
      const fan = parseInt(slFan ? slFan.value : 22, 10);

      const dt = Math.round(8 + (uv / 200) * 14 + (100 - tdp) * 0.12);
      const tokBase = { '3060': 48, '3070': 62, '3090': 92, '5070': 105, '4090': 134, 'a6000': 128, 'dual3090': 172, 'cluster': 310 }[currentPlatform] || 118;
      const tok = Math.round(tokBase * (tdp / 100) * (1 - uv * 0.0004));
      const price = Math.round(basePrice + (tdp - 80) * 6 + (uv * 0.8) + (currentWorkload === 'creative' ? 180 : 0));

      $('#sum-vram').textContent = vram;
      $('#sum-dt').textContent = dt;
      $('#sum-tok').textContent = tok;
      $('#sum-price').textContent = price.toLocaleString();

      $('#cfg-tag').textContent = `${platformName[currentPlatform]} · ${workloadName[currentWorkload].toUpperCase()}`;
      $('#cfg-serial').textContent = `${serial} · 2026`;

      // Certificate
      $('#cert-uid').textContent = serial;
      $('#cert-plat').textContent = platformName[currentPlatform];
      $('#cert-prof').textContent = workloadName[currentWorkload];
      $('#cert-vram').textContent = `${vram} GB`;
      $('#cert-tdp').textContent = `${tdp}% TDP`;
      $('#cert-idle').textContent = `${34 - Math.round(dt / 6)}°C`;
      $('#cert-load').textContent = `${82 - dt}°C`;
      $('#cert-soak').textContent = `${84 - dt}°C`;
      $('#cert-tok').textContent = tok;
      const ts = Math.round(22000 + tokBase * 90 + (tdp - 80) * 150);
      $('#cert-ts').textContent = ts.toLocaleString();
      $('#cert-uv').textContent = `-${uv} mV`;

      $('#ro-uid').textContent = serial;
    }

    $('.cfg-cta').addEventListener('click', () => {
      serial = randomSerial();
      recompute();
      const cert = $('#certificate');
      cert.scrollIntoView({ behavior: 'smooth', block: 'center' });
      cert.querySelector('.cert-frame').animate(
        [{ transform: 'rotateX(1deg) scale(0.985)' }, { transform: 'rotateX(1deg) scale(1)' }],
        { duration: 600, easing: 'cubic-bezier(0.16,1,0.3,1)' }
      );
    });

    rebuildGPU('4090');
    recompute();

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(canvas);
    resize();

    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      gpu.rotation.y = t * 0.28;
      gpu.rotation.x = Math.sin(t * 0.6) * 0.06;
      gpu.position.y = Math.sin(t * 0.9) * 0.05;
      if (gpu.userData.cards) {
        gpu.userData.cards.forEach((c) => c.userData.fans.forEach((f) => (f.rotation.y -= 0.35)));
      }
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
  }

  /* --------------------------------------------------------
     Fan curve bars
     -------------------------------------------------------- */
  function initFanBars() {
    const host = $('#fan-bars');
    if (!host) return;
    const bars = 42;
    for (let i = 0; i < bars; i++) {
      const b = document.createElement('div');
      b.className = 'fan-bar';
      const p = i / (bars - 1);
      // Nucore-style curve: flat-silent, sharp ramp past mid, gentle max
      const h = p < 0.4 ? 10 + p * 18
              : p < 0.72 ? 18 + (p - 0.4) * 140
              : 64 + (p - 0.72) * 95;
      b.style.height = clamp(h, 6, 100) + '%';
      b.style.opacity = 0.35 + p * 0.55;
      host.appendChild(b);
    }
  }

  /* --------------------------------------------------------
     Bench stream — rolling soak-test log
     -------------------------------------------------------- */
  function initBenchStream() {
    const host = $('#bench-stream');
    if (!host) return;
    const msgs = [
      ['CUDA', 'PyTorch 2.4.0 · CUDA 12.4'],
      ['MODEL', 'llama-3.1-8b-instruct · q4'],
      ['TOK/S', '118.4 → 121.7 → 119.9'],
      ['TEMP', 'die 64°C · vram 78°C · hotspot 71°C'],
      ['POWER', '248 W · stable'],
      ['FAN', '46% · 1420 rpm · inaudible at 1m'],
      ['VOLT', '0.938 V · -112 mV offset'],
      ['3DMARK', 'TimeSpy 28,402 · passed'],
      ['SOAK', 't+06:14:00 · no throttle'],
      ['SOAK', 't+12:00:00 · ΔTemp +0.4°C'],
      ['SOAK', 't+18:30:00 · memory ECC clean'],
      ['SIGN', 'certificate NC-4090-A0917 · M.ALLADA'],
      ['CERT', 'benchmark.pdf · signed · shipped']
    ];
    const now = () => {
      const d = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    const push = (k, v) => {
      const line = document.createElement('div');
      line.className = 'bench-line';
      line.innerHTML = `<span class="bl-t">${now()}</span><span class="bl-k">${k}</span><span class="bl-v">${v}</span>`;
      host.appendChild(line);
      while (host.childElementCount > 40) host.firstChild.remove();
      host.scrollTop = host.scrollHeight;
    };
    let i = 0;
    msgs.forEach((m, idx) => setTimeout(() => push(m[0], m[1]), idx * 180));
    setInterval(() => {
      const m = msgs[i++ % msgs.length];
      push(m[0], m[1]);
    }, 2400);
  }

  /* --------------------------------------------------------
     Tilt cards
     -------------------------------------------------------- */
  function initTilt() {
    $$('.tilt').forEach((el) => {
      let raf = 0;
      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `perspective(1200px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg) translateY(-4px)`;
        });
      };
      const reset = () => (el.style.transform = '');
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', reset);
    });
  }

  /* --------------------------------------------------------
     CTA form
     -------------------------------------------------------- */
  window.__nucore = window.__nucore || {};
  window.__nucore.submitCta = (form) => {
    const toast = $('#cta-toast');
    if (toast) {
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 4200);
    }
    form.reset();
  };

  /* --------------------------------------------------------
     Boot
     -------------------------------------------------------- */
  const boot = () => {
    try { initHero(); } catch (e) { console.warn('hero', e); }
    try { initLayers(); } catch (e) { console.warn('layers', e); }
    try { initConfigurator(); } catch (e) { console.warn('cfg', e); }
    initFanBars();
    initBenchStream();
    initTilt();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
