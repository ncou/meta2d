precision mediump float;

varying vec3 varNormal;

import envmap.glsl
import gamma.glsl
import tonemap.glsl

void main() {
	vec4 color = envMap(varNormal);
	color.rgb = tonemap(color.rgb);
	gl_FragColor = toGamma(color);
}
