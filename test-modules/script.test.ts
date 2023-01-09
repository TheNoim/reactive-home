import { useBoolean, watch, useBrightness } from "../mod.ts";

// const simulation = useBoolean("input_boolean.wohnzimmer_simulate_epo");

// watch(simulation, (newValue) => {
//   console.log({ newValue });
// });

// setTimeout(() => {
//   simulation.bool = !simulation.bool;
// }, 1000);

const brightness = useBrightness();

watch(
  brightness,
  (newValue) => {
    console.log({ newValue });
  },
  { immediate: true }
);
