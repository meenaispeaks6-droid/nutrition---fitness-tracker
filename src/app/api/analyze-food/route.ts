import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { image, text } = await req.json();

    if (!image && !text) {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    let prompt = "";
    let content: any[] = [];

    if (image) {
      const response = await fetch(image);
      const arrayBuffer = await response.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = response.headers.get('content-type') || 'image/jpeg';

      prompt = `Analyze this image carefully.

FIRST: Determine if this image contains food or a meal. 
- If the image does NOT contain any recognizable food items (e.g., it shows objects, people without food, landscapes, animals, text, screens, or anything that is clearly not meant to be eaten), you MUST return EXACTLY:
{"is_food": false, "error": "No food detected in image"}

- If the image DOES contain food, analyze it and return:
{
  "is_food": true,
  "food_items": [
    { "name": "string", "calories": number, "protein": number, "fat": number, "carbs": number, "fiber": number, "portion_size": "string" }
  ],
  "total_calories": number,
  "total_protein": number,
  "total_fat": number,
  "total_carbs": number,
  "total_fiber": number
}

CRITICAL: Be extremely strict about food detection.`;
      
      content = [prompt, { inlineData: { data: base64Image, mimeType } }];
    } else {
      prompt = `Analyze this text description of a meal: "${text}"

Based on the description, estimate the nutritional values. Return:
{
  "is_food": true,
  "food_items": [
    { "name": "string", "calories": number, "protein": number, "fat": number, "carbs": number, "fiber": number, "portion_size": "string" }
  ],
  "total_calories": number,
  "total_protein": number,
  "total_fat": number,
  "total_carbs": number,
  "total_fiber": number
}

If the text does NOT describe food, return:
{"is_food": false, "error": "No food described"}`;
      
      content = [prompt];
    }

    const result = await model.generateContent(content);


    const resultText = result.response.text();
    console.log('Gemini raw response:', resultText);
    let analysis;
    try {
      analysis = JSON.parse(resultText);
    } catch (e) {
      // Sometimes Gemini might wrap the JSON in markdown code blocks
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from Gemini');
      }
    }

    if (analysis.is_food === false || analysis.is_food === "false") {
      return NextResponse.json({ 
        error: 'No food detected', 
        message: 'Please upload an image containing food items.' 
      }, { status: 400 });
    }

    if (!analysis.food_items || !Array.isArray(analysis.food_items) || analysis.food_items.length === 0) {
      return NextResponse.json({ 
        error: 'No food items identified', 
        message: 'Could not identify any food items in the image.' 
      }, { status: 400 });
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Food analysis error:', error);
    
    if (error?.status === 429) {
      return NextResponse.json({ 
        error: 'API quota exceeded', 
        message: 'The AI service is temporarily unavailable. Please try again later.' 
      }, { status: 429 });
    }
    
    if (error?.status === 404) {
      return NextResponse.json({ 
        error: 'Model not available', 
        message: 'The AI model is temporarily unavailable. Please try again later.' 
      }, { status: 503 });
    }
    
    return NextResponse.json({ error: 'Failed to analyze food' }, { status: 500 });
  }
}
