import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const { video_id } = await request.json();

    // Call FastAPI backend to get ad suggestions
    const response = await fetch(`${BACKEND_URL}/suggest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ video_id }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Ad suggestion failed:', error);
    return NextResponse.json(
      { detail: 'Failed to get ad suggestions', error_code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
