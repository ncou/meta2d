// import Texture from "../graphics/Texture";
import { Matrix4 } from "meta-math";

export default class Renderer
{
	constructor(gl)
	{
		this.gl = gl;
		this.extensions = {};

		this.material = null;
		this.emptyTexture = null;

		this.projectionMatrix = new Matrix4();
		this.viewMatrix = new Matrix4();
		this.modelViewMatrix = new Matrix4();
		this.normalMatrix = new Matrix4();	
		this.modelMatrix = null;

		this.setup();
	}

	setup()
	{
		const gl = this.gl;

		this.createEmptyTexture();

		gl.clearColor(0.2, 0.2, 0.2, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);	
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

		// extensions:
		this.extension("EXT_sRGB");
		this.extension("OES_texture_float");
		this.extension("OES_texture_float_linear");
	}

	createEmptyTexture()
	{
		const gl = this.gl;

		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		canvas.width = 16;
		canvas.height = 16;
		ctx.fillStyle = "#00ff00";
		ctx.fillRect(0, 0, 16, 16);
		this.emptyTexture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.emptyTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);		
	}

	update(tDelta)
	{

	}

	render(tDelta)
	{
		const gl = this.gl;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	draw(drawCmd, modelMatrix)
	{
		const gl = this.gl;
		const material = drawCmd.material;
		const mesh = drawCmd.mesh;

		this.modelMatrix = modelMatrix;

		this.setMaterial(material);
		this.updateUniforms(drawCmd);
		this.updateAttribs(drawCmd);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
		gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);	
	}

	updateAttribs(drawCmd)
	{
		const gl = this.gl;
		const attribs = drawCmd.material.attribData;
		const mesh = drawCmd.mesh;

		for(let n = 0; n < attribs.length; n++) 
		{
			const attrib = attribs[n];

			switch(attrib.name)
			{
				case "position":
					gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
					gl.vertexAttribPointer(attrib.loc, 3, gl.FLOAT, false, 0, 0);
					break;
				
				case "uv":
					gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uvBuffer);
					gl.vertexAttribPointer(attrib.loc, 2, gl.FLOAT, false, 0, 0);
					break;

				case "normal":
					gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
					gl.vertexAttribPointer(attrib.loc, 3, gl.FLOAT, false, 0, 0);
					break;	
			}
		}
	}

	updateUniforms(drawCmd)
	{
		const gl = this.gl;
		const material = drawCmd.material
		const uniforms = material.uniformData;

		let numSamplers = 0;

		for(let n = 0; n < uniforms.length; n++) 
		{
			const uniform = uniforms[n];

			switch(uniform.type)
			{
				case gl.FLOAT_MAT4:
				{
					let matrix;

					switch(uniform.name) 
					{
						case "matrixProjection":
							matrix = this.projectionMatrix;
							break;
						case "matrixView":
							matrix = this.viewMatrix;
							break;
						case "matrixModel": 
							matrix = this.modelMatrix;
							break;
						default:
							matrix = material._uniforms[uniform.name];
							break;
					}

					if(!matrix) {
						console.warn(`(Renderer.updateUniforms) Invalid FLOAT_MAT4 uniform "${uniform.name}" for: ${material.constructor.name}`);
					}
					else {
						gl.uniformMatrix4fv(uniform.loc, false, matrix.m);
					}
				} break;

				case gl.SAMPLER_2D:
				{
					gl.activeTexture(gl.TEXTURE0 + numSamplers);

					const texture = material._uniforms[uniform.name];
					if(!texture) {
						gl.bindTexture(gl.TEXTURE_2D, this.emptyTexture);
					}
					else {
						gl.bindTexture(gl.TEXTURE_2D, texture.instance);
					}

					gl.uniform1i(uniform.loc, numSamplers++);
				} break;

				case gl.FLOAT:
					gl.uniform1f(uniform.loc, material._uniforms[uniform.name]);
					break;
			}
		}
	}

	setMaterial(material)
	{
		const gl = this.gl;
		const currNumAttribs = this.material ? this.material.numAttribs : 0;
		const newNumAttribs = material.numAttribs;

		if(currNumAttribs < newNumAttribs) 
		{
			for(let n = currNumAttribs; n < newNumAttribs; n++) {
				gl.enableVertexAttribArray(n);
			}
		}
		else
		{
			for(let n = newNumAttribs; n < currNumAttribs; n++) {
				gl.disableVertexAttribArray(n);
			}
		}

		this.material = material;
		gl.useProgram(material.program);

		if(material.needUpdate) {
			material.update();
		}
	}	

	resize(width, height) {
		this.projectionMatrix.perspective(0.7853981634, width / height, 0.01, 100.0);	
	}

	extension(id) 
	{
		let ext = this.extensions[id];
		if(!ext) {
			ext = this.gl.getExtension(id);
			this.extensions[id] = ext;
		}

		return ext;
	}
}