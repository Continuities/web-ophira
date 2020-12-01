export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
export const roundToPrecision = (f, precision) => {
  const mult = Math.pow(10, precision);
  return Math.round(f * mult) / mult;
}
