/* ============================================================
   NUCORE — Marketplace
   ============================================================ */
(function () {
  const SALES_EMAIL = "nucoretechnologies@gmail.com";

  // SVG placeholder generator — produces a clean, on-brand product visual
  // with a category-specific glyph, returned as a data URI.
  function svgArt(category, accent) {
    const a = accent || "#82e0ff";
    const glyphs = {
      pc: `<rect x="60" y="50" width="120" height="180" rx="10" fill="none" stroke="${a}" stroke-width="2" opacity="0.85"/>
           <rect x="78" y="72" width="84" height="36" rx="4" fill="${a}" opacity="0.18"/>
           <rect x="78" y="118" width="84" height="6" rx="3" fill="${a}" opacity="0.5"/>
           <rect x="78" y="132" width="60" height="6" rx="3" fill="${a}" opacity="0.35"/>
           <circle cx="120" cy="200" r="12" fill="none" stroke="${a}" stroke-width="2" opacity="0.7"/>
           <circle cx="120" cy="200" r="3" fill="${a}"/>`,
      gpu: `<rect x="40" y="90" width="240" height="100" rx="8" fill="none" stroke="${a}" stroke-width="2" opacity="0.85"/>
            <rect x="58" y="110" width="60" height="60" rx="4" fill="${a}" opacity="0.18"/>
            <rect x="130" y="110" width="60" height="60" rx="4" fill="${a}" opacity="0.12"/>
            <rect x="202" y="110" width="60" height="60" rx="4" fill="${a}" opacity="0.18"/>
            <circle cx="88" cy="140" r="14" fill="none" stroke="${a}" stroke-width="1.6"/>
            <circle cx="232" cy="140" r="14" fill="none" stroke="${a}" stroke-width="1.6"/>`,
      workstation: `<rect x="50" y="60" width="160" height="160" rx="10" fill="none" stroke="${a}" stroke-width="2"/>
            <rect x="220" y="100" width="30" height="120" rx="6" fill="none" stroke="${a}" stroke-width="2" opacity="0.7"/>
            <rect x="68" y="80" width="124" height="60" rx="4" fill="${a}" opacity="0.18"/>
            <rect x="68" y="150" width="80" height="6" rx="3" fill="${a}" opacity="0.45"/>
            <rect x="68" y="164" width="100" height="6" rx="3" fill="${a}" opacity="0.3"/>`,
      phone: `<rect x="100" y="40" width="120" height="200" rx="22" fill="none" stroke="${a}" stroke-width="2"/>
              <rect x="112" y="56" width="96" height="160" rx="6" fill="${a}" opacity="0.14"/>
              <circle cx="160" cy="226" r="5" fill="none" stroke="${a}" stroke-width="1.6"/>`,
      component: `<polygon points="160,40 260,100 260,200 160,260 60,200 60,100" fill="none" stroke="${a}" stroke-width="2" opacity="0.85"/>
              <circle cx="160" cy="150" r="40" fill="${a}" opacity="0.18"/>
              <circle cx="160" cy="150" r="20" fill="none" stroke="${a}" stroke-width="1.6"/>`,
      accessory: `<rect x="60" y="110" width="200" height="70" rx="12" fill="none" stroke="${a}" stroke-width="2"/>
              <circle cx="100" cy="145" r="14" fill="${a}" opacity="0.25"/>
              <circle cx="160" cy="145" r="14" fill="${a}" opacity="0.25"/>
              <circle cx="220" cy="145" r="14" fill="${a}" opacity="0.25"/>`
    };
    const svg = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 280'>
  <defs>
    <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='#1a2232'/>
      <stop offset='1' stop-color='#0d1016'/>
    </linearGradient>
    <radialGradient id='glow' cx='0.5' cy='0.5' r='0.6'>
      <stop offset='0' stop-color='${a}' stop-opacity='0.22'/>
      <stop offset='1' stop-color='${a}' stop-opacity='0'/>
    </radialGradient>
    <pattern id='grid' x='0' y='0' width='20' height='20' patternUnits='userSpaceOnUse'>
      <path d='M 20 0 L 0 0 0 20' fill='none' stroke='rgba(180,214,255,0.06)' stroke-width='1'/>
    </pattern>
  </defs>
  <rect width='320' height='280' fill='url(#bg)'/>
  <rect width='320' height='280' fill='url(#grid)'/>
  <rect width='320' height='280' fill='url(#glow)'/>
  ${glyphs[category] || glyphs.component}
</svg>`.trim();
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  function img(category, accent) { return svgArt(category, accent); }

  // ----- Product Catalog -----
  const PRODUCTS = [
    {
      id: "nc-pro-tower",
      name: "Nucore Pro Tower · NU-RTX4090 AI Workstation",
      category: "pc",
      categoryLabel: "Nucore PC",
      price: 4290,
      stock: 6,
      description: "A Nucore-engineered AI workstation built around our NU-RTX4090. Hand-assembled, silicon-tuned, and shipped with the model you'll run already warm in memory.",
      longDescription: "The Pro Tower is the daily-driver Nucore build for AI developers and small studios. We start from raw silicon — our NU-RTX4090 is intake-graded, fully disassembled, repasted with PTM7950, rebound to a custom undervolt curve, and 24-hour soak-tested under sustained inference load. The chassis is acoustically engineered (sub-32 dB at full load), the airflow CFD-modeled, and the OS layer pre-tuned. Boots straight into a Linux environment with CUDA, PyTorch, Ollama, and Llama 3.1 70B already loaded. This is not a system-integrator build — every layer was rebuilt by Nucore.",
      specs: [
        ["GPU", "Nucore NU-RTX4090 · 24GB GDDR6X · -112mV verified"],
        ["CPU", "Nucore-binned Ryzen 9 7950X · 16C/32T"],
        ["RAM", "64 GB DDR5-6000 ECC · EXPO-tuned"],
        ["Storage", "2 TB NVMe Gen4 + 4 TB NVMe data"],
        ["PSU", "Nucore-spec 1000W 80+ Platinum"],
        ["Cooling", "Custom 360mm loop · acoustically tuned"],
        ["OS", "Nucore Stack on Ubuntu 24.04 LTS"],
        ["Warranty", "2 years · signed Nucore certification"]
      ]
    },
    {
      id: "nc-studio-tower",
      name: "Nucore Studio Tower · NU-7900XTX Creative",
      category: "pc",
      categoryLabel: "Nucore PC",
      price: 3490,
      stock: 3,
      description: "A Nucore-engineered creative tower for Stable Diffusion, ComfyUI, and AI video — silent, sustained, no throttle mid-render. Built around our NU-7900XTX.",
      longDescription: "Engineered for sustained creative workloads. Our NU-7900XTX (Nucore-rebuilt Radeon 7900 XTX) is paired with a binned Threadripper 7960X on a custom Nucore loop. Tuned for ComfyUI pipelines, AI-assisted compositing, and long-form generative video.",
      specs: [
        ["GPU", "Nucore NU-7900XTX · 24GB"],
        ["CPU", "Nucore-binned Threadripper 7960X · 24C/48T"],
        ["RAM", "128 GB DDR5 ECC · EXPO-tuned"],
        ["Storage", "2 TB NVMe + 8 TB NVMe scratch"],
        ["Cooling", "Custom Nucore loop · acoustically tuned"],
        ["OS", "Nucore Stack · ComfyUI pre-deployed"]
      ]
    },
    {
      id: "nc-lite-tower",
      name: "Nucore Lite Tower · NU-RTX4070 Compact",
      category: "pc",
      categoryLabel: "Nucore PC",
      price: 1890,
      stock: 12,
      description: "The on-ramp Nucore build — a compact, silent NU-RTX4070 system that runs the same four-layer engineering as our flagships, just smaller silicon.",
      longDescription: "Same intake, thermal, tuning, and software process as the Pro and Studio towers — applied to a more accessible silicon tier. Compact 14L chassis, fully Nucore-engineered.",
      specs: [
        ["GPU", "Nucore NU-RTX4070 · 12GB"],
        ["CPU", "Nucore-binned Ryzen 7 7700X"],
        ["RAM", "32 GB DDR5 · EXPO-tuned"],
        ["Storage", "1 TB NVMe Gen4"],
        ["Form factor", "Nucore Mini-ITX · 14L"],
        ["OS", "Nucore Stack on Ubuntu 24.04"]
      ]
    },
    {
      id: "nc-gpu-rtx4090",
      name: "Nucore NU-RTX4090 · 24GB",
      category: "gpu",
      categoryLabel: "Nucore GPU",
      price: 1980,
      stock: 9,
      description: "Our flagship GPU — a Nucore-rebuilt 4090 with PTM7950, a custom undervolt curve, and a signed benchmark certificate in every box. -17°C sustained vs. reference.",
      longDescription: "The NU-RTX4090 is not a 'used 4090.' It is a Nucore product. Every card is fully disassembled in our facility, the die repasted with PTM7950 phase-change material, the VRAM and VRM re-padded, the fan curve re-mapped, and the silicon individually undervolted to a stable curve under sustained Llama 70B inference. Each unit ships with its own benchmark PDF — sustained TFLOPS, junction temps, fan profile, and the Nucore signature hash.",
      specs: [
        ["VRAM", "24 GB GDDR6X"],
        ["TGP", "450W (Nucore eco-mode 380W)"],
        ["Thermal", "PTM7950 die + fresh VRAM/VRM pads"],
        ["Tuning", "-112mV verified · custom fan curve"],
        ["Soak test", "24h FurMark + 24h Llama 70B"],
        ["Ships with", "Signed Nucore cert + benchmark PDF"]
      ]
    },
    {
      id: "nc-gpu-rtx3090",
      name: "Nucore NU-RTX3090 · 24GB",
      category: "gpu",
      categoryLabel: "Nucore GPU",
      price: 980,
      stock: 14,
      description: "The most affordable 24GB VRAM in the Nucore lineup — a fully rebuilt and re-engineered 3090, signed with the same certification process as the flagship.",
      longDescription: "The NU-RTX3090 is rebuilt from the silicon up: stripped, repasted, re-padded, re-tuned, and 24-hour soak tested. Same engineering process as the flagship NU-RTX4090, applied to a more accessible price point. Backed by Nucore — not a reseller warranty.",
      specs: [
        ["VRAM", "24 GB GDDR6X"],
        ["Thermal", "PTM7950 die + fresh memory pads"],
        ["Tuning", "Nucore custom undervolt curve"],
        ["Soak test", "24h sustained load"],
        ["Warranty", "1 year · Nucore-backed"],
        ["Ships with", "Signed Nucore cert + benchmark PDF"]
      ]
    },
    {
      id: "nc-gpu-h100",
      name: "Nucore NU-H100 · 80GB Datacenter",
      category: "gpu",
      categoryLabel: "Nucore GPU",
      price: 28500,
      stock: 2,
      description: "Nucore-certified H100 PCIe for training and high-throughput inference. Re-thermalized, fully validated, signed — datacenter silicon with the Nucore process applied.",
      specs: [
        ["VRAM", "80 GB HBM3"],
        ["Form", "PCIe Gen5 · dual-slot"],
        ["TDP", "350W (Nucore-tuned)"],
        ["Validation", "Full Nucore certification + thermal pass"],
        ["NVLink", "Bridge available on request"],
        ["Ships with", "Signed Nucore cert + benchmark PDF"]
      ]
    },
    {
      id: "nc-gpu-rtx6000",
      name: "Nucore NU-RTX6000A · 48GB Pro",
      category: "gpu",
      categoryLabel: "Nucore GPU",
      price: 6890,
      stock: 4,
      description: "Nucore-engineered RTX 6000 Ada — 48GB of pro-grade VRAM, fully re-thermalized and silicon-tuned for sustained 24/7 workloads.",
      specs: [
        ["VRAM", "48 GB GDDR6 ECC"],
        ["Form", "Dual-slot blower · 300W"],
        ["Thermal", "PTM7950 die + fresh VRM pads"],
        ["Tuning", "Nucore sustained-load curve"],
        ["Use", "Multi-tenant inference · 3D / VFX"],
        ["Ships with", "Signed Nucore cert + benchmark PDF"]
      ]
    },
    {
      id: "nc-lab-dual",
      name: "Nucore Lab · Dual NU-RTX4090 Training Rig",
      category: "workstation",
      categoryLabel: "Nucore Workstation",
      price: 9990,
      stock: 2,
      description: "A Nucore-engineered desk-side training rig — two NU-RTX4090s on a custom backplane, EPYC Genoa, explicit airflow zoning. NVLink-ready.",
      longDescription: "Designed in-house at Nucore for fine-tuning and multi-GPU inference. Two NU-RTX4090s on a Nucore-spec backplane, with CFD-modeled airflow zoning and a Nucore-binned EPYC Genoa CPU. Quiet enough to sit beside a desk, sustained enough to train through the night.",
      specs: [
        ["GPUs", "2 × Nucore NU-RTX4090 (or 2 × NU-RTX6000A)"],
        ["CPU", "Nucore-binned EPYC 9354P · 32C"],
        ["RAM", "256 GB DDR5 ECC"],
        ["Storage", "4 TB NVMe + 16 TB NVMe scratch"],
        ["PSU", "Nucore-spec 1600W redundant"],
        ["Network", "10GbE + IPMI"]
      ]
    },
    {
      id: "nc-cluster-1u",
      name: "Nucore Cluster · 1U NU-A100 Inference Node",
      category: "workstation",
      categoryLabel: "Nucore Workstation",
      price: 14500,
      stock: 1,
      description: "Rack-ready 1U Nucore inference node — NU-A100 40GB, dual EPYC, 25GbE. Drop into a 19\" rack and serve.",
      specs: [
        ["GPU", "Nucore NU-A100 · 40GB"],
        ["CPU", "Nucore-binned 2 × EPYC 7443"],
        ["RAM", "512 GB DDR4 ECC"],
        ["Network", "Dual 25GbE SFP28"],
        ["Form", "1U · Nucore rail kit included"]
      ]
    },
    {
      id: "nc-phone-px",
      name: "Nucore PX-9 · Hardened Mobile",
      category: "phone",
      categoryLabel: "Nucore Phone",
      price: 1290,
      stock: 7,
      description: "A Nucore-hardened mobile device — Pixel 9 Pro chassis, Nucore-built secure-boot firmware, signed and verified. Engineered for engineers who don't want their phone to leak.",
      longDescription: "The PX-9 is a Nucore-engineered privacy mobile. We start from a fresh Pixel 9 Pro chassis, flash a hardened verified-boot OS image we build in-house, validate every keystone hash, and ship with a signed firmware certificate. Carrier-unlocked, global bands, full Nucore documentation.",
      specs: [
        ["OS", "Nucore Hardened OS (verified boot)"],
        ["Storage", "256 GB"],
        ["RAM", "16 GB"],
        ["Carrier", "Unlocked · global bands"],
        ["Cert", "Signed Nucore firmware hash"]
      ]
    },
    {
      id: "nc-phone-iph",
      name: "Nucore IX-15 Pro · Engineered Mobile",
      category: "phone",
      categoryLabel: "Nucore Phone",
      price: 1090,
      stock: 4,
      description: "A Nucore-engineered iPhone 15 Pro Max build — battery and display certified to Nucore spec, full diagnostic report, signed.",
      specs: [
        ["Storage", "512 GB"],
        ["Battery", "Nucore-spec · >95% verified"],
        ["Diagnostics", "Full Nucore validation report"],
        ["Carrier", "Unlocked"],
        ["Warranty", "1 year · Nucore-backed"]
      ]
    },
    {
      id: "nc-cpu-7950",
      name: "Nucore-Binned Ryzen 9 7950X",
      category: "component",
      categoryLabel: "Nucore Silicon",
      price: 520,
      stock: 18,
      description: "Hand-binned at Nucore — every chip verified to hit a stable -30 PBO Curve Optimizer across all cores. Top of its silicon batch.",
      specs: [
        ["Cores", "16C / 32T"],
        ["Boost", "5.7 GHz Nucore-verified"],
        ["Bin", "Top 15% of Nucore intake batch"],
        ["TDP", "170W"],
        ["Ships with", "Nucore binning certificate"]
      ]
    },
    {
      id: "nc-ram-128",
      name: "Nucore-Tuned DDR5-6000 ECC · 128 GB",
      category: "component",
      categoryLabel: "Nucore Silicon",
      price: 640,
      stock: 22,
      description: "Nucore-validated DDR5 kit — 4 × 32 GB, EXPO-tuned in-house and stability-tested 24h on AM5 and TRX50 platforms.",
      specs: [
        ["Capacity", "128 GB (4 × 32 GB)"],
        ["Speed", "DDR5-6000 CL30 · Nucore-tuned"],
        ["ECC", "On-die + sideband"],
        ["Validation", "24h Nucore stability pass"],
        ["Verified on", "AM5 / TRX50"]
      ]
    },
    {
      id: "nc-acc-cable",
      name: "Nucore 12VHPWR Cable · Reinforced",
      category: "accessory",
      categoryLabel: "Nucore Accessory",
      price: 49,
      stock: 80,
      description: "Nucore-built 12VHPWR cable with reinforced connector and verified pin tension. Standard issue with every Nucore tower.",
      specs: [
        ["Gauge", "16 AWG"],
        ["Length", "650 mm"],
        ["Compatible", "ATX 3.0 modular PSUs"],
        ["Validation", "Nucore pin-tension tested"]
      ]
    },
    {
      id: "nc-acc-thermal",
      name: "Nucore PTM7950 Pad · 80×40 mm",
      category: "accessory",
      categoryLabel: "Nucore Accessory",
      price: 24,
      stock: 60,
      description: "The exact phase-change thermal pad we apply in Layer 02 of the Nucore process. -10°C to -17°C vs. stock paste on most GPUs.",
      specs: [
        ["Material", "PTM7950 phase change"],
        ["Size", "80 × 40 × 0.2 mm"],
        ["Use", "GPU die · CPU IHS"],
        ["Source", "Same lot Nucore uses in-house"]
      ]
    }
  ];

  // attach an SVG image to each product
  PRODUCTS.forEach((p) => { p.image = img(p.category); });

  // ----- State -----
  const state = { cat: "all", sort: "featured" };

  // Read ?cat= from URL
  const params = new URLSearchParams(window.location.search);
  const initialCat = params.get("cat");
  if (initialCat) state.cat = initialCat;

  // ----- DOM -----
  const $list = document.getElementById("mk-list");
  const $empty = document.getElementById("mk-empty");
  const $count = document.getElementById("mk-count");
  const $sort = document.getElementById("mk-sort");
  const $filters = document.getElementById("mk-filters");
  const $modal = document.getElementById("mk-modal");
  const $modalBody = document.getElementById("mk-modal-body");

  // ----- Helpers -----
  function fmtUsd(n) {
    return "$" + n.toLocaleString("en-US");
  }
  function stockLabel(n) {
    if (n <= 0) return { text: "Out of stock", cls: "is-out" };
    if (n <= 3) return { text: `Only ${n} in stock`, cls: "is-low" };
    return { text: `${n} in stock`, cls: "is-ok" };
  }

  // ----- Render -----
  function applyFilters() {
    let items = PRODUCTS.slice();
    if (state.cat !== "all") items = items.filter((p) => p.category === state.cat);
    switch (state.sort) {
      case "price-asc": items.sort((a, b) => a.price - b.price); break;
      case "price-desc": items.sort((a, b) => b.price - a.price); break;
      case "name-asc": items.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return items;
  }

  function render() {
    const items = applyFilters();
    $list.innerHTML = items.map(card).join("");
    $empty.hidden = items.length > 0;
    $count.textContent = String(PRODUCTS.length);

    // wire up cards
    $list.querySelectorAll("[data-open]").forEach((el) => {
      el.addEventListener("click", () => openModal(el.getAttribute("data-open")));
    });
  }

  function card(p) {
    const s = stockLabel(p.stock);
    return `
      <article class="mk-card" data-open="${p.id}" tabindex="0" role="button" aria-label="View ${p.name}">
        <div class="mk-card-media">
          <img src="${p.image}" alt="" loading="lazy"/>
          <span class="mk-card-cat">${p.categoryLabel}</span>
        </div>
        <div class="mk-card-body">
          <div class="mk-card-row">
            <h3 class="mk-card-name">${p.name}</h3>
            <div class="mk-card-price">${fmtUsd(p.price)}</div>
          </div>
          <p class="mk-card-desc">${p.description}</p>
          <ul class="mk-card-specs">
            ${p.specs.slice(0, 3).map((row) => `<li><em>${row[0]}</em><span>${row[1]}</span></li>`).join("")}
          </ul>
          <div class="mk-card-foot">
            <span class="mk-stock ${s.cls}"><i></i>${s.text}</span>
            <span class="mk-card-cta">View · Buy
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M11 7L7 3M11 7L7 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </span>
          </div>
        </div>
      </article>`;
  }

  // ----- Modal -----
  function openModal(id) {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) return;
    const s = stockLabel(p.stock);
    const subject = encodeURIComponent(`Purchase inquiry — ${p.name} (${p.id})`);
    const body = encodeURIComponent(
      `Hi Nucore Technologies,\n\nI'd like to purchase the following unit:\n\n` +
      `• Product: ${p.name}\n` +
      `• ID: ${p.id}\n` +
      `• Listed price: ${fmtUsd(p.price)}\n\n` +
      `Please confirm availability, total with shipping, and payment instructions.\n\n` +
      `Thanks,\n`
    );
    const mailto = `mailto:${SALES_EMAIL}?subject=${subject}&body=${body}`;

    // gallery: 1 main + 2 alt placeholder views (different accents for variety)
    const gallery = [
      img(p.category, "#82e0ff"),
      img(p.category, "#b6f0ff"),
      img(p.category, "#58d4ff")
    ];

    $modalBody.innerHTML = `
      <div class="mk-detail">
        <div class="mk-detail-gallery">
          <div class="mk-detail-main">
            <img id="mk-detail-main-img" src="${gallery[0]}" alt=""/>
            <span class="mk-card-cat">${p.categoryLabel}</span>
          </div>
          <div class="mk-detail-thumbs">
            ${gallery.map((g, i) => `<button class="mk-thumb${i === 0 ? " is-active" : ""}" data-src="${g}" aria-label="View image ${i + 1}"><img src="${g}" alt=""/></button>`).join("")}
          </div>
        </div>
        <div class="mk-detail-info">
          <div class="mk-detail-eyebrow"><span class="eyebrow-dot"></span><span>${p.categoryLabel.toUpperCase()} · ${p.id.toUpperCase()}</span></div>
          <h2 class="mk-detail-name">${p.name}</h2>
          <div class="mk-detail-pricerow">
            <div class="mk-detail-price">${fmtUsd(p.price)}</div>
            <span class="mk-stock ${s.cls}"><i></i>${s.text}</span>
          </div>
          <p class="mk-detail-desc">${p.longDescription || p.description}</p>
          <div class="mk-detail-specs">
            <div class="mk-detail-k">SPECIFICATIONS</div>
            <table>
              <tbody>
                ${p.specs.map((row) => `<tr><th>${row[0]}</th><td>${row[1]}</td></tr>`).join("")}
              </tbody>
            </table>
          </div>
          <div class="mk-detail-actions">
            <a href="${mailto}" class="btn btn-primary">
              <span>Contact to Purchase</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M13 8l-4-4M13 8l-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
            </a>
            <a href="mailto:${SALES_EMAIL}" class="btn btn-ghost"><span>Email Sales</span></a>
          </div>
          <div class="mk-detail-note">
            Online checkout coming soon. For now, click <strong>Contact to Purchase</strong> — your email will be drafted to <strong>${SALES_EMAIL}</strong> and a Nucore engineer will reply with availability, shipping, and payment instructions within 24 hours.
          </div>
        </div>
      </div>`;

    // thumb switching
    $modalBody.querySelectorAll(".mk-thumb").forEach((t) => {
      t.addEventListener("click", () => {
        const src = t.getAttribute("data-src");
        document.getElementById("mk-detail-main-img").src = src;
        $modalBody.querySelectorAll(".mk-thumb").forEach((x) => x.classList.remove("is-active"));
        t.classList.add("is-active");
      });
    });

    $modal.classList.add("is-open");
    $modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    $modal.classList.remove("is-open");
    $modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // ----- Wire-up -----
  $filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".mk-chip");
    if (!btn) return;
    state.cat = btn.dataset.cat;
    $filters.querySelectorAll(".mk-chip").forEach((c) => c.classList.toggle("is-active", c === btn));
    render();
  });

  $sort.addEventListener("change", () => {
    state.sort = $sort.value;
    render();
  });

  $modal.addEventListener("click", (e) => {
    if (e.target.matches("[data-close]")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && $modal.classList.contains("is-open")) closeModal();
            // also support card keyboard activation
  });
  document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && document.activeElement && document.activeElement.matches("[data-open]")) {
      e.preventDefault();
      openModal(document.activeElement.getAttribute("data-open"));
    }
  });

  // sync initial chip state from URL
  if (initialCat) {
    const btn = $filters.querySelector(`.mk-chip[data-cat="${initialCat}"]`);
    if (btn) {
      $filters.querySelectorAll(".mk-chip").forEach((c) => c.classList.toggle("is-active", c === btn));
    }
  }

  render();

  // ----- CTA inquiry -----
  window.__nucoreMk = {
    submitInquiry(form) {
      const email = form.querySelector('input[type="email"]').value.trim();
      const interest = form.querySelector("select").value;
      const subject = encodeURIComponent(`Marketplace inquiry — ${interest}`);
      const body = encodeURIComponent(
        `Hi Nucore Technologies,\n\nI'm interested in: ${interest}\nMy email: ${email}\n\nPlease send me available units and pricing.\n\nThanks,\n`
      );
      window.location.href = `mailto:${SALES_EMAIL}?subject=${subject}&body=${body}`;
      const toast = document.getElementById("cta-toast");
      if (toast) {
        toast.classList.add("is-on");
        setTimeout(() => toast.classList.remove("is-on"), 4000);
      }
    }
  };
})();
