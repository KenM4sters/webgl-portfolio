#version 300 es
precision highp float;

out vec4 FragColor;

uniform sampler2D spriteSheet;

void main() 
{
    FragColor = vec4(10.0, 0.1, 0.1, 1.0);
}