import React, { useRef } from 'react'
import { useGraph, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { useGameStore } from '../store/store'
import { LoopOnce } from 'three'
import { maxSpeed } from '../constants'

export const Mario = ({speedRef}) => {
  const group = useRef()
  const { scene, animations } = useGLTF('/models/player/mario.glb')
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone)
  const { actions } = useAnimations(animations, group)

  const currentAction = useRef()

  useFrame(() => {
    const animation = useGameStore.getState().playerAnimation;
    const nextAction = actions[animation];
  
    if (!nextAction) return;
  
    if (currentAction.current !== nextAction) {
      if (currentAction.current) {
        currentAction.current.fadeOut(0.2);
      }

      currentAction.current = nextAction;
  
      if (animation === "jump" || animation === "land") {
        nextAction.loop = LoopOnce;
        nextAction.clampWhenFinished = true;
      } else {
        nextAction.loop = undefined;
        nextAction.clampWhenFinished = false;
      }
  
      nextAction.reset().fadeIn(0.2).play();
    }

    if (currentAction.current) {
      const animationSpeed =
        animation === "jump"
          ? 20
          : animation === "land"
          ? 10
          : 1 + 5 * speedRef.current / maxSpeed;
      currentAction.current.setEffectiveTimeScale(animationSpeed);
    }
  });
  
  return (
    <group ref={group} dispose={null}>

      <group name="Player" position={[0, -.8, 0]}>
        <group name="Player_1">
          <group name="Mario">
            <group name="AllRoot">
              <group name="JointRoot" position={[0, 0.611, -0.041]}>
                <primitive object={nodes.Hip} />
                <primitive object={nodes.Spine1} />
              </group>
            </group>
            <skinnedMesh castShadow receiveShadow name="Face00__MarioFaceMat00" geometry={nodes.Face00__MarioFaceMat00.geometry} material={materials.MarioFaceMat00} skeleton={nodes.Face00__MarioFaceMat00.skeleton}>
              <skinnedMesh castShadow receiveShadow name="Face00__MarioHigeMat00" geometry={nodes.Face00__MarioHigeMat00.geometry} material={materials.MarioHigeMat00} skeleton={nodes.Face00__MarioHigeMat00.skeleton} />
            </skinnedMesh>
            <skinnedMesh castShadow receiveShadow name="Mario__MarioBodyMat00" geometry={nodes.Mario__MarioBodyMat00.geometry} material={materials.MarioBodyMat00} skeleton={nodes.Mario__MarioBodyMat00.skeleton}>
              <skinnedMesh castShadow receiveShadow name="Mario__MarioBodyMat01" geometry={nodes.Mario__MarioBodyMat01.geometry} material={materials.MarioBodyMat01} skeleton={nodes.Mario__MarioBodyMat01.skeleton} />
              <skinnedMesh castShadow receiveShadow name="Mario__MarioFaceMat00" geometry={nodes.Mario__MarioFaceMat00.geometry} material={materials.MarioMetalMat00} skeleton={nodes.Mario__MarioFaceMat00.skeleton} />
              <skinnedMesh castShadow receiveShadow name="Mario__MarioMetalMat00" geometry={nodes.Mario__MarioMetalMat00.geometry} material={materials.MarioMetalMat00} skeleton={nodes.Mario__MarioMetalMat00.skeleton} />
              <skinnedMesh castShadow receiveShadow name="Mario__MarioShoesMat00" geometry={nodes.Mario__MarioShoesMat00.geometry} material={materials.MarioShoesMat00} skeleton={nodes.Mario__MarioShoesMat00.skeleton} />
            </skinnedMesh>
            <skinnedMesh castShadow receiveShadow name="Eyeball__MarioEyeMat00" geometry={nodes.Eyeball__MarioEyeMat00.geometry} material={materials.MarioEyeMat00} skeleton={nodes.Eyeball__MarioEyeMat00.skeleton} />
            <skinnedMesh castShadow receiveShadow name="HandL00__MarioHandMat00" geometry={nodes.HandL00__MarioHandMat00.geometry} material={materials.MarioHandMat00} skeleton={nodes.HandL00__MarioHandMat00.skeleton} />
            <skinnedMesh castShadow receiveShadow name="HandR00__MarioHandMat00" geometry={nodes.HandR00__MarioHandMat00.geometry} material={materials.MarioHandMat00} skeleton={nodes.HandR00__MarioHandMat00.skeleton} />
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/player/mario.glb')
