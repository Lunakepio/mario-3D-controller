import { useFrame } from "@react-three/fiber";

import { useCallback, useRef } from "react";

import Mario from "../models/mario/Mario";

import { CapsuleCollider, RigidBody, useRapier } from "@react-three/rapier";

import { useKeyboardControls } from "@react-three/drei";

import { MathUtils, Vector3 } from "three";

import { useGameStore } from "../store/store";

import { maxSpeed } from "../constants";

import { lerp } from "three/src/math/MathUtils.js";

export const PlayerController = () => {
  const playerRef = useRef();
  const rbRef = useRef();
  const cameraPositionRef = useRef();
  const lookAtPositionRef = useRef();
  const speedRef = useRef(0);
  const { world, rapier } = useRapier();
  const ground = useRef(null);
  const hasJustLanded = useRef(false);

  const setPlayerAnimation = useGameStore((state) => state.setPlayerAnimation);
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);

  const [, get] = useKeyboardControls();

  let isJumpHeld = useRef(false);
  let landingDuration = 0.4;

  const getPlayerInputs = (get) => {
    const { joystick, jumpButtonPressed } = useGameStore.getState();
    const { forward, left, right, jump } = get();
    const backwardJoystick = joystick.y < 0 ? -joystick.y : 0;
    const joystickInfluence = joystick.x * (1 + backwardJoystick);
    return {
      forward,
      left,
      right,
      jump,
      joystickInfluence,
      joystickSpeed: (joystick.distance / 100) * maxSpeed,
      jumpButtonPressed,
    };
  };

  const groundDetection = (delta) => {
    const ray = new rapier.Ray(rbRef.current.translation(), {
      x: 0,
      y: -2,
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
  };

  const movePlayer = (delta, inputs) => {
    const { forward, joystickSpeed, left, right, joystickInfluence } = inputs;
    playerRef.current.rotation.y = lerp(
      playerRef.current.rotation.y,

      playerRef.current.rotation.y -
        joystickInfluence +
        Number(left) -
        Number(right),

      3 * delta
    );
    const playerRotation = playerRef.current.rotation.y;

    const forwardDirection = new Vector3(
      Math.sin(playerRotation),
      0,
      Math.cos(playerRotation)
    );

    if (ground.current) {
      speedRef.current = lerp(
        speedRef.current,
        forward ? maxSpeed : joystickSpeed ? joystickSpeed : 0,
        4 * delta
      );
    }

    rbRef.current.setLinvel({
      x: forwardDirection.x * speedRef.current,
      y: rbRef.current.linvel().y,
      z: forwardDirection.z * speedRef.current,
    });

    playerRef.current.position.set(
      rbRef.current.translation().x,
      rbRef.current.translation().y,
      rbRef.current.translation().z
    );
  };

  const animateMario = (delta) => {
    if (rbRef.current.linvel().y > 2 && !ground.current) {
      setPlayerAnimation("jump");
    } else if (rbRef.current.linvel().y < 2 && !ground.current) {
      setPlayerAnimation("jump");
      rbRef.current.setGravityScale(2.1);
    } else if (hasJustLanded.current) {
      setPlayerAnimation("land");
      landingDuration -= delta;
    } else {
      if (ground.current) {
        setPlayerAnimation(
          speedRef.current > 2
            ? "run"
            : speedRef.current > 0.1
            ? "walk"
            : "idle"
        );
        rbRef.current.setGravityScale(1.2);
      }
    }
  };

  const updatePlayerPosition = () => {
    rbRef.current.setEnabledRotations(false, false, false, true);

    setPlayerPosition(rbRef.current.translation());
  };

  const manageJump = (jump, jumpButtonPressed) => {
    if ((jump || jumpButtonPressed) && !isJumpHeld.current && ground.current) {
      rbRef.current.applyImpulse({ x: 0, y: 7, z: 0 }, true);

      isJumpHeld.current = true;
    }

    if (!jump && !jumpButtonPressed) {
      isJumpHeld.current = false;
    }
  };

  const updateCamera = (camera, delta) => {
    camera.position.lerp(
      cameraPositionRef.current.getWorldPosition(new Vector3()),
      2 * delta
    );

    camera.lookAt(lookAtPositionRef.current.getWorldPosition(new Vector3()));
  };

  
  useFrame((state, delta) => {
    if (
      !playerRef.current ||
      !rbRef.current ||
      !cameraPositionRef.current ||
      !lookAtPositionRef.current
    )
      return;

    const camera = state.camera;

    const { starPosition } = useGameStore.getState();

    const {
      forward,
      left,
      right,
      jump,
      joystickInfluence,
      joystickSpeed,
      jumpButtonPressed,
    } = getPlayerInputs(get);
    groundDetection(delta);

    movePlayer(delta, {
      forward,
      left,
      right,
      joystickInfluence,
      joystickSpeed,
    });
    animateMario(delta);

    manageJump(jump, jumpButtonPressed);
    updateCamera(camera, delta);
    updatePlayerPosition();
  });

  return (
    <>
      <RigidBody ccd canSleep={false} colliders={false} ref={rbRef}>
        <CapsuleCollider args={[0.3, 0.5]} />
      </RigidBody>
      <group ref={playerRef}>
        <group ref={cameraPositionRef} position={[0, 2, -6]} />
        <group ref={lookAtPositionRef} />
        <Mario speedRef={speedRef} />
      </group>
    </>
  );
};
