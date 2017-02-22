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

	vec3 _lightColor = toLinear(lightColor);
	vec4 baseColor = texture2D(albedo, varUV  * vec2(3.0, 2.0));
	baseColor.rgb = toLinear(baseColor.rgb);	

	vec4 finalColor = vec4(baseColor.rgb * diffuse, 1.0);
	gl_FragColor = toGamma(finalColor);
}