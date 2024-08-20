import { NextRequest, NextResponse } from 'next/server';
import * as fal from "@fal-ai/serverless-client";
import CRC32 from 'crc-32'; // Correct import for CRC32

// Utility to add metadata as a text chunk in PNG files
function addTextChunk(buffer: Buffer, keyword: string, value: string): Buffer {
  const keywordBuffer = Buffer.from(keyword, 'utf8');
  const valueBuffer = Buffer.from(value, 'utf8');
  const nullSeparator = Buffer.from([0]);
  const chunkData = Buffer.concat([keywordBuffer, nullSeparator, valueBuffer]);

  const length = chunkData.length;
  const type = Buffer.from('tEXt', 'ascii');
  const crc = CRC32.buf(Buffer.concat([type, chunkData])) >>> 0; // Ensure unsigned integer

  return Buffer.concat([
    buffer.slice(0, 33), // PNG signature + IHDR + rest of the header
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

// Define the expected shape of the result
interface FalResult {
  images: { url: string }[];
}

export async function POST(request: NextRequest) {
  const { seed, loras, prompt, dimensions, apiKey } = await request.json();

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required' }, { status: 400 });
  }

  try {
    console.time('API Request');
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
    console.timeEnd('API Request');

    console.time('Fetch Image');
    const castedResult = result as FalResult;

    if (!castedResult.images || castedResult.images.length === 0) {
      throw new Error('No images found in the result');
    }

    const imageUrl = castedResult.images[0].url;
    const fetchResponse = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await fetchResponse.arrayBuffer());
    console.timeEnd('Fetch Image');

    console.time('Add Metadata');
    let pngBuffer = addTextChunk(imageBuffer, 'parameters', createMetadataString(seed, loras, prompt, dimensions));
    console.timeEnd('Add Metadata');

    console.time('Response Sending');
    const finalResponse = new NextResponse(pngBuffer, {
      headers: { 'Content-Type': 'image/png' },
    });
    console.timeEnd('Response Sending');

    return finalResponse;
  } catch (error) {
    // Safely cast error to Error type
    const err = error as Error;
    console.error('Error generating image:', err.message);
    return NextResponse.json({ error: 'Failed to generate image', details: err.message }, { status: 500 });
  }
}

// Function to create the exact metadata string based on your specified format
function createMetadataString(seed: number, loras: any[], prompt: string, dimensions: { width: number; height: number }): string {
  return `${prompt}\nLoRAs: ${JSON.stringify(loras)}\nSeed: ${seed}\nDimensions: ${dimensions.width}x${dimensions.height}`;
}
