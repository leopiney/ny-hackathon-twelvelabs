import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json();

    // Call FastAPI backend to get presigned upload URL
    const response = await fetch(`${BACKEND_URL}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Upload URL generation failed:', error);
    return NextResponse.json(
      { detail: 'Failed to generate upload URL', error_code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
