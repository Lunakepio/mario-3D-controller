import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { extend, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { MeshPhongMaterial, OctahedronGeometry, Vector3 } from "three";
import { useGameStore } from "../store/store";

extend({ InstancedMesh2 });

export const Dust = () => {
  const ref = useRef(null);
  const lifeTime = 1;
  const scaleMultiplier = 1.2;
  const speed = 0.1;
  const direction = new Vector3(0, 0.5, 0).normalize();
  let time = 0;

  const geometry = useMemo(() => new OctahedronGeometry(0.1, 1), []);

  const material = useMemo(
    () => new MeshPhongMaterial({ emissive: 0xffffff, transparent: true, depthWrite: false, }),
    []
  );

  let landingAnimation = false;

  useFrame((state, delta) => {
    if (!ref.current || ref.current.instancesCount >= 1000) return;
    const playerTranslation = useGameStore.getState().playerPosition;
    const playerAnimation = useGameStore.getState().playerAnimation;
    if (!playerTranslation) return;
    const { x, y, z } = playerTranslation;

    const elapsedTime = state.clock.getElapsedTime();

    if (
      elapsedTime - time > 0.2 + Math.random() * 0.3 &&
      playerAnimation === "run"
    ) {
      time = elapsedTime;
      landingAnimation = false;
      ref.current.addInstances(1, (obj) => {
        obj.position.copy({
          x: x + (Math.random() - 0.5) * 0.1,
          y: y - 0.7,
          z: z + (Math.random() - 0.5) * 0.1,
        });
        obj.quaternion.random();
        obj.currentTime = 0;
      });
      
    }

    if (playerAnimation === "land" && !landingAnimation) {
      ref.current.addInstances(8, (obj) => {
        obj.position.copy({
          x: x + (Math.random() - 0.5) * 1.3,
          y: y - 0.7,
          z: z + (Math.random() - 0.5) * 1.3,
        });
        obj.quaternion.random();
        obj.currentTime = 0;
      });
      landingAnimation = true;
    }
    ref.current.updateInstances((obj) => {
      obj.currentTime += delta;
      obj.position.addScaledVector(direction, speed * delta);
      obj.scale.addScalar(scaleMultiplier * delta);
      obj.opacity = Math.max(0, lifeTime - obj.currentTime) * 0.8;

      if (obj.currentTime >= lifeTime + 1.5) {
        obj.remove();
        return;
      }
    });
  });

  return (
    <instancedMesh2
      ref={ref}
      args={[geometry, material, { createEntities: true }]}
      frustumCulled={false}
    />
  );
};
