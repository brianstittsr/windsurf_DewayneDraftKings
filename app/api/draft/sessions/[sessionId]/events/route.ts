import { NextRequest } from 'next/server';
import { db } from '../../../../../../lib/firebase';
import { doc, getDoc, onSnapshot, collection } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

// GET /api/draft/sessions/[sessionId]/events - Server-Sent Events for real-time updates
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;

  // Verify session exists
  if (!db) {
    return new Response('Database not available', { status: 503 });
  }

  const sessionRef = doc(db, 'draft_sessions', sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) {
    return new Response('Draft session not found', { status: 404 });
  }

  // Create Server-Sent Events response
  const responseStream = new ReadableStream({
    start(controller) {
      // Send initial connection confirmation
      const initialData = `data: ${JSON.stringify({
        type: 'connected',
        sessionId,
        timestamp: new Date().toISOString()
      })}\n\n`;

      controller.enqueue(new TextEncoder().encode(initialData));

      // Set up real-time listener for session changes
      const unsubscribeSession = onSnapshot(sessionRef, (doc) => {
        if (doc.exists()) {
          const sessionData = doc.data();
          const eventData = `data: ${JSON.stringify({
            type: 'session-update',
            sessionId,
            data: {
              status: sessionData.status,
              currentRound: sessionData.currentRound,
              currentPick: sessionData.currentPick,
              currentTeamId: sessionData.currentTeamId,
              timerExpiresAt: sessionData.timerExpiresAt?.toDate?.() || sessionData.timerExpiresAt
            },
            timestamp: new Date().toISOString()
          })}\n\n`;

          controller.enqueue(new TextEncoder().encode(eventData));
        }
      });

      // Set up listener for new picks in this session
      const picksQuery = collection(db, 'draft_picks');
      const unsubscribePicks = onSnapshot(picksQuery, (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && change.doc.data().sessionId === sessionId) {
            const pickData = change.doc.data();
            const eventData = `data: ${JSON.stringify({
              type: 'pick-made',
              sessionId,
              data: {
                pickId: change.doc.id,
                ...pickData
              },
              timestamp: new Date().toISOString()
            })}\n\n`;

            controller.enqueue(new TextEncoder().encode(eventData));
          }
        });
      });

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        unsubscribeSession();
        unsubscribePicks();
        controller.close();
      });

      // Send periodic heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        const heartbeatData = `data: ${JSON.stringify({
          type: 'heartbeat',
          sessionId,
          timestamp: new Date().toISOString()
        })}\n\n`;

        try {
          controller.enqueue(new TextEncoder().encode(heartbeatData));
        } catch (error) {
          // Connection might be closed
          clearInterval(heartbeatInterval);
          unsubscribeSession();
          unsubscribePicks();
          controller.close();
        }
      }, 30000); // 30 second heartbeat
    }
  });

  return new Response(responseStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
