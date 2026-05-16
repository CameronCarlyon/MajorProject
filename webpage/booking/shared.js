export function addManagedEventListener(target, type, handler, options, cleanups) {
  if (!target || typeof target.addEventListener !== 'function') {
    return;
  }

  target.addEventListener(type, handler, options);
  cleanups.push(() => {
    target.removeEventListener(type, handler, options);
  });
}

export function runManagedCleanups(cleanups) {
  while (cleanups.length) {
    const cleanup = cleanups.pop();

    try {
      cleanup?.();
    } catch (error) {
      console.warn('Unable to clean up application listener.', error);
    }
  }
}