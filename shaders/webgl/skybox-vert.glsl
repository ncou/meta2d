attribute vec4 position;

uniform mat4 matrixInverseProjection;
uniform mat4 matrixTransposeView;

varying vec3 varNormal;

void main()
{
    vec4 unprojected = matrixInverseProjection * position;
    varNormal = (matrixTransposeView * unprojected).xyz;

    gl_Position = position;
}