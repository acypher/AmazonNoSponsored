# Amazon No Sponsored Listings

A Chrome extension (Manifest V3) that hides sponsored listings on Amazon search-result
pages (`https://www.amazon.com/s?k=...`), whatever the sort order.

## Install

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and choose this folder (the one containing `manifest.json`).
3. Refresh any open Amazon search tab.

After code changes, click the extension's reload icon in `chrome://extensions` and refresh the Amazon tab.

## What gets hidden

- Sponsored product cards in the results grid
- Sponsored carousels ("Customers frequently viewed", "Seen on social media",
  "Picks from Amazon Influencers", "Shop … by type") — the whole row, header included
- Sponsored video ads and brand banners (top, middle, "Brands related to your search")
- Ads in the left rail and below the results

Everything is hidden with CSS (`display: none`), not removed, so Amazon's own page scripts
and other extensions (e.g. *Amazon Sort by Price per Count / Ounce*) keep working.
Because the stylesheet is in place from `document_start`, ads don't flash before vanishing.

## How ads are recognised (`src/rules.js`)

A row of the results list is hidden if it has Amazon's `AdHolder` class, or contains any of:
`.puis-sponsored-label-text`, `.s-widget-sponsored-label-text`, `.puis-label-popover`,
a title with `aria-label="Sponsored Ad - …"`, or an `aria-label` mentioning
"Sponsored information" / "on Sponsored ad". As a fallback (for brand banners Amazon renders
client-side with hashed class names), a row containing an element whose entire text is
"Sponsored" is hidden too.

These markers were surveyed on six searches in Oct 2026; none appeared on an organic result.
If Amazon changes its markup and ads reappear, update `MARKERS` in `src/rules.js`.

## Tests

```
npm install
npm test
```

## Files

- `manifest.json` — MV3 manifest; content scripts only, no permissions requested.
- `src/rules.js` — the ad markers, the stylesheet, and row detection (no chrome.* APIs).
- `src/content.js` — injects the stylesheet and tags marker-less ads as the page changes.
