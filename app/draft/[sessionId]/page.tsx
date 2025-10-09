import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DraftProvider } from '@/components/draft/DraftProvider';
import MobileDraftInterface from '@/components/draft/MobileDraftInterface';
import '../draft.css';

interface DraftPageProps {
  params: {
    sessionId: string;
  };
}

export async function generateMetadata({ params }: DraftPageProps): Promise<Metadata> {
  return {
    title: 'Fantasy Football Draft - All Pro Sports',
    description: 'Join the live fantasy football draft for All Pro Sports NC',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
    themeColor: '#1a365d',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Draft'
    },
    other: {
      'mobile-web-app-capable': 'yes'
    }
  };
}

export default function DraftPage({ params }: DraftPageProps) {
  const { sessionId } = params;

  // Validate sessionId format (basic validation)
  if (!sessionId || sessionId.length < 10) {
    notFound();
  }

  return (
    <DraftProvider initialSessionId={sessionId}>
      <div className="draft-page">
        <MobileDraftInterface sessionId={sessionId} />
      </div>
    </DraftProvider>
  );
}
