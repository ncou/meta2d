precision mediump float;

import gamma.glsl

uniform sampler2D albedo;

varying vec2 var_uv;

void main() {
	gl_FragColor = toGamma(texture2D(albedo, var_uv))
}