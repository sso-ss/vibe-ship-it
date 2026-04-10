"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

// Interactive element with hover/active states via inline styles
function Interactive({ style, hoverStyle, activeStyle, as = 'div', children, ...props }: {
  style: CSSProperties;
  hoverStyle?: CSSProperties;
  activeStyle?: CSSProperties;
  as?: 'div' | 'button' | 'span';
  children: ReactNode;
  [key: string]: unknown;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const Tag = as;
  const merged: CSSProperties = {
    ...style,
    transition: 'all 150ms ease',
    ...(hovered ? hoverStyle : {}),
    ...(pressed ? (activeStyle || { transform: 'scale(0.97)' }) : {}),
  };
  return (
    <Tag
      style={merged}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      {...props}
    >
      {children}
    </Tag>
  );
}

interface ColorRole {
  value: string;
  role: string;
  source: string;
}

interface TokenData {
  colors: string[];
  colorRoles: ColorRole[];
  fonts: string[];
  fontSizes: string[];
  fontWeights: string[];
  radii: string[];
  radiusByComponent?: Record<string, { value: string; corners: { tl: string; tr: string; br: string; bl: string }; count: number; sample: string }[]>;
  shadows: string[];
  cssVars: Record<string, string>;
  meta: { themeColor?: string; title?: string; googleFonts?: string[] };
  componentPatterns?: {
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
  };
}

export function DesignExtractor() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    markdown: string;
    tailwindConfig: string;
    cssVariables: string;
    pageStructure: string[];
    tokens: TokenData;
    tokenCount: number;
    accessible: number;
    blocked: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"preview" | "markdown" | "tailwind" | "css-vars" | "structure">("preview");
  const [showSnippet, setShowSnippet] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);

  function isJSON(input: string): boolean {
    const trimmed = input.trim();
    return trimmed.startsWith('{') && (trimmed.includes('"_type"') || trimmed.includes('"colors"'));
  }

  const inputIsJSON = url.trim().startsWith('{');

  function processSnippetJSON(json: string) {
    try {
      // Try to extract valid JSON if there's extra text around it
      let cleanJson = json.trim();
      const firstBrace = cleanJson.indexOf('{');
      const lastBrace = cleanJson.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanJson = cleanJson.slice(firstBrace, lastBrace + 1);
      }

      const data = JSON.parse(cleanJson);

      if (!data.colors && !data.fonts) {
        setError("This JSON doesn't contain design tokens (no colors or fonts found).");
        return;
      }

      // Convert snippet format to our TokenData format
      const colorRoles: ColorRole[] = (data.colors || []).map((c: { value: string; sources: string[] }) => ({
        value: c.value,
        role: '',
        source: c.sources?.[0] || 'other',
      }));

      // Assign color roles by analyzing values
      const assigned = new Set<string>();

      function parseRGBValues(val: string): [number, number, number] | null {
        const m = val.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        return m ? [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])] : null;
      }
      function lum(rgb: [number, number, number]): number { return (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114); }
      function sat(rgb: [number, number, number]): number { const mx = Math.max(...rgb), mn = Math.min(...rgb); return mx === 0 ? 0 : (mx - mn) / mx * 100; }

      // Background: lightest bg color
      for (const cr of colorRoles) {
        if (assigned.has(cr.value) || !cr.value.startsWith('rgb(')) continue;
        const rgb = parseRGBValues(cr.value);
        if (rgb && cr.source === 'background' && lum(rgb) > 240) { cr.role = 'Background'; assigned.add(cr.value); break; }
      }
      // Text Primary: darkest text color
      for (const cr of colorRoles) {
        if (assigned.has(cr.value) || !cr.value.startsWith('rgb(')) continue;
        const rgb = parseRGBValues(cr.value);
        if (rgb && cr.source === 'text' && lum(rgb) < 80) { cr.role = 'Text Primary'; assigned.add(cr.value); break; }
      }
      // Surface: near-white bg that isn't pure white
      for (const cr of colorRoles) {
        if (assigned.has(cr.value) || !cr.value.startsWith('rgb(')) continue;
        const rgb = parseRGBValues(cr.value);
        if (rgb && cr.source === 'background' && lum(rgb) > 220 && lum(rgb) < 252) { cr.role = 'Surface'; assigned.add(cr.value); break; }
      }
      // Border: color used in border source
      for (const cr of colorRoles) {
        if (assigned.has(cr.value) || !cr.value.startsWith('rgb(')) continue;
        const rgb = parseRGBValues(cr.value);
        if (rgb && cr.source === 'border' && lum(rgb) > 150 && lum(rgb) < 240) { cr.role = 'Border'; assigned.add(cr.value); break; }
      }
      // Text Secondary: mid-gray text
      for (const cr of colorRoles) {
        if (assigned.has(cr.value) || !cr.value.startsWith('rgb(')) continue;
        const rgb = parseRGBValues(cr.value);
        if (rgb && (cr.source === 'text') && lum(rgb) > 80 && lum(rgb) < 180 && sat(rgb) < 20) { cr.role = 'Text Secondary'; assigned.add(cr.value); break; }
      }
      // Accent: chromatic color used in bg or text (not gray)
      for (const cr of colorRoles) {
        if (assigned.has(cr.value) || !cr.value.startsWith('rgb(')) continue;
        const rgb = parseRGBValues(cr.value);
        if (rgb && sat(rgb) > 30 && lum(rgb) > 30 && lum(rgb) < 230 && (cr.source === 'background' || cr.source === 'text')) {
          cr.role = 'Accent'; assigned.add(cr.value); break;
        }
      }
      // Also check CSS vars for accent
      const vars = data.cssVars || {};
      const accentVarNames = ['--color-button-primary', '--accent', '--brand', '--color-primary', '--color-accent', '--primary'];
      for (const vn of accentVarNames) {
        if (vars[vn] && !colorRoles.some(c => c.role === 'Accent')) {
          colorRoles.push({ value: vars[vn], role: 'Accent (from CSS var)', source: 'accent' });
          break;
        }
      }

      const tokens: TokenData = {
        colors: (data.colors || []).map((c: { value: string }) => c.value),
        colorRoles,
        fonts: data.fonts || [],
        fontSizes: data.fontSizes || [],
        fontWeights: data.fontWeights || [],
        radii: data.radii || [],
        radiusByComponent: data.radiusByComponent || undefined,
        shadows: data.shadows || [],
        cssVars: data.cssVars || {},
        meta: {
          themeColor: data.themeColor,
          title: data.title,
          googleFonts: [],
        },
      };

      const tokenCount =
        tokens.colors.length +
        tokens.fonts.length +
        tokens.fontSizes.length +
        tokens.radii.length +
        tokens.shadows.length +
        Object.keys(tokens.cssVars).length;

      // Generate a basic DESIGN.md from the snippet data
      let md = `# DESIGN.md -- ${data.title || new URL(data.url).hostname}\n\n`;
      md += `> Extracted via DevTools snippet from ${data.url}\n\n`;
      md += `## 1. Identity\n\n**In one line:** [Describe after reviewing tokens]\n\n`;
      md += `## 2. Color\n\n### Palette\n| Token | Value | Role |\n|-------|-------|------|\n`;
      for (const cr of colorRoles.slice(0, 20)) {
        const role = cr.role || `[${cr.source}]`;
        md += `| \`${cr.role ? cr.role.toLowerCase().replace(/\s+/g, '-') : '--'}\` | \`${cr.value}\` | ${role} |\n`;
      }
      md += `\n## 3. Typography\n\n### Fonts\n`;
      for (const f of tokens.fonts.slice(0, 5)) md += `- ${f}\n`;
      md += `\n### Scale\n| Size | Source |\n|------|--------|\n`;
      for (const s of tokens.fontSizes) md += `| ${s} | extracted |\n`;
      md += `\n### Weights\n`;
      for (const w of tokens.fontWeights) md += `- ${w}\n`;
      md += `\n## 4. Spacing & Layout\n\n### Border Radius\n`;
      for (const r of tokens.radii) md += `- ${r}\n`;
      md += `\n## 5. Depth & Motion\n\n### Shadows\n`;
      for (const s of tokens.shadows) md += `- \`${s}\`\n`;
      md += `\n## 6. Components\n\n[Build from tokens above]\n`;
      md += `\n## 7. States\n\n[Define states]\n`;
      md += `\n## 8. Rules\n\n### Do\n- [Generate from patterns]\n\n### Don't\n- [Generate anti-patterns]\n`;
      md += `\n---\nExtracted from: ${data.url}\n`;
      md += `\n> Paste this into your AI agent and say: "Fill in the Identity, Components, States, and Rules sections."\n`;

      setResult({
        markdown: md,
        tailwindConfig: "",
        cssVariables: "",
        pageStructure: [],
        tokens,
        tokenCount,
        accessible: 1,
        blocked: 0,
      });
      setTab("preview");
      setShowSnippet(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`Could not parse JSON: ${msg}. Make sure you copied the full output.`);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    // Auto-detect: JSON or URL?
    if (isJSON(url)) {
      processSnippetJSON(url);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setShowSnippet(false);

    const response = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.trim() }),
    });
    const res = await response.json();

    if ("error" in res) {
      setError(res.error);
    } else {
      const tokenCount =
        res.tokens.colors.length +
        res.tokens.fonts.length +
        res.tokens.fontSizes.length +
        res.tokens.radii.length +
        res.tokens.shadows.length +
        Object.keys(res.tokens.cssVars).length;

      setResult({
        markdown: res.markdown,
        tailwindConfig: res.tailwindConfig || "",
        cssVariables: res.cssVariables || "",
        pageStructure: res.pageStructure || [],
        tokens: res.tokens,
        tokenCount,
        accessible: res.tokens.accessibleSources.length,
        blocked: res.tokens.blockedSources.length,
      });
      setTab("preview");

      // If extraction was weak, show the snippet fallback
      if (tokenCount < 10) {
        setShowSnippet(true);
      }
    }

    setLoading(false);
  }

  function handleDownload() {
    if (!result) return;
    const blob = new Blob([result.markdown], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "DESIGN.md";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result.markdown);
  }

  const SNIPPET = `(function(){
  var c=new Map,f=new Set,s=new Set,w=new Set,r=new Set,sh=new Set,v={};
  try{for(var t of document.styleSheets)try{for(var u of t.cssRules)if(u.style)for(var i=0;i<u.style.length;i++){var p=u.style[i];if(p.startsWith("--")){var val=u.style.getPropertyValue(p).trim();if(/^#[0-9a-f]{3,8}$|^rgb|^hsl/i.test(val))v[p]=val}}}catch(e){}}catch(e){}
  var els=Array.from(document.querySelectorAll("body *:not(script):not(style):not(link):not(meta)")).slice(0,300);
  for(var el of els){var st=getComputedStyle(el);
    var tc=function(val,src){if(val&&val!=="rgba(0, 0, 0, 0)"&&val!=="transparent"){if(!c.has(val))c.set(val,new Set());c.get(val).add(src)}};
    tc(st.color,"text");tc(st.backgroundColor,"background");tc(st.borderColor,"border");
    if(st.fontFamily)f.add(st.fontFamily);
    if(st.fontSize&&st.fontSize!=="0px")s.add(st.fontSize);
    if(st.fontWeight)w.add(st.fontWeight);
    if(st.borderRadius&&st.borderRadius!=="0px")r.add(st.borderRadius);
    if(st.boxShadow&&st.boxShadow!=="none")sh.add(st.boxShadow);
  }
  var tm=document.querySelector('meta[name="theme-color"]');
  var res={_type:"design-tokens",url:location.href,title:document.title,
    themeColor:tm?tm.getAttribute("content"):void 0,
    colors:Array.from(c).map(function(e){return{value:e[0],sources:Array.from(e[1])}}).slice(0,30),
    fonts:Array.from(f).slice(0,5),
    fontSizes:Array.from(s).sort(function(a,b){return parseFloat(a)-parseFloat(b)}).slice(0,15),
    fontWeights:Array.from(w).sort().slice(0,8),
    radii:Array.from(r).slice(0,8),
    shadows:Array.from(sh).slice(0,6),
    cssVars:v};
  navigator.clipboard.writeText(JSON.stringify(res)).then(function(){alert("Copied! Paste into the generator.")}).catch(function(){console.log(JSON.stringify(res))});
})();`;
  function handleCopySnippet() {
    navigator.clipboard.writeText(SNIPPET);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 2000);
  }

  // Filter colors that are valid CSS for rendering swatches
  function isRenderableColor(c: string): boolean {
    return /^#[0-9a-f]{3,8}$/i.test(c) || /^rgba?\(/.test(c) || /^hsla?\(/.test(c);
  }

  // Check if a value can actually render (not a var() reference)
  function isResolvableValue(v: string): boolean {
    return !v.includes('var(') && !v.includes('{') && !v.includes('}');
  }

  // Derive component-preview styles from extracted tokens
  function deriveComponentStyles(tokens: TokenData) {
    const vars = tokens.cssVars;

    function varColor(names: string[]): string | null {
      for (const name of names) {
        const val = vars[name];
        if (val && isRenderableColor(val.trim())) return val.trim();
        if (val && /^\d/.test(val.trim())) return `hsl(${val.trim()})`;
      }
      return null;
    }

    function parseRGB(color: string): [number, number, number] | null {
      const m = color.match(/rgb[a]?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      if (m) return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
      const h = color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
      if (h) return [parseInt(h[1], 16), parseInt(h[2], 16), parseInt(h[3], 16)];
      return null;
    }

    function brightness(color: string): number {
      const rgb = parseRGB(color);
      if (!rgb) return 128;
      return (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    }

    function isChromatic(color: string): boolean {
      const rgb = parseRGB(color);
      if (!rgb) return false;
      const max = Math.max(...rgb), min = Math.min(...rgb);
      return (max - min) > 40;
    }

    function roleColor(source: string, roleName?: string, index = 0): string | null {
      if (roleName) {
        const match = tokens.colorRoles.find(c => c.role === roleName && isRenderableColor(c.value));
        if (match) return match.value;
      }
      const matches = tokens.colorRoles.filter(c => c.source === source && isRenderableColor(c.value));
      return matches[index]?.value || null;
    }

    // Background
    const bg = varColor(['--background-primary', '--background', '--bg', '--color-background'])
      || roleColor('background', 'Background')
      || (() => {
        const bgs = tokens.colorRoles.filter(c => c.source === 'background' && isRenderableColor(c.value));
        return bgs.sort((a, b) => brightness(b.value) - brightness(a.value))[0]?.value;
      })() || '#ffffff';

    // Text primary (darkest text)
    const textPrimary = varColor(['--text-primary', '--color-text', '--foreground'])
      || roleColor('text', 'Text Primary')
      || (() => {
        const texts = tokens.colorRoles.filter(c => c.source === 'text' && isRenderableColor(c.value));
        return texts.sort((a, b) => brightness(a.value) - brightness(b.value))[0]?.value;
      })() || '#141414';

    // Text secondary
    const textSecondary = varColor(['--text-secondary', '--color-text-secondary', '--text-muted'])
      || (() => {
        const texts = tokens.colorRoles.filter(c => c.source === 'text' && isRenderableColor(c.value) && c.value !== textPrimary);
        return texts.sort((a, b) => Math.abs(brightness(a.value) - 128) - Math.abs(brightness(b.value) - 128))[0]?.value;
      })() || '#707070';

    // Accent/brand: check role assignment first, then CSS vars, then chromatic analysis
    const accentColor = (() => {
      // First: check if extraction already assigned an Accent role
      const accentRole = tokens.colorRoles.find(c => c.role === 'Accent' && isRenderableColor(c.value));
      if (accentRole) return accentRole.value;
      const accentSecondary = tokens.colorRoles.find(c => c.role === 'Accent Secondary' && isRenderableColor(c.value));
      if (accentSecondary) return accentSecondary.value;
      // Second: check CSS variables for accent/brand/button-primary colors
      const fromVar = varColor(['--accent', '--brand', '--color-primary', '--color-accent', '--background-brand', '--primary', '--link-color', '--text-link-primary', '--color-brand', '--color-button-primary', '--button-primary', '--btn-primary-bg']);
      if (fromVar) return fromVar;
      // Third: find the most saturated chromatic color from extracted roles
      // ONLY from text/background sources (not borders/outlines which catch stray focus ring blues)
      // Must have strong saturation (>40%) to be an intentional brand color
      const chromatics = tokens.colorRoles
        .filter(c => isRenderableColor(c.value) && isChromatic(c.value))
        .filter(c => c.source === 'background' || c.source === 'text')
        .filter(c => {
          const hsl = (() => {
            const m = c.value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
            if (!m) return null;
            const r = parseInt(m[1]) / 255, g = parseInt(m[2]) / 255, b = parseInt(m[3]) / 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            const d = max - min;
            const l = (max + min) / 2;
            const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
            return { s: s * 100 };
          })();
          return hsl && hsl.s > 40;
        });
      return chromatics[0]?.value || null;
    })();

    // Primary button: use real detected button color first, then accent, then dark text
    // This handles monochrome sites (Uber) where buttons are black, not accent-colored
    const realBtnBgColor = (() => {
      const cp = tokens.componentPatterns;
      if (!cp?.buttons?.length) return null;
      // Skip utility buttons, find actual CTAs
      const btn = cp.buttons.find(b => {
        if (!isRenderableColor(b.bg) || b.bg === 'rgba(0, 0, 0, 0)' || b.bg === 'transparent') return false;
        const t = b.text.toLowerCase();
        if (['skip', 'search', 'next', 'prev', 'close', 'menu'].some(s => t.includes(s))) return false;
        return brightness(b.bg) < 240; // allow dark/black buttons
      });
      return btn?.bg || null;
    })();
    const primaryBtnBg = realBtnBgColor || accentColor || textPrimary;
    const primaryBtnText = (() => {
      if (realBtnBgColor) return brightness(realBtnBgColor) > 128 ? textPrimary : bg;
      if (accentColor) return brightness(accentColor) > 128 ? textPrimary : bg;
      return bg;
    })();

    // Border: check assigned role first, then CSS vars, then border-source colors
    // IMPORTANT: filter out near-black borders (usually inherited from text color via currentColor)
    const borderColor = (() => {
      const borderRole = tokens.colorRoles.find(c => c.role === 'Border' && isRenderableColor(c.value));
      if (borderRole && brightness(borderRole.value) > 100) return borderRole.value;
      const fromVar = varColor(['--border-divider', '--border', '--border-color', '--color-border']);
      if (fromVar) return fromVar;
      // Find border-source colors, prefer light/mid grays, exclude near-black and near-white
      const borderSources = tokens.colorRoles.filter(c => c.source === 'border' && isRenderableColor(c.value));
      const validBorders = borderSources.filter(c => {
        const b = brightness(c.value);
        return b > 100 && b < 240; // Not too dark (inherited text), not too light (invisible)
      });
      if (validBorders.length > 0) return validBorders[0].value;
      // Also accept rgba with low opacity (common for subtle borders)
      const alphaBorders = borderSources.filter(c => c.value.includes('rgba') && c.value.match(/,\s*0\.\d/));
      if (alphaBorders.length > 0) return alphaBorders[0].value;
      return borderSources[0]?.value || '#ededed';
    })();

    // Surface
    const surfaceColor = (() => {
      const surfaceRole = tokens.colorRoles.find(c => c.role === 'Surface' && isRenderableColor(c.value));
      if (surfaceRole) return surfaceRole.value;
      const fromVar = varColor(['--background-secondary', '--surface', '--color-surface']);
      if (fromVar) return fromVar;
      return roleColor('background', undefined, 1) || '#f5f5f5';
    })();

    // Danger
    const dangerColor = varColor(['--text-negative', '--color-danger', '--destructive', '--error'])
      || (() => {
        for (const cr of tokens.colorRoles) {
          if (!isRenderableColor(cr.value)) continue;
          const rgb = parseRGB(cr.value);
          if (rgb && rgb[0] > 150 && rgb[0] > rgb[1] * 1.5 && rgb[0] > rgb[2] * 1.5) return cr.value;
        }
        return null;
      })() || '#dc3c32';

    // Font: extract distinct primary family names from all font stacks
    // Separate mono/code fonts from body/heading fonts.
    // Count how many stacks each primary name appears in to find the most-used body font.
    const seenPrimaries = new Map<string, string>(); // primaryName -> full stack
    const monoFonts: string[] = [];
    const textFontCounts = new Map<string, number>(); // primaryName -> appearance count
    for (const stack of tokens.fonts) {
      if (stack.includes('var(') || stack.length > 200) continue;
      const first = stack.split(',')[0].trim().replace(/['"]/g, '');
      if (!first || first === 'inherit' || first === 'initial') continue;
      if (['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-sans-serif', 'ui-serif', 'ui-monospace'].includes(first.toLowerCase())) continue;
      // Skip mono/code fonts
      const isMono = /mono|code|consol|menlo|courier|sfmono/i.test(first) || /mono|code/i.test(stack);
      if (isMono) { if (!monoFonts.includes(first)) monoFonts.push(first); continue; }
      // Skip icon/glyph fonts
      const isIcon = /glyph|icon|symbol|dingbat|emoji|flag|logo\b|font\s*awesome|material\s*(icons|symbols)|icomoon|feather|ionicons|remixicon|bootstrap.*icons|lucide/i.test(first);
      if (isIcon) continue;
      if (!seenPrimaries.has(first)) seenPrimaries.set(first, stack);
      textFontCounts.set(first, (textFontCounts.get(first) || 0) + 1);
    }
    // The font that appears as primary in the most stacks = body font
    const sortedTextFonts = Array.from(textFontCounts.entries()).sort((a, b) => b[1] - a[1]);
    // Use name heuristics to assign body vs heading:
    // "Text", "Body", "Sans" (without "Display") = body
    // "Display", "Headline", "Title" = heading
    // If no match, most frequent = body, next = heading
    let bodyFontName: string | null = null;
    let headingFontName: string | null = null;
    const textBody = sortedTextFonts.find(([n]) => /\btext\b|\bbody\b|sans(?!.*display)/i.test(n));
    const textDisplay = sortedTextFonts.find(([n]) => /display|headline|\bhead\b|title/i.test(n));
    if (textBody && textDisplay && textBody[0] !== textDisplay[0]) {
      bodyFontName = textBody[0];
      headingFontName = textDisplay[0];
    } else if (textBody) {
      bodyFontName = textBody[0];
      headingFontName = sortedTextFonts.find(([n]) => n !== bodyFontName)?.[0] || null;
    } else {
      bodyFontName = sortedTextFonts[0]?.[0] || null;
      headingFontName = sortedTextFonts.length > 1 ? sortedTextFonts[1][0] : null;
    }
    const font = bodyFontName ? (seenPrimaries.get(bodyFontName) || bodyFontName) : 'inherit';
    const primaryFontName = bodyFontName || null;
    const headingFont = headingFontName ? (seenPrimaries.get(headingFontName) || headingFontName) : font;
    const headingFontNameClean = headingFontName || bodyFontName || null;
    const fontSize = tokens.fontSizes.find(s => s === '14px')
      || tokens.fontSizes.find(s => { const v = parseFloat(s); return v >= 13 && v <= 15; }) || '14px';
    const fontWeightHeavy = tokens.fontWeights.find(w => w === '600')
      || tokens.fontWeights.find(w => { const v = parseInt(w); return v >= 500 && v <= 700; }) || '600';
    const fontWeightNormal = tokens.fontWeights.find(w => w === '400')
      || tokens.fontWeights.find(w => { const v = parseInt(w); return v >= 400 && v <= 456; }) || '400';

    // Radius: use radiusByComponent for precise values, fall back to flat list
    const rbc = tokens.radiusByComponent || {};
    const btnRadiusFromComp = rbc.button?.[0]?.value;
    const cardRadiusFromComp = rbc.card?.[0]?.value;
    const inputRadiusFromComp = rbc.input?.[0]?.value;
    const badgeRadiusFromComp = rbc.badge?.[0]?.value;
    const dropdownRadiusFromComp = rbc.dropdown?.[0]?.value;

    const resolvedRadii = tokens.radii
      .map(r => ({ raw: r, resolved: resolveValue(r, vars) || r }))
      .filter(r => isResolvableValue(r.resolved) && /^\d/.test(r.resolved))
      .map(r => ({ ...r, px: parseFloat(r.resolved) }))
      .filter(r => r.px > 0 && r.px < 1000)
      .sort((a, b) => a.px - b.px);

    // Button radius: prefer radiusByComponent, then heuristic
    let buttonRadius = btnRadiusFromComp
      || resolvedRadii.find(r => r.px >= 1 && r.px <= 16)?.resolved || '4px';

    // Card radius: prefer radiusByComponent, then heuristic
    const cardRadius = cardRadiusFromComp
      || resolvedRadii.find(r => r.px > parseFloat(buttonRadius) && r.px <= 24)?.resolved
      || resolvedRadii.find(r => r.px >= 4 && r.px <= 24)?.resolved
      || buttonRadius;

    // Dropdown radius: prefer radiusByComponent, then card radius
    const dropdownRadius = dropdownRadiusFromComp || cardRadius;

    // Tags: pill only if site has a very large radius (>=999px)
    const hasPill = badgeRadiusFromComp === '9999px' || tokens.radii.some(r => {
      const res = resolveValue(r, vars) || r;
      return isResolvableValue(res) && parseFloat(res) >= 999;
    });
    const tagRadius = hasPill ? '9999px' : buttonRadius;

    // If site uses pills and button radius wasn't from component detection, buttons are pills too
    if (hasPill && !btnRadiusFromComp) {
      buttonRadius = '9999px';
    }

    // Shadows: prefer non-inset for dropdowns
    const dropdownShadow = tokens.shadows.find(s => isResolvableValue(s) && !s.includes('inset'))
      || 'none';
    const insetShadow = tokens.shadows.find(s => isResolvableValue(s) && s.includes('inset')) || 'none';
    const cardShadow = dropdownShadow !== 'none' ? dropdownShadow : 'none';

    // Detect design language
    const btnRadiusPx = parseFloat(buttonRadius);
    const cardRadiusPx = parseFloat(cardRadius);
    const hasShadows = dropdownShadow !== 'none' || cardShadow !== 'none';
    const hasInsetBorders = insetShadow !== 'none';

    // Use real component patterns if available
    const cp = tokens.componentPatterns;
    // Find the most common card radius across all detected cards (not just the first one)
    const realCardRadius = (() => {
      if (!cp?.cards?.length) return null;
      const counts = new Map<string, number>();
      for (const c of cp.cards) {
        const r = c.radius;
        if (r && parseFloat(r) > 0) counts.set(r, (counts.get(r) || 0) + 1);
      }
      if (counts.size === 0) return null;
      // Return the most frequent radius
      let best = '';
      let bestCount = 0;
      for (const [r, n] of counts) {
        if (n > bestCount) { best = r; bestCount = n; }
      }
      return best || null;
    })();
    const realCard = cp?.cards?.[0];

    // Find the BEST primary button: prefer chromatic, then dark, then any visible
    const realBtn = (() => {
      if (!cp?.buttons?.length) return null;
      // Skip non-CTA buttons (skip to content, search, next/prev, nav items)
      const ctaButtons = cp.buttons.filter(b => {
        const t = b.text.toLowerCase();
        return !['skip', 'search', 'next', 'prev', 'previous', 'close', 'menu', 'my account'].some(skip => t.includes(skip));
      });
      const pool = ctaButtons.length > 0 ? ctaButtons : cp.buttons;
      // First: chromatic (colored) background
      const chromaticBtn = pool.find(b => {
        if (!isRenderableColor(b.bg) || b.bg === 'rgba(0, 0, 0, 0)' || b.bg === 'transparent') return false;
        const rgb = parseRGB(b.bg);
        if (!rgb) return false;
        const max = Math.max(...rgb), min = Math.min(...rgb);
        return (max - min) > 40;
      });
      if (chromaticBtn) return chromaticBtn;
      // Second: dark/black button (very common: Nike, Puma, Uber, Vercel)
      const darkBtn = pool.find(b => {
        if (!isRenderableColor(b.bg) || b.bg === 'rgba(0, 0, 0, 0)' || b.bg === 'transparent') return false;
        return brightness(b.bg) < 60;
      });
      if (darkBtn) return darkBtn;
      // Third: any visible button with background
      return pool.find(b => {
        if (!isRenderableColor(b.bg) || b.bg === 'rgba(0, 0, 0, 0)' || b.bg === 'transparent') return false;
        return brightness(b.bg) < 240;
      }) || null;
    })();

    // Override radius from real buttons if found
    const realBtnRadius = realBtn ? realBtn.radius : null;
    const finalButtonRadius = btnRadiusFromComp
      || (realBtnRadius && parseFloat(realBtnRadius) > 0 ? realBtnRadius : null)
      || buttonRadius;

    // Override card properties from real cards if found
    // Card radius: prefer radiusByComponent (reads outer wrappers) over componentPatterns (may read inner)
    // Cap at 32px
    const rawCardRadius = cardRadiusFromComp || realCardRadius || cardRadius;
    const finalCardRadius = parseFloat(rawCardRadius) > 32 ? '12px' : rawCardRadius;

    // Remove debug log

    // Dropdown radius: never pill. Use detected nav dropdown > radiusByComponent > card > 12px
    const detectedDropdown = tokens.componentPatterns?.dropdown;
    const rawDropdownRadius = detectedDropdown?.radius || dropdownRadiusFromComp || rawCardRadius || '12px';
    const finalDropdownRadius = parseFloat(rawDropdownRadius) > 24 ? '12px' : rawDropdownRadius;
    const detectedDropdownShadow = detectedDropdown?.shadow || null;
    const detectedDropdownBorder = detectedDropdown?.border || null;

    // Card layout from real detection
    const cardLayout: 'vertical' | 'horizontal' = realCard?.layout || 'vertical';
    const imageFullBleed = realCard?.imageFullBleed ?? true;
    const imagePosition = realCard?.imagePosition || 'top';
    const cardInnerPadding = realCard?.innerPadding || '16px 20px 20px';
    const cardImgHeight = realCard?.imgHeight && parseFloat(realCard.imgHeight) > 20 ? realCard.imgHeight : '140px';

    // Shape language from REAL card radius, not inferred
    const finalCardRadiusPx = parseFloat(finalCardRadius);
    const shapeLanguage: 'soft' | 'medium' | 'sharp' =
      finalCardRadiusPx >= 8 ? 'soft' : finalCardRadiusPx >= 4 ? 'medium' : 'sharp';

    // Card style from real detection or fallback to inference
    const cardStyle: 'shadow' | 'bordered' | 'inset' | 'none' =
      realCard ? (
        !realCard.hasShadow && !realCard.hasBorder ? 'none'
        : realCard.hasShadow && !realCard.hasBorder ? 'shadow'
        : realCard.hasBorder && !realCard.hasShadow ? 'bordered'
        : realCard.hasShadow ? 'shadow' : 'bordered')
      : (hasShadows && !hasInsetBorders ? 'shadow'
        : hasInsetBorders ? 'inset'
        : 'bordered');

    // Real button colors: use the chromatic button we found
    const finalPrimaryBtnBg = (realBtn && isRenderableColor(realBtn.bg) && realBtn.bg !== 'rgba(0, 0, 0, 0)') 
      ? realBtn.bg : primaryBtnBg;
    const finalPrimaryBtnText = (realBtn && isRenderableColor(realBtn.color))
      ? realBtn.color : primaryBtnText;

    // Surface color MUST be neutral (not chromatic). If surfaceColor is chromatic, fall back to a light gray
    const finalSurface = (() => {
      if (isChromatic(surfaceColor)) return '#f5f5f5';
      return surfaceColor;
    })();

    // Input radius: prefer radiusByComponent, then match button radius
    // Input radius: from component detection, or match button (but cap at 16px unless explicitly pill)
    const rawInputRadius = inputRadiusFromComp || finalButtonRadius;
    const inputRadius = parseFloat(rawInputRadius) > 16 && !inputRadiusFromComp ? '8px' : rawInputRadius;

    return {
      bg, textPrimary, textSecondary, borderColor, surfaceColor: finalSurface, dangerColor,
      primaryBtnBg: finalPrimaryBtnBg, primaryBtnText: finalPrimaryBtnText,
      font, headingFont, fontSize, fontWeightHeavy, fontWeightNormal, primaryFontName, headingFontName: headingFontNameClean,
      buttonRadius: finalButtonRadius, cardRadius: finalCardRadius, tagRadius, inputRadius,
      dropdownRadius: finalDropdownRadius,
      dropdownShadow: detectedDropdownShadow || dropdownShadow,
      dropdownBorder: detectedDropdownBorder,
      insetShadow, cardShadow,
      shapeLanguage, cardStyle, hasPill,
      cardLayout, imageFullBleed, imagePosition, cardInnerPadding, cardImgHeight,
    };
  }

  // Try to resolve var() references using extracted CSS variables
  function resolveValue(v: string, cssVars: Record<string, string>): string | null {
    if (!v.includes('var(')) return v;
    // Try to resolve: var(--name) -> actual value
    const match = v.match(/var\(([^)]+)\)/);
    if (match) {
      const varName = match[1].trim().split(',')[0].trim();
      const resolved = cssVars[varName];
      if (resolved && !resolved.includes('var(')) return resolved;
    }
    return null;
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="max-w-[560px] mx-auto">
        <div className="flex gap-3">
          {inputIsJSON ? (
            <textarea
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder='Paste extracted JSON here'
              rows={4}
              className="flex-1 px-4 py-3 rounded-[var(--radius-md)] shadow-[var(--shadow-image-inset)] bg-[hsl(var(--background-primary))] text-[12px] font-mono text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:shadow-[inset_0_0_0_2px_hsl(var(--border-focus))] transition-all resize-none"
            />
          ) : (
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder='Enter a URL or paste extracted JSON'
              className="flex-1 px-5 py-3 rounded-full shadow-[var(--shadow-image-inset)] bg-[hsl(var(--background-primary))] text-[14px] text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:shadow-[inset_0_0_0_2px_hsl(var(--border-focus))] transition-all"
            />
          )}
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-3 rounded-full bg-[hsl(var(--background-inverse))] text-[hsl(var(--text-inverse))] text-[14px] font-semibold hover:bg-[hsl(var(--background-inverse-hover))] transition-colors duration-[var(--duration-base)] disabled:opacity-50 whitespace-nowrap self-start"
          >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Extracting...
            </span>
          ) : "Extract"}
        </button>
        </div>
        {inputIsJSON && (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="mt-2 text-[12px] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors duration-[var(--duration-base)]"
          >
            Clear and enter a URL instead
          </button>
        )}
      </form>

      {error && (
        <p className="mt-4 text-[15px] text-[hsl(var(--red-60))]">{error}</p>
      )}

      {result && (
        <div className="mt-8">
          {/* Stats */}
          <div className="flex flex-wrap gap-6 mb-6">
            <div>
              <span className="text-[32px] font-semibold text-[hsl(var(--text-primary))] leading-none">
                {result.tokenCount}
              </span>
              <span className="text-[13px] font-medium text-[hsl(var(--text-tertiary))] ml-2">
                tokens extracted
              </span>
            </div>
            <div>
              <span className="text-[32px] font-semibold text-[hsl(var(--green-60))] leading-none">
                {result.accessible}
              </span>
              <span className="text-[13px] font-medium text-[hsl(var(--text-tertiary))] ml-2">
                sources accessible
              </span>
            </div>
            {result.blocked > 0 && (
              <div>
                <span className="text-[32px] font-semibold text-[hsl(var(--yellow-60))] leading-none">
                  {result.blocked}
                </span>
                <span className="text-[13px] font-medium text-[hsl(var(--text-tertiary))] ml-2">
                  sources blocked
                </span>
              </div>
            )}
          </div>

          {/* Snippet fallback when extraction is weak */}
          {showSnippet && (
            <div className="mb-6 rounded-[var(--radius-md)] border border-[hsl(var(--yellow-60)/0.3)] bg-[hsl(var(--yellow-60)/0.04)] p-5">
              <p className="text-[15px] font-medium text-[hsl(var(--text-primary))] mb-2">
                Not enough tokens from this site.
              </p>
              <p className="text-[14px] text-[hsl(var(--text-secondary))] leading-relaxed mb-4">
                This site's CSS was not fully accessible. For full extraction: open the target site, right-click, select "Inspect", go to the Console tab, paste the script below, and press Enter. It copies design tokens to your clipboard. Come back here and paste.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCopySnippet}
                  className="px-5 py-2.5 rounded-[var(--radius-sm)] bg-[hsl(var(--background-inverse))] text-[hsl(var(--text-inverse))] text-[13px] font-medium hover:bg-[hsl(var(--background-inverse-hover))] transition-colors duration-[var(--duration-base)]"
                >
                  {snippetCopied ? "Copied!" : "Copy console script"}
                </button>
              </div>
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex gap-1 mb-4 p-1 bg-[hsl(var(--background-secondary))] rounded-[var(--radius-sm)] w-fit flex-wrap">
            {([
              ["preview", "Preview"],
              ["markdown", "DESIGN.md"],
              ["tailwind", "Tailwind"],
              ["css-vars", "CSS Vars"],
              ["structure", "Structure"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-md text-[12px] font-medium transition-all ${
                  tab === key
                    ? "bg-[hsl(var(--background-primary))] text-[hsl(var(--text-primary))] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    : "text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "preview" ? (
            <div className="space-y-6">
              {/* Colors */}
              {result.tokens.colorRoles.length > 0 && (
                <div className="rounded-[var(--radius-md)] border border-[hsl(var(--border-divider))] bg-white p-6">
                  {/* Role-assigned colors */}
                  {result.tokens.colorRoles.filter(c => c.role).length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-[13px] font-medium tracking-[0.2px] text-[hsl(var(--text-primary))] uppercase mb-4">
                        Color Roles
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {result.tokens.colorRoles.filter(c => c.role).map((cr, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-4 px-4 py-3 rounded-[var(--radius-sm)] border border-[hsl(var(--border-divider))] bg-[hsl(var(--background-secondary))]"
                          >
                            <div
                              className="w-12 h-12 rounded-[var(--radius-sm)] shrink-0 border border-[hsl(var(--border-divider))]"
                              style={isRenderableColor(cr.value) ? { backgroundColor: cr.value } : {}}
                            />
                            <div className="min-w-0">
                              <p className="text-[13px] font-medium text-[hsl(var(--text-primary))]">{cr.role}</p>
                              <p className="text-[11px] font-mono text-[hsl(var(--text-tertiary))]">{cr.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unassigned colors */}
                  {result.tokens.colorRoles.filter(c => !c.role).length > 0 && (
                    <div className={result.tokens.colorRoles.filter(c => c.role).length > 0 ? "pt-5 border-t border-[hsl(var(--border-divider))]" : ""}>
                      <h3 className="text-[13px] font-medium tracking-[0.2px] text-[hsl(var(--text-primary))] uppercase mb-4">
                        Other Colors ({result.tokens.colorRoles.filter(c => !c.role).length})
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {result.tokens.colorRoles.filter(c => !c.role).map((cr, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[hsl(var(--border-divider))] bg-[hsl(var(--background-secondary))]"
                          >
                            <div
                              className="w-10 h-10 rounded-lg shrink-0 border border-[hsl(var(--border-divider))]"
                              style={isRenderableColor(cr.value) ? { backgroundColor: cr.value } : {}}
                            />
                            <div className="min-w-0">
                              <p className="text-[11px] font-mono text-[hsl(var(--text-secondary))] leading-tight break-all">{cr.value}</p>
                              <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{cr.source}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CSS variable colors */}
                  {Object.entries(result.tokens.cssVars).filter(([, v]) =>
                    /^#[0-9a-f]{3,8}$/i.test(v.trim()) || /^rgba?\(/.test(v.trim())
                  ).length > 0 && (
                    <div className="mt-5 pt-5 border-t border-[hsl(var(--border-divider))]">
                      <h3 className="text-[13px] font-medium tracking-[0.2px] text-[hsl(var(--text-primary))] uppercase mb-4">
                        CSS Variables
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(result.tokens.cssVars)
                          .filter(([, v]) => /^#[0-9a-f]{3,8}$/i.test(v.trim()) || /^rgba?\(/.test(v.trim()))
                          .slice(0, 20)
                          .map(([key, val]) => (
                            <div
                              key={key}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg border border-[hsl(var(--border-divider))] bg-[hsl(var(--background-secondary))]"
                            >
                              <div
                                className="w-8 h-8 rounded-md shrink-0 border border-[hsl(var(--border-divider))]"
                                style={{ backgroundColor: val.trim() }}
                              />
                              <div className="min-w-0">
                                <p className="text-[11px] font-mono text-[hsl(var(--text-primary))] truncate">{key}</p>
                                <p className="text-[10px] font-mono text-[hsl(var(--text-tertiary))]">{val.trim()}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Typography */}
              {(result.tokens.fonts.length > 0 || result.tokens.meta.googleFonts?.length) && (
                <div className="rounded-[var(--radius-md)] border border-[hsl(var(--border-divider))] bg-white p-6">
                  <h3 className="text-[13px] font-medium tracking-[0.2px] text-[hsl(var(--text-primary))] uppercase mb-4">
                    Typography
                  </h3>
                  {result.tokens.meta.googleFonts
                    ?.filter(f => !/material|awesome|icon|symbol|icomoon|feather|ionicons|remixicon|bootstrap.*icon|lucide/i.test(f))
                    .map((f) => (
                    <p key={f} className="text-[15px] text-[hsl(var(--text-primary))] mb-2">
                      <span className="text-[11px] font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mr-2">Google Font</span>
                      {f}
                    </p>
                  ))}
                  {result.tokens.fonts
                    .filter(f => !f.includes('var(') && f.length < 150)
                    .filter(f => !/font\s*awesome|material|icon|symbol|glyph|icomoon|feather|ionicons|remixicon|bootstrap.*icon|lucide/i.test(f))
                    .slice(0, 5)
                    .map((f, i) => (
                      <div key={i} className="mb-3">
                        <p className="text-[11px] font-mono text-[hsl(var(--text-tertiary))] mb-1 truncate">{f}</p>
                        <p className="text-[24px] text-[hsl(var(--text-primary))] truncate" style={{ fontFamily: f }}>
                          The quick brown fox jumps over the lazy dog
                        </p>
                      </div>
                    ))}
                  {result.tokens.fontWeights.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[hsl(var(--border-divider))]">
                      <p className="text-[11px] font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-2">Weights</p>
                      <div className="flex flex-wrap gap-2">
                        {result.tokens.fontWeights
                          .filter(w => /^\d{3}$|^(normal|bold|lighter|bolder)$/.test(w) || /^var\(/.test(w))
                          .map((w) => {
                            const isNumeric = /^\d{3}$/.test(w);
                            return (
                              <span
                                key={w}
                                className="text-[15px] text-[hsl(var(--text-primary))] px-3 py-1.5 rounded-md border border-[hsl(var(--border-divider))] bg-[hsl(var(--background-secondary))] font-mono"
                                style={isNumeric ? { fontWeight: w } : {}}
                              >
                                {w}
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  )}
                  {result.tokens.fontSizes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[hsl(var(--border-divider))]">
                      <p className="text-[11px] font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-2">Scale</p>
                      <div className="flex flex-wrap gap-2">
                        {result.tokens.fontSizes
                          .filter(s => s.length < 30)
                          .slice(0, 12)
                          .map((s, i) => (
                            <span
                              key={i}
                              className="font-mono text-[11px] text-[hsl(var(--text-secondary))] px-2 py-1 rounded bg-[hsl(var(--background-secondary))]"
                            >
                              {s}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Shapes: Radius + Shadows */}
              {(result.tokens.radii.length > 0 || result.tokens.shadows.length > 0) && (
                <div className="rounded-[var(--radius-md)] border border-[hsl(var(--border-divider))] bg-white p-6">
                  {result.tokens.radii.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-[13px] font-medium tracking-[0.2px] text-[hsl(var(--text-primary))] uppercase mb-4">
                        Border Radius
                      </h3>
                      {/* Component-aware radii if available */}
                      {result.tokens.radiusByComponent && Object.keys(result.tokens.radiusByComponent).length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {['button', 'input', 'card', 'badge', 'modal', 'dropdown', 'toggle', 'tab', 'nav', 'avatar', 'container'].map(comp => {
                            const entries = result.tokens.radiusByComponent?.[comp];
                            if (!entries || entries.length === 0) return null;
                            const top = entries[0];
                            return (
                              <div
                                key={comp}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[hsl(var(--border-divider))] bg-[hsl(var(--background-secondary))]"
                              >
                                <div
                                  className="w-10 h-10 bg-[hsl(var(--background-inverse))] shrink-0"
                                  style={{ borderRadius: top.value }}
                                />
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-medium text-[hsl(var(--text-primary))] capitalize">{comp}</span>
                                  <span className="text-[12px] font-mono text-[hsl(var(--text-secondary))] leading-tight">
                                    {top.value}
                                  </span>
                                </div>
                              </div>
                            );
                          }).filter(Boolean)}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {result.tokens.radii.slice(0, 8).map((r, i) => {
                            const resolved = resolveValue(r, result.tokens.cssVars);
                            return (
                              <div
                                key={i}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[hsl(var(--border-divider))] bg-[hsl(var(--background-secondary))]"
                              >
                                <div
                                  className="w-10 h-10 bg-[hsl(var(--background-inverse))] shrink-0"
                                  style={resolved ? { borderRadius: resolved } : {}}
                                />
                                <span className="text-[12px] font-mono text-[hsl(var(--text-secondary))] leading-tight">
                                  {r}{resolved && !isResolvableValue(r) ? ` = ${resolved}` : ''}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  {result.tokens.shadows.length > 0 && (
                    <div className={result.tokens.radii.length > 0 ? "pt-6 border-t border-[hsl(var(--border-divider))]" : ""}>
                      <h3 className="text-[13px] font-medium tracking-[0.2px] text-[hsl(var(--text-primary))] uppercase mb-4">
                        Shadows
                      </h3>
                      {/* Renderable shadows (no var references) */}
                      {result.tokens.shadows.filter(s => isResolvableValue(s)).length > 0 && (
                        <div className="grid gap-3 mb-4">
                          {result.tokens.shadows.filter(s => isResolvableValue(s)).slice(0, 6).map((s, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-4 p-3 rounded-lg border border-[hsl(var(--border-divider))]"
                            >
                              <div
                                className="w-14 h-14 bg-white rounded-lg shrink-0 border border-[hsl(var(--border-divider))]"
                                style={{ boxShadow: s }}
                              />
                              <code className="text-[11px] font-mono text-[hsl(var(--text-tertiary))] leading-relaxed break-all">
                                {s}
                              </code>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Unresolvable shadows (var references) -- show as token list */}
                      {result.tokens.shadows.filter(s => !isResolvableValue(s)).length > 0 && (
                        <div>
                          <p className="text-[11px] font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-2">
                            Variable-based shadows
                          </p>
                          <div className="grid gap-1.5">
                            {result.tokens.shadows.filter(s => !isResolvableValue(s)).slice(0, 6).map((s, i) => (
                              <code
                                key={i}
                                className="text-[11px] font-mono text-[hsl(var(--text-secondary))] leading-relaxed px-3 py-2 rounded-md bg-[hsl(var(--background-secondary))] break-all"
                              >
                                {s}
                              </code>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Component Preview */}
              {result.tokens.colorRoles.length > 0 && (() => {
                const cs = deriveComponentStyles(result.tokens);
                const hasAccent = cs.primaryBtnBg !== cs.textPrimary;
                const hasEnoughTokens = result.tokenCount >= 8;

                // Adaptive card border/shadow based on detected style
                const cardBorder = cs.cardStyle === 'bordered'
                  ? `1px solid ${cs.borderColor}`
                  : cs.cardStyle === 'inset' ? 'none' : 'none';
                const cardBoxShadow = cs.cardStyle === 'shadow'
                  ? (cs.cardShadow !== 'none' ? cs.cardShadow : '0 2px 8px rgba(0,0,0,0.08)')
                  : cs.cardStyle === 'inset'
                  ? (cs.insetShadow !== 'none' ? cs.insetShadow : 'inset 0 0 0 0.5px rgba(0,0,0,0.1)')
                  : 'none';
                const cardHoverShadow = cs.cardStyle === 'shadow'
                  ? (cs.dropdownShadow !== 'none' ? cs.dropdownShadow : '0 8px 24px rgba(0,0,0,0.12)')
                  : cs.cardStyle === 'bordered' ? '0 6px 20px rgba(0,0,0,0.15)' : undefined;

                // Dropdown border/shadow: use detected values, then infer from card style
                const dropdownBorder = cs.dropdownBorder || (cs.cardStyle === 'shadow' ? 'none' : `1px solid ${cs.borderColor}`);
                const dropdownShadow = cs.dropdownShadow !== 'none'
                  ? cs.dropdownShadow
                  : '0 8px 24px rgba(0,0,0,0.12)';

                // Secondary button: outline with accent color border
                const secBtnBg = cs.bg;
                const secBtnBorder = `1px solid ${cs.primaryBtnBg}`;
                const secBtnColor = cs.primaryBtnBg;

                // Ghost: use accent color text, underline for sharp sites
                const ghostColor = cs.primaryBtnBg;

                // Layout from real card detection
                const isHorizontalCard = cs.cardLayout === 'horizontal';
                const isBento = isHorizontalCard;

                return (
                  <div className="rounded-[var(--radius-md)] border border-[hsl(var(--border-divider))] bg-white p-6">
                    {/* Load Google Fonts if detected */}
                    {result.tokens.meta.googleFonts?.map((gf) => {
                      const families = gf.replace(/\+/g, ' ').split('|');
                      return families.map(f => (
                        <link key={f} rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(f.split(':')[0])}&display=swap`} />
                      ));
                    })}
                    {/* Also try loading detected fonts from Google Fonts */}
                    {cs.primaryFontName && !result.tokens.meta.googleFonts?.some(gf => gf.includes(cs.primaryFontName!)) && (
                      <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(cs.primaryFontName)}&display=swap`} />
                    )}
                    {cs.headingFontName && cs.headingFontName !== cs.primaryFontName && !result.tokens.meta.googleFonts?.some(gf => gf.includes(cs.headingFontName!)) && (
                      <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(cs.headingFontName)}&display=swap`} />
                    )}
                    <h3 className="text-[13px] font-medium tracking-[0.2px] text-[hsl(var(--text-primary))] uppercase mb-4">
                      Component Preview
                    </h3>

                    <div className={isBento ? "grid grid-cols-2 gap-4" : "grid md:grid-cols-2 lg:grid-cols-4 gap-6"} style={{ fontFamily: cs.font }}>
                      {/* Buttons */}
                      <div>
                        <p className="text-[11px] font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-3">Buttons</p>
                        <div className="flex flex-col gap-2.5">
                          <Interactive
                            as="button"
                            style={{ background: cs.primaryBtnBg, color: cs.primaryBtnText, borderRadius: cs.buttonRadius, fontSize: cs.fontSize, fontWeight: cs.fontWeightHeavy, padding: '12px 24px', border: 'none', cursor: 'pointer' }}
                            hoverStyle={{ opacity: 0.85 }}
                            activeStyle={{ opacity: 0.75, transform: 'scale(0.97)' }}
                          >
                            Primary
                          </Interactive>
                          <Interactive
                            as="button"
                            style={{ background: secBtnBg, color: secBtnColor, borderRadius: cs.buttonRadius, fontSize: cs.fontSize, fontWeight: cs.fontWeightNormal, padding: '12px 24px', border: secBtnBorder, cursor: 'pointer' }}
                            hoverStyle={{ opacity: 0.8 }}
                            activeStyle={{ transform: 'scale(0.97)' }}
                          >
                            Secondary
                          </Interactive>
                          <Interactive
                            as="button"
                            style={{ background: 'transparent', color: ghostColor, borderRadius: cs.buttonRadius, fontSize: cs.fontSize, fontWeight: cs.fontWeightNormal, padding: '12px 24px', border: 'none', cursor: 'pointer', textDecoration: cs.shapeLanguage === 'sharp' ? 'underline' : 'none' }}
                            hoverStyle={{ background: cs.surfaceColor }}
                            activeStyle={{ transform: 'scale(0.97)' }}
                          >
                            Ghost
                          </Interactive>
                          <button
                            style={{ background: `${cs.primaryBtnBg}80`, color: cs.primaryBtnText, borderRadius: cs.buttonRadius, fontSize: cs.fontSize, fontWeight: cs.fontWeightNormal, padding: '12px 24px', border: 'none', cursor: 'not-allowed', opacity: 0.5 }}
                          >
                            Disabled
                          </button>
                        </div>
                      </div>

                      {/* Input */}
                      <div>
                        <p className="text-[11px] font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-3">Input</p>
                        <div className="flex flex-col gap-3">
                          <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: cs.fontWeightHeavy, color: cs.textPrimary, marginBottom: '6px' }}>Label</label>
                            <div
                              style={{ borderRadius: cs.inputRadius, border: `1px solid ${cs.borderColor}`, background: cs.bg, padding: '10px 14px', fontSize: cs.fontSize, color: cs.textSecondary }}
                            >
                              Placeholder text
                            </div>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: cs.fontWeightHeavy, color: cs.textPrimary, marginBottom: '6px' }}>Focused</label>
                            <div
                              style={{ borderRadius: cs.inputRadius, border: `2px solid ${cs.primaryBtnBg}`, background: cs.bg, padding: '9px 13px', fontSize: cs.fontSize, color: cs.textPrimary }}
                            >
                              Typed value
                            </div>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: cs.fontWeightHeavy, color: cs.dangerColor, marginBottom: '6px' }}>Error</label>
                            <div
                              style={{ borderRadius: cs.inputRadius, border: `1px solid ${cs.dangerColor}`, background: cs.bg, padding: '10px 14px', fontSize: cs.fontSize, color: cs.textPrimary }}
                            >
                              Invalid input
                            </div>
                            <p style={{ fontSize: '12px', color: cs.dangerColor, marginTop: '4px' }}>This field is required.</p>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown */}
                      <div>
                        <p className="text-[11px] font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-3">Dropdown</p>
                        <div style={{ background: cs.bg, borderRadius: cs.dropdownRadius, boxShadow: dropdownShadow, border: dropdownBorder, padding: '4px' }}>
                          <Interactive
                            style={{ padding: '8px 12px', fontSize: cs.fontSize, color: cs.textPrimary, background: cs.surfaceColor, borderRadius: cs.buttonRadius, cursor: 'pointer' }}
                            hoverStyle={{ opacity: 0.8 }}
                          >
                            Edit
                          </Interactive>
                          <Interactive
                            style={{ padding: '8px 12px', fontSize: cs.fontSize, color: cs.textPrimary, borderRadius: cs.buttonRadius, cursor: 'pointer' }}
                            hoverStyle={{ background: cs.surfaceColor }}
                          >
                            Duplicate
                          </Interactive>
                          <Interactive
                            style={{ padding: '8px 12px', fontSize: cs.fontSize, color: cs.textPrimary, borderRadius: cs.buttonRadius, cursor: 'pointer' }}
                            hoverStyle={{ background: cs.surfaceColor }}
                          >
                            Share
                          </Interactive>
                          <div style={{ margin: '4px 12px', borderTop: `1px solid ${cs.borderColor}` }}></div>
                          <Interactive
                            style={{ padding: '8px 12px', fontSize: cs.fontSize, color: cs.dangerColor, borderRadius: cs.buttonRadius, cursor: 'pointer' }}
                            hoverStyle={{ background: cs.surfaceColor }}
                          >
                            Delete
                          </Interactive>
                        </div>
                      </div>

                      {/* Card: adapts to extracted site's card pattern */}
                      <div className={isBento ? "col-span-2" : ""} style={{ maxWidth: isBento ? undefined : '320px' }}>
                        <p className="text-[11px] font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mb-3">Card</p>
                        {cs.imagePosition === 'none' ? (
                          /* No image detected: gray container with text below (Mobbin/Rakuten style) */
                          <>
                            <Interactive
                              style={{
                                background: cs.surfaceColor,
                                borderRadius: cs.cardRadius,
                                border: cs.cardStyle === 'bordered' ? cardBorder : 'none',
                                boxShadow: cs.cardStyle === 'shadow' ? cardBoxShadow : 'none',
                                cursor: 'pointer',
                                height: '160px',
                                marginBottom: '12px',
                              }}
                              hoverStyle={{ opacity: 0.85, boxShadow: cardHoverShadow }}
                              activeStyle={{ transform: 'scale(0.98)' }}
                            >
                              <span></span>
                            </Interactive>
                            <div style={{ fontFamily: cs.font, paddingBottom: '8px' }}>
                              <p style={{ fontSize: '15px', fontWeight: cs.fontWeightHeavy, color: cs.textPrimary, marginBottom: '4px', fontFamily: cs.headingFont }}>Card title</p>
                              <p style={{ fontSize: cs.fontSize, color: cs.textSecondary, lineHeight: '1.5', marginBottom: '0' }}>
                                Description below the card.
                              </p>
                            </div>
                          </>
                        ) : cs.cardStyle === 'none' ? (
                          /* No container: just rounded image + text below (Airbnb style) */
                          <>
                            <Interactive
                              style={{
                                width: '100%',
                                height: cs.cardImgHeight,
                                background: cs.surfaceColor,
                                borderRadius: cs.cardRadius,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                marginBottom: '10px',
                              }}
                              hoverStyle={{ boxShadow: '0 6px 20px rgba(0,0,0,0.20)' }}
                              activeStyle={{ transform: 'scale(0.98)' }}
                            >
                              <span></span>
                            </Interactive>
                            <div style={{ fontFamily: cs.font }}>
                              <p style={{ fontSize: '15px', fontWeight: cs.fontWeightHeavy, color: cs.textPrimary, marginBottom: '2px', fontFamily: cs.headingFont }}>Card title</p>
                              <p style={{ fontSize: cs.fontSize, color: cs.textSecondary, lineHeight: '1.5', marginBottom: '0' }}>
                                Description below the image.
                              </p>
                            </div>
                          </>
                        ) : cs.imageFullBleed ? (
                          /* Image full-bleed: image fills top, text padded below (Microsoft/Amazon style) */
                          <Interactive
                            style={{
                              background: cs.bg,
                              borderRadius: cs.cardRadius,
                              border: cs.cardStyle === 'bordered' ? cardBorder : 'none',
                              boxShadow: cs.cardStyle === 'shadow' ? cardBoxShadow : cs.cardStyle === 'inset' ? (cs.insetShadow !== 'none' ? cs.insetShadow : 'inset 0 0 0 0.5px rgba(0,0,0,0.1)') : 'none',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              fontFamily: cs.font,
                            }}
                            hoverStyle={{ boxShadow: cardHoverShadow }}
                            activeStyle={{ transform: 'scale(0.98)' }}
                          >
                            <div style={{ width: '100%', height: cs.cardImgHeight, background: cs.surfaceColor }}></div>
                            <div style={{ padding: '16px 20px 20px' }}>
                              <p style={{ fontSize: '15px', fontWeight: cs.fontWeightHeavy, color: cs.textPrimary, marginBottom: '4px', fontFamily: cs.headingFont }}>Card title</p>
                              <p style={{ fontSize: cs.fontSize, color: cs.textSecondary, lineHeight: '1.5', marginBottom: '12px' }}>
                                Description inside the card.
                              </p>
                              <Interactive
                                as="span"
                                style={{ display: 'inline-block', padding: '8px 16px', borderRadius: cs.buttonRadius, background: cs.primaryBtnBg, color: cs.primaryBtnText, fontSize: '13px', fontWeight: cs.fontWeightHeavy, cursor: 'pointer' }}
                                hoverStyle={{ opacity: 0.85 }}
                              >
                                Learn more
                              </Interactive>
                            </div>
                          </Interactive>
                        ) : (
                          /* Image padded inside card (Stripe/SaaS style) */
                          <Interactive
                            style={{
                              background: cs.bg,
                              borderRadius: cs.cardRadius,
                              border: cs.cardStyle === 'bordered' ? cardBorder : 'none',
                              boxShadow: cs.cardStyle === 'shadow' ? cardBoxShadow : 'none',
                              padding: '20px',
                              cursor: 'pointer',
                              fontFamily: cs.font,
                            }}
                            hoverStyle={{ boxShadow: cardHoverShadow }}
                            activeStyle={{ transform: 'scale(0.98)' }}
                          >
                            <div style={{ width: '100%', height: '120px', background: cs.surfaceColor, borderRadius: `calc(${cs.cardRadius} - 8px)`, marginBottom: '16px' }}></div>
                            <p style={{ fontSize: '15px', fontWeight: cs.fontWeightHeavy, color: cs.textPrimary, marginBottom: '4px', fontFamily: cs.headingFont }}>Card title</p>
                            <p style={{ fontSize: cs.fontSize, color: cs.textSecondary, lineHeight: '1.5', marginBottom: '8px' }}>
                              Description inside the card.
                            </p>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <span style={{ padding: '4px 10px', borderRadius: cs.tagRadius, background: cs.surfaceColor, fontSize: '12px', color: cs.textSecondary }}>Tag</span>
                              <span style={{ padding: '4px 10px', borderRadius: cs.tagRadius, background: cs.surfaceColor, fontSize: '12px', color: cs.textSecondary }}>Label</span>
                            </div>
                          </Interactive>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : tab === "markdown" ? (
            <div className="rounded-[var(--radius-md)] border border-[hsl(var(--border-divider))] bg-[hsl(var(--background-inverse))] p-6 shadow-[0_13px_27px_rgba(0,0,0,0.15)] max-h-[400px] overflow-y-auto">
              <pre className="text-[13px] font-mono leading-[1.7] text-white/70 whitespace-pre-wrap break-words">
                {result.markdown}
              </pre>
            </div>
          ) : tab === "tailwind" ? (
            <div className="rounded-[var(--radius-md)] border border-[hsl(var(--border-divider))] bg-[hsl(var(--background-inverse))] p-6 shadow-[0_13px_27px_rgba(0,0,0,0.15)] max-h-[400px] overflow-y-auto">
              <pre className="text-[13px] font-mono leading-[1.7] text-white/70 whitespace-pre-wrap break-words">
                {result.tailwindConfig || "Tailwind config not available for snippet-based extraction. Use URL extraction instead."}
              </pre>
            </div>
          ) : tab === "css-vars" ? (
            <div className="rounded-[var(--radius-md)] border border-[hsl(var(--border-divider))] bg-[hsl(var(--background-inverse))] p-6 shadow-[0_13px_27px_rgba(0,0,0,0.15)] max-h-[400px] overflow-y-auto">
              <pre className="text-[13px] font-mono leading-[1.7] text-white/70 whitespace-pre-wrap break-words">
                {result.cssVariables || "CSS variables not available for snippet-based extraction. Use URL extraction instead."}
              </pre>
            </div>
          ) : tab === "structure" ? (
            <div className="rounded-[var(--radius-md)] border border-[hsl(var(--border-divider))] bg-white p-6 max-h-[400px] overflow-y-auto">
              {result.pageStructure.length > 0 ? (
                <div className="space-y-2">
                  {result.pageStructure.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b border-[hsl(var(--border-divider))] last:border-0">
                      <span className="text-[12px] font-mono text-[hsl(var(--text-tertiary))] shrink-0 w-6">{i + 1}</span>
                      <span className="text-[14px] text-[hsl(var(--text-primary))]">{s}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[14px] text-[hsl(var(--text-tertiary))]">Page structure not available. Only detected via URL extraction with headless browser.</p>
              )}
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-full bg-[hsl(var(--background-inverse))] text-[hsl(var(--text-inverse))] text-[14px] font-semibold hover:bg-[hsl(var(--background-inverse-hover))] transition-colors duration-[var(--duration-base)]"
            >
              Download DESIGN.md
            </button>
            <button
              onClick={handleCopy}
              className="px-6 py-3 rounded-full shadow-[var(--shadow-image-inset)] text-[hsl(var(--text-primary))] text-[14px] font-semibold hover:bg-[hsl(var(--background-primary-hover))] transition-colors duration-[var(--duration-base)]"
            >
              Copy to clipboard
            </button>
          </div>

          {result.blocked > 0 && (
            <p className="mt-4 text-[13px] text-[hsl(var(--text-tertiary))] leading-relaxed max-w-[560px]">
              Some CSS sources were blocked. Paste this file into your AI agent and say
              "fill in the missing sections" for a complete DESIGN.md.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
