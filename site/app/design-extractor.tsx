"use client";

import { useState } from "react";
import { extractDesignTokens } from "./actions";

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
  shadows: string[];
  cssVars: Record<string, string>;
  meta: { themeColor?: string; title?: string; googleFonts?: string[] };
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

      // Basic role assignment by analyzing values
      const hexColors = colorRoles.filter(c => c.value.startsWith('rgb'));
      // Find near-white backgrounds
      for (const cr of hexColors) {
        if (cr.source === 'background' && cr.value.includes('255') && !cr.role) {
          cr.role = 'Background'; break;
        }
      }
      // Find dark text
      for (const cr of hexColors) {
        if (cr.source === 'text' && !cr.value.includes('255') && !cr.role) {
          const match = cr.value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)/);
          if (match && parseInt(match[1]) < 80 && parseInt(match[2]) < 80 && parseInt(match[3]) < 80) {
            cr.role = 'Text Primary'; break;
          }
        }
      }

      const tokens: TokenData = {
        colors: (data.colors || []).map((c: { value: string }) => c.value),
        colorRoles,
        fonts: data.fonts || [],
        fontSizes: data.fontSizes || [],
        fontWeights: data.fontWeights || [],
        radii: data.radii || [],
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

    const res = await extractDesignTokens(url.trim());

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
      <form onSubmit={handleSubmit} className="max-w-[560px]">
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
                  {result.tokens.meta.googleFonts?.map((f) => (
                    <p key={f} className="text-[15px] text-[hsl(var(--text-primary))] mb-2">
                      <span className="text-[11px] font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wider mr-2">Google Font</span>
                      {f}
                    </p>
                  ))}
                  {result.tokens.fonts
                    .filter(f => !f.includes('var(') && f.length < 150)
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
