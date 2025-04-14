import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  MathUtils,
  TextureLoader,
} from "three";
import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";

const vertexShader = /* glsl */ `
attribute float size;
attribute vec3 direction;
attribute float timeOffset;

uniform float uTime;

varying float vTimeOffset;
varying vec2 vUv;

void main() {
  vTimeOffset = timeOffset;
  vUv = uv;
  
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = /* glsl */ `
varying float vTimeOffset;
varying vec2 vUv;

uniform float uTime;
uniform float uMaxOpacity;
uniform sampler2D uNoiseTexture;
uniform sampler2D uStarTexture;

  
  void main() {
      vec2 coord = vUv;
  
  
      vec4 starTex = texture2D(uStarTexture, coord * 0.8);
  
      float scrollSpeed = 0.01;
      float noiseScale = 0.1;
      vec2 noiseUV = mod(coord * noiseScale + vec2(uTime * scrollSpeed), 1.0);
      vec4 noiseTex = texture2D(uNoiseTexture, noiseUV);

      vec2 center = vec2(0.5, 0.5);
      float dist = distance(vUv, center);
    
      float start = 0.2;
      float end = 0.5;
      float fade = smoothstep(end, start, dist);
  
      float opacity = starTex.a * noiseTex.r * uMaxOpacity;
  
      if (opacity < 0.01) discard;
  
      gl_FragColor = vec4(starTex.rgb, opacity * fade);
}
`;

export const Particles2 = () => {
  const materialRef = useRef();
  const starTexture = useLoader(TextureLoader, "./textures/luma/stars.webp");
  const noiseTexture = useLoader(TextureLoader, "./textures/luma/noiseTex.png");

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <Billboard>
      <mesh >
        <planeGeometry args={[1.7, 1.7]} />
        <shaderMaterial
          ref={materialRef}
          attach="material"
          uniforms={{
            uTime: { value: 0 },
            uMaxOpacity: { value: 1 },
            uNoiseTexture: { value: noiseTexture },
            uStarTexture: { value: starTexture },
          }}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          vertexColors
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
    </Billboard>
  );
};
