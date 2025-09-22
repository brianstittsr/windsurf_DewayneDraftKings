import { NextRequest, NextResponse } from 'next/server';

// GET /api/games - Get all games
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get('seasonId');
    
    // Mock data for now - replace with actual database queries
    const games = [];

    return NextResponse.json({
      success: true,
      games
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ 
      success: false, 
      games: [],
      error: 'Failed to fetch games' 
    }, { status: 500 });
  }
}

// POST /api/games - Create new game
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Mock response - replace with actual database creation
    return NextResponse.json({
      success: true,
      message: 'Game created successfully',
      gameId: 'mock-game-id'
    });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create game' 
    }, { status: 500 });
  }
}
