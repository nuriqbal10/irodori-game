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
  const clerkPubKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    'pk_test_c3VpdGFibGUtYWtpdGEtMTE1Ni5jbGVyay5hY2NvdW50cy5kZXYk';

  return (
    <html lang="id" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#0f0e13] text-[#f4efe7] font-sans selection:bg-[#8f2222] selection:text-white">
        <ClerkProvider publishableKey={clerkPubKey}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
