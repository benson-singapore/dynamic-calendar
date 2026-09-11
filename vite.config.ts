import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  customPaletteFromParams,
  generateCalendarSvg,
  languageFromParams,
  parseIsoDate,
  todayIso,
  type CalendarPalette,
  type CalendarTheme,
} from "./shared/calendar";

const themeNames = new Set<CalendarTheme>(["coral", "ink", "leaf"]);

function getAppearance(searchParams: URLSearchParams): CalendarTheme | CalendarPalette {
  const palette = customPaletteFromParams(searchParams);
  if (palette) return palette;

  const requested = searchParams.get("theme") as CalendarTheme | null;
  return requested && themeNames.has(requested) ? requested : "coral";
}

function svgMiddleware(request: IncomingMessage, response: ServerResponse, next: () => void) {
  if (request.method !== "GET") {
    next();
    return;
  }

  const url = new URL(request.url ?? "/", "http://localhost");
  let requestedDate: string | null = null;
  let isQueryRoute = false;

  if (url.pathname === "/calendar.svg") {
    requestedDate = url.searchParams.get("date") ?? todayIso();
    isQueryRoute = true;
  } else {
    const match = /^\/calendar\/(\d{4})\/(\d{2})\/(\d{2})\.svg$/.exec(url.pathname);
    if (match) requestedDate = `${match[1]}-${match[2]}-${match[3]}`;
  }

  if (!requestedDate) {
    next();
    return;
  }

  const date = parseIsoDate(requestedDate);
  if (!date) {
    response.statusCode = 400;
    response.setHeader("content-type", "text/plain; charset=utf-8");
    response.end("Invalid date. Use YYYY-MM-DD or /calendar/YYYY/MM/DD.svg.");
    return;
  }

  response.statusCode = 200;
  response.setHeader("content-type", "image/svg+xml; charset=utf-8");
  response.setHeader(
    "cache-control",
    "public, max-age=3600, s-maxage=86400",
  );
  response.setHeader("content-disposition", `inline; filename="calendar-${date.iso}.svg"`);
  response.end(generateCalendarSvg(date.iso, getAppearance(url.searchParams), languageFromParams(url.searchParams)));
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: "dynamic-calendar-svg",
      configureServer(server) {
        server.middlewares.use(svgMiddleware);
      },
      configurePreviewServer(server) {
        server.middlewares.use(svgMiddleware);
      },
    },
  ],
  build: {
    sourcemap: true,
  },
});
