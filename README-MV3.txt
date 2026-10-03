Fika Manifest V3 personal build, version 0.9.12

INSTALL
Extract the entire ZIP to a permanent folder. Open chrome://extensions, enable
Developer mode, click Load unpacked, and select Fika-MV3 (the folder containing
manifest.json). Do not select the ZIP or its parent folder. Refresh existing web
tabs after installation. Pin Fika, then click its icon on an article, use the
Toggle Fika context menu, or press Alt+R (Option+R). Escape closes the reader.
Chrome internal pages and the Chrome Web Store cannot run content scripts.
No npm installation or build is needed. Keep the extracted folder in place.

MIGRATION
Replaced DOM/jQuery background page with a standalone service worker. All event
listeners register synchronously; context menus use onClicked/onInstalled.
Async messaging returns true and replies to the originating tab. Cache and photo
state persist in chrome.storage.local; preferences stay in chrome.storage.sync.
Converted browser_action to action, extension messaging to runtime, host
permissions and web accessible resources to MV3 format, and CSP to self-only.
Precompiled all reader/content/update templates so Chrome does not use eval.
Removed obsolete polyfill and jQuery dynamic evaluation. Corrected packaged font
URLs to work with the unpacked extension ID. No tabs.executeScript/insertCSS,
page_action, webRequest blocking or getBackgroundPage usage was present.
Automatic HTTP/HTTPS content scripts are retained; scripting permission is not
needed. Broad site access preserves article detection and automatic reading.

LIMITATIONS
Google sign-in and Fika server account upgrades/whitelist sync are unavailable:
the supplied manifest has no OAuth client ID. Autopilot preferences remain in
Chrome sync storage, and local reader settings work without an account.
Legacy Google Analytics remote code is removed. Optional background photos and
feedback still call the original Fika service; availability is not guaranteed.
Failures fall back to cached photos or an empty photo grid without blocking
reading. Solid colors and bundled fonts work offline. Old background-page
localStorage is not imported; this separately loaded copy has its own storage.

VALIDATION
See VALIDATION.txt for checks actually performed. Browser installation and
visual behavior require testing in your Chrome; static checks are not a
guarantee that every site works with Fika's original article extraction.

EDGE-CASE UPDATE
Code preserves literal HTML entities; wide code/tables scroll within the pane.
Semantic figure captions, photo credits, thumbnail figures and CORS-marked images
are retained. Static SVG graphics are preserved with active elements removed.
Nested heading indentation uses the existing h2 through h6 styles.

VERSION 0.9.4 — SUBSCRIPTION CONTROL FILTER
Removes small Add Us On widget groups (including their information icons),
Google preferred-source links and explicitly marked Google follow controls.
Article prose mentioning those words and semantic figure images, captions and
static SVG diagrams remain. Verified with controlled browser fixtures using
mocked extension APIs; the exact live People DOM has not been tested.
To update, replace your old extracted files with this folder and click Reload
on the Fika card at chrome://extensions, or remove the old copy and Load unpacked
the new Fika-MV3 folder containing manifest.json. Refresh your article tabs.

VERSION 0.9.12 — EMPTY GRAPHIC SPACING FIX
Drops hidden SVGs, icon SVGs inside controls, decorative SVGs, definition-only
sprite sheets, and SVGs left empty after external references are removed.
Static article diagrams with drawable shapes remain, along with images and
captions. Licenses and credits from the previous package are included.

VERSION 0.9.12 — AUTHOR ATTRIBUTION
Author-marked names are preserved instead of filtered as clutter. Standalone
comment-count controls (including duplicated counts) are removed; article prose
about comments remains. Earlier spacing fixes and license notices are included.

VERSION 0.9.12 — INTRODUCTION AND BYLINE SPACING
Identical consecutive opening text blocks are collapsed to one. Article media, captions and later prose are preserved. Inline bylines retain a space after by.

VERSION 0.9.12 — RESPONSIVE ARTICLE CLEANUP
Repeated opening descriptions, bylines, dates and disclosures are collapsed across the lead photo. Standalone comment counts, follow prompts, newsletters and recommendation sections are removed. Author-link spacing is restored. Article photos, captions, comics, diagrams and body prose remain.

VERSION 0.9.12 — RELATED LINKS AND FOOTER FOLLOW CONTROLS
Standalone Related link boxes are excluded from the article and table of contents. Footer follow-author/topic IDs are removed while preserving bylines, photo credits and ordinary article lists.

VERSION 0.9.12 — FEATURE ARTICLE CONTENT AND REOPENING
Editorial Key Facts boxes, feature bylines, photographer attribution and final article credits are preserved. Decorative drop caps use one readable copy. Reader close state resets, and cached readers reopen even after availability checks; navigation rebuilds from the restored source page.

VERSION 0.9.12 — FINAL READING-MODE PACKAGE
Carries forward the validated text, attribution, Key Facts, credits, drop-cap and reopening fixes from 0.9.10. This release updates version metadata and documents the chosen reading-mode behavior; it introduces no additional extraction changes.

VIDEOS AND ANIMATED FEATURES
The reader simplifies custom animated openings and does not guarantee preservation of videos or interactive media. Close Fika to view those on the original page. Article text, photos, captions and useful diagrams are retained where supported.

VALIDATION LIMITS
Saved-page and fixture tests use Chrome headless with mocked extension APIs. Live Chrome extension installation, actual video playback and every website are not fully verified.

VERSION 0.9.12 — ORIGINAL VIDEO LINK
Articles with detected native videos or YouTube/Vimeo embeds show a Watch video on original page link. A normal click opens the original article in a separate browser window and leaves Fika open at the current reading position. The browser controls whether a separate window or tab is used. Start playback with the original page's player. Custom players without discoverable video/iframe elements may not be detected. All previous text/content fixes remain.
