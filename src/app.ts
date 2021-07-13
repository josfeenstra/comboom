import { Domain, Domain2, InputState, Vector2 } from "geon-engine";
import { Random } from "geon-engine/build/math/random";
import { CtxCamera } from "./ctx/ctx-camera";
import { CTX, resizeCanvas } from "./ctx/ctx-helpers";
import {
	drawCircle,
	drawLink,
	drawLinks,
	fillMultilineText,
	preDrawText,
	strokeMultilineText,
} from "./drawings";

export let EXPAND_AGRESSION = 5000;

// @ts-ignore
window.setExpandAggression = (v: number) => EXPAND_AGRESSION = v;

export class Groover {
	constructor(
		public pos: Vector2,
		public name: string,
		public fellowNames: string[],
		public fellowCombo: string[]
	) {}

	static new(pos: Vector2, name: string) {
		return new Groover(pos, name, [], []);
	}
}

//
export class Combo {
	constructor(
		public name: string,
		public members: string[],
		public color: string,
		public pos: Vector2,
		public vector: Vector2
	) {}

	static new(name: string, members: string[], color: string) {
		return new Combo(name, members, color, Vector2.zero(), Vector2.zero());
	}
}

export class ComboomApp {
	// draw logic
	redrawAll = true;

	// state
    // NOTE: this datastructure is EXTREMELY inefficient. consider something else...
	groovers = new Map<string, Groover>();
	combos = new Map<string, Combo>();

	// selection state
	selected?: string = undefined;

	// controls
	collapseToCombo = true;
	stopMoving = false;

	protected constructor(
		protected readonly canvas: HTMLCanvasElement,
		protected readonly ctx: CTX,
		protected readonly camera: CtxCamera,
		protected readonly input: InputState
	) {}

	static new(canvas: HTMLCanvasElement, ui: HTMLDivElement) {
		// the interlocked ingredients we need for a functional app
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			alert("Canvas Rendering not supported in your browser. Try upgrading or switching!");
			return undefined;
		}
		const camera = CtxCamera.new(ctx.canvas, Vector2.new(-100, -100), 1);
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
		};
		this.camera.onMouseUp = (worldPos: Vector2) => {
			this.onMouseUp(worldPos);
		};
		this.camera.pos = Vector2.new(this.canvas.width * -0.5, this.canvas.height * -0.5);
		this.camera.scale = 0.4;
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
	ticks = 0;
	update(dt: number) {
		

		
		this.input.preUpdate(dt);
		let redraw = this.camera.update(this.input);
		if (redraw) {
			this.redrawAll = true;
		}

		this.updateControls();

		// mouse
		this.onMouseMove(this.camera.mousePos);

		if (!this.stopMoving) {
			this.updateGroovers();
            this.updateGrooversAndCombos();
            this.redrawAll = true;
		}

		this.input.postUpdate();

		// automatically collapse after a while
		this.ticks += 1;
		if (this.ticks > 100) {
			this.ticks = -100000000;
			EXPAND_AGRESSION = 1000;
			this.collapseToCombo = false;
		}
		this.redrawAll = true;
	}

	updateControls() {
		if (this.input.IsKeyPressed("enter")) {
			this.collapseToCombo = !this.collapseToCombo;
			console.log("collapse", this.collapseToCombo);
		}
		if (this.input.IsKeyPressed(" ")) {
			this.stopMoving = !this.stopMoving;
			console.log("stop", this.stopMoving);
		}
		if (this.input.IsKeyPressed("p")) {
			console.log("logging");
			this.log();
		}
		if (this.input.IsKeyPressed("s")) {
			console.log("making screenshot...");
			this.makeScreenshot(5000, 2500);
		}
		if (this.input.IsKeyPressed("h")) {
			this.toggleHelpPanel();
		}
	}

	toggleHelpPanel() {
		let e = document.getElementById("explanation")!;
		e.hidden = !e.hidden;
	}

	log() {
        for (let g of this.groovers.values()) {
			console.log(g);
		}
		// for (let c of this.combos.values()) {
		// 	console.log(c);
		// }
	}

	async makeScreenshot(width = 1920, height = 1080) {
		try {
			// setup a new canvas off screen, and render with it
			let off = new OffscreenCanvas(width, height);
			let ctx = off.getContext("2d")!;
			this.redrawAll = true;
			this.draw(ctx);

			// download the result
			let blob = await ctx.canvas.convertToBlob();
			const pngUrl = URL.createObjectURL(blob);
			download(pngUrl);
		} catch {
			alert(
				"screenshot uses experimental features. Your browser does not seem to support it, sorry! try using chrome"
			);
			return;
		}
	}

	updateGroovers() {
		let desired = 400;
		let factor = 0.02;
		this.foreachGroover((a, b, combo) => {
            if (combo)
			lerpEdge(a.pos, b.pos, factor, desired);
		});
	}

	updateGrooversAndCombos(internalPull = 0.1) {
		
		const falloff = Domain.new(500, 600);
		
		// get all combo centers
		for (let c of this.combos.values()) {
			let sum = Vector2.new();
			for (let m of c.members) {
				sum.add(this.groovers.get(m)!.pos);
			}
			let average = sum.scale(1 / c.members.length);
			c.pos.copy(average);
		}

		if (!this.collapseToCombo) {
			return
		} else {
			// make combos themselves move away from each other
			for (let combo of this.combos.values()) {
				let force = Vector2.new(0,0);
				let minLength = Infinity;
				for (let other of this.combos.values()) {
					if (combo.name == other.name) {
						continue;
					}

					let size = combo.members.length;
					let diff = other.pos.subbed(combo.pos);
					let length = diff.length();
					if (length < minLength) {
						minLength = length;
					}
					
					force.add(diff.normalize().scale(-1 * EXPAND_AGRESSION * (1 / length)));
				}

				
				if (minLength > falloff.t0) {
					let factor = Math.max(0, 1 - falloff.normalize(minLength));
					force.scale(factor);
				}
				combo.pos.add(force);
			}

			// make the combo center influence the members
			for (let c of this.combos.values()) {
				for (let m of c.members) {
					let pos = this.groovers.get(m)!.pos;
					pos.copy(pos.scaled(1 - internalPull).add(c.pos.scaled(internalPull)));
				}
			}
		}


	}

	draw(ctx: CTX = this.ctx) {

		// redraw everything if we moved the camera, for example
		if (!this.redrawAll) {
			return;
		}

		// prepare drawings
		let camera = this.camera;
		ctx.save();
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		camera.moveCtxToState(ctx);

		// draw links
		// this is faster on firefox...
		// drawLinks(ctx, this.groovers, this.combos);

		// this is faster in chrome...
		this.foreachGroover((a, b, combo) => {
			drawLink(ctx, a.pos, b.pos, combo.name, combo.color);
		});

		// draw circles
		for (let g of this.groovers.values()) {
			drawCircle(ctx, g.pos.x, g.pos.y, g.name.replace(" ", "\n"));
		}

		// draw combos
		let clamper = Domain.new(4, 15);
		for (let c of this.combos.values()) {
			let scale = c.members.length;
			scale = clamper.comform(scale);
			preDrawText(ctx, c.color, Math.min(25 * scale));
			ctx.strokeStyle = "white";
			ctx.lineWidth = 0.5 * scale;
			strokeMultilineText(ctx, c.pos, c.name);
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
			this.groovers.get(this.selected)!.pos = worldPos;
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
				let comboName = groover.fellowCombo[i];
				let other = groovers.get(name)!;

				if (groover.name == other.name || groover.name > other.name) {
					continue;
				}

				let combo = this.combos.get(comboName)!;
				callback(groover, other, combo);
			}
		}
	}
}

function lerpEdge(a: Vector2, b: Vector2, factor = 0.5, desired = 100) {
	let distance = a.disTo(b);

	let vector = b.subbed(a);
	let center = a.added(vector.scaled(0.5));

	let aCorrect = center.added(vector.normalized().scale(desired * -0.5));
	let bCorrect = center.added(vector.normalized().scale(desired * 0.5));

	a.copy(a.scaled(1 - factor).add(aCorrect.scaled(factor)));
	b.copy(b.scaled(1 - factor).add(bCorrect.scaled(factor)));

	// console.log(a, b);
}

async function download(dataUrl: string) {
	const a = document.createElement("a");
	a.href = dataUrl;
	a.download = "";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}
