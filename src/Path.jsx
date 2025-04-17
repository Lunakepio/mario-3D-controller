import React, { useEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, Vector3 } from "three";
import { curve as points } from "./data";
import gsap from "gsap";
import { CustomEase } from "gsap/all";

export const Path = ({color = "white", lineWidth = 1 }) => {

  gsap.registerPlugin(CustomEase)
  const curve = useMemo(() => new CatmullRomCurve3(points), []);
  const meshRef = useRef();


  const curvePoints = useMemo(() => curve.getPoints(100), [curve]);


  const positions = useMemo(
    () => new Float32Array(curvePoints.flatMap((p) => [p.x, p.y, p.z])),
    [curvePoints]
  );

  useEffect(() => {
    if (!meshRef.current) return;
  
    const curveLength = curve.getLength();
  
    const data = { progress: 0 };
  
    const animation = gsap.to(data, {
      progress: 1,
      duration: 4,
      ease: CustomEase.create("custom", "M0,0 C0.157,0.393 0.891,0.561 1,1.029 "),
      delay: 2,
      paused: true,
      onUpdate: () => {
        const pointOnCurve = curve.getPointAt(data.progress);
  
        meshRef.current.position.set(
          pointOnCurve.x,
          pointOnCurve.y,
          pointOnCurve.z,
        );
  
        const tangent = curve.getTangentAt(data.progress);
        const lookAtVector = new Vector3().addVectors(pointOnCurve, tangent);
        meshRef.current.lookAt(lookAtVector);
      },
      onComplete: () => {
        console.log('Animation complete!');
      },
    });
  
    return () => {
      animation.kill();
    };
  }, [curve]);
    
  return (
    <>
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <line>
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
    </line>
    </>
  );
};
