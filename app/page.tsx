'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { AspectRatioSelect } from '../components/aspect-ratio-select';
import { parseAspectRatio } from '../lib/aspect';

const STEPS_RANGE = { min: 25, max: 60 } as const;

type GenerationPayload = {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: string;
  guidanceScale: number;
  steps: number;
  styleStrength: number;
};

type GenerationResponse = {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  prompt: string;
};

export default function Page() {
  const [prompt, setPrompt] = useState('Hyperrealistic cinematic portrait of a cybernetic explorer emerging from neon mist');
  const [negativePrompt, setNegativePrompt] = useState('blurry, low detail, distorted anatomy');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [guidanceScale, setGuidanceScale] = useState<number>(6.5);
  const [steps, setSteps] = useState<number>(42);
  const [styleStrength, setStyleStrength] = useState<number>(0.3);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResponse | null>(null);
  const [history, setHistory] = useState<GenerationResponse[]>([]);

  const ratioDisplay = useMemo(() => {
    const { width, height } = parseAspectRatio(aspectRatio);
    return `${width} × ${height}`;
  }, [aspectRatio]);

  const submitGeneration = useCallback(
    async (payload: GenerationPayload) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const message = await response.json().catch(() => ({}));
          throw new Error(message?.error ?? 'Failed to generate image');
        }

        const data = (await response.json()) as GenerationResponse;
        setResult(data);
        setHistory((prev) => [data, ...prev].slice(0, 6));
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unexpected error');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!prompt.trim()) {
        setError('Add a descriptive prompt to craft your scene.');
        return;
      }

      await submitGeneration({
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim() || undefined,
        aspectRatio,
        guidanceScale,
        steps,
        styleStrength
      });
    },
    [prompt, negativePrompt, aspectRatio, guidanceScale, steps, styleStrength, submitGeneration]
  );

  useEffect(() => {
    setError(null);
  }, [prompt, aspectRatio, guidanceScale, steps, styleStrength]);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 pb-20 pt-16 sm:px-6 lg:px-8">
      <header className="space-y-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/50 bg-sky-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
          Ultra HD Imagineering
        </div>
        <h1 className="text-pretty text-4xl font-semibold tracking-tight text-neutral-100 sm:text-5xl">
          VisionCrafter — Hyperrealistic 4K Generation on Demand
        </h1>
        <p className="mx-auto max-w-2xl text-balance text-sm text-neutral-400 sm:text-base">
          Transform narratives into production-ready stills with calibrated 4K diffusion. Control the aspect ratio, cinematic guidance, and stylistic reinforcement for campaign-perfect imagery in seconds.
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-[0_0_60px_rgba(15,118,255,0.08)] backdrop-blur"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-200" htmlFor="prompt">
              Narrative prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="h-36 w-full resize-none rounded-xl border border-neutral-800 bg-neutral-950/70 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-sky-500 focus:outline-none"
              placeholder="Describe the shot in meticulous detail..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-200" htmlFor="negative-prompt">
              Guardrails (negative prompt)
            </label>
            <input
              id="negative-prompt"
              value={negativePrompt}
              onChange={(event) => setNegativePrompt(event.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950/70 px-4 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-sky-500 focus:outline-none"
              placeholder="What to avoid (noise, artefacts, brands, etc.)"
            />
          </div>

          <AspectRatioSelect value={aspectRatio} onChange={setAspectRatio} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-neutral-200" htmlFor="guidance">
                Guidance intensity
                <span className="text-xs text-neutral-500">{guidanceScale.toFixed(1)}</span>
              </label>
              <input
                id="guidance"
                type="range"
                min={3}
                max={12}
                step={0.1}
                value={guidanceScale}
                onChange={(event) => setGuidanceScale(Number(event.target.value))}
                className="w-full accent-sky-500"
              />
            </div>
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-neutral-200" htmlFor="steps">
                Diffusion steps
                <span className="text-xs text-neutral-500">{steps}</span>
              </label>
              <input
                id="steps"
                type="range"
                min={STEPS_RANGE.min}
                max={STEPS_RANGE.max}
                step={1}
                value={steps}
                onChange={(event) => setSteps(Number(event.target.value))}
                className="w-full accent-sky-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center justify-between text-sm font-medium text-neutral-200" htmlFor="style-strength">
                Style reinforcement
                <span className="text-xs text-neutral-500">{Math.round(styleStrength * 100)}%</span>
              </label>
              <input
                id="style-strength"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={styleStrength}
                onChange={(event) => setStyleStrength(Number(event.target.value))}
                className="w-full accent-sky-500"
              />
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 text-xs text-neutral-400">
            <div className="font-semibold uppercase tracking-[0.2em] text-neutral-500">Target spec</div>
            <div className="mt-2 text-sm text-neutral-200">
              {ratioDisplay} · {aspectRatio} · 4K pipeline
            </div>
            <p className="mt-2 leading-relaxed text-neutral-400">
              Generation runs on Flux Pro tuned for hyperrealistic output. Provide your <code>FAL_KEY</code> (or <code>OPENAI_API_KEY</code> fallback) in the Vercel project to execute renders.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-neutral-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
          >
            {isLoading ? 'Rendering…' : 'Generate 4K Frame'}
          </button>

          {error && <p className="text-sm text-rose-400">{error}</p>}
        </form>

        <div className="flex flex-col gap-6">
          <div className="min-h-[480px] rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900/80 via-neutral-900/40 to-neutral-950/80 p-6">
            {result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm uppercase tracking-[0.3em] text-neutral-500">Latest render</div>
                    <h2 className="text-lg font-semibold text-neutral-100">{result.prompt}</h2>
                  </div>
                  <div className="text-xs text-neutral-500">
                    {result.width} × {result.height}
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-neutral-800">
                  <Image
                    src={result.imageUrl}
                    alt={result.prompt}
                    width={result.width}
                    height={result.height}
                    priority
                    className="h-auto w-full object-cover"
                  />
                  <div className="absolute left-3 top-3 rounded-full border border-sky-500/40 bg-neutral-950/60 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-sky-300 backdrop-blur">
                    4K Flux
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={result.imageUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-200 transition hover:border-sky-400 hover:text-sky-300"
                  >
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(result.imageUrl).catch(() => {})}
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-xs uppercase tracking-[0.2em] text-neutral-400 transition hover:border-neutral-600 hover:text-neutral-200"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-neutral-500">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-neutral-700">
                  <span className="text-sm uppercase tracking-[0.3em] text-neutral-600">4K</span>
                </div>
                <p className="max-w-sm text-sm text-neutral-500">
                  Your hyperrealistic render will appear here. Describe your scene and fine-tune parameters to craft bespoke visuals.
                </p>
              </div>
            )}
          </div>

          {history.length > 1 && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
              <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Recent renders</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {history.slice(1).map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setResult(item)}
                    className="group flex items-center gap-3 rounded-xl border border-transparent bg-neutral-950/40 p-2 text-left transition hover:border-sky-500/40 hover:bg-neutral-950"
                  >
                    <div className="relative h-16 w-24 overflow-hidden rounded-lg border border-neutral-800/60">
                      <Image
                        src={item.imageUrl}
                        alt={item.prompt}
                        width={item.width}
                        height={item.height}
                        className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-neutral-200 line-clamp-2">{item.prompt}</div>
                      <div className="text-[11px] text-neutral-500">
                        {item.width} × {item.height}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
