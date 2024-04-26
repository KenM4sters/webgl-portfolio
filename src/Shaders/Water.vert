#version 300 es

in vec3 aPosition;
in vec3 aNormal;
in vec2 aUV;

out vec3 vWorldPosition;
out mat3 vNormalMatrix;
out vec2 vUV;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main() {
    vWorldPosition = vec3(model * vec4(aPosition, 1.0)); 
    vNormalMatrix = mat3(transpose(inverse(model)));  
    vUV = aUV;
    gl_Position = projection * view * model * vec4(aPosition, 1.0);
}