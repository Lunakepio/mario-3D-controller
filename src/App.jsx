import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { PlayerController } from "./PlayerController";
import {
  OrbitControls,
  Environment,
  KeyboardControls,
} from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { Lighting } from "./Lighting";
import { Dust } from "./particles/Dust";
import { MobileControls } from "./mobile/MobileControls";
import { Coin } from "./coins/Coin";
import { Coins } from "./coins/Coins";

function App() {
  const controls = [
    { name: "forward", keys: ["ArrowUp", "KeyW"] },
    { name: "back", keys: ["ArrowDown", "KeyS"] },
    { name: "left", keys: ["ArrowLeft", "KeyA"] },
    { name: "right", keys: ["ArrowRight", "KeyD"] },
    { name: "jump", keys: ["Space"] },
  ];

  return (
    <>
      <div className="canvas-container">
        <MobileControls />
        <Canvas shadows>
          <Suspense fallback={"loading..."}>
            <Lighting/>
            <Dust/>
            {/* <Coin/> */}
            <Physics timeStep={"vary"} gravity={[0, -9.81, 0]}>
            <Coins/>
              <KeyboardControls map={controls}>
                <PlayerController />
              </KeyboardControls>
              <RigidBody type="fixed" name="ground" userData={{ ground : true}}>
                <mesh castShadow receiveShadow position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[50, 50]} />
                  <meshStandardMaterial color={"#FF0000"} />
                </mesh>
              </RigidBody>
            </Physics>
          </Suspense>
          {/* <OrbitControls /> */}
          <Environment preset="warehouse" />
        </Canvas>
      </div>
    </>
  );
}

export default App;
