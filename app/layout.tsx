import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import FloatingMentor from '@/components/FloatingMentor';

export const metadata: Metadata = {
  title: 'CareerX — AI-Powered Student Career Intelligence Platform',
  description:
    'Discover your potential, identify skill gaps, and navigate a personalized roadmap toward high-impact engineering careers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#070b14] text-[#f8fafc] font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar />
        <main className="pt-20 min-h-[calc(100vh-80px)]">{children}</main>
        <FloatingMentor />
        <div id="toast-root" className="fixed top-24 right-6 z-50 flex flex-col gap-2 pointer-events-none" />
      </body>
    </html>
  );
}
