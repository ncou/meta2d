import DebugMaterial from "../materials/DebugMaterial";
import Texture from "../graphics/Texture";
// import Camera from "../scene/Camera";
import { Vector2, Vector3, Matrix4 } from "meta-math";
import RenderState from "./RenderState"

export default class Renderer
{
	constructor(gl)
	{
		this.gl = gl
		this.extensions = {}

		this.material = null
		this.texture = null
		this.emptyMaterial = null
		this.emptyTexture = null
		this.emptyMatrix = new Matrix4()
		this.emptyVec2 = new Vector2()
		this.emptyVec3 = new Vector3()

		this.matrixEmpty = new Matrix4()
		this.matrixProjection = new Matrix4()
		this._matrixView = this.matrixEmpty
		this.matrixInverseView = new Matrix4()
		this.matrixNormal = new Matrix4()
		this.matrixModel = null

		this.matrixDirty_view = true
		this.matrixDirty_normal = true
		
		// this.camera = new Camera();
	}

	setup()
	{
		const gl = this.gl;

		this.emptyMaterial = new DebugMaterial()
		this.createEmptyTexture()
		this.createEmptyCubeMap()

		this.state = new RenderState(gl)
		this.state.depthTest = true

		gl.clearColor(0.3, 0.3, 0.3, 1.0);
		gl.depthFunc(gl.LEQUAL);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.enable(gl.BLEND);
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		// gl.enable(gl.CULL_FACE)
		// gl.cullFace(gl.FRONT)

		// extensions:
		this.extension("EXT_sRGB");
		this.extension("OES_texture_float");
		this.extension("OES_texture_float_linear");
	}

	createEmptyTexture()
	{
        const gl = this.gl
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = 2
        canvas.height = 2
        ctx.fillStyle = "#00ff00"
        ctx.fillRect(0, 0, 16, 16)
        this.emptyTexture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, this.emptyTexture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	}

	createEmptyCubeMap()
	{
		const gl = this.gl
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = 2
        canvas.height = 2
        ctx.fillStyle = "#00ff00"
        ctx.fillRect(0, 0, 16, 16)
        this.emptyCubeMap = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.emptyCubeMap)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

        for(let n = 0; n < 6; n++)
        {
            const target = gl.TEXTURE_CUBE_MAP_POSITIVE_X + n
            gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
        }		
	}

	update(tDelta)
	{

	}

	render(tDelta)
	{
		const gl = this.gl;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	draw(mesh, material, matrixModel)
	{
		const gl = this.gl

		this.matrixModel = matrixModel || this.matrixEmpty

		this.setMaterial(material)
		this.updateUniforms(material)
		this.updateAttribs(material, mesh)

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer)
		gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
	}

	updateAttribs(material, mesh)
	{
		const gl = this.gl
		const attribs = material.attribData

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

	updateUniforms(material)
	{
		const gl = this.gl
		const uniforms = material.uniformData

		let numSamplers = 0

		for(let n = 0; n < uniforms.length; n++)
		{
			const uniform = uniforms[n]

			switch(uniform.type)
			{
				case gl.FLOAT_MAT4:
				{
					let matrix

					switch(uniform.name)
					{
						case "matrixProjection":
							matrix = this.matrixProjection
							break

						case "matrixView":
							matrix = this._matrixView
							break

						case "matrixModel":
							matrix = this.matrixModel
							break

						case "matrixNormal":
						{
							if(this.matrixDirty_normal) {
								this.matrixNormal.copy(this._matrixView)
								this.matrixNormal.inverse()
								this.matrixNormal.transpose()
								this.matrixDirty_normal = false
							}

							matrix = this.matrixNormal
						} break

						case "matrixInverseView":
						{
							if(this.matrixDirty_InverseView) {
								this.matrixInverseView.copy(this._matrixView)
								this.matrixInverseView.inverse()
								this.matrixDirty_InverseView = false
							}

							matrix = this.matrixInverseView
						} break
							
						default:
							matrix = material._uniforms[uniform.name]
							break
					}

					if(!matrix) {
						gl.uniformMatrix4fv(uniform.loc, false, this.matrixEmpty.m)
					}
					else {
						gl.uniformMatrix4fv(uniform.loc, false, matrix.m)
					}
				} break

				case gl.FLOAT_VEC2:
				{
					const vec2 = material._uniforms[uniform.name];
					if(!vec2) {
						gl.uniform2fv(uniform.loc, this.emptyVec2.toFloat32Array());
					}
					else {
						gl.uniform2fv(uniform.loc, vec2.toFloat32Array());
					}
				} break;

				case gl.FLOAT_VEC3:
				{
					const vec3 = material._uniforms[uniform.name];
					if(!vec3) {
						gl.uniform3fv(uniform.loc, this.emptyVec3.toFloat32Array());
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
						gl.bindTexture(gl.TEXTURE_2D, texture.handle);
					}

					gl.uniform1i(uniform.loc, numSamplers++);
				} break

                case gl.SAMPLER_CUBE:
                {
                    gl.activeTexture(gl.TEXTURE0 + numSamplers)

                    const cubemap = material._uniforms[uniform.name]
                    if(!cubemap) {
                        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.emptyCubeMap)
                    }
                    else {
                        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemap.handle)
                    }

                    gl.uniform1i(uniform.loc, numSamplers++)
                } break

				case gl.FLOAT:
					gl.uniform1f(uniform.loc, material._uniforms[uniform.name]);
					break;
			}
		}
	}

	setMaterial(material)
	{
		if(this.material !== material)
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

            if(this.state.depthTest !== material.depthTest) {
                this.state.depthTest = material.depthTest
			}
            if(this.state.cullFace !== material.cullFace) {
                this.state.cullFace = material.cullFace
			}

			this.material = material
			gl.useProgram(material.program)
		}

		if(material.needUpdate) {
			material.update()
		}

		return material;
	}

	set matrixView(matrix) {
		this._matrixView = matrix || this.matrixEmpty
		this.matrixDirty_normal = true
		this.matrixDirty_inverseView = true
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
		this.matrixProjection.perspective(0.7853981634, width / height, 0.01, 100.0);
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