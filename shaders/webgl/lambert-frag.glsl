precision mediump float;

import gamma.glsl

varying vec3 varEyePosition;
varying vec3 varNormal;
varying vec3 varLightPosition;

void main()
{
	vec3 N = normalize(varNormal);
	vec3 L = normalize(varLightPosition - varEyePosition);

	float diffuseIntensity = max(0.0, dot(L, N));
	vec4 baseColor = toLinear(vec4(1.0));
	vec4 lightColor = toLinear(vec4(1.0));
	vec4 finalColor = vec4(baseColor.rgb * lightColor.rgb * diffuseIntensity, 1.0);
	
	gl_FragColor = toGamma(finalColor);
}