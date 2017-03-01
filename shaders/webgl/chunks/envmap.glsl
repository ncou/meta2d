#ifdef CUBEMAP
	uniform samplerCube envmap;

	vec4 envMap(vec3 normal) 
	{
		vec3 envmapUV = vec3(normal.x, -1.0 * normal.y, normal.z);
		return textureCube(envmap, normalize(envmapUV));
	}
#else
	uniform sampler2D envmap;

	#define PI 3.1415926
	#define PI2 (2.0 * PI)

	vec2 envMapEquirect(vec3 normal) 
	{
		float phi = acos(-normal.y);
		float theta = atan(-1.0 * normal.x, normal.z) + PI;
		return vec2(theta / PI2, phi / PI);
	}

	vec4 envMap(vec3 normal) 
	{
		return texture2D(envmap, envMapEquirect(normalize(normal)));
	}
#endif