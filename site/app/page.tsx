import { DesignExtractor } from "./design-extractor";

export default function Home() {
  return (
    <main>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-[rgba(10,37,64,0.08)]">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10 flex items-center justify-between h-16">
          <span className="text-[15px] font-bold tracking-tight text-[#0a2540]">
            vibe-ship-it
          </span>
          <div className="hidden md:flex items-center gap-8">
            <a href="#skills" className="text-[15px] font-medium text-[#425466] hover:text-[#635bff] transition-colors">Skills</a>
            <a href="#how" className="text-[15px] font-medium text-[#425466] hover:text-[#635bff] transition-colors">How it works</a>
            <a href="#agents" className="text-[15px] font-medium text-[#425466] hover:text-[#635bff] transition-colors">Agents</a>
          </div>
          <a
            href="https://github.com/sso-ss/vibe-ship-it"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[15px] font-medium text-[#635bff] hover:text-[#7a73ff] transition-colors"
          >
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-28">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <div className="max-w-[720px]">
            <p className="text-[13px] font-medium tracking-[0.02em] text-[#635bff] uppercase mb-4">
              Open-source skill pack
            </p>
            <h1 className="text-[40px] md:text-[54px] lg:text-[72px] font-bold leading-[1.08] tracking-[-0.03em] text-[#0a2540] mb-6">
              AI skills for designers who code
            </h1>
            <p className="text-[19px] md:text-[21px] font-light leading-[1.6] text-[#425466] mb-10 max-w-[560px]">
              14 skills and 4 agents that help you build real products by talking naturally. Works with VS Code Copilot, Claude Code, and OpenAI Codex.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://github.com/sso-ss/vibe-ship-it"
                className="inline-flex items-center px-7 py-3.5 rounded-full bg-gradient-to-r from-[#635bff] to-[#0073e6] text-white text-[15px] font-medium shadow-[0_2px_4px_rgba(99,91,255,0.3)] hover:shadow-[0_4px_12px_rgba(99,91,255,0.4)] hover:-translate-y-0.5 transition-all duration-200"
              >
                Get started
              </a>
              <div className="inline-flex items-center px-6 py-3.5 rounded-full bg-white border border-[rgba(10,37,64,0.1)] text-[#0a2540] text-[15px] font-mono">
                npx vibe-ship-it init
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-16 border-y border-[rgba(10,37,64,0.08)]">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "14", label: "Skills" },
              { number: "4", label: "Agents" },
              { number: "3", label: "Platforms" },
              { number: "0", label: "Config files needed" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-[48px] md:text-[56px] font-bold tracking-[-0.03em] text-[#0a2540] leading-none">
                  {item.number}
                </div>
                <div className="text-[15px] font-medium text-[#6b7c93] mt-2">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 md:py-32">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <p className="text-[13px] font-medium tracking-[0.02em] text-[#635bff] uppercase mb-3">
            How it works
          </p>
          <h2 className="text-[32px] md:text-[40px] font-bold tracking-[-0.02em] text-[#0a2540] mb-4">
            Talk naturally. Build real things.
          </h2>
          <p className="text-[19px] font-light text-[#425466] leading-[1.6] mb-16 max-w-[560px]">
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
              <div
                key={item.say}
                className="rounded-xl border border-[rgba(10,37,64,0.08)] bg-white p-6 shadow-[0_2px_4px_rgba(10,37,64,0.06)] hover:shadow-[0_6px_12px_rgba(10,37,64,0.08)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <p className="text-[17px] font-medium text-[#0a2540] mb-2 font-mono">
                  {item.say}
                </p>
                <p className="text-[15px] font-light text-[#425466] leading-[1.6]">
                  {item.does}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="py-24 md:py-32">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <p className="text-[13px] font-medium tracking-[0.02em] text-[#635bff] uppercase mb-3">
            14 Skills
          </p>
          <h2 className="text-[32px] md:text-[40px] font-bold tracking-[-0.02em] text-[#0a2540] mb-4">
            Everything you need, nothing you don't.
          </h2>
          <p className="text-[19px] font-light text-[#425466] leading-[1.6] mb-16 max-w-[560px]">
            Each skill handles one job well. They activate from plain English -- no skill names to memorize.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                className="rounded-xl border border-[rgba(10,37,64,0.08)] bg-white/80 backdrop-blur-sm p-5 hover:shadow-[0_6px_12px_rgba(10,37,64,0.08)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <p className="text-[13px] font-mono font-medium text-[#635bff] mb-2">
                  {skill.name}
                </p>
                <p className="text-[15px] font-light text-[#425466] leading-[1.5]">
                  {skill.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents */}
      <section id="agents" className="py-24 md:py-32">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <p className="text-[13px] font-medium tracking-[0.02em] text-[#635bff] uppercase mb-3">
            4 Agents
          </p>
          <h2 className="text-[32px] md:text-[40px] font-bold tracking-[-0.02em] text-[#0a2540] mb-4">
            Each agent has a clear role.
          </h2>
          <p className="text-[19px] font-light text-[#425466] leading-[1.6] mb-16 max-w-[560px]">
            Talk naturally and the right one activates. Or call them by name when you want a specific mode.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                name: "Assistant",
                trigger: "Default -- just talk",
                desc: "Builds UI, connects backends, fixes issues. Your primary partner.",
              },
              {
                name: "Checker",
                trigger: '"Check it" / "Is this ready?"',
                desc: "Reviews your work in read-only mode. Can't break anything.",
              },
              {
                name: "Shipper",
                trigger: '"Ship it" / "Put it online"',
                desc: "Runs safety checks, then deploys. Gives you a URL and undo instructions.",
              },
              {
                name: "Investigator",
                trigger: '"Find the bug" / "It was working before"',
                desc: "Deep debugs when quick fixes don't work. Traces root causes like a senior engineer.",
              },
            ].map((agent) => (
              <div
                key={agent.name}
                className="rounded-xl border border-[rgba(10,37,64,0.08)] bg-white p-7 shadow-[0_2px_4px_rgba(10,37,64,0.06)] hover:shadow-[0_6px_12px_rgba(10,37,64,0.08)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <h3 className="text-[20px] font-bold text-[#0a2540] mb-1">
                  {agent.name}
                </h3>
                <p className="text-[13px] font-mono text-[#635bff] mb-3">
                  {agent.trigger}
                </p>
                <p className="text-[15px] font-light text-[#425466] leading-[1.6]">
                  {agent.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESIGN.md section */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <p className="text-[13px] font-medium tracking-[0.02em] text-[#635bff] uppercase mb-3">
            Try it now
          </p>
          <h2 className="text-[32px] md:text-[40px] font-bold tracking-[-0.02em] text-[#0a2540] mb-4">
            Extract any website's design tokens.
          </h2>
          <p className="text-[19px] font-light text-[#425466] leading-[1.6] mb-10 max-w-[560px]">
            Paste a URL below. We will fetch the HTML and CSS, extract colors, fonts, spacing, shadows, and radii, and generate a downloadable DESIGN.md.
          </p>

          <DesignExtractor />
        </div>
      </section>

      {/* Platforms */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <p className="text-[13px] font-medium tracking-[0.02em] text-[#635bff] uppercase mb-3">
            3 Platforms
          </p>
          <h2 className="text-[32px] md:text-[40px] font-bold tracking-[-0.02em] text-[#0a2540] mb-16">
            Web, mobile, or Figma plugins.
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
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
                className="rounded-xl border border-[rgba(10,37,64,0.08)] bg-white p-7 shadow-[0_2px_4px_rgba(10,37,64,0.06)] hover:shadow-[0_6px_12px_rgba(10,37,64,0.08)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <h3 className="text-[20px] font-bold text-[#0a2540] mb-1">
                  {platform.name}
                </h3>
                <p className="text-[13px] font-mono text-[#6b7c93] mb-3">
                  {platform.stack}
                </p>
                <p className="text-[15px] font-light text-[#425466] leading-[1.6]">
                  {platform.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10 text-center">
          <h2 className="text-[32px] md:text-[40px] font-bold tracking-[-0.02em] text-[#0a2540] mb-4">
            Start building in 30 seconds.
          </h2>
          <p className="text-[19px] font-light text-[#425466] leading-[1.6] mb-10 max-w-[480px] mx-auto">
            One command installs everything. It asks which AI tool you use and sets up only what you need.
          </p>
          <div className="inline-flex items-center px-8 py-4 rounded-full bg-white border border-[rgba(10,37,64,0.1)] text-[17px] font-mono text-[#0a2540] shadow-[0_2px_4px_rgba(10,37,64,0.06)] mb-6">
            npx vibe-ship-it init
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <a
              href="https://github.com/sso-ss/vibe-ship-it"
              className="inline-flex items-center px-7 py-3.5 rounded-full bg-gradient-to-r from-[#635bff] to-[#0073e6] text-white text-[15px] font-medium shadow-[0_2px_4px_rgba(99,91,255,0.3)] hover:shadow-[0_4px_12px_rgba(99,91,255,0.4)] hover:-translate-y-0.5 transition-all duration-200"
            >
              View on GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/vibe-ship-it"
              className="inline-flex items-center px-7 py-3.5 rounded-full bg-white border border-[rgba(10,37,64,0.1)] text-[#0a2540] text-[15px] font-medium hover:border-[rgba(10,37,64,0.2)] hover:shadow-[0_2px_4px_rgba(10,37,64,0.06)] transition-all duration-200"
            >
              npm package
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[rgba(10,37,64,0.08)]">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[13px] text-[#6b7c93]">
            MIT License. Built for designers who want to ship.
          </span>
          <div className="flex gap-6">
            <a href="https://github.com/sso-ss/vibe-ship-it" className="text-[13px] text-[#6b7c93] hover:text-[#635bff] transition-colors">
              GitHub
            </a>
            <a href="https://www.npmjs.com/package/vibe-ship-it" className="text-[13px] text-[#6b7c93] hover:text-[#635bff] transition-colors">
              npm
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
