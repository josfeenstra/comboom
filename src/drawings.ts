import { Vector2 } from "geon-engine";
import { CtxCamera } from "./ctx/ctx-camera";
import { CTX } from "./ctx/ctx-helpers";

export function drawCircle(ctx: CTX, x: number, y: number, text="Luuk Withagen", size=50) {

    // move to location
    ctx.save();
    ctx.translate(x,y);

    // set stroke style
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;

    // draw circle
    ctx.beginPath();
    ctx.arc(0,0,size,0,Math.PI*2);
    ctx.fill();
    // ctx.stroke();

    prepareDrawText(ctx, "white", 50)
    fillMultilineText(ctx, Vector2.zero(), text);

    // done drawing
    ctx.restore();
}

export function drawLink(ctx: CTX, a: Vector2, b:Vector2, name: string, color: string) {
    // move to location
    ctx.save();

    // set stroke style
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    // stroke
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    
    // text
    // let center = a.added(b).scale(0.5);
    
    // let angle = b.subbed(a).angle();
    // ctx.translate(center.x, center.y)
    // ctx.rotate(angle);
    
    // drawText(ctx, Vector2.zero(), name, 100);

    // done drawing
    ctx.restore();
}

export function prepareDrawText(ctx: CTX, color: string, size: number) {
    // set text drawstate
    ctx.fillStyle = color;
    ctx.lineWidth = 0.5;
    ctx.font = `${Math.floor(size*0.4)}px Candara`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
}

export function fillMultilineText(ctx: CTX, pos: Vector2, text: string) {

    // draw multiline
    let lines = text.split('\n');
    if (lines.length == 0) {
        lines.push(text);
    }
    const lineheight = 20;
    const lineheightstart = -((lineheight * (lines.length-1)) / 2)
    
    for (var i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], pos.x, pos.y + lineheightstart + (i * lineheight));
    }
}

export function strokeMultilineText(ctx: CTX, pos: Vector2, text: string) {

    // draw multiline
    let lines = text.split('\n');
    if (lines.length == 0) {
        lines.push(text);
    }
    const lineheight = 20;
    const lineheightstart = -((lineheight * (lines.length-1)) / 2)
    
    for (var i = 0; i < lines.length; i++) {
        ctx.strokeText(lines[i], pos.x, pos.y + lineheightstart + (i * lineheight));
    }
}

// const SIZE = 100;

// export function drawGrid(ctx: CTX, camera: CtxCamera) {
 
//     let cross = (x: number, y: number, s: number) => {
//         ctx.moveTo(x, y-s);
//         ctx.lineTo(x, y+s);
//         ctx.moveTo(x-s, y);
//         ctx.lineTo(x+s, y);
//     }

//     let box = camera.getBox();
//     let size = SIZE;
//     let crosssize = size/20;
//     let topleft = Vector2.new(box.x.t0, box.y.t0);
//     let gridStart = toWorld(toGrid(topleft, size), size);

//     ctx.save();
//     ctx.fillStyle = '#111111';
//     ctx.lineWidth = 4;
//     ctx.beginPath();

//     for (let x = gridStart.x; x < box.x.t1; x += size) {
//         for (let y = gridStart.y; y < box.y.t1; y += size) {
            
            
//             // ctx.fillRect(x,y,1,1);
//             // ctx.arc(x,y,1, 0, Math.PI*2);
//             /// ctx.fill();

//             ctx.moveTo(x,y);
//             cross(x, y, crosssize);
//         }
//     }

//     ctx.stroke();
//     ctx.restore();
// }

// function toGrid(wv: Vector2, size: number) {
//     return Vector2.new(
//         Math.round((wv.x - (size/2)) / size),
//         Math.round((wv.y - (size/2)) / size)
//     )
// }

// function toWorld(gv: Vector2, size: number) {
//     return gv.scaled(size);
// }