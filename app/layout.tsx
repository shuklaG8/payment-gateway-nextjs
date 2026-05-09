// app/providers.tsx  ← Client component to wrap Redux
'use client';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ReactNode } from 'react';

export function StoreProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}


// ─────────────────────────────────────────────
// app/layout.tsx
// ─────────────────────────────────────────────
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StoreProvider } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Payment Gateway',
  description: 'Secure simulated payment flow built with Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}