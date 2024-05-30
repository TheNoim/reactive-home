import {
  computed,
  useBrightness,
  useNewBoolean,
  useAsyncState,
  useLightMapping,
  useNewLight,
} from "../reactive_home/src/mod.ts";

const testToggle = useNewBoolean(
  await useAsyncState("input_boolean.virtual_test_toggle")
);

const lightShouldBeOn = computed(() => {
  return testToggle.value;
});

const brightness = useBrightness();

useLightMapping({
  entity: useNewLight(await useAsyncState("light.virtual_virtual_test_device")),
  expectedValue: lightShouldBeOn,
  expectedBrightness: brightness,
  isDisabled: useNewBoolean(
    await useAsyncState("input_boolean.testing_virtual_disableauto_state")
  ),
  isDisabledBrightness: useNewBoolean(
    await useAsyncState("input_boolean.testing_virtual_disableauto_brightness"),
    true
  ),
  autoEnableTime: await useAsyncState(
    "input_text.testing_virtual_disableauto_state_time"
  ),
  autoEnableTimeBrightness: await useAsyncState(
    "input_text.testing_virtual_disableauto_brightness_time"
  ),
  debug: true,
});
