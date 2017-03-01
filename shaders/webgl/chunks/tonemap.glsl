#define TONEMAP_UNCHARTED2 1
#define TONEMAP_REINHARD 2
#define TONEMAP_FILMIC 3

uniform float exposure;

#if TONEMAP == TONEMAP_UNCHARTED2
	float A = 0.15;
	float B = 0.50;
	float C = 0.10;
	float D = 0.20;
	float E = 0.02;
	float F = 0.30;
	float W = 11.2;

	vec3 uncharted2(vec3 x) {
		return ((x * (A * x + C * B) + D * E) / (x * (A * x + B) + D * F)) - E / F;
	}

	vec3 tonemap(vec3 color)
	{
		color *= exposure;

		float ExposureBias = 2.0;
		vec3 curr = uncharted2(ExposureBias * color);

		vec3 whiteScale = 1.0 / uncharted2(vec3(W));
		return curr * whiteScale;
	}
#elif TONEMAP == TONEMAP_REINHARD
	vec3 tonemap(vec3 color) {
		color *= exposure;
		color = color / (color + vec3(1.0));
		return color;
	}
#elif TONEMAP == TONEMAP_FILMIC
	vec3 tonemap(vec3 color) {
		color *= exposure;
		vec3 x = max(vec3(0.0), color - 0.004);
		return (x * (6.2 * x + 0.5)) / (x * (6.2 * x + 1.7) + 0.06);
	}
#else
	vec3 tonemap(vec3 color) {
		color *= exposure;
		return color;
	}
#endif