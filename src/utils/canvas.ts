/**
 * Builds an empty canvas.
 * @param width Width in pixels.
 * @param height Height in pixels.
 * @returns The new canvas and the corresponding context.
 */
export function emptyCanvas(
  width: number,
  height: number
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Context initialization failure.');
  }

  return { canvas, ctx };
}
