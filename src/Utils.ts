export type ImageType = string | Blob | File | HTMLImageElement;

export const fileToDataURL = (file: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.addEventListener('load', () => {
        resolve(reader.result as string);
    });

    reader.addEventListener('error', (error) => {
        reject(error);
    });

    reader.readAsDataURL(file);
});

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