import { useFrame } from "@react-three/fiber";

import { useRef } from "react";

import Mario from "../models/mario/Mario";

import { CapsuleCollider, RigidBody, useRapier } from "@react-three/rapier";

import { useKeyboardControls } from "@react-three/drei";

import { MathUtils, Vector3, Quaternion, Euler } from "three";

import { useGameStore } from "../store/store";

import { maxSpeed } from "../constants";

import { lerp } from "three/src/math/MathUtils.js";
import { VFXEmitter } from "wawa-vfx";

export const PlayerController = () => {
  const playerRef = useRef();
  const rbRef = useRef();
  const cameraPositionRef = useRef();
  const lookAtPositionRef = useRef();
  const speedRef = useRef(0);
  const { world, rapier } = useRapier();
  const ground = useRef(null);
  const hasJustLanded = useRef(false);
  const marioRef = useRef();

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

      ground.current = Boolean(userData?.ground);

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
    const { curvePointData, star } = useGameStore.getState();
    if (curvePointData || star) return;
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

  const animateMario = (curvePointData, delta) => {
    if (curvePointData) {
      setPlayerAnimation("fall");
      return;
    }
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
        rbRef.current.setGravityScale(1);
      }
    }
  };

  const updatePlayerPosition = () => {
    rbRef.current.setEnabledRotations(false, false, false, true);
    const { curvePointData, star } = useGameStore.getState();

    if (!curvePointData && !star) {
      setPlayerPosition(rbRef.current.translation());
    } else {
      rbRef.current.setTranslation(
        {
          x: playerRef.current.position.x,
          y: playerRef.current.position.y,
          z: playerRef.current.position.z,
        },
        true
      );
      rbRef.current.setLinvel({
        x: 0,
        y: 0,
        z: 0,
      });
      rbRef.current.setGravityScale(0);
      speedRef.current = 0;
    }
  };

  const manageJump = (jump, jumpButtonPressed) => {
    if ((jump || jumpButtonPressed) && !isJumpHeld.current && ground.current) {
      rbRef.current.applyImpulse({ x: 0, y: 8, z: 0 }, true);

      isJumpHeld.current = true;
    }

    if (!jump && !jumpButtonPressed) {
      isJumpHeld.current = false;
    }
  };

  const updateCamera = (camera, delta, curvePointData, star) => {
    if (curvePointData) {
      const targetPos = curvePointData.getWorldPosition(new Vector3());

      const offset = new Vector3(5, 6, 0);

      const cameraTarget = targetPos.clone().add(offset);

      camera.position.lerp(cameraTarget, 1 * delta);
    } else if (star) {
      const starPosition = star.getWorldPosition(new Vector3());
      const offset = new Vector3(-8, 10, 0);

      const cameraTarget = starPosition.clone().add(offset);

      camera.position.lerp(cameraTarget, 1 * delta);
    } else {
      camera.position.lerp(
        cameraPositionRef.current.getWorldPosition(new Vector3()),
        2 * delta
      );
    }
    camera.lookAt(lookAtPositionRef.current.getWorldPosition(new Vector3()));
  };

  const animateThroughPath = (delta) => {
    const { curvePointData, star } = useGameStore.getState();
    if (curvePointData) {
      const position = curvePointData.getWorldPosition(new Vector3());
      const quat = curvePointData.getWorldQuaternion(new Quaternion());
      playerRef.current.position.lerp(position, 8 * delta);
      playerRef.current.quaternion.slerp(quat, 12 * delta);
    } else {
      if (star) {
        const starPosition = star.getWorldPosition(new Vector3());
        const starQuat = star.getWorldQuaternion(new Quaternion());
        playerRef.current.position.lerp(starPosition, 8 * delta);
        playerRef.current.quaternion.slerp(starQuat, 12 * delta);
      } else {
        playerRef.current.rotation.x = lerp(
          playerRef.current.rotation.x,
          0,
          8 * delta
        );
        playerRef.current.rotation.z = lerp(
          playerRef.current.rotation.z,
          0,
          8 * delta
        );
      }
    }
  };

  const resetPosition = () => {
    if (rbRef.current.translation().y < -10) {
      rbRef.current.setTranslation({ x: 0, y: 2, z: 0 }, true);
      rbRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      speedRef.current = 0;
    }
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

    const { star, curvePointData } = useGameStore.getState();

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
    animateMario(curvePointData, delta);
    animateThroughPath(delta);

    manageJump(jump, jumpButtonPressed);
    updateCamera(camera, delta, curvePointData, star);
    updatePlayerPosition();
    resetPosition();
  });

  return (
    <>
      <RigidBody ccd canSleep={false} colliders={false} ref={rbRef}>
        <CapsuleCollider args={[0.3, 0.5]} />
        {/* <VFXEmitter
          emitter="flying"
          debug={true}
          settings={{
            duration: 4,
            delay: 1,
            nbParticles: 1000,
            spawnMode: "time",
            loop: true,
            startPositionMin: [-0.3, -0.6, -0.3],
            startPositionMax: [0.3, 0.6, 0.3],
            startRotationMin: [0, 0, 0],
            startRotationMax: [0, 0, 0],
            particlesLifetime: [0.1, 5.9],
            speed: [0, 0],
            directionMin: [-0, -0, -0],
            directionMax: [0, 0, 0],
            rotationSpeedMin: [0, 0, 0],
            rotationSpeedMax: [0, 0, 0],
            colorStart: ["#ffffff"],
            colorEnd: ["#ffffff"],
            size: [0.01, 0.04999999999999993],
          }}
        /> */}
      </RigidBody>

      <group rotation-y={Math.PI} ref={playerRef}>
        <group ref={cameraPositionRef} position={[0, 2, -6]} />
        <group ref={lookAtPositionRef} />

        <group ref={marioRef}>
          <Mario speedRef={speedRef} />
        </group>
      </group>
    </>
  );
};
