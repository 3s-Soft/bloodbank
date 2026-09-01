# Brand assets

Source artwork for **Bangladesh Blood Bank**. Nothing here is served — this
directory sits outside `public/` on purpose, so the multi-megabyte originals are
not shipped to the CDN.

| File | What it is |
|---|---|
| `logo-dark-source.png` | Full lockup on a near-black ground, 1254×1254. The master. |
| `logo-light-source.png` | Same lockup on white, for print and light backgrounds. |
| `logo-light.png` | 640×640 export of the light lockup. |

## Regenerating the served assets

Everything under `public/icons/` and the logo files in `public/assets/` are
derived from `logo-dark-source.png`. The emblem is cropped out of the lockup
first, because the wordmark is illegible below about 96px and the icons render
at 32px:

```
extract({ left: 272, top: 95, width: 716, height: 675 })
```

The generated set is:

| Path | Source | Notes |
|---|---|---|
| `public/assets/logo-mark.png` | emblem | 512×512. Navbar, footers, page headers. |
| `public/assets/logo.png` | full lockup | 400×400. |
| `public/assets/favicon.png` | emblem | 64×64. |
| `public/assets/og-image.jpg` | full lockup | 1200×630, the ratio Facebook and X crop to. |
| `public/icons/icon-32x32.png` | emblem | Browser tab. |
| `public/icons/icon-192x192.png` | emblem | PWA. |
| `public/icons/icon-512x512.png` | emblem | PWA. |
| `public/icons/icon-maskable-512x512.png` | emblem | 20% padding, or Android crops the circle. |
| `public/apple-touch-icon.png` | emblem | 180×180. |

Regenerate with `sharp`, which is already a dependency. Keep the background at
`rgb(6, 6, 7)` — sampled from the source corner — so padded areas match the
artwork rather than the site's slate-950.

## Colours

Taken from the logo, and used in the wordmark rendered in markup:

- Red `#ef4444` (Tailwind `red-500`)
- Green `#10b981` (Tailwind `emerald-500`)
- Ground `#020617` (Tailwind `slate-950`)

The per-tenant `primaryColor` column overrides the red for an organization's own
pages; it does not affect the platform logo.
