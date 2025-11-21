import { randomUUID } from 'crypto';
import { type NextRequest } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { parseAspectRatio } from '../../../lib/aspect';

const requestSchema = z.object({
  prompt: z.string().min(5, 'Prompt needs a bit more detail to guide the model.'),
  negativePrompt: z.string().optional(),
  aspectRatio: z.string().optional(),
  guidanceScale: z.number().min(1).max(20).default(7),
  steps: z.number().min(20).max(80).default(40),
  styleStrength: z.number().min(0).max(1).default(0.3)
});

const FAL_ENDPOINT = 'https://fal.run/fal-ai/flux-pro-1.1';

function extractImageUrl(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const candidate = payload as Record<string, any>;
  const directFields = ['image_url', 'imageUrl', 'url'];

  for (const field of directFields) {
    if (typeof candidate[field] === 'string') {
      return candidate[field];
    }
  }

  const potentialCollections = ['images', 'output', 'data', 'results', 'assets'];
  for (const key of potentialCollections) {
    const value = candidate[key];
    if (Array.isArray(value)) {
      for (const entry of value) {
        if (typeof entry === 'string') {
          return entry;
        }
        if (entry && typeof entry === 'object') {
          const nested = extractImageUrl(entry);
          if (nested) {
            return nested;
          }
        }
      }
    } else if (value && typeof value === 'object') {
      const nested = extractImageUrl(value);
      if (nested) {
        return nested;
      }
    }
  }

  if (candidate.image && typeof candidate.image === 'object') {
    return extractImageUrl(candidate.image);
  }

  return undefined;
}

async function generateWithFal(args: {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  guidanceScale: number;
  steps: number;
  styleStrength: number;
}) {
  if (!process.env.FAL_KEY) {
    return null;
  }

  const payload = {
    prompt: args.prompt,
    negative_prompt: args.negativePrompt,
    guidance_scale: args.guidanceScale,
    num_inference_steps: args.steps,
    style_strength: args.styleStrength,
    image_size: {
      width: args.width,
      height: args.height
    },
    safety_tolerance: 'auto',
    output_format: 'png',
    enable_safety_checker: true,
    prompt_strength: 0.85,
    seed: Math.floor(Math.random() * 1_000_000_000)
  };

  const response = await fetch(FAL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Key ${process.env.FAL_KEY}`
    },
    body: JSON.stringify(payload),
    cache: 'no-cache'
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'FAL generation failed');
  }

  const body = await response.json();
  const imageUrl = extractImageUrl(body);

  if (!imageUrl) {
    throw new Error('Image URL missing from FAL response');
  }

  return {
    imageUrl,
    provider: 'fal'
  } as const;
}

async function generateWithOpenAI(args: {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
}) {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const mappedSize: '1792x1024' | '1024x1792' | '1024x1024' | '1536x1024' | '1024x1536' =
    (() => {
      const landscape = args.width >= args.height;
      if (landscape) {
        return args.width / Math.max(args.height, 1) >= 1.7 ? '1792x1024' : '1536x1024';
      }
      return args.height / Math.max(args.width, 1) >= 1.7 ? '1024x1792' : '1024x1536';
    })();

  const prompt = [args.prompt, args.negativePrompt ? `\nNegative prompt: ${args.negativePrompt}` : '']
    .filter(Boolean)
    .join('');

  const response = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    size: mappedSize,
    quality: 'high'
  });

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error('Image URL missing from OpenAI response');
  }

  return {
    imageUrl,
    provider: 'openai'
  } as const;
}

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);

  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? 'Invalid payload';
    return Response.json({ error: message }, { status: 400 });
  }

  const { prompt, negativePrompt, aspectRatio, guidanceScale, steps, styleStrength } = parsed.data;
  const { width, height } = parseAspectRatio(aspectRatio ?? '16:9');

  if (!process.env.FAL_KEY && !process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: 'Add a FAL_KEY or OPENAI_API_KEY environment variable to enable image generation.' },
      { status: 500 }
    );
  }

  try {
    const falResult = await generateWithFal({
      prompt,
      negativePrompt,
      width,
      height,
      guidanceScale,
      steps,
      styleStrength
    });

    const providerResult = falResult ?? (await generateWithOpenAI({ prompt, negativePrompt, width, height }));

    if (!providerResult) {
      throw new Error('No generation provider available.');
    }

    return Response.json({
      id: randomUUID(),
      imageUrl: providerResult.imageUrl,
      width,
      height,
      prompt
    });
  } catch (error) {
    console.error('[image-generate]', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
