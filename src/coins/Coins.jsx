import { InstancedRigidBodies } from "@react-three/rapier";
import { MathUtils } from "three";
import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import { extend } from "@react-three/fiber";
extend({ InstancedMesh2 });

export const Coins = ({ count = 1000, rand = MathUtils.randFloatSpread }) => {
  const { nodes, materials } = useGLTF("/models/items/coin.glb");
  const ref = useRef(null);
  const instancedMeshRef = useRef(null);
  const instances = Array.from({ length: count }, (_, i) => ({
    key: i,
    position: [rand(10), 10 + i / 2, rand(10)],
    rotation: [Math.random(), Math.random(), Math.random()],
  }));

  useEffect(() => {
    if (instancedMeshRef.current) {
      instancedMeshRef.current.addInstances(count, (obj) => {
        obj.position.y = 20;

      });
    }
  }, [count]);
  materials.CoinMat00.roughness = 0.2;
  materials.CoinMat00.metalness = 0.8;
  return (
    <InstancedRigidBodies
      ref={ref}
      instances={instances}
      colliders="hull"
      userData={{ ground: true }}
    >
      <instancedMesh2
        ref={instancedMeshRef}
        frustumCulled={false}
        receiveShadow
        castShadow
        args={[
          nodes.Coin__CoinMat00.geometry,
          materials.CoinMat00,
          { createEntities: true },
        ]}
        dispose={null}
      />
    </InstancedRigidBodies>
  );
};
