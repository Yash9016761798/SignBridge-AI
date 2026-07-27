import type { Metadata, Viewport } from 'next';
import './globals.css';
import AuthProvider from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

export const metadata: Metadata = {
  title: {
    template: '%s | SignBridge AI',
    default: 'SignBridge AI - Breaking Communication Barriers',
  },
  description:
    'AI-powered Indian Sign Language learning, translation, and practice platform. Break communication barriers with real-time ISL translation and interactive lessons.',
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SignBridge AI',
    description: 'AI-powered Indian Sign Language learning and translation platform.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-surface-50 text-surface-900 antialiased dark:bg-surface-950 dark:text-surface-100">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-xl focus:bg-primary-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
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
