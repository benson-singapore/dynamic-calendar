import { useEffect, useMemo, useState } from "react";
import {
  calendarSvgUrl,
  customPaletteFromParams,
  formatDisplayDate,
  generateCalendarSvg,
  languageFromParams,
  parseIsoDate,
  shiftIsoDate,
  themes,
  todayIso,
  type CalendarPalette,
  type CalendarLanguage,
  type CalendarTheme,
} from "../shared/calendar";

const themeKeys = Object.keys(themes) as CalendarTheme[];
const customThemeKey = "custom" as const;
const defaultCustomPalette: CalendarPalette = {
  header: themes.coral.header,
  paper: themes.coral.paper,
  ink: themes.coral.ink,
};

type AppearanceTheme = CalendarTheme | typeof customThemeKey;

const pageCopy = {
  en: {
    home: "Dynamic Calendar",
    source: "Source ↗",
    eyebrow: "SVG DATE ENGINE",
    title: <>A calendar icon<br /><em>for any day.</em></>,
    description: "Choose a date and get a durable image URL that works in Notion, profiles, documents, and anywhere an image can live.",
    livePreview: "LIVE PREVIEW",
    selectDate: "Select a date",
    previousDay: "Previous day",
    nextDay: "Next day",
    jumpToday: "Jump to today",
    colorway: "Choose a colorway",
    custom: "Custom",
    customColors: "Custom colors",
    topColor: "Top color",
    bottomColor: "Bottom color",
    textColor: "Text color",
    header: "Header",
    paper: "Paper",
    type: "Type",
    language: "Calendar language",
    imageUrl: "Your image URL",
    copy: "Copy",
    copied: "Copied",
    openSvg: "Open SVG ↗",
    servedAs: "served as image/svg+xml",
    footer: "Built for small, useful corners of the web.",
    format: "YYYY / MM / DD · SVG",
    titleTag: "Calendar / Dynamic SVG",
  },
  zh: {
    home: "动态日历",
    source: "源码 ↗",
    eyebrow: "SVG 日期引擎",
    title: <>任意日期的<br /><em>日历图标。</em></>,
    description: "选择一个日期，生成可长期使用的图片链接，可用于 Notion、个人资料、文档以及任何支持图片的地方。",
    livePreview: "实时预览",
    selectDate: "选择日期",
    previousDay: "前一天",
    nextDay: "后一天",
    jumpToday: "回到今天",
    colorway: "选择配色",
    custom: "自定义",
    customColors: "自定义颜色",
    topColor: "顶部颜色",
    bottomColor: "底部颜色",
    textColor: "文字颜色",
    header: "页眉",
    paper: "纸张",
    type: "文字",
    language: "日历语言",
    imageUrl: "图片 URL",
    copy: "复制",
    copied: "已复制",
    openSvg: "打开 SVG ↗",
    servedAs: "以 image/svg+xml 提供",
    footer: "为网络上小而实用的角落而做。",
    format: "年 / 月 / 日 · SVG",
    titleTag: "日历 / 动态 SVG",
  },
} as const;

const themeLabels: Record<CalendarLanguage, Record<CalendarTheme, string>> = {
  en: { coral: "Coral", ink: "Ink", leaf: "Leaf" },
  zh: { coral: "珊瑚", ink: "墨色", leaf: "叶绿" },
};

function readAppearanceFromLocation(): { theme: AppearanceTheme; palette: CalendarPalette; language: CalendarLanguage } {
  const params = new URLSearchParams(window.location.search);
  const customPalette = customPaletteFromParams(params);
  const requestedTheme = params.get("theme") as CalendarTheme | null;
  return {
    theme: customPalette ? customThemeKey : requestedTheme && themeKeys.includes(requestedTheme) ? requestedTheme : "coral",
    palette: customPalette ?? defaultCustomPalette,
    language: languageFromParams(params),
  };
}

