import { DesignExtractor } from "./design-extractor";

export default function Home() {
  return (
    <main>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-[24px] bg-white/80 border-b border-[rgb(237,237,237)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 flex items-center justify-between h-14">
          <span className="text-[14px] font-semibold tracking-tight text-[rgb(20,20,20)]">
            vibe-ship-it
          </span>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-[14px] text-[rgb(112,112,112)] hover:text-[rgb(20,20,20)] transition-colors">How it works</a>
            <a href="#skills" className="text-[14px] text-[rgb(112,112,112)] hover:text-[rgb(20,20,20)] transition-colors">Skills</a>
            <a href="#agents" className="text-[14px] text-[rgb(112,112,112)] hover:text-[rgb(20,20,20)] transition-colors">Agents</a>
            <a href="#demo" className="text-[14px] text-[rgb(112,112,112)] hover:text-[rgb(20,20,20)] transition-colors">Demo</a>
          </div>
          <a
            href="https://github.com/sso-ss/vibe-ship-it"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-5 py-2 rounded-full bg-[rgb(20,20,20)] text-white text-[14px] font-semibold hover:bg-[rgb(50,50,50)] transition-colors"
          >
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <div className="max-w-[720px]">
            <p className="text-[12px] font-medium tracking-[0.06em] text-[rgb(112,112,112)] uppercase mb-4">
              Open-source skill pack
            </p>
            <h1 className="text-[40px] md:text-[56px] lg:text-[80px] font-semibold leading-[1.05] tracking-[-0.02em] text-[rgb(20,20,20)] mb-6">
              AI skills for designers who code
            </h1>
            <p className="text-[16px] md:text-[20px] leading-[1.6] text-[rgb(112,112,112)] mb-10 max-w-[560px]">
              14 skills and 4 agents that help you build real products by talking naturally. Works with VS Code Copilot, Claude Code, and OpenAI Codex.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/sso-ss/vibe-ship-it"
                className="inline-flex items-center px-6 py-3 rounded-full bg-[rgb(20,20,20)] text-white text-[14px] font-semibold hover:bg-[rgb(50,50,50)] transition-colors duration-200"
              >
                Get started
              </a>
              <div className="inline-flex items-center px-5 py-3 rounded-full bg-[rgb(245,245,245)] text-[rgb(20,20,20)] text-[14px] font-mono">
                npx vibe-ship-it init
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-14 border-y border-[rgb(237,237,237)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "14", label: "Skills" },
              { number: "4", label: "Agents" },
              { number: "3", label: "Platforms" },
              { number: "0", label: "Config files needed" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-[48px] md:text-[56px] font-semibold tracking-[-0.02em] text-[rgb(20,20,20)] leading-none">
                  {item.number}
                </div>
                <div className="text-[14px] text-[rgb(112,112,112)] mt-2">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 md:py-24">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <p className="text-[12px] font-medium tracking-[0.06em] text-[rgb(112,112,112)] uppercase mb-3">
            How it works
          </p>
          <h2 className="text-[24px] md:text-[32px] font-semibold tracking-[-0.01em] text-[rgb(20,20,20)] mb-4">
            Talk naturally. Build real things.
          </h2>
          <p className="text-[16px] text-[rgb(112,112,112)] leading-[1.6] mb-12 max-w-[520px]">
            No commands to memorize. Describe what you want and the right skill activates automatically.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
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
              <div
                key={item.say}
                className="rounded-[12px] p-5 shadow-[inset_0_0_0_1px_rgba(64,64,64,0.16)] hover:bg-[rgb(245,245,245)] transition-colors duration-200"
              >
                <p className="text-[14px] font-semibold text-[rgb(20,20,20)] mb-1.5 font-mono">
                  {item.say}
                </p>
                <p className="text-[14px] text-[rgb(112,112,112)] leading-[1.6]">
                  {item.does}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="py-20 md:py-24">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <p className="text-[12px] font-medium tracking-[0.06em] text-[rgb(112,112,112)] uppercase mb-3">
            14 Skills
          </p>
          <h2 className="text-[24px] md:text-[32px] font-semibold tracking-[-0.01em] text-[rgb(20,20,20)] mb-4">
            Everything you need, nothing you don't.
          </h2>
          <p className="text-[16px] text-[rgb(112,112,112)] leading-[1.6] mb-12 max-w-[520px]">
            Each skill handles one job well. They activate from plain English.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div
                key={skill.name}
                className="rounded-[12px] p-5 shadow-[inset_0_0_0_1px_rgba(64,64,64,0.16)] hover:bg-[rgb(245,245,245)] transition-colors duration-200"
              >
                <p className="text-[12px] font-mono font-semibold text-[rgb(20,20,20)] mb-2">
                  {skill.name}
                </p>
                <p className="text-[14px] text-[rgb(112,112,112)] leading-[1.5]">
                  {skill.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="py-20 md:py-24">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <p className="text-[12px] font-medium tracking-[0.06em] text-[rgb(112,112,112)] uppercase mb-3">
            4 Agents
          </p>
          <h2 className="text-[24px] md:text-[32px] font-semibold tracking-[-0.01em] text-[rgb(20,20,20)] mb-4">
            Each agent has a clear role.
          </h2>
          <p className="text-[16px] text-[rgb(112,112,112)] leading-[1.6] mb-12 max-w-[520px]">
            Talk naturally and the right one activates. Or call them by name when you want a specific mode.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                name: "Assistant",
                trigger: "Default -- just talk",
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
              <div
                key={agent.name}
                className="rounded-[12px] p-6 shadow-[inset_0_0_0_1px_rgba(64,64,64,0.16)] hover:bg-[rgb(245,245,245)] transition-colors duration-200"
              >
                <h3 className="text-[20px] font-semibold text-[rgb(20,20,20)] mb-1">
                  {agent.name}
                </h3>
                <p className="text-[12px] font-mono text-[rgb(112,112,112)] mb-3">
                  {agent.trigger}
                </p>
                <p className="text-[14px] text-[rgb(112,112,112)] leading-[1.6]">
                  {agent.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESIGN.md section */}
      <section id="demo" className="py-20 md:py-24">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <p className="text-[12px] font-medium tracking-[0.06em] text-[rgb(112,112,112)] uppercase mb-3">
            Try it now
          </p>
          <h2 className="text-[24px] md:text-[32px] font-semibold tracking-[-0.01em] text-[rgb(20,20,20)] mb-4">
            Extract any website's design tokens.
          </h2>
          <p className="text-[16px] text-[rgb(112,112,112)] leading-[1.6] mb-10 max-w-[520px]">
            Paste a URL below. We launch a headless browser, scan computed styles on every element, and generate a downloadable DESIGN.md.
          </p>

          <DesignExtractor />
        </div>
      </section>

      {/* Platforms */}
      <section className="py-20 md:py-24">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <p className="text-[12px] font-medium tracking-[0.06em] text-[rgb(112,112,112)] uppercase mb-3">
            3 Platforms
          </p>
          <h2 className="text-[24px] md:text-[32px] font-semibold tracking-[-0.01em] text-[rgb(20,20,20)] mb-12">
            Web, mobile, or Figma plugins.
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: "Web",
                stack: "Next.js + Tailwind + Supabase + Vercel",
                desc: "Full-stack web apps with database, auth, and deployment built in.",
              },
              {
                name: "Mobile",
                stack: "React Native + Expo + Supabase",
                desc: "iOS and Android apps from one codebase. Scan a QR to test on your phone.",
              },
              {
                name: "Figma Plugin",
                stack: "TypeScript + Figma API",
                desc: "Extend Figma with custom tools. UI in an iframe, logic on the canvas.",
              },
            ].map((platform) => (
              <div
                key={platform.name}
                className="rounded-[12px] p-6 shadow-[inset_0_0_0_1px_rgba(64,64,64,0.16)] hover:bg-[rgb(245,245,245)] transition-colors duration-200"
              >
                <h3 className="text-[20px] font-semibold text-[rgb(20,20,20)] mb-1">
                  {platform.name}
                </h3>
                <p className="text-[12px] font-mono text-[rgb(173,173,173)] mb-3">
                  {platform.stack}
                </p>
                <p className="text-[14px] text-[rgb(112,112,112)] leading-[1.6]">
                  {platform.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-24">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 text-center">
          <h2 className="text-[24px] md:text-[32px] font-semibold tracking-[-0.01em] text-[rgb(20,20,20)] mb-4">
            Start building in 30 seconds.
          </h2>
          <p className="text-[16px] text-[rgb(112,112,112)] leading-[1.6] mb-10 max-w-[480px] mx-auto">
            One command installs everything. It asks which AI tool you use and sets up only what you need.
          </p>
          <div className="inline-flex items-center px-6 py-3.5 rounded-full bg-[rgb(245,245,245)] text-[16px] font-mono text-[rgb(20,20,20)] mb-6">
            npx vibe-ship-it init
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <a
              href="https://github.com/sso-ss/vibe-ship-it"
              className="inline-flex items-center px-6 py-3 rounded-full bg-[rgb(20,20,20)] text-white text-[14px] font-semibold hover:bg-[rgb(50,50,50)] transition-colors duration-200"
            >
              View on GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/vibe-ship-it"
              className="inline-flex items-center px-6 py-3 rounded-full shadow-[inset_0_0_0_1px_rgba(64,64,64,0.16)] text-[rgb(20,20,20)] text-[14px] font-semibold hover:bg-[rgb(245,245,245)] transition-colors duration-200"
            >
              npm package
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-[rgb(237,237,237)]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[12px] text-[rgb(173,173,173)]">
            MIT License. Built for designers who want to ship.
          </span>
          <div className="flex gap-6">
            <a href="https://github.com/sso-ss/vibe-ship-it" className="text-[12px] text-[rgb(173,173,173)] hover:text-[rgb(20,20,20)] transition-colors">
              GitHub
            </a>
            <a href="https://www.npmjs.com/package/vibe-ship-it" className="text-[12px] text-[rgb(173,173,173)] hover:text-[rgb(20,20,20)] transition-colors">
              npm
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
