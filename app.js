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

      // ---------- PCB substrate (children[0]) ----------
      // Layered look: dark substrate with a faint copper trace tint via emissive
      const pcbMat = new THREE.MeshStandardMaterial({
        color: 0x0e131a, metalness: 0.55, roughness: 0.7,
        emissive: 0x081420, emissiveIntensity: 0.55
      });
      const pcb = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.18, 1.3), pcbMat);
      card.add(pcb);

      // ---------- Shroud (children[1]) ----------
      const shroudMat = new THREE.MeshStandardMaterial({
        color: 0x17191d, metalness: 0.85, roughness: 0.32,
        emissive: 0x0a0c0f, emissiveIntensity: 0.3
      });
      const shroud = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.55, 1.22), shroudMat);
      shroud.position.y = 0.35;
      card.add(shroud);

      // ---------- Heatsink fins (children[2..19]) ----------
      const finMat = new THREE.MeshStandardMaterial({
        color: 0x2a2e33, metalness: 0.92, roughness: 0.22
      });
      for (let i = 0; i < 18; i++) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.48, 0.035), finMat);
        fin.position.set(0, 0.35, -0.55 + i * 0.062);
        card.add(fin);
      }

      // ---------- Dynamic / detailed components (added AFTER fins) ----------
      const dynamic = {
        die: null,           // GPU die mesh (emissive pulse)
        dieRim: null,        // IHS rim
        memChips: [],        // GDDR memory packages
        vrmInductors: [],    // VRM phase chokes (sequential glow)
        vrmCores: [],        // glowing cores inside inductors
        traceLines: [],      // animated PCB traces
        powerLed: null,      // 12VHPWR power LED
        nvlinkFingers: [],
        pcieFingers: [],     // gold fingers shimmer
        capacitors: []
      };

      // PCB top surface helper plane (sits just above PCB so components don't z-fight)
      const PCB_TOP = 0.095; // half-PCB height + small offset

      // ---------- GPU DIE PACKAGE (centerpiece) ----------
      // Substrate (green/black square the die sits on)
      const subMat = new THREE.MeshStandardMaterial({
        color: 0x0a1f12, metalness: 0.4, roughness: 0.55,
        emissive: 0x062818, emissiveIntensity: 0.4
      });
      const substrate = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.05, 1.0), subMat);
      substrate.position.set(0, PCB_TOP + 0.025, 0);
      card.add(substrate);

      // IHS rim (metal frame around die)
      const ihsMat = new THREE.MeshStandardMaterial({
        color: 0xb4b8c0, metalness: 0.95, roughness: 0.18
      });
      const ihsRim = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.06, 0.78), ihsMat);
      ihsRim.position.set(0, PCB_TOP + 0.06, 0);
      card.add(ihsRim);
      dynamic.dieRim = ihsRim;

      // The die itself (glowing chip)
      const dieMat = new THREE.MeshStandardMaterial({
        color: 0x051820, metalness: 0.5, roughness: 0.35,
        emissive: col, emissiveIntensity: 0.85
      });
      const die = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.04, 0.62), dieMat);
      die.position.set(0, PCB_TOP + 0.082, 0);
      card.add(die);
      dynamic.die = die;

      // Die surface "circuit grid" — additive thin lines on top of die
      const dieGridMat = new THREE.MeshBasicMaterial({
        color: col, transparent: true, opacity: 0.55,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      for (let g = 0; g < 6; g++) {
        const ln = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.001, 0.008), dieGridMat);
        ln.position.set(0, PCB_TOP + 0.105, -0.25 + g * 0.1);
        card.add(ln);
      }
      for (let g = 0; g < 6; g++) {
        const ln = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.001, 0.58), dieGridMat);
        ln.position.set(-0.25 + g * 0.1, PCB_TOP + 0.105, 0);
        card.add(ln);
      }

      // ---------- GDDR6X MEMORY ARRAY (12 chips around die) ----------
      const memMat = new THREE.MeshStandardMaterial({
        color: 0x0c0e12, metalness: 0.6, roughness: 0.35,
        emissive: 0x101418, emissiveIntensity: 0.5
      });
      // U-shape around die: top row, bottom row, side columns
      const memSlots = [
        // top row of 4
        [-0.55, 0.78], [-0.18, 0.78], [0.18, 0.78], [0.55, 0.78],
        // bottom row of 4
        [-0.55, -0.78], [-0.18, -0.78], [0.18, -0.78], [0.55, -0.78],
        // left column of 2
        [-0.78, 0.32], [-0.78, -0.32],
        // right column of 2
        [0.78, 0.32], [0.78, -0.32]
      ];
      memSlots.forEach(([mx, mz]) => {
        const horizontal = Math.abs(mx) < 0.7;
        const w = horizontal ? 0.28 : 0.18;
        const d = horizontal ? 0.18 : 0.28;
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), memMat.clone());
        m.position.set(mx, PCB_TOP + 0.025, mz);
        card.add(m);
        dynamic.memChips.push(m);

        // tiny solder dots (silver) under each chip — visual texture
        const dotMat = new THREE.MeshStandardMaterial({
          color: 0xc9ccd2, metalness: 0.95, roughness: 0.25
        });
        const dotGeo = new THREE.BoxGeometry(w * 0.85, 0.005, d * 0.85);
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.set(mx, PCB_TOP + 0.001, mz);
        card.add(dot);
      });

      // ---------- VRM PHASES (right side — inductor chokes + MOSFETs) ----------
      // Inductor body (dark) with a glowing ferrite core
      const indBodyMat = new THREE.MeshStandardMaterial({
        color: 0x1a1d22, metalness: 0.7, roughness: 0.45
      });
      const indCoreMat = () => new THREE.MeshStandardMaterial({
        color: 0x141618, metalness: 0.6, roughness: 0.55,
        emissive: col, emissiveIntensity: 0.4
      });
      const mosfetMat = new THREE.MeshStandardMaterial({
        color: 0x0a0c0f, metalness: 0.6, roughness: 0.4
      });

      // 8 VRM phases stacked along the right edge of PCB
      for (let p = 0; p < 8; p++) {
        const py = -0.42 + p * 0.12;
        // inductor body
        const ind = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.1), indBodyMat);
        ind.position.set(1.45, PCB_TOP + 0.04, py);
        card.add(ind);
        dynamic.vrmInductors.push(ind);
        // glowing core (visible ferrite cap on top)
        const coreM = indCoreMat();
        const core = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.02, 0.07), coreM);
        core.position.set(1.45, PCB_TOP + 0.085, py);
        card.add(core);
        dynamic.vrmCores.push(core);
        // pair of MOSFETs next to each inductor
        for (let mf = 0; mf < 2; mf++) {
          const ms = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.025, 0.06), mosfetMat);
          ms.position.set(1.28 + mf * 0.07, PCB_TOP + 0.0125, py);
          card.add(ms);
        }
      }

      // ---------- LEFT-SIDE VRM (smaller, for memory power) ----------
      for (let p = 0; p < 4; p++) {
        const py = -0.32 + p * 0.21;
        const ind = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, 0.08), indBodyMat);
        ind.position.set(-1.42, PCB_TOP + 0.035, py);
        card.add(ind);
        dynamic.vrmInductors.push(ind);
        const coreM = indCoreMat();
        const core = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.05), coreM);
        core.position.set(-1.42, PCB_TOP + 0.075, py);
        card.add(core);
        dynamic.vrmCores.push(core);
      }

      // ---------- CAPACITORS (rows of small SMDs) ----------
      const capMat = new THREE.MeshStandardMaterial({
        color: 0xc0a060, metalness: 0.7, roughness: 0.35,
        emissive: 0x261a08, emissiveIntensity: 0.3
      });
      // capacitor row below GPU die
      for (let i = 0; i < 14; i++) {
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.025, 0.08), capMat);
        cap.position.set(-0.65 + i * 0.1, PCB_TOP + 0.0125, 0.6);
        card.add(cap);
        dynamic.capacitors.push(cap);
      }
      // capacitor row above
      for (let i = 0; i < 14; i++) {
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.025, 0.08), capMat);
        cap.position.set(-0.65 + i * 0.1, PCB_TOP + 0.0125, -0.6);
        card.add(cap);
        dynamic.capacitors.push(cap);
      }
      // small SMD speckle around inductors
      const smdMat = new THREE.MeshStandardMaterial({
        color: 0x14181c, metalness: 0.5, roughness: 0.5
      });
      for (let s = 0; s < 40; s++) {
        const sm = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.02), smdMat);
        const sx = 1.05 + Math.random() * 0.7;
        const sz = -0.55 + Math.random() * 1.1;
        sm.position.set(sx, PCB_TOP + 0.006, sz);
        card.add(sm);
      }

      // ---------- 12VHPWR POWER CONNECTOR (top edge) ----------
      const pwrBodyMat = new THREE.MeshStandardMaterial({
        color: 0x0a0c0f, metalness: 0.7, roughness: 0.4
      });
      const pwrBody = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.18), pwrBodyMat);
      pwrBody.position.set(0.5, PCB_TOP + 0.06, -0.55);
      card.add(pwrBody);
      // 6 gold pins
      const pinMat = new THREE.MeshStandardMaterial({
        color: 0xf6c46a, metalness: 0.95, roughness: 0.25
      });
      for (let p = 0; p < 6; p++) {
        const pin = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.04, 0.04), pinMat);
        pin.position.set(0.34 + p * 0.06, PCB_TOP + 0.04, -0.55);
        card.add(pin);
      }
      // power-on LED next to connector
      const pwrLedMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95 });
      const pwrLed = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.03), pwrLedMat);
      pwrLed.position.set(0.78, PCB_TOP + 0.015, -0.55);
      card.add(pwrLed);
      dynamic.powerLed = pwrLed;

      // ---------- NVLINK FINGERS (top edge, right side) ----------
      const nvlinkMat = new THREE.MeshStandardMaterial({
        color: 0xf6c46a, metalness: 0.95, roughness: 0.2,
        emissive: 0x4a3008, emissiveIntensity: 0.35
      });
      for (let n = 0; n < 14; n++) {
        const f = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.018, 0.06), nvlinkMat);
        f.position.set(1.0 + n * 0.04, PCB_TOP + 0.009, -0.6);
        card.add(f);
        dynamic.nvlinkFingers.push(f);
      }

      // ---------- PCIe GOLD FINGERS (bottom edge) ----------
      const pcieMat = new THREE.MeshStandardMaterial({
        color: 0xf3c060, metalness: 0.95, roughness: 0.22,
        emissive: 0x4a3408, emissiveIntensity: 0.4
      });
      // 30 contacts in two banks (PCIe x16)
      for (let n = 0; n < 22; n++) {
        const f = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.05), pcieMat);
        f.position.set(-0.7 + n * 0.065, -0.075, 0.62);
        card.add(f);
        dynamic.pcieFingers.push(f);
      }

      // ---------- DISPLAY IO (HDMI + 3 DP) ----------
      // backplate dark frame (this REPLACES the simple IO at left end)
      const ioBracketMat = new THREE.MeshStandardMaterial({
        color: 0x0d0f12, metalness: 0.85, roughness: 0.35
      });
      const ioBracket = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 1.22), ioBracketMat);
      ioBracket.position.set(-1.76, 0.18, 0);
      card.add(ioBracket);
      // HDMI port
      const hdmiMat = new THREE.MeshStandardMaterial({
        color: 0x141821, metalness: 0.7, roughness: 0.4,
        emissive: 0x0a1422, emissiveIntensity: 0.4
      });
      const hdmi = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.18), hdmiMat);
      hdmi.position.set(-1.79, 0.42, 0.45);
      card.add(hdmi);
      // 3 DisplayPorts
      for (let dp = 0; dp < 3; dp++) {
        const port = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.07, 0.13), hdmiMat);
        port.position.set(-1.79, 0.42, 0.18 - dp * 0.18);
        card.add(port);
      }
      // vent grid on bracket (small slats)
      for (let v = 0; v < 8; v++) {
        const slat = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.04, 0.06),
          new THREE.MeshStandardMaterial({ color: 0x0a0c0f, metalness: 0.5, roughness: 0.7 })
        );
        slat.position.set(-1.79, -0.02 + Math.floor(v / 4) * 0.06, -0.55 + (v % 4) * 0.16);
        card.add(slat);
      }

      // ---------- BACKPLATE (under PCB) ----------
      const backplateMat = new THREE.MeshStandardMaterial({
        color: 0x16191d, metalness: 0.9, roughness: 0.3
      });
      const backplate = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.04, 1.25), backplateMat);
      backplate.position.set(0, -0.13, 0);
      card.add(backplate);
      // backplate cutout pattern — 6 small triangular cutouts simulated as dark squares
      const cutoutMat = new THREE.MeshStandardMaterial({
        color: 0x05060a, metalness: 0.5, roughness: 0.6,
        emissive: col, emissiveIntensity: 0.18
      });
      for (let cz = 0; cz < 6; cz++) {
        const co = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.005, 0.18), cutoutMat);
        co.position.set(-0.9 + cz * 0.36, -0.115, 0);
        card.add(co);
      }

      // ---------- COLD PLATE / VAPOR CHAMBER over die ----------
      const platMat = new THREE.MeshStandardMaterial({
        color: 0x9aa1ad, metalness: 0.95, roughness: 0.2
      });
      const coldplate = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 1.2), platMat);
      coldplate.position.set(0, 0.12, 0);
      card.add(coldplate);

      // ---------- HEATPIPES (copper tubes arching across fins) ----------
      const pipeMat = new THREE.MeshStandardMaterial({
        color: 0xc0743a, metalness: 0.95, roughness: 0.22,
        emissive: 0x4a1f0c, emissiveIntensity: 0.3
      });
      for (let h = 0; h < 5; h++) {
        const pipe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.035, 0.035, 3.0, 16),
          pipeMat
        );
        pipe.rotation.z = Math.PI / 2;
        pipe.position.set(0, 0.18 + h * 0.04, -0.5 + h * 0.25);
        card.add(pipe);
      }

      // ---------- FANS (preserve userData.fans for animations) ----------
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
        // outer ring detail
        const outerRing = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.018, 8, 36), fanRingMat);
        outerRing.rotation.x = Math.PI / 2;
        fanGroup.add(outerRing);
        // 9 blades with subtle curve (using rotated thin boxes — keeps geometry cheap)
        for (let b = 0; b < 9; b++) {
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.02, 0.16), bladesMat);
          blade.rotation.y = (b / 9) * Math.PI * 2;
          blade.position.y = 0.02;
          fanGroup.add(blade);
        }
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 24), fanHubMat);
        fanGroup.add(hub);
        // hub logo dot
        const hubDot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.082, 16),
          new THREE.MeshBasicMaterial({ color: col })
        );
        fanGroup.add(hubDot);
        fanGroup.position.set(fx, 0.65, 0);
        fanGroup.userData.fan = true;
        fans.push(fanGroup);
        card.add(fanGroup);
      });

      // ---------- GLOW STRIPS (preserve userData.ledStrip / strip) ----------
      const stripMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.92 });
      const strip = new THREE.Mesh(new THREE.BoxGeometry(3.35, 0.035, 0.045), stripMat);
      strip.position.set(0, 0.635, -0.6);
      card.add(strip);
      // side accent strip
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.45, 0.1), stripMat);
      side.position.set(1.72, 0.35, 0);
      card.add(side);

      // ---------- ENERGY TRACES (additive lines flowing from VRM → die → memory) ----------
      const traceMat = () => new THREE.MeshBasicMaterial({
        color: col, transparent: true, opacity: 0.0,
        blending: THREE.AdditiveBlending, depthWrite: false
      });
      // VRM → die traces (right side)
      const traceTargets = [
        { from: [1.4, 0], len: 1.0, axis: 'x', sign: -1 },
        { from: [1.4, 0.3], len: 1.0, axis: 'x', sign: -1 },
        { from: [1.4, -0.3], len: 1.0, axis: 'x', sign: -1 },
        { from: [-1.4, 0], len: 1.0, axis: 'x', sign: 1 },
        // die → memory (top)
        { from: [0, -0.4], len: 0.36, axis: 'z', sign: -1 },
        { from: [0, 0.4], len: 0.36, axis: 'z', sign: 1 }
      ];
      traceTargets.forEach((t) => {
        const m = traceMat();
        const isX = t.axis === 'x';
        const geom = new THREE.BoxGeometry(isX ? t.len : 0.012, 0.002, isX ? 0.012 : t.len);
        const ln = new THREE.Mesh(geom, m);
        const cx = isX ? t.from[0] + t.sign * t.len / 2 : t.from[0];
        const cz = isX ? t.from[1] : t.from[1] + t.sign * t.len / 2;
        ln.position.set(cx, PCB_TOP + 0.003, cz);
        card.add(ln);
        dynamic.traceLines.push(ln);
      });

      card.position.x = xOffset;
      card.userData.fans = fans;
      card.userData.strip = stripMat;
      card.userData.ledStrip = strip;
      card.userData.dynamic = dynamic;

      // tick(t) — called from animate loops to drive component-level life
      card.userData.tick = (t) => {
        // Die emissive pulse (synchronized heart-rate of the chip)
        if (dynamic.die && dynamic.die.material) {
          dynamic.die.material.emissiveIntensity = 0.7 + Math.sin(t * 2.4) * 0.35 + Math.abs(Math.sin(t * 6.0)) * 0.15;
        }
        // VRM phase rotation — light up cores in sequence (8-phase rotor)
        const phaseCount = dynamic.vrmCores.length;
        const phaseSpeed = 6.0; // Hz-ish
        dynamic.vrmCores.forEach((core, i) => {
          const phase = (t * phaseSpeed + i * (Math.PI * 2 / phaseCount)) % (Math.PI * 2);
          const lit = Math.max(0, Math.cos(phase));
          core.material.emissiveIntensity = 0.35 + lit * 0.9;
        });
        // PCIe finger shimmer (left-to-right wave)
        dynamic.pcieFingers.forEach((f, i) => {
          const wave = Math.sin(t * 3 - i * 0.25);
          f.material.emissiveIntensity = 0.35 + Math.max(0, wave) * 0.8;
        });
        // NVLink subtle pulse
        dynamic.nvlinkFingers.forEach((f, i) => {
          f.material.emissiveIntensity = 0.3 + Math.abs(Math.sin(t * 1.6 + i * 0.4)) * 0.5;
        });
        // Memory thermal pulse (slow warm-up wave)
        dynamic.memChips.forEach((m, i) => {
          m.material.emissiveIntensity = 0.4 + Math.sin(t * 1.2 + i * 0.7) * 0.18;
        });
        // Energy trace flow — sweep alpha along each trace
        dynamic.traceLines.forEach((ln, i) => {
          const flow = (Math.sin(t * 4 - i * 0.8) + 1) / 2;
          ln.material.opacity = 0.15 + flow * 0.55;
        });
        // Power LED breath
        if (dynamic.powerLed) {
          dynamic.powerLed.material.opacity = 0.6 + Math.abs(Math.sin(t * 2.2)) * 0.4;
        }
      };

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
    rings.userData.tick = null;

    // Multiple concentric thin rings
    const ringMatBright = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.45, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const ringMatDim = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.18, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const radii = [2.0, 2.18, 2.4, 2.62, 2.85, 3.05];
    radii.forEach((r, i) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(r, r + (i % 2 === 0 ? 0.012 : 0.005), 96),
        i % 2 === 0 ? ringMatBright : ringMatDim
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.58 + i * 0.005;
      rings.add(ring);
    });

    // Tick-mark ring (small radial dashes around outer ring) — counter-rotates
    const tickMat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const tickGroup = new THREE.Group();
    for (let t = 0; t < 36; t++) {
      const angle = (t / 36) * Math.PI * 2;
      const long = t % 9 === 0;
      const tick = new THREE.Mesh(
        new THREE.BoxGeometry(0.025, 0.002, long ? 0.18 : 0.08),
        tickMat
      );
      const r = 3.18;
      tick.position.set(Math.cos(angle) * r, -0.575, Math.sin(angle) * r);
      tick.rotation.y = -angle + Math.PI / 2;
      tickGroup.add(tick);
    }
    rings.add(tickGroup);

    // Hex grid pad (wireframe hexagonal mesh)
    const padMat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.11, side: THREE.DoubleSide, wireframe: true
    });
    const pad = new THREE.Mesh(new THREE.CircleGeometry(3, 6), padMat);
    pad.rotation.x = Math.PI / 2;
    pad.position.y = -0.6;
    rings.add(pad);

    // Cross hairlines (north-south, east-west)
    const hairMat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.22,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const ns = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.001, 6.0), hairMat);
    ns.position.y = -0.578;
    rings.add(ns);
    const ew = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.001, 0.005), hairMat);
    ew.position.y = -0.578;
    rings.add(ew);

    // Animated scan ring (sweeps outward)
    const scanMat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.0,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    });
    const scan = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.04, 96), scanMat);
    scan.rotation.x = Math.PI / 2;
    scan.position.y = -0.572;
    rings.add(scan);

    // Vertical scan beam (cylinder, rises through chip)
    const beamMat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.0,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 0.02, 64, 1, true),
      beamMat
    );
    beam.position.y = 0;
    rings.add(beam);

    // Diagonal hex-tile rings rotating in opposite directions
    const innerHex = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 1.62, 6),
      new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 0.35, side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    innerHex.rotation.x = Math.PI / 2;
    innerHex.position.y = -0.565;
    rings.add(innerHex);

    rings.userData.dynamic = { tickGroup, scan, scanMat, beam, beamMat, innerHex };
    rings.userData.tick = (t) => {
      // tick group rotates slow CCW
      tickGroup.rotation.y = t * 0.15;
      // inner hex rotates faster CW
      innerHex.rotation.z = -t * 0.4;
      // scan ring expands then resets
      const scanT = (t * 0.5) % 1;
      const sR = 0.6 + scanT * 2.6;
      scan.geometry.dispose();
      scan.geometry = new THREE.RingGeometry(sR, sR + 0.04, 96);
      scanMat.opacity = (1 - scanT) * 0.5;
      // vertical beam — rises and fades
      const beamT = ((t * 0.7) % 1);
      beam.position.y = -0.55 + beamT * 1.6;
      beamMat.opacity = Math.sin(beamT * Math.PI) * 0.18;
    };

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
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
    camera.position.set(0, 0.95, 7.8);
    camera.lookAt(0, 0.1, 0);
    setupLights(scene);

    const stage = new THREE.Group();
    scene.add(stage);

    const gpu = makeGPU({ scale: 1.52 });
    stage.add(gpu);
    addHoloRings(stage);
    addParticleField(scene, 520, 18);
    const rim = new THREE.PointLight(GREEN_BRIGHT, 1.4, 18);
    rim.position.set(-4, 1.6, -3.5);
    scene.add(rim);

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
      gpu.rotation.y = t * 0.16 + mx * 0.2;
      gpu.rotation.x = Math.sin(t * 0.45) * 0.04 + my * -0.1;
      gpu.position.y = Math.sin(t * 0.8) * 0.06;
      fans.forEach((f) => (f.rotation.y -= 0.26));
      gpu.userData.cards.forEach((c) => c.userData.tick && c.userData.tick(t));
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

      gpu.userData.cards.forEach((c) => c.userData.tick && c.userData.tick(t));

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
  }

  /* --------------------------------------------------------
     ANATOMY scene — huge hologram with modes
     -------------------------------------------------------- */
  function initAnatomy() {
    const canvas = $('#anatomy-canvas');
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
    camera.position.set(0, 1.1, 8.4);
    camera.lookAt(0, 0.1, 0);
    setupLights(scene);
    addParticleField(scene, 520, 18);

    const stage = new THREE.Group();
    scene.add(stage);
    const holoRings = addHoloRings(stage);

    const gpu = makeGPU({ scale: 1.45 });
    stage.add(gpu);
    const card = gpu.userData.cards[0];
    const shroud = card.children[1];
    const fins = card.children.slice(2, 20);
    const fans = card.userData.fans;
    const ledStrip = card.userData.ledStrip;

    // Orbit drag
    let mx = 0, my = 0, tMx = 0, tMy = 0;
    let dragging = false, dragX = 0, dragY = 0, yawOffset = 0, pitchOffset = 0;
    canvas.addEventListener('pointerdown', (e) => {
      dragging = true; dragX = e.clientX; dragY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (dragging) {
        yawOffset += (e.clientX - dragX) * 0.008;
        pitchOffset = clamp(pitchOffset + (e.clientY - dragY) * 0.005, -0.6, 0.6);
        dragX = e.clientX; dragY = e.clientY;
      } else {
        const r = canvas.getBoundingClientRect();
        tMx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        tMy = ((e.clientY - r.top) / r.height - 0.5) * 2;
      }
    });
    canvas.addEventListener('pointerup', () => (dragging = false));
    canvas.addEventListener('pointerleave', () => (dragging = false));

    // Thermal overlay (additive sprites over the card)
    const thermalDots = new THREE.Group();
    const thermMat = (hex) => new THREE.MeshBasicMaterial({
      color: hex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
    });
    const thermGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const hotSpots = [
      [-0.6, 0.5, 0, 0xff5a33],
      [0.6, 0.5, 0, 0xff884a],
      [-1.1, 0.4, 0.2, 0xffaa55],
      [1.1, 0.4, -0.2, 0xffaa55],
      [0, 0.2, 0, 0xff8f3a]
    ];
    const thermMeshes = hotSpots.map(([x, y, z, c]) => {
      const m = new THREE.Mesh(thermGeo, thermMat(c));
      m.position.set(x, y, z);
      m.scale.setScalar(1.6);
      thermalDots.add(m);
      return m;
    });
    card.add(thermalDots);

    // State
    let mode = 'full';
    const setMode = (m) => {
      mode = m;
      const focus = $('#anatomy-focus');
      const state = $('#anatomy-state');
      if (state) state.textContent = m === 'full' ? 'Holographic view · 1.0×'
                                  : m === 'exploded' ? 'Exploded components · deconstructed'
                                  : 'Thermal overlay · post-Layer 02';
      if (focus) focus.textContent = m === 'full' ? '— full assembly'
                                  : m === 'exploded' ? '— component separation'
                                  : '— die 66°C · vram 78°C';
    };
    $$('.ac-btn').forEach((b) => {
      b.addEventListener('click', () => {
        $$('.ac-btn').forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
        setMode(b.dataset.view);
      });
    });

    // Callout hover — highlight corresponding part
    const highlight = { fans: false, led: false, pads: false, paste: false, vf: false, soft: false };
    $$('.cout').forEach((el) => {
      const key = el.dataset.for;
      const focus = $('#anatomy-focus');
      el.addEventListener('pointerenter', () => {
        highlight[key] = true;
        if (focus) focus.textContent = '→ ' + el.querySelector('strong').textContent;
      });
      el.addEventListener('pointerleave', () => {
        highlight[key] = false;
        if (focus) focus.textContent = mode === 'full' ? '— full assembly'
                                     : mode === 'exploded' ? '— component separation'
                                     : '— die 66°C · vram 78°C';
      });
    });

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
      mx = lerp(mx, tMx, 0.05);
      my = lerp(my, tMy, 0.05);

      gpu.rotation.y = lerp(gpu.rotation.y, t * 0.12 + yawOffset + mx * 0.25, 0.1);
      gpu.rotation.x = lerp(gpu.rotation.x, Math.sin(t * 0.4) * 0.05 + pitchOffset - my * 0.15, 0.1);
      gpu.position.y = Math.sin(t * 0.7) * 0.05;

      // Exploded state
      const ex = mode === 'exploded' ? 1 : 0;
      shroud.position.y = lerp(shroud.position.y, 0.35 + ex * 1.3, 0.08);
      fins.forEach((fin, i) => {
        const base = -0.55 + i * 0.062;
        const spread = ex ? (i - fins.length / 2) * 0.11 : 0;
        const targetZ = base + spread;
        fin.position.z = lerp(fin.position.z, targetZ, 0.08);
        fin.position.y = lerp(fin.position.y, 0.35 + ex * 0.55, 0.08);
      });
      fans.forEach((f, i) => {
        const tx = ex ? (i === 0 ? -2.2 : 2.2) : (i === 0 ? -1.1 : 1.1);
        const ty = ex ? 1.6 : 0.65;
        f.position.x = lerp(f.position.x, tx, 0.08);
        f.position.y = lerp(f.position.y, ty, 0.08);
        const spin = 0.3 + (highlight.fans ? 0.2 : 0);
        f.rotation.y -= spin;
      });

      // Thermal overlay
      const tOn = mode === 'thermal' ? 1 : 0;
      thermMeshes.forEach((m, i) => {
        const base = 0.45 + Math.sin(t * 1.5 + i) * 0.15;
        m.material.opacity = lerp(m.material.opacity, tOn * base, 0.1);
        m.scale.setScalar(lerp(m.scale.x, tOn * (1.4 + Math.sin(t * 2 + i) * 0.3), 0.1));
      });

      // LED pulse when led callout hovered
      if (ledStrip && ledStrip.material) {
        const tgt = highlight.led ? 0.6 + Math.abs(Math.sin(t * 4)) * 0.4 : 0.85;
        ledStrip.material.opacity = lerp(ledStrip.material.opacity, tgt, 0.12);
      }

      // Drive PCB-level component animation (die pulse, VRM phase rotation,
      // PCIe finger shimmer, memory thermal, energy traces)
      if (gpu.userData.cards) {
        gpu.userData.cards.forEach((c) => c.userData.tick && c.userData.tick(t));
      }
      // Drive hologram base animation (scan ring, beam, tick rotation)
      if (holoRings && holoRings.userData.tick) holoRings.userData.tick(t);

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
    const holoRings = addHoloRings(holder);

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

      const roUid = $('#ro-uid');
      if (roUid) roUid.textContent = serial;
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
        gpu.userData.cards.forEach((c) => {
          c.userData.fans.forEach((f) => (f.rotation.y -= 0.35));
          c.userData.tick && c.userData.tick(t);
        });
      }
      if (holoRings && holoRings.userData.tick) holoRings.userData.tick(t);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
  }

  /* --------------------------------------------------------
     BUILDER page — enterprise full page configurator
     -------------------------------------------------------- */
  function initBuilderPage() {
    const canvas = $('#builder-canvas');
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 60);
    camera.position.set(0, 1.15, 8.8);
    camera.lookAt(0, 0.25, 0);
    const lights = setupLights(scene, 0x9ad6ff);
    addParticleField(scene, 320, 14, 0x8fccff);

    const holder = new THREE.Group();
    scene.add(holder);
    const holo = addHoloRings(holder, 0x9ad6ff);
    let gpu = makeGPU({ scale: 1.2 });
    holder.add(gpu);

    const platformMap = {
      '4090': { dual: false, rack: false, scale: 1.2, vram: 24, price: 2600 },
      'a6000': { dual: false, rack: false, scale: 1.18, vram: 48, price: 3200 },
      'dual3090': { dual: true, rack: false, scale: 0.95, vram: 48, price: 2900 },
      'cluster': { dual: false, rack: true, scale: 1.05, vram: 96, price: 8400 }
    };
    const workloadMap = {
      ai: { accent: 0x9ad6ff, perf: 118 },
      studio: { accent: 0xffb56e, perf: 106 },
      gaming: { accent: 0xff7a77, perf: 122 },
      lab: { accent: 0xbf98ff, perf: 174 }
    };
    const processSteps = ['intake', 'tear', 'thermal', 'tune', 'cert'];
    let currentPlatform = '4090';
    let currentWorkload = 'ai';
    let currentStep = 'intake';

    const setAccent = (hex) => {
      lights.p1.color.setHex(hex);
      lights.p3.color.setHex(hex);
      if (holo) {
        holo.traverse((o) => {
          if (o.material && o.material.color) o.material.color.setHex(hex);
        });
      }
      holder.traverse((o) => {
        if (!o.material) return;
        if (o.material.emissive && o.material.emissiveIntensity > 0.1) o.material.emissive.setHex(hex);
        if (o.material.isMeshBasicMaterial && o.material.color) o.material.color.setHex(hex);
      });
    };

    const rebuild = () => {
      const cfg = platformMap[currentPlatform];
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
      setAccent(workloadMap[currentWorkload].accent);
      recompute();
    };

    const setActive = (selector, val) => {
      $$(selector).forEach((b) => b.classList.toggle('active', b.dataset.val === val || b.dataset.step === val));
    };

    const recompute = () => {
      const cfg = platformMap[currentPlatform];
      const wl = workloadMap[currentWorkload];
      const tdp = parseInt($('#builder-tdp')?.value || '82', 10);
      const uv = parseInt($('#builder-uv')?.value || '105', 10);
      const cooling = parseInt($('#builder-cooling')?.value || '68', 10);
      const delta = Math.round(9 + uv * 0.05 + (100 - tdp) * 0.16 + cooling * 0.04);
      const tokens = Math.round(wl.perf * (tdp / 100) * (1 - uv * 0.00035));
      const price = Math.round(cfg.price + (tdp - 82) * 7 + uv * 0.7 + cooling * 4);
      $('#builder-vram') && ($('#builder-vram').textContent = String(cfg.vram));
      $('#builder-temp') && ($('#builder-temp').textContent = String(delta));
      $('#builder-tok') && ($('#builder-tok').textContent = String(tokens));
      $('#builder-price') && ($('#builder-price').textContent = price.toLocaleString());
      $('#builder-tdp-val') && ($('#builder-tdp-val').textContent = `${tdp}%`);
      $('#builder-uv-val') && ($('#builder-uv-val').textContent = `-${uv} mV`);
      $('#builder-cooling-val') && ($('#builder-cooling-val').textContent = `${cooling}%`);
      $('#builder-model') && ($('#builder-model').textContent = `GPU: ${currentPlatform.toUpperCase()}`);
      $('#builder-profile') && ($('#builder-profile').textContent = `PROFILE: ${currentWorkload.toUpperCase()}`);
    };

    const applyStepUI = () => {
      setActive('.builder-step', currentStep);
      const label = {
        intake: 'Step 01 · Intake scan & teardown map',
        tear: 'Step 02 · Full disassembly & contamination removal',
        thermal: 'Step 03 · Thermal stack rebuild and repaste',
        tune: 'Step 04 · Voltage curve tuning under live load',
        cert: 'Step 05 · 24h certification and signed report'
      }[currentStep];
      $('#builder-step-title') && ($('#builder-step-title').textContent = label);
    };

    $$('.builder-platform .opt').forEach((b) => b.addEventListener('click', () => {
      currentPlatform = b.dataset.val;
      setActive('.builder-platform .opt', currentPlatform);
      rebuild();
    }));
    $$('.builder-workload .opt').forEach((b) => b.addEventListener('click', () => {
      currentWorkload = b.dataset.val;
      setActive('.builder-workload .opt', currentWorkload);
      setAccent(workloadMap[currentWorkload].accent);
      recompute();
    }));
    $$('.builder-step').forEach((b) => b.addEventListener('click', () => {
      currentStep = b.dataset.step;
      applyStepUI();
    }));
    ['builder-tdp', 'builder-uv', 'builder-cooling'].forEach((id) => {
      const el = $('#' + id);
      if (el) el.addEventListener('input', recompute);
    });

    $$('.part-chip').forEach((chip) => {
      chip.addEventListener('mouseenter', () => holder.rotation.y += 0.18);
      chip.addEventListener('click', () => {
        const part = chip.dataset.part;
        if (part === 'fans' || part === 'vrm') currentStep = 'thermal';
        else if (part === 'core') currentStep = 'tune';
        else currentStep = 'tear';
        applyStepUI();
      });
    });

    let autoIndex = 0;
    setInterval(() => {
      autoIndex = (autoIndex + 1) % processSteps.length;
      if (document.visibilityState === 'visible') {
        currentStep = processSteps[autoIndex];
        applyStepUI();
      }
    }, 5600);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(canvas);
    resize();

    setActive('.builder-platform .opt', currentPlatform);
    setActive('.builder-workload .opt', currentWorkload);
    applyStepUI();
    recompute();

    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      const ex = currentStep === 'tear' || currentStep === 'thermal' ? 1 : 0;
      const tune = currentStep === 'tune' ? 1 : 0;
      const cert = currentStep === 'cert' ? 1 : 0;
      const cards = gpu.userData.cards || [];
      cards.forEach((card) => {
        const shroud = card.children[1];
        const fins = card.children.slice(2, 20);
        const fans = card.userData.fans || [];
        if (shroud) shroud.position.y = lerp(shroud.position.y, 0.35 + ex * 1.1, 0.08);
        fins.forEach((fin, i) => {
          const base = -0.55 + i * 0.062;
          const spread = ex ? (i - fins.length / 2) * 0.09 : 0;
          fin.position.z = lerp(fin.position.z, base + spread, 0.08);
          fin.position.y = lerp(fin.position.y, 0.35 + ex * 0.48, 0.08);
        });
        fans.forEach((f, i) => {
          const tx = ex ? (i === 0 ? -2 : 2) : (i === 0 ? -1.1 : 1.1);
          f.position.x = lerp(f.position.x, tx, 0.08);
          f.position.y = lerp(f.position.y, 0.65 + ex * 0.6, 0.08);
          f.rotation.y -= 0.24 + tune * 0.12 + cert * 0.08;
        });
        if (card.userData.tick) card.userData.tick(t);
      });
      gpu.rotation.y = lerp(gpu.rotation.y, t * 0.11 + cert * 0.2, 0.08);
      gpu.rotation.x = lerp(gpu.rotation.x, Math.sin(t * 0.45) * 0.04 + ex * 0.04, 0.08);
      gpu.position.y = Math.sin(t * 0.8) * 0.06;
      if (holo && holo.userData.tick) holo.userData.tick(t);
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
    try { initAnatomy(); } catch (e) { console.warn('anatomy', e); }
    try { initLayers(); } catch (e) { console.warn('layers', e); }
    try { initConfigurator(); } catch (e) { console.warn('cfg', e); }
    try { initBuilderPage(); } catch (e) { console.warn('builder', e); }
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
