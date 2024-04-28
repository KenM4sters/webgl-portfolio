#version 300 es

in vec3 aPosition;
in vec3 aNormal;
in vec2 aUV;

out vec3 vModelPosition;
out vec3 vNormal;
out vec2 vUV;

uniform mat4 model;

void main() {
    vModelPosition = vec3(model * vec4(aPosition, 1.0)); 
    vNormal = mat3(transpose(inverse(model))) * aNormal;  
    vUV = aUV;
    gl_Position = vec4(vModelPosition, 1.0);
}