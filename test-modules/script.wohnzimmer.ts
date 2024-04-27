import {
  computed,
  useAsyncState,
  useLightMapping,
  useNewLight,
  useNewBoolean,
} from "../mod.ts";

// const epoWohnzimmer = useState("input_boolean.wohnzimmer_simulate_epo");
const epoWohnzimmer = await useAsyncState(
  "binary_sensor.wohnzimmer_epo_occupancy"
);
const appleTv = await useAsyncState("media_player.nils_zimmer_tv");
const sunState = await useAsyncState("sun.sun");
const tischPower = await useAsyncState("sensor.wohnzimmer_tisch_energy_power");
const tisch = useNewLight(await useAsyncState("light.wohnzimmer_tisch"));
const toDark = useNewBoolean(
  await useAsyncState("input_boolean.wohnzimmer_todark")
);

const luftungsmodus = await useAsyncState("input_boolean.luftungsmodus");

const lightShouldBeOn = computed(() => {
  if (luftungsmodus.value.state === "on") {
    return false;
  }

  // Sun is above horizon, no light needed
  if (sunState.value?.state === "above_horizon") {
    // if (!lx.value || lx.value > 8) {
    //   return false;
    // }
    if (!toDark.value) {
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

  return false;
});

const tischSchouldBeOn = computed(() => {
  if (luftungsmodus.value.state === "on") {
    return false;
  }

  if (lightShouldBeOn.value) {
    return true;
  }

  if (tisch.value && parseFloat(tischPower.value.state) > 5) {
    return true;
  }

  return false;
});

// const brightness = useBrightness();
const brightness = computed(() => 254);

const lichtSchrankKugel = useNewLight(
  await useAsyncState("light.0x2c1165fffed484a7"),
  true
);
const lichtSofaKugel = useNewLight(
  await useAsyncState("light.0x8cf681fffe01c005"),
  true
);

const isDisabled = useNewBoolean(
  await useAsyncState("input_boolean.wohnzimmer_disableauto_state"),
  true
);

const isDisabledTisch = useNewBoolean(
  await useAsyncState("input_boolean.wohnzimmer_tisch_disableauto_state"),
  true
);

const isDisabledBrightness = useNewBoolean(
  await useAsyncState("input_boolean.wohnzimmer_disableauto_brightness"),
  true
);

const autoEnableTime = await useAsyncState(
  "input_text.wohnzimmer_disableauto_statetime"
);

const autoEnableTimeTisch = await useAsyncState(
  "input_text.wohnzimmer_tisch_disableauto_state_time"
);

const autoEnableTimeBrightness = await useAsyncState(
  "input_text.wohnzimmer_disableauto_state_brightness"
);

useLightMapping({
  entity: lichtSchrankKugel,
  expectedValue: lightShouldBeOn,
  expectedBrightness: brightness,
  isDisabled,
  isDisabledBrightness,
  autoEnableTime,
  autoEnableTimeBrightness,
  debug: true,
});

useLightMapping({
  entity: lichtSofaKugel,
  expectedValue: lightShouldBeOn,
  expectedBrightness: brightness,
  isDisabled,
  isDisabledBrightness,
  autoEnableTime,
  autoEnableTimeBrightness,
  debug: true,
});

useLightMapping({
  entity: tisch,
  expectedValue: tischSchouldBeOn,
  isDisabled: isDisabledTisch,
  autoEnableTime: autoEnableTimeTisch,
  debug: true,
});
