#version 300 es
precision highp float;

out vec4 FragColor;

in vec3 vWorldPosition;
in vec3 vNormal;
in vec2 vUV;

uniform sampler2D spriteSheet;

void main() 
{
    vec3 texColor = texture(spriteSheet, vUV).rgb;

    if(texColor.r < 0.05) 
    {
        discard;
    } FragColor = vec4(texColor, 1.0);

}