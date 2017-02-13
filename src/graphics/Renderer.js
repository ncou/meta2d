import DebugMaterial from "../materials/DebugMaterial";
import Texture from "../graphics/Texture";
// import Camera from "../scene/Camera";
import { Vector2, Vector3, Matrix4 } from "meta-math";

export default class Renderer
{
	constructor(gl)
	{
		this.gl = gl;
		this.extensions = {};

		this.material = null;
		this.texture = null;
		this.emptyMaterial = null;
		this.emptyTexture = null;
		this.emptyMatrix = new Matrix4();
		this.emptyVec2 = new Vector2();
		this.emptyVec3 = new Vector3();

		this.projectionMatrix = new Matrix4();
		this.viewMatrix = new Matrix4();
		this.modelViewMatrix = new Matrix4();
		this.normalMatrix = new Matrix4();	
		this.modelMatrix = null;

		// this.camera = new Camera();
	}

	setup()
	{
		const gl = this.gl;

		this.emptyMaterial = new DebugMaterial();
		this.createEmptyTexture();

		gl.clearColor(0.3, 0.3, 0.3, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);	
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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
		canvas.width = 4;
		canvas.height = 4;
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

		drawCmd.material = this.setMaterial(material);
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
						gl.uniformMatrix4fv(uniform.loc, false, this.emptyMatrix.m);
					}
					else {
						gl.uniformMatrix4fv(uniform.loc, false, matrix.m);
					}
				} break;

				case gl.FLOAT_VEC2:
				{
					const vec2 = material._uniforms[uniform.name];
					if(!vec2) {
						gl.uniform2fv(uniform.loc, this.emptyVec2.v);
					}
					else {
						gl.uniform2fv(uniform.loc, vec2.toFloat32Array());
					}
				} break;

				case gl.FLOAT_VEC3:
				{
					const vec3 = material._uniforms[uniform.name];
					if(!vec3) {
						gl.uniform3fv(uniform.loc, this.emptyVec3.v);
					}
					else {
						gl.uniform3fv(uniform.loc, vec3.toFloat32Array());
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
		if(!material.loaded) {
			material = this.emptyMaterial;
		}

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

		return material;
	}

	bindTexture(texture)
	{
		if(this.texture === texture) {
			return;
		}

		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		this.texture = texture;
	}

	resize(width, height) {
		this.gl.viewport(0, 0, width, height);
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