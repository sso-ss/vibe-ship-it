// Server-only extraction logic — imported by API route, NOT by client components

interface ColorRole {
  value: string;
  role: string;
  source: string; // "background" | "text" | "border" | "accent" | "meta" | "other"
}

interface ComponentPatterns {
  header: {
    height: string;
    position: string;
    bg: string;
    blur: boolean;
    logoSide: string;
    ctaCount: number;
    linkCount: number;
  } | null;
  footer: {
    bg: string;
    columns: number;
    linkCount: number;
    hasLogo: boolean;
  } | null;
  sections: {
    maxWidth: string;
    padding: string;
    columns: number;
    gap: string;
    bg: string;
    textAlign: string;
  }[];
  cards: {
    layout: 'vertical' | 'horizontal';
    imagePosition: 'top' | 'left' | 'right' | 'none';
    imageFullBleed: boolean;
    hasBorder: boolean;
    hasShadow: boolean;
    radius: string;
    padding: string;
    innerPadding: string;
    imgHeight: string;
  }[];
  buttons: {
    radius: string;
    bg: string;
    color: string;
    border: string;
    padding: string;
    text: string;
  }[];
  dropdown: {
    radius: string;
    bg: string;
    border: string;
    shadow: string;
    itemPadding: string;
    itemRadius: string;
  } | null;
}

interface ExtractedTokens {
  url: string;
  colors: string[];
  colorRoles: ColorRole[];
  fonts: string[];
  fontSizes: string[];
  fontWeights: string[];
  radii: string[];
  radiusByComponent: Record<string, { value: string; corners: { tl: string; tr: string; br: string; bl: string }; count: number; sample: string }[]>;
  shadows: string[];
  spacing: string[];
  transitions: string[];
  cssVars: Record<string, string>;
  meta: {
    themeColor?: string;
    title?: string;
    googleFonts?: string[];
  };
  componentPatterns?: ComponentPatterns;
  pageStructure?: {
    order: number;
    type: string;
    heading: string;
    subheading: string;
    description: string;
    ctaTexts: string[];
    layout: string;
    columns: number;
    bg: string;
    hasImage: boolean;
    imageCount: number;
    cardCount: number;
    ctaCount: number;
    textAlign: string;
    maxWidth: string;
  }[];
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

  // Accent: most saturated chromatic color that appears in text or background (not just borders)
  // Skip stray focus ring blues and outline colors
  const meaningfulChromatic = chromatic.filter(c => {
    const srcs = sources.get(c.color);
    return srcs && (srcs.has('text') || srcs.has('background'));
  });
  const sorted = [...meaningfulChromatic].sort((a, b) => b.hsl!.s - a.hsl!.s);
  // Only assign accent if saturation is strong enough (> 40%) to be intentional
  const accent = sorted.find(c => c.hsl!.s > 40);
  if (accent && !assigned.has(accent.color)) {
    roles.push({ value: accent.color, role: 'Accent', source: 'accent' }); assigned.add(accent.color);
  }

  // Secondary accent: next most saturated from meaningful sources
  const accent2 = sorted.find(c => !assigned.has(c.color) && c.hsl!.s > 40);
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

  // Colors from border properties (including directional borders)
  const borderMatches = css.matchAll(/border(?:-(?:top|bottom|left|right|inline|block))?(?:-color)?\s*:\s*([^;{}]+)/g);
  for (const m of borderMatches) {
    const val = m[1].trim();
    if (val === 'none' || val === '0' || val === 'inherit' || val === 'initial') continue;
    const hexes = val.match(/#(?:[0-9a-fA-F]{3,4}){1,2}\b/g);
    if (hexes) for (const h of hexes) trackColor(h, 'border');
    const rgbs = val.match(/(?:rgba?|hsla?)\([^)]+\)/g);
    if (rgbs) for (const r of rgbs) trackColor(r, 'border');
  }
  // Also check outline colors
  const outlineMatches = css.matchAll(/outline(?:-color)?\s*:\s*([^;{}]+)/g);
  for (const m of outlineMatches) {
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
    radiusByComponent: {},
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
    md += `> Some values may be incomplete.\n\n`;
  }

