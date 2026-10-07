export const fragmentShaderSource = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_heightmap;
uniform sampler2D u_substrate;

uniform vec2 u_resolution;
uniform vec2 u_pointer;       // Normalized pointer (0..1)
uniform float u_time;
uniform int u_mode;           // 0: Prismatic, 1: Mercury, 2: Frosted, 3: Iridescent

// Physical material uniforms
uniform float u_refractionStrength;
uniform float u_dispersionStrength;
uniform float u_specularPower;
uniform float u_fresnelPower;
uniform float u_causticStrength;

// Pseudo-random noise for frosted blur & micro-grain
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// Thin-film interference cosine palette
vec3 thinFilmColor(float t) {
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.00, 0.33, 0.67);
  return a + b * cos(6.283185 * (c * t + d));
}

void main() {
  vec2 uv = v_uv;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 texelSize = 1.0 / u_resolution;

  // Sample height and finite-difference gradients from physics buffer
  vec4 heightData = texture(u_heightmap, uv);
  float height = (heightData.r - 0.5) * 4.0;
  
  // Central difference filtering for ultra-smooth analytical normals
  vec2 e = texelSize * 2.0;
  float hL = (texture(u_heightmap, uv - vec2(e.x, 0.0)).r - 0.5) * 4.0;
  float hR = (texture(u_heightmap, uv + vec2(e.x, 0.0)).r - 0.5) * 4.0;
  float hU = (texture(u_heightmap, uv - vec2(0.0, e.y)).r - 0.5) * 4.0; // Up is -Y
  float hD = (texture(u_heightmap, uv + vec2(0.0, e.y)).r - 0.5) * 4.0; // Down is +Y

  vec2 grad = vec2(hR - hL, hD - hU) * 1.8;

  // Analytical surface normal (Z points towards eye)
  vec3 normal = normalize(vec3(-grad.x, -grad.y, 1.0));
  vec3 viewDir = vec3(0.0, 0.0, 1.0);

  // Optical Caustics: Divergence / Laplacian of surface height
  float laplacian = (hL + hR + hU + hD - 4.0 * height) * 4.0;
  float causticLight = pow(max(0.0, laplacian * 2.8), 1.8) * u_causticStrength;
  float causticShadow = clamp(1.0 - max(0.0, -laplacian * 1.5) * 0.45, 0.4, 1.0);

  // Optical Snell's Refraction with Cauchy Chromatic Dispersion
  vec2 refrDir = normal.xy;
  
  // Frosted mode micro-roughness jitter
  if (u_mode == 2) {
    float n1 = hash(uv * 400.0 + u_time * 0.1) - 0.5;
    float n2 = hash(uv * 400.0 + vec2(13.7, 51.2)) - 0.5;
    refrDir += vec2(n1, n2) * 0.008;
  }

  // Refraction offsets per channel (Red, Green, Blue)
  vec2 uvR = clamp(uv - refrDir * (u_refractionStrength + u_dispersionStrength), 0.001, 0.999);
  vec2 uvG = clamp(uv - refrDir * u_refractionStrength, 0.001, 0.999);
  vec2 uvB = clamp(uv - refrDir * (u_refractionStrength - u_dispersionStrength), 0.001, 0.999);

  // Sample underlying typographic substrate
  float subR = texture(u_substrate, uvR).r;
  float subG = texture(u_substrate, uvG).g;
  float subB = texture(u_substrate, uvB).b;
  vec3 refractedColor = vec3(subR, subG, subB);

  // Apply optical caustic modulation to substrate
  refractedColor = refractedColor * causticShadow + vec3(1.0, 0.97, 0.92) * causticLight * 0.45;

  // Dynamic light source at cursor position
  vec3 lightPos = vec3(u_pointer.x, u_pointer.y, 0.35);
  vec3 fragPos = vec3(uv.x, uv.y, height * 0.05);
  vec3 lightDir = normalize(lightPos - fragPos);
  float lightDist = length((uv - u_pointer) * aspect);
  float lightAtten = 1.0 / (1.0 + lightDist * lightDist * 4.0);

  // Ambient studio light (overhead soft directional)
  vec3 ambientLightDir = normalize(vec3(0.2, 0.8, 0.6));

  // Blinn-Phong Specular from cursor light
  vec3 halfVec = normalize(lightDir + viewDir);
  float NdotH = max(0.0, dot(normal, halfVec));
  float specular = pow(NdotH, u_specularPower) * lightAtten * 1.5;

  // Ambient specular from overhead
  vec3 halfAmbient = normalize(ambientLightDir + viewDir);
  float ambientSpec = pow(max(0.0, dot(normal, halfAmbient)), u_specularPower * 0.5) * 0.35;

  // Fresnel Rim Reflectance (Schlick's approximation)
  float NdotV = max(0.0, dot(normal, viewDir));
  float fresnel = pow(1.0 - NdotV, u_fresnelPower);

  // Material synthesis based on mode
  vec3 finalColor = refractedColor;

  if (u_mode == 0) {
    // Mode 0: Prismatic Glass
    vec3 specColor = vec3(0.96, 0.98, 1.0) * (specular + ambientSpec);
    vec3 rimGlow = vec3(0.38, 0.65, 0.98) * fresnel * 0.6;
    finalColor = finalColor + specColor + rimGlow;
  } 
  else if (u_mode == 1) {
    // Mode 1: Liquid Mercury
    vec3 chromeTone = vec3(0.90, 0.92, 0.96);
    float metallicSheen = (normal.x * 0.5 + 0.5) * 0.2 + (normal.y * 0.5 + 0.5) * 0.2;
    vec3 specColor = chromeTone * (specular * 2.2 + ambientSpec * 1.2);
    vec3 rimGlow = chromeTone * fresnel * 0.9;
    finalColor = mix(finalColor * 0.6, chromeTone * metallicSheen, 0.45) + specColor + rimGlow;
  } 
  else if (u_mode == 2) {
    // Mode 2: Frosted Silica
    vec3 specColor = vec3(0.85, 0.88, 0.92) * (specular * 0.4 + ambientSpec * 0.4);
    vec3 rimGlow = vec3(0.7, 0.75, 0.8) * fresnel * 0.3;
    finalColor = finalColor * 0.95 + specColor + rimGlow;
  } 
  else if (u_mode == 3) {
    // Mode 3: Iridescent Thin-Film
    vec3 iridColor = thinFilmColor(NdotV * 2.5 + height * 0.4 + u_time * 0.05);
    vec3 specColor = iridColor * (specular * 1.8 + ambientSpec * 0.8);
    vec3 rimGlow = iridColor * fresnel * 1.2;
    finalColor = finalColor + specColor + rimGlow;
  }

  // Energy highlight (subtle glow on high-velocity wave crests)
  float kineticEnergy = heightData.a;
  finalColor += vec3(0.12, 0.18, 0.28) * kineticEnergy * 0.8;

  // Film micro-dither to eliminate 8-bit quantization banding
  float dither = (hash(gl_FragCoord.xy) - 0.5) * (1.0 / 255.0) * 1.8;
  finalColor += dither;

  fragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
`;
