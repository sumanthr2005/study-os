import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { Shell } from '@/components/layout/Shell';

export const metadata: Metadata = {
  title: 'STUDY OS — Personal Learning & Productivity Platform',
  description:
    'Modern personal Learning Operating System combining Live YouTube Playlist Roadmaps, Study Timer, LeetCode Progress, DSA Topic Mastery, Habits, Tasks, Water, and Spaced Repetition.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
