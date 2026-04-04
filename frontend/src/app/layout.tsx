import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// ── Viewport (must be separate from metadata in Next 13+) ──────────────────
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,       // prevent auto-zoom on input focus (mobile)
  userScalable: false,
  interactiveWidget: 'resizes-content', // prevent layout shift from soft keyboard
  themeColor: '#16a34a',
};

export const metadata: Metadata = {
  title: 'StudyLocal - Find Neighbourhood Tutors',
  description: 'Connect with verified tutors in your local area. No commission, COD only.',
  verification: {
    google: 'TYc7oU50kCRvacQe4ygPnBN_v_-VT4Usuvd9xzw11VM',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StudyLocal',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-[100dvh]`}>
        <Providers>
          <div className="flex min-h-[100dvh] flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
