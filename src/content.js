/*
 * Hides sponsored listings on amazon.com search results.
 *
 * 1. At document_start a stylesheet hides everything matching Amazon's ad markers, so ads
 *    never flash on screen (CSS :has() also covers rows Amazon renders or re-renders later).
 * 2. A MutationObserver catches the few ads that carry no marker, only the word "Sponsored",
 *    and tags their row with data-nsp-hidden.
 * Elements are hidden, never removed, so Amazon's own scripts keep working.
 */
(() => {
  'use strict';
  const NSP = globalThis.NSP;

  const style = document.createElement('style');
  style.id = 'nsp-style';
  style.textContent = NSP.buildCss();
  (document.head || document.documentElement).appendChild(style);

  let timer = null;
  function sweep() {
    timer = null;
    for (const row of NSP.sponsoredRows(document)) {
      if (!row.hasAttribute('data-nsp-hidden')) row.setAttribute('data-nsp-hidden', '');
    }
  }
  const schedule = () => { if (!timer) timer = setTimeout(sweep, 100); };

  const start = () => {
    sweep();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
