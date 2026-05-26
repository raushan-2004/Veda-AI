import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Veda AI — AI-Powered Assessment Creator',
    template: '%s | Veda AI',
  },
  description:
    'Create intelligent assessments in seconds with AI. Generate questions, auto-grade submissions, and gain insights from Veda AI.',
  keywords: ['AI assessment', 'quiz creator', 'e-learning', 'auto-grading', 'education technology'],
  authors: [{ name: 'Veda AI Team' }],
  creator: 'Veda AI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'Veda AI — AI-Powered Assessment Creator',
    description: 'Create intelligent assessments in seconds with AI.',
    siteName: 'Veda AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veda AI — AI-Powered Assessment Creator',
    description: 'Create intelligent assessments in seconds with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
