attribute vec4 position;
attribute vec2 uv;

uniform mat4 matrixProjection;
uniform mat4 matrixView;
uniform mat4 matrixModel;

varying vec2 var_uv;

void main() {
	gl_Position = matrixProjection * matrixView * matrixModel * position;
	var_uv = uv;
}