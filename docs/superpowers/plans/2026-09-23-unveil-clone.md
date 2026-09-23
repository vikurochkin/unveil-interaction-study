# UNVEIL® Two-Page Clone Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publicly deploy a responsive recreation of the UNVEIL® homepage plus the NTO / Stratus project page, including the shared-card route transition.

**Architecture:** A Vite-powered static SPA renders two routes. Pure modules own routing, 3D scene math, transition phases, and video time formatting; the DOM coordinator binds them to responsive CSS and browser input. Public UNVEIL® media URLs preserve the requested project content without a backend.

**Tech Stack:** HTML5, modern JavaScript modules, CSS 3D transforms, Vite, Vitest, jsdom, GitHub, Vercel

**Spec:** `docs/superpowers/specs/2026-09-23-unveil-clone-design.md`

## Global Constraints

- Public routes are `/` and `/nto-stratus`; Vercel must rewrite direct project visits to `index.html`.
- The selected project is NTO / Stratus and must use the original title, description, poster, 4:33 Mux video, and six stills.
- All homepage cards use real button semantics and every interactive control is keyboard reachable.
- UI typography is 10.5px uppercase with 0.015em tracking on a `#fafafa` canvas.
- Motion is responsive to wheel, pointer drag, and touch, with a reduced-motion crossfade fallback.
- Every production JavaScript behavior is introduced only after a failing test proves the missing behavior.

## Review Focus

- A direct `/nto-stratus/` URL with a trailing slash renders the project page instead of falling through to home.
- A scene position far outside the card range wraps safely and never yields `NaN` transforms.
- Touch and mouse drags ending without movement do not trigger runaway inertia.
- Missing or blocked video playback leaves the poster and project content usable.
- Reduced-motion users navigate without the scale/zoom transition while the route still changes.

---

### Task 1: Tooling and Pure Navigation/Scene Contracts

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/router.js`
- Create: `src/scene.js`
- Create: `src/utils.js`
- Create: `tests/router.test.js`
- Create: `tests/scene.test.js`
- Create: `tests/utils.test.js`

**Interfaces:**
- Produces: `normalizePath(pathname): '/' | '/nto-stratus'`
- Produces: `createRouter(windowLike): { path, navigate(path), subscribe(fn), destroy() }`
- Produces: `wrapIndex(value, length): number`
- Produces: `getCardTransform(index, position, viewport, pointer): CardTransform`
- Produces: `formatTime(seconds): string`

- [ ] **Step 1: Add package/tooling files and failing contract tests**

```js
import { expect, test } from 'vitest';
import { normalizePath } from '../src/router.js';

test('normalizes a trailing-slash project URL', () => {
  expect(normalizePath('/nto-stratus/')).toBe('/nto-stratus');
});
```

Scene tests use literal expected values for centered, neighboring, wrapped, and finite far-range positions. Utility tests assert `formatTime(273) === '4:33'` and negative/non-finite values return `0:00`.

- [ ] **Step 2: Run tests and verify missing-module failures**

Run: `pnpm test -- --run tests/router.test.js tests/scene.test.js tests/utils.test.js`
Expected: FAIL because the production modules do not exist.

- [ ] **Step 3: Implement minimal pure modules**

`normalizePath` strips query/hash/trailing slash and recognizes only the copied project route. `getCardTransform` calculates finite x/y/z/rotation/scale/opacity values from a wrapped relative index. `createRouter` uses `history.pushState` and one `popstate` listener.

- [ ] **Step 4: Run the full unit suite**

Run: `pnpm test -- --run`
Expected: PASS with all Task 1 tests green.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml index.html src/router.js src/scene.js src/utils.js tests
git commit -m "feat: add navigation and scene foundations"
```

### Task 2: Homepage Tunnel and Responsive Interface

