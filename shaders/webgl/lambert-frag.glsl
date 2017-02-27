precision mediump float;

import gamma.glsl

uniform vec3 lightColor;
uniform sampler2D albedo;

varying vec3 varEyePosition;
varying vec2 varUV;
varying vec3 varNormal;
varying vec3 varLightPosition;

void main()
{
	vec3 N = normalize(varNormal);
	vec3 L = normalize(varLightPosition - varEyePosition);

	float diffuse = max(0.0, dot(L, N));

	vec3 _lightColor = lightColor;
	vec4 baseColor = texture2D(albedo, varUV);

	vec4 finalColor = vec4(baseColor.rgb * diffuse, 1.0);
	gl_FragColor = toGamma(finalColor);
}