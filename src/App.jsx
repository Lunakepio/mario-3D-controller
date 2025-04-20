import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { PlayerController } from "./playerController/PlayerController";
import {
  OrbitControls,
  Environment,
  KeyboardControls,
  Stats,
  Preload,
  Loader
} from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { Lighting } from "./Lighting";
import { Dust } from "./particles/Dust";
import { MobileControls } from "./mobile/MobileControls";
import { Coins } from "./coins/Coins";
import { Luma } from "./models/Luma/Luma";
import { Composer } from "./Composer";
import { LaunchStar } from "./models/launchStar/LaunchStar";
import { World } from "./models/world/GALAXY-WORLD";
import { Path } from "./Path";
import { Particles } from "./Particles";

function App() {
  const controls = [
    { name: "forward", keys: ["ArrowUp", "KeyW"] },
    { name: "back", keys: ["ArrowDown", "KeyS"] },
    { name: "left", keys: ["ArrowLeft", "KeyA"] },
    { name: "right", keys: ["ArrowRight", "KeyD"] },
    { name: "jump", keys: ["Space"] },
    { name: "twirl", keys: ["Shift"]},
  ];

  return (
    <>
      <div className="canvas-container">
        <MobileControls />
        <Canvas shadows>
          <Suspense fallback={"loading..."}>
            {/* <Composer/> */}
            <Particles />
            <Lighting />
            <Dust />
            <Luma />
            <Path />
            <Physics timeStep={"vary"} gravity={[0, -9.81, 0]}>
              {/* <Coins/> */}
              <KeyboardControls map={controls}>
                <PlayerController />
              </KeyboardControls>
              {/* <LaunchStar position={[0, 1, 20]} /> */}
              <World />
              {/* <RigidBody type="fixed" name="ground" userData={{ ground: true }}>
                <mesh
                  castShadow
                  receiveShadow
                  position={[0, -2, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <planeGeometry args={[50, 50]} />
                  <meshStandardMaterial color={"#005ACD"} />
                </mesh>
              </RigidBody> */}
            </Physics>
          </Suspense>
          <Preload all />
          {/* <Stats /> */}
          {/* <OrbitControls /> */}
          <Environment
            files={[
              "/env/px.png",
              "/env/nx.png",
              "/env/py.png",
              "/env/ny.png",
              "/env/pz.png",
              "/env/nz.png",
            ]}
            environmentIntensity={0}
            background
          />
        </Canvas>
        {/* <Loader /> */}
      </div>
    </>
  );
}

export default App;
