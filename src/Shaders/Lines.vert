#version 300 es


in vec3 aPosition;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;


void main() 
{
    vec4 clipSpace = projection * view * model * vec4(aPosition, 1.0);
    gl_Position = vec4(aPosition, 1.0);
}