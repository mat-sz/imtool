import { ImTool } from './ImTool';
import { ImageType, loadImage, fileToDataURL } from './Utils';

/**
 * Creates a new instance of ImTool from a <canvas> element.
 * @param video 
 */
export function fromCanvas(canvas: HTMLCanvasElement): Promise<ImTool> {
    return Promise.resolve(new ImTool(canvas));
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

                // Stop tracks to get rid of browser's streaming notification.
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
export async function fromImage(image: ImageType): Promise<ImTool> {
    let url: string | undefined;

    if (typeof image === 'string') {
        url = image;
    } else if (image instanceof Blob || image instanceof File) {
        url = await fileToDataURL(image);
    } else if (image instanceof HTMLImageElement) {
        if (image.complete && image.naturalWidth === 0) {
            return Promise.resolve(new ImTool(image));
        } else {
            url = image.src;
        }
    } 
    
    if (url) {
        const img = await loadImage(url);
        return new ImTool(img);
    } else {
        throw new Error('Unable to load the image.');
    }
};

/**
 * Creates a new instance of ImTool from screen capture.
 */
export async function fromScreen(): Promise<ImTool> {
    // @ts-ignore TS's dom.lib.ts doesn't have support for this, yet.
    if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen capture is not supported in this browser.');
    }

    // @ts-ignore TS's dom.lib.ts doesn't have support for this, yet.
    let stream: MediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
    });

    if (!stream) {
        throw new Error('Unable to start screen capture.');
    }

    return await fromMediaStream(stream);
};

/**
 * Creates a new instance of ImTool from webcam capture.
 */
export async function fromWebcam(): Promise<ImTool> {
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Webcam capture is not supported in this browser.');
    }

    let stream: MediaStream = await navigator.mediaDevices.getUserMedia({
        video: true
    });

    if (!stream) {
        throw new Error('Unable to start webcam capture.');
    }

    return await fromMediaStream(stream);
};