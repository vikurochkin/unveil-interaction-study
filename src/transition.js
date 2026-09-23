const wait = (schedule, milliseconds) => new Promise((resolve) => schedule(resolve, milliseconds));

export function createTransitionController({ document: doc, reducedMotion = false, navigate, duration = 1150, schedule = setTimeout }) {
  let active = false;
  return {
    async open(project, source) {
      if (active) return;
      active = true;
      if (reducedMotion) {
        navigate('/nto-stratus');
        active = false;
        return;
      }
      const rect = source?.getBoundingClientRect?.() ?? { left: innerWidth / 2 - 180, top: innerHeight / 2 - 100, width: 360, height: 200 };
      const sourceImage = source?.querySelector?.('img');
      const layer = doc.createElement('div');
      layer.className = 'shared-card';
      layer.style.setProperty('--start-left', `${rect.left}px`);
      layer.style.setProperty('--start-top', `${rect.top}px`);
      layer.style.setProperty('--start-width', `${Math.max(1, rect.width)}px`);
      layer.style.setProperty('--start-height', `${Math.max(1, rect.height)}px`);
      const image = doc.createElement('img');
      image.alt = '';
      image.src = sourceImage?.currentSrc || sourceImage?.src || `${project.image}?auto=format&fit=max&w=1600&q=90`;
      layer.append(image);
      doc.body.append(layer);
      source?.classList?.add('is-transition-source');
      doc.documentElement.dataset.transition = 'isolating';
      await wait(schedule, 18);
      layer.classList.add('is-centering');
      doc.documentElement.dataset.transition = 'centering';
      await wait(schedule, Math.max(0, duration * 0.56 - 18));
      navigate('/nto-stratus');
      doc.documentElement.dataset.transition = 'revealing';
      layer.classList.add('is-revealing');
      await wait(schedule, duration * 0.44);
      source?.classList?.remove('is-transition-source');
      layer.remove();
      delete doc.documentElement.dataset.transition;
      active = false;
    }
  };
}

