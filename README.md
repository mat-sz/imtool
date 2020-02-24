<h1 align="center">🖼️🔧 imtool</h1>

<p align="center">
TypeScript image manipulation library, works on the client side saving you money (and server resources).
</p>

<p align="center">
<strong>Quickstart:</strong>
</p>

```sh
npm install imtool
# or:
yarn add imtool
```

## Table of contents

1. [Why?](#why)
2. [Usage](#usage)
3. [Examples](#examples)

## Why?

Client-side image manipulation:

* reduces server load - image processing being typically one of the most CPU expensive tasks in image storage systems,
* allows for end to end encryption of thumbnails along with the original images, 
* allows for easy usage within Electron without relying on external tools like Imagemagick.

## Usage

### Import

`imtool` provides 6 easy to use `from*` functions, **all of the functions return a Promise**:

#### fromImage(image: string | Blob | File | HTMLImageElement)

Creates an instance of `ImTool` from an URL, Blob, File or HTMLImageElement.

**In case of URL and HTMLImageElement being used the image must be accessible to the current origin, by either being from the same origin or by being from an origin specified in `Access-Control-Allow-Origin` header on the response from the desired URL.**

#### fromVideo(video: HTMLVideoElement)

Creates an instance of `ImTool` from an HTMLVideoElement.

**The video must be accessible to the current origin, by either being from the same origin or by being from an origin specified in `Access-Control-Allow-Origin` header on the response from the desired URL.**

#### fromCanvas(video: HTMLCanvasElement)

Creates an instance of `ImTool` from an HTMLCanvasElement.

**The canvas must not be [tainted](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image#Security_and_tainted_canvases).**

#### fromWebcam()

Asks the user for the permission to access their webcam, captures the image, and creates an instance of `ImTool`.

**Must be called directly from an user action, for example: a button press.**

#### fromScreen()

Asks the user for the permission to access their desktop capture, captures the image, and creates an instance of `ImTool`.

**Must be called directly from an user action, for example: a button press. May be not supported on some browsers, like Safari (including all internet browsers on iOS), Internet Explorer and older versions of other browsers.**

#### fromMediaStream(stream: MediaStream)

Creates an instance of `ImTool` from MediaStream (must contain at least one video track).

### Image manipulation

All functions return the same instance of `ImTool`, allowing for easy chaining.

#### thumbnail(maxSize: number, cover: boolean = false)

Creates a thumbnail. The code for this comes from my older project, [nailit](https://github.com/mat-sz/nailit).

* `maxSize` specifies the maximum size (either width or height) of the resulting image.
* `cover` when set to true will cause the resulting image to be a square and the input image will be centered with its smallest dimension becoming as large as maxDimension and the overflow being cut off.

#### scale(width: number, height: number)

Scales the image down/up to specified `width` and `height`.

#### crop(x: number, y: number, width: number, height: number)

Moves the input image from (`x`, `y`) to (0, 0) and crops it down to the specified `width` and `height`.

### Export

#### toBlob(): Promise\<Blob\>

Outputs a Blob.

#### toDataURL(): Promise\<string\>

Outputs a data URL.

#### toCanvas(): Promise\<HTMLCanvasElement\>

Outputs a `<canvas>`.

#### toImage(): Promise\<HTMLImageElement\>

Outputs an `<img>`.

## Examples

### Load an image, create a thumbnail and export it as data URL

```js
import { fromImage } from 'imtool';

async function example() {
    const tool = await fromImage('./image.png');
    return await tool.thumbnail(250).toDataURL();
}
```

### Load a screenshot, crop a part of it and export it as a Blob

```js
import { fromScreen } from 'imtool';

async function example() {
    const tool = await fromScreen();
    return await tool.crop(50, 50, 200, 200).toBlob();
}
```

### Load a webcam capture, crop a part of it, create a thumbnail and export as data URL

```js
import { fromWebcam } from 'imtool';

async function example() {
    const tool = await fromWebcam();
    return await tool.crop(50, 50, 500, 500).thumbnail(250).toDataURL();
}
```