**Files:**
- Create: `src/data.js`
- Create: `src/home.js`
- Create: `src/overlays.js`
- Create: `src/styles.css`
- Create: `public/favicon.svg`
- Create: `tests/home.test.js`
- Create: `tests/overlays.test.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: `getCardTransform`, `createRouter`
- Produces: `PROJECTS`, `NTO_PROJECT`, `renderHome(root, options)`, `createOverlayController(document)`

- [ ] **Step 1: Write failing DOM behavior tests**

```js
test('renders every project as a named button and selects NTO Stratus', () => {
  const root = document.createElement('main');
  const selected = [];
  const view = renderHome(root, { onSelect: project => selected.push(project.slug) });
  const button = root.querySelector('[data-project="nto-stratus"]');
  expect(button.getAttribute('aria-label')).toContain('NTO / Stratus');
  button.click();
  expect(selected).toEqual(['nto-stratus']);
  view.destroy();
});
```

Additional tests assert wheel updates target position, pointer-up without movement keeps finite velocity, Index opens a dialog-like list, Escape closes it, and Contact exposes original links.

- [ ] **Step 2: Verify the homepage tests fail for missing behavior**

Run: `pnpm test -- --run tests/home.test.js tests/overlays.test.js`
Expected: FAIL because `home.js` and `overlays.js` do not exist.

- [ ] **Step 3: Implement homepage rendering and input controller**

Render 40+ original project thumbnails from `data.js`; update CSS custom properties from `requestAnimationFrame`; bind wheel, pointer, keyboard arrows, and touch-compatible Pointer Events; make NTO / Stratus initially reachable near the center; lazy-load distant images.

- [ ] **Step 4: Implement original UI shell and responsive CSS**

Add fixed glass header, intro counter, Overview/Index switch, contact overlay, index rows, project labels, desktop/mobile card sizing, pointer parallax, focus styles, reduced-motion rules, and a site-specific `U®` favicon.

- [ ] **Step 5: Run the suite and production build**

Run: `pnpm test -- --run && pnpm build`
Expected: PASS; Vite writes `dist/index.html` and asset bundles.

- [ ] **Step 6: Commit**

```bash
git add src public index.html tests
git commit -m "feat: recreate the UNVEIL project tunnel"
```

### Task 3: Shared-Card Transition and NTO / Stratus Page

**Files:**
- Create: `src/transition.js`
- Create: `src/project.js`
- Create: `src/video-player.js`
- Create: `src/app.js`
- Create: `tests/transition.test.js`
- Create: `tests/project.test.js`
- Create: `tests/video-player.test.js`
- Modify: `src/styles.css`
- Modify: `index.html`

**Interfaces:**
- Consumes: `NTO_PROJECT`, `renderHome`, `createRouter`, `formatTime`
- Produces: `createTransitionController({ document, reducedMotion, navigate })`
- Produces: `renderProject(root, project, options)`
- Produces: `createVideoPlayer(video, controls)`

- [ ] **Step 1: Write failing transition, project, and player tests**

```js
test('reduced motion navigates without entering zoom phases', async () => {
  const phases = [];
  const controller = createTransitionController({
    document,
    reducedMotion: true,
    navigate: path => phases.push(path)
  });
  await controller.open({ slug: 'nto-stratus' }, document.createElement('button'));
  expect(phases).toEqual(['/nto-stratus']);
  expect(document.documentElement.dataset.transition).toBeUndefined();
});
```

Project tests assert the exact title/description, poster, six stills, next-project label, and home navigation. Player tests assert 4:33 formatting, play/pause state, mute state, and graceful rejected playback.

- [ ] **Step 2: Verify these tests fail for missing production modules**

Run: `pnpm test -- --run tests/transition.test.js tests/project.test.js tests/video-player.test.js`
Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Implement the shared-card state machine**

Clone the selected card into a fixed transition layer, measure its start rectangle, fade siblings, animate to centered landscape size, update history at the midpoint, render the project route, then expand/crossfade into the poster. Use `Element.animate` where available and deterministic class/time fallbacks in jsdom.

- [ ] **Step 4: Implement project gallery and custom player**

Render the original NTO copy and media; use the public Mux MP4 with the original poster; bind buttons, time updates, keyboard activation, fullscreen, lazy image loading, and error fallback.

- [ ] **Step 5: Wire application startup and route changes**

`app.js` creates the router, renders the current route, connects header/overlays, coordinates transitions, and destroys route-specific listeners before replacement.

- [ ] **Step 6: Run suite and build**

Run: `pnpm test -- --run && pnpm build`
Expected: PASS with no failed tests and a successful production build.

- [ ] **Step 7: Commit**

```bash
git add src index.html tests
git commit -m "feat: add NTO Stratus page and route transition"
```

### Task 4: Deployment, Browser Verification, and Publication

**Files:**
- Create: `vercel.json`
- Create: `README.md`
- Modify: files implicated by browser verification failures only

**Interfaces:**
- Consumes: production `dist/` build
- Produces: GitHub repository URL and verified Vercel production URL

- [ ] **Step 1: Add failing deploy-configuration test**

```js
test('rewrites direct project requests to the SPA entry', () => {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
  expect(config.rewrites).toContainEqual({ source: '/nto-stratus', destination: '/index.html' });
});
```

- [ ] **Step 2: Verify the configuration test fails, then add Vercel config and README**

Run: `pnpm test -- --run tests/deployment.test.js`
Expected: first FAIL because `vercel.json` is missing, then PASS after implementation.

- [ ] **Step 3: Run full fresh verification**

Run: `pnpm test -- --run && pnpm build`
Expected: all tests pass and build exits 0.

- [ ] **Step 4: Browser smoke test**

Serve `dist`, then verify at 1280×720 and 390×844: intro completes, tunnel moves, NTO card selection navigates with isolation/scale animation, project copy/media render, controls work, Home returns, Index/Contact open and close, reduced-motion route works, and no console errors occur.

- [ ] **Step 5: Commit the verified release**

```bash
git add vercel.json README.md tests src
git commit -m "chore: prepare the UNVEIL clone for deployment"
```

- [ ] **Step 6: Publish and verify**

Create a GitHub repository, push the branch, attach the repository to Vercel, deploy production, wait for success, and open the public URL. Verify `/` and `/nto-stratus` both return the application.
