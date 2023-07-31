import { fileToDataURL, loadImage } from '.';
import { ImageLike } from '../types';

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
  if (width <= 0 || height <= 0) {
    throw new Error('All arguments must be positive.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Context initialization failure.');
  }

  return { canvas, ctx };
}

export function isTainted(ctx: CanvasRenderingContext2D): boolean {
  try {
    ctx.getImageData(0, 0, 1, 1);
  } catch {
    return true;
  }

  return false;
}

/**
 * Flips the image.
 * @param vertical When true the image will be flipped vertically, otherwise it will be flipped horizontally.
 */
export function flip(
  input: HTMLCanvasElement,
  vertical = false
): HTMLCanvasElement {
  const { width, height } = input;
  const { canvas, ctx } = emptyCanvas(width, height);

  if (vertical) {
    ctx.translate(0, height);
    ctx.scale(1, -1);
  } else {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(input, 0, 0, width, height);
  return canvas;
}

/**
 * Generates a thumbnail.
 * @param maxSize Maximum width or height.
 * @param cover When true this will cause the thumbnail to be a square and image will be centered with its smallest dimension becoming as large as maxDimension and the overflow being cut off. Default: false.
 */
export function thumbnail(
  input: HTMLCanvasElement,
  maxSize: number,
  cover = false
): HTMLCanvasElement {
  let scale = 1;
  let x = 0;
  let y = 0;
  let imageWidth = 0;
  let imageHeight = 0;
  let canvasWidth = 0;
  let canvasHeight = 0;

  if (cover) {
    if (input.width > input.height) {
      scale = maxSize / input.height;
      imageWidth = input.width * scale;
      imageHeight = maxSize;
      x = (-1 * (imageWidth - maxSize)) / 2;
    } else {
      scale = maxSize / input.width;
      imageWidth = maxSize;
      imageHeight = input.height * scale;
      y = (-1 * (imageHeight - maxSize)) / 2;
    }

    canvasWidth = maxSize;
    canvasHeight = maxSize;
  } else {
    // If any of the dimensions of the given image is higher than our maxSize
    // scale the image down, otherwise leave it as is.
    scale = Math.min(
      Math.min(maxSize / input.width, maxSize / input.height),
      1
    );

    imageWidth = input.width * scale;
    imageHeight = input.height * scale;
    canvasWidth = imageWidth;
    canvasHeight = imageHeight;
  }

  const { canvas, ctx } = emptyCanvas(canvasWidth, canvasHeight);
  ctx.drawImage(input, x, y, imageWidth, imageHeight);

  return canvas;
}

/**
 * Rotates the image by a given amount of radians relative to the center of the image. This will change the size of the canvas to fit new image.
 * @param rad Radians.
 */
export function rotate(
  input: HTMLCanvasElement,
  rad: number
): HTMLCanvasElement {
  let angle = rad % (Math.PI * 2);
  if (angle > Math.PI / 2) {
    if (angle <= Math.PI) {
      angle = Math.PI - angle;
    } else if (angle <= (Math.PI * 3) / 2) {
      angle = angle - Math.PI;
    } else {
      angle = Math.PI * 2 - angle;
    }
  }

  // Optimal dimensions for image after rotation.
  const width =
    input.width * Math.cos(angle) +
    input.height * Math.cos(Math.PI / 2 - angle);
  const height =
    input.width * Math.sin(angle) +
    input.height * Math.sin(Math.PI / 2 - angle);

  const { canvas, ctx } = emptyCanvas(width, height);

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(rad);
  ctx.drawImage(input, -input.width / 2, -input.height / 2);
  ctx.restore();

  return canvas;
}

export function fromImageLike(imageLike: ImageLike): HTMLCanvasElement {
  if (
    imageLike instanceof HTMLImageElement &&
    !imageLike.complete &&
    imageLike.naturalWidth === 0
  ) {
    throw new Error('Image is not fully loaded.');
  } else if (
    imageLike instanceof HTMLVideoElement &&
    (imageLike.readyState < 2 || imageLike.ended)
  ) {
    throw new Error('Video stream is not fully loaded.');
  }

  let width = imageLike.width;
  let height = imageLike.height;

  if (imageLike instanceof HTMLVideoElement) {
    width = imageLike.videoWidth;
    height = imageLike.videoHeight;
  } else if (imageLike instanceof HTMLImageElement) {
    width = imageLike.naturalWidth;
    height = imageLike.naturalHeight;
  }

  const { canvas, ctx } = emptyCanvas(width, height);

  ctx.drawImage(imageLike, 0, 0, width, height);

  if (isTainted(ctx)) {
    throw new Error(
      'Canvas is tainted. Images must be from the same origin or current host must be specified in Access-Control-Allow-Origin.'
    );
  }

  return canvas;
}

export async function fromFile(file: Blob): Promise<HTMLCanvasElement> {
  const url = await fileToDataURL(file);

  if (url) {
    const image = await loadImage(url);
    return fromImageLike(image);
  } else {
    throw new Error('Unable to load the image.');
  }
}
