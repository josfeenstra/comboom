
// shorthands
export type CTX = CanvasRenderingContext2D; 
export type Canvas = HTMLCanvasElement;

// for resizing
export function resizeCanvas(ctx: CTX) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    let canvas = ctx.canvas as HTMLCanvasElement;

    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    const needResize = ctx.canvas.width !== displayWidth || ctx.canvas.height !== displayHeight;

    if (needResize) {
        // Make the canvas the same size
        ctx.canvas.width = displayWidth;
        ctx.canvas.height = displayHeight;
    }

    // Tell WebGL how to convert from clip space to pixels
    // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    return needResize;
}