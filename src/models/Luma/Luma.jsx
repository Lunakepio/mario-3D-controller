import { useEffect, useMemo, useRef } from "react";
import { useFrame, useGraph, useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { AnimationMixer, Color, MeshBasicMaterial, TextureLoader, Vector3 } from "three";
import CSM from "three-custom-shader-material/vanilla";
import { Glow } from "./Glow";
import { Particles } from "./Particles";
import { Particles2 } from "./Particles2";
import { useGameStore } from "../../store/store";
import { vec3 } from "@react-three/rapier";

export function Luma() {
  const group = useRef();
  const { scene, animations } = useGLTF("./models/npc/luma.glb");
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);
  const mixerRef = useRef();
  const boneRef = useRef();
  const lookAtRef = useRef();
  const setLookAtCharacter = useGameStore((state) => state.setLookAtCharacter);
  const noiseTexture = useLoader(
    TextureLoader,
    "./textures/luma/noiseColor.png"
  );

  const vertexShader = /* glsl */ `
  varying vec3 vPosition;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vPosition = position;
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    csm_PositionRaw = modelViewMatrix * vec4(position, 1.);
  }`;

  const fragmentShader = /* glsl */ `
    uniform vec3 emissiveTest;
    // varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
        vec3 mainColor = vec3(4., 0.7, 0.);
    
        float upwardness = dot(normalize(vNormal), vec3(0.0, 1.0, 0.0));
        upwardness = clamp(upwardness, 0.0, 0.7);
    

        float levels = 12.0;
        float stepped = floor((1. - upwardness) * levels) / levels;
        vec3 baseColor = mainColor * stepped;
    
        vec3 fixedDirection = vec3(0.0, 0.0, 1.0);
        vec3 worldFixedDirection = normalize((viewMatrix * vec4(fixedDirection, 0.0)).xyz); 
        float edgeFactor = 1.2 - abs(dot(vNormal, worldFixedDirection));
          

        float edgeBrightness = smoothstep(0.1, 0.8, edgeFactor);
        vec3 edgeColor = mainColor * edgeBrightness * 2.0;
    
        vec3 finalColor = mix(baseColor, edgeColor, edgeBrightness);
    

        csm_DiffuseColor = vec4(finalColor, 1.0);
    }

    `;

  const lumaMaterial = useMemo(
    () =>
      new CSM({
        baseMaterial: new MeshBasicMaterial({}),
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
          emissiveTest: new Color(0xffdf00),
        },
      }),
    [fragmentShader, vertexShader]
  );
  const idleClip = animations.find((clip) => clip.name === "Luma Idle");

  useEffect(() => {
    if (!group.current || animations.length === 0) return;
    // materials.Body = lumaMaterial;

    mixerRef.current = new AnimationMixer(group.current);
    if (idleClip) {
      const action = mixerRef.current.clipAction(idleClip);
      action.play();
    }

    return () => mixerRef.current?.stopAllAction();
  }, [animations, idleClip, lumaMaterial, materials, nodes.Object_9.skeleton.bones]);

  const lookAtRange = 7;
  const targetLookAt = useRef(new Vector3());
const defaultLookAt = new Vector3(0, -1, 0);
  useFrame((state, delta) => {
    if (!boneRef.current || !lookAtRef.current) return;
    mixerRef.current?.update(delta);
  
    const playerPosition = useGameStore.getState().playerPosition;
    const lumaPosition = boneRef.current.getWorldPosition(new Vector3());
  
    if (!playerPosition) return;
  

  
    const isWithinRange =
      lumaPosition.distanceToSquared(playerPosition) < lookAtRange ** 2;
  
    const desiredTarget = isWithinRange ? vec3(playerPosition) : defaultLookAt;
  
    targetLookAt.current.lerp(desiredTarget, 4 * delta); 
  
    boneRef.current.lookAt(targetLookAt.current);
  
    if (isWithinRange) {
      setLookAtCharacter(lumaPosition);
    } else {
      setLookAtCharacter(undefined);
    }
  });

  return (
    <group
      ref={group}
      position={[0, -1, 5]}
      dispose={null}
      scale={1.4}
    >
      <Particles2 />
      <group ref={lookAtRef} position={[0, -1, 0]}></group>
      <group name="Scene">
        <group name="Sketchfab_model" rotation={[Math.PI / 2, Math.PI, 0]}>
          <group
            name="9735264f7a1547e580e7fa7a7d74c891fbx"
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.01}
          >
            <group name="Object_2">
              <group name="RootNode">
                <group
                  name="LumaMesh"
                  position={[0, 0, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  scale={14.32}
                />
                <group
                  name="LumaRig"
                  position={[0, 0, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  scale={100}
                >
                  <group name="Object_6">
                    <primitive object={nodes._rootJoint} />
                    <group
                      name="Object_8"
                      position={[0, 0, 0]}
                      rotation={[-Math.PI / 2, 0, 0]}
                      scale={14.32}
                    />
                    {/* <group ref={glowRef}>
                      <Glow/>
                    </group> */}
                    <primitive
                      ref={boneRef}
                      object={nodes.Object_9.skeleton.bones.find(
                        (bone) => bone.name === "root_00"
                      )}
                    >
                      <Glow />
                      <Particles noiseTexture={noiseTexture} />
                    </primitive>
                    <skinnedMesh
                      name="Object_10"
                      geometry={nodes.Object_10.geometry}
                      material={materials.material}
                      skeleton={nodes.Object_10.skeleton}
                    />
                    <skinnedMesh
                      name="Object_9"
                      geometry={nodes.Object_9.geometry}
                      material={lumaMaterial}
                      skeleton={nodes.Object_9.skeleton}
                    />
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("./models/npc/luma.glb");
