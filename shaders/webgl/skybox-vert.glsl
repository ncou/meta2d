attribute vec4 position;

uniform mat4 matrixProjection;
uniform mat4 matrixView;
uniform mat4 matrixModel;

varying vec3 varNormal;

void main()
{
	varNormal = position.xyz;
	gl_Position = matrixProjection * matrixView * matrixModel * position;
}