import { ImTool } from './ImTool';

export type ImageType = string | Blob | File | HTMLImageElement;

export const loadImageToImTool = (src: string, resolve: (image: ImTool) => void, reject: (error: any) => void) => {
    loadImage(src)
        .then((image) => resolve(new ImTool(image)))
        .catch(reject);
};

export const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    let img = new Image();

    img.onload = () => {
        resolve(img);
    };

    img.onerror = (err) => {
        // The image couldn't be loaded.
        reject(err);
    };

    img.src = src;
});