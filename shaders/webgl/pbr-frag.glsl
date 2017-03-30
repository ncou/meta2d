precision mediump float;

uniform vec3 albedo;
uniform float metallic;
uniform float roughness;
uniform float ao;
uniform vec3 camPos;

uniform vec3 lightPositions[4];
uniform vec3 lightColors[4];

varying vec2 TexCoords;
varying vec3 WorldPos;
varying vec3 Normal;

#define PI 3.1415926

float calculateSpecularComponent() {
	return 0.0;
}

float DistributionGGX(vec3 N, vec3 H, float roughness)
{
    float a      = roughness * roughness;
    float a2     = a * a;
    float NdotH  = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;
	
    float nom   = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;
	
    return nom / denom;
}

float GeometrySchlickGGX(float NdotV, float roughness)
{
	float r = (roughness + 1.0);
	float k = (roughness * roughness) / 8.0;

	float nom = NdotV;
	float denom = NdotV * (1.0 - k) + k; 
	return nom / denom;
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)
{
	float NdotV = max(dot(N, V), 0.0);
	float NdotL = max(dot(N, L), 0.0);
	float ggx1 = GeometrySchlickGGX(NdotV, roughness);
	float ggx2 = GeometrySchlickGGX(NdotL, roughness);
	return ggx1 * ggx2;
}

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
	return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

void main()
{
	vec3 N = normalize(Normal);
	vec3 V = normalize(camPos - WorldPos);

	vec3 Lo = vec3(0.0);
	for(int i = 0; i < 4; i++)
	{
		vec3 L = normalize(lightPositions[i] - WorldPos);
		vec3 H = normalize(V + L);

		float distance = length(lightPositions[i] - WorldPos);
		float attenuation = 1.0 / (distance * distance);
		vec3 radiance = lightColors[i] * attenuation;

		vec3 F0 = vec3(0.04);
		F0 = mix(F0, albedo, metallic);
		vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);

		float NDF = DistributionGGX(N, H, roughness);
		float G = GeometrySmith(N, V, L, roughness);

		vec3 nominator = NDF * G * F;
		float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.001;
		vec3 brdf = nominator / denominator;
	}

	// vec3 lightColor = vec3(23.47f, 21.31f, 20.79f);
	// vec3 wi = normalize(lightPos - fragWorldPos);
	// float cosTheta = max(dot(n, wi), 0.0);
	// float attenuation = calculateAttenuation(fragWorldPos, lightPos);
	// float radiance = lightColor * attenuation * cosTheta;

	float kS = calculateSpecularComponent();
	float kD = 1.0 - kS;

	gl_FragColor = vec4(1.0);
}