export function parseAspectRatio(input: string | null | undefined) {
  if (!input) {
    return { width: 3840, height: 2160, ratio: '16:9' };
  }

  const normalized = input.trim();
  const match = normalized.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);

  if (!match) {
    return { width: 3840, height: 2160, ratio: '16:9' };
  }

  const ratioWidth = parseFloat(match[1]);
  const ratioHeight = parseFloat(match[2]);

  if (!Number.isFinite(ratioWidth) || !Number.isFinite(ratioHeight) || ratioWidth <= 0 || ratioHeight <= 0) {
    return { width: 3840, height: 2160, ratio: '16:9' };
  }

  const BASE_MAX = 4096;
  const scale = BASE_MAX / Math.max(ratioWidth, ratioHeight);
  const rawWidth = ratioWidth * scale;
  const rawHeight = ratioHeight * scale;

  const snap = (value: number) => {
    const snapped = Math.round(value / 8) * 8;
    return Math.max(512, snapped);
  };

  const width = snap(rawWidth);
  const height = snap(rawHeight);

  return {
    width,
    height,
    ratio: `${ratioWidth}:${ratioHeight}`
  };
}
