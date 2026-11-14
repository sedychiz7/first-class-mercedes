# First Class Mercedes

Website for an independent Mercedes-Benz specialist workshop in Msasa, Harare.

It's a static site with no build step: plain HTML, CSS and JS. The motion uses
[GSAP](https://gsap.com) + ScrollTrigger, with [Lenis](https://lenis.darkroom.engineering) for smooth scrolling.
All three libraries are stored in `assets/vendor/`, so the site needs no outside CDN.

## Structure

```
index.html            all page content
assets/css/style.css  styles and design tokens (colours at the top)
assets/js/main.js     animations and interactions
assets/vendor/        gsap, ScrollTrigger, lenis
assets/favicon.svg
```

## Preview locally

```
python3 -m http.server 8000
# open http://localhost:8000
```

## Publish on GitHub Pages

1. Go to the repo on GitHub, then **Settings → Pages**.
2. Under "Source", choose **Deploy from a branch**, pick the branch and set the folder to `/ (root)`.
3. The site goes live at `https://<username>.github.io/first-class-mercedes/`.

## Placeholders to replace (search `TODO` in index.html)

- [ ] Phone number: `+263000000000` (nav button, contact section, and the JSON-LD block in `<head>`)
- [ ] WhatsApp link: `https://wa.me/263000000000` (use the number without `+` or spaces)
- [ ] Facebook page link (currently `#`)
- [ ] Opening hours (currently made-up example hours)
- [ ] Exact workshop address or Google Maps pin
- [ ] Team: real names, roles and photos (currently initials)
- [ ] Workshop and job photos
- [ ] Customer reviews (no section yet)

## Notes

- Visitors with "reduce motion" switched on see the full content without animations.
- The site doesn't use the Mercedes-Benz star logo or official branding, and the footer
  states that it's an independent specialist.
