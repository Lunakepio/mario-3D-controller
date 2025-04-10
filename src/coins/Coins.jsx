

import { InstancedRigidBodies } from "@react-three/rapier"
import { MathUtils } from "three"
import { useGLTF } from "@react-three/drei"
export const Coins = ({ count = 1000, rand = MathUtils.randFloatSpread }) => {
  const { nodes, materials } = useGLTF('/models/items/coin.glb')
  const instances = Array.from({ length: count }, (_, i) => ({
    key: i,
    position: [rand(10), 10 + i / 2, rand(10)],
    rotation: [Math.random(), Math.random(), Math.random()]
  }))

  materials.CoinMat00.roughness = 0.2;
  materials.CoinMat00.metalness = 0.8;
  return (
    <InstancedRigidBodies instances={instances} colliders="hull" userData={{ground: true}}>
      <instancedMesh frustumCulled={false} receiveShadow castShadow args={[nodes.Coin__CoinMat00.geometry, materials.CoinMat00, count]} dispose={null}>
      </instancedMesh>
    </InstancedRigidBodies>
  )
}
