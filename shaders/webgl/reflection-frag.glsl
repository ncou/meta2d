precision mediump float;

uniform mat4 matrixInverseView;
uniform samplerCube envmap;

varying vec3 varEyePosition;
varying vec3 varNormal;

vec3 envMapCube(vec3 normal) {
    return vec3(-1.0 * normal.x, normal.y, normal.z);
}

void main()
{
	vec3 eyeDirection = normalize(-varEyePosition);
	vec3 worldEyeDirection = vec3(matrixInverseView * vec4(eyeDirection, 0.0));
	vec3 normal = vec3(matrixInverseView * vec4(varNormal, 0.0));

	vec3 reflectionWorld = reflect(-worldEyeDirection, normalize(varNormal));

	gl_FragColor = textureCube(envmap, envMapCube(reflectionWorld));
}