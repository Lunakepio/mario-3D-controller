import { Billboard } from "@react-three/drei"
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Color } from "three"



export const Glow = () => {
  const materialRef = useRef(null);
  const vertexShader = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  const fragmentShader = /* glsl */ `
    uniform float time;
    uniform vec3 color;
    uniform float opacity;
    varying vec2 vUv;
    void main() {

    vec3 lightColor = vec3(0.937, 0.876, 0.4);
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(vUv, center);
  
    float start = 0.2;
    float end = 0.5;
    float fade = smoothstep(end, start, dist);
    float colorScalar = 2.;

    gl_FragColor = vec4(lightColor * colorScalar, fade * .2);
    }
  `;
  
  useFrame((state)=>{
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
  })
  const size = 1;
  return(
    <Billboard>
      <mesh>
        <planeGeometry args={[size, size]} />
        <shaderMaterial 
        ref={materialRef}
          uniforms={{
            time: { value: 0 },
            color: { value: new Color(0xffffff) },
            opacity: { value: 1.0 },
          }}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent={true}
          depthWrite={false}
        />
      </mesh>
    </Billboard>
  )
}
//   uniforms: {
//     time: { value: 0 },
//     color: { value: new Color(0xffffff) },
//     opacity: { value: 1.0 },
//   },
//   vertexShader: `
//     varying vec2 vUv;
//     void main() {
//       vUv = uv;
//       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//     }
//   `,
//   fragmentShader: `
//     uniform float time;
//     uniform vec3 color;
//     uniform float opacity;
//     varying vec2 vUv;
//     void main() {
//       float dist = distance(vUv, vec2(0.5));
//       float alpha = smoothstep(0.45, 0.55, dist);
//       gl_FragColor = vec4(color, alpha * opacity);
//     }
//   `,
// });

