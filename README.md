# Jewel Ramos — General Administrative VA Portfolio

Static site (HTML, CSS, vanilla JS). No build step. Dark slate theme, indigo accent, Plus Jakarta Sans + Figtree.

## Structure
- `index.html` — homepage with all 12 sections
- `projects/lead-contact-tracking.html`, `projects/trello-content-workflow.html` — case studies
- `404.html`, `thanks.html` (form confirmation), `robots.txt`, `sitemap.xml`, `.nojekyll`
- `assets/css/style.css`, `assets/js/main.js`
- `assets/images/profile/jewel-ramos.jpg` (profile photo), `assets/images/certificates/` (6 real certificates), `assets/images/case-studies/` (2 real screenshots)

## Preview
Open `index.html` in a browser, or run `python3 -m http.server` in this folder and visit http://localhost:8000.

## Deploy to GitHub Pages
1. Create a free account at github.com, then click **New repository**. Name it (for example `jewel-ramos-portfolio`), keep it **Public**, and create it.
2. On the new repo page click **uploading an existing file**. Drag in the **contents** of this folder (`index.html`, `assets`, `projects`, `404.html`, and the rest, not the folder itself). Wait for the upload to finish, then click **Commit changes**.
3. Go to **Settings > Pages**. Under **Build and deployment**, set Source to **Deploy from a branch**, Branch to **main** and folder **/ (root)**, then Save.
4. After about a minute your site is live at `https://YOUR-USERNAME.github.io/YOUR-REPO/`.

Notes:
- `.nojekyll` is included so GitHub serves the files as-is. Keep it.
- File names are case-sensitive on GitHub. Keep the images' names exactly as they are.
- For a root address like `https://YOUR-USERNAME.github.io/`, name the repo `YOUR-USERNAME.github.io`.
- The Contact section has no form; visitors reach you by the email and LinkedIn links.

## After your site is live
Replace `https://YOUR-USERNAME.github.io/YOUR-REPO` with your real address in every HTML file (canonical and og:url tags), `robots.txt` and `sitemap.xml`. For a custom domain, use that domain instead, and add it under Settings > Pages.

## Replace assets
Overwrite files in `assets/images/...` keeping the same filenames, or update the `src` and `data-zoom` paths in the HTML.

## Update contact info
Search for `jewelramos.va@gmail.com` and `linkedin.com/in/jewel-ramos-va` and edit. Your phone number is intentionally not published.

## Add a future case study
Copy a file in `projects/`, edit its text and images, add a link from the homepage Case Study section, and add it to `sitemap.xml`.

## Design notes
- Dark theme: all colors, radii and surfaces are CSS variables at the top of `assets/css/style.css` (`--bg`, `--bg-2`, `--card`, `--indigo`, `--sage-l`, `--amber-l`). Change them there to re-theme the whole site.
- Icons are inline SVG symbols in the sprite at the top of each page (`<symbol id="i-...">`), so there are no extra downloads. Tool chips take a brand tint from a `.t-...` class in the CSS.
- Tools section: each group is a `.tg` row with a heading and a list of `.tool` chips. Copy an existing `<li class="tool ...">` to add a tool.
- Case study images live in `assets/images/case-studies/` (`lead-tracker.webp`, `trello-board.webp`). Keep the filenames to swap them.
- Contact links (email, LinkedIn) are `.clist a` rows with hover states and no underline.
- The stat numbers in section 09 count up from `data-count` attributes; the final numbers are also in the HTML, so they show without JavaScript.
- The package buttons pre-fill the contact message. Remove the `data-package` attributes to turn this off.

- Hover effects: package cards (`.pkg`) lift with a border glow and shadow; tool category rows (`.tg`) get a soft highlight and accent bar. Both are disabled for touch devices and reduced-motion users.
- Mobile menu: below 1100px the nav becomes a full-screen drawer (staggered link fade-in, safe-area padding, closes on link tap or Esc).

## Section 09 pubmat gallery
- Markup: `<div class="gallery" id="pubmats">` at the end of the Experience Highlights section, plus a `<dialog id="gal">` near the bottom of `index.html` (separate from the certificate lightbox `#lb`).
- Images: `assets/images/pubmats/pubmat-NN.webp` (full, max 1600px) and `pubmat-NN-thumb.webp` (grid thumbnail).
- To edit a title, org label, or Facebook link, change the `data-title`, `data-org`, `data-fb` attributes (and the visible `.gorg` / `.gt` text) on the matching `.gthumb` button.
- To add a pubmat, copy one `<li>` in `.ggrid`, add its two image files, and update the attributes. Next/Previous, the counter, and keyboard/swipe navigation pick it up automatically.
