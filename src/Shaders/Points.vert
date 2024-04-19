#version 300 es

in vec3 aPosition;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main() 
{
    vec4 clipPos = projection * view * vec4(aPosition, 1.0);
    gl_Position = clipPos;
    gl_PointSize = 10.0 / length(clipPos.xyz);
}