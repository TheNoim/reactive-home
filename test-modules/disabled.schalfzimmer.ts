import {
  computed,
  useBrightness,
  useLightMapping,
  useAsyncState,
  useNewBoolean,
  useNewLight,
} from "../mod.ts";
import { whenever } from "../reactive_home/src/dep.ts";

const debug = true;

const motionSensorState = await useAsyncState(
  "binary_sensor.0x00124b0022ebcad9_occupancy"
);

const motionSensor = useNewBoolean(motionSensorState, debug);

const sunState = await useAsyncState("sun.sun");

const lightShouldBeOn = computed(() => {
  // Sun is above horizon, no light needed
  if (sunState.value.state === "above_horizon") {
    return false;
  }

  return motionSensor.value;
});

const brightness = useBrightness({
  minBrigthness: 130,
});

const light = useNewLight(
  await useAsyncState("light.0x2c1165fffee4eabf"),
  debug
);

const isDisabled = useNewBoolean(
  await useAsyncState("input_boolean.schlafzimmer_disableauto_state"),
  debug
);
const isDisabledBrightness = useNewBoolean(
  await useAsyncState("input_boolean.schlafzimmer_disableauto_brightness"),
  debug
);

const lightIsOff = computed(
  () => !light.value && lightShouldBeOn.value === false
);

useLightMapping({
  entity: light,
  expectedValue: lightShouldBeOn,
  expectedBrightness: brightness,
  isDisabled,
  isDisabledBrightness,
  autoEnableTime: await useAsyncState(
    "input_text.schlafzimmer_disableauto_state_time"
  ),
  autoEnableTimeBrightness: await useAsyncState(
    "input_text.schlafzimmer_disableauto_brightness_time"
  ),
  debug,
});

whenever(lightIsOff, () => {
  isDisabled.value = false;
  isDisabledBrightness.value = false;
});
