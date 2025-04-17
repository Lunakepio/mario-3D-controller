import React, { memo, useEffect, useMemo, useRef } from 'react'
import { useGraph, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, useKeyboardControls } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { useGameStore } from '../../store/store'
import { LoopOnce, Color } from 'three'
import { maxSpeed } from '../../constants'
import CSM from "three-custom-shader-material/vanilla";
import gsap from 'gsap'


const vertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormalView;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;

  vNormalView = normalize((viewMatrix * modelMatrix * vec4(normal, 0.0)).xyz);
  csm_PositionRaw = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`;


const fragmentShader = /* glsl */ `
uniform vec3 fresnelColor;
uniform float fresnelPower;
uniform float fresnelIntensity;
uniform bool shouldFresnelBeLighter;

varying vec2 vUv;
varying vec3 vNormalView;
varying vec3 vPosition;


void main() {

  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  float fresnelRaw = 1.0 - dot(normalize(vNormalView), viewDir);
  float fresnel = smoothstep(0.3, 1.0, fresnelRaw) * fresnelIntensity;
  if(shouldFresnelBeLighter){
    fresnel *= 0.2;
  }

  vec3 baseColor = texture2D(map, vUv).rgb;
  vec3 finalColor = mix(baseColor, fresnelColor, fresnel);


  csm_DiffuseColor = vec4(finalColor, 1.0);
}

`;


const Mario = ({speedRef}) => {
  const group = useRef()
  const { scene, animations } = useGLTF('/models/player/mario.glb')
  const clone = React.useMemo(() => {
    const cloned = SkeletonUtils.clone(scene)

    return cloned
  }, [scene])
  const { nodes, materials } = useGraph(clone)
  const { actions } = useAnimations(animations, group)

  const currentAction = useRef()

  const excludeKeywords = useMemo(() => ['eye'], []);
  const lighterFresnel = useMemo(() => ['shoes', 'metal', 'face', 'hige'], []);
  const twirlAnimationRef = useRef();
  let twirlProgress = 0;
  let shouldTwirl = false;
    const [, get] = useKeyboardControls();
    const setIsTwirling = useGameStore((state) => state.setIsTwirling);
  useEffect(() => {

    for (const key in materials) {
      const originalMat = materials[key]
      const matName = originalMat?.name?.toLowerCase() || '';

      const shouldExclude = excludeKeywords.some(keyword => matName.includes(keyword));
      const shouldLightenFresnel = lighterFresnel.some(keyword => matName.includes(keyword));
      if (!originalMat || !originalMat.map || shouldExclude) continue
  
      materials[key] = new CSM({
        baseMaterial: originalMat,
        vertexShader,
        fragmentShader,
        uniforms: {
          fresnelColor: { value: new Color(0xffffff).multiplyScalar(4) },
          fresnelPower: { value: 5. },
          fresnelIntensity: { value: 0.1},
          cameraPosition: { value: new Color() },
          shouldFresnelBeLighter: { value: shouldLightenFresnel},
        },
      })
    }
    if(group.current){
      twirlAnimationRef.current = gsap.to(group.current.rotation, {y: Math.PI * 8, duration: 0.6, ease: "expo.out", paused: true})
    }
    
  }, [excludeKeywords, lighterFresnel, materials])

  useFrame((state, delta) => {
    const animation = shouldTwirl ? 'fall' : useGameStore.getState().playerAnimation;
    const nextAction = actions[animation];
  
    if (!nextAction) return;
    const { twirl } = get();
  
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
        animation === "jump" || animation === "twirl"
          ? 20
          : animation === "land"
          ? 10
          : 1 + 5 * speedRef.current / maxSpeed;
      currentAction.current.setEffectiveTimeScale(animationSpeed);
    }
    twirlAnimationRef.current.time(twirlProgress);
    if(twirlProgress < 0.6 && shouldTwirl ){
      twirlProgress += delta;
    }
    if(twirlProgress > 0.6){
      shouldTwirl = false;
    }
    if(twirl){
      shouldTwirl = true
      twirlProgress = 0;
    }

    setIsTwirling(shouldTwirl)

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
/              </group>
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

export default memo(Mario);
