const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;

export function wrapIndex(value, length) {
  if (!Number.isFinite(length) || length <= 0) return 0;
  return ((finite(value) % length) + length) % length;
}

export function getCardTransform(index, position, viewport = {}, pointer = {}) {
  const width = Math.max(1, finite(viewport.width, 1));
  const height = Math.max(1, finite(viewport.height, 1));
  const pointerX = Math.max(-1, Math.min(1, finite(pointer.x) / Math.max(1, width * 0.5)));
  const pointerY = Math.max(-1, Math.min(1, finite(pointer.y) / Math.max(1, height * 0.5)));
  const relative = Math.max(-12, Math.min(12, finite(index) - finite(position)));
  const distance = Math.abs(relative);

  return {
    x: finite(relative * width * 0.17 + pointerX * (18 + distance * 2)),
    y: finite(relative * -height * 0.16 + Math.sin(relative * 0.78) * height * 0.045 + pointerY * 14),
    z: distance === 0 ? 0 : finite(-distance * 118),
    rotateX: finite(pointerY * -1.8),
    rotateY: finite(relative * -2.4 + pointerX * 2.2),
    rotateZ: finite(relative * -0.7),
    scale: finite(Math.max(0.48, 1 - distance * 0.045)),
    opacity: finite(Math.max(0, 1 - Math.max(0, distance - 7) * 0.22))
  };
}
