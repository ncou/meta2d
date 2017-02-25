precision mediump float;

import gamma.glsl

uniform sampler2D map;

varying vec2 var_uv;

void main() {
	gl_FragColor = toGamma(texture2D(map, var_uv))
}