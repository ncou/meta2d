precision mediump float;

uniform sampler2D map;

varying vec2 var_uv;

void main() {
	gl_FragColor = texture2D(map, var_uv);
}