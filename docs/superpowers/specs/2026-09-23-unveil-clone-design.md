# UNVEIL® Two-Page Clone Design

## Intent

Build a faithful, responsive recreation of the public UNVEIL® homepage and one project page so the result can be opened from a public Vercel URL. The copied project is **NTO / Stratus**, available at `/nto-stratus`. The defining success condition is that selecting its card on the homepage reproduces the original transition: the surrounding image tunnel disappears, the chosen card isolates in the center, scales to a landscape hero, and resolves into the project page.

## Scope

- Homepage at `/` with the fixed four-cell header, 3D project-card tunnel, Overview/Index toggle, contact overlay, intro loader, pointer parallax, wheel navigation, drag navigation, touch navigation, hover/focus state, and reduced-motion fallback.
- Project page at `/nto-stratus` with the original title, description, 4:33 hero video, six image blocks, player controls, next-project tile, fixed header, contact overlay, and responsive layout.
- Same-site navigation is client-side and uses the shared selected card as the transition element.
- Desktop and mobile layouts follow the original breakpoints and proportions observed at 1280×720 and 390×844.
- Public source repository on GitHub and production deployment on Vercel.

## Visual System

- Canvas: `#fafafa`; text: black; border opacity: 13%; panel fill opacity: 3%.
- Typography: NB International Pro Regular loaded from the public site asset, with Arial/system sans-serif fallback. UI copy is 10.5px, uppercase, with 0.015em tracking.
- Header: 4px outer inset, four 25% cells on mobile and 200/126/126/126px cells on desktop. Each cell is 58px high, rounded 6px, translucent, blurred, and hairline outlined.
- Homepage cards are rectangular images in a single perspective scene. Their centers follow a descending diagonal/sine path through depth, overlap with natural source ratios, and react gently to pointer position. The active card is centered; neighboring cards extend beyond the viewport in both directions.
- Project header copy sits below the fixed navigation in a 200px/remaining desktop grid and a stacked mobile layout. Media begins at roughly 260px on desktop.

## Homepage Behavior

1. On first visit, a white intro layer shows an incrementing percentage and then fades away as the header and tunnel appear.
2. Wheel, trackpad, drag, and touch update a continuous scene position with eased inertia. Cards move along the same 3D path instead of snapping abruptly.
3. Pointer movement adds small scene parallax and card rotation. Hovering a card slightly emphasizes it and shows its project label.
4. Clicking the NTO / Stratus card starts a roughly 1.15-second shared-card transition:
   - controls and non-selected cards fade quickly;
   - the selected card first isolates near its current position;
   - it moves to the exact viewport center and loses perspective tilt;
   - it expands to the project hero aspect ratio;
   - history changes to `/nto-stratus`, project chrome fades in, and the image crossfades to the video poster.
5. Other cards remain navigable for demonstration but route through the same transition to the copied NTO / Stratus page, matching the user's requirement that any selection produce the same transition while only one project page is implemented.
6. Index switches to a full-screen project list overlay and allows selecting the same project transition from a row.
7. Contact opens a blurred full-screen overlay with the original contact links and legal footer.

## Project Behavior

- The hero begins with the original NTO poster and lazy-loads the public Mux MP4 when playback is requested or autoplay is allowed.
- Custom controls expose play/pause, current time/duration, mute/unmute, and fullscreen. Controls fade when the pointer is idle and stay available for keyboard/touch users.
- The six original project stills follow a full-width hero, then a responsive two-column grid on desktop and a single column on mobile.
- A next-project block labelled `SPELLS / NEXT PROJECT` appears after the gallery.
- Clicking the UNVEIL® Projects brand returns to `/` with a short reverse fade.

## Architecture

- Vite provides development/build tooling and static output.
- `src/data.js` contains immutable project/card metadata and NTO media URLs.
- `src/router.js` owns path normalization, history updates, and route subscriptions.
- `src/scene.js` owns homepage position physics and pure card-layout calculations.
- `src/transition.js` owns shared-card transition phases and classes.
- `src/video-player.js` owns the custom media-control state.
- `src/app.js` renders the two routes and coordinates the modules.
- `src/styles.css` contains the responsive visual system and animation keyframes.

## Accessibility and Failure Handling

- Every card is a real button with an accessible project name.
- All header, overlay, player, and route controls are keyboard reachable with visible focus.
- Escape closes overlays; the mobile menu state never traps focus.
- `prefers-reduced-motion` removes inertia and replaces the project transition with a short crossfade.
- Images use lazy loading outside the first viewport and retain stable aspect ratios.
- If the hero video cannot load, the poster remains visible and the page content stays usable.
- Direct visits and reloads on `/nto-stratus` are rewritten to the SPA entry by Vercel.

## Verification

- Unit tests cover route normalization, scene layout bounds, wrapping, duration formatting, and transition state changes.
- Browser tests cover the intro, homepage controls, card selection, route transition, detail content, custom video controls, back navigation, mobile layout, and reduced motion.
- Final checks: full test suite, production build, local browser smoke test at desktop/mobile widths, deployment status, and deployed URL response.

## Intellectual Property Note

This is a study/recreation using public UNVEIL® copy and public media endpoints at the user's request. The deployed footer will identify it as an independent recreation and link to the original site; no ownership of the UNVEIL® brand or project media is asserted.
