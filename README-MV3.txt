Fika Manifest V3 personal build, version 0.9.4

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
