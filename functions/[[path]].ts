import type { PagesFunction } from "@cloudflare/workers-types";
import {
  customPaletteFromParams,
  generateCalendarSvg,
  languageFromParams,
  parseIsoDate,
  todayIso,
  type CalendarPalette,
  type CalendarTheme,
} from "../shared/calendar";

const themeNames = new Set<CalendarTheme>(["coral", "ink", "leaf"]);

function pathString(path: string | string[] | undefined): string {
  return Array.isArray(path) ? path.join("/") : path ?? "";
}

function getDate(pathname: string, searchParams: URLSearchParams): string | null {
  if (pathname === "/calendar.svg") {
    return searchParams.get("date") ?? todayIso();
  }

  const match = /^\/calendar\/(\d{4})\/(\d{2})\/(\d{2})\.svg$/.exec(pathname);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

function getAppearance(request: Request): CalendarTheme | CalendarPalette {
  const params = new URL(request.url).searchParams;
  const palette = customPaletteFromParams(params);
  if (palette) return palette;

  const requested = params.get("theme") as CalendarTheme | null;
  return requested && themeNames.has(requested) ? requested : "coral";
}

export const onRequest: PagesFunction = async ({ request, params, next }) => {
  const url = new URL(request.url);
  const pathname = `/${pathString(params.path)}`;
  const requestedDate = getDate(pathname, url.searchParams);

  if (requestedDate === null) {
    return next();
  }

  const date = parseIsoDate(requestedDate);
  if (!date) {
    return new Response("Invalid date. Use YYYY-MM-DD or /calendar/YYYY/MM/DD.svg.", {
      status: 400,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const isQueryRoute = pathname === "/calendar.svg";
  return new Response(generateCalendarSvg(date.iso, getAppearance(request), languageFromParams(url.searchParams)), {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": isQueryRoute ? "public, max-age=3600, s-maxage=86400" : "public, max-age=3600, s-maxage=86400",
      "content-disposition": `inline; filename="calendar-${date.iso}.svg"`,
    },
  });
};
