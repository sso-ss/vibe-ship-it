// DevTools Design Token Extractor
// Paste this in the browser console on any website.
// It extracts colors, fonts, spacing, shadows, radii from the live page
// and copies the result as JSON to your clipboard.

(function() {
  const colors = new Map();
  const fonts = new Set();
  const fontSizes = new Set();
  const fontWeights = new Set();
  const lineHeights = new Set();
  const letterSpacings = new Set();
  const shadows = new Set();
  const spacing = new Set();
  const cssVars = {};

  // --- Border Radius: per-component extraction ---
  // Classify element into a component type for radius grouping
  function classifyElement(el) {
    const tag = el.tagName.toLowerCase();
    const role = (el.getAttribute('role') || '').toLowerCase();
    const cls = (el.className && typeof el.className === 'string') ? el.className.toLowerCase() : '';
    const type = (el.getAttribute('type') || '').toLowerCase();

    // Buttons
    if (tag === 'button' || role === 'button' || type === 'submit' || type === 'button'
        || /\b(btn|button)\b/.test(cls)) return 'button';

    // Inputs
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || role === 'textbox'
        || role === 'combobox' || role === 'searchbox' || /\b(input|field|search)\b/.test(cls)) return 'input';

    // Badges / tags / chips
    if (/\b(badge|tag|chip|pill|label)\b/.test(cls) || role === 'status') return 'badge';

    // Modals / dialogs
    if (tag === 'dialog' || role === 'dialog' || role === 'alertdialog'
        || /\b(modal|dialog|drawer|sheet)\b/.test(cls)) return 'modal';

    // Navigation
    if (tag === 'nav' || role === 'navigation' || /\b(nav|navbar|header|topbar|sidebar)\b/.test(cls)) return 'nav';

    // Tabs
    if (role === 'tab' || role === 'tablist' || /\b(tab)\b/.test(cls)) return 'tab';

    // Dropdown / menu
    if (role === 'menu' || role === 'listbox' || /\b(dropdown|menu|popover|tooltip|select)\b/.test(cls)) return 'dropdown';

    // Cards (check parent size and background)
    if (/\b(card|tile|panel|feature|pricing|testimonial)\b/.test(cls)) return 'card';

    // Images / avatars
    if (tag === 'img' || /\b(avatar|thumb|profile)\b/.test(cls)) return 'avatar';

    // Toggle / switch
    if (/\b(toggle|switch)\b/.test(cls) || role === 'switch') return 'toggle';

    // Generic containers that have visible radius (cards we missed)
    const s = getComputedStyle(el);
    const bg = s.backgroundColor;
    const border = s.borderWidth;
    const shadow = s.boxShadow;
    const hasSurface = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
    const hasBorder = border && parseFloat(border) > 0;
    const hasShadow = shadow && shadow !== 'none';
    if ((hasSurface || hasBorder || hasShadow) && el.children.length > 0) {
      const rect = el.getBoundingClientRect();
      const viewW = window.innerWidth;
      const isFullWidth = rect.width > viewW * 0.85;
      const isTooTall = rect.height > 600;
      if (!isFullWidth && !isTooTall && rect.width > 100 && rect.height > 60) return 'card';
      if (rect.width > 40 && rect.height > 20 && rect.width < 400) return 'container';
    }

    return 'other';
  }

  // Radius entries: { component, shorthand, corners: {tl, tr, br, bl}, count }
  const radiusEntries = new Map(); // key = component+shorthand

  function trackRadius(el, s) {
    const tl = s.borderTopLeftRadius;
    const tr = s.borderTopRightRadius;
    const br = s.borderBottomRightRadius;
    const bl = s.borderBottomLeftRadius;
    // Skip if all zero
    if ((!tl || tl === '0px') && (!tr || tr === '0px') && (!br || br === '0px') && (!bl || bl === '0px')) return;

    const shorthand = s.borderRadius || [tl, tr, br, bl].join(' ');
    const component = classifyElement(el);
    const key = component + '|' + shorthand;

    if (radiusEntries.has(key)) {
      radiusEntries.get(key).count++;
    } else {
      radiusEntries.set(key, {
        component,
        shorthand,
        corners: { tl: tl || '0px', tr: tr || '0px', br: br || '0px', bl: bl || '0px' },
        count: 1,
        sample: tag_id(el)
      });
    }
  }

  function tag_id(el) {
    const tag = el.tagName.toLowerCase();
    const cls = (el.className && typeof el.className === 'string')
      ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
      : '';
    return tag + cls;
  }

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
  const sampled = Array.from(elements).slice(0, 800);

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

    // Line heights
    if (s.lineHeight && s.lineHeight !== 'normal') lineHeights.add(s.lineHeight);

    // Letter spacing
    if (s.letterSpacing && s.letterSpacing !== 'normal' && s.letterSpacing !== '0px') {
      letterSpacings.add(s.letterSpacing);
    }

    // Border radius (per-component)
    trackRadius(el, s);

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

  // Build radius map: group by component, sort by frequency
  const radiusByComponent = {};
  for (const entry of radiusEntries.values()) {
    if (!radiusByComponent[entry.component]) radiusByComponent[entry.component] = [];
    radiusByComponent[entry.component].push({
      value: entry.shorthand,
      corners: entry.corners,
      count: entry.count,
      sample: entry.sample
    });
  }
  // Sort each component's radii by frequency (most common first)
  for (const comp of Object.keys(radiusByComponent)) {
    radiusByComponent[comp].sort((a, b) => b.count - a.count);
  }

  // Also collect a flat sorted list for backward compat
  const allRadii = new Set();
  for (const entry of radiusEntries.values()) {
    allRadii.add(entry.shorthand);
  }

  const result = {
    _type: 'design-tokens',
    _version: 2,
    url: location.href,
    title: document.title,
    themeColor,
    colors: colorRoles.slice(0, 40),
    fonts: Array.from(fonts).slice(0, 10),
    fontSizes: Array.from(fontSizes).sort((a, b) => parseFloat(a) - parseFloat(b)).slice(0, 20),
    fontWeights: Array.from(new Set(Array.from(fontWeights))).sort().slice(0, 10),
    lineHeights: Array.from(lineHeights).sort((a, b) => parseFloat(a) - parseFloat(b)).slice(0, 15),
    letterSpacings: Array.from(letterSpacings).sort((a, b) => parseFloat(a) - parseFloat(b)).slice(0, 10),
    radii: Array.from(allRadii).slice(0, 15),
    radiusByComponent,
    shadows: Array.from(shadows).slice(0, 10),
    spacing: Array.from(spacing).slice(0, 20),
    cssVars
  };

  // Copy to clipboard
  const json = JSON.stringify(result, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    console.log('%c Design tokens extracted and copied to clipboard!', 'color: #635bff; font-weight: bold; font-size: 14px;');
    console.log(`${result.colors.length} colors, ${result.fonts.length} fonts, ${result.fontSizes.length} sizes`);
    console.log(`Radii by component:`);
    for (const [comp, entries] of Object.entries(radiusByComponent)) {
      console.log(`  ${comp}: ${entries.map(e => e.value + ' (x' + e.count + ')').join(', ')}`);
    }
    console.log('Paste into the DESIGN.md generator.');
  }).catch(() => {
    // Fallback: log it
    console.log('%c Could not copy to clipboard. Copy the JSON below:', 'color: #e25950; font-weight: bold;');
    console.log(json);
  });
})();
