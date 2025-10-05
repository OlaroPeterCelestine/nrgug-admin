import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { ActivityTracker } from '@/components/activity-tracker';
import { SessionWarning } from '@/components/session-warning';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NRGUG Admin Dashboard',
  description: 'NRGUG Broadcasting Services Admin Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
          <ActivityTracker />
          <SessionWarning />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}