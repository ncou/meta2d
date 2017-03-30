attribute vec4 position;
attribute vec2 uv;
attribute vec3 normal;

uniform mat4 matrixProjection;
uniform mat4 matrixView;
uniform mat4 matrixModel;

varying vec2 TexCoords;
varying vec3 WorldPos;
varying vec3 Normal;

void main() 
{
	TexCoords = uv;
	WorldPos = vec3(matrixModel * position);
	Normal = mat3(matrixModel) * normal;

	gl_Position = matrixProjection * matrixView * vec4(WorldPos, 1.0);
}