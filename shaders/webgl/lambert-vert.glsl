attribute vec4 position;
attribute vec4 normal;

uniform mat4 matrixProjection;
uniform mat4 matrixView;
uniform mat4 matrixModel;
uniform mat4 matrixNormal;
uniform vec3 lightPosition;

varying vec3 varEyePosition;
varying vec3 varNormal;
varying vec3 varLightPosition;

void main() 
{
	vec4 eyePosition = matrixView * matrixModel * position;

	varEyePosition = eyePosition.xyz;
	varNormal = vec3(matrixNormal * normal);
	varLightPosition = vec3(matrixView * matrixModel * vec4(lightPosition, 1.0));
	
	gl_Position = matrixProjection * eyePosition;
}