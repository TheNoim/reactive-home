import {
  computed,
  useLightMapping,
  useNewLight,
  useAsyncState,
  useNewBoolean,
  useNewStateForDuration,
} from "../mod.ts";

const sunState = await useAsyncState("sun.sun");

const epo = useNewBoolean(
  await useAsyncState("binary_sensor.occupancy_2"),
  true
);

const motionEntrenceState = await useAsyncState(
  "binary_sensor.arbeitszimmer_eingang_bewegungsmelder_occupancy"
);

const motionEntrence = useNewBoolean(motionEntrenceState);

const motionTableState = await useAsyncState(
  "binary_sensor.arbeitszimmer_schreibtisch_bewegungsmelder_occupancy"
);

const motionTable = useNewBoolean(motionTableState);

const motionEntrenceOnFor40Sec = useNewStateForDuration(
  motionEntrenceState,
  "on",
  40,
  "off"
);

const motionTableOnFor40Sec = useNewStateForDuration(
  motionTableState,
  "on",
  40,
  "off"
);

const lightShouldBeOn = computed(() => {
  // Sun is above horizon, no light needed
  if (sunState.value?.state === "above_horizon") {
    return false;
  }

  // EP1 detects something, there is definitely someone
  if (epo.value) {
    return true;
  }

  const pirDetected = motionEntrence.value || motionTable.value;

  const pir40s = motionEntrenceOnFor40Sec.value || motionTableOnFor40Sec.value;

  // If the motion sensor is on for over 20s, but the EP1 not, then turn the lights off
  if (pirDetected && !(pir40s && !epo.value)) {
    return false;
  }

  return pirDetected;
});

const isDisabled = useNewBoolean(
  await useAsyncState("input_boolean.arbeitszimmer_disableauto_state")
);

const autoEnableTime = await useAsyncState(
  "input_text.arbeitszimmer_disableauto_state_time"
);

const kugel1 = useNewLight(await useAsyncState("light.0x2c1165fffed484a7"));

console.log({ ss: lightShouldBeOn.value, kugel1: kugel1.value });

useLightMapping({
  entity: kugel1,
  expectedValue: lightShouldBeOn,
  isDisabled,
  autoEnableTime,
  debug: true,
});

useLightMapping({
  entity: useNewLight(await useAsyncState("light.0xdc8e95fffee16f80")),
  expectedValue: lightShouldBeOn,
  isDisabled,
  autoEnableTime,
  debug: true,
});
