/**
 * oklch() → sRGB hex, for React Native, which cannot parse oklch.
 *
 * Implements Björn Ottosson's OKLab transform. Out-of-gamut colours are
 * clipped per channel before gamma encoding — the wide-gamut original is
 * preserved in `src/palette.ts` and still reaches the browser untouched.
 */

const toChannel = (linear: number): string => {
  // Clip before gamma: negative linear values are out of sRGB and would
  // produce NaN under the fractional exponent.
  const clipped = Math.min(1, Math.max(0, linear));
  const gamma =
    clipped <= 0.0031308
      ? 12.92 * clipped
      : 1.055 * clipped ** (1 / 2.4) - 0.055;
  return Math.round(gamma * 255)
    .toString(16)
    .padStart(2, "0");
};

export const parseOklch = (value: string): [number, number, number] => {
  const match = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(value);
  if (!match) throw new Error(`Not a plain oklch() colour: ${value}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
};

export const oklchToHex = (value: string): string => {
  const [lightness, chroma, hue] = parseOklch(value);

  const radians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);

  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const red = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const green = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const blue = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return `#${toChannel(red)}${toChannel(green)}${toChannel(blue)}`;
};
