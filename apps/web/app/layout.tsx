import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'SignBridge AI - Breaking Communication Barriers',
  description: 'AI-powered Indian Sign Language learning and translation platform',
  keywords: ['Indian Sign Language', 'ISL', 'accessibility', 'AI', 'translation'],
  authors: [{ name: 'SignBridge AI Team' }],
  openGraph: {
    title: 'SignBridge AI',
    description: 'Breaking Communication Barriers Through Indian Sign Language',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
