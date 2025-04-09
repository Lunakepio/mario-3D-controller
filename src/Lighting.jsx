import { useFrame } from "@react-three/fiber";
import { useGameStore } from "./store/store";
import { DirectionalLight, CameraHelper } from "three";
import { useRef } from "react";
import { Helper } from "@react-three/drei";

export const Lighting = () => {


  const directionalLight = useRef(null);

  useFrame(() => {
    const playerPosition = useGameStore.getState().playerPosition;
    if (!playerPosition && !directionalLight.current) return;

    if(playerPosition){
    directionalLight.current.position.x = playerPosition.x - 1;
    directionalLight.current.target.position.x = playerPosition.x;

    directionalLight.current.position.y = playerPosition.y + 10;
    directionalLight.current.target.position.y = playerPosition.y;

    directionalLight.current.position.z = playerPosition.z - 3;
    directionalLight.current.target.position.z = playerPosition.z;

    directionalLight.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      <directionalLight
      castShadow
      ref={directionalLight}
      position={[0, 0, 0]}
      intensity={5}
      color={"#add8e6"}
      // shadow-normalBias={0.04}
      shadow-bias={-0.001}
      shadow-mapSize={[512, 512]}
      // layers={1}
      
    >
      <orthographicCamera
        attach="shadow-camera"
        near={1}
        far={10}
        top={10}
        right={10}
        left={-10}
        bottom={-10}
      >
        {/* <Helper type={CameraHelper} /> */}
      </orthographicCamera>
    </directionalLight>
    </>
  );
};
