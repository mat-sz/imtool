import { ImTool } from '../src/ImTool';
import { createCanvas } from 'canvas';

describe('image manipulation', () => {
  it('crops images', async () => {
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#f00';
    ctx.fillRect(100, 100, 1, 1);

    // @ts-ignore For testing purposes only.
    const tool = new ImTool(canvas);
    tool.crop(100, 100, 100, 100);

    const newCanvas = await tool.toCanvas();

    expect(newCanvas.width).toBe(100);
    expect(newCanvas.height).toBe(100);

    const newCtx = newCanvas.getContext('2d');
    const data = newCtx.getImageData(0, 0, 1, 1);
    expect(data.data).toEqual(new Uint8ClampedArray([255, 0, 0, 255]));
  });

  it('scales images', async () => {
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#f00';
    ctx.fillRect(0, 0, 2, 2);

    // @ts-ignore For testing purposes only.
    const tool = new ImTool(canvas);
    tool.scale(100, 100);

    const newCanvas = await tool.toCanvas();

    expect(newCanvas.width).toBe(100);
    expect(newCanvas.height).toBe(100);

    const newCtx = newCanvas.getContext('2d');
    const data = newCtx.getImageData(0, 0, 1, 1);
    expect(data.data).toEqual(new Uint8ClampedArray([255, 0, 0, 255]));
  });

  it('creates thumbnails (cover: false)', async () => {
    const canvas = createCanvas(200, 400);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 200, 400);

    // @ts-ignore For testing purposes only.
    const tool = new ImTool(canvas);
    tool.thumbnail(100, false);

    const newCanvas = await tool.toCanvas();

    expect(newCanvas.width).toBe(50);
    expect(newCanvas.height).toBe(100);
  });

  it('creates thumbnails (cover: true)', async () => {
    const canvas = createCanvas(200, 400);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 200, 400);

    // @ts-ignore For testing purposes only.
    const tool = new ImTool(canvas);
    tool.thumbnail(100, true);

    const newCanvas = await tool.toCanvas();

    expect(newCanvas.width).toBe(100);
    expect(newCanvas.height).toBe(100);
  });

  it('flips images vertically', async () => {
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#f00';
    ctx.fillRect(0, 0, 1, 1);

    // @ts-ignore For testing purposes only.
    const tool = new ImTool(canvas);
    tool.flipV();

    const newCanvas = await tool.toCanvas();

    expect(newCanvas.width).toBe(200);
    expect(newCanvas.height).toBe(200);

    const newCtx = newCanvas.getContext('2d');
    const data = newCtx.getImageData(0, 199, 1, 1);
    expect(data.data).toEqual(new Uint8ClampedArray([255, 0, 0, 255]));
  });

  it('flips images horizontally', async () => {
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#f00';
    ctx.fillRect(0, 0, 1, 1);

    // @ts-ignore For testing purposes only.
    const tool = new ImTool(canvas);
    tool.flipH();

    const newCanvas = await tool.toCanvas();

    expect(newCanvas.width).toBe(200);
    expect(newCanvas.height).toBe(200);

    const newCtx = newCanvas.getContext('2d');
    const data = newCtx.getImageData(199, 0, 1, 1);
    expect(data.data).toEqual(new Uint8ClampedArray([255, 0, 0, 255]));
  });
});
