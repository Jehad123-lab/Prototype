import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

// Noise function
const noiseChunk = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i); 
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

const vertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const DissolveFrontMaterial = shaderMaterial(
  {
    uProgress: 0,
    uCardTex: new THREE.Texture(),
    uMaskTex: new THREE.Texture(),
    uEdgeColor: new THREE.Color(0.2, 2.5, 0.4) // Sparkling fluorescent green refractor dissolve line
  },
  vertexShader,
  `
  uniform sampler2D uCardTex;
  uniform sampler2D uMaskTex;
  uniform float uProgress;
  uniform vec3 uEdgeColor;

  varying vec2 vUv;
  
  ${noiseChunk}

  void main() {
    // Reverse vUv.x since we put it on the front of a plane
    vec2 mapUv = vec2(vUv.x, vUv.y);
    vec4 maskColor = texture2D(uMaskTex, mapUv);
    vec4 cardColor = texture2D(uCardTex, mapUv);
    
    float noiseVal = snoise(vUv * 3.0) * 0.5 + 0.5;
    float edgeWidth = 0.08;
    
    // Core Dissolve Logic
    if (noiseVal < uProgress) {
        gl_FragColor = cardColor;
    } else if (noiseVal < uProgress + edgeWidth) {
        float edgeIntensity = smoothstep(uProgress + edgeWidth, uProgress, noiseVal);
        vec3 finalEdgeColor = uEdgeColor * edgeIntensity * 1.5; // Calibrated safe bloom trigger
        gl_FragColor = vec4(finalEdgeColor, 1.0);
    } else {
        gl_FragColor = maskColor;
    }
  }
  `
);

export const PulsingBackMaterial = shaderMaterial(
  {
    uTime: 0,
    uBackTex: new THREE.Texture(),
    uPulseColor: new THREE.Color(0.1, 1.0, 0.3) // Premium cyber green refractor pulse
  },
  vertexShader,
  `
  uniform float uTime;
  uniform sampler2D uBackTex;
  uniform vec3 uPulseColor;

  varying vec2 vUv;
  
  void main() {
    float pulse = sin(uTime * 3.5) * 0.5 + 0.5;
    // Map uv backwards if needed, here we just use vUv
    vec2 mapUv = vec2(1.0 - vUv.x, vUv.y);
    vec4 texColor = texture2D(uBackTex, mapUv);
    
    // Controlled neon glow over the dark pattern texture
    vec3 finalColor = mix(texColor.rgb, texColor.rgb + uPulseColor, pulse * 0.55);
    gl_FragColor = vec4(finalColor, 1.0);
  }
  `
);

extend({ DissolveFrontMaterial, PulsingBackMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      dissolveFrontMaterial: any;
      pulsingBackMaterial: any;
    }
  }
}

