import {
  computed,
  useBrightness,
  useAsyncState,
  useNewBoolean,
  useNewLight,
  useLightMapping,
  watch,
} from "../mod.ts";
import { useLumen } from "./lx.ts";

const sunState = await useAsyncState("sun.sun");

const motion1 = await useAsyncState(
  "binary_sensor.0x00124b0025091116_occupancy"
);
const motion2 = await useAsyncState(
  "binary_sensor.0x00124b0025090f28_occupancy"
);

const lx = useLumen("sensor.0xe0798dfffebf23d7_illuminance_lux");

const lightState = await useAsyncState("light.flur_deckenlicht");

const state = useNewLight(lightState, true);

const lightShouldBeOn = computed(() => {
  // Sun is above horizon, no light needed
  if (sunState.value.state === "above_horizon") {
    if (!lx.value || !state.value || lx.value > 22) {
      if (!state.value) {
        return false;
      }
    }
  }

  return motion1.value?.state === "on" || motion2.value?.state === "on";
});

watch(
  lightShouldBeOn,
  (lightShouldBeOn) => {
    console.log({ lightShouldBeOn });
  },
  { immediate: true }
);

const brightness = useBrightness({
  maxBrigthness: 140,
});

useLightMapping({
  entity: state,
  expectedValue: lightShouldBeOn,
  expectedBrightness: brightness,
  isDisabled: useNewBoolean(
    await useAsyncState("input_boolean.flur_disableauto_state"),
    true
  ),
  isDisabledBrightness: useNewBoolean(
    await useAsyncState("input_boolean.flur_disableauto_brightness"),
    true
  ),
  autoEnableTime: await useAsyncState("input_text.flur_disableauto_state_time"),
  autoEnableTimeBrightness: await useAsyncState(
    "input_text.flur_disableauto_brightness_time"
  ),
  debug: true,
});
