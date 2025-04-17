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
    directionalLight.current.position.x = playerPosition.x + 5;
    directionalLight.current.target.position.x = playerPosition.x;

    directionalLight.current.position.y = playerPosition.y + 5;
    directionalLight.current.target.position.y = playerPosition.y;

    directionalLight.current.position.z = playerPosition.z + 5;
    directionalLight.current.target.position.z = playerPosition.z;

    directionalLight.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
    <ambientLight intensity={3} color={"#ccccff"} />
      <directionalLight
      castShadow
      ref={directionalLight}
      position={[0, 0, 0]}
      intensity={1}
      color={"#9cf5ff"}
      // shadow-normalBias={0.04}
      shadow-bias={-0.001}
      shadow-mapSize={[1024, 1024]}
      // layers={1}
      
    >
      <orthographicCamera
        attach="shadow-camera"
        near={1}
        far={30}
        top={30}
        right={30}
        left={-30}
        bottom={-30}
      >
        {/* <Helper type={CameraHelper} /> */}
      </orthographicCamera>
    </directionalLight>
    </>
  );
};
