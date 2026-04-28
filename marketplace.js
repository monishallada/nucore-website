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
      id: "nc-pro-4090",
      name: "Nucore Pro · RTX 4090 Tower",
      category: "pc",
      categoryLabel: "Custom PC",
      price: 4290,
      stock: 6,
      description: "A purpose-built AI workstation tower around an undervolted, re-thermalized RTX 4090. Ships pre-loaded with CUDA, PyTorch, Ollama, and Llama 3.1 70B.",
      longDescription: "The Pro Tower is the daily-driver Nucore unit for AI developers and small studios. Every 4090 is intake-tested, repasted with PTM7950, undervolted to a stable curve, and 24-hour soak-tested under sustained inference load. The chassis is acoustically tuned — under 32 dB at full load. Boots straight into a Linux environment with your model already warm.",
      specs: [
        ["GPU", "NVIDIA RTX 4090 · 24GB GDDR6X · undervolted -112mV"],
        ["CPU", "AMD Ryzen 9 7950X · 16C/32T"],
        ["RAM", "64 GB DDR5-6000 ECC"],
        ["Storage", "2 TB NVMe Gen4 + 4 TB NVMe data"],
        ["PSU", "1000W 80+ Platinum"],
        ["Cooling", "360mm AIO + custom intake"],
        ["OS", "Ubuntu 24.04 LTS · Nucore Stack pre-loaded"],
        ["Warranty", "2 years · signed certification"]
      ]
    },
    {
      id: "nc-studio-7900",
      name: "Nucore Studio · 7900 XTX Creative",
      category: "pc",
      categoryLabel: "Custom PC",
      price: 3490,
      stock: 3,
      description: "A silent creative tower for Stable Diffusion, ComfyUI, and AI video work — no throttling mid-render, no fans screaming at a client meeting.",
      longDescription: "Tuned for sustained creative workloads. The Radeon 7900 XTX is repasted, undervolted, and paired with a Threadripper 7960X. Ideal for ComfyUI pipelines and AI-assisted compositing.",
      specs: [
        ["GPU", "AMD Radeon RX 7900 XTX · 24GB"],
        ["CPU", "AMD Threadripper 7960X · 24C/48T"],
        ["RAM", "128 GB DDR5 ECC"],
        ["Storage", "2 TB NVMe + 8 TB SSD scratch"],
        ["Cooling", "Custom loop · acoustically tuned"],
        ["OS", "Ubuntu Studio · pre-loaded ComfyUI"]
      ]
    },
    {
      id: "nc-lite-4070",
      name: "Nucore Lite · RTX 4070 Mini",
      category: "pc",
      categoryLabel: "Custom PC",
      price: 1890,
      stock: 12,
      description: "An entry-tier Nucore for indie devs and students. Compact, quiet, hand-certified — a 4070 with the same four-layer treatment as the flagships.",
      longDescription: "The on-ramp into the Nucore lineup. Same intake, thermal, tuning, and software process — at a price that gets you started.",
      specs: [
        ["GPU", "NVIDIA RTX 4070 · 12GB"],
        ["CPU", "AMD Ryzen 7 7700X"],
        ["RAM", "32 GB DDR5"],
        ["Storage", "1 TB NVMe Gen4"],
        ["Form factor", "Mini-ITX · 14L chassis"],
        ["OS", "Ubuntu 24.04 + Nucore Stack"]
      ]
    },
    {
      id: "nc-gpu-4090",
      name: "RTX 4090 · Nucore-Certified",
      category: "gpu",
      categoryLabel: "GPU",
      price: 1980,
      stock: 9,
      description: "A bare RTX 4090, intake-graded, repasted with PTM7950, and signed with a benchmark certificate. Drop into your existing rig.",
      longDescription: "Every certified 4090 ships with its individual benchmark report — sustained TFLOPS, junction temps, fan curve, undervolt offset. -17°C average thermal delta vs. stock.",
      specs: [
        ["VRAM", "24 GB GDDR6X"],
        ["TGP", "450W (configurable to 380W)"],
        ["Thermal pad", "PTM7950 · re-applied"],
        ["Undervolt", "-112mV verified stable"],
        ["Soak test", "24h FurMark + Llama 70B"],
        ["Box", "Signed certificate + benchmark PDF"]
      ]
    },
    {
      id: "nc-gpu-3090",
      name: "RTX 3090 · Refurbished + Certified",
      category: "gpu",
      categoryLabel: "GPU",
      price: 980,
      stock: 14,
      description: "Used 3090s, fully disassembled, re-pasted, re-padded, undervolted, and 24h soak-tested. The cheapest 24GB VRAM you can trust.",
      specs: [
        ["VRAM", "24 GB GDDR6X"],
        ["Status", "Refurbished · grade A"],
        ["Thermal", "PTM7950 + new memory pads"],
        ["Soak test", "24h"],
        ["Warranty", "1 year · Nucore-backed"]
      ]
    },
    {
      id: "nc-gpu-h100",
      name: "NVIDIA H100 80GB · PCIe",
      category: "gpu",
      categoryLabel: "GPU",
      price: 28500,
      stock: 2,
      description: "Datacenter-class H100 PCIe. Limited stock — for training and high-throughput inference workloads.",
      specs: [
        ["VRAM", "80 GB HBM3"],
        ["Form", "PCIe Gen5 · dual-slot"],
        ["TDP", "350W"],
        ["NVLink", "Bridge available on request"]
      ]
    },
    {
      id: "nc-lab-dual",
      name: "Nucore Lab · Dual-GPU Training Rig",
      category: "workstation",
      categoryLabel: "Workstation",
      price: 9990,
      stock: 2,
      description: "A dual-4090 (or dual-6000 Ada on request) training workstation in a quiet desk-side chassis. NVLink-ready, EPYC-powered.",
      longDescription: "Designed for fine-tuning and multi-GPU inference. Two RTX 4090s on a custom backplane with explicit airflow zoning, fed by an EPYC Genoa with 256GB ECC.",
      specs: [
        ["GPUs", "2 × RTX 4090 (or 2 × RTX 6000 Ada)"],
        ["CPU", "AMD EPYC 9354P · 32C"],
        ["RAM", "256 GB DDR5 ECC"],
        ["Storage", "4 TB NVMe + 16 TB NVMe scratch"],
        ["PSU", "1600W redundant"],
        ["Network", "10GbE + IPMI"]
      ]
    },
    {
      id: "nc-cluster-1u",
      name: "Nucore Cluster · 1U Inference Node",
      category: "workstation",
      categoryLabel: "Workstation",
      price: 14500,
      stock: 1,
      description: "Rack-ready 1U inference node — A100 40GB, dual EPYC, 25GbE. Drop into a 19\" rack and serve.",
      specs: [
        ["GPU", "NVIDIA A100 40GB"],
        ["CPU", "2 × EPYC 7443"],
        ["RAM", "512 GB DDR4 ECC"],
        ["Network", "Dual 25GbE SFP28"],
        ["Form", "1U · rail kit included"]
      ]
    },
    {
      id: "nc-phone-px",
      name: "Pixel 9 Pro · Privacy-Hardened",
      category: "phone",
      categoryLabel: "Phone",
      price: 1290,
      stock: 7,
      description: "A Pixel 9 Pro flashed with GrapheneOS, privacy-hardened, and verified. Carrier-unlocked, signed certification.",
      specs: [
        ["OS", "GrapheneOS (verified boot)"],
        ["Storage", "256 GB"],
        ["RAM", "16 GB"],
        ["Carrier", "Unlocked · global bands"],
        ["Cert", "Signed firmware hash"]
      ]
    },
    {
      id: "nc-phone-iph",
      name: "iPhone 15 Pro Max · Refurb",
      category: "phone",
      categoryLabel: "Phone",
      price: 1090,
      stock: 4,
      description: "Grade-A refurbished iPhone 15 Pro Max, battery >95%, full diagnostic report included.",
      specs: [
        ["Storage", "512 GB"],
        ["Battery", ">95% capacity"],
        ["Status", "Grade A · refurbished"],
        ["Carrier", "Unlocked"],
        ["Warranty", "1 year"]
      ]
    },
    {
      id: "nc-cpu-7950",
      name: "AMD Ryzen 9 7950X · Binned",
      category: "component",
      categoryLabel: "Component",
      price: 520,
      stock: 18,
      description: "Hand-binned 7950X chips — verified to hit a stable -30 PBO Curve Optimizer across all cores.",
      specs: [
        ["Cores", "16C / 32T"],
        ["Boost", "5.7 GHz verified"],
        ["Bin", "Top 15% of intake batch"],
        ["TDP", "170W"]
      ]
    },
    {
      id: "nc-ram-128",
      name: "DDR5-6000 ECC · 128 GB Kit",
      category: "component",
      categoryLabel: "Component",
      price: 640,
      stock: 22,
      description: "4× 32GB DDR5-6000 ECC kit, EXPO-verified at full speed on AM5 platforms.",
      specs: [
        ["Capacity", "128 GB (4 × 32 GB)"],
        ["Speed", "DDR5-6000 CL30"],
        ["ECC", "On-die + sideband"],
        ["Verified on", "AM5 / TRX50"]
      ]
    },
    {
      id: "nc-acc-cable",
      name: "Nucore 12VHPWR Cable · Reinforced",
      category: "accessory",
      categoryLabel: "Accessory",
      price: 49,
      stock: 80,
      description: "Replacement 12VHPWR cable with reinforced connector and verified pin tension. Fits all Nucore PSUs.",
      specs: [
        ["Gauge", "16 AWG"],
        ["Length", "650 mm"],
        ["Compatible", "ATX 3.0 PSUs (modular)"]
      ]
    },
    {
      id: "nc-acc-thermal",
      name: "PTM7950 Thermal Pad · 80×40 mm",
      category: "accessory",
      categoryLabel: "Accessory",
      price: 24,
      stock: 60,
      description: "The same phase-change thermal pad we apply in Layer 02. -10°C to -17°C on most GPUs vs. stock paste.",
      specs: [
        ["Material", "PTM7950 phase change"],
        ["Size", "80 × 40 × 0.2 mm"],
        ["Use", "GPU die · CPU IHS"]
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
