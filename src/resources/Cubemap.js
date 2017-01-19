import Resource from "./Resource.js";

export default class Cubemap extends Resource
{
	constructor(ctx, cfg)
	{
		this.ctx = ctx;
		this._images = new Array(6);
		
		this._repeat = false;
		this._minFilter = 0;
		this._magFilter = 0;
		this._format = 0;
		this._width = 0;
		this._height = 0

		this.numToLoad = 0;

		this.clear();

		super(cfg);
	}

	clear() 
	{
		this._width = 0;
		this._height = 0;

		if(this.texture) {
			this.ctx.deleteTexture(this.texture);
			this.texture = null;
		}

		for(let n = 0; n < this._images.length; n++) {
			this._images[n] = null;
		}
	}

	load(cfg)
	{
		if(!cfg) { return; }

		if(cfg instanceof Array) {
			this.images = cfg;
		}
		else 
		{
			for(const key in cfg) {
				this[key] = cfg[key];
			}
		}
	}

	handleLoadedImage(image) 
	{
		this._width = image.width;
		this._height = image.height;

		this.numToLoad--;
		if(this.numToLoad === 0) {
			this.updateTextures();
			this.emit("load");
		}
	}

	updateTextures()
	{
		if(!this.texture) {
			this.texture = this.ctx.createTexture();
		}

		const gl = this.ctx;

		this._repeat = (this.cfg && this.cfg.repeat) || false;
		this._minFilter = (this.cfg && this.cfg.minFilter) || gl.LINEAR;
		this._magFilter = (this.cfg && this.cfg.magFilter) || gl.LINEAR;
		this._format = (this.cfg && this.cfg.format) || gl.RGBA;

		const wrapType = this._repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;

		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, this._magFilter);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, this._minFilter);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, wrapType);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, wrapType);

		for(let n = 0; n < 6; n++) 
		{
			const image = this._images[n];
			const target = gl.TEXTURE_CUBE_MAP_POSITIVE_X + n;

			if(!image) 
			{
				gl.texImage2D(target, 0, this._format, this._width, this._height, 
					0, this._format, gl.UNSIGNED_BYTE, null);
			}
			else 
			{
				gl.texImage2D(target, 0, this._format, this._format, gl.UNSIGNED_BYTE, image);
			}
		}

		this.needUpdate = false;
	}

	set images(imageSources) 
	{
		this.loaded = false;
		this.loading = true;
		this.numToLoad = 0;

		for(let n = 0; n < imageSources.length; n++) 
		{
			const imageSource = imageSources[n];
			let image = this._images[n];
			if(!image) {
				image = new Image();
				image.onload = () => {
					this.handleLoadedImage(image);
				};
				image.onerror = () => {
					this._images[n] = null;
					this.handleLoadedImage(image);
				}
				this._images[n] = image;
			}

			this.numToLoad++;
			image.src = imageSource;
		}
	}

	get repeat() {
		return this._repeat;
	}

	get minFilter() {
		return this._minFilter;
	}

	get maxFilter() {
		return this._maxFilter;
	}

	get format() {
		return this._format;
	}

	get width() {
		return this._width;
	}

	get height() {
		return this._height;
	}
}
