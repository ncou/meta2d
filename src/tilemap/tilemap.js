import Layer from "./layer";
import Geometry from "../geometry";
import Vector2 from "../math/vector2";

const verts = [
	-1, -1, 0,
	1, -1, 0,
	1, 1, 0,
	-1, 1, 0
];

const uv = [
	0, 1,
	1, 1,
	1, 0,
	0, 0
];

const indices = [
	0, 1, 2, 0, 2, 3
];

export default class Tilemap
{
	constructor(ctx, spritesheet, tileSize, tileScale) 
	{
		this.ctx = ctx;
		this.material = ctx.getResource("tilemapMaterial");

		this.layers = [];
		this.spritesheet = ctx.getResources(spritesheet);
		this.tileSize = tileSize || 16;
		this.tileScale = tileScale || 1;

		this.viewportSize = new Vector2();

		this.geometry = new Geometry(ctx.gl, verts, indices, uv);
	}

	createLayer(texture) 
	{
		const layer = new Layer(texture);
		this.layers.push(layer);
		return layer;
	}

	draw(ctx)
	{
		ctx.setMaterial(this.material);

		this.viewportSize.set(ctx.window.width * this.tileScale, ctx.window.height * this.tileScale);

		for(let n = 0; n < this.layers.length; n++) {
			const layer = this.layers[n];
		}
	}
}