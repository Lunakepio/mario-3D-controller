import { useRapier } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { MathUtils } from "three";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";

extend({ InstancedMesh2 });

export const Coins2 = ({ count = 1000, rand = MathUtils.randFloatSpread }) => {
  const instancedMeshRef = useRef();
  const { rapier, world } = useRapier();
  const { nodes, materials } = useGLTF("/models/items/coin.glb");
  
  materials.CoinMat00.roughness = 0.2;
  materials.CoinMat00.metalness = 0.8;
  useEffect(() => {
    if (
      !instancedMeshRef.current ||
      !rapier ||
      !world ||
      !nodes?.Coin__CoinMat00 ||
      !materials?.CoinMat00
    ) return;

    instancedMeshRef.current.computeBVH();

    const geometry = nodes.Coin__CoinMat00.geometry;
    const vertices = geometry.attributes.position.array;
    const singleColliderDesc = rapier.ColliderDesc.convexHull(new Float32Array(vertices));
    

    setTimeout(() => {
      instancedMeshRef.current.addInstances(count, (obj, i) => {
        const x = rand(10);
        const y = 10 + i / 2;
        const z = rand(10);

        obj.position.set(x, y, z);
        // obj.quaternion.random();

        const rigidBodyDesc = rapier.RigidBodyDesc.dynamic().setTranslation(x, y, z);
        const rigidBody = world.createRigidBody(rigidBodyDesc);

        world.createCollider(singleColliderDesc, rigidBody);

        obj.rigidBody = rigidBody;
      });
    }, 1000);
  }, [count, rand, rapier, world, nodes, materials]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (!instancedMeshRef.current && time < 1) return;

    instancedMeshRef.current.updateInstances((instance, i) => {
      if (instance?.rigidBody) {
        const rigidBody = instance.rigidBody;
        const pos = rigidBody.translation();
        const rot = rigidBody.rotation();
        instance.position.set(pos.x, pos.y, pos.z);
        instance.quaternion.set(rot.x, rot.y, rot.z, rot.w);
        instance.updateMatrix();
        if(pos.y < - 10){
          instance.rigidBody.setEnabled(false);
          instance.remove();
        }
      }
    });
  });

  return (
    <instancedMesh2
      ref={instancedMeshRef}
      frustumCulled={false}
      args={[
        nodes.Coin__CoinMat00.geometry,
        materials.CoinMat00,
        { createEntities: true },
      ]}
      castShadow
      receiveShadow
    />
  );
};
