import { InputState, Vector2 } from "geon-engine";
import { CtxCamera } from "./ctx-camera";
import { CTX } from "./ctx-helpers";



export abstract class CtxApp {
    
    redrawAll = true;
    
    protected constructor(
        protected readonly canvas: HTMLCanvasElement,
        protected readonly ctx: CTX,
        protected readonly camera: CtxCamera,
        protected readonly input: InputState
        ) {}

    static new(canvas: HTMLCanvasElement, ui: HTMLDivElement) {

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            alert("Canvas Rendering not supported in your browser. Try upgrading or switching!"); 
            return undefined;
        } 

        const camera = CtxCamera.new(ctx.canvas, Vector2.new(-100,-100), 1);
        const state = InputState.new(ctx.canvas);

    }

    onCreate() {
        // hook up all functions & listeners
        window.addEventListener("resize", () => this.onResize());
        this.onResize();
        this.camera.onMouseDown = (worldPos: Vector2) => {
            this.onMouseDown(worldPos);
        }
        this.camera.onMouseUp = (worldPos: Vector2) => {
            this.onMouseUp(worldPos);
        }
    }

    start() {

    }

    /**
     * NOTE: this is sort of the main loop of the whole node canvas
     * @param dt 
     */
    update(dt: number) {
        this.input.preUpdate(dt);

        let redraw = this.camera.update(this.input);
        if (redraw) {
            this.redrawAll = true;
        }

        // mouse
        this.updateMouse(this.camera.mousePos);
        


        this.input.postUpdate();
    }

    draw() {
   
        // redraw everything if we moved the camera, for example
        if (!this.redrawAll) {
            return;
        }
        this.redrawAll = false;

        // prepare
        let ctx = this.ctx;
        let camera = this.camera;
        ctx.save();
        ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
        camera.moveCtxToState(ctx);

        // done drawing
        ctx.restore();
    }

    updateMouse(worldPos: Vector2) {

    }

    onResize() {
        this.redrawAll = true;
    }

    onMouseUp(worldPos: Vector2) {

    }

    onMouseDown(worldPos: Vector2) {

    }
}