# Chrome Web Store release assets

These assets are generated from the production extension UI with synthetic,
non-personal query examples. They do not depict or expose a real conversation.

- `screenshots/*.png`: five 1280×800 product screenshots.
- `promo/small-promo-440x280.png`: small promotional tile.
- `promo/marquee-1400x560.png`: marquee promotional tile.
- `icon/store-icon-128.png`: store icon copied from the production package.
- `listing.md`: the approved English listing copy and privacy declarations.

The screenshot frame loads the compiled `sidepanel.html`; browser automation
only supplies the same public state envelope normally returned by the extension
service worker. This keeps the listing representative of the actual shipped UI.
