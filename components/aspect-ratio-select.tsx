'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';

export type AspectRatioPreset = {
  label: string;
  ratio: string;
  hint: string;
};

export const PRESET_ASPECT_RATIOS: AspectRatioPreset[] = [
  { label: 'Ultra HD 16:9', ratio: '16:9', hint: 'Cinematic widescreen' },
  { label: 'Portrait 9:16', ratio: '9:16', hint: 'Vertical campaigns' },
  { label: 'Classic 3:2', ratio: '3:2', hint: 'Print ready' },
  { label: 'Hero 2:1', ratio: '2:1', hint: 'Billboard feel' },
  { label: 'Square 1:1', ratio: '1:1', hint: 'Social tiles' }
];

export type AspectRatioSelectProps = {
  value: string;
  onChange: (value: string) => void;
};

export function AspectRatioSelect({ value, onChange }: AspectRatioSelectProps) {
  const [custom, setCustom] = useState<string>('21:9');
  const activePreset = useMemo(
    () => PRESET_ASPECT_RATIOS.find((preset) => preset.ratio === value)?.ratio,
    [value]
  );

  const handleCustomBlur = () => {
    const trimmed = custom.trim();
    if (/^\d+(?:\.\d+)?:\d+(?:\.\d+)?$/.test(trimmed)) {
      onChange(trimmed);
    }
  };

  return (
    <div className="space-y-3">
      <span className="block text-sm font-medium text-neutral-300 uppercase tracking-[0.2em]">
        Aspect Ratio
      </span>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {PRESET_ASPECT_RATIOS.map((preset) => (
          <button
            key={preset.ratio}
            type="button"
            onClick={() => onChange(preset.ratio)}
            className={clsx(
              'rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-left transition hover:border-neutral-500 hover:bg-neutral-900',
              activePreset === preset.ratio && 'border-sky-500/80 bg-sky-500/10 shadow-[0_0_30px_rgba(56,189,248,0.25)]'
            )}
          >
            <div className="text-sm font-semibold text-neutral-100">{preset.label}</div>
            <div className="text-xs text-neutral-400">{preset.hint}</div>
            <div className="mt-3 flex h-16 items-center justify-center">
              <div
                className={clsx(
                  'rounded-md border border-neutral-700/80 bg-neutral-950/40',
                  'flex items-center justify-center text-xs text-neutral-400',
                  'transition-all duration-500 ease-out'
                )}
                style={{
                  width:
                    preset.ratio === '9:16'
                      ? '32px'
                      : preset.ratio === '1:1'
                        ? '44px'
                        : preset.ratio === '2:1'
                          ? '64px'
                          : '56px',
                  height:
                    preset.ratio === '9:16'
                      ? '56px'
                      : preset.ratio === '1:1'
                        ? '44px'
                        : preset.ratio === '2:1'
                          ? '32px'
                          : '36px'
                }}
              >
                {preset.ratio}
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
        <label className="text-sm font-semibold text-neutral-200" htmlFor="custom-aspect">
          Custom ratio
        </label>
        <p className="mt-1 text-xs text-neutral-500">
          Use the format <code>w:h</code> to target anything from cinematic 21:9 to bespoke installations.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <input
            id="custom-aspect"
            type="text"
            defaultValue={custom}
            onChange={(event) => setCustom(event.target.value)}
            onBlur={handleCustomBlur}
            placeholder="21:9"
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950/80 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-sky-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              const trimmed = custom.trim();
              if (!/^\d+(?:\.\d+)?:\d+(?:\.\d+)?$/.test(trimmed)) {
                return;
              }
              onChange(trimmed);
            }}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-sky-400"
          >
            Apply
          </button>
        </div>
        {value !== activePreset && (
          <div className="mt-3 text-xs text-sky-400">Using custom ratio: {value}</div>
        )}
      </div>
    </div>
  );
}
