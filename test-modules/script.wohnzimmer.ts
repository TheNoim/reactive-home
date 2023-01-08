import {
  computed,
  watch,
  useState,
  useStateForDuration,
  mapState,
  useBrightness,
} from "../reactive_home/src/mod.ts";

// const epoWohnzimmer = useState("input_boolean.wohnzimmer_simulate_epo");
const epoWohnzimmer = useState("binary_sensor.occupancy");
const motionWohnzimmer = useState("binary_sensor.0x00124b00250907a0_occupancy");
const motionWohnzimmerOnFor20Sec = useStateForDuration(
  "binary_sensor.0x00124b00250907a0_occupancy",
  "on",
  20,
  "off"
);
const appleTv = useState("media_player.nils_zimmer_tv");
const sunState = useState("sun.sun");

const lightShouldBeOn = computed(() => {
  // Sun is above horizon, no light needed
  if (sunState.value?.state === "above_horizon") {
    return false;
  }

  // If the EP1 is on or the apple tv is playing something, then there is someone and the lights should be on
  if (
    epoWohnzimmer.value?.state === "on" ||
    appleTv.value?.state === "playing"
  ) {
    return true;
  }

  // If the motion sensor is on for over 20s, but the EP1 not, then turn the lights off
  if (
    motionWohnzimmer.value?.state === "on" &&
    !(motionWohnzimmerOnFor20Sec.value && epoWohnzimmer.value?.state === "off")
  ) {
    return false;
  }

  return motionWohnzimmer.value?.state === "on";
});

// mapBooleanToLight(lightShouldBeOn, "light.0x8cf681fffe01c005", {
//   reSyncAfter: 1000 * 60 * 60,
//   debug: true,
// });

// watch(lightShouldBeOn, (newValue) => console.log(newValue));

const brightness = useBrightness();

watch(
  () => brightness.value,
  (newBrightness) => console.log({ newBrightness }),
  { immediate: true }
);

mapState({
  entity: "light.0x8cf681fffe01c005",
  desiredState: lightShouldBeOn,
  desiredBrightness: brightness,
  debug: true,
  overwriteEntity: "input_boolean.wohnzimmer_disableauto_state",
  overwriteBrightnessEntity: "input_boolean.wohnzimmer_disableauto_brightness",
  overwriteReset: useState("input_text.wohnzimmer_disableauto_statetime"),
  overwriteBrightnessReset: useState(
    "input_text.wohnzimmer_disableauto_state_brightness"
  ),
});
