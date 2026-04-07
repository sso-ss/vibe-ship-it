import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "vibe-ship-it -- AI skills for designers who code",
  description:
    "14 skills + 4 agents that help designers vibe-code their ideas to life. Works with VS Code Copilot, Claude Code, and OpenAI Codex.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
