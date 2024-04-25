#version 300 es
precision highp float;

struct Camera 
{
    vec3 Position;
};

struct Light 
{
    vec3 Position;
    vec3 Color;
    float Intensity;
};

out vec4 FragColor;

in vec3 vWorldPosition;
in vec3 vNormal;
in vec2 vUV;

uniform float time;
uniform vec3 cameraPosition;
uniform vec3 sunPosition;
uniform vec3 sunColor;
uniform float sunIntensity;
uniform sampler2D reflectionTex;
uniform sampler2D refractionTex;
uniform sampler2D normalMap;

const float PI = 3.14159265359;

// ----------------------------------------------------------------------------
vec3 FresnelSchlick(float cosTheta, vec3 F0)
{
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}
// ----------------------------------------------------------------------------

vec4 GetNoise(vec2 uv){
    vec2 uv0 = (uv/103.0)+vec2(time/17.0, time/29.0);
    vec2 uv1 = uv/107.0-vec2(time/-19.0, time/31.0);
    vec2 uv2 = uv/vec2(897.0, 983.0)+vec2(time/101.0, time/97.0);
    vec2 uv3 = uv/vec2(991.0, 877.0)-vec2(time/109.0, time/-113.0);
    vec4 noise = (texture(normalMap, uv0)) +
                 (texture(normalMap, uv1)) +
                 (texture(normalMap, uv2)) +
                 (texture(normalMap, uv3));
    return noise*0.5-1.0;
}

void main() {
    // vec3 reflection = texture(reflectionTex, vUV).rgb;
    // vec3 refraction = texture(refractionTex, vUV).rgb;
    // vec3 blackRefraction = vec3(0.0, 0.0, 0.1);

    vec3 normal = texture(normalMap, vUV).rgb;
    vec3 N = normalize(normal);

    vec3 diffuse = vec3(0.0);
    vec3 specular = vec3(0.0);

    vec3 cameraDir = cameraPosition - vWorldPosition;
    vec3 D = normalize(cameraDir);

    float shiny = 100.0;
    float spec = 2.0;
    float dif = 0.5;

    vec3 sunDirection = normalize(sunPosition - vWorldPosition);
    vec3 reflection = normalize(reflect(-sunDirection, normal));
    float direction = max(0.0, dot(cameraDir, reflection));
    specular += pow(direction, shiny)*sunColor*spec;
    diffuse += max(dot(sunDirection, normal),0.0)*sunColor*dif;

    vec3 final = diffuse + specular + vec3(0.1) * vec3(0.3, 0.5, 0.9);

    FragColor = vec4(final, 1.0);

}