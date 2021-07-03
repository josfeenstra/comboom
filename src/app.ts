import { Domain2, InputState, Vector2 } from "geon-engine";
import { Random } from "geon-engine/build/math/random";
import { CtxCamera } from "./ctx/ctx-camera";
import { CTX, resizeCanvas } from "./ctx/ctx-helpers";
import { drawCircle, drawLink, drawText } from "./drawings";


class Groover {
    constructor(
        public pos: Vector2, 
        public name: string, 
        public fellowNames: string[],
        public fellowCombo: string[]) {}

    static new(pos: Vector2, name: string) {
        return new Groover(pos, name, [], []);
    }
}

// 
class Combo {
    constructor(
        public name: string,
        public members: string[],
        public color: string,
        public pos: Vector2,
        public vector: Vector2,
        ) {}

    static new(name: string, members: string[], color: string) {
        return new Combo(name, members, color, Vector2.zero(), Vector2.zero());
    }
}

export class ComboomApp {
    
    // draw logic
    redrawAll = true;
    
    // state 
    groovers = new Map<string, Groover>();
    combos = new Map<string, Combo>();

    // selection state
    selected?: string = undefined;

    protected constructor(
        protected readonly canvas: HTMLCanvasElement,
        protected readonly ctx: CTX,
        protected readonly camera: CtxCamera,
        protected readonly input: InputState
        ) {}