  // Helper: detect if a color is chromatic (not gray/black/white)
  function isColorChromatic(color: string): boolean {
    const m = color.match(/rgb[a]?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (m) {
      const max = Math.max(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]));
      const min = Math.min(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]));
      return (max - min) > 40;
    }
    return false;
  }

  // Build derived values for auto-filling sections
  const primaryFont = tokens.fonts[0]?.split(',')[0]?.replace(/['"]/g, '').trim() || 'system font';
  const accentRole = tokens.colorRoles.find(c => c.role === 'Accent');
  const bgRole = tokens.colorRoles.find(c => c.role === 'Background');
  const textRole = tokens.colorRoles.find(c => c.role === 'Text Primary');
  const cp = tokens.componentPatterns;
  const realBtn = cp?.buttons?.find(b => {
    const m = b.bg.match(/rgb[a]?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (!m || b.bg === 'rgba(0, 0, 0, 0)') return false;
    const max = Math.max(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]));
    const min = Math.min(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]));
    return (max - min) > 40;
  });
  const rbcData = tokens.radiusByComponent || {};
  const btnRadiusFromComp = rbcData.button?.[0]?.value;
  const cardRadiusFromComp = rbcData.card?.[0]?.value;
  const btnRadius = btnRadiusFromComp || realBtn?.radius || tokens.radii[0] || '4px';
  const cardData = cp?.cards?.[0];
  // Find the most common card radius across all detected cards
  const mostCommonCardRadius = (() => {
    if (!cp?.cards?.length) return null;
    const counts = new Map<string, number>();
    for (const c of cp.cards) {
      if (c.radius && parseFloat(c.radius) > 0) counts.set(c.radius, (counts.get(c.radius) || 0) + 1);
    }
    let best = '';
    let bestCount = 0;
    for (const [r, n] of counts) { if (n > bestCount) { best = r; bestCount = n; } }
    return best || null;
  })();
  const cardRadius = mostCommonCardRadius || cardRadiusFromComp || cardData?.radius || btnRadius;
  const hasRoundedCorners = parseFloat(btnRadius) >= 8;
  const hasPillButtons = tokens.radii.includes('9999px') || (rbcData.badge?.[0]?.value === '9999px');
  const hasShadowCards = cardData?.hasShadow && !cardData?.hasBorder;

  // Section 1: Identity (auto-generated)
  md += `## 1. Identity\n\n`;
  const shapeDesc = hasPillButtons ? 'pill-shaped buttons' : hasRoundedCorners ? 'soft rounded corners' : 'sharp, precise corners';
  const cardDesc = hasShadowCards ? 'shadow-elevated cards' : cardData?.hasBorder ? 'bordered cards' : 'minimal containers';
  const fontDesc = primaryFont.includes('serif') && !primaryFont.includes('sans') ? 'serif typography' : `${primaryFont} typography`;
  md += `**In one line:** ${shapeDesc}, ${cardDesc}, ${fontDesc} on a ${bgRole ? 'clean' : 'neutral'} canvas.\n\n`;
  md += `**Signature Techniques:**\n`;
  if (accentRole) md += `- Brand accent: \`${accentRole.value}\` used on primary CTAs\n`;
  if (hasPillButtons) md += `- Pill buttons (9999px radius)\n`;
  if (hasShadowCards) md += `- Shadow-elevated cards with no visible border\n`;
  if (cardData?.imageFullBleed) md += `- Full-bleed images in cards (no inner padding on media)\n`;
  if (cp?.header?.blur) md += `- Frosted glass navigation with backdrop-blur\n`;
  const uniqueShadow = tokens.shadows.find(s => s.includes('inset'));
  if (uniqueShadow) md += `- Inset shadow-as-border technique\n`;
  md += `- Primary font: ${primaryFont}\n\n`;

  // Section 2: Color (cleaned up, no raw CSS var dump)
  md += `## 2. Color\n\n`;
  md += `### Palette\n`;
  md += `| Token | Value | Role | Confidence |\n`;
  md += `|-------|-------|------|------------|\n`;

  if (tokens.meta.themeColor) {
    md += `| \`accent\` | \`${tokens.meta.themeColor}\` | Brand color (meta tag) | extracted |\n`;
  }

  // Only output assigned color roles
  for (const cr of tokens.colorRoles.filter(c => c.role)) {
    const token = cr.role.toLowerCase().replace(/\s+/g, '-');
    md += `| \`${token}\` | \`${cr.value}\` | ${cr.role} | extracted |\n`;
  }
  // Add a few unassigned but useful colors (skip blacks/whites/transparents)
  const usefulUnassigned = tokens.colorRoles
    .filter(c => !c.role && c.source !== 'other')
    .filter(c => !c.value.includes('rgba(0, 0, 0, 0)') && c.value !== 'rgb(0, 0, 0)' && c.value !== 'rgb(255, 255, 255)')
    .slice(0, 5);
  for (const cr of usefulUnassigned) {
    md += `| \`--\` | \`${cr.value}\` | ${cr.source} | extracted |\n`;
  }

  // CSS variables: only output semantic ones (skip Tailwind internals)
  const semanticVars = Object.entries(tokens.cssVars)
    .filter(([key, val]) => {
      if (key.startsWith('--tw-')) return false; // Skip Tailwind internals
      if (key.startsWith('--_')) return false;
      if (!val.match(/#[0-9a-f]{3,8}|rgba?\(|hsla?\(/i)) return false;
      return true;
    })
    .slice(0, 15);
  if (semanticVars.length > 0) {
    md += `\n### CSS Variables\n`;
    md += `| Variable | Value |\n|----------|-------|\n`;
    for (const [key, val] of semanticVars) {
      md += `| \`${key}\` | \`${val}\` |\n`;
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
    md += `- **Primary:** ${tokens.fonts[0]}\n`;
    for (const f of tokens.fonts.slice(1, 4)) {
      md += `- ${f}\n`;
    }
  }

  md += `\n### Scale\n`;
  md += `| Role | Size | Confidence |\n`;
  md += `|------|------|------------|\n`;
  const sortedSizes = [...new Set(tokens.fontSizes)].slice(0, 15);
  // Try to assign roles based on size
  const sizeRoles: Record<string, string> = {};
  for (const s of sortedSizes) {
    const px = parseFloat(s);
    if (px >= 48) sizeRoles[s] = 'Display';
    else if (px >= 32) sizeRoles[s] = 'H1';
    else if (px >= 24) sizeRoles[s] = 'H2';
    else if (px >= 20) sizeRoles[s] = 'H3';
    else if (px >= 16 && px < 18) sizeRoles[s] = 'Body';
    else if (px >= 14 && px < 16) sizeRoles[s] = 'Body Small';
    else if (px >= 12 && px < 14) sizeRoles[s] = 'Caption';
    else if (px < 12) sizeRoles[s] = 'Micro';
    else sizeRoles[s] = 'Heading';
  }
  for (const s of sortedSizes) {
    md += `| ${sizeRoles[s] || '--'} | ${s} | extracted |\n`;
  }

  md += `\n### Weights\n`;
  for (const w of tokens.fontWeights) {
    const label = w === '400' ? '(body)' : w === '500' ? '(medium)' : w === '600' ? '(semibold)' : w === '700' ? '(bold)' : '';
    md += `- ${w} ${label}\n`;
  }

  md += `\n`;

  // Section 4: Spacing & Layout
  md += `## 4. Spacing & Layout\n\n`;

  // Determine base unit from spacing values
  const spacingValues = tokens.spacing.map(s => parseFloat(s)).filter(n => !isNaN(n) && n > 0);
  const baseUnit = spacingValues.length > 0 ? (spacingValues.filter(v => v <= 8).length > spacingValues.length / 2 ? '4px' : '8px') : '8px';
  md += `### Base Unit\n${baseUnit} grid (inferred from spacing values).\n\n`;

  md += `### Border Radius\n`;

  // Use radiusByComponent if available (precise, per-component)
  const rbc = tokens.radiusByComponent;
  if (rbc && Object.keys(rbc).length > 0) {
    md += `| Component | Radius | Occurrences | Source |\n`;
    md += `|-----------|--------|-------------|--------|\n`;
    // Order: button, input, card, badge, modal, dropdown, toggle, tab, nav, avatar, container, other
    const compOrder = ['button', 'input', 'card', 'badge', 'modal', 'dropdown', 'toggle', 'tab', 'nav', 'avatar', 'container', 'other'];
    const sortedComps = Object.keys(rbc).sort((a, b) => {
      const ai = compOrder.indexOf(a);
      const bi = compOrder.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
    for (const comp of sortedComps) {
      const entries = rbc[comp];
      // Show top 2 most common per component
      for (const entry of entries.slice(0, 2)) {
        md += `| ${comp} | \`${entry.value}\` | x${entry.count} | computed (getComputedStyle) |\n`;
      }
    }

    // Derive the radius scale from unique values across components
    const allValues = new Set<string>();
    for (const entries of Object.values(rbc)) {
      for (const e of entries) allValues.add(e.value);
    }
    const sorted = Array.from(allValues).sort((a, b) => parseFloat(a) - parseFloat(b));
    if (sorted.length > 1) {
      md += `\n**Radius scale:** ${sorted.map(v => `\`${v}\``).join(' / ')}\n`;
    }
  } else {
    // Fallback: flat list
    md += `| Value | Use |\n`;
    md += `|-------|-----|\n`;
    for (const r of tokens.radii) {
      const px = parseFloat(r);
      const use = px >= 999 ? 'Pills, badges, avatars' : px >= 20 ? 'Large cards, hero sections' : px >= 12 ? 'Cards, containers' : px >= 8 ? 'Buttons, inputs' : px >= 4 ? 'Small elements, tags' : px >= 2 ? 'Subtle rounding' : 'Sharp';
      md += `| ${r} | ${use} |\n`;
    }
  }

  md += `\n`;

  // Section 5: Depth & Motion
  md += `## 5. Depth & Motion\n\n`;
  md += `### Shadows\n`;
  md += `| Level | Value | Use |\n`;
  md += `|-------|-------|-----|\n`;
  for (const s of tokens.shadows) {
    const isInset = s.includes('inset');
    const isHeavy = s.includes('80px') || s.includes('40px');
    const isMid = s.includes('24px') || s.includes('16px');
    const level = isInset ? 'Inset' : isHeavy ? 'High' : isMid ? 'Mid' : 'Low';
    const use = isInset ? 'Border technique, image containers' : isHeavy ? 'Modals, hero elements' : isMid ? 'Dropdowns, elevated panels' : 'Cards, subtle lift';
    md += `| ${level} | \`${s.slice(0, 80)}${s.length > 80 ? '...' : ''}\` | ${use} |\n`;
  }

  md += `\n`;

  // Section 6: Page Visual Structure
  md += `## 6. Page Structure\n\n`;

  if (tokens.componentPatterns) {
    const cp2 = tokens.componentPatterns;

    // Header wireframe
    if (cp2.header) {
      const h = cp2.header;
      md += `### Header\n`;
      md += `\`\`\`\n`;
      const headerBg = h.bg === 'rgba(0, 0, 0, 0)' ? 'transparent' : h.bg.slice(0, 30);
      md += `[ Logo (${h.logoSide}) ] [ ${h.linkCount} nav links ] [ ${h.ctaCount > 0 ? h.ctaCount + ' CTA(s)' : 'no CTA'} ]\n`;
      md += `height: ${h.height} | position: ${h.position} | bg: ${headerBg}${h.blur ? ' | backdrop-blur' : ''}\n`;
      md += `\`\`\`\n\n`;
    }

    // Page sections wireframe
    const ps = tokens.pageStructure;
    if (ps && ps.length > 0) {
      md += `### Page Flow\n`;
      md += `The page has ${ps.length} section${ps.length > 1 ? 's' : ''} in this order:\n\n`;
      for (const s of ps) {
        const bgDesc = s.bg === 'rgba(0, 0, 0, 0)' || s.bg === 'transparent' ? '' : ` (bg: \`${s.bg.slice(0, 30)}\`)`;
        md += `**${s.order}. ${s.type.charAt(0).toUpperCase() + s.type.slice(1)}**${bgDesc}\n`;

        // Copy PATTERN (not actual text)
        if (s.heading) {
          const wordCount = s.heading.split(/\s+/).length;
          const hasComma = s.heading.includes(',');
          const tone = wordCount <= 4 ? 'short punchy' : wordCount <= 8 ? 'medium' : 'long descriptive';
          md += `- Heading: [${tone} headline, ~${wordCount} words${hasComma ? ', compound sentence' : ''}]\n`;
        }
        if (s.subheading) {
          const wordCount = s.subheading.split(/\s+/).length;
          md += `- Subheading: [supporting line, ~${wordCount} words]\n`;
        }
        if (s.description) {
          const wordCount = s.description.split(/\s+/).length;
          const sentenceCount = s.description.split(/[.!?]+/).filter(x => x.trim()).length;
          md += `- Body: [${sentenceCount} sentence${sentenceCount > 1 ? 's' : ''}, ~${wordCount} words]\n`;
        }
        if (s.ctaTexts.length > 0) {
          const ctaPatterns = s.ctaTexts.map(t => {
            const words = t.split(/\s+/).length;
            const hasArrow = t.includes('>') || t.includes('→');
            return `[${words}-word action${hasArrow ? ' + arrow' : ''}]`;
          });
          md += `- CTA: ${ctaPatterns.join(', ')} (${s.ctaTexts.length} button${s.ctaTexts.length > 1 ? 's' : ''})\n`;
        }

        // Layout
        md += `- Layout: ${s.layout}`;
        const extras: string[] = [];
        if (s.maxWidth && s.maxWidth !== 'none') extras.push(`max-width: ${s.maxWidth}`);
        if (s.imageCount > 0) extras.push(`${s.imageCount} image${s.imageCount > 1 ? 's' : ''}`);
        if (s.cardCount > 0) extras.push(`${s.cardCount} card${s.cardCount > 1 ? 's' : ''}`);
        if (s.textAlign === 'center') extras.push('centered');
        if (extras.length > 0) md += `, ${extras.join(', ')}`;
        md += `\n\n`;
      }
    }

    // Footer wireframe
    if (cp2.footer) {
      const f = cp2.footer;
      md += `### Footer\n`;
      md += `\`\`\`\n`;
      const colStr = Array.from({ length: f.columns }, (_, i) => `[ Column ${i + 1} ]`).join(' ');
      md += `${f.hasLogo ? '[ Logo ] ' : ''}${colStr}\n`;
      md += `${f.linkCount} links | ${f.columns} columns | bg: ${f.bg.slice(0, 30)}\n`;
      md += `\`\`\`\n\n`;
    }
  }

  md += `## 7. Components\n\n`;

  if (tokens.componentPatterns) {
    const cp = tokens.componentPatterns;

    // Header data table (kept for reference)
    if (cp.header) {
      md += `### Header\n`;
      md += `| Property | Value |\n|----------|-------|\n`;
      md += `| height | ${cp.header.height} |\n`;
      md += `| position | ${cp.header.position} |\n`;
      md += `| background | \`${cp.header.bg}\` |\n`;
      md += `| backdrop-blur | ${cp.header.blur ? 'yes' : 'no'} |\n`;
      md += `| logo | ${cp.header.logoSide} side |\n`;
      md += `| nav links | ${cp.header.linkCount} |\n`;
      md += `| CTA buttons | ${cp.header.ctaCount} |\n\n`;
    }

    // Buttons: only show buttons with visible backgrounds (not nav tabs)
    const ctaButtons = cp.buttons.filter(b =>
      b.bg !== 'rgba(0, 0, 0, 0)' && b.bg !== 'transparent'
    );
    if (ctaButtons.length > 0) {
      md += `### Buttons (detected)\n`;
      md += `| Text | Background | Color | Radius | Border | Padding |\n`;
      md += `|------|-----------|-------|--------|--------|--------|\n`;
      for (const b of ctaButtons.slice(0, 5)) {
        md += `| "${b.text}" | \`${b.bg}\` | \`${b.color}\` | ${b.radius} | ${b.border} | ${b.padding} |\n`;
      }
      md += `\n`;
    } else if (cp.buttons.length > 0) {
      // Show all if no CTA buttons found
      md += `### Buttons (detected)\n`;
      md += `| Text | Background | Color | Radius | Border | Padding |\n`;
      md += `|------|-----------|-------|--------|--------|--------|\n`;
      for (const b of cp.buttons.slice(0, 5)) {
        md += `| "${b.text}" | \`${b.bg}\` | \`${b.color}\` | ${b.radius} | ${b.border} | ${b.padding} |\n`;
      }
      md += `\n`;
    }

    // Cards
    if (cp.cards.length > 0) {
      md += `### Cards (detected)\n`;
      md += `| Property | Value |\n|----------|-------|\n`;
      const c = cp.cards[0];
      md += `| layout | ${c.layout} |\n`;
      md += `| image position | ${c.imagePosition} |\n`;
      md += `| image full-bleed | ${c.imageFullBleed ? 'yes (flush to edges)' : 'no (padded)'} |\n`;
      md += `| border | ${c.hasBorder ? 'yes' : 'no'} |\n`;
      md += `| shadow | ${c.hasShadow ? 'yes' : 'no'} |\n`;
      md += `| radius | ${c.radius} |\n`;
      md += `| outer padding | ${c.padding} |\n`;
      md += `| content padding | ${c.innerPadding} |\n`;
      md += `| image height | ${c.imgHeight} |\n`;
      if (cp.cards.length > 1) {
        md += `\n*${cp.cards.length} card variants detected. Above shows the primary pattern.*\n`;
      }
      md += `\n`;
    }

    // Section layouts
    if (cp.sections.length > 0) {
      md += `### Section Layout\n`;
      md += `| Section | Columns | Max Width | Padding | Gap | Background |\n`;
      md += `|---------|---------|-----------|---------|-----|------------|\n`;
      cp.sections.forEach((s, i) => {
        md += `| ${i + 1} | ${s.columns} | ${s.maxWidth} | ${s.padding} | ${s.gap} | \`${s.bg}\` |\n`;
      });
      md += `\n`;
    }

    // Footer
    if (cp.footer) {
      md += `### Footer\n`;
      md += `| Property | Value |\n|----------|-------|\n`;
      md += `| background | \`${cp.footer.bg}\` |\n`;
      md += `| columns | ${cp.footer.columns} |\n`;
      md += `| links | ${cp.footer.linkCount} |\n`;
      md += `| has logo | ${cp.footer.hasLogo ? 'yes' : 'no'} |\n\n`;
    }
  } else {
    md += `[Build component specs from the tokens above using your AI agent]\n\n`;
  }

  // Section 8: States (auto-generated from extracted data)
  md += `## 8. States\n\n`;
  md += `| State | Treatment |\n`;
  md += `|-------|----------|\n`;
  // Determine hover behavior from card/button data
  const hoverBehavior = hasShadowCards ? 'Shadow elevation increases' : 'Background shifts to surface color';
  md += `| Hover | ${hoverBehavior} |\n`;
  md += `| Focus | Focus ring using border-focus color, 2px offset |\n`;
  md += `| Active | scale(0.97) press effect |\n`;
  md += `| Disabled | opacity: 0.5, cursor: not-allowed |\n`;
  md += `| Loading | Spinner or skeleton placeholder |\n\n`;

  // Section 9: Rules (auto-generated from extracted patterns)
  md += `## 9. Rules\n\n`;
  md += `### Do\n`;
  if (textRole) md += `- Use \`${textRole.value}\` for primary text, not pure black\n`;
  if (bgRole) md += `- Use \`${bgRole.value}\` for page background\n`;
  if (accentRole) md += `- Use \`${accentRole.value}\` for primary CTAs and links\n`;
  if (realBtn || btnRadiusFromComp) md += `- Use \`${btnRadius}\` radius on buttons\n`;
  if (cardData || cardRadiusFromComp) md += `- Use \`${cardRadius}\` radius on cards\n`;
  if (cardData?.imageFullBleed) md += `- Images in cards should be flush to edges (no padding)\n`;
  if (hasShadowCards) md += `- Use shadow for card elevation, not borders\n`;
  md += `- Use ${primaryFont} as the primary font\n`;
  md += `\n### Don't\n`;
  if (textRole && textRole.value !== 'rgb(0, 0, 0)') md += `- Don't use pure black for text\n`;
  if (hasPillButtons) md += `- Don't use sharp corners on buttons (use 9999px pill)\n`;
  else if (hasRoundedCorners) md += `- Don't use sharp corners on interactive elements\n`;
  else md += `- Don't use large border-radius (keep corners sharp)\n`;
  if (hasShadowCards) md += `- Don't add visible borders to cards (use shadow only)\n`;
  if (cardData && !cardData.hasBorder && !cardData.hasShadow) md += `- Don't over-elevate cards with heavy shadows\n`;
  md += `- Don't mix fonts (stick to ${primaryFont})\n`;
  md += `\n### Responsive\n`;
  if (cp?.sections?.length) {
    const maxCols = Math.max(...cp.sections.map(s => s.columns));
    md += `- Grid columns: ${maxCols} on desktop, collapse to 1 on mobile\n`;
    const maxWidth = cp.sections.find(s => s.maxWidth !== 'none')?.maxWidth;
    if (maxWidth) md += `- Max content width: ${maxWidth}\n`;
  }
  md += `- Reduce heading sizes by ~40% on mobile\n`;
  md += `- Compress section padding on small screens\n`;

  // Source info
  md += `\n---\n`;
  md += `Source: ${tokens.url}\n`;

  return md;
}

function generateTailwindConfig(tokens: ExtractedTokens): string {
  const colors: Record<string, string> = {};
  for (const cr of tokens.colorRoles) {
    if (cr.role) {
      const key = cr.role.toLowerCase().replace(/\s+/g, '-');
      colors[key] = cr.value;
    }
  }

  const radii: Record<string, string> = {};
  // Use radiusByComponent for precise mapping if available
  const rbc = tokens.radiusByComponent;
  if (rbc && Object.keys(rbc).length > 0) {
    // Map component types to Tailwind token names
    const compToToken: Record<string, string> = { button: 'md', input: 'md', card: 'lg', badge: 'full', modal: 'xl', dropdown: 'lg', avatar: 'full' };
    for (const [comp, entries] of Object.entries(rbc)) {
      if (entries.length > 0) {
        const val = entries[0].value;
        const token = compToToken[comp];
        if (token && !radii[token]) radii[token] = val;
      }
    }
    // Collect all unique values and fill in missing tokens by size
    const allVals = new Set<string>();
    for (const entries of Object.values(rbc)) {
      for (const e of entries) allVals.add(e.value);
    }
    for (const v of allVals) {
      const px = parseFloat(v);
      if (px >= 9999 && !radii['full']) radii['full'] = v;
      else if (px <= 6 && !radii['sm']) radii['sm'] = v;
      else if (px <= 12 && !radii['md']) radii['md'] = v;
      else if (px <= 24 && !radii['lg']) radii['lg'] = v;
      else if (!radii['xl'] && px > 24 && px < 9999) radii['xl'] = v;
    }
  } else {
    for (const r of tokens.radii) {
      if (r === '9999px') radii['full'] = r;
      else if (parseFloat(r) <= 6) radii['sm'] = r;
      else if (parseFloat(r) <= 12) radii['md'] = r;
      else if (parseFloat(r) <= 24) radii['lg'] = r;
      else radii['xl'] = r;
    }
  }

  const shadows: Record<string, string> = {};
  tokens.shadows.forEach((s, i) => {
    if (s.includes('inset')) shadows['ring'] = s;
    else shadows[`level-${i + 1}`] = s;
  });

  const weights: Record<string, string> = {};
  for (const w of tokens.fontWeights) {
    if (w === '400') weights['normal'] = w;
    else if (w === '500') weights['medium'] = w;
    else if (w === '600') weights['semibold'] = w;
    else if (w === '700') weights['bold'] = w;
    else weights[`w-${w}`] = w;
  }

  let config = `// Auto-generated from DESIGN.md tokens\n`;
  config += `// Add to tailwind.config.ts under theme.extend\n\n`;
  config += `export const designTokens = {\n`;
  config += `  colors: ${JSON.stringify(colors, null, 4)},\n`;
  config += `  borderRadius: ${JSON.stringify(radii, null, 4)},\n`;
  config += `  boxShadow: ${JSON.stringify(shadows, null, 4)},\n`;
  config += `  fontWeight: ${JSON.stringify(weights, null, 4)},\n`;
  config += `};\n`;

  return config;
}

function generateCSSVariables(tokens: ExtractedTokens): string {
  let css = `/* Auto-generated from DESIGN.md tokens */\n`;
  css += `:root {\n`;

  for (const cr of tokens.colorRoles) {
    if (cr.role) {
      const key = cr.role.toLowerCase().replace(/\s+/g, '-');
      css += `  --${key}: ${cr.value};\n`;
    }
  }

  tokens.radii.forEach((r, i) => {
    if (r === '9999px') css += `  --radius-full: ${r};\n`;
    else css += `  --radius-${i + 1}: ${r};\n`;
  });

  tokens.shadows.forEach((s, i) => {
    if (s.includes('inset')) css += `  --shadow-ring: ${s};\n`;
    else css += `  --shadow-${i + 1}: ${s};\n`;
  });

  if (tokens.fonts.length > 0) {
    css += `  --font-primary: ${tokens.fonts[0]};\n`;
  }

  css += `}\n`;
  return css;
}

export async function extractDesignTokens(
  url: string
): Promise<{ tokens: ExtractedTokens; markdown: string; tailwindConfig: string; cssVariables: string; pageStructure: string[] } | { error: string }> {
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

    let browser: { newPage: () => Promise<any>; close: () => Promise<void> };
    try {
      const isVercel = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
      if (isVercel) {
        const chromium = (await import("@sparticuz/chromium")).default;
        const puppeteer = (await import("puppeteer-core")).default;
        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: { width: 1440, height: 900 },
          executablePath: await chromium.executablePath(),
          headless: true,
        });
      } else {
        /* eslint-disable @typescript-eslint/no-require-imports */
        const os = require("os");
        const fs = require("fs");
        const path = require("path");
        /* eslint-enable @typescript-eslint/no-require-imports */
        const { chromium: pw } = await import("playwright-core");
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
        browser = await pw.launch({
          headless: true,
          ...(execPath ? { executablePath: execPath } : {}),
        });
      }
    } catch {
      return { error: "Could not launch browser." };
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

      // Wait for page to render, then try to dismiss cookie banners
      await new Promise(r => setTimeout(r, 1500));
      try {
        // Common cookie banner dismiss patterns
        await page.evaluate(() => {
          const dismissTexts = ['accept', 'agree', 'got it', 'ok', 'close', 'dismiss', 'reject all', 'reject'];
          const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
          for (const btn of buttons) {
            const text = (btn.textContent || '').trim().toLowerCase();
            if (dismissTexts.some(d => text === d || text.startsWith(d))) {
              (btn as HTMLElement).click();
              break;
            }
          }
          // Also try clicking common cookie banner close buttons
          const closeBtn = document.querySelector('[class*="cookie"] button, [id*="cookie"] button, [class*="consent"] button, [class*="banner"] [aria-label="Close"]');
          if (closeBtn) (closeBtn as HTMLElement).click();
        });
        await new Promise(r => setTimeout(r, 500));
      } catch { /* ignore cookie banner errors */ }

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

        // --- Component-aware radius tracking ---
        function classifyElement(el: Element): string {
          const tag = el.tagName.toLowerCase();
          const role = (el.getAttribute('role') || '').toLowerCase();
          const cls = (el.className && typeof el.className === 'string') ? el.className.toLowerCase() : '';
          const type = (el.getAttribute('type') || '').toLowerCase();

          if (tag === 'button' || role === 'button' || type === 'submit' || type === 'button'
              || /\b(btn|button)\b/.test(cls)) return 'button';
          if (tag === 'input' || tag === 'textarea' || tag === 'select' || role === 'textbox'
              || role === 'combobox' || role === 'searchbox' || /\b(input|field|search)\b/.test(cls)) return 'input';
          if (/\b(badge|tag|chip|pill|label)\b/.test(cls) || role === 'status') return 'badge';
          if (tag === 'dialog' || role === 'dialog' || role === 'alertdialog'
              || /\b(modal|dialog|drawer|sheet)\b/.test(cls)) return 'modal';
          if (tag === 'nav' || role === 'navigation' || /\b(nav|navbar|header|topbar|sidebar)\b/.test(cls)) return 'nav';
          if (role === 'tab' || role === 'tablist' || /\b(tab)\b/.test(cls)) return 'tab';
          if (role === 'menu' || role === 'listbox' || /\b(dropdown|menu|popover|tooltip|select)\b/.test(cls)) return 'dropdown';
          if (/\b(card|tile|panel|feature|pricing|testimonial)\b/.test(cls)) return 'card';
          if (tag === 'img' || /\b(avatar|thumb|profile)\b/.test(cls)) return 'avatar';
          if (/\b(toggle|switch)\b/.test(cls) || role === 'switch') return 'toggle';

          // Heuristic: visible containers with bg/border/shadow that contain children
          // Be strict: only classify as 'card' if it looks like a card, not a section wrapper
          const s = getComputedStyle(el);
          const bg = s.backgroundColor;
          const bw = s.borderWidth;
          const shadow = s.boxShadow;
          const hasSurface = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
          const hasBorder = bw && parseFloat(bw) > 0;
          const hasShadow = shadow && shadow !== 'none';
          if ((hasSurface || hasBorder || hasShadow) && el.children.length > 0) {
            const rect = el.getBoundingClientRect();
            // Cards are typically < 800px wide and not full-viewport-width sections
            // Also skip very tall elements (likely sections/pages, not cards)
            const viewW = window.innerWidth;
            const isFullWidth = rect.width > viewW * 0.85;
            const isTooTall = rect.height > 600;
            if (!isFullWidth && !isTooTall && rect.width > 100 && rect.height > 60) return 'card';
            if (rect.width > 40 && rect.height > 20 && rect.width < 400) return 'container';
          }
          return 'other';
        }

        const radiusEntries = new Map<string, { component: string; shorthand: string; corners: { tl: string; tr: string; br: string; bl: string }; count: number; sample: string }>();

        function trackRadius(el: Element, s: CSSStyleDeclaration) {
          const tl = s.borderTopLeftRadius;
          const tr = s.borderTopRightRadius;
          const br = s.borderBottomRightRadius;
          const bl = s.borderBottomLeftRadius;
          if ((!tl || tl === '0px') && (!tr || tr === '0px') && (!br || br === '0px') && (!bl || bl === '0px')) return;
          const shorthand = s.borderRadius || [tl, tr, br, bl].join(' ');
          const component = classifyElement(el);
          const key = component + '|' + shorthand;
          if (radiusEntries.has(key)) {
            radiusEntries.get(key)!.count++;
          } else {
            const tag = el.tagName.toLowerCase();
            const clsStr = (el.className && typeof el.className === 'string')
              ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
            radiusEntries.set(key, {
              component,
              shorthand,
              corners: { tl: tl || '0px', tr: tr || '0px', br: br || '0px', bl: bl || '0px' },
              count: 1,
              sample: tag + clsStr,
            });
          }
        }

        // Extract CSS custom properties AND font-family declarations from stylesheets
        const fontFaceNames = new Set<string>();
        const cssFontFamilies = new Set<string>();
        try {
          for (const sheet of document.styleSheets) {
            try {
              for (const rule of sheet.cssRules) {
                // CSS variables
                const style = (rule as CSSStyleRule).style;
                if (style) {
                  for (let i = 0; i < style.length; i++) {
                    const prop = style[i];
                    if (prop.startsWith("--")) {
                      cssVars[prop] = style.getPropertyValue(prop).trim();
                    }
                  }
                  // font-family from CSS rules (catches heading-specific declarations)
                  const ff = style.getPropertyValue("font-family").trim();
                  if (ff) {
                    fonts.add(ff);
                    // Also track the primary name separately
                    const primary = ff.split(",")[0].trim().replace(/['"]/g, "");
                    if (primary) cssFontFamilies.add(primary);
                  }
                }
                // @font-face declarations
                if ((rule as CSSFontFaceRule).type === 5) {
                  const ffRule = rule as CSSFontFaceRule;
                  const family = ffRule.style.getPropertyValue("font-family").trim().replace(/['"]/g, "");
                  if (family) fontFaceNames.add(family);
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
        const sampled = Array.from(elements).slice(0, 500);

        for (const el of sampled) {
          const s = getComputedStyle(el);

          trackColor(s.color, "text");
          trackColor(s.backgroundColor, "background");
          // Use individual border sides (borderColor can return multi-value strings)
          trackColor(s.borderTopColor, "border");
          trackColor(s.borderRightColor, "border");
          trackColor(s.borderBottomColor, "border");
          trackColor(s.borderLeftColor, "border");

          if (s.fontFamily) fonts.add(s.fontFamily);
          if (s.fontSize && s.fontSize !== "0px") fontSizes.add(s.fontSize);
          if (s.fontWeight) fontWeights.add(s.fontWeight);
          // Per-component radius tracking (also keep flat set for backward compat)
          trackRadius(el, s);
          const tlRadius = s.borderTopLeftRadius;
          if (tlRadius && tlRadius !== "0px") radii.add(tlRadius);
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

        // Detect page visual structure
        const structure: string[] = [];
        const pageStructure: {
          order: number;
          type: string;
          heading: string;
          subheading: string;
          description: string;
          ctaTexts: string[];
          layout: string;
          columns: number;
          bg: string;
          hasImage: boolean;
          imageCount: number;
          cardCount: number;
          ctaCount: number;
          textAlign: string;
          maxWidth: string;
        }[] = [];

        const nav = document.querySelector("nav, header");
        if (nav) {
          const links = nav.querySelectorAll("a").length;
          structure.push("Nav: " + (nav.tagName === "NAV" ? "Semantic nav" : "Header") + ", " + links + " links");
        }

        // Find all major sections: try semantic elements first, then fall back to visual analysis
        let sectionCandidates = Array.from(document.querySelectorAll("main > section, body > section, main > div > section, [role='region']"));
        
        // If too few semantic sections found, try class-based
        if (sectionCandidates.length < 3) {
          const classBased = Array.from(document.querySelectorAll("[class*='section'], [class*='Section'], [class*='hero'], [class*='Hero'], [class*='banner'], [class*='Banner']"));
          sectionCandidates = [...sectionCandidates, ...classBased];
        }
        
        // If still too few, try direct children of main/body that are tall enough
        if (sectionCandidates.length < 3) {
          const mainEl = document.querySelector("main") || document.body;
          const directKids = Array.from(mainEl.children).filter(el => {
            const tag = el.tagName.toLowerCase();
            if (['script', 'style', 'link', 'meta', 'nav', 'header', 'footer'].includes(tag)) return false;
            const rect = el.getBoundingClientRect();
            return rect.height > 100 && rect.width > 200;
          });
          sectionCandidates = [...sectionCandidates, ...directKids];
        }

        const seenRects = new Set<string>();
        let sectionIndex = 0;

        sectionCandidates.forEach((sec) => {
          if (sectionIndex > 10) return;
          const rect = sec.getBoundingClientRect();
          // Skip tiny or duplicate sections
          if (rect.height < 50 || rect.width < 200) return;
          const rectKey = `${Math.round(rect.top)}-${Math.round(rect.height)}`;
          if (seenRects.has(rectKey)) return;
          seenRects.add(rectKey);

          const ss = getComputedStyle(sec);
          const headings = sec.querySelectorAll("h1, h2, h3");
          const heading = headings.length > 0 ? (headings[0].textContent?.trim().slice(0, 60) || "") : "";
          const h1 = sec.querySelector("h1");
          const images = sec.querySelectorAll("img");
          const buttons = sec.querySelectorAll("button, a[class*='btn'], a[class*='cta'], a[class*='button'], [role='button']");
          const cardEls = sec.querySelectorAll("[class*='card'], [class*='Card'], [class*='item'], [class*='feature']");
          const videos = sec.querySelectorAll("video, iframe[src*='youtube'], iframe[src*='vimeo']");

          // Detect layout type with specific patterns
          const inner = sec.querySelector(":scope > div") || sec;
          const innerS = getComputedStyle(inner);
          let layout = "stacked";
          let columns = 1;

          if (innerS.display.includes("grid")) {
            const colTemplate = innerS.gridTemplateColumns || "";
            const colParts = colTemplate.split(/\s+/).filter(c => c !== "");
            columns = Math.min(colParts.length, 12);
            
            // Detect specific grid patterns
            const rowTemplate = innerS.gridTemplateRows || "";
            const hasUnequalCols = colParts.length >= 2 && new Set(colParts).size > 1;
            const hasMultipleRows = rowTemplate.split(/\s+/).filter(c => c !== "").length > 1;
            
            if (columns >= 2 && hasUnequalCols && hasMultipleRows) layout = "bento grid";
            else if (columns === 2 && !hasUnequalCols) layout = "split (50/50)";
            else if (columns === 2 && hasUnequalCols) layout = "asymmetric split";
            else if (columns >= 3) layout = `${columns}-column grid`;
            else layout = "single column";
          } else if (innerS.display.includes("flex")) {
            if (innerS.flexDirection === "column") {
              layout = "stacked";
            } else {
              columns = Array.from(inner.children).filter(c => {
                const cs2 = getComputedStyle(c);
                return cs2.display !== 'none' && c.getBoundingClientRect().width > 50;
              }).length;
              
              if (columns === 2) {
                // Check if 50/50 or asymmetric
                const kids = Array.from(inner.children).filter(c => getComputedStyle(c).display !== 'none');
                if (kids.length === 2) {
                  const w1 = kids[0].getBoundingClientRect().width;
                  const w2 = kids[1].getBoundingClientRect().width;
                  const ratio = Math.min(w1, w2) / Math.max(w1, w2);
                  layout = ratio > 0.7 ? "split (50/50)" : "asymmetric split";
                } else {
                  layout = "2-column flex";
                }
              } else if (columns >= 3) {
                layout = `${columns}-column flex`;
              } else {
                layout = "single column";
              }
            }
          }
          
          // Additional layout detection from content patterns
          if (layout === "stacked" && images.length === 1 && headings.length >= 1 && rect.height > 300) {
            layout = "hero (text + image stacked)";
          }
          if (layout.includes("split") && images.length >= 1 && headings.length >= 1) {
            layout = layout.replace("split", "split (text + media)");
          }

          // Detect section type
          let type = "content";
          if (h1 && sectionIndex === 0) type = "hero";
          else if (heading.toLowerCase().includes("pricing") || sec.querySelector("[class*='price'], [class*='Price']")) type = "pricing";
          else if (heading.toLowerCase().includes("testimonial") || heading.toLowerCase().includes("review") || heading.toLowerCase().includes("saying")) type = "testimonials";
          else if (heading.toLowerCase().includes("faq") || heading.toLowerCase().includes("question")) type = "faq";
          else if (cardEls.length >= 3) type = "card grid";
          else if (images.length >= 3 && cardEls.length === 0) type = "gallery";
          else if (videos.length > 0) type = "video";
          else if (columns >= 2 && images.length >= 2) type = "features";
          else if (buttons.length >= 1 && headings.length >= 1 && images.length === 0 && rect.height < 400) type = "cta";

          // Extract copy: heading, subheading, description, CTA texts
          const subheadingEl = sec.querySelector("h2, h3, h4");
          const subheading = subheadingEl && subheadingEl !== headings[0]
            ? (subheadingEl.textContent?.trim().slice(0, 80) || "") : "";
          
          // Find description: first <p> that isn't tiny
          const paragraphs = sec.querySelectorAll("p");
          let description = "";
          for (const p of Array.from(paragraphs)) {
            const text = (p.textContent || "").trim();
            if (text.length > 20 && text.length < 300) {
              description = text.slice(0, 120);
              break;
            }
          }

          // CTA button texts
          const ctaTexts: string[] = [];
          buttons.forEach(btn => {
            const text = (btn.textContent || "").trim();
            if (text.length > 1 && text.length < 40) ctaTexts.push(text);
          });

          pageStructure.push({
            order: sectionIndex + 1,
            type,
            heading,
            subheading,
            description,
            ctaTexts: ctaTexts.slice(0, 3),
            layout,
            columns,
            bg: ss.backgroundColor,
            hasImage: images.length > 0,
            imageCount: images.length,
            cardCount: cardEls.length,
            ctaCount: buttons.length,
            textAlign: ss.textAlign,
            maxWidth: innerS.maxWidth !== "none" ? innerS.maxWidth : ss.maxWidth,
          });

          // Build text description
          let desc = `${type.charAt(0).toUpperCase() + type.slice(1)}`;
          if (heading) desc += `: "${heading}"`;
          if (columns > 1) desc += `, ${layout}`;
          if (images.length > 0) desc += `, ${images.length} image${images.length > 1 ? "s" : ""}`;
          if (cardEls.length > 0) desc += `, ${cardEls.length} cards`;
          structure.push(desc);
          sectionIndex++;
        });

        const footer = document.querySelector("footer");
        if (footer) {
          const links = footer.querySelectorAll("a").length;
          structure.push("Footer: " + links + " links");
        }

        // Detect component patterns from real elements
        const componentPatterns = (() => {
          const allEls = Array.from(document.querySelectorAll('body *:not(script):not(style)'));

          // === HEADER / NAV ===
          const navEl = document.querySelector('nav, header');
          let header: { height: string; position: string; bg: string; blur: boolean; logoSide: string; ctaCount: number; linkCount: number } | null = null;
          if (navEl) {
            const ns = getComputedStyle(navEl);
            const links = navEl.querySelectorAll('a');
            const buttons = navEl.querySelectorAll('button, [role="button"], a[class*="btn"], a[class*="cta"], a[class*="Button"]');
            header = {
              height: ns.height,
              position: ns.position,
              bg: ns.backgroundColor,
              blur: ns.backdropFilter?.includes('blur') || (ns as unknown as Record<string, string>)['webkitBackdropFilter']?.includes('blur') || false,
              logoSide: 'left',
              ctaCount: buttons.length,
              linkCount: links.length,
            };
          }

          // === FOOTER ===
          const footerEl = document.querySelector('footer');
          let footer: { bg: string; columns: number; linkCount: number; hasLogo: boolean } | null = null;
          if (footerEl) {
            const fs = getComputedStyle(footerEl);
            const cols = footerEl.querySelectorAll(':scope > div > div, :scope > div > ul, :scope > div > nav');
            footer = {
              bg: fs.backgroundColor,
              columns: Math.max(cols.length, 1),
              linkCount: footerEl.querySelectorAll('a').length,
              hasLogo: footerEl.querySelector('svg, img[alt*="logo"], img[src*="logo"]') !== null,
            };
          }

          // === SECTION LAYOUTS ===
          const sectionEls = document.querySelectorAll('main > section, main > div > section, body > section, [class*="section"]');
          const sections: { maxWidth: string; padding: string; columns: number; gap: string; bg: string; textAlign: string }[] = [];
          sectionEls.forEach((sec, i) => {
            if (i > 6) return;
            const ss = getComputedStyle(sec);
            // Look for grid/flex containers inside
            const inner = sec.querySelector(':scope > div') || sec;
            const is2 = getComputedStyle(inner);
            let columns = 1;
            if (is2.display.includes('grid')) {
              const cols = is2.gridTemplateColumns?.split(/\s+/).filter(c => c !== '').length || 1;
              columns = cols;
            } else if (is2.display.includes('flex') && is2.flexDirection !== 'column') {
              columns = inner.children.length;
            }
            sections.push({
              maxWidth: is2.maxWidth !== 'none' ? is2.maxWidth : ss.maxWidth,
              padding: ss.padding,
              columns: Math.min(columns, 12),
              gap: is2.gap !== 'normal' ? is2.gap : '0px',
              bg: ss.backgroundColor,
              textAlign: ss.textAlign,
            });
          });

          // === CARDS ===
          const cards: {
            layout: 'vertical' | 'horizontal';
            imagePosition: 'top' | 'left' | 'right' | 'none';
            imageFullBleed: boolean;
            hasBorder: boolean;
            hasShadow: boolean;
            radius: string;
            padding: string;
            innerPadding: string;
            imgHeight: string;
          }[] = [];

          const cardCandidates = allEls.filter(el => {
            const s = getComputedStyle(el);
            const r = parseFloat(s.borderTopLeftRadius);
            const rect = el.getBoundingClientRect();
            if (rect.width < 150 || rect.height < 80) return false;
            
            // Skip full-width sections and very tall elements
            const viewW = window.innerWidth;
            if (rect.width > viewW * 0.85 || rect.height > 600) return false;
            
            const hasVisualContainer = r >= 2 || s.boxShadow !== 'none'
              || (s.borderTopWidth !== '0px' && s.borderTopColor !== 'rgba(0, 0, 0, 0)');
            if (!hasVisualContainer) return false;
            
            // Has meaningful content: img+text, or colored bg+text, or shadow+text
            const hasImg = el.querySelector('img') !== null;
            const hasText = el.querySelector('h2, h3, h4, p, span') !== null;
            const hasBg = s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== 'transparent'
              && s.backgroundColor !== 'rgb(255, 255, 255)';
            
            // Card = (has image + text) OR (has colored bg + text + reasonable size)
            return (hasImg && hasText) || (hasBg && hasText && rect.width < 600 && rect.height < 500);
          }).slice(0, 10);

          for (const card of cardCandidates) {
            const s = getComputedStyle(card);
            const img = card.querySelector('img');
            const cardRect = card.getBoundingClientRect();

            const isHorizontal = s.display.includes('flex') && s.flexDirection === 'row'
              || s.display.includes('grid') && s.gridTemplateColumns?.split(/\s+/).length >= 2;

            let imageFullBleed = false;
            let imagePosition: 'top' | 'left' | 'right' | 'none' = 'none';
            let imgHeight = '0px';

            if (img) {
              const imgRect = img.getBoundingClientRect();
              const imgParent = img.closest('div, figure, picture') || img;
              const imgParentRect = imgParent.getBoundingClientRect();

              imageFullBleed = Math.abs(imgParentRect.left - cardRect.left) < 4
                || Math.abs(imgParentRect.top - cardRect.top) < 4;

              if (Math.abs(imgParentRect.top - cardRect.top) < 10) imagePosition = 'top';
              else if (Math.abs(imgParentRect.left - cardRect.left) < 10) imagePosition = 'left';
              else if (Math.abs(imgParentRect.right - cardRect.right) < 10) imagePosition = 'right';

              imgHeight = imgRect.height + 'px';
            }

            // Find the text container padding
            const textContainer = card.querySelector('div:not(:first-child)') || card;
            const tcs = getComputedStyle(textContainer);

            cards.push({
              layout: isHorizontal ? 'horizontal' : 'vertical',
              imagePosition,
              imageFullBleed,
              hasBorder: s.borderTopWidth !== '0px' && s.borderTopColor !== 'rgba(0, 0, 0, 0)',
              hasShadow: s.boxShadow !== 'none',
              radius: s.borderTopLeftRadius,
              padding: s.padding,
              innerPadding: tcs.padding,
              imgHeight,
            });
          }

          // === BUTTONS: detect by visual properties, not just class names ===
          const btnEls = allEls.filter(el => {
            const tag = el.tagName.toLowerCase();
            const role = el.getAttribute('role');
            const cls = el.className?.toString() || '';
            const text = (el.textContent || '').trim();
            if (!text || text.length > 40 || text.length < 2) return false;
            
            // Skip cookie/consent banner buttons
            const lowerText = text.toLowerCase();
            if (['accept', 'reject', 'manage cookies', 'cookie settings', 'agree', 'consent'].some(t => lowerText === t || lowerText.startsWith(t))) return false;
            const parentCls = (el.closest('[class*="cookie"], [class*="consent"], [class*="banner"], [id*="cookie"], [id*="consent"]'))?.className || '';
            if (parentCls) return false;
            
            // Match by tag/role
            if (tag === 'button') return true;
            if (role === 'button') return true;
            
            // Match by class name patterns
            if (cls.includes('btn') || cls.includes('cta') || cls.includes('button') || cls.includes('Button') || cls.includes('action')) return true;
            
            // Match <a> tags that look like buttons (have background color + padding)
            if (tag === 'a') {
              const s = getComputedStyle(el);
              const hasBg = s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== 'transparent';
              const hasPad = parseFloat(s.paddingLeft) >= 8 && parseFloat(s.paddingTop) >= 4;
              const hasRadius = parseFloat(s.borderTopLeftRadius) > 0;
              const hasBorder = s.borderTopWidth !== '0px' && s.borderTopColor !== 'rgba(0, 0, 0, 0)';
              if ((hasBg || hasBorder) && hasPad) return true;
              if (hasRadius && hasPad) return true;
            }
            return false;
          }).slice(0, 30);

          const buttons: {
            radius: string;
            bg: string;
            color: string;
            border: string;
            padding: string;
            text: string;
          }[] = [];

          for (const btn of btnEls) {
            const s = getComputedStyle(btn);
            const text = (btn.textContent || '').trim().slice(0, 30);
            if (!text || s.display === 'none' || s.visibility === 'hidden') continue;
            buttons.push({
              radius: s.borderTopLeftRadius,
              bg: s.backgroundColor,
              color: s.color,
              border: s.borderTopWidth !== '0px' ? `${s.borderTopWidth} solid ${s.borderTopColor}` : 'none',
              padding: s.padding,
              text,
            });
          }

          // === DROPDOWN / MENU: detect from nav or page ===
          // Dropdowns are often display:none until hovered, so also check hidden elements
          const dropdownData: { radius: string; bg: string; border: string; shadow: string; itemPadding: string; itemRadius: string } | null = (() => {
            const selectors = '[role="menu"], [role="listbox"], [class*="dropdown"], [class*="Dropdown"], [class*="menu-panel"], [class*="MenuPanel"], [class*="submenu"], [class*="SubMenu"], [class*="popover"], [class*="Popover"], [class*="flyout"], [class*="Flyout"], [class*="nav-panel"], [class*="NavPanel"], [class*="mega-menu"], [class*="MegaMenu"]';
            
            // Priority 1: inside nav/header
            const navEl = document.querySelector('nav, header');
            let candidates: Element[] = [];
            if (navEl) {
              candidates = Array.from(navEl.querySelectorAll(selectors));
            }
            // Priority 2: anywhere on page
            if (candidates.length === 0) {
              candidates = Array.from(document.querySelectorAll(selectors));
            }
            
            // Check candidates including hidden ones
            for (const el of candidates) {
              const s = getComputedStyle(el);
              // Read styles even from hidden elements (display:none, visibility:hidden, opacity:0)
              const radius = s.borderTopLeftRadius;
              const bg = s.backgroundColor;
              const shadow = s.boxShadow;
              const borderW = s.borderTopWidth;
              const borderC = s.borderTopColor;
              
              const hasBg = bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
              const hasShadow = shadow !== 'none';
              const hasBorder = borderW !== '0px' && borderC !== 'rgba(0, 0, 0, 0)';
              const hasRadius = parseFloat(radius) > 0;
              
              if (hasBg || hasShadow || hasBorder || hasRadius) {
                const item = el.querySelector('[role="menuitem"], [role="option"], li > a, li, a');
                const itemStyle = item ? getComputedStyle(item) : null;
                return {
                  radius: radius,
                  bg: bg,
                  border: (hasBorder ? `${borderW} solid ${borderC}` : 'none'),
                  shadow: shadow !== 'none' ? shadow : 'none',
                  itemPadding: itemStyle?.padding || '8px 12px',
                  itemRadius: itemStyle?.borderTopLeftRadius || '0px',
                };
              }
            }
            
            // Priority 3: try hovering the first nav link to trigger a dropdown
            if (navEl) {
              const navLinks = navEl.querySelectorAll('a, button');
              for (const link of Array.from(navLinks).slice(0, 5)) {
                (link as HTMLElement).dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                (link as HTMLElement).dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
              }
              // Re-check after hover
              const postHover = navEl.querySelectorAll(selectors);
              for (const el of Array.from(postHover)) {
                const s = getComputedStyle(el);
                if (s.display === 'none' || s.visibility === 'hidden') continue;
                const radius = s.borderTopLeftRadius;
                const hasBg = s.backgroundColor !== 'rgba(0, 0, 0, 0)';
                const hasShadow = s.boxShadow !== 'none';
                if (hasBg || hasShadow || parseFloat(radius) > 0) {
                  const item = el.querySelector('[role="menuitem"], [role="option"], li > a, li, a');
                  const itemStyle = item ? getComputedStyle(item) : null;
                  return {
                    radius,
                    bg: s.backgroundColor,
                    border: s.borderTopWidth !== '0px' ? `${s.borderTopWidth} solid ${s.borderTopColor}` : 'none',
                    shadow: s.boxShadow !== 'none' ? s.boxShadow : 'none',
                    itemPadding: itemStyle?.padding || '8px 12px',
                    itemRadius: itemStyle?.borderTopLeftRadius || '0px',
                  };
                }
              }
            }
            
            return null;
          })();

          return {
            header,
            footer,
            sections: sections.slice(0, 6),
            cards: cards.slice(0, 5),
            buttons: buttons.slice(0, 8),
            dropdown: dropdownData,
          };
        })();

        // Merge @font-face names into fonts as standalone entries so they show as distinct
        for (const ff of fontFaceNames) {
          fonts.add(ff);
        }

        return {
          title: document.title,
          themeColor,
          googleFonts,
          colors: colorArr.slice(0, 40),
          fonts: Array.from(fonts).slice(0, 15),
          fontSizes: Array.from(fontSizes)
            .sort((a, b) => parseFloat(a) - parseFloat(b))
            .slice(0, 20),
          fontWeights: Array.from(fontWeights).sort().slice(0, 10),
          radii: Array.from(radii).slice(0, 15),
          radiusByComponent: (() => {
            const byComp: Record<string, { value: string; corners: { tl: string; tr: string; br: string; bl: string }; count: number; sample: string }[]> = {};
            for (const entry of radiusEntries.values()) {
              if (!byComp[entry.component]) byComp[entry.component] = [];
              byComp[entry.component].push({
                value: entry.shorthand,
                corners: entry.corners,
                count: entry.count,
                sample: entry.sample,
              });
            }
            for (const comp of Object.keys(byComp)) {
              byComp[comp].sort((a, b) => b.count - a.count);
            }
            return byComp;
          })(),
          shadows: Array.from(shadows).slice(0, 10),
          spacing: Array.from(spacing).slice(0, 20),
          cssVars,
          structure,
          pageStructure,
          componentPatterns,
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
        radiusByComponent: extracted.radiusByComponent,
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
        componentPatterns: extracted.componentPatterns,
        pageStructure: extracted.pageStructure,
        accessibleSources: [fetchURL],
        blockedSources: [],
      };

      // Detect bot protection / challenge pages
      const pageTitle = (tokens.meta.title || '').toLowerCase();
      const firstHeading = tokens.pageStructure?.[0]?.heading?.toLowerCase() || '';
      const isBotBlocked = [
        'just a moment', 'checking your browser', 'security check',
        'access denied', 'attention required', 'what happened',
        'please verify', 'are you a robot', 'captcha',
      ].some(phrase => pageTitle.includes(phrase) || firstHeading.includes(phrase));

      if (isBotBlocked) {
        await browser.close();
        return {
          error: `${parsedURL.hostname} is blocking automated access (bot protection). Use the DevTools paste method instead: open the site in your browser, run the extract.js script in the console, then paste the JSON here.`,
        };
      }

      const markdown = generateDesignMD(tokens);
      const tailwindConfig = generateTailwindConfig(tokens);
      const cssVariables = generateCSSVariables(tokens);
      const pageStructure = (extracted.structure as string[]) || [];
      return { tokens, markdown, tailwindConfig, cssVariables, pageStructure };
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
