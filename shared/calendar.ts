export type CalendarTheme = "coral" | "ink" | "leaf";
export type CalendarLanguage = "en" | "zh";
export type CalendarPalette = Pick<CalendarThemeDefinition, "header" | "paper" | "ink">;

export interface CalendarDate {
  iso: string;
  year: number;
  month: number;
  day: number;
  weekday: string;
  monthShort: string;
  monthLong: string;
  weekdayZh: string;
  monthShortZh: string;
  monthLongZh: string;
}

export interface CalendarThemeDefinition {
  label: string;
  header: string;
  headerText: string;
  paper: string;
  paperShadow: string;
  pin: string;
  ink: string;
  muted: string;
}

export const themes: Record<CalendarTheme, CalendarThemeDefinition> = {
  coral: {
    label: "Coral",
    header: "#d94f50",
    headerText: "#fffaf5",
    paper: "#f6f0e8",
    paperShadow: "#d9cfc3",
    pin: "#f5b8ad",
    ink: "#29363b",
    muted: "#68757a",
  },
  ink: {
    label: "Ink",
    header: "#263b43",
    headerText: "#f9f5ed",
    paper: "#eef0ed",
    paperShadow: "#c9d0cb",
    pin: "#a5b8b2",
    ink: "#1d2b30",
    muted: "#607075",
  },
  leaf: {
    label: "Leaf",
    header: "#467c65",
    headerText: "#fbf8ef",
    paper: "#f0f2e9",
    paperShadow: "#ced6c4",
    pin: "#b8cfaa",
    ink: "#2e4438",
    muted: "#64756b",
  },
};

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function isHexColor(value: string | null | undefined): value is `#${string}` {
  return Boolean(value && HEX_COLOR.test(value));
}

export function customPaletteFromParams(params: URLSearchParams): CalendarPalette | null {
  const header = params.get("top")?.toLowerCase();
  const paper = params.get("bottom")?.toLowerCase();
  const ink = params.get("text")?.toLowerCase();
  return isHexColor(header) && isHexColor(paper) && isHexColor(ink)
    ? { header, paper, ink }
    : null;
}

export function languageFromParams(params: URLSearchParams): CalendarLanguage {
  return params.get("lang") === "zh" ? "zh" : "en";
}

function hexRgb(value: string): [number, number, number] {
  return [1, 3, 5].map((index) => Number.parseInt(value.slice(index, index + 2), 16)) as [number, number, number];
}

function mixHex(first: string, second: string, amount: number): string {
  const a = hexRgb(first);
  const b = hexRgb(second);
  return `#${a.map((channel, index) => Math.round(channel + (b[index] - channel) * amount).toString(16).padStart(2, "0")).join("")}`;
}

function readableHeaderText(header: string): string {
  const [red, green, blue] = hexRgb(header).map((channel) => channel / 255);
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  return luminance > 0.62 ? "#263b43" : "#fffaf5";
}

function paletteColors(themeOrPalette: CalendarTheme | CalendarPalette): CalendarThemeDefinition {
  if (typeof themeOrPalette === "string") return themes[themeOrPalette] ?? themes.coral;
  return {
    label: "Custom",
    header: themeOrPalette.header,
    headerText: readableHeaderText(themeOrPalette.header),
    paper: themeOrPalette.paper,
    paperShadow: mixHex(themeOrPalette.paper, "#263b43", 0.14),
    pin: mixHex(themeOrPalette.header, "#fffaf5", 0.48),
    ink: themeOrPalette.ink,
    muted: mixHex(themeOrPalette.ink, themeOrPalette.paper, 0.42),
  };
}

export function todayIso(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(value: string | null | undefined): CalendarDate | null {
  if (!value) return null;
  const match = ISO_DATE.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  const locale = "en-GB";
  const weekdaysZh = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const monthZh = `${month}月`;
  return {
    iso: value,
    year,
    month,
    day,
    weekday: date.toLocaleDateString(locale, { weekday: "long", timeZone: "UTC" }),
    monthShort: date.toLocaleDateString(locale, { month: "short", timeZone: "UTC" }).toUpperCase(),
    monthLong: date.toLocaleDateString(locale, { month: "long", timeZone: "UTC" }),
    weekdayZh: weekdaysZh[date.getUTCDay()],
    monthShortZh: monthZh,
    monthLongZh: monthZh,
  };
}

export function formatDisplayDate(value: string, language: CalendarLanguage = "en"): string {
  const date = parseIsoDate(value);
  if (!date) return value;
  if (language === "zh") return `${date.year}年${date.month}月${date.day}日 ${date.weekdayZh}`;
  return `${date.weekday}, ${date.day} ${date.monthLong} ${date.year}`;
}

export function shiftIsoDate(value: string, amount: number): string {
  const parsed = parseIsoDate(value);
  if (!parsed) return value;
  const shifted = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day + amount));
  return shifted.toISOString().slice(0, 10);
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return entities[character];
  });
}

