import { afterEach } from 'vitest';

if (!globalThis.PointerEvent) {
  globalThis.PointerEvent = class PointerEvent extends MouseEvent {
    constructor(type, init = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
    }
  };
}

afterEach(() => {
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('data-transition');
  history.replaceState({}, '', '/');
});
