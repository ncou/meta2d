attribute vec4 position;

uniform mat4 matrixProjection;
uniform mat4 matrixView;
uniform mat4 matrixModel;

void main() {
	gl_Position = matrixProjection * matrixView * matrixModel * position;
}