export type ImageType = string | Blob | File | HTMLImageElement;

export function fileToDataURL(file: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      resolve(reader.result as string);
    });

    reader.addEventListener('error', error => {
      reject(error);
    });

    reader.readAsDataURL(file);
  });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve(img);
    };

    img.onerror = err => {
      // The image couldn't be loaded.
      reject(err);
    };

    img.src = src;
  });
}
