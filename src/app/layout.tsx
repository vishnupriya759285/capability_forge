import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Capability Forge | Compile APIs into reliable capabilities for AI agents',
  description: 'Analyze OpenAPI specifications, compose low-level endpoints into high-level capabilities, expose through MCP, run automated evaluations, break under chaos, and repair with Codex.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F7F8F5] text-[#172018] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
