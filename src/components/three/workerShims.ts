/// <reference lib="webworker" />
/**
 * Workers have no DOM `Image`, but three's GLTFLoader uses one to probe
 * WebP/AVIF support (textures themselves load via ImageBitmapLoader). This
 * minimal stand-in runs the same probe with fetch + createImageBitmap, so a
 * GLB with WebP textures loads in the worker instead of failing.
 */
if (typeof (self as { Image?: unknown }).Image === "undefined") {
  class WorkerImage {
    width = 0;
    height = 0;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    #src = "";
    get src() {
      return this.#src;
    }
    set src(value: string) {
      this.#src = value;
      fetch(value)
        .then((r) => r.blob())
        .then((b) => createImageBitmap(b))
        .then((bitmap) => {
          this.width = bitmap.width;
          this.height = bitmap.height;
          bitmap.close();
          this.onload?.();
        })
        .catch(() => this.onerror?.());
    }
  }
  (self as unknown as { Image: typeof WorkerImage }).Image = WorkerImage;
}

export {};
