# Lotara website

Production site for https://lotara.app, deployed from `main` through GitHub Pages.

The public site uses `styles.css`, `direction-v2.css/js`, `site.css/js`, and `cinema.css/js`. The signed-in portal uses its existing Firebase/authentication code with `portal-theme.css/js` and the updated portal presentation files.

The cinematic product demonstrations are labelled illustrations based on the native app UI, with example data. Review fixtures and local preview links are excluded from production. Privacy and terms policy bodies are preserved.

Serve locally with `python3 -m http.server 8767 --bind 127.0.0.1`. After CSS or JavaScript changes, update the corresponding content-hash query strings in HTML. The historical `stamp-assets.sh` only stamps `css/lotara.css` and `js/lotara.js`.
