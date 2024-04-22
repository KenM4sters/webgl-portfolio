#version 300 es
precision highp float;

out vec4 FragColor;

in vec3 model_pos;
in vec3 vNormal;
in vec2 vUV;

uniform vec3 bottomColor;
uniform vec3 topColor;

void main() 
{
    vec3 color = mix(bottomColor, topColor, clamp(model_pos.y-10.0, 0.0, 1.0));
    FragColor = vec4(color, 1.0);
}