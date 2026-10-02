// Fixtures are trimmed copies of the markup amazon.com served in Oct 2026.
const test = require('node:test');
const assert = require('node:assert');
const { parseHTML } = require('linkedom');
const NSP = require('../src/rules.js');

const ROWS = {
  organic: `<div data-component-type="s-search-result" class="s-result-item s-asin" data-asin="B001N0UIWQ">
      <h2 aria-label="luxardo The Original Maraschino Cherries"><span>luxardo | The Original Maraschino Cherries</span></h2>
      <span class="a-badge-text">Overall Pick</span></div>`,
  organicBestSeller: `<div data-component-type="s-search-result" class="s-result-item s-asin" data-asin="B07YSY6NN5">
      <span class="a-badge-text">Best Seller</span><h2><span>PENINSULA PREMIUM Cocktail Cherries</span></h2></div>`,
  sponsoredCard: `<div data-component-type="s-search-result" class="s-result-item s-asin AdHolder" data-asin="B0CYP1ZS3K">
      <span class="puis-label-popover-default"><span class="a-color-secondary">Sponsored</span></span>
      <h2 aria-label="Sponsored Ad - luxardo Gourmet Cocktail Maraschino Cherries"><span>Gourmet Cocktail Maraschino Cherries</span></h2></div>`,
  sponsoredCardNoAdHolder: `<div data-component-type="s-search-result" class="s-result-item s-asin" data-asin="B0X">
      <a class="puis-label-popover" aria-label="View Sponsored information or leave ad feedback"><span>Sponsored</span></a></div>`,
  carousel: `<div class="s-result-item s-widget"><div cel_widget_id="MAIN-FEATURED_ASINS_LIST-30">
      <span>Customers frequently viewed</span>
      <a class="a-link-normal aok-inline-block s-widget-sponsored-label-text" aria-label="View Sponsored information or leave ad feedback">Sponsored</a></div></div>`,
  shoppingAdviser: `<div class="s-result-item s-widget"><div cel_widget_id="MAIN-SHOPPING_ADVISER-11">
      <span>Shop dog food by type</span><h2 aria-label="Sponsored Ad - Open Farm RawMix Dry Dog Food"><span>Open Farm</span></h2></div></div>`,
  video: `<div class="s-result-item s-widget"><div cel_widget_id="MAIN-VIDEO_SINGLE_PRODUCT-28">
      <div class="puis-sponsored-label-text"><span class="a-size-mini a-color-secondary">Sponsored</span></div></div></div>`,
  brandBanner: `<div class="s-result-item s-flex-full-width s-widget">
      <div class="_c2Itd_adFeedback_2qi7N"><a class="_c2Itd_ad-feedback-primary-link_2bIZi" aria-label="Leave feedback on Sponsored ad">
      <span class="_c2Itd_ad-feedback-text-desktop_q3xp_">Sponsored</span></a></div><span>FILTHY® premium black cherries</span></div>`,
  brandBannerTextOnly: `<div class="s-result-item s-flex-full-width s-widget">
      <span>FILTHY® premium black cherries</span><span class="_x_label">Sponsored</span></div>`,
  footerBrands: `<div class="s-result-item s-widget AdHolder s-flex-full-width"><span>Brands related to your search</span></div>`,
  resultsHeader: `<div class="s-result-item s-flex-full-width" cel_widget_id="MAIN-MESSAGING-0"><h2>Results</h2><span>Check each product page for other buying options.</span></div>`,
  relatedSearches: `<div class="s-result-item s-widget"><span>Related searches</span><a>luxardo cherries for old fashioned</a></div>`,
  // A product whose title merely mentions the word is not an ad.
  titleMentionsWord: `<div data-component-type="s-search-result" class="s-result-item s-asin" data-asin="B0Y">
      <h2 aria-label="Sponsored by Nobody: A Novel"><span>Sponsored by Nobody: A Novel</span></h2></div>`,
  scriptMentionsWord: `<div class="s-result-item"><script>var x = "Sponsored";</script><span>Pagination</span></div>`,
};

function page() {
  const html = `<html><body><div id="search"><div class="s-main-slot">${Object.entries(ROWS)
    .map(([k, v]) => v.replace(/^<div/, `<div data-k="${k}"`)).join('')}</div></div></body></html>`;
  return parseHTML(html).document;
}

test('hides every kind of sponsored row', () => {
  const hidden = NSP.sponsoredRows(page()).map((r) => r.getAttribute('data-k')).sort();
  assert.deepStrictEqual(hidden, [
    'brandBanner', 'brandBannerTextOnly', 'carousel', 'footerBrands', 'shoppingAdviser',
    'sponsoredCard', 'sponsoredCardNoAdHolder', 'video',
  ]);
});

test('organic results and page furniture stay', () => {
  const doc = page();
  for (const k of ['organic', 'organicBestSeller', 'resultsHeader', 'relatedSearches', 'titleMentionsWord', 'scriptMentionsWord']) {
    assert.strictEqual(NSP.isSponsoredRow(doc.querySelector(`[data-k="${k}"]`)), false, k);
  }
});

test('stylesheet hides marker rows, AdHolder anywhere in #search, and tagged rows', () => {
  const css = NSP.buildCss();
  assert.match(css, /#search \.AdHolder/);
  assert.match(css, /\[data-nsp-hidden\]/);
  for (const m of NSP.MARKERS) assert.ok(css.includes(m), m);
  assert.match(css, /\.s-main-slot > div:has\(/);
  assert.match(css, /display: none !important/);
});
