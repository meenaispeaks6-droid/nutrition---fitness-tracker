import { NextRequest, NextResponse } from 'next/server';

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tags = searchParams.get('tags') || '';
  const number = searchParams.get('number') || '4';

  if (!SPOONACULAR_API_KEY) {
    return NextResponse.json({ error: 'Spoonacular API key not configured' }, { status: 500 });
  }

  try {
    const params = new URLSearchParams({
      apiKey: SPOONACULAR_API_KEY,
      number,
    });

    if (tags) params.append('tags', tags);

    const response = await fetch(`${BASE_URL}/recipes/random?${params.toString()}`);
    
    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: 'Failed to fetch random recipes', details: error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Spoonacular API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
