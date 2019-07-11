# iOS SVG

[**LIVE**](https://tomashubelbauer.github.io/ios-svg)

I experiment to see if an SVG saved directly from a site (using long tap) or by
an `a[download]` link is downloadable to iOS Photos and vieweable in there. Also
I want to find out if when uploaded back the SVG is in any way altered by iOS.

I do this because I want to explore SVG image export as a backup mechanism for
a mobile web app.

---

SVG as an inline element, `img` or `a[download]` doesn't seem to be save-able to
Photos, even though the Save Image option appears, nothing appears in the Photos
app.

The above is not completely correct, some SVGs do show up, just my miminal one
doesn't and I'm researching what is the minimal passable SVG to show up there.

However SVG offers the Save to Files option in the Share modal in Safari.

This is not a given for any kind of a file, text files do not show that option.
That's probably because Safari is able to display them, because binary files do.
Most likely SVG sits between the two - Safari will display it but also offer you
the Save to Files option.
