import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'IRODORI GAME ARENA — Game Edukasi Bahasa Jepang',
  description: 'Battle Arena PvP, RPG Can-Do Adventure, Co-op Survival, dan 360° Voxel Explorer berbasis kurikulum Irodori The Japan Foundation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#0f0e13] text-[#f4efe7] font-sans selection:bg-[#8f2222] selection:text-white">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
