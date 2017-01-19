import Resource from "./Resource";
import { parseHDR } from "../loaders/hdr";
import fetchContent from "../utils/FetchContent";

export default class HDR extends Resource 
{
	constructor(ctx, cfg) 
	{
		this.ctx = ctx;
		this.texture = ctx.createTexture();
		super(cfg);
	}

	load(cfg)
	{
		this.loaded = false;
		this.loading = true;

		fetchContent(cfg, (content) => {
			this.loadFromHDR(content);
		}, "arraybuffer");
	}

	loadFromHDR(hdrInfo)
	{
		const result = parseHDR(hdrInfo);
		const gl = this.ctx;

		gl.bindTexture(gl.TEXTURE_2D, this.texture);
	
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, result.width, result.height, 0, gl.RGBA, gl.FLOAT, result.data);		

		this.loaded = true;
		this.loading = false;
		this.emit("load");		
	}
}
