import React, { useEffect, useMemo } from "react";
import { useFrame, useGraph } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import { useGameStore } from "../store/store";
import {
  AnimationMixer,
  Color,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from "three";
import CSM from "three-custom-shader-material/vanilla";
export function Luma(props) {
  const group = React.useRef();
  const { scene, animations } = useGLTF("./models/npc/luma.glb");
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);
  const mixerRef = React.useRef();

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

    void main() {
      vec3 mainColor = vec3(1.0, 0.8745, 0.0); // bright yellow-orange

      float upwardness = dot(normalize(vNormal), vec3(0.0, 1.0, 0.0));
      upwardness = clamp(upwardness, 0.0, 0.6);

      float levels = 12.0;
      float stepped = floor((1. - upwardness) * levels) / levels;

      vec3 shaded = mainColor * stepped;

      csm_DiffuseColor = vec4(shaded, 1.0);
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
    [fragmentShader, vertexShader],
  );

  useEffect(() => {
    if (!group.current || animations.length === 0) return;
    materials.Body = lumaMaterial;

    mixerRef.current = new AnimationMixer(group.current);
    const idleClip = animations.find((clip) => clip.name === "Luma Idle");
    if (idleClip) {
      const action = mixerRef.current.clipAction(idleClip);
      action.play();
    }

    return () => mixerRef.current?.stopAllAction();
  }, [animations]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);

    const playerPosition = useGameStore.getState().playerPosition;
    if (playerPosition) {
      const { x, y, z } = playerPosition;
      group.current.lookAt(x, y, z);
    }
  });

  return (
    <group
      ref={group}
      {...props}
      position={[0, -1, 5]}
      dispose={null}
      scale={1.4}
    >
      <group name="Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
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
