#version 300 es

struct SkyParams 
{
    float Turbidity;
    float Rayleigh; 
    float MieCoefficient;
    float MieDirectionalG; 
    vec3 SunPosition;
    vec3 SunColor;
    float SunIntensity;
    vec3 Up;
};

in vec3 aPosition;
in vec3 aNormal;
in vec2 aUV;

out vec3 vNormal;
out vec2 vUV;
out vec3 vWorldPosition;
out vec3 vSunDirection;
out float vSunfade;
out vec3 vBetaR;
out vec3 vBetaM;
out float vSunE;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform SkyParams params;

// constants for atmospheric scattering
const float e = 2.71828182845904523536028747135266249775724709369995957;
const float pi = 3.141592653589793238462643383279502884197169;

// wavelength of used primaries, according to preetham
const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );
// this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:
// (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

// mie stuff
// K coefficient for the primaries
const float v = 4.0;
const vec3 K = vec3( 0.686, 0.678, 0.666 );
// MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );

// earth shadow hack
// cutoffAngle = pi / 1.95;
const float cutoffAngle = 1.6110731556870734;
const float steepness = 1.5;
const float EE = 1000.0;

float SunIntensity( float zenithAngleCos ) {
    zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
    return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
}

vec3 TotalMie( float T ) {
    float c = ( 0.2 * T ) * 10E-18;
    return 0.434 * c * MieConst;
}

void main() {
    vec4 worldPosition = model * vec4( aPosition, 1.0 );
    vWorldPosition = worldPosition.xyz;
    vNormal = mat3(transpose(inverse(model))) * aNormal;  
    vUV = aUV;

    vSunDirection = normalize( params.SunPosition );
    vSunE = SunIntensity( dot( vSunDirection, params.Up ) );
    vSunfade = 1.0 - clamp( 1.0 - exp( ( params.SunPosition.y / 450000.0 ) ), 0.0, 1.0 );
    float rayleighCoefficient = params.Rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );
    // extinction (absorbtion + out scattering)
    // rayleigh coefficients
    vBetaR = totalRayleigh * rayleighCoefficient;
    // mie coefficients
    vBetaM = TotalMie( params.Turbidity ) * params.MieCoefficient;

    gl_Position = projection * view * model * vec4(aPosition, 1.0);
}