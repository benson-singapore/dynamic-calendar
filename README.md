# Dynamic Calendar

[中文文档](README.zh-CN.md)

> A date-addressable SVG calendar for Notion, profiles, documents, and anywhere an image URL can live.

[![Live preview](https://img.shields.io/badge/live%20preview-dynamic--calendar.pages.dev-d94f50?style=flat-square)](https://dynamic-calendar.pages.dev/)
[![Based on Dynamic SVG Calendar Icon](https://img.shields.io/badge/based%20on-Dynamic%20SVG%20Calendar%20Icon-263b43?style=flat-square)](https://github.com/edent/Dynamic-SVG-Calendar-Icon)

Dynamic Calendar turns any date into a clean, durable calendar image. Choose a date, language, theme, or custom color palette in the browser, then copy a URL that returns a real `image/svg+xml` response directly from Cloudflare Pages.

It is designed for small, useful places: a Notion page icon, a profile image, a project document, a bookmark, or any service that accepts a remote image URL.

## Live Preview

**[Open Dynamic Calendar](https://dynamic-calendar.pages.dev/)**

![Dynamic Calendar workbench](docs/images/dynamic-calendar-workbench.png)

[![Generated calendar SVG](docs/images/calendar-svg-output.png)](https://dynamic-calendar.pages.dev/calendar.svg)

## Highlights

- **Any date**: generate a calendar for today, a historical date, or a future date.
- **Real SVG responses**: image consumers receive `image/svg+xml`; no browser-side JavaScript is required.
- **Flexible appearance**: choose Coral, Ink, or Leaf, or define your own header, paper, and text colors.
- **Bilingual output**: switch between English and Chinese month, weekday, title, and accessible description text.
- **Transparent-friendly SVG**: the outer page remains transparent, making the calendar easy to embed on different backgrounds.
- **Responsive workbench**: preview the result, edit parameters, and copy the final URL from one interface.
- **Edge-ready**: built for Cloudflare Pages Functions with cache-friendly date-specific URLs.

## Use It as an Image URL

The recommended path format is stable and easy to paste into Notion or another image consumer:

```text
https://dynamic-calendar.pages.dev/calendar/2020/03/09.svg
```

The query format is convenient for quick testing and supports a date parameter directly:

```text
https://dynamic-calendar.pages.dev/calendar.svg?date=2020-03-09
```

Both URLs return the SVG itself, rather than an HTML page.

### Language

English is the default. Add `lang=zh` for Chinese month and weekday labels:

```text
https://dynamic-calendar.pages.dev/calendar/2020/03/09.svg?lang=zh
```

### Preset Themes

Use `theme=coral`, `theme=ink`, or `theme=leaf`:

```text
https://dynamic-calendar.pages.dev/calendar/2020/03/09.svg?theme=ink
```

### Custom Colors

Pass six-digit HEX values for the top header, bottom paper, and text. The `#` character must be URL-encoded as `%23`:

```text
https://dynamic-calendar.pages.dev/calendar/2020/03/09.svg?top=%23123456&bottom=%23f4efe8&text=%2329363b
```

| Parameter | Controls |
| --- | --- |
| `top` | Header color |
| `bottom` | Calendar paper color |
| `text` | Date and weekday text color |
| `lang` | `en` or `zh` |
| `theme` | `coral`, `ink`, or `leaf` |

The web interface generates these parameters automatically when **Custom** is selected.

## Notion Example

1. Open the [live preview](https://dynamic-calendar.pages.dev/).
2. Choose the date, language, and colors you want.
3. Copy the generated image URL.
4. Paste it into Notion as an image or use it as a page icon.

Example Chinese calendar URL:

```text
https://dynamic-calendar.pages.dev/calendar/2026/09/11.svg?lang=zh&theme=coral
```

## Local Development

```bash
npm install
npm run dev
```

The local Vite server exposes both the web interface and direct SVG routes:

```text
http://localhost:5173/
http://localhost:5173/calendar.svg?date=2020-03-09
http://localhost:5173/calendar/2020/03/09.svg?lang=zh
```

Available project commands:

```bash
npm run dev
npm run typecheck
npm run build
```

## Deploy to Cloudflare Pages

Create a Pages project connected to this repository with:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |

Cloudflare Pages automatically picks up the `functions/` directory. No separate Worker project is required. Date-specific SVG responses include cache headers so repeated image requests can be served efficiently at the edge.

## Architecture

```text
React + Vite
    ├── browser workbench and live SVG preview
    ├── shared/calendar.ts SVG and date engine
    └── Cloudflare Pages Function
            └── /calendar.svg and /calendar/YYYY/MM/DD.svg
```

The SVG generator is shared between the React preview, the Vite development server, and the Cloudflare Pages Function so the preview and copied URL stay visually consistent.

## Credits

The calendar concept and original dynamic SVG approach are based on Edent's [Dynamic-SVG-Calendar-Icon](https://github.com/edent/Dynamic-SVG-Calendar-Icon), licensed under MIT. This project extends that compact paper-calendar language with date-addressable SVG responses, custom palettes, bilingual output, and a browser-based generator.

## License

MIT