export function generateCalendarSvg(
  dateInput: string,
  themeOrPalette: CalendarTheme | CalendarPalette = "coral",
  language: CalendarLanguage = "en",
): string {
  const date = parseIsoDate(dateInput) ?? parseIsoDate("1970-01-01");
  const colors = paletteColors(themeOrPalette);
  if (!date) throw new Error("A valid ISO date is required");

  const day = String(date.day);
  const daySize = day.length === 1 ? 280 : 256;
  const dayY = day.length === 1 ? 404 : 400;
  const isChinese = language === "zh";
  const monthLabel = isChinese ? date.monthShortZh : date.monthShort;
  const weekdayLabel = isChinese ? date.weekdayZh : date.weekday;
  const label = isChinese
    ? `${date.year}年${date.month}月${date.day}日 ${date.weekdayZh}`
    : `${date.weekday}, ${date.monthLong} ${date.day}, ${date.year}`;
  const description = isChinese ? `显示${label}的日历图标。` : `A calendar icon showing ${label}.`;
  // Keep the font list free of embedded quotes so it remains valid inside the SVG XML attribute.
  const headerFont = isChinese
    ? "Noto Sans SC, PingFang SC, Microsoft YaHei, sans-serif"
    : "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  const headerSize = isChinese ? 112 : 140;
  const weekdayFont = isChinese ? headerFont : 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  const weekdaySize = isChinese ? 48 : 54;

  const monthSvg = `<text x="32" y="164" fill="${colors.headerText}" font-family="${headerFont}" font-size="${headerSize}" font-weight="700" text-anchor="start" letter-spacing="${isChinese ? 0 : 2}">${escapeXml(monthLabel)}</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc" width="100%" height="100%" viewBox="0 0 512 512" preserveAspectRatio="xMidYMid meet" style="display:block;position:fixed;inset:0;width:100vw;height:100vh">
  <title id="title">${escapeXml(label)}</title>
  <desc id="desc">${escapeXml(description)}</desc>
  <path d="M512 455c0 32-25 57-57 57H57c-32 0-57-25-57-57V128c0-31 25-57 57-57h398c32 0 57 26 57 57z" fill="${colors.paper}"/>
  <path d="M484 0h-47c2 4 4 9 4 14a28 28 0 1 1-53-14H124c3 4 4 9 4 14a28 28 0 1 1-53-14H28C13 0 0 13 0 28v157h512V28c0-15-13-28-28-28z" fill="${colors.header}"/>
  <path d="M0 185h512v12H0z" fill="${colors.paperShadow}" opacity=".72"/>
  <g fill="${colors.pin}">
    <circle cx="470" cy="142" r="14"/>
    <circle cx="470" cy="100" r="14"/>
    <circle cx="427" cy="142" r="14"/>
    <circle cx="427" cy="100" r="14"/>
    <circle cx="384" cy="142" r="14"/>
    <circle cx="384" cy="100" r="14"/>
  </g>
  ${monthSvg}
  <text x="256" y="${dayY}" fill="${colors.ink}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="${daySize}" font-weight="700" text-anchor="middle">${day}</text>
  <text x="256" y="480" fill="${colors.muted}" font-family="${weekdayFont}" font-size="${weekdaySize}" font-weight="600" text-anchor="middle">${escapeXml(weekdayLabel)}</text>
</svg>`;
}

export function calendarSvgUrl(
  origin: string,
  date: string,
  themeOrPalette: CalendarTheme | CalendarPalette,
  language: CalendarLanguage = "en",
): string {
  const base = `${origin.replace(/\/$/, "")}/calendar/${date.slice(0, 4)}/${date.slice(5, 7)}/${date.slice(8, 10)}.svg`;
  const params = new URLSearchParams();
  if (language === "zh") params.set("lang", language);
  if (typeof themeOrPalette === "string") {
    if (themeOrPalette !== "coral") params.set("theme", themeOrPalette);
  } else {
    params.set("top", themeOrPalette.header);
    params.set("bottom", themeOrPalette.paper);
    params.set("text", themeOrPalette.ink);
  }
  return params.size > 0 ? `${base}?${params.toString()}` : base;
}
