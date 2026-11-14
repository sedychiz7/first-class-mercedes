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
assets/js/reviews.js  customer reviews list (edit this to add reviews)
assets/js/backgrounds.js  scroll-driven photo backgrounds
assets/img/bg/        background photos (1920px + 960px WebP)
credits.html          photo credits (required by the photo licences)
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
- [ ] Customer reviews: add them in `assets/js/reviews.js` (see below)
- [ ] Facebook reviews link and, later, a Google review link (also in `assets/js/reviews.js`)

## Adding reviews

Open `assets/js/reviews.js` and add one block per review inside `window.FCM_REVIEWS = [ ... ]`:

```js
{ name: 'Tendai M.', car: 'E-Class W212', service: 'Airmatic', rating: 5,
  text: 'Exactly what the customer wrote.', source: 'Facebook' },
```

Only use real reviews, copied word for word, and ideally with the customer's OK.
- 0 reviews: the section shows a "read our reviews on Facebook" message and button.
- 1 to 5 reviews: one swipeable row of cards.
- 6 or more: two rows that scroll in opposite directions and pause on hover.
The average score and star count are calculated automatically.

## Background photos

Each section has a `data-scene` name, matched by a `<div class="bg" data-scene="...">` layer
at the top of `index.html`. As you scroll into a section, its photo wipes in over the previous one.
Each layer's inline style sets:
- `--pos`: which part of the photo stays in frame (e.g. `50% 20%`)
- `--bright`: how dark the photo is (lower = darker, more readable text)
- `data-tone`: colour grade, `warm` (mechanical), `cool` (electronics) or `neutral`

The current photos are from Wikimedia Commons (CC0 / CC BY / CC BY-SA), credited in `credits.html`.
To swap one, replace `assets/img/bg/<scene>-1920.webp` and `-960.webp` and update `credits.html`.
Real photos of the workshop and team would be even better once you have them.

## Notes

- Visitors with "reduce motion" switched on see the full content without animations.
- The site doesn't use the Mercedes-Benz star logo or official branding, and the footer
  states that it's an independent specialist.
