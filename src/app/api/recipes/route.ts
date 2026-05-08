import { NextRequest, NextResponse } from 'next/server';

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const diet = searchParams.get('diet') || '';
  const intolerances = searchParams.get('intolerances') || '';
  const maxCalories = searchParams.get('maxCalories') || '';
  const minProtein = searchParams.get('minProtein') || '';
  const number = searchParams.get('number') || '10';

  if (!SPOONACULAR_API_KEY) {
    return NextResponse.json({ error: 'Spoonacular API key not configured' }, { status: 500 });
  }

  try {
    const params = new URLSearchParams({
      apiKey: SPOONACULAR_API_KEY,
      number,
      addRecipeNutrition: 'true',
      addRecipeInformation: 'true',
    });

    if (query) params.append('query', query);
    if (diet) params.append('diet', diet);
    if (intolerances) params.append('intolerances', intolerances);
    if (maxCalories) params.append('maxCalories', maxCalories);
    if (minProtein) params.append('minProtein', minProtein);

    const spoonacularUrl = `${BASE_URL}/recipes/complexSearch?${params.toString()}`;
    
    try {
      const response = await fetch(spoonacularUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Spoonacular API error (${response.status}):`, errorText);
        return NextResponse.json({ 
          error: 'Spoonacular API error', 
          status: response.status,
          message: response.status === 402 ? 'API quota exceeded' : 'External API error'
        }, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error('Fetch error hitting Spoonacular:', fetchError);
      return NextResponse.json({ error: 'Failed to connect to recipe service' }, { status: 503 });
    }
  } catch (error) {
    console.error('Internal server error in recipes route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
