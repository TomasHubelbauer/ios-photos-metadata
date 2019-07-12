# iOS Photos Metadata

[**LIVE**](https://tomashubelbauer.github.io/ios-photos-metadata)

This repository contains research into ways of providing web apps with means of
exporting data as files in way which is user-friendly for users of iOS Safari.

iOS (as of version 12, version 13 might change things) doesn't offer a convenient
way to manage general files. The Files app is available, but is not installed by
default. Moreover, not all file types can be downloaded there and it's still very
unwieldy to use as it lacks good file and folder management capabilities.

Safari will offer you a Save to Files option for some files in the Share button
menu when navigated to them directly, but not all. It will not do it for the file
types it can display (HTML, TXT, but it will do it for SVG even though it can
display it) but will for unknown files (and SVG). This is okay but is not great
for sharing or subsequent import to restore (need to navigate to the Files app.)

Another option is the Photos app. Throughtout my research I have verified that
the Photos app on iOS leaves PNG metadata intact and I have managed to store up
to **10 MB** in a `tEXt` chunk of a PNG image that I was able to restore, too.

The theoretical maximum for the `tEXt` chunk size is 2 GB, but generating that
amount gets tricky in the browser, especially because my implementation as of now
uses strings for comparison. I believe the current number is not final but I don't
believe I will be able to reach the theoretical maximum.

Right now I have a PNG generator which is capable of inserting a `tEXt` chunk
before the `IEND` chunk and infrastructure that allows the user to reupload
the downloaded image for checking if the contents of the chuck got disrupted or
not. Using binary search, the user is able to zero in on the approximate limit:

So far the largest payload I was able to generate and restore was **10 MB**.

- 15M freezes during generation?
- 20M crashes tab
- 25M crashes and restores tab during generation
- 50M freezes during generation?
- 100M crashes and restores tab during generation

## To-Do

Do not generate nor compare as strings, instead generate bytes directly to
`dataUint8Array` and remove `payload` (and maybe `keyword`) and compare by
checking that all bytes in `slice` have the same value - the char code of `_`.

Use `a[download]` when iOS 13 is out and it is supported in Safari.

See if using a non-standard keyword (like the program name, or none/empty) will
have the same behavior or if it will be treated differently by iOS.
