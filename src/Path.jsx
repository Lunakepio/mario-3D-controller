import React, { useEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, Vector3 } from "three";
import { curve as points } from "./data";
import gsap from "gsap";
import { CustomEase } from "gsap/all";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "./store/store";

export const Path = ({color = "white", lineWidth = 1 }) => {

  gsap.registerPlugin(CustomEase)
  const curve = useMemo(() => new CatmullRomCurve3(points), []);
  const meshRef = useRef();


  const curvePoints = useMemo(() => curve.getPoints(points.length), [curve]);


  const positions = useMemo(
    () => new Float32Array(curvePoints.flatMap((p) => [p.x, p.y, p.z])),
    [curvePoints]
  );

  const animation = useRef(null);
  const groupRef = useRef(null);
  const tweenProgress = useRef(0);

  const setCurvePointData = useGameStore((state) => state.setCurvePointData);
  useEffect(() => {
    if (!meshRef.current) return;
  
    // const curveLength = curve.getLength();
  
    const data = { progress: 0 };
    
    const tl = gsap.timeline({paused: true});
    tl.to(data, {
      progress: 1,
      duration: 4,
      delay: 1.1,
      ease: CustomEase.create("custom", "M0,0 C0.157,0.393 0.891,0.561 1,1."),
      onUpdate: () => {
        const clampedProgress = Math.min(1, Math.max(0, data.progress)); // Clamp progress
    
        const pointOnCurve = curve.getPointAt(clampedProgress);
    
        setCurvePointData(meshRef.current);
        groupRef.current.position.set(
          pointOnCurve.x,
          pointOnCurve.y,
          pointOnCurve.z
        );
    
        const tangent = curve.getTangentAt(clampedProgress);
        const lookAtVector = new Vector3().addVectors(pointOnCurve, tangent);
        groupRef.current.lookAt(lookAtVector);
      },
      onComplete: () => {
        setCurvePointData(null);
      },
    }, 0);
    tl.to(meshRef.current.rotation, {y: Math.PI * 8, duration:2.5, delay: 1.1, ease: "power4.out"}, 0);
    tl.to(meshRef.current.rotation, {x: Math.PI * 4, duration:0.5, delay: 4.1, ease: CustomEase.create("custom", "M0,0 C0.157,0.393 0.891,0.561 1,1.")}, 0);
    

    
    // Store timeline in ref if needed
    animation.current = tl;
    
    // Clean up on unmount
    return () => {
      tl.kill();
    };
  }, [curve]);

  useFrame((state, delta) => {
    if(animation.current){
      const { star } = useGameStore.getState();
      if(star && star.isTwirling){
        // tweenProgress.current += delta;
        animation.current.play();
  
      }
    }
  });
    
  return (
    <>
    <group ref={groupRef} position={curve.getPointAt(0)}>
    <group ref={meshRef} rotation={[Math.PI / 2, 0 , 0]}>

    </group>
    </group>
    {/* <line>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        attach="material"
        color={color}
        linewidth={lineWidth}
      />
    </line> */}
    </>
  );
};
