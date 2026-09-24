const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;

export function wrapIndex(value, length) {
  if (!Number.isFinite(length) || length <= 0) return 0;
  return ((finite(value) % length) + length) % length;
}

export function getLoopedRelative(index, position, length) {
  const relative = finite(index) - finite(position);
  if (!Number.isFinite(length) || length <= 0) return relative;
  return wrapIndex(relative + length / 2, length) - length / 2;
}

export function getCardTransform(index, position, viewport = {}, pointer = {}, loopLength = 0) {
  const width = Math.max(1, finite(viewport.width, 1));
  const height = Math.max(1, finite(viewport.height, 1));
  const pointerX = Math.max(-1, Math.min(1, finite(pointer.x) / Math.max(1, width * 0.5)));
  const pointerY = Math.max(-1, Math.min(1, finite(pointer.y) / Math.max(1, height * 0.5)));
  const loopedRelative = getLoopedRelative(index, position, loopLength);
  const relative = Math.max(-12, Math.min(12, loopedRelative));
  const distance = Math.abs(relative);

  return {
    x: finite(relative * width * 0.135 + pointerX * 8),
    y: finite(relative * -height * 0.12 + pointerY * 6),
    z: relative === 0 ? 0 : finite(Math.max(-980, Math.min(620, relative * -140))),
    rotateX: finite(pointerY * -1.2),
    rotateY: finite(-30 + pointerX * 1.5),
    rotateZ: 0,
    scale: 1,
    opacity: finite(Math.max(0, 1 - Math.max(0, distance - 7) * 0.22))
  };
}
