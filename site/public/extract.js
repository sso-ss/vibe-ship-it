// DevTools Design Token Extractor
// Paste this in the browser console on any website.
// It extracts colors, fonts, spacing, shadows, radii from the live page
// and copies the result as JSON to your clipboard.

(function() {
  const colors = new Map();
  const fonts = new Set();
  const fontSizes = new Set();
  const fontWeights = new Set();
  const radii = new Set();
  const shadows = new Set();
  const spacing = new Set();
  const cssVars = {};

  // Extract CSS custom properties from all stylesheets
  try {
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.style) {
            for (let i = 0; i < rule.style.length; i++) {
              const prop = rule.style[i];
              if (prop.startsWith('--')) {
                cssVars[prop] = rule.style.getPropertyValue(prop).trim();
              }
            }
          }
        }
      } catch(e) { /* cross-origin sheet */ }
    }
  } catch(e) {}

  // Also get :root variables
  const rootStyles = getComputedStyle(document.documentElement);
  for (const prop of rootStyles) {
    if (prop.startsWith('--')) {
      cssVars[prop] = rootStyles.getPropertyValue(prop).trim();
    }
  }

  // Sample visible elements
  const elements = document.querySelectorAll('body *:not(script):not(style):not(link):not(meta)');
  const sampled = Array.from(elements).slice(0, 500);

  for (const el of sampled) {
    const s = getComputedStyle(el);

    // Colors
    const trackColor = (val, src) => {
      if (val && val !== 'rgba(0, 0, 0, 0)' && val !== 'transparent' && val !== 'inherit') {
        if (!colors.has(val)) colors.set(val, new Set());
        colors.get(val).add(src);
      }
    };
    trackColor(s.color, 'text');
    trackColor(s.backgroundColor, 'background');
    trackColor(s.borderColor, 'border');
    trackColor(s.borderTopColor, 'border');
    trackColor(s.outlineColor, 'border');

    // Fonts
    if (s.fontFamily) fonts.add(s.fontFamily);

    // Font sizes
    if (s.fontSize && s.fontSize !== '0px') fontSizes.add(s.fontSize);

    // Font weights
    if (s.fontWeight) fontWeights.add(s.fontWeight);

    // Border radius
    if (s.borderRadius && s.borderRadius !== '0px') radii.add(s.borderRadius);

    // Box shadow
    if (s.boxShadow && s.boxShadow !== 'none') shadows.add(s.boxShadow);

    // Spacing (padding, margin, gap)
    if (s.padding && s.padding !== '0px') spacing.add(s.padding);
    if (s.margin && s.margin !== '0px') spacing.add(s.margin);
    if (s.gap && s.gap !== 'normal') spacing.add(s.gap);
  }

  // Get theme-color meta
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const themeColor = themeMeta ? themeMeta.getAttribute('content') : undefined;

  // Build color roles array
  const colorRoles = [];
  for (const [val, srcs] of colors) {
    colorRoles.push({ value: val, sources: Array.from(srcs) });
  }

  const result = {
    _type: 'design-tokens',
    url: location.href,
    title: document.title,
    themeColor,
    colors: colorRoles.slice(0, 40),
    fonts: Array.from(fonts).slice(0, 10),
    fontSizes: Array.from(fontSizes).sort((a, b) => parseFloat(a) - parseFloat(b)).slice(0, 20),
    fontWeights: Array.from(new Set(Array.from(fontWeights))).sort().slice(0, 10),
    radii: Array.from(radii).slice(0, 10),
    shadows: Array.from(shadows).slice(0, 10),
    spacing: Array.from(spacing).slice(0, 20),
    cssVars
  };

  // Copy to clipboard
  const json = JSON.stringify(result, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    console.log('%c Design tokens extracted and copied to clipboard!', 'color: #635bff; font-weight: bold; font-size: 14px;');
    console.log(`${result.colors.length} colors, ${result.fonts.length} fonts, ${result.fontSizes.length} sizes, ${result.radii.length} radii, ${result.shadows.length} shadows`);
    console.log('Paste into the DESIGN.md generator at vibe-ship-it.');
  }).catch(() => {
    // Fallback: log it
    console.log('%c Could not copy to clipboard. Copy the JSON below:', 'color: #e25950; font-weight: bold;');
    console.log(json);
  });
})();
