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

const debug = true;

const sunState = await useAsyncState("sun.sun");

const motion1 = useNewBoolean(
  await useAsyncState("binary_sensor.0x00124b0025091116_occupancy"),
  debug
);

const motion2State = await useAsyncState(
  "binary_sensor.0x00124b0025090f28_occupancy"
);

const motion2 = useNewBoolean(motion2State, debug);

debugger;

const lx = useLumen("sensor.0xe0798dfffebf23d7_illuminance_lux");

const lightState = await useAsyncState("light.flur_deckenlicht");

const state = useNewLight(lightState, debug);

const lightShouldBeOn = computed(() => {
  // Sun is above horizon, no light needed
  if (sunState.value.state === "above_horizon") {
    if (!lx.value || lx.value > 22) {
      if (!state.value) {
        return false;
      }
    }
  }

  return motion1.value || motion2.value;
});

watch(lightShouldBeOn, (lightShouldBeOn) => {
  console.log({ lightShouldBeOn });
});

setInterval(() => {
  console.log("interval", { lightShouldBeOn: lightShouldBeOn.value });
}, 1000);

const brightness = useBrightness({
  maxBrigthness: 140,
});

useLightMapping({
  entity: state,
  expectedValue: lightShouldBeOn,
  expectedBrightness: brightness,
  isDisabled: useNewBoolean(
    await useAsyncState("input_boolean.flur_disableauto_state")
  ),
  isDisabledBrightness: useNewBoolean(
    await useAsyncState("input_boolean.flur_disableauto_brightness")
  ),
  autoEnableTime: await useAsyncState("input_text.flur_disableauto_state_time"),
  autoEnableTimeBrightness: await useAsyncState(
    "input_text.flur_disableauto_brightness_time"
  ),
  debug,
});
