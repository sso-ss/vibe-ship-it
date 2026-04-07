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

function hexToHSL(hex: string): { h: number; s: number; l: number } | null {
  const match = hex.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
    || hex.match(/^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (!match) return null;

  let r = parseInt(match[1].length === 1 ? match[1] + match[1] : match[1], 16) / 255;
  let g = parseInt(match[2].length === 1 ? match[2] + match[2] : match[2], 16) / 255;
  let b = parseInt(match[3].length === 1 ? match[3] + match[3] : match[3], 16) / 255;

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

  // Only work with hex colors for role detection
  const hexColors = colors.filter(c => /^#[0-9a-f]{3,8}$/i.test(c));

  // Sort by lightness
  const withHSL = hexColors.map(c => ({ color: c, hsl: hexToHSL(c) })).filter(c => c.hsl !== null);

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
  const borderColors = hexColors.filter(c => !assigned.has(c) && sources.get(c)?.has('border'));
  if (borderColors.length > 0) {
    roles.push({ value: borderColors[0], role: 'Border', source: 'border' }); assigned.add(borderColors[0]);
  }

  // Surface: near-white but not pure white, used in background
  const surfaces = withHSL.filter(c => c.hsl!.l >= 90 && c.hsl!.l < 100 && !assigned.has(c.color));
  if (surfaces.length > 0) {
    roles.push({ value: surfaces[0].color, role: 'Surface', source: 'background' }); assigned.add(surfaces[0].color);
  }

  // Remaining unassigned
  for (const c of hexColors) {
    if (!assigned.has(c)) {
      roles.push({ value: c, role: '', source: [...(sources.get(c) || ['other'])][0] });
    }
  }

  // Non-hex colors (rgba, etc)
  for (const c of colors) {
    if (!/^#[0-9a-f]{3,8}$/i.test(c)) {
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
    const accessibleSources: string[] = [];
    const blockedSources: string[] = [];

    // Pass 1: Fetch HTML
    let html: string;
    try {
      const res = await fetch(fetchURL, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return { error: `Could not reach ${parsedURL.hostname} (${res.status})` };
      html = await res.text();
      accessibleSources.push(fetchURL);
    } catch {
      return { error: `Could not reach ${parsedURL.hostname}. Check the URL and try again.` };
    }

    // Extract from HTML
    const htmlData = extractFromHTML(html);
    let allCSS = htmlData.styleTags + "\n" + htmlData.inlineCSS;

    // Pass 2: Fetch linked stylesheets
    for (const cssURL of htmlData.stylesheetURLs.slice(0, 5)) {
      const fullURL = cssURL.startsWith("http")
        ? cssURL
        : new URL(cssURL, fetchURL).toString();
      try {
        const res = await fetch(fullURL, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            Accept: "text/css",
          },
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const css = await res.text();
          allCSS += "\n" + css;
          accessibleSources.push(fullURL);
        } else {
          blockedSources.push(fullURL);
        }
      } catch {
        blockedSources.push(fullURL);
      }
    }

    // Extract tokens from all collected CSS
    const extracted = extractFromCSS(allCSS);

    const tokens: ExtractedTokens = {
      url: fetchURL,
      colors: extracted.colors || [],
      colorRoles: extracted.colorRoles || [],
      fonts: extracted.fonts || [],
      fontSizes: extracted.fontSizes || [],
      fontWeights: extracted.fontWeights || [],
      radii: extracted.radii || [],
      shadows: extracted.shadows || [],
      spacing: extracted.spacing || [],
      transitions: extracted.transitions || [],
      cssVars: extracted.cssVars || {},
      meta: htmlData.meta,
      accessibleSources,
      blockedSources,
    };

    const markdown = generateDesignMD(tokens);

    return { tokens, markdown };
  } catch {
    return { error: "Something went wrong during extraction. Try a different URL." };
  }
}
