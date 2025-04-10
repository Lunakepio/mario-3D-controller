import { Joystick } from "./react-joystick-component/src";
import { useGameStore } from "../store/store";

export const JoystickComponent = () => {
  const setJoystick = useGameStore((state) => state.setJoystick);

  const handleMove = (e) => {
    setJoystick(e);
  };

  const handleStop = (e) => {
    setJoystick(e);
  };


  return (
    <div className="bottom-left">
      <Joystick
        size={104}
        sticky={false}
        baseColor="rgb(215, 215, 215)"
        stickColor="rgb(255, 255, 255)"
        move={handleMove}
        stop={handleStop}
      ></Joystick>
     
    </div>
  );
};