function readDateFromLocation(): string {
  const value = new URLSearchParams(window.location.search).get("date");
  return parseIsoDate(value) ? value! : todayIso();
}

function App() {
  const [date, setDate] = useState(readDateFromLocation);
  const initialAppearance = useMemo(readAppearanceFromLocation, []);
  const [theme, setTheme] = useState<AppearanceTheme>(initialAppearance.theme);
  const [customPalette, setCustomPalette] = useState<CalendarPalette>(initialAppearance.palette);
  const [language, setLanguage] = useState<CalendarLanguage>(initialAppearance.language);
  const [copied, setCopied] = useState(false);

  const parsedDate = useMemo(() => parseIsoDate(date)!, [date]);
  const appearance = theme === customThemeKey ? customPalette : theme;
  const copy = pageCopy[language];
  const origin = window.location.origin;
  const publicUrl = useMemo(() => calendarSvgUrl(origin, date, appearance, language), [date, origin, appearance, language]);
  const previewSvg = useMemo(
    () => generateCalendarSvg(date, appearance, language).replace(/^<\?xml[^>]*\?>\s*/, ""),
    [date, appearance, language],
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("date", date);
    if (language === "zh") url.searchParams.set("lang", language);
    else url.searchParams.delete("lang");
    if (theme === customThemeKey) {
      url.searchParams.delete("theme");
      url.searchParams.set("top", customPalette.header);
      url.searchParams.set("bottom", customPalette.paper);
      url.searchParams.set("text", customPalette.ink);
    } else {
      url.searchParams.delete("top");
      url.searchParams.delete("bottom");
      url.searchParams.delete("text");
      if (theme === "coral") url.searchParams.delete("theme");
      else url.searchParams.set("theme", theme);
    }
    window.history.replaceState({}, "", `${url.pathname}?${url.searchParams.toString()}`);
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.title = copy.titleTag;
  }, [date, theme, customPalette, language, copy.titleTag]);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function chooseDate(value: string) {
    if (parseIsoDate(value)) setDate(value);
  }

  function chooseTheme(nextTheme: AppearanceTheme) {
    setTheme(nextTheme);
  }

  function updateCustomColor(key: keyof CalendarPalette, value: string) {
    setCustomPalette((current) => ({ ...current, [key]: value }));
    setTheme(customThemeKey);
  }

  const customOptions = [
    { key: "header" as const, label: copy.topColor, hint: copy.header },
    { key: "paper" as const, label: copy.bottomColor, hint: copy.paper },
    { key: "ink" as const, label: copy.textColor, hint: copy.type },
  ];

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label={copy.home}>
          <span className="wordmark-mark">DC</span>
          <span>{copy.home}</span>
        </a>
        <a className="source-link" href="https://github.com/benson-singapore/dynamic-calendar" target="_blank" rel="noreferrer">
          {copy.source}
        </a>
      </header>

      <section className="workspace" aria-label={copy.home}>
        <div className="intro">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="intro-copy">{copy.description}</p>
        </div>

        <div className="preview-column">
          <div className="preview-frame">
            <div className="preview-meta"><span>{copy.livePreview}</span><span className="status-dot" /> <span>{theme === customThemeKey ? copy.custom.toUpperCase() : themeLabels[language][theme].toUpperCase()}</span></div>
            <div
              className="calendar-preview"
              role="img"
              aria-label={formatDisplayDate(date, language)}
              dangerouslySetInnerHTML={{ __html: previewSvg }}
            >
            </div>
            <div className="preview-caption"><strong>{parsedDate.day}</strong><span>{language === "zh" ? `${parsedDate.monthLongZh} ${parsedDate.year}` : `${parsedDate.monthLong} ${parsedDate.year}`}</span></div>
          </div>
        </div>

        <div className="controls-column">
          <div className="control-section date-section">
            <div className="section-label"><span>01</span><label htmlFor="calendar-date">{copy.selectDate}</label></div>
            <div className="date-control">
              <button className="icon-button" onClick={() => setDate(shiftIsoDate(date, -1))} aria-label={copy.previousDay} title={copy.previousDay}>←</button>
              <input id="calendar-date" type="date" value={date} onChange={(event) => chooseDate(event.target.value)} />
              <button className="icon-button" onClick={() => setDate(shiftIsoDate(date, 1))} aria-label={copy.nextDay} title={copy.nextDay}>→</button>
            </div>
            <button className="today-button" onClick={() => setDate(todayIso())}>{copy.jumpToday} <span>↗</span></button>
          </div>

          <div className="control-section">
            <div className="section-label"><span>02</span><span>{copy.colorway}</span></div>
            <div className="theme-list" role="radiogroup" aria-label={copy.colorway}>
              {themeKeys.map((key) => (
                <button key={key} className={`theme-option ${theme === key ? "selected" : ""}`} onClick={() => chooseTheme(key)} role="radio" aria-checked={theme === key}>
                  <span className="swatch" style={{ backgroundColor: themes[key].header }} />
                  <span>{themeLabels[language][key]}</span>
                  {theme === key && <span className="check">✓</span>}
                </button>
              ))}
              <button className={`theme-option custom-theme-option ${theme === customThemeKey ? "selected" : ""}`} onClick={() => chooseTheme(customThemeKey)} role="radio" aria-checked={theme === customThemeKey}>
                <span className="custom-swatch"><i style={{ backgroundColor: customPalette.header }} /><i style={{ backgroundColor: customPalette.paper }} /><i style={{ backgroundColor: customPalette.ink }} /></span>
                <span>{copy.custom}</span>
                {theme === customThemeKey && <span className="check">✓</span>}
              </button>
            </div>
            {theme === customThemeKey && (
              <div className="custom-editor" aria-label={copy.customColors}>
                {customOptions.map(({ key, label, hint }) => (
                  <label className="color-control" key={key}>
                    <span className="color-control-label"><span>{label}</span><small>{hint}</small></span>
                    <input type="color" value={customPalette[key]} onChange={(event) => updateCustomColor(key, event.target.value)} aria-label={label} />
                    <input className="hex-input" key={`${key}-${customPalette[key]}`} defaultValue={customPalette[key].toUpperCase()} onBlur={(event) => {
                      const value = event.currentTarget.value.toLowerCase();
                      if (/^#[0-9a-f]{6}$/.test(value)) updateCustomColor(key, value);
                      else event.currentTarget.value = customPalette[key].toUpperCase();
                    }} onKeyDown={(event) => {
                      if (event.key === "Enter") event.currentTarget.blur();
                    }}
                    onFocus={(event) => event.currentTarget.select()}
                    aria-label={`${label} hex value`} spellCheck={false} />
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="control-section url-section">
            <div className="section-label"><span>03</span><span>{copy.language}</span></div>
            <div className="language-switch" role="radiogroup" aria-label={copy.language}>
              <button className={language === "en" ? "selected" : ""} onClick={() => setLanguage("en")} role="radio" aria-checked={language === "en"}>English</button>
              <button className={language === "zh" ? "selected" : ""} onClick={() => setLanguage("zh")} role="radio" aria-checked={language === "zh"}>中文</button>
            </div>
          </div>

          <div className="control-section url-section">
            <div className="section-label"><span>04</span><span>{copy.imageUrl}</span></div>
            <div className="url-box"><code>{publicUrl}</code><button className="copy-button" onClick={copyUrl} aria-label={copy.copy} title={copy.copy}>{copied ? copy.copied : copy.copy}</button></div>
            <div className="url-actions"><a href={publicUrl} target="_blank" rel="noreferrer">{copy.openSvg}</a><span>{copy.servedAs}</span></div>
          </div>
        </div>
      </section>

      <footer className="footer"><span>{copy.footer}</span><span>{copy.format}</span></footer>
    </main>
  );
}

export default App;
