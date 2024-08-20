import { NextRequest, NextResponse } from 'next/server';
import * as fal from "@fal-ai/serverless-client";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { seed, loras, prompt, dimensions, apiKey } = await request.json();

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required' }, { status: 400 });
  }

  try {
    fal.config({ credentials: apiKey });

    const result = await fal.subscribe("fal-ai/flux-general", {
      input: {
        seed,
        loras,
        prompt,
        image_size: dimensions,
        enable_safety_checker: false,
      },
    });

    // Ensure the result is properly formatted JSON
    const formattedResult = JSON.parse(JSON.stringify(result, null, 2));

    return NextResponse.json(formattedResult);
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}