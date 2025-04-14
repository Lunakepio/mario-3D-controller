import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  MathUtils,
  TextureLoader,
} from "three";
import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";

const vertexShader = /* glsl */ `
attribute float size;
attribute vec3 direction;
attribute float timeOffset;
attribute float blinkingSpeed;

uniform float uTime;

varying float vTimeOffset;
varying float vBlinkingSpeed;
varying float vDepth;
varying vec2 vUv;
  
  void main() {
      vTimeOffset = timeOffset;
      vBlinkingSpeed = blinkingSpeed;
      vUv = uv;
  
      float cycleDuration = 4.0;
      float localTime = mod(uTime + timeOffset, cycleDuration);
  
      float scale = smoothstep(0.1, 0.5, localTime);
      if (localTime > 0.4) {
          scale = smoothstep(0.7, 1.0, localTime);
          scale = 1.0 - scale; 
      }
    
      vec3 animatedPosition = position + direction * sin((uTime * 0.5) + timeOffset);
      vec4 mvPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
      vDepth = -mvPosition.z;
  
      gl_PointSize = size * scale;
      gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
varying float vTimeOffset;
varying float vBlinkingSpeed;
varying float vDepth;
varying vec2 vUv;

uniform float uTime;
uniform float uMaxOpacity;
uniform sampler2D uAlphaTexture;
uniform sampler2D uNoiseTexture;

void main() {
    vec2 coord = gl_PointCoord - 0.5;
    float angle = uTime * 3.0 + vTimeOffset;
    float s = sin(angle);
    float c = cos(angle);
    mat2 rotation = mat2(c, -s, s, c);
    coord = rotation * coord + 0.5;

    vec4 alphaTex = texture2D(uAlphaTexture, coord);
    // if (alphaTex.a < 0.9) discard;


    float scrollSpeed = 0.5;
    float noiseScale = .0001;

    vec2 noiseUV = mod(vUv * noiseScale + vec2(uTime * scrollSpeed), 1.0);

    vec4 noiseColor = texture2D(uNoiseTexture, noiseUV);


    gl_FragColor = vec4(vec3(noiseColor.r, noiseColor.g, noiseColor.b * 0.5), alphaTex.a * uMaxOpacity);
}
`;

export const Particles = ({ noiseTexture }) => {
  const pointsRef = useRef();
  const materialRef = useRef();

  const particleCount = 10;
  // const colorsRGB = [
  //   [238, 175, 74],
  //   [239, 198, 117],
  //   [174, 132, 86],
  //   [255, 222, 189],
  //   [255, 175, 108],
  // ];
  const baseSize = 40;
  const directionMultiplier = 0.2;
  const alphaTexture = useLoader(TextureLoader, "./textures/luma/sparkles.png");

  const particles = useMemo(() => {
    const positions = [];
    const sizes = [];
    const directions = [];
    const timeOffsets = [];
    const blinkingSpeeds = [];

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 0.7;
      const y = (Math.random() - 0.5) * 0.5 + 0.3;
      const z = 0;
      positions.push(x, y, z);

      const size = baseSize * Math.random() + 20;
      sizes.push(size);
      directions.push(
        (Math.random() - 0.5) * directionMultiplier,
        (Math.random() - 0.5) * directionMultiplier,
        (Math.random() - 0.5) * directionMultiplier
      );

      blinkingSpeeds.push(Math.random());
      timeOffsets.push(Math.random() * 5);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("size", new Float32BufferAttribute(sizes, 1));
    geometry.setAttribute(
      "direction",
      new Float32BufferAttribute(directions, 3)
    );
    geometry.setAttribute(
      "timeOffset",
      new Float32BufferAttribute(timeOffsets, 1)
    );
    geometry.setAttribute(
      "blinkingSpeed",
      new Float32BufferAttribute(blinkingSpeeds, 1)
    );

    return geometry;
  }, [particleCount, baseSize]);


  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

    }
  });

  return (
    <points ref={pointsRef} geometry={particles}>
      <shaderMaterial
        ref={materialRef}
        attach="material"
        uniforms={{
          uTime: { value: 0 },
          uMaxOpacity: { value: 1 },
          uAlphaTexture: { value: alphaTexture },
          uNoiseTexture: { value: noiseTexture },
        }}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        vertexColors
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
};
