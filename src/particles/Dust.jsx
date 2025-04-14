import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { extend, useFrame, useLoader } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  MeshBasicMaterial,
  PlaneGeometry,
  Quaternion,
  TextureLoader,
  Vector3,
  Euler,
} from "three";
import { useGameStore } from "../store/store";

extend({ InstancedMesh2 });

export const Dust = () => {
  const ref = useRef(null);
  const lifeTime = 1;
  const speed = 1;
  const direction = new Vector3(0, 0.5, 0).normalize();
  let time = 0;
  const dustTexture = useLoader(TextureLoader, "/textures/dust/dust.png");

  const geometry = useMemo(() => new PlaneGeometry(0.2, 0.2), []);

  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: 0xffffff,
        map: dustTexture,
        alphaMap: dustTexture,
        depthWrite: false,
        transparent: true,
      }),
    [dustTexture]
  );

  let landingAnimation = false;

  useFrame((state, delta) => {
    if (!ref.current || ref.current.instancesCount >= 1000) return;
    const playerTranslation = useGameStore.getState().playerPosition;
    const playerAnimation = useGameStore.getState().playerAnimation;
    const camera = state.camera;
    if (!playerTranslation) return;
    const { x, y, z } = playerTranslation;

    const elapsedTime = state.clock.getElapsedTime();

    if (elapsedTime - time > Math.random() * 0.5 && playerAnimation === "run") {
      time = elapsedTime;
      landingAnimation = false;
      ref.current.addInstances(2, (obj) => {
        obj.position.copy({
          x: x + (Math.random() - 0.5) * 0.4,
          y: y - 0.8,
          z: z + (Math.random() - 0.5) * 0.4,
        });
        const scale = Math.random() + 0.6;
        obj.scale.set(scale, scale, scale);
        obj.currentTime = 0;
        obj.randomZRotation = Math.random() * Math.PI * 2;
      });
    }

    if (playerAnimation === "land" && !landingAnimation) {
      const particleCount = 9;
      const radius = 0.1;
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const dir = new Vector3(
          Math.cos(angle),
          0.4,
          Math.sin(angle)
        ).normalize();
        const px = x + dir.x * radius + (Math.random() - 0.5) * 0.5;
        const pz = z + dir.z * radius + (Math.random() - 0.5) * 0.5;

        ref.current.addInstances(1, (obj) => {
          obj.position.set(px, y - 0.7, pz);
          // obj.quaternion.random();
          const scale = Math.random() + 1;
          obj.scale.set(scale, scale, scale);
          obj.currentTime = 0;
          obj.direction = dir.clone();
          obj.randomZRotation = Math.random() * Math.PI * 2;
        });
      }
      landingAnimation = true;
    }

    ref.current.updateInstances((obj) => {
      obj.currentTime += delta;
      if (obj.direction) {
        obj.position.addScaledVector(obj.direction, 2 * delta);
      } else {
        obj.position.addScaledVector(direction, speed * delta);
      }
    const toCamera = new Vector3().subVectors(camera.position, obj.position).normalize();
    

    const particleQuaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), toCamera);
    
    const randomRotationQuaternion = new Quaternion().setFromEuler(new Euler(0, 0, obj.randomZRotation));
    
    particleQuaternion.multiply(randomRotationQuaternion);
    
    obj.quaternion.copy(particleQuaternion);
      const scale = Math.max(0, lifeTime - obj.currentTime * 2);
      obj.scale.set(scale, scale, scale);
      // obj.opacity = Math.max(0, lifeTime - obj.currentTime * 2);

      if (obj.currentTime >= lifeTime + 2) {
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
