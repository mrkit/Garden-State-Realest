# GSRE Web — HTML rebuild

A static rebuild of the Canva design "GSRE Web". Two files plus an images folder.

```
index.html
styles.css
images/
```

Open `index.html` in a browser. It works from the file system, no build step and
no server.

## Dropping in the real photos

I pulled the photos out of Canva and downloaded them to your **Downloads**
folder. They already carry the exact filenames `index.html` expects, so there is
no renaming to do.

Move these 10 files into `images/`, overwriting the placeholders:

```
hero-mill.png          8.4 MB
balloon.jpg            731 KB
warren-county.jpg      250 KB
sussex-county.jpg      305 KB
morris-county.jpg      269 KB
why-choose-us.jpg      362 KB
new-construction.jpg   244 KB
land-development.jpg   172 KB
commercial.jpg         239 KB
streetscape.png        3.2 MB
```

Two extra files also downloaded. Neither is referenced by the HTML.

- `streetscape-alt.png` (2.5 MB) is a second, slightly different Main Street
  illustration that sits lower in the Canva canvas. Swap it into the
  `.closer__art` tag if it is the one you actually want.
- `decorative-01.jpg` came back empty, 0 bytes. It is a narrow 223x890 element
  that does not appear in the rendered design, so nothing is missing.

The `images/` folder ships with flat colour placeholders so the page lays out
correctly before you copy the real ones in. Each placeholder has its filename
printed on it.

## Worth doing before you go live

`hero-mill.png` is 8.4 MB and `streetscape.png` is 3.2 MB. Canva exported them
as PNG. The hero is a photograph, so converting it to JPEG at quality 82 will
cut it to roughly 400 KB with no visible difference. Keep `streetscape.png` as
PNG only if it needs a transparent background, otherwise convert that too.

```
# with ImageMagick
magick images/hero-mill.png -quality 82 images/hero-mill.jpg
# then change the src in index.html back to hero-mill.jpg
```

## Please double-check

The three Areas of Specialty photos are the ones I matched by position rather
than by reading a label, so confirm the counties line up: Warren on the left,
Sussex in the middle, Morris on the right.

## Things I changed on purpose

- Section headings are sentence case in the HTML and uppercased in CSS. Change
  `text-transform` in `styles.css` if you want them literal.
- Every card, pill and button is a real `<a>` with a placeholder `href`. Point
  them at real pages.
- Facebook and Instagram are inline SVG, not images, so they stay sharp.
- Added `alt` text on every image and visible focus outlines. The Canva export
  has neither.

## Fonts

Loaded from Google Fonts: Playfair Display (display serif), Cormorant Garamond
(body serif), Poppins (sans). These are close matches to the Canva design, not
the exact same faces. If you know the real font names from the Canva file, swap
the three `--font-*` variables at the top of `styles.css`.

## One thing to check

The phone number renders differently in two places in the Canva file. The
editor canvas showed **(908) 767-9338** and the preview showed
**(908) 989-0935**. I used the preview number. Confirm which is right and fix
it in `index.html` (it appears twice, in the link text and in the `tel:` href).
