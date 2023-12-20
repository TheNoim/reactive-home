import {
  computed,
  useAsyncState,
  useNewStateForDuration,
  useLightMapping,
  useNewLight,
  useNewBoolean,
} from "../mod.ts";
import { useLumen } from "./lx.ts";

// const epoWohnzimmer = useState("input_boolean.wohnzimmer_simulate_epo");
const epoWohnzimmer = await useAsyncState("binary_sensor.occupancy");
const motionWohnzimmer = await useAsyncState(
  "binary_sensor.0x00124b00250907a0_occupancy"
);
const motionWohnzimmerOnFor20Sec = useNewStateForDuration(
  motionWohnzimmer,
  "on",
  20,
  "off"
);
const appleTv = await useAsyncState("media_player.nils_zimmer_tv");
const sunState = await useAsyncState("sun.sun");

const lx = useLumen("sensor.illuminance");

const lightShouldBeOn = computed(() => {
  // Sun is above horizon, no light needed
  if (sunState.value?.state === "above_horizon") {
    if (!lx.value || lx.value > 8) {
      return false;
    }
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

// const brightness = useBrightness();
const brightness = computed(() => 254);

const lichtKugelWohnzimmer = useNewLight(
  await useAsyncState("light.0x8cf681fffe01c005")
);

const isDisabled = useNewBoolean(
  await useAsyncState("input_boolean.wohnzimmer_disableauto_state", {
    debug: true,
  })
);

const isDisabledBrightness = useNewBoolean(
  await useAsyncState("input_boolean.wohnzimmer_disableauto_brightness")
);

const autoEnableTime = await useAsyncState(
  "input_text.wohnzimmer_disableauto_statetime"
);

const autoEnableTimeBrightness = await useAsyncState(
  "input_text.wohnzimmer_disableauto_state_brightness"
);

useLightMapping({
  entity: lichtKugelWohnzimmer,
  expectedValue: lightShouldBeOn,
  expectedBrightness: brightness,
  isDisabled,
  isDisabledBrightness,
  autoEnableTime,
  autoEnableTimeBrightness,
  debug: true,
});

const lichtKuechenDecke1 = useNewLight(
  await useAsyncState("light.0x50325ffffe2acaed")
);
const lichtKuechenDecke2 = useNewLight(
  await useAsyncState("light.0x0c4314fffea0421a")
);
const lichtKuechenDecke3 = useNewLight(
  await useAsyncState("light.0x2c1165fffe0cc5bd")
);
const isDisabledKucheDecke = useNewBoolean(
  await useAsyncState("input_boolean.kuche_disableauto_state")
);
const isDisabledBrightnessKucheDecke = useNewBoolean(
  await useAsyncState("input_boolean.kuche_disableauto_brightness")
);
const autoEnableTimeKuecheDecke = await useAsyncState(
  "input_text.kuche_disableauto_state_time"
);
const autoEnableTimeBrightnessKuecheDecke = await useAsyncState(
  "input_text.kuche_disableauto_brightness_time"
);

useLightMapping({
  entity: lichtKuechenDecke1,
  expectedValue: lightShouldBeOn,
  expectedBrightness: brightness,
  isDisabled: isDisabledKucheDecke,
  isDisabledBrightness: isDisabledBrightnessKucheDecke,
  autoEnableTime: autoEnableTimeKuecheDecke,
  autoEnableTimeBrightness: autoEnableTimeBrightnessKuecheDecke,
});

useLightMapping({
  entity: lichtKuechenDecke2,
  expectedValue: lightShouldBeOn,
  expectedBrightness: brightness,
  isDisabled: isDisabledKucheDecke,
  isDisabledBrightness: isDisabledBrightnessKucheDecke,
  autoEnableTime: autoEnableTimeKuecheDecke,
  autoEnableTimeBrightness: autoEnableTimeBrightnessKuecheDecke,
});

useLightMapping({
  entity: lichtKuechenDecke3,
  expectedValue: lightShouldBeOn,
  expectedBrightness: brightness,
  isDisabled: isDisabledKucheDecke,
  isDisabledBrightness: isDisabledBrightnessKucheDecke,
  autoEnableTime: autoEnableTimeKuecheDecke,
  autoEnableTimeBrightness: autoEnableTimeBrightnessKuecheDecke,
});
