import { VFXParticles } from "wawa-vfx"
import { useRef } from "react";

export const Particles = () => {
  const ref = useRef();
  
  return (
    <>
    <group ref={ref}>
    <VFXParticles
      name="flying" 
      settings={{
        fadeAlpha : [0, 0],
        fadeSize : [0, 0],
        intensity : 8,
        nbParticles : 1000,
        renderMode: 'billboard',
        gravity: [0, -1, 0],
      }}
    />
    </group>

    </>
  )
}
