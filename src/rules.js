/*
 * What counts as "sponsored" on an Amazon search-results page.
 * Pure logic (no chrome.* APIs) so it can be tested in Node with a DOM shim.
 *
 * Markers were surveyed on amazon.com in Oct 2026 (luxardo cherries, paper towels,
 * wireless headphones, dog food, olive oil, batteries aa); none of them appeared on any
 * organic result card.
 */
(() => {
  'use strict';

  // Elements that only ever appear inside an ad.
  const MARKERS = [
    '.puis-sponsored-label-text',           // "Sponsored" on product cards and video ads
    '.s-widget-sponsored-label-text',       // "Sponsored" in carousel headers ("Customers frequently viewed")
    '.puis-label-popover',                  // the Sponsored-info popover link on product cards
    '[aria-label^="Sponsored Ad -"]',       // titles of sponsored products, incl. inside carousels
    '[aria-label*="Sponsored information"]',// "View Sponsored information or leave ad feedback"
    '[aria-label*="on Sponsored ad"]',      // "Leave feedback on Sponsored ad" (brand banners)
  ];

  // Top-level rows of the results list. Hiding the whole row removes a sponsored carousel,
  // brand banner or video block along with its header instead of leaving an empty frame.
  const ROW = '.s-main-slot > div';

  function buildCss() {
    const has = MARKERS.join(', ');
    return [
      // Amazon's own ad wrapper class: sponsored cards, top/bottom brand banners, left-rail ads.
      '#search .AdHolder',
      `${ROW}:has(${has})`,
      `[data-nsp-hidden]`,
    ].join(',\n') + ' {\n  display: none !important;\n}\n';
  }

  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);

  // Fallback for ads whose markup doesn't carry any of the markers (e.g. brand banners that
  // Amazon renders client-side with hashed class names): a leaf whose whole text is "Sponsored".
  function hasSponsoredText(el) {
    for (const e of el.querySelectorAll('span, a, div, p, h2, h3, h4')) {
      if (e.childElementCount !== 0) continue;
      if (SKIP.has(e.parentElement && e.parentElement.tagName)) continue;
      if (/^\s*Sponsored\s*$/.test(e.textContent)) return true;
    }
    return false;
  }

  function isSponsoredRow(row) {
    if (row.classList.contains('AdHolder')) return true;
    if (row.querySelector(MARKERS.join(', '))) return true;
    return hasSponsoredText(row);
  }

  /** Rows of the results list that are ads. */
  function sponsoredRows(doc) {
    return [...doc.querySelectorAll(ROW)].filter(isSponsoredRow);
  }

  const api = { MARKERS, ROW, buildCss, isSponsoredRow, sponsoredRows, hasSponsoredText };
  globalThis.NSP = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
