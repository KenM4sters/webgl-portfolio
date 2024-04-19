#version 300 es
precision highp float;

out vec4 FragColor;

in vec3 model_pos;
in vec3 vNormal;
in vec2 vUV;

void main() 
{
    FragColor = vec4(1.0, 0.5, 0.0, 1.0);
}