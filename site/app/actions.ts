"use server";

interface ColorRole {
  value: string;
  role: string;
  source: string; // "background" | "text" | "border" | "accent" | "meta" | "other"
}

interface ExtractedTokens {
  url: string;
  colors: string[];
  colorRoles: ColorRole[];
  fonts: string[];
  fontSizes: string[];
  fontWeights: string[];
  radii: string[];
  shadows: string[];
  spacing: string[];
  transitions: string[];
  cssVars: Record<string, string>;
  meta: {
    themeColor?: string;
    title?: string;
    googleFonts?: string[];
  };
  accessibleSources: string[];
  blockedSources: string[];
}

function colorToHSL(color: string): { h: number; s: number; l: number } | null {
  let r: number, g: number, b: number;

  // Handle rgb(r, g, b) and rgba(r, g, b, a)
  const rgbMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    r = parseInt(rgbMatch[1]) / 255;
    g = parseInt(rgbMatch[2]) / 255;
    b = parseInt(rgbMatch[3]) / 255;
  } else {
    // Handle hex
    const hexMatch = color.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
      || color.match(/^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i);
    if (!hexMatch) return null;
    r = parseInt(hexMatch[1].length === 1 ? hexMatch[1] + hexMatch[1] : hexMatch[1], 16) / 255;
    g = parseInt(hexMatch[2].length === 1 ? hexMatch[2] + hexMatch[2] : hexMatch[2], 16) / 255;
    b = parseInt(hexMatch[3].length === 1 ? hexMatch[3] + hexMatch[3] : hexMatch[3], 16) / 255;
  }

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function assignColorRoles(
  colors: string[],
  sources: Map<string, Set<string>>
): ColorRole[] {
  const roles: ColorRole[] = [];
  const assigned = new Set<string>();

  // Parse all colors (hex, rgb, rgba)
  const withHSL = colors
    .map(c => ({ color: c, hsl: colorToHSL(c) }))
    .filter(c => c.hsl !== null);

  // Find roles by lightness + saturation + source
  const backgrounds = withHSL.filter(c => c.hsl!.l >= 95);
  const darks = withHSL.filter(c => c.hsl!.l <= 20);
  const chromatic = withHSL.filter(c => c.hsl!.s > 30 && c.hsl!.l > 20 && c.hsl!.l < 85);
  const grays = withHSL.filter(c => c.hsl!.s <= 10 && c.hsl!.l > 20 && c.hsl!.l < 95);

  // Background: lightest color used in background properties
  const bgFromCSS = backgrounds.find(c => sources.get(c.color)?.has('background'));
  const bg = bgFromCSS || backgrounds[0];
  if (bg) { roles.push({ value: bg.color, role: 'Background', source: 'background' }); assigned.add(bg.color); }

  // Text primary: darkest color used in text
  const textDarks = darks.filter(c => sources.get(c.color)?.has('text'));
  const textPrimary = textDarks[0] || darks[0];
  if (textPrimary && !assigned.has(textPrimary.color)) {
    roles.push({ value: textPrimary.color, role: 'Text Primary', source: 'text' }); assigned.add(textPrimary.color);
  }

  // Accent: most saturated chromatic color
  const sorted = [...chromatic].sort((a, b) => b.hsl!.s - a.hsl!.s);
  const accent = sorted[0];
  if (accent && !assigned.has(accent.color)) {
    roles.push({ value: accent.color, role: 'Accent', source: 'accent' }); assigned.add(accent.color);
  }

  // Secondary accent: next most saturated
  const accent2 = sorted.find(c => !assigned.has(c.color));
  if (accent2) {
    roles.push({ value: accent2.color, role: 'Accent Secondary', source: 'accent' }); assigned.add(accent2.color);
  }

  // Text secondary: mid-lightness gray used in text
  const textGrays = grays
    .filter(c => !assigned.has(c.color))
    .sort((a, b) => a.hsl!.l - b.hsl!.l);
  if (textGrays.length > 0) {
    roles.push({ value: textGrays[0].color, role: 'Text Secondary', source: 'text' }); assigned.add(textGrays[0].color);
  }
  if (textGrays.length > 1) {
    roles.push({ value: textGrays[1].color, role: 'Text Tertiary', source: 'text' }); assigned.add(textGrays[1].color);
  }

  // Border: colors used in border properties
  const borderColors = colors.filter(c => !assigned.has(c) && sources.get(c)?.has('border'));
  if (borderColors.length > 0) {
    roles.push({ value: borderColors[0], role: 'Border', source: 'border' }); assigned.add(borderColors[0]);
  }

  // Surface: near-white but not pure white, used in background
  const surfaces = withHSL.filter(c => c.hsl!.l >= 90 && c.hsl!.l < 100 && !assigned.has(c.color));
  if (surfaces.length > 0) {
    roles.push({ value: surfaces[0].color, role: 'Surface', source: 'background' }); assigned.add(surfaces[0].color);
  }

  // Remaining unassigned
  for (const c of colors) {
    if (!assigned.has(c)) {
      const src = [...(sources.get(c) || ['other'])][0];
      roles.push({ value: c, role: '', source: src });
    }
  }

  return roles.slice(0, 24);
}

function extractFromCSS(css: string): Partial<ExtractedTokens> {
  const colors = new Set<string>();
  const colorSources = new Map<string, Set<string>>(); // color → set of sources
  const fonts = new Set<string>();
  const fontSizes = new Set<string>();
  const fontWeights = new Set<string>();
  const radii = new Set<string>();
  const shadows = new Set<string>();
  const spacing = new Set<string>();
  const transitions = new Set<string>();
  const cssVars: Record<string, string> = {};

  function trackColor(color: string, source: string) {
    const c = color.toLowerCase();
    colors.add(c);
    if (!colorSources.has(c)) colorSources.set(c, new Set());
    colorSources.get(c)!.add(source);
  }

  // CSS custom properties
  const varMatches = css.matchAll(/--([a-zA-Z0-9-]+)\s*:\s*([^;]+)/g);
  for (const m of varMatches) {
    cssVars[`--${m[1]}`] = m[2].trim();
  }

  // Colors from background properties
  const bgMatches = css.matchAll(/background(?:-color)?\s*:\s*([^;{}]+)/g);
  for (const m of bgMatches) {
    const val = m[1].trim();
    const hexes = val.match(/#(?:[0-9a-fA-F]{3,4}){1,2}\b/g);
    if (hexes) for (const h of hexes) trackColor(h, 'background');
    const rgbs = val.match(/(?:rgba?|hsla?)\([^)]+\)/g);
    if (rgbs) for (const r of rgbs) trackColor(r, 'background');
  }

  // Colors from color property (text)
  const textMatches = css.matchAll(/(?:^|[{;\s])color\s*:\s*([^;{}]+)/g);
  for (const m of textMatches) {
    const val = m[1].trim();
    const hexes = val.match(/#(?:[0-9a-fA-F]{3,4}){1,2}\b/g);
    if (hexes) for (const h of hexes) trackColor(h, 'text');
    const rgbs = val.match(/(?:rgba?|hsla?)\([^)]+\)/g);
    if (rgbs) for (const r of rgbs) trackColor(r, 'text');
  }

  // Colors from border properties
  const borderMatches = css.matchAll(/border(?:-color)?\s*:\s*([^;{}]+)/g);
  for (const m of borderMatches) {
    const val = m[1].trim();
    const hexes = val.match(/#(?:[0-9a-fA-F]{3,4}){1,2}\b/g);
    if (hexes) for (const h of hexes) trackColor(h, 'border');
    const rgbs = val.match(/(?:rgba?|hsla?)\([^)]+\)/g);
    if (rgbs) for (const r of rgbs) trackColor(r, 'border');
  }

  // Remaining hex and rgb colors (from any property)
  const hexMatches = css.matchAll(/#(?:[0-9a-fA-F]{3,4}){1,2}\b/g);
  for (const m of hexMatches) {
    const c = m[0].toLowerCase();
    if (!colors.has(c)) trackColor(c, 'other');
  }
  const rgbMatches = css.matchAll(/(?:rgba?|hsla?)\([^)]+\)/g);
  for (const m of rgbMatches) {
    if (!colors.has(m[0])) trackColor(m[0], 'other');
  }

  // Font families -- stop at braces/selectors, strip !important
  const fontMatches = css.matchAll(/font-family\s*:\s*([^;{}]+)/g);
  for (const m of fontMatches) {
    let val = m[1].trim().split('}')[0].split('{')[0].trim();
    val = val.replace(/\s*!important\s*$/, '');
    if (val.length < 200 && !val.includes('.') && !val.includes(':')) fonts.add(val);
  }

  // Font sizes -- clean values only
  const sizeMatches = css.matchAll(/font-size\s*:\s*([^;{}]+)/g);
  for (const m of sizeMatches) {
    let val = m[1].trim().split('}')[0].split('{')[0].trim();
    val = val.replace(/\s*!important\s*$/, '');
    if (val.length < 60) fontSizes.add(val);
  }

  // Font weights -- only keep numeric or keyword values
  const weightMatches = css.matchAll(/font-weight\s*:\s*([^;{}]+)/g);
  for (const m of weightMatches) {
    let val = m[1].trim().split('}')[0].split('{')[0].trim();
    val = val.replace(/\s*!important\s*$/, '');
    if (val.length < 40) fontWeights.add(val);
  }

  // Border radius -- only keep clean values, strip !important
  const radiusMatches = css.matchAll(/border-radius\s*:\s*([^;{}]+)/g);
  for (const m of radiusMatches) {
    let val = m[1].trim().split('}')[0].split('{')[0].trim();
    val = val.replace(/\s*!important\s*$/, '');
    if (val.length < 60) radii.add(val);
  }

  // Box shadows -- only keep clean values, strip !important
  const shadowMatches = css.matchAll(/box-shadow\s*:\s*([^;{}]+)/g);
  for (const m of shadowMatches) {
    let val = m[1].trim().split('}')[0].split('{')[0].trim();
    val = val.replace(/\s*!important\s*$/, '');
    if (val.length < 150 && val !== 'none' && val !== 'initial' && val !== 'inherit') shadows.add(val);
  }

  // Spacing (padding, margin, gap)
  const spacingMatches = css.matchAll(/(?:padding|margin|gap)\s*:\s*([^;]+)/g);
  for (const m of spacingMatches) spacing.add(m[1].trim());

  // Transitions
  const transMatches = css.matchAll(/transition\s*:\s*([^;]+)/g);
  for (const m of transMatches) transitions.add(m[1].trim());

  return {
    colors: [...colors].slice(0, 30),
    colorRoles: assignColorRoles([...colors], colorSources),
    fonts: [...fonts].slice(0, 10),
    fontSizes: [...fontSizes].slice(0, 20),
    fontWeights: [...fontWeights].slice(0, 10),
    radii: [...radii].slice(0, 10),
    shadows: [...shadows].slice(0, 10),
    spacing: [...spacing].slice(0, 20),
    transitions: [...transitions].slice(0, 10),
    cssVars,
  };
}

function extractFromHTML(html: string): {
  inlineCSS: string;
  styleTags: string;
  meta: ExtractedTokens["meta"];
  stylesheetURLs: string[];
} {
  const meta: ExtractedTokens["meta"] = {};

  // Theme color
  const themeMatch = html.match(
    /<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i
  );
  if (themeMatch) meta.themeColor = themeMatch[1];

  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) meta.title = titleMatch[1].trim();

  // Google Fonts
  const gfMatches = html.matchAll(
    /href=["']https:\/\/fonts\.googleapis\.com\/css2?\?([^"']+)["']/g
  );
  const googleFonts: string[] = [];
  for (const m of gfMatches) {
    const familyMatch = m[1].match(/family=([^&"']+)/);
    if (familyMatch) googleFonts.push(decodeURIComponent(familyMatch[1]));
  }
  if (googleFonts.length) meta.googleFonts = googleFonts;

  // Inline style attributes
  const inlineStyles: string[] = [];
  const inlineMatches = html.matchAll(/style=["']([^"']+)["']/g);
  for (const m of inlineMatches) {
    inlineStyles.push(m[1]);
  }

  // Style tags
  const styleBlocks: string[] = [];
  const styleMatches = html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g);
  for (const m of styleMatches) {
    styleBlocks.push(m[1]);
  }

  // Stylesheet URLs
  const linkMatches = html.matchAll(
    /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/g
  );
  const linkMatches2 = html.matchAll(
    /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']stylesheet["']/g
  );
  const urls = new Set<string>();
  for (const m of linkMatches) urls.add(m[1]);
  for (const m of linkMatches2) urls.add(m[1]);

  return {
    inlineCSS: inlineStyles.join("; "),
    styleTags: styleBlocks.join("\n"),
    meta,
    stylesheetURLs: [...urls],
  };
}

function generateDesignMD(tokens: ExtractedTokens): string {
  const siteName = tokens.meta.title || new URL(tokens.url).hostname;

  let md = `# DESIGN.md -- ${siteName}\n\n`;

  // Extraction note
  if (tokens.blockedSources.length > 0) {
    md += `> **Extraction note:** ${tokens.blockedSources.length} CSS source(s) were not accessible.\n`;
    md += `> Some values may be incomplete. Run this through your AI agent for interpretation.\n\n`;
  }

  // Section 1: Identity
  md += `## 1. Identity\n\n`;
  md += `**In one line:** [Describe the visual personality after reviewing the tokens below]\n\n`;
  md += `**Signature Techniques:**\n`;
  md += `- [Fill in after reviewing extracted tokens]\n\n`;

  // Section 2: Color
  md += `## 2. Color\n\n`;
  md += `### Palette\n`;
  md += `| Token | Value | Role |\n`;
  md += `|-------|-------|------|\n`;

  if (tokens.meta.themeColor) {
    md += `| \`accent\` | \`${tokens.meta.themeColor}\` | Brand / theme color (from meta tag) |\n`;
  }

  // Use assigned color roles
  const rolesWithLabel = tokens.colorRoles.filter(c => c.role);
  const rolesWithout = tokens.colorRoles.filter(c => !c.role);

  for (const cr of rolesWithLabel) {
    const token = cr.role.toLowerCase().replace(/\s+/g, '-');
    md += `| \`${token}\` | \`${cr.value}\` | ${cr.role} |\n`;
  }
  for (const cr of rolesWithout.slice(0, 10)) {
    md += `| \`--\` | \`${cr.value}\` | [${cr.source}] |\n`;
  }

  // CSS variables that look like colors
  for (const [key, val] of Object.entries(tokens.cssVars)) {
    if (val.match(/#[0-9a-f]{3,8}|rgba?|hsla?/i)) {
      md += `| \`${key}\` | \`${val}\` | [from CSS variable] |\n`;
    }
  }

  md += `\n`;

  // Section 3: Typography
  md += `## 3. Typography\n\n`;
  md += `### Fonts\n`;
  if (tokens.meta.googleFonts?.length) {
    for (const f of tokens.meta.googleFonts) {
      md += `- **Google Font:** ${f}\n`;
    }
  }
  if (tokens.fonts.length) {
    for (const f of tokens.fonts.slice(0, 5)) {
      md += `- ${f}\n`;
    }
  }

  md += `\n### Scale\n`;
  md += `| Size | Source |\n`;
  md += `|------|--------|\n`;
  const sortedSizes = [...new Set(tokens.fontSizes)].slice(0, 15);
  for (const s of sortedSizes) {
    md += `| ${s} | extracted |\n`;
  }

  md += `\n### Weights\n`;
  for (const w of tokens.fontWeights) {
    md += `- ${w}\n`;
  }

  md += `\n`;

  // Section 4: Spacing & Layout
  md += `## 4. Spacing & Layout\n\n`;
  md += `### Extracted Spacing Values\n`;
  for (const s of tokens.spacing.slice(0, 15)) {
    md += `- ${s}\n`;
  }

  md += `\n### Border Radius\n`;
  md += `| Value | Used on |\n`;
  md += `|-------|--------|\n`;
  for (const r of tokens.radii) {
    md += `| ${r} | [assign context] |\n`;
  }

  md += `\n`;

  // Section 5: Depth & Motion
  md += `## 5. Depth & Motion\n\n`;
  md += `### Shadows\n`;
  md += `| Shadow Value | Use |\n`;
  md += `|-------------|-----|\n`;
  for (const s of tokens.shadows) {
    md += `| \`${s}\` | [assign context] |\n`;
  }

  md += `\n### Transitions\n`;
  for (const t of tokens.transitions) {
    md += `- \`${t}\`\n`;
  }

  md += `\n`;

  // Section 6: Components
  md += `## 6. Components\n\n`;
  md += `[Build component specs from the tokens above using your AI agent]\n\n`;

  // Section 7: States
  md += `## 7. States\n\n`;
  md += `[Define hover, focus, active, disabled, loading, empty, error states]\n\n`;

  // Section 8: Rules
  md += `## 8. Rules\n\n`;
  md += `### Do\n`;
  md += `- [Generate rules from the patterns above using your AI agent]\n\n`;
  md += `### Don't\n`;
  md += `- [Generate anti-patterns from the tokens above]\n\n`;
  md += `### Responsive\n`;
  md += `- [Extract breakpoints and adaptation rules]\n`;

  // Source info
  md += `\n---\n`;
  md += `\n### Extraction Sources\n`;
  md += `- URL: ${tokens.url}\n`;
  for (const s of tokens.accessibleSources) {
    md += `- Accessible: ${s}\n`;
  }
  for (const s of tokens.blockedSources) {
    md += `- Blocked: ${s}\n`;
  }
  md += `\n> To complete this file, paste it into your AI agent and say:\n`;
  md += `> "Fill in the Identity, Components, States, and Rules sections based on these extracted tokens."\n`;

  return md;
}

export async function extractDesignTokens(
  url: string
): Promise<{ tokens: ExtractedTokens; markdown: string } | { error: string }> {
  try {
    // Validate URL
    let parsedURL: URL;
    try {
      parsedURL = new URL(
        url.startsWith("http") ? url : `https://${url}`
      );
    } catch {
      return { error: "Invalid URL. Try something like stripe.com" };
    }

    const fetchURL = parsedURL.toString();

    // Launch headless browser -- use @sparticuz/chromium on Vercel, Playwright locally
    const isVercel = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

    let browser: { newPage: () => Promise<any>; close: () => Promise<void> };

    if (isVercel) {
      const chromium = (await import("@sparticuz/chromium")).default;
      const puppeteer = (await import("puppeteer-core")).default;
      try {
        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: { width: 1440, height: 900 },
          executablePath: await chromium.executablePath(),
          headless: true,
        });
      } catch {
        return { error: "Could not launch browser on server." };
      }
    } else {
      const { chromium: pw } = await import("playwright-core");
      const os = await import("os");
      const fs = await import("fs");
      const path = await import("path");
      const cacheDir = path.join(os.homedir(), "Library", "Caches", "ms-playwright");
      let execPath: string | undefined;
      try {
        const dirs = fs.readdirSync(cacheDir).filter((d: string) => d.startsWith("chromium-"));
        for (const dir of dirs) {
          const candidate = path.join(cacheDir, dir, "chrome-mac-arm64", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing");
          if (fs.existsSync(candidate)) { execPath = candidate; break; }
          const candidate2 = path.join(cacheDir, dir, "chrome-mac", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing");
          if (fs.existsSync(candidate2)) { execPath = candidate2; break; }
        }
      } catch { /* ignore */ }

      try {
        browser = await pw.launch({
          headless: true,
          ...(execPath ? { executablePath: execPath } : {}),
        });
      } catch {
        return { error: "Could not launch browser. Chromium may not be installed." };
      }
    }

    try {
      const page = await browser.newPage();
      // Puppeteer uses setViewport, Playwright uses setViewportSize
      if ('setViewport' in page) {
        await page.setViewport({ width: 1440, height: 900 });
      } else if ('setViewportSize' in page) {
        await page.setViewportSize({ width: 1440, height: 900 });
      }
      await page.goto(fetchURL, { waitUntil: "domcontentloaded", timeout: 15000 });

      // Wait briefly for CSS-in-JS to render
      await new Promise(r => setTimeout(r, 1000));

      // Run the extraction snippet in the browser context
      const extracted = await page.evaluate(() => {
        const colors = new Map<string, Set<string>>();
        const fonts = new Set<string>();
        const fontSizes = new Set<string>();
        const fontWeights = new Set<string>();
        const radii = new Set<string>();
        const shadows = new Set<string>();
        const spacing = new Set<string>();
        const cssVars: Record<string, string> = {};

        // Extract CSS custom properties from stylesheets
        try {
          for (const sheet of document.styleSheets) {
            try {
              for (const rule of sheet.cssRules) {
                const style = (rule as CSSStyleRule).style;
                if (style) {
                  for (let i = 0; i < style.length; i++) {
                    const prop = style[i];
                    if (prop.startsWith("--")) {
                      cssVars[prop] = style.getPropertyValue(prop).trim();
                    }
                  }
                }
              }
            } catch { /* cross-origin */ }
          }
        } catch { /* no sheets */ }

        // Get :root computed variables
        const rootStyles = getComputedStyle(document.documentElement);

        const trackColor = (val: string, src: string) => {
          if (
            val &&
            val !== "rgba(0, 0, 0, 0)" &&
            val !== "transparent" &&
            val !== "inherit" &&
            val !== "initial"
          ) {
            if (!colors.has(val)) colors.set(val, new Set());
            colors.get(val)!.add(src);
          }
        };

        // Sample visible elements
        const elements = document.querySelectorAll(
          "body *:not(script):not(style):not(link):not(meta):not(noscript)"
        );
        const sampled = Array.from(elements).slice(0, 300);

        for (const el of sampled) {
          const s = getComputedStyle(el);

          trackColor(s.color, "text");
          trackColor(s.backgroundColor, "background");
          trackColor(s.borderColor, "border");
          trackColor(s.borderTopColor, "border");

          if (s.fontFamily) fonts.add(s.fontFamily);
          if (s.fontSize && s.fontSize !== "0px") fontSizes.add(s.fontSize);
          if (s.fontWeight) fontWeights.add(s.fontWeight);
          if (s.borderRadius && s.borderRadius !== "0px") radii.add(s.borderRadius);
          if (s.boxShadow && s.boxShadow !== "none") shadows.add(s.boxShadow);
          if (s.padding && s.padding !== "0px") spacing.add(s.padding);
          if (s.gap && s.gap !== "normal") spacing.add(s.gap);
        }

        // Theme color meta
        const themeMeta = document.querySelector('meta[name="theme-color"]');
        const themeColor = themeMeta
          ? themeMeta.getAttribute("content")
          : undefined;

        // Google Fonts
        const gfLinks = document.querySelectorAll(
          'link[href*="fonts.googleapis.com"]'
        );
        const googleFonts: string[] = [];
        gfLinks.forEach((link) => {
          const href = link.getAttribute("href") || "";
          const match = href.match(/family=([^&"']+)/);
          if (match) googleFonts.push(decodeURIComponent(match[1]));
        });

        // Serialize Maps/Sets to plain objects
        const colorArr: { value: string; sources: string[] }[] = [];
        colors.forEach((srcs, val) => {
          colorArr.push({ value: val, sources: Array.from(srcs) });
        });

        return {
          title: document.title,
          themeColor,
          googleFonts,
          colors: colorArr.slice(0, 40),
          fonts: Array.from(fonts).slice(0, 10),
          fontSizes: Array.from(fontSizes)
            .sort((a, b) => parseFloat(a) - parseFloat(b))
            .slice(0, 20),
          fontWeights: Array.from(fontWeights).sort().slice(0, 10),
          radii: Array.from(radii).slice(0, 10),
          shadows: Array.from(shadows).slice(0, 10),
          spacing: Array.from(spacing).slice(0, 20),
          cssVars,
        };
      });

      await browser.close();

      // Build color roles from the browser-extracted data
      const allColors = extracted.colors.map((c: { value: string; sources: string[] }) => c.value);
      const colorSourceMap = new Map<string, Set<string>>();
      for (const c of extracted.colors as { value: string; sources: string[] }[]) {
        colorSourceMap.set(c.value, new Set(c.sources));
      }
      const colorRoles = assignColorRoles(allColors, colorSourceMap);

      const tokens: ExtractedTokens = {
        url: fetchURL,
        colors: allColors,
        colorRoles,
        fonts: extracted.fonts,
        fontSizes: extracted.fontSizes,
        fontWeights: extracted.fontWeights,
        radii: extracted.radii,
        shadows: extracted.shadows,
        spacing: extracted.spacing,
        transitions: [],
        cssVars: extracted.cssVars,
        meta: {
          title: extracted.title,
          themeColor: extracted.themeColor || undefined,
          googleFonts: extracted.googleFonts.length
            ? extracted.googleFonts
            : undefined,
        },
        accessibleSources: [fetchURL],
        blockedSources: [],
      };

      const markdown = generateDesignMD(tokens);
      return { tokens, markdown };
    } catch (e) {
      await browser.close();
      return {
        error: `Could not load ${parsedURL.hostname}. The site may be blocking automated access.`,
      };
    }
  } catch {
    return { error: "Something went wrong during extraction. Try a different URL." };
  }
}
