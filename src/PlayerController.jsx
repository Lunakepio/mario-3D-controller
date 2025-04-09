import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mario } from "./models/Mario";
import { CapsuleCollider, RigidBody, useRapier } from "@react-three/rapier";
import { useKeyboardControls } from "@react-three/drei";
import { MathUtils, Vector3 } from "three";
import { useGameStore } from "./store/store";
import { maxSpeed } from "./constants";

export const PlayerController = () => {
  const playerRef = useRef();
  const rbRef = useRef();

  const cameraPositionRef = useRef();
  const lookAtPositionRef = useRef();
  const speedRef = useRef(0);

  const setPlayerAnimation = useGameStore((state) => state.setPlayerAnimation);
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const [, get] = useKeyboardControls();
  const { lerp } = MathUtils;

  let isJumpHeld = false;
  let landingDuration = 0.4;

  const { world, rapier } = useRapier();

  const ground = useRef(null);
  const hasJustLanded = useRef(false);

  
  useFrame((state, delta) => {
    if (
      !playerRef.current ||
      !rbRef.current ||
      !cameraPositionRef.current ||
      !lookAtPositionRef.current
    )
      return;

    const camera = state.camera;
    const { forward, back, left, right, jump } = get();

    playerRef.current.rotation.y = lerp(
      playerRef.current.rotation.y,
      playerRef.current.rotation.y + Number(left) - Number(right) + (Number(back) * Math.PI),
      3 * delta
    );
    const playerRotation = playerRef.current.rotation.y;

    const forwardDirection = new Vector3(
      Math.sin(playerRotation),
      0,
      Math.cos(playerRotation)
    );

    if(ground.current){
      speedRef.current = lerp(speedRef.current, forward ? maxSpeed : 0, 4 * delta);
    }

    if (rbRef.current.linvel().y > 2 && !ground.current) {
      setPlayerAnimation("jump");
    } else if (rbRef.current.linvel().y < 2 && !ground.current) {
      setPlayerAnimation("fall");
      rbRef.current.setGravityScale(2.1);
    } else if (hasJustLanded.current) {
      setPlayerAnimation("land");
      landingDuration -= delta;
    } else {
      if(ground.current){
        setPlayerAnimation(
          speedRef.current > 2 ? "run" :
          speedRef.current > 0.1 ? "walk" : "idle"
        );
        rbRef.current.setGravityScale(1.2);

      }
    }
    

    const ray = new rapier.Ray(rbRef.current.translation(), {
      x: 0,
      y: -1,
      z: 0,
    });

    const raycastResult = world.castRayAndGetNormal(
      ray,
      1,
      false,
      undefined,
      undefined,
      undefined,
      rbRef.current.translation()
    );


    if (raycastResult) {
      const collider = raycastResult.collider;

      const userData = collider.parent()?.userData;
      const wasGrounded = ground.current;
      ground.current = Boolean(userData);
      
      if (!wasGrounded && ground.current) {
        hasJustLanded.current = true;
        landingDuration = 0.4;
      }
      
      if (hasJustLanded.current) {
        landingDuration -= delta;
        if (landingDuration <= 0) {
          hasJustLanded.current = false;
        }
      }
      
    }
    rbRef.current.setLinvel({
      x: forwardDirection.x * speedRef.current,
      y: rbRef.current.linvel().y,
      z: forwardDirection.z * speedRef.current,
    });

    if (jump && !isJumpHeld && ground.current) {
      rbRef.current.applyImpulse({ x: 0, y: 7, z: 0 }, true);
      isJumpHeld = true;
    }

    if (!jump) {
      isJumpHeld = false;
    }

    rbRef.current.setEnabledRotations(false, true, false, true);

    camera.position.lerp(
      cameraPositionRef.current.getWorldPosition(new Vector3()),
      2 * delta
    );
    camera.lookAt(lookAtPositionRef.current.getWorldPosition(new Vector3()));
    setPlayerPosition(rbRef.current.translation());

  });

  return (
    <RigidBody ccd canSleep={false} colliders={false} ref={rbRef}>
      <CapsuleCollider args={[0.3, 0.5]} />
      <group ref={playerRef}>
        <group ref={cameraPositionRef} position={[0, 2, -6]} />
        <group ref={lookAtPositionRef} />
        <Mario speedRef={speedRef} />
      </group>
    </RigidBody>
  );
};
