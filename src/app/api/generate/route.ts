import { NextRequest, NextResponse } from 'next/server';
import * as fal from "@fal-ai/serverless-client";
import CRC32 from 'crc-32';

export const maxDuration = 60; // Set the max duration

// Utility to add metadata as a text chunk in PNG files
function addTextChunk(buffer: Buffer, keyword: string, value: string): Buffer {
  const keywordBuffer = Buffer.from(keyword, 'utf8');
  const valueBuffer = Buffer.from(value, 'utf8');
  const nullSeparator = Buffer.from([0]);
  const chunkData = Buffer.concat([keywordBuffer, nullSeparator, valueBuffer]);

  const length = chunkData.length;
  const type = Buffer.from('tEXt', 'ascii');
  const crc = CRC32.buf(Buffer.concat([type, chunkData])) >>> 0;

  return Buffer.concat([
    buffer.slice(0, 33),
    Buffer.from([
      (length >> 24) & 0xff,
      (length >> 16) & 0xff,
      (length >> 8) & 0xff,
      length & 0xff,
    ]),
    type,
    chunkData,
    Buffer.from([
      (crc >> 24) & 0xff,
      (crc >> 16) & 0xff,
      (crc >> 8) & 0xff,
      crc & 0xff,
    ]),
    buffer.slice(33),
  ]);
}

// Function to create the exact metadata string based on the specified format
function createMetadataString(prompt: string, negativePrompt: string, seed: number, dimensions: { width: number; height: number }): string {
  return `${prompt}\nNegative prompt: \n` +
    `Seed: ${seed}, Size: ${dimensions.width}x${dimensions.height}, Model: fal-ai/flux-general`;
}

export async function POST(request: NextRequest) {
  const { seed, prompt, negativePrompt = '', loras, dimensions, apiKey } = await request.json();

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
        negative_prompt: negativePrompt,
        image_size: dimensions,
        enable_safety_checker: false,
      }
    });

    const castedResult = result as { images: { url: string }[] };
    if (!castedResult.images || castedResult.images.length === 0) {
      throw new Error('No images found in the result');
    }

    const imageUrl = castedResult.images[0].url;
    const fetchResponse = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await fetchResponse.arrayBuffer());

    const metadataString = createMetadataString(prompt, negativePrompt, seed, dimensions);
    const pngBuffer = addTextChunk(imageBuffer, 'parameters', metadataString);

    return new NextResponse(pngBuffer, {
      headers: { 'Content-Type': 'image/png' },
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: 'Failed to generate image', details: err.message }, { status: 500 });
  }
}
