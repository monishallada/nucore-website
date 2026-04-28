# Marketplace product photos

Drop real product photos into this folder. The marketplace page loads them
automatically — no code changes needed. If a file isn't here, the page falls
back to a stylized SVG illustration so nothing breaks.

## Filename rules

For each product, the page tries these filenames in order:

```
{product-id}.jpg   ← primary photo (shown on the card and as the main modal image)
{product-id}.png
{product-id}.webp
```

For the modal gallery, two additional angles are loaded:

```
{product-id}-2.jpg ← second angle (or .png / .webp)
{product-id}-3.jpg ← third angle  (or .png / .webp)
```

If `-2` or `-3` is missing, that thumb falls back to the SVG illustration.

## Image guidelines

- **Aspect ratio**: target 4:3 or 16:11 (cards crop to 16:11; modal main is 4:3).
- **Resolution**: at least 1200×900 px for crisp display on retina screens.
- **Background**: dark or transparent works best with the Nucore theme; pure
  white backgrounds will work but will look like a stock listing.
- **Format**: JPG for photos, PNG/WebP if you need transparency.

## Filenames to add

### Nucore PCs
- `nc-pro-tower.jpg` — Nucore Pro Tower · NU-RTX4090 AI Workstation
- `nc-studio-tower.jpg` — Nucore Studio Tower · NU-7900XTX Creative
- `nc-lite-tower.jpg` — Nucore Lite Tower · NU-RTX4070 Compact

### Nucore GPUs
- `nc-gpu-rtx4090.jpg` — Nucore NU-RTX4090 · 24GB
- `nc-gpu-rtx3090.jpg` — Nucore NU-RTX3090 · 24GB
- `nc-gpu-h100.jpg` — Nucore NU-H100 · 80GB Datacenter
- `nc-gpu-rtx6000.jpg` — Nucore NU-RTX6000A · 48GB Pro

### Nucore Workstations
- `nc-lab-dual.jpg` — Nucore Lab · Dual NU-RTX4090 Training Rig
- `nc-cluster-1u.jpg` — Nucore Cluster · 1U NU-A100 Inference Node

### Nucore Phones
- `nc-phone-px.jpg` — Nucore PX-9 · Hardened Mobile
- `nc-phone-iph.jpg` — Nucore IX-15 Pro · Engineered Mobile

### Nucore Silicon
- `nc-cpu-7950.jpg` — Nucore-Binned Ryzen 9 7950X
- `nc-ram-128.jpg` — Nucore-Tuned DDR5-6000 ECC · 128 GB

### Nucore Accessories
- `nc-acc-cable.jpg` — Nucore 12VHPWR Cable · Reinforced
- `nc-acc-thermal.jpg` — Nucore PTM7950 Pad · 80×40 mm

For gallery angles, append `-2` or `-3` before the extension, e.g.
`nc-pro-tower-2.jpg`, `nc-pro-tower-3.jpg`.
