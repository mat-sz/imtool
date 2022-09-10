import { ImageLike } from './types';
import {
  loadImage,
  emptyCanvas,
  thumbnail,
  rotate,
  flip,
  fromImageLike,
} from './utils';

export class ImTool {
  private canvas: HTMLCanvasElement;
  private outputType = 'image/jpeg';
  private outputQuality = 0.7;

  readonly originalWidth: number;
  readonly originalHeight: number;

  /**
   * Constructs a new ImTool instance from a loaded image.
   * Do not use this directly, use from* functions from index.ts instead.
   * @param image Loaded image. Must be from the same origin, or from an origin accessible to the website.
   */
  constructor(image: ImageLike) {
    this.canvas = fromImageLike(image);
    this.originalWidth = this.canvas.width;
    this.originalHeight = this.canvas.height;
  }

  get width(): number {
    return this.canvas.width;
  }

  get height(): number {
    return this.canvas.height;
  }

  /**
   * Crops the image.
   * @param x Horizontal offset.
   * @param y Vertical offset.
   * @param width Width.
   * @param height Height.
   */
  crop(x: number, y: number, width: number, height: number): ImTool {
    const { canvas, ctx } = emptyCanvas(width, height);
    ctx.drawImage(this.canvas, -x, -y, this.canvas.width, this.canvas.height);
    this.canvas = canvas;

    return this;
  }

  /**
   * Scales the image, doesn't preserve ratio.
   * @param width New width.
   * @param height New height.
   */
  scale(width: number, height: number): ImTool {
    const { canvas, ctx } = emptyCanvas(width, height);
    ctx.drawImage(this.canvas, 0, 0, width, height);
    this.canvas = canvas;

    return this;
  }

  /**
   * Flips the image.
   * @param vertical When true the image will be flipped vertically, otherwise it will be flipped horizontally.
   */
  flip(vertical = false): ImTool {
    this.canvas = flip(this.canvas, vertical);
    return this;
  }

  /**
   * Flips the image horizontally.
   */
  flipH(): ImTool {
    return this.flip(false);
  }

  /**
   * Flips the image vertically.
   */
  flipV(): ImTool {
    return this.flip(true);
  }

  /**
   * Generates a thumbnail.
   * @param maxSize Maximum width or height.
   * @param cover When true this will cause the thumbnail to be a square and image will be centered with its smallest dimension becoming as large as maxDimension and the overflow being cut off. Default: false.
   */
  thumbnail(maxSize: number, cover = false): ImTool {
    this.canvas = thumbnail(this.canvas, maxSize, cover);
    return this;
  }

  /**
   * Rotates the image by a given amount of radians relative to the center of the image. This will change the size of the canvas to fit new image.
   * @param rad Radians.
   */
  rotate(rad: number): ImTool {
    this.canvas = rotate(this.canvas, rad);
    return this;
  }

  /**
   * Rotates the image by a given amount of degrees relative to the center of the image. This will change the size of the canvas to fit new image.
   * @param degrees Degrees.
   */
  rotateDeg(degrees: number): ImTool {
    return this.rotate((degrees * Math.PI) / 180);
  }

  /**
   * Sets the canvas background.
   * @param color Color can be any valid color string.
   */
  background(color: string): ImTool {
    const { width, height } = this.canvas;
    const { canvas, ctx } = emptyCanvas(width, height);

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(this.canvas, 0, 0, width, height);
    this.canvas = canvas;

    return this;
  }

  /**
   * Sets the input type. (Default: image/jpeg)
   * @param type Type, can be anything supported by the browser, common examples: image/jpeg and image/png.
   */
  type(type: string): ImTool {
    this.outputType = type;
    return this;
  }

  /**
   * Sets the quality for lossy compression (like image/jpeg). Default: 0.7.
   * @param quality Quality from 0 to 1.
   */
  quality(quality: number): ImTool {
    this.outputQuality = quality;
    return this;
  }

  /**
   * Exports the resulting image as blob.
   */
  toBlob(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        this.canvas.toBlob(
          blob => {
            if (!blob) {
              reject(new Error('Blob unavailable.'));
            } else {
              resolve(blob);
            }
          },
          this.outputType,
          this.outputQuality
        );
      } catch (e) {
        // Probably caused by a tainted canvas (i.e. a resource from a foreign origin.)
        reject(e);
      }
    });
  }

  /**
   * Exports the resulting image as blob URL.
   */
  async toBlobURL(): Promise<string> {
    return URL.createObjectURL(await this.toBlob());
  }

  /**
   * Exports the resulting image as data URL.
   */
  toDataURL(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        resolve(this.canvas.toDataURL(this.outputType, this.outputQuality));
      } catch (e) {
        // Probably caused by a tainted canvas (i.e. a resource from a foreign origin.)
        reject(e);
      }
    });
  }

  /**
   * Exports the resulting image as HTMLCanvasElement.
   */
  toCanvas(): Promise<HTMLCanvasElement> {
    return new Promise(resolve => {
      const { width, height } = this.canvas;
      const { canvas, ctx } = emptyCanvas(width, height);
      ctx.drawImage(this.canvas, 0, 0, width, height);
      resolve(canvas);
    });
  }

  /**
   * Exports the resulting image as a HTMLImageElement.
   */
  async toImage(): Promise<HTMLImageElement> {
    const url = await this.toDataURL();
    return await loadImage(url);
  }

  /**
   * Downloads the resulting image.
   * @param name
   */
  async toDownload(name: string): Promise<void> {
    const url = await this.toDataURL();
    const element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', name);

    element.style.display = 'none';
    element.click();
  }

  /**
   * Exports the resulting image as File.
   * @param name
   */
  async toFile(name: string): Promise<File> {
    const blob = await this.toBlob();
    return new File([blob], name);
  }
}
