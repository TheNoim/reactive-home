import { UseNewLightEntity } from "./useNewLight.ts";
import { UseNewBooleanEntity } from "./useNewBoolean.ts";
import {
  watch,
  unref,
  parseDuration as parse,
  computed,
  useNow,
  subMilliseconds,
} from "../dep.ts";
import type { MaybeRef } from "../lib/types.ts";
import type { HassEntity, Ref } from "../dep.ts";

export function useLightMapping({
  entity,
  expectedValue,
  expectedBrightness,
  isDisabled,
  isDisabledBrightness,
  debug,
  autoEnableTime,
  autoEnableTimeBrightness,
}: UseLightMappingOptions) {
  watch(entity, (newEntityState, oldEntityState) => {
    if (newEntityState.value !== unref(expectedValue) && isDisabled) {
      if (debug) {
        console.log(`automation_toggle(${newEntityState.entity_id}): value`);
      }
      isDisabled.value = true;
    }

    if (
      expectedBrightness &&
      newEntityState.value &&
      isDisabledBrightness &&
      unref(expectedBrightness) !== newEntityState.brightness &&
      /** Skip initial value, because it might be different. Let it sync first */
      oldEntityState.value
    ) {
      if (debug) {
        console.log(
          `automation_toggle(${newEntityState.entity_id}): brightness`
        );
      }
      isDisabledBrightness.value = true;
    }
  });

  const autoEnableTimeParsed = parseAutoEnableTimeFactory(autoEnableTime);

  const autoEnableTimeBrightnessParsed = parseAutoEnableTimeFactory(
    autoEnableTimeBrightness
  );

  const now = useNow({ interval: 1000 });

  const shouldReEnableSince = shouldReEnableSinceFactory(
    autoEnableTimeParsed,
    now,
    isDisabled
  );

  const shouldReEnableSinceBrightness = shouldReEnableSinceFactory(
    autoEnableTimeBrightnessParsed,
    now,
    isDisabledBrightness
  );

  watch(
    [shouldReEnableSince, shouldReEnableSinceBrightness],
    ([newShouldReEnableSince, newShouldReEnableSinceBrightness]) => {
      if (newShouldReEnableSince >= 0 && isDisabled) {
        if (debug) {
          console.log(
            `isDisabled(${entity.entity_id}): reset time=${newShouldReEnableSince}`
          );
        }
        isDisabled.value = false;
      }
      if (newShouldReEnableSinceBrightness >= 0 && isDisabledBrightness) {
        if (debug) {
          console.log(
            `isDisabledBrightness(${entity.entity_id}): reset time=${newShouldReEnableSinceBrightness}`
          );
        }
        isDisabledBrightness.value = false;
      }
    },
    { immediate: true }
  );

  const valueTimeSinceUnsync = computed(() => {
    if (isDisabled?.value) {
      return -1;
    }
    if (entity.value !== unref(expectedValue)) {
      return now.value.getTime() - entity.lastChanged.getTime();
    }
    return -1;
  });

  const brightnessTimeSinceUnsync = computed(() => {
    if (isDisabledBrightness?.value) {
      return -1;
    }
    if (
      entity.value &&
      expectedBrightness &&
      entity.brightness !== unref(expectedBrightness)
    ) {
      return now.value.getTime() - entity.lastChanged.getTime();
    }
    return -1;
  });

  watch(
    [valueTimeSinceUnsync, brightnessTimeSinceUnsync],
    ([newValueTime, newBrightnessTime]) => {
      if (newValueTime >= 0) {
        if (debug) {
          console.log(
            `out_of_sync(${
              entity.entity_id
            }): value time=${newValueTime} expected=${unref(
              expectedValue
            )} current=${entity.value}`
          );
        }
        entity.value = unref(expectedValue);
      }

      const expectedBrightnessValue = unref(expectedBrightness);

      if (newBrightnessTime >= 0 && expectedBrightnessValue) {
        if (debug) {
          console.log(
            `out_of_sync(${entity.entity_id}): brightness time=${newBrightnessTime} expected=${expectedBrightnessValue} current=${entity.brightness}`
          );
        }
        entity.brightness = expectedBrightnessValue;
      }
    }
  );
}

export type UseLightMappingOptions = {
  entity: UseNewLightEntity;

  expectedValue: MaybeRef<boolean>;
  expectedBrightness?: MaybeRef<number>;

  isDisabled?: UseNewBooleanEntity;
  isDisabledBrightness?: UseNewBooleanEntity;

  autoEnableTime?: MaybeRef<number | HassEntity | string>;
  autoEnableTimeBrightness?: MaybeRef<number | HassEntity | string>;

  debug?: boolean;
};

export function parseAutoEnableTimeFactory(
  input?: MaybeRef<number | HassEntity | string>
) {
  return computed(() => {
    if (!input) {
      return 15 * 60 * 1000;
    }
    let value = unref(input);
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "object") {
      value = value.state;
    }
    console.log({ value, input });
    return parse(value, "ms");
  });
}

/**
 * Calculate time since `entity` requires a reset
 * @param resetTimeSource Time in ms after which the entity should reset
 * @param nowSource useNow() source
 * @param entity Entity to reset
 * @returns Time since the entity requires a reset
 */
export function shouldReEnableSinceFactory(
  resetTimeSource: Ref<number>,
  nowSource: Ref<Date>,
  entity?: UseNewBooleanEntity
) {
  return computed(() => {
    if (!entity || !entity.value) {
      return -1;
    }

    const now = unref(nowSource);

    const resetTime = unref(resetTimeSource);

    const lastChanged = entity.lastChanged;

    const diffDate = subMilliseconds(now, resetTime);

    if (lastChanged < diffDate) {
      return diffDate.getTime() - lastChanged.getTime();
    }

    return -1;
  });
}
