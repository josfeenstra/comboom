// purpose: entry point
import { FpsCounter } from "geon-engine";
import { ComboomApp } from "./app";

async function main() {

    // get references of all items on the canvas
    const html_canvas = document.getElementById("nodes-canvas")! as HTMLCanvasElement;
    const ui = document.getElementById("nodes-panel") as HTMLDivElement;
    
    // nodes
    const comboom = ComboomApp.new(html_canvas, ui)!;
    
    let data = await fetch("./resources/combos.json");
    let json = await data.json();
    comboom.load(json);

    // timing
    let acc_time = 0;
    let counter = FpsCounter.new();

    // loop
    function loop(elapsed_time: number) {
        let delta_time = elapsed_time - acc_time;
        acc_time = elapsed_time;

        counter._update(delta_time);
        document.title = "fps: " + counter.getFps();

        comboom.update(delta_time);
        comboom.draw();
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}

window.addEventListener("load", main, false);