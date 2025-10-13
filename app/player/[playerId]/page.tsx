import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PublicPlayerProfile from '@/components/PublicPlayerProfile';

interface PlayerProfilePageProps {
  params: {
    playerId: string;
  };
}

export async function generateMetadata({ params }: PlayerProfilePageProps): Promise<Metadata> {
  // In a real implementation, you'd fetch the player data here
  // For now, we'll use placeholder metadata
  return {
    title: `Player Profile - All Pro Sports`,
    description: 'View detailed player information, statistics, and achievements',
    openGraph: {
      title: `Player Profile - All Pro Sports`,
      description: 'View detailed player information, statistics, and achievements',
      type: 'profile',
    },
  };
}

export default function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { playerId } = params;

  // Basic validation
  if (!playerId) {
    notFound();
  }

  return <PublicPlayerProfile playerId={playerId} />;
}
