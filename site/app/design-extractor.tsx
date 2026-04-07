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
    tokens: TokenData;
    tokenCount: number;
    accessible: number;
    blocked: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"preview" | "markdown">("preview");
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

  const SNIPPET = `javascript:void(function(){const c=new Map,f=new Set,s=new Set,w=new Set,r=new Set,sh=new Set,v={};try{for(const t of document.styleSheets)try{for(const u of t.cssRules)if(u.style)for(let i=0;i<u.style.length;i++){const p=u.style[i];if(p.startsWith("--")){const val=u.style.getPropertyValue(p).trim();if(val.match(/^#[0-9a-f]{3,8}$|^rgb|^hsl/i))v[p]=val}}}catch(e){}}catch(e){}const els=Array.from(document.querySelectorAll("body *:not(script):not(style):not(link):not(meta)")).slice(0,300);for(const el of els){const st=getComputedStyle(el),tc=(val,src)=>{val&&val!=="rgba(0, 0, 0, 0)"&&val!=="transparent"&&(c.has(val)||c.set(val,new Set),c.get(val).add(src))};tc(st.color,"text");tc(st.backgroundColor,"background");tc(st.borderColor,"border");st.fontFamily&&f.add(st.fontFamily);st.fontSize&&st.fontSize!=="0px"&&s.add(st.fontSize);st.fontWeight&&w.add(st.fontWeight);st.borderRadius&&st.borderRadius!=="0px"&&r.add(st.borderRadius);st.boxShadow&&st.boxShadow!=="none"&&sh.add(st.boxShadow)}const tm=document.querySelector('meta[name="theme-color"]'),res={_type:"design-tokens",url:location.href,title:document.title,themeColor:tm?tm.getAttribute("content"):void 0,colors:Array.from(c).map(([v,s])=>({value:v,sources:Array.from(s)})).slice(0,30),fonts:Array.from(f).slice(0,5),fontSizes:Array.from(s).sort((a,b)=>parseFloat(a)-parseFloat(b)).slice(0,15),fontWeights:Array.from(w).sort().slice(0,8),radii:Array.from(r).slice(0,8),shadows:Array.from(sh).slice(0,6),cssVars:v};navigator.clipboard.writeText(JSON.stringify(res)).then(()=>alert("Copied! Paste into the generator.")).catch(()=>prompt("Copy this:",JSON.stringify(res)))})()`;

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
              className="flex-1 px-4 py-3 rounded-[12px] shadow-[inset_0_0_0_1px_rgba(64,64,64,0.16)] bg-white text-[12px] font-mono text-[rgb(20,20,20)] placeholder:text-[rgb(173,173,173)] focus:outline-none focus:shadow-[inset_0_0_0_2px_rgb(20,20,20)] transition-all resize-none"
            />
          ) : (
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder='Enter a URL or paste extracted JSON'
              className="flex-1 px-5 py-3 rounded-full shadow-[inset_0_0_0_1px_rgba(64,64,64,0.16)] bg-white text-[14px] text-[rgb(20,20,20)] placeholder:text-[rgb(173,173,173)] focus:outline-none focus:shadow-[inset_0_0_0_2px_rgb(20,20,20)] transition-all"
            />
          )}
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-3 rounded-full bg-[rgb(20,20,20)] text-white text-[14px] font-semibold hover:bg-[rgb(50,50,50)] transition-colors duration-200 disabled:opacity-50 whitespace-nowrap self-start"
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
            className="mt-2 text-[12px] text-[rgb(173,173,173)] hover:text-[rgb(20,20,20)] transition-colors"
          >
            Clear and enter a URL instead
          </button>
        )}
      </form>

      {error && (
        <p className="mt-4 text-[15px] text-[rgb(220, 60, 50)]">{error}</p>
      )}

      {result && (
        <div className="mt-8">
          {/* Stats */}
          <div className="flex flex-wrap gap-6 mb-6">
            <div>
              <span className="text-[32px] font-bold text-[rgb(20, 20, 20)] leading-none">
                {result.tokenCount}
              </span>
              <span className="text-[13px] font-medium text-[rgb(173, 173, 173)] ml-2">
                tokens extracted
              </span>
            </div>
            <div>
              <span className="text-[32px] font-bold text-[rgb(48, 193, 116)] leading-none">
                {result.accessible}
              </span>
              <span className="text-[13px] font-medium text-[rgb(173, 173, 173)] ml-2">
                sources accessible
              </span>
            </div>
            {result.blocked > 0 && (
              <div>
                <span className="text-[32px] font-bold text-[rgb(200, 160, 50)] leading-none">
                  {result.blocked}
                </span>
                <span className="text-[13px] font-medium text-[rgb(173, 173, 173)] ml-2">
                  sources blocked
                </span>
              </div>
            )}
          </div>

          {/* Snippet fallback when extraction is weak */}
          {showSnippet && (
            <div className="mb-6 rounded-xl border border-[rgba(245,166,35,0.3)] bg-[rgba(245,166,35,0.04)] p-5">
              <p className="text-[15px] font-medium text-[rgb(20, 20, 20)] mb-2">
                Not enough tokens from this site.
              </p>
              <p className="text-[14px] text-[rgb(112, 112, 112)] leading-relaxed mb-4">
                This site's CSS was mostly blocked. For full extraction, open the site in your browser, right-click and select "Inspect", go to Console, and paste this bookmarklet as a new bookmark URL. Then click it while on the site. It copies all design tokens to your clipboard. Come back here and paste.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCopySnippet}
                  className="px-5 py-2.5 rounded-lg bg-[rgb(20,20,20)] text-white text-[13px] font-medium hover:bg-[rgb(50,50,50)] transition-colors"
                >
                  {snippetCopied ? "Copied!" : "Copy extraction snippet"}
                </button>
              </div>
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex gap-1 mb-4 p-1 bg-[rgba(64,64,64,0.06)] rounded-lg w-fit">
            <button
              onClick={() => setTab("preview")}
              className={`px-4 py-2 rounded-md text-[13px] font-medium transition-all ${
                tab === "preview"
                  ? "bg-white text-[rgb(20, 20, 20)] shadow-[0_1px_3px_rgba(64,64,64,0.16)]"
                  : "text-[rgb(173, 173, 173)] hover:text-[rgb(112, 112, 112)]"
              }`}
            >
              Visual Preview
            </button>
            <button
              onClick={() => setTab("markdown")}
              className={`px-4 py-2 rounded-md text-[13px] font-medium transition-all ${
                tab === "markdown"
                  ? "bg-white text-[rgb(20, 20, 20)] shadow-[0_1px_3px_rgba(64,64,64,0.16)]"
                  : "text-[rgb(173, 173, 173)] hover:text-[rgb(112, 112, 112)]"
              }`}
            >
              Markdown
            </button>
          </div>

          {tab === "preview" ? (
            <div className="space-y-6">
              {/* Colors */}
              {result.tokens.colorRoles.length > 0 && (
                <div className="rounded-xl border border-[rgba(64,64,64,0.16)] bg-white p-6">
                  {/* Role-assigned colors */}
                  {result.tokens.colorRoles.filter(c => c.role).length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-[13px] font-medium tracking-[0.02em] text-[rgb(20, 20, 20)] uppercase mb-4">
                        Color Roles
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {result.tokens.colorRoles.filter(c => c.role).map((cr, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-4 px-4 py-3 rounded-lg border border-[rgba(0,0,0,0.04)] bg-[rgba(64,64,64,0.04)]"
                          >
                            <div
                              className="w-12 h-12 rounded-lg shrink-0 border border-[rgba(64,64,64,0.16)]"
                              style={isRenderableColor(cr.value) ? { backgroundColor: cr.value } : {}}
                            />
                            <div className="min-w-0">
                              <p className="text-[13px] font-medium text-[rgb(20, 20, 20)]">{cr.role}</p>
                              <p className="text-[11px] font-mono text-[rgb(173, 173, 173)]">{cr.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unassigned colors */}
                  {result.tokens.colorRoles.filter(c => !c.role).length > 0 && (
                    <div className={result.tokens.colorRoles.filter(c => c.role).length > 0 ? "pt-5 border-t border-[rgba(0,0,0,0.04)]" : ""}>
                      <h3 className="text-[13px] font-medium tracking-[0.02em] text-[rgb(20, 20, 20)] uppercase mb-4">
                        Other Colors ({result.tokens.colorRoles.filter(c => !c.role).length})
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {result.tokens.colorRoles.filter(c => !c.role).map((cr, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[rgba(0,0,0,0.04)] bg-[rgba(64,64,64,0.04)]"
                          >
                            <div
                              className="w-10 h-10 rounded-lg shrink-0 border border-[rgba(64,64,64,0.16)]"
                              style={isRenderableColor(cr.value) ? { backgroundColor: cr.value } : {}}
                            />
                            <div className="min-w-0">
                              <p className="text-[11px] font-mono text-[rgb(112, 112, 112)] leading-tight break-all">{cr.value}</p>
                              <p className="text-[10px] text-[rgb(173, 173, 173)]">{cr.source}</p>
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
                    <div className="mt-5 pt-5 border-t border-[rgba(0,0,0,0.04)]">
                      <h3 className="text-[13px] font-medium tracking-[0.02em] text-[rgb(20, 20, 20)] uppercase mb-4">
                        CSS Variables
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(result.tokens.cssVars)
                          .filter(([, v]) => /^#[0-9a-f]{3,8}$/i.test(v.trim()) || /^rgba?\(/.test(v.trim()))
                          .slice(0, 20)
                          .map(([key, val]) => (
                            <div
                              key={key}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.04)] bg-[rgba(64,64,64,0.04)]"
                            >
                              <div
                                className="w-8 h-8 rounded-md shrink-0 border border-[rgba(64,64,64,0.16)]"
                                style={{ backgroundColor: val.trim() }}
                              />
                              <div className="min-w-0">
                                <p className="text-[11px] font-mono text-[rgb(20, 20, 20)] truncate">{key}</p>
                                <p className="text-[10px] font-mono text-[rgb(173, 173, 173)]">{val.trim()}</p>
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
                <div className="rounded-xl border border-[rgba(64,64,64,0.16)] bg-white p-6">
                  <h3 className="text-[13px] font-medium tracking-[0.02em] text-[rgb(20, 20, 20)] uppercase mb-4">
                    Typography
                  </h3>
                  {result.tokens.meta.googleFonts?.map((f) => (
                    <p key={f} className="text-[15px] text-[rgb(20, 20, 20)] mb-2">
                      <span className="text-[11px] font-medium text-[rgb(173, 173, 173)] uppercase tracking-wider mr-2">Google Font</span>
                      {f}
                    </p>
                  ))}
                  {result.tokens.fonts
                    .filter(f => !f.includes('var(') && f.length < 150)
                    .slice(0, 5)
                    .map((f, i) => (
                      <div key={i} className="mb-3">
                        <p className="text-[11px] font-mono text-[rgb(173, 173, 173)] mb-1 truncate">{f}</p>
                        <p className="text-[24px] text-[rgb(20, 20, 20)] truncate" style={{ fontFamily: f }}>
                          The quick brown fox jumps over the lazy dog
                        </p>
                      </div>
                    ))}
                  {result.tokens.fontWeights.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.04)]">
                      <p className="text-[11px] font-medium text-[rgb(173, 173, 173)] uppercase tracking-wider mb-2">Weights</p>
                      <div className="flex flex-wrap gap-2">
                        {result.tokens.fontWeights
                          .filter(w => /^\d{3}$|^(normal|bold|lighter|bolder)$/.test(w) || /^var\(/.test(w))
                          .map((w) => {
                            const isNumeric = /^\d{3}$/.test(w);
                            return (
                              <span
                                key={w}
                                className="text-[15px] text-[rgb(20, 20, 20)] px-3 py-1.5 rounded-md border border-[rgba(0,0,0,0.04)] bg-[rgba(64,64,64,0.04)] font-mono"
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
                    <div className="mt-4 pt-4 border-t border-[rgba(0,0,0,0.04)]">
                      <p className="text-[11px] font-medium text-[rgb(173, 173, 173)] uppercase tracking-wider mb-2">Scale</p>
                      <div className="flex flex-wrap gap-2">
                        {result.tokens.fontSizes
                          .filter(s => s.length < 30)
                          .slice(0, 12)
                          .map((s, i) => (
                            <span
                              key={i}
                              className="font-mono text-[11px] text-[rgb(112, 112, 112)] px-2 py-1 rounded bg-[rgba(64,64,64,0.06)]"
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
                <div className="rounded-xl border border-[rgba(64,64,64,0.16)] bg-white p-6">
                  {result.tokens.radii.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-[13px] font-medium tracking-[0.02em] text-[rgb(20, 20, 20)] uppercase mb-4">
                        Border Radius
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {result.tokens.radii.slice(0, 8).map((r, i) => {
                          const resolved = resolveValue(r, result.tokens.cssVars);
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[rgba(0,0,0,0.04)] bg-[rgba(64,64,64,0.04)]"
                            >
                              <div
                                className="w-10 h-10 bg-[rgb(20,20,20)] shrink-0"
                                style={resolved ? { borderRadius: resolved } : {}}
                              />
                              <span className="text-[12px] font-mono text-[rgb(112, 112, 112)] leading-tight">
                                {r}{resolved && !isResolvableValue(r) ? ` = ${resolved}` : ''}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {result.tokens.shadows.length > 0 && (
                    <div className={result.tokens.radii.length > 0 ? "pt-6 border-t border-[rgba(0,0,0,0.04)]" : ""}>
                      <h3 className="text-[13px] font-medium tracking-[0.02em] text-[rgb(20, 20, 20)] uppercase mb-4">
                        Shadows
                      </h3>
                      {/* Renderable shadows (no var references) */}
                      {result.tokens.shadows.filter(s => isResolvableValue(s)).length > 0 && (
                        <div className="grid gap-3 mb-4">
                          {result.tokens.shadows.filter(s => isResolvableValue(s)).slice(0, 6).map((s, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-4 p-3 rounded-lg border border-[rgba(64,64,64,0.06)]"
                            >
                              <div
                                className="w-14 h-14 bg-white rounded-lg shrink-0 border border-[rgba(64,64,64,0.06)]"
                                style={{ boxShadow: s }}
                              />
                              <code className="text-[11px] font-mono text-[rgb(173, 173, 173)] leading-relaxed break-all">
                                {s}
                              </code>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Unresolvable shadows (var references) -- show as token list */}
                      {result.tokens.shadows.filter(s => !isResolvableValue(s)).length > 0 && (
                        <div>
                          <p className="text-[11px] font-medium text-[rgb(173, 173, 173)] uppercase tracking-wider mb-2">
                            Variable-based shadows
                          </p>
                          <div className="grid gap-1.5">
                            {result.tokens.shadows.filter(s => !isResolvableValue(s)).slice(0, 6).map((s, i) => (
                              <code
                                key={i}
                                className="text-[11px] font-mono text-[rgb(112, 112, 112)] leading-relaxed px-3 py-2 rounded-md bg-[rgba(64,64,64,0.04)] break-all"
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
          ) : (
            /* Markdown view */
            <div className="rounded-xl border border-[rgba(64,64,64,0.16)] bg-[rgb(20,20,20)] p-6 shadow-[0_13px_27px_rgba(0,0,0,0.15)] max-h-[400px] overflow-y-auto">
              <pre className="text-[13px] font-mono leading-[1.7] text-white/70 whitespace-pre-wrap break-words">
                {result.markdown}
              </pre>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-full bg-[rgb(20,20,20)] text-white text-[14px] font-semibold hover:bg-[rgb(50,50,50)] transition-colors duration-200"
            >
              Download DESIGN.md
            </button>
            <button
              onClick={handleCopy}
              className="px-6 py-3 rounded-full shadow-[inset_0_0_0_1px_rgba(64,64,64,0.16)] text-[rgb(20,20,20)] text-[14px] font-semibold hover:bg-[rgb(245,245,245)] transition-colors duration-200"
            >
              Copy to clipboard
            </button>
          </div>

          {result.blocked > 0 && (
            <p className="mt-4 text-[13px] text-[rgb(173, 173, 173)] leading-relaxed max-w-[560px]">
              Some CSS sources were blocked. Paste this file into your AI agent and say
              "fill in the missing sections" for a complete DESIGN.md.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
