# Dynamic Calendar

A small React/Vite calendar generator based on [Dynamic SVG Calendar Icon](https://github.com/edent/Dynamic-SVG-Calendar-Icon). Pick a date in the web UI, then use the generated URL anywhere an image URL is accepted.

## URL formats

The Pages Function returns a real `image/svg+xml` response, so external clients do not need to run JavaScript:

```text
/calendar.svg?date=2020-03-09
/calendar/2020/03/09.svg
/calendar/2020/03/09.svg?theme=ink
/calendar/2020/03/09.svg?top=%23123456&bottom=%23f4efe8&text=%23f5c542
/calendar/2020/03/09.svg?lang=zh
/calendar/2020/03/09.svg?lang=zh&top=%23123456&bottom=%23f4efe8&text=%23f5c542
```

The path form is the recommended URL for Notion and other image consumers. It is rewritten by Pages to the same SVG Function without exposing a query string to the image consumer. The query form is useful for quick testing and defaults to today when `date` is omitted.

Preset themes are selected with `theme=coral`, `theme=ink`, or `theme=leaf`. Custom colors use three six-digit HEX parameters:

- `top`: calendar header color
- `bottom`: calendar paper color
- `text`: date and weekday text color

The web interface exposes these as the **Custom** colorway. Choosing a custom color updates the preview and produces a reusable URL automatically.

Calendar text is English by default. Add `lang=zh` for Chinese month, weekday, title, and accessible description text; omit it or use `lang=en` for English. The web interface includes an English/中文 switch and keeps the selected language in the generated image URL.

## Local development

```bash
npm install
npm run dev
```

The Vite dev and preview servers also return the SVG directly, so these URLs work locally:

```text
http://localhost:5173/calendar.svg?date=2020-03-09
http://localhost:5173/calendar/2020/03/09.svg
```

To exercise the production Pages Function runtime locally, install Wrangler and run the built site with `wrangler pages dev dist`.

## Cloudflare Pages

Create a Pages project connected to this repository with:

- **Build command:** `npm run build`
- **Build output directory:** `dist`

The `functions/` directory is picked up automatically by Cloudflare Pages. No separate Worker project is needed. Function routes are cached at the edge with long-lived cache headers for date-specific URLs.

## Credits

The calendar icon concept and original dynamic SVG approach come from Edent's [Dynamic-SVG-Calendar-Icon](https://github.com/edent/Dynamic-SVG-Calendar-Icon), licensed under MIT. This project keeps the same compact paper-calendar language and adds date-addressable SVG responses plus a browser UI.
