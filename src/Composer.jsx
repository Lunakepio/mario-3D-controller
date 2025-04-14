import { Bloom, EffectComposer } from "@react-three/postprocessing";

export const Composer = () => {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.5}
        luminanceThreshold={1}
        luminanceSmoothing={0.9}
        mipMapBlur={true}
      />
    </EffectComposer>
  );
};
