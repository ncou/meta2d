precision mediump float;

uniform mat4 matrixInverseView;

varying vec3 varEyePosition;
varying vec3 varNormal;

import envmap.glsl
import gamma.glsl

void main()
{
	vec3 eyeDirection = normalize(-varEyePosition);
	vec3 worldEyeDirection = vec3(matrixInverseView * vec4(eyeDirection, 0.0));
	vec3 normal = vec3(matrixInverseView * vec4(varNormal, 0.0));

	vec3 reflectionWorld = reflect(-worldEyeDirection, normalize(normal));

	gl_FragColor = toGamma(envMap(reflectionWorld));
}