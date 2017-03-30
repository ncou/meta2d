attribute vec4 position;
attribute vec3 normal;
attribute vec2 uv;

uniform mat4 matrixProjection;
uniform mat4 matrixView;
uniform mat4 matrixModel;
uniform mat3 matrixNormal;
uniform vec3 lightPos;

varying vec2 varUV;
varying vec3 varNormal;
varying vec3 varFragmentPos;
varying vec3 varLightPos;

void main()
{
	vec4 eyePosition = matrixView * matrixModel * position;

	varUV = uv;
	varNormal = matrixNormal * normal;
	varFragmentPos = vec3(eyePosition);
	varLightPos = vec3(matrixView * vec4(lightPos, 1.0));
	
	gl_Position = matrixProjection * eyePosition;
}
