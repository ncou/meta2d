precision mediump float;

varying vec3 varNormal;

uniform samplerCube envmap;

vec3 envMapCube(vec3 normal) {
    return vec3(-1.0 * normal.x, normal.y, normal.z);
}

void main() {
	gl_FragColor = textureCube(envmap, envMapCube(normalize(varNormal)));
}
