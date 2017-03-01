precision mediump float;

varying vec3 varNormal;

import envmap.glsl
import gamma.glsl

void main() {
	gl_FragColor = toGamma(envMap(varNormal));
}
