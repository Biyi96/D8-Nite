# Date Night

A playful, mobile-first web app that walks through a date-night itinerary one
"stop" at a time. Each stop has a full-screen hero with a rotating isometric
3D diorama of the venue, then a parallax scroll section with photos, arrive
and leave times, the menu and directions.

Everything date-specific lives in data files. A new date is a new data file
plus models and photos. No component changes.

```
/                     → redirects to the newest date
/dates/2026-10-10     → the date experience
/dates/2026-10-10#barbarella   → opens on a specific stop
```

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (also type-checks)
npm run lint
```

## Deploying (Vercel)

1. In Vercel, **Add New → Project → Import** `Biyi96/D8-Nite`. The defaults
   (Framework: Next.js, `npm run build`) are right; no environment variables
   are needed.
2. Set the production branch to `main`. Every push to `main` then deploys,
   and every other branch or PR gets its own preview URL.
3. Work on branches and merge to `main` when a change is approved.

## Adding a new date

1. Copy `content/dates/2026-10-10.ts` to `content/dates/<yyyy-mm-dd>.ts` and
   edit it. The shape is documented in `content/types.ts`:
   - `slug` (use the ISO date, so the newest sorts first), `title`,
     `dateLabel`, optional `intro` (landing paragraph) and `credit`.
   - `stops`: 2–6 stops, each with `id`, `eyebrow`, `name`, optional
     `headline` (line breaks for the big hero type), `venue`, `arrive`,
     `leave`, `bg`, `accent`, `model`, `blurb`, `address`, `menuUrl`,
     optional `menuLabel` / `menuImage`, `mapsUrl` and `photos`.
2. Register it in `content/dates/index.ts` (one import, one array entry).
   `/` redirects to the newest slug automatically.
3. Add models to `public/models/` and photos to `public/photos/<stop-id>/`.

`mapsUrl` is a Google Maps directions link:
`https://www.google.com/maps/dir/?api=1&destination=<url-encoded address>`.

## Swapping in a 3D model

Drop the file at the path in the stop's `model` field, e.g.
`public/models/red-room.glb`. That's it: until the file exists, the stop shows
a placeholder box room in its accent colour, and once it's there the GLB is
used instead (on the next build / deploy; immediately in `npm run dev`).

Model guidelines:

- **Format:** `.glb`, ideally Draco geometry + WebP textures. This is how
  `red-room.glb` was made from the Blender export (2.7 MB → 0.6 MB):

  ```bash
  npx @gltf-transform/cli optimize room.glb tmp.glb --compress draco \
    --texture-compress false --simplify false --instance false \
    --palette false --join false --flatten false
  npx @gltf-transform/cli webp tmp.glb public/models/red-room.glb --quality 90
  ```

  The Draco decoder is served locally from `public/draco/`. Baked/unlit
  materials (`KHR_materials_unlit`) render exactly as exported.
- **Orientation:** +Y up, with the room's open side facing **+X / +Z** (the
  camera looks down the (1, 1, 1) diagonal, a true isometric view). An
  isometric cube room reads as a hexagon, which the UI echoes.
- **Size / origin:** anything. Models are auto-centred and scaled to fit a
  unit cube.
- **Weight:** aim for under ~2 MB, with textures at 2048 px or smaller.
- If a GLB fails to load, the placeholder room is shown and a warning is
  logged; the page keeps working.

The next and previous stops' models are preloaded in the background.

## Photos

Put venue photos (`.jpg`, `.png`, `.webp`, `.avif`) in
`public/photos/<stop-id>/`. With `photos: []` in the data file, every image in
that folder is picked up automatically, sorted by filename (`01.jpg`,
`02.jpg`, …). The first photo is the full-bleed parallax background behind the
times; the next five go into the layered collage. Until photos exist, accent
coloured placeholders show where each one goes. Don't hotlink third-party
images.

## How it's built

- **Next.js 16** (App Router, static generation) + **TypeScript** +
  **Tailwind CSS 4**.
- **@react-three/fiber + drei** for the diorama (`OrthographicCamera`,
  `Float`, `useGLTF`). Where supported (Chrome, Edge, Firefox, Android) the
  scene renders in a **web worker on an OffscreenCanvas**, so three.js startup
  and every frame stay off the main thread. Safari uses a normal main-thread
  `<Canvas>`. Rendering pauses when the hero is scrolled out of view.
- **Framer Motion** for slide transitions (the colour wipe in `Backdrop`,
  headline in/out), scroll-linked parallax and in-view reveals.
- **Lenis** smooth scrolling. The parallax technique (a clip-path window over
  a fixed, scroll-shifted image) follows
  [olivierlarose/background-image-parallax](https://github.com/olivierlarose/background-image-parallax),
  reimplemented here, with the same libraries (Framer Motion + Lenis).
- Bubbles, floating labels and the scroll cue are pure CSS. The ambient
  soundscape is synthesised with Web Audio (no audio file) and is off until
  the sound-bars button is tapped.
- `prefers-reduced-motion` turns off parallax, sway/float, bubbles and smooth
  scrolling, and keeps simple fades.

```
content/            date data + types (edit these)
public/models/      GLBs
public/photos/      venue photos per stop id
public/draco/       Draco decoder (from three.js)
src/app/            routes
src/components/     DateExperience (state + layout), Hero, StopDetails,
                    HeroStage (3D layer), three/ (scene, worker), chrome/
src/lib/            data loading, iso camera maths, ambient audio
```

## Typography

The display face is **Bodoni Moda** (Google Fonts) at its largest optical
size, for the hairline, high-contrast didone look. **Italiana** is loaded as
an alternative: switch `--font-display` in `src/app/globals.css` to try it.
Neither has true swash capitals. For the looping flourishes in the reference,
licensed options with swash alternates include **Roxborough CF**, **Ogg**
(Sharp Type) and **PP Editorial New**. Any of them can be dropped in via
`next/font/local`. Body and UI text is **Inter**.
