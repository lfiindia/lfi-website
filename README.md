# LFI India — Static Website (HTML / CSS / JS)

A fully static, framework-free version of the LFI India corporate website.
No Node, no npm, no build step — just plain HTML, CSS, and vanilla JavaScript.
Open any .html file directly in a browser and it works.

## Structure

```
lfi-static/
├── index.html               Home
├── portfolio.html           Filterable project gallery
├── services.html            Full service catalogue
├── contact.html             Contact form + map
├── login.html                No auth — redirects to dashboard.lfiindia.in/login
├── privacy-policy.html
├── terms.html
├── 404.html
├── css/style.css            Shared design system (all pages)
├── js/main.js                Shared behavior (all pages)
└── assets/                   Logos, favicon, OG image
```

## Running it

Just double-click `index.html`, or for a local dev server:

```
python3 -m http.server 8000
```
then open http://localhost:8000

## What's interactive (vanilla JS, no libraries)

- Sticky navbar that turns solid on scroll + mobile hamburger menu
- Animated stat counters (scroll-triggered)
- Scroll-reveal fade-up animation on sections (degrades gracefully — content
  still shows if JavaScript is disabled, see `<noscript>` in each page head)
- Portfolio category filtering
- Horizontal scroll carousel for testimonials (prev/next buttons)
- Contact & wedding inquiry forms with frontend-only validation (no backend —
  shows a success panel on valid submit; wire up an endpoint in `js/main.js`
  `setupForm()` when you're ready to actually send data somewhere)

## Before deploying

1. **Images** — hero/about/portfolio images currently use Unsplash placeholder
   URLs. Replace with your real photography/videography.
2. **Contact details** — phone, WhatsApp, email, address are placeholders.
   Find/replace across the HTML files (search for `90000 00000`,
   `santosh@lfiindia.in`, `Karnataka, India`).
3. **Google Map embed** — `contact.html` has a generic Bengaluru map iframe;
   replace the `src` with your real Google Maps embed link.
4. **Logo** — your actual logo is already wired in at `assets/logo-white.png`
   / `assets/logo-black.png`.
5. **Forms** — both forms currently just validate and show a success message
   client-side. To actually receive submissions, either point the `<form>`
   at a form backend (Formspree, Getform, etc.) or add your own endpoint and
   update `setupForm()` in `js/main.js`.

## Hosting on Hostinger

This is 100% static — upload the whole folder to `public_html` via FTP or
Hostinger's File Manager and it works with zero configuration.
