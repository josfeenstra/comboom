import { Vector2 } from "geon-engine";
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
    ctx.stroke();

    drawText(ctx, Vector2.zero(), text, size);

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

function drawText(ctx: CTX, pos: Vector2, text: string, size: number, max = Infinity) {
    // set text drawstate
    ctx.fillStyle = "white";
    ctx.lineWidth = 0.5;
    ctx.font = `${Math.floor(size*0.4)}px courier new`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // draw multiline
    let lines = text.split('\n');
    const lineheight = 20;
    const lineheightstart = -((lineheight * (lines.length-1)) / 2)
    
    for (var i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], pos.x, pos.y + lineheightstart + (i * lineheight));
    }

}