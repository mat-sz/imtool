import { ImTool } from './ImTool';

export type ImageType = string | Blob | File | HTMLImageElement;

const waitForImageToLoad = (src: string, resolve: (image: ImTool) => void, reject: (error: any) => void) => {
    let img = new Image();

    img.onload = () => {
        resolve(new ImTool(img));
    };

    img.onerror = (err) => {
        // The image couldn't be loaded.
        reject(err);
    };

    img.src = src;
};

/**
 * Creates a new instance of ImTool from a <video> element. (Must be during playback.)
 * @param video 
 */
export function fromVideo(video: HTMLVideoElement): Promise<ImTool> {
    return Promise.resolve(new ImTool(video));
};

/**
 * Creates a new instance of IMTool from a MediaStream. (Must contain at least one video track.)
 * @param stream 
 */
export function fromMediaStream(stream: MediaStream): Promise<ImTool> {
    return new Promise<ImTool>(
        async (resolve, reject) => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            video.addEventListener('playing', async () => {
                const tool = await fromVideo(video);
                video.srcObject = null;
                stream.getTracks().forEach((track) => track.stop());
                resolve(tool);
            });
    
            video.addEventListener('error', (e) => {
                reject(e);
            });
        }
    );
};

/**
 * Creates a new instance of ImTool from an image URL, Blob, File or an <img> element.
 * The image be from the same origin, or from an origin accessible to the website.
 * @param image The image to be loaded.
 */
export function fromImage(image: ImageType): Promise<ImTool> {
    if (typeof image === 'string') {
        return new Promise((resolve, reject) => {
            waitForImageToLoad(image, resolve, reject);
        });
    } else if (image instanceof Blob || image instanceof File) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                waitForImageToLoad(reader.result as string, resolve, reject);
            });
            reader.readAsDataURL(image);
        });
    } else if (image instanceof HTMLImageElement) {
        if (image.complete && image.naturalWidth === 0) {
            return Promise.resolve(new ImTool(image));
        } else {
            return new Promise((resolve, reject) => {
                waitForImageToLoad(image.src, resolve, reject);
            });
        }
    } else {
        return Promise.reject(new Error('Unable to load the image.'));
    }
};

/**
 * Creates a new instance of ImTool from screen capture.
 */
export function fromScreen(): Promise<ImTool> {
    return new Promise(async (resolve, reject) => {
        // @ts-ignore TS's dom.lib.ts doesn't have support for this, yet.
        if (!navigator.mediaDevices?.getDisplayMedia) {
            reject(new Error('Screen capture is not supported.'));
        }

        // @ts-ignore TS's dom.lib.ts doesn't have support for this, yet.
        let stream: MediaStream = await navigator.mediaDevices.getDisplayMedia({
            video: true
        });

        if (!stream) {
            reject(new Error('Unable to start screen capture.'));
        }
    
        resolve(fromMediaStream(stream));
    });
};

/**
 * Creates a new instance of ImTool from webcam capture.
 */
export function fromWebcam(): Promise<ImTool> {
    return new Promise(async (resolve, reject) => {
        if (!navigator.mediaDevices?.getUserMedia) {
            reject(new Error('Webcam capture is not supported.'));
        }

        let stream: MediaStream = await navigator.mediaDevices.getUserMedia({
            video: true
        });

        if (!stream) {
            reject(new Error('Unable to start webcam capture.'));
        }
    
        resolve(fromMediaStream(stream));
    });
};