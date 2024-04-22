#version 300 es
in vec3 aPos;

uniform mat4 projection;
uniform mat4 view;

out vec3 vLocalPos;

void main()
{
    vLocalPos = aPos;

    // Conversion from mat4 to mat3 effectively removes the translation vector 
    // from the view matrix, so if we move the camera forward, so will the environment.
    mat4 rotView = mat4(mat3(view)); 
    vec4 clipPos = projection * rotView * vec4(vLocalPos, 1.0);

    gl_Position = clipPos.xyww;
}