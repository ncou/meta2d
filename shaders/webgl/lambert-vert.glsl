attribute vec4 position;
attribute vec3 normal;

uniform mat4 matrixProjection;
uniform mat4 matrixView;
uniform mat4 matrixModel;
uniform mat3 matrixNormal;
uniform vec3 lightPos;

varying vec3 varNormal;
varying vec3 varFragmentPos;
varying vec3 varLightPos;

void main()
{
	vec4 eyePosition = matrixView * matrixModel * position;
	varFragmentPos = vec3(eyePosition);
	varNormal = matrixNormal * normal;
	varLightPos = vec3(matrixView * vec4(lightPos, 1.0));
	gl_Position = matrixProjection * eyePosition;
}
