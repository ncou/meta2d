import { registerType, Material } from "../resources/resources";

registerType(SubstanceMaterial, (mgr) => {
	return new SubstanceMaterial(mgr.gl);
});

const shaderPrepend = `
precision mediump float;

varying vec3 varPosition;
varying vec2 varTexCoord;
varying vec3 varNormal;

const float gamma = 2.2;

float toGamma(float v) {
  return pow(v, 1.0 / gamma);
}

vec2 toGamma(vec2 v) {
  return pow(v, vec2(1.0 / gamma));
}

vec3 toGamma(vec3 v) {
  return pow(v, vec3(1.0 / gamma));
}

vec4 toGamma(vec4 v) {
  return vec4(toGamma(v.rgb), v.a);
}

struct V2F {
	vec3 normal;               // interpolated normal
	vec3 tangent;              // interpolated tangent
	vec3 bitangent;            // interpolated bitangent
	vec3 position;             // interpolated position
	vec4 color[1];             // interpolated vertex colors (color0)
	vec2 tex_coord;            // interpolated texture coordinates (uv0)
	vec2 multi_tex_coord[8];   // interpolated texture coordinates (uv0-uv7)
};
`;

const shaderAppend = `
void main() {
	V2F inputs;
	inputs.color[0] = vec4(1.0, 1.0, 0.0, 1.0);
	inputs.position = varPosition;
	inputs.tex_coord = varTexCoord;
	inputs.normal = varNormal;

	gl_FragColor = toGamma(shade(inputs));
}
`;

class SubstanceMaterial extends Material
{
	constructor(gl, cfg) {
		super(gl, cfg);
	}

	compileShader(type, shader)
	{
		const gl = this.gl;
		const instance = gl.createShader(type);

		let src = shader.src;

		if(type === gl.FRAGMENT_SHADER) {
			src = shaderPrepend + src + shaderAppend;
		}

		gl.shaderSource(instance, src);
		gl.compileShader(instance);

		const success = gl.getShaderParameter(instance, gl.COMPILE_STATUS)
		if(!success) {
			console.warn("(Shader.compile) [" + this.getStrShaderType(type) + ":" + shader.path + "] " + gl.getShaderInfoLog(instance));
			return null;
		}

		return instance;
	}
}