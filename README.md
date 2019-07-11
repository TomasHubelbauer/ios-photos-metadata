# iOS SVG

[**LIVE**](https://tomashubelbauer.github.io/ios-svg)

I experiment to see if an SVG saved directly from a site (using long tap) or by
an `a[download]` link is downloadable to iOS Photos and vieweable in there. Also
I want to find out if when uploaded back the SVG is in any way altered by iOS.

I do this because I want to explore SVG image export as a backup mechanism for
a mobile web app.

---

`svg` element has no long tap menu so no Save Image option.

`img` element pointing to an SVG file has a Save Image long tap option but the
image doesn't appear in Photos afterwards - it doesn't work.

`a` element leading to an SVG file opens it in Safari with Save Image available
under the Share button, but it doesn't work either, nothing appears in Photos.
**However** a Save to Files option is available in the Share menu as well.
This option is available for files that Safari can't display and SVGs (which it
can display) but not files it can display (text files, HTML, …).

On Wikipedia Save Image on an SVG works because it serves a pre-rendered PNG.

I tried generating a PNG using `canvas` and appending Base64 encoded data to it
but it breaks the image preview in Safari and as a result the Save Image option
is no longer presented.
