#version 300 es
precision highp float;

struct Light 
{
    vec3 Position;
    vec3 Color;
    float Intensity;
};

out vec4 FragColor;

in vec3 vWorldPosition;
in mat3 vNormalMatrix;
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
float GeometrySchlickGGX(float NdotV, float roughness)
{
    float r = (roughness + 1.0);
    float k = (r*r) / 8.0;

    float nom   = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return nom / denom;
}
// ----------------------------------------------------------------------------
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)
{
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
    float ggx1 = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}

// ----------------------------------------------------------------------------
vec3 FresnelSchlick(float cosTheta, vec3 F0)
{
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
float DistributionGGX(vec3 N, vec3 H, float roughness)
{
    float a = roughness*roughness;
    float a2 = a*a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;

    float nom   = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return nom / denom;
}
// ----------------------------------------------------------------------------
vec4 GetNoise(vec2 uv){
    vec2 uv0 = (uv/103.0)+vec2(time/17.0, time/29.0);
    vec2 uv1 = (uv/107.0)-vec2(time/-19.0, time/31.0);
    vec2 uv2 = uv/vec2(897.0, 983.0)+vec2(time/101.0, time/97.0);
    vec2 uv3 = uv/vec2(991.0, 877.0)-vec2(time/109.0, time/-113.0);
    vec4 noise = (texture(normalMap, uv0)) + (texture(normalMap, uv1)) 
                + (texture(normalMap, uv2)) + (texture(normalMap, uv3));
    return noise*0.5-1.0;
}
// ----------------------------------------------------------------

void main(){

    // Properties
    float shininess = 100.0;
    float spec = 2.0;
    float dif = 0.5;

    vec4 noise = GetNoise(vWorldPosition.xz);
    // vec4 noise = vec4(texture(normalMap, vUV).rgb, 1.0);
    vec3 surfaceNormal = normalize(noise.xzy * vec3(2.0, 1.0, 2.0));

    vec3 diffuse = vec3(0.0);
    vec3 specular = vec3(0.0);

    vec3 worldToEye = cameraPosition-vWorldPosition;
    vec3 eyeDirection = normalize(worldToEye);

    vec3 sunDirection = normalize(sunPosition - vWorldPosition);
    vec3 reflection = normalize(reflect(-sunDirection, surfaceNormal));
    float direction = max(0.0, dot(eyeDirection, reflection));
    specular += pow(direction, shininess) * sunColor * spec;
    diffuse += max(dot(sunDirection, surfaceNormal),0.0) * sunColor * dif;

    FragColor = vec4((diffuse + specular + vec3(0.1)) * vec3(0.3, 0.5, 0.9), 1.0);
    // FragColor = noise;
}

// Inverse gamma correction
// normal = pow(normal, vec3(2.2));
// Convert the color values to the range [-1, 1]
// normal = normal * 2.0 - 1.0;
// normal = vNormalMatrix * normal;