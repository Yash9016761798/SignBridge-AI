import type { Metadata, Viewport } from 'next';
import { Manrope, Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | SignBridge AI',
    default: 'SignBridge AI - Breaking Communication Barriers',
  },
  description:
    'Breaking Communication Barriers Through Indian Sign Language. AI-powered ISL learning, translation, and practice platform.',
  keywords: [
    'Indian Sign Language',
    'ISL',
    'accessibility',
    'AI',
    'translation',
    'sign language learning',
    'SignBridge',
  ],
  authors: [{ name: 'SignBridge AI Team' }],
  openGraph: {
    title: 'SignBridge AI',
    description:
      'Breaking Communication Barriers Through Indian Sign Language - AI-powered ISL learning and translation.',
    type: 'website',
    siteName: 'SignBridge AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 1200,
        alt: 'SignBridge AI - Breaking Communication Barriers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SignBridge AI',
    description: 'AI-powered Indian Sign Language learning and translation platform.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    other: [{ rel: 'icon', url: '/favicon.ico' }],
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8F6' },
    { media: '(prefers-color-scheme: dark)', color: '#0D0D0D' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`} suppressHydrationWarning>
      <body
        className={`${manrope.className} bg-surface-50 text-surface-900 antialiased dark:bg-[#0D0D0D] dark:text-surface-100`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-btn focus:bg-gradient-brand focus:px-6 focus:py-3 focus:text-sm focus:font-semibold focus:text-surface-900 focus:shadow-glow"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