    static new(canvas: HTMLCanvasElement, ui: HTMLDivElement) {

        // the interlocked ingredients we need for a functional app
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            alert("Canvas Rendering not supported in your browser. Try upgrading or switching!"); 
            return undefined;
        } 
        const camera = CtxCamera.new(ctx.canvas, Vector2.new(-100,-100), 1);
        const input = InputState.new(ctx.canvas);
        let app = new ComboomApp(canvas, ctx, camera, input);
        app.onCreate();
        return app;
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
        this.camera.pos = Vector2.new(-100,-100);
        this.camera.scale = 5;
    }

    /**
     * Load a json, and build a comboom from it
     * @param json 
     */
    load(json: any) {
        
        let area = Domain2.fromRadii(this.canvas.width, this.canvas.height);
        let rng = Random.fromRandom();
        // let cs = this.combos;

        for (let combo of json.combos) {
            
            this.combos.set(combo.name, Combo.new(combo.name, combo.members, combo.color));

            for (let name of combo.members) {
                let vec = area.elevate(Vector2.fromRandom(rng));
                
                // create a new groover, or get the existing one 
                let groover = this.groovers.get(name);
                if (!groover) {
                    groover = Groover.new(vec, name);
                    this.groovers.set(name, groover);
                } 
                
                // store band data (inefficiently...)
                for (let other of combo.members) {
                    if (name == other) continue;
                    groover.fellowNames.push(other);
                    groover.fellowCombo.push(combo.name);
                }
            }
        }

        // this.updateGroovers();
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
        this.onMouseMove(this.camera.mousePos);
        
        this.updateGroovers();
        this.updateCombos();

        this.input.postUpdate();
    }

    updateGroovers() {
        let desired = 600;
        let factor = 0.02;
        this.foreachGroover((a, b, combo)=> {
            lerpEdge(a.pos, b.pos, factor, desired);
        })
        this.redrawAll = true;
    }

    updateCombos() {
        
        // get all combo centers
        for (let c of this.combos.values()) {
            let sum = Vector2.new();
            for (let m of c.members) {
                sum.add(this.groovers.get(m)!.pos);
            }
            let average = sum.scale(1 / c.members.length);
            c.pos.copy(average);
        }

        // make this average move away from all other averages
        // let fac2 = 0.1;
        // let rng = Random.fromRandom();
        // for (let combo of this.combos.values()) {
        //     for (let other of this.combos.values()) {
        //         if (combo.name == other.name) {
        //             continue;
        //         }
        //         let diff = other.pos.subbed(combo.pos);
        //         let length = diff.length();
        //         combo.pos.add(Vector2.fromRandom(rng));

        //         combo.pos.copy(combo.pos.scaled(1-fac2).add(other.pos.scaled(fac2)));

        //         // combo.pos.add(diff.scale(strength));
        //     }
        // }

        // make the combo center influence the members
        let factor = 0.2;
        for (let c of this.combos.values()) {
            for (let m of c.members) {
                let pos = this.groovers.get(m)!.pos;
                pos.copy(pos.scaled(1-factor).add(c.pos.scaled(factor)));
            }
            // let average = sum.scale(1 / c.members.length);
            // c.pos.copy(average);
        }
    }

    draw() {
   
        // redraw everything if we moved the camera, for example
        if (!this.redrawAll) {
            return;
        }
        this.redrawAll = false;

        // prepare drawings
        let ctx = this.ctx;
        let camera = this.camera;
        ctx.save();
        ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
        camera.moveCtxToState(ctx);

        // draw links
        this.foreachGroover((a, b, combo) => {
            drawLink(ctx, a.pos, b.pos, combo.name, combo.color);
        })

        // draw circles
        for (let g of this.groovers.values()) {
            drawCircle(ctx, g.pos.x, g.pos.y, g.name.replace(" ", '\n'));
        }

        // draw combos
        for (let c of this.combos.values()) {
            drawText(ctx, c.pos, c.name, 25*c.members.length, 300, c.color);
            // let average = sum.scale(1 / c.members.length);
            // c.pos.copy(average);
        }
        // done making drawings
        ctx.restore();
    }

    onResize() {
        resizeCanvas(this.ctx);
        this.redrawAll = true;
    }

    onMouseUp(worldPos: Vector2) {
        this.selected = undefined;
    }

    onMouseMove(worldPos: Vector2) {
        if (this.selected) {
            this.groovers.get(this.selected)!.pos = worldPos
            this.redrawAll = true;
        }
    }

    onMouseDown(worldPos: Vector2) {
        for (let g of this.groovers.values()) {
            if (worldPos.disTo(g.pos) < 80) {
                this.selected = g.name; 
                return;
            }
        }
    }

    // state manipulation

    foreachGroover(callback: (a: Groover, b: Groover, combo: Combo) => void) {
        let groovers = this.groovers;
        for (let groover of groovers.values()) {
            for (let i = 0; i < groover.fellowNames.length; i++) {
    
                let name = groover.fellowNames[i];
                let comboName =  groover.fellowCombo[i];
                let other = groovers.get(name)!;
    
                if (groover.name == other.name) {
                    continue;
                }
    
                // console.log(groover.name, " X ", other.name)
                if (groover.name > other.name) {
                    // console.log("NOPE");
                    continue;
                }
    
                let combo = this.combos.get(comboName)!;
                callback(groover, other, combo);
            }   
        }
    }
}

function test() {
    let a =  Vector2.new(0,0);
    let b = Vector2.new(30,40);
    lerpEdge(a,b);
    lerpEdge(a,b);
    lerpEdge(a,b);
    lerpEdge(a,b);
    lerpEdge(a,b);
    console.log(a, b);
    lerpEdge(a,b);
    console.log(a, b);
    lerpEdge(a,b);
    console.log(a, b);
    lerpEdge(a,b);
    console.log(a, b);
    lerpEdge(a,b);

    console.log(a, b);
}

function lerpEdge(a: Vector2, b: Vector2, factor=0.5, desired= 100) {
    
    let distance = a.disTo(b);
    
    let vector = b.subbed(a);
    let center = a.added(vector.scaled(0.5));

    let aCorrect = center.added(vector.normalized().scale(desired * -0.5));
    let bCorrect = center.added(vector.normalized().scale(desired *  0.5));

    a.copy(a.scaled(1-factor).add(aCorrect.scaled(factor)));
    b.copy(b.scaled(1-factor).add(bCorrect.scaled(factor)));
    
    // console.log(a, b);
}