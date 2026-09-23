const PROJECT_PATH = '/nto-stratus';

export function normalizePath(input = '/') {
  const value = String(input || '/').split(/[?#]/, 1)[0];
  const cleaned = value.length > 1 ? value.replace(/\/+$/, '') : value;
  return cleaned === PROJECT_PATH ? PROJECT_PATH : '/';
}

export function createRouter(windowLike) {
  const listeners = new Set();
  let currentPath = normalizePath(windowLike.location.pathname);

  const publish = () => {
    currentPath = normalizePath(windowLike.location.pathname);
    listeners.forEach((listener) => listener(currentPath));
  };

  const onPopState = () => publish();
  windowLike.addEventListener('popstate', onPopState);

  return {
    get path() {
      return currentPath;
    },
    navigate(path, { replace = false } = {}) {
      const nextPath = normalizePath(path);
      if (replace) {
        windowLike.history.replaceState({}, '', nextPath);
      } else if (nextPath !== currentPath) {
        windowLike.history.pushState({}, '', nextPath);
      }
      currentPath = nextPath;
      listeners.forEach((listener) => listener(currentPath));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy() {
      listeners.clear();
      windowLike.removeEventListener('popstate', onPopState);
    }
  };
}

