# Fika Reader Mode — Manifest V3

Unofficial personal adaptation of [Fika-Chrome](https://github.com/yuiitsu/Fika-Chrome), version 0.9.14. Original project credits: onlyfu, yuiitsu and contributors.

Fika simplifies article pages, offers themes and fonts, and generates a heading-based table of contents. Extraction varies by website. It is not a tracker or cookie blocker.

## Install
1. Download and extract the ZIP.
2. Open chrome://extensions and enable Developer mode.
3. Choose Load unpacked and select the folder containing manifest.json.
4. Refresh your article tabs. Click Fika or press Alt+R; Escape closes it.

No build or dependency installation is required. Google sign-in and Fika account services are unavailable. Optional photos and feedback depend on the original remote service. See README-MV3.txt and VALIDATION.txt for details and test limitations.

## Credits and licensing
The original package declares ISC. This adaptation restores that declaration and includes standard ISC text in LICENSE, with provenance in THIRD_PARTY_NOTICES.md. Bundled libraries and fonts retain their own licenses in licenses/. The npm private flag does not control GitHub repository visibility.

## GitHub Desktop
Copy this folder's contents into your Fika-MV3 repository, replacing matching files. Keep the repository's existing .git folder and .gitattributes. Commit with summary "Add license notices and project credits", then Publish repository. Uncheck "Keep this code private" if you want public access.

## Original project description

# Manifest V3 personal build

Read [README-MV3.txt](README-MV3.txt) for installation, migration notes and limitations. This folder is ready to load without a build. The original project description follows.

![](images/logo64.png)
# Fika - Reader Mode

Fika is where you can immerse in reading. It removes all clutters and retrieves the table of content for you.

Navigator, Ads, Popups and horrible layouts always interfere with reading. Fika is a tool which can help you extract the main content from the webpage and present it in a peaceful reading mode. Other than that, Fika retrieves the table of content and offers four delightful themes: Vanilla, Latte, Blabar, Licorice. 

Features and Offering:

- Reading Mode
- Pre-made Themes
- Font adjustments
- Table of Content

### Update Logs

#### v0.3.0

- Advanced compatibility
- Refined article styling
- Trimmed and lighter table of content
- New Layout
- Feedback collection
- Fullscreen mode

#### v0.2.0
- More font selections
- New badge status
- Shortcut: Alt+R (Option+R): to open Fika, Esc: to close

#### v0.1.0
- Initial release
- Four delightful themes, several font and three text size options
- Auto-generated table of content

![](images/ChromeWebStore.png)

## Videos in reading mode
Custom animated openings and videos may be omitted. Use Watch video on original page when available; it opens another window and keeps Fika open. Version 0.9.14 packages the fixes from 0.9.10 with updated metadata and this documented reading-mode choice.
