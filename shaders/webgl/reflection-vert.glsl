attribute vec4 position;
attribute vec4 normal;

uniform mat4 matrixProjection;
uniform mat4 matrixView;
uniform mat4 matrixModel;
uniform mat4 matrixNormal;

varying vec3 varEyePosition;
varying vec3 varNormal;

void main()
{
	vec4 eyePosition = matrixView * matrixModel * position;
	varEyePosition = vec3(eyePosition);
	varNormal = vec3(matrixNormal * normal);
	gl_Position = matrixProjection * eyePosition;
}