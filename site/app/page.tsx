import { DesignExtractor } from "./design-extractor";

export default function Home() {
  return (
    <main>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-[24px] bg-[var(--header-bg)]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex items-center justify-between h-[60px]">
          <span className="text-[14px] font-semibold tracking-[-0.4px] text-[rgb(20,20,20)]">
            vibe-ship-it
          </span>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-[14px] text-[rgb(112,112,112)] hover:text-[rgb(20,20,20)] transition-colors duration-200">How it works</a>
            <a href="#skills" className="text-[14px] text-[rgb(112,112,112)] hover:text-[rgb(20,20,20)] transition-colors duration-200">Skills</a>
            <a href="#agents" className="text-[14px] text-[rgb(112,112,112)] hover:text-[rgb(20,20,20)] transition-colors duration-200">Agents</a>
            <a href="#demo" className="text-[14px] text-[rgb(112,112,112)] hover:text-[rgb(20,20,20)] transition-colors duration-200">Demo</a>
          </div>
          <a
            href="https://github.com/sso-ss/vibe-ship-it"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-5 py-2 rounded-full bg-[rgb(20,20,20)] text-white text-[14px] font-semibold hover:bg-[rgb(50,50,50)] transition-colors duration-200"
          >
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-[180px] pb-[96px]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 text-center">
          <p className="text-[12px] font-medium tracking-[0.2px] text-[rgb(112,112,112)] uppercase mb-6">
            Open-source skill pack
          </p>
          <h1 className="text-[40px] md:text-[56px] lg:text-[80px] font-semibold leading-[1] tracking-[-3px] lg:tracking-[-5px] text-[rgb(20,20,20)] mb-8 max-w-[900px] mx-auto">
            AI skills for designers who code
          </h1>
          <p className="text-[16px] md:text-[20px] leading-[1.6] text-[rgb(112,112,112)] mb-10 max-w-[560px] mx-auto">
            14 skills and 4 agents that help you build real products by talking naturally. Works with VS Code Copilot, Claude Code, and OpenAI Codex.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="https://github.com/sso-ss/vibe-ship-it"
              className="inline-flex items-center px-6 py-3 rounded-full bg-[rgb(20,20,20)] text-white text-[14px] font-semibold hover:bg-[rgb(50,50,50)] transition-colors duration-200"
            >
              Get started
            </a>
            <div className="inline-flex items-center px-5 py-3 rounded-full bg-[var(--card-bg)] text-[rgb(20,20,20)] text-[14px] font-mono">
              npx vibe-ship-it init
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-14 border-y border-[hsl(var(--border-divider))]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "14", label: "Skills" },
              { number: "4", label: "Agents" },
              { number: "3", label: "Platforms" },
              { number: "0", label: "Config files needed" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-[48px] md:text-[56px] font-semibold tracking-[-3px] text-[hsl(var(--text-primary))] leading-none">
                  {item.number}
                </div>
                <div className="text-[14px] text-[hsl(var(--text-secondary))] mt-2">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-[120px]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 text-center">
          <h2 className="text-[32px] md:text-[56px] font-semibold tracking-[-1px] md:tracking-[-3px] text-[rgb(20,20,20)] mb-6">
            Talk naturally. Build real things.
          </h2>
          <p className="text-[16px] text-[rgb(112,112,112)] leading-[1.6] mb-16 max-w-[520px] mx-auto">
            No commands to memorize. Describe what you want and the right skill activates automatically.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { say: '"I want to build a portfolio site"', does: "Sets up the project with the right stack" },
              { say: '"Make a contact page with a form"', does: "Builds the full page with realistic content" },
              { say: '"Save what people submit"', does: "Creates the database table and connects the form" },
              { say: '"Make it look like stripe.com"', does: "Generates a DESIGN.md and applies the visual style" },
              { say: '"Make it look more premium"', does: "Adds animations, better typography, hover effects" },
              { say: '"Only I should see the submissions"', does: "Adds authentication and protects the page" },
              { say: '"Check it"', does: "Runs quality check: loads? works? mobile? accessible?" },
              { say: '"Ship it"', does: "Runs safety check, then deploys to the web" },
            ].map((item) => (
              <div key={item.say}>
                <div className="rounded-[24px] bg-[var(--card-bg)] p-8 h-[120px] flex items-center justify-center mb-4 hover:bg-[rgba(64,64,64,0.1)] transition-colors duration-200">
                  <p className="text-[16px] font-mono font-medium text-[rgb(20,20,20)]">
                    {item.say}
                  </p>
                </div>
                <p className="text-[14px] text-[rgb(112,112,112)] leading-[1.6] text-left px-1">
                  {item.does}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="py-[120px]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 text-center">
          <h2 className="text-[32px] md:text-[56px] font-semibold tracking-[-1px] md:tracking-[-3px] text-[rgb(20,20,20)] mb-6">
            Everything you need, nothing you don't.
          </h2>
          <p className="text-[16px] text-[rgb(112,112,112)] leading-[1.6] mb-16 max-w-[520px] mx-auto">
            Each skill handles one job well. They activate from plain English.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[
              { name: "what-am-i-building", desc: "Figures out your project, picks the right stack, sets everything up" },
              { name: "build-page", desc: "Turns descriptions or screenshots into working UI" },
              { name: "make-it-wow", desc: "Instant visual polish with animations, typography, hover effects" },
              { name: "design-system", desc: "Extracts tokens and builds reusable components from your existing UI" },
              { name: "generate-design-md", desc: "Captures any website's visual style into a DESIGN.md reference" },
              { name: "save-data", desc: "Makes forms actually save. Creates the database and connects it" },
              { name: "add-login", desc: "Adds authentication so only the right people see the right pages" },
              { name: "show-data", desc: "Displays saved data as cards, tables, or dashboards" },
              { name: "send-email", desc: "Sends confirmation or notification emails when things happen" },
              { name: "upload-file", desc: "Handles image and file uploads with storage" },
              { name: "quick-check", desc: "4-item quality check: loads? works? mobile? accessible?" },
              { name: "before-you-ship", desc: "Full 9-item pre-deploy checklist" },
              { name: "unstuck", desc: "Fixes problems fast when you're frustrated" },
              { name: "noob-mode", desc: "Translates tech jargon to plain English" },
            ].map((skill) => (
              <div key={skill.name}>
                <div className="rounded-[24px] bg-[var(--card-bg)] p-8 h-[120px] flex items-center justify-center mb-4 hover:bg-[rgba(64,64,64,0.1)] transition-colors duration-200">
                  <p className="text-[16px] font-mono font-medium text-[rgb(20,20,20)]">
                    {skill.name}
                  </p>
                </div>
                <p className="text-[14px] text-[rgb(112,112,112)] leading-[1.5] text-left px-1">
                  {skill.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="py-[120px]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 text-center">
          <h2 className="text-[32px] md:text-[56px] font-semibold tracking-[-1px] md:tracking-[-3px] text-[rgb(20,20,20)] mb-6">
            Each agent has a clear role.
          </h2>
          <p className="text-[16px] text-[rgb(112,112,112)] leading-[1.6] mb-16 max-w-[520px] mx-auto">
            Talk naturally and the right one activates. Or call them by name when you want a specific mode.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 text-left">
            {[
              {
                name: "Assistant",
                trigger: "Default (just talk)",
                desc: "Builds UI, connects backends, fixes issues. Your primary partner.",
              },
              {
                name: "Checker",
                trigger: '"Check it" / "Is this ready?"',
                desc: "Reviews your work in read-only mode. Can\'t break anything.",
              },
              {
                name: "Shipper",
                trigger: '"Ship it" / "Put it online"',
                desc: "Runs safety checks, then deploys. Gives you a URL and undo instructions.",
              },
              {
                name: "Investigator",
                trigger: '"Find the bug" / "It was working before"',
                desc: "Deep debugs when quick fixes don\'t work. Traces root causes like a senior engineer.",
              },
            ].map((agent) => (
              <div key={agent.name}>
                <div className="rounded-[24px] bg-[var(--card-bg)] p-8 h-[120px] flex items-center justify-center mb-4 hover:bg-[rgba(64,64,64,0.1)] transition-colors duration-200">
                  <p className="text-[16px] font-mono font-medium text-[rgb(20,20,20)]">
                    {agent.trigger}
                  </p>
                </div>
                <h3 className="text-[16px] font-semibold text-[rgb(20,20,20)] mb-1 text-left px-1">
                  {agent.name}
                </h3>
                <p className="text-[14px] text-[rgb(112,112,112)] leading-[1.6] text-left px-1">
                  {agent.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Component Preview */}
      <section className="py-[120px]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 text-center">
          <h2 className="text-[32px] md:text-[56px] font-semibold tracking-[-1px] md:tracking-[-3px] text-[rgb(20,20,20)] mb-16">
            Built from your DESIGN.md tokens.
          </h2>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            {/* Buttons */}
            <div>
              <p className="text-[12px] font-medium tracking-[0.2px] text-[rgb(173,173,173)] uppercase mb-4">Buttons</p>
              <div className="flex flex-col gap-3">
                <button className="px-6 py-3 rounded-full bg-[rgb(20,20,20)] text-white text-[14px] font-semibold hover:bg-[rgb(50,50,50)] transition-colors duration-200">
                  Primary
                </button>
                <button className="px-6 py-3 rounded-full bg-[var(--card-bg)] text-[rgb(20,20,20)] text-[14px] font-normal hover:bg-[rgba(64,64,64,0.1)] transition-colors duration-200">
                  Secondary
                </button>
                <button className="px-6 py-3 rounded-full text-[rgb(20,20,20)] text-[14px] font-normal hover:bg-[var(--card-bg)] transition-colors duration-200">
                  Ghost
                </button>
                <button className="px-6 py-3 rounded-full bg-[rgba(20,20,20,0.5)] text-[rgb(173,173,173)] text-[14px] font-normal cursor-not-allowed">
                  Disabled
                </button>
              </div>
            </div>

            {/* Dropdown */}
            <div>
              <p className="text-[12px] font-medium tracking-[0.2px] text-[rgb(173,173,173)] uppercase mb-4">Dropdown</p>
              <div className="rounded-[12px] bg-white shadow-[var(--shadow-dropdown)] border border-[rgb(237,237,237)] p-1">
                <div className="px-3 py-2 text-[14px] text-[rgb(20,20,20)] bg-[var(--card-bg)] rounded-[6px]">
                  Edit
                </div>
                <div className="px-3 py-2 text-[14px] text-[rgb(20,20,20)] rounded-[6px]">
                  Duplicate
                </div>
                <div className="px-3 py-2 text-[14px] text-[rgb(20,20,20)] rounded-[6px]">
                  Share
                </div>
                <div className="mx-3 my-1 border-t border-[rgb(237,237,237)]"></div>
                <div className="px-3 py-2 text-[14px] text-[hsl(var(--red-60))] rounded-[6px]">
                  Delete
                </div>
              </div>
            </div>

            {/* Card */}
            <div>
              <p className="text-[12px] font-medium tracking-[0.2px] text-[rgb(173,173,173)] uppercase mb-4">Card</p>
              <div className="rounded-[24px] bg-[var(--card-bg)] h-[200px] mb-4 hover:bg-[rgba(64,64,64,0.1)] transition-colors duration-200"></div>
              <h4 className="text-[16px] font-semibold text-[rgb(20,20,20)] mb-1 px-1">Card title</h4>
              <p className="text-[14px] text-[rgb(112,112,112)] leading-[1.5] px-1">
                Text content sits below the card container, not inside it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DESIGN.md section */}
      <section id="demo" className="py-[120px]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 text-center">
          <h2 className="text-[32px] md:text-[56px] font-semibold tracking-[-1px] md:tracking-[-3px] text-[rgb(20,20,20)] mb-6">
            Extract any website's design tokens.
          </h2>
          <p className="text-[16px] text-[rgb(112,112,112)] leading-[1.6] mb-12 max-w-[520px] mx-auto">
            Paste a URL below. We launch a headless browser, scan computed styles on every element, and generate a downloadable DESIGN.md.
          </p>

          <div className="text-left">
            <DesignExtractor />
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-[120px]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 text-center">
          <h2 className="text-[32px] md:text-[56px] font-semibold tracking-[-1px] md:tracking-[-3px] text-[rgb(20,20,20)] mb-16">
            Web, mobile, or Figma plugins.
          </h2>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              {
                name: "Web",
                stack: "Next.js + Tailwind + Supabase + Vercel",
                desc: "Full-stack web apps with database, auth, and deployment built in.",
                icon: (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgb(20,20,20)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                ),
              },
              {
                name: "Mobile",
                stack: "React Native + Expo + Supabase",
                desc: "iOS and Android apps from one codebase. Scan a QR to test on your phone.",
                icon: (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgb(20,20,20)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><path d="M12 18h.01"/>
                  </svg>
                ),
              },
              {
                name: "Figma Plugin",
                stack: "TypeScript + Figma API",
                desc: "Extend Figma with custom tools. UI in an iframe, logic on the canvas.",
                icon: (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgb(20,20,20)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"/><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"/><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"/><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"/><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"/>
                  </svg>
                ),
              },
            ].map((platform) => (
              <div key={platform.name}>
                <div className="rounded-[24px] bg-[var(--card-bg)] p-8 h-[200px] flex items-center justify-center mb-4 hover:bg-[rgba(64,64,64,0.1)] transition-colors duration-200">
                  {platform.icon}
                </div>
                <h3 className="text-[20px] font-semibold text-[rgb(20,20,20)] mb-1 px-1">
                  {platform.name}
                </h3>
                <p className="text-[13px] font-mono text-[rgb(173,173,173)] mb-2 px-1">
                  {platform.stack}
                </p>
                <p className="text-[14px] text-[rgb(112,112,112)] leading-[1.6] px-1">
                  {platform.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[120px]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 text-center">
          <h2 className="text-[32px] md:text-[56px] font-semibold tracking-[-1px] md:tracking-[-3px] text-[rgb(20,20,20)] mb-6">
            Start building in 30 seconds.
          </h2>
          <p className="text-[16px] text-[rgb(112,112,112)] leading-[1.6] mb-10 max-w-[480px] mx-auto">
            One command installs everything. It asks which AI tool you use and sets up only what you need.
          </p>
          <div className="inline-flex items-center px-6 py-3.5 rounded-full bg-[var(--card-bg)] text-[16px] font-mono text-[rgb(20,20,20)] mb-8">
            npx vibe-ship-it init
          </div>
          <div className="flex justify-center gap-3">
            <a
              href="https://github.com/sso-ss/vibe-ship-it"
              className="inline-flex items-center px-6 py-3 rounded-full bg-[rgb(20,20,20)] text-white text-[14px] font-semibold hover:bg-[rgb(50,50,50)] transition-colors duration-200"
            >
              View on GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/vibe-ship-it"
              className="inline-flex items-center px-6 py-3 rounded-full bg-[var(--card-bg)] text-[rgb(20,20,20)] text-[14px] font-semibold hover:bg-[rgba(64,64,64,0.1)] transition-colors duration-200"
            >
              npm package
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-[rgb(20,20,20)]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[14px] font-semibold text-white">
            vibe-ship-it
          </span>
          <span className="text-[12px] text-[rgb(112,112,112)]">
            MIT License. Built for designers who want to ship.
          </span>
          <div className="flex gap-6">
            <a href="https://github.com/sso-ss/vibe-ship-it" className="text-[12px] text-[rgb(112,112,112)] hover:text-white transition-colors duration-200">
              GitHub
            </a>
            <a href="https://www.npmjs.com/package/vibe-ship-it" className="text-[12px] text-[rgb(112,112,112)] hover:text-white transition-colors duration-200">
              npm
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
