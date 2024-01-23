import { UseNewLightEntity } from "./useNewLight.ts";
import { UseNewBooleanEntity } from "./useNewBoolean.ts";
import {
  watch,
  unref,
  parseDuration as parse,
  computed,
  useNow,
  subMilliseconds,
  reactive,
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
}: UseLightMappingOptions): void {
  const localEntity = reactive({
    value: entity.value,
    brightness: entity.brightness,
    lastChanged: entity.lastChanged,
  });

  watch(
    () => ({
      value: entity.value,
      brightness: entity.brightness,
      lastChanged: entity.lastChanged,
    }),
    (newEntityState, oldEntityState) => {
      localEntity.value = newEntityState.value;
      localEntity.brightness = newEntityState.brightness;
      localEntity.lastChanged = newEntityState.lastChanged;

      if (
        newEntityState.value !== unref(expectedValue) &&
        isDisabled &&
        !isDisabled.value
      ) {
        if (debug) {
          console.log(`automation_toggle(${entity.entity_id}): value`);
        }
        isDisabled.lastChanged = new Date();
        isDisabled.value = true;
      } else {
        if (debug) {
          console.log(
            `automation_toggle(${
              entity.entity_id
            }): value - no toggle newEntityState=${
              newEntityState.value
            } expectedValue=${unref(expectedValue)} isDisabled=${!!isDisabled}`
          );
        }
      }

      const expectedBrightnessValue = expectedBrightness
        ? unref(expectedBrightness)
        : null;

      if (!expectedBrightnessValue) {
        return;
      }

      if (
        newEntityState.value &&
        isDisabledBrightness &&
        (newEntityState.brightness > expectedBrightnessValue ||
          newEntityState.brightness < expectedBrightnessValue) &&
        /** Skip initial value, because it might be different. Let it sync first */
        oldEntityState.value &&
        !isDisabledBrightness.value
      ) {
        if (debug) {
          console.log(`automation_toggle(${entity.entity_id}): brightness`);
        }
        isDisabledBrightness.lastChanged = new Date();
        isDisabledBrightness.value = true;
      }
    }
  );

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
        isDisabled.lastChanged = new Date();
        isDisabled.value = false;
      }
      if (newShouldReEnableSinceBrightness >= 0 && isDisabledBrightness) {
        if (debug) {
          console.log(
            `isDisabledBrightness(${entity.entity_id}): reset time=${newShouldReEnableSinceBrightness}`
          );
        }
        isDisabledBrightness.lastChanged = new Date();
        isDisabledBrightness.value = false;
      }
    },
    { immediate: true }
  );

  const valueTimeSinceUnsync = computed(() => {
    if (isDisabled?.value) {
      return -1;
    }
    if (
      localEntity.value !== unref(expectedValue) &&
      /** Just use this as clock source, not for the actual calculation, because it might be behind */ now.value
    ) {
      return new Date().getTime() - localEntity.lastChanged.getTime();
    }
    return -1;
  });

  const brightnessTimeSinceUnsync = computed(() => {
    if (isDisabledBrightness?.value) {
      return -1;
    }
    if (
      localEntity.value &&
      expectedBrightness &&
      localEntity.brightness !== unref(expectedBrightness) &&
      /** Just use this as clock source, not for the actual calculation, because it might be behind */
      now.value
    ) {
      return new Date().getTime() - localEntity.lastChanged.getTime();
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
            )} current=${localEntity.value}`
          );
        }
        entity.value = unref(expectedValue);
      }

      const expectedBrightnessValue = unref(expectedBrightness);

      if (newBrightnessTime >= 0 && expectedBrightnessValue) {
        if (debug) {
          console.log(
            `out_of_sync(${entity.entity_id}): brightness time=${newBrightnessTime} expected=${expectedBrightnessValue} current=${localEntity.brightness}`
          );
        }
        entity.brightness = expectedBrightnessValue;
      }
    },
    { immediate: true }
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
  const defaultValue = 15 * 60 * 1000;

  return computed(() => {
    if (!input) {
      return defaultValue;
    }
    let value = unref(input);
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "object") {
      value = value.state;
    }
    return parse(value, "ms") ?? defaultValue;
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

    /** Just use this as clock source, not for the actual calculation, because it might be behind */
    const now = unref(nowSource);
    if (!now) {
      return -1;
    }

    const resetTime = unref(resetTimeSource);

    const lastChanged = entity.lastChanged;

    const diffDate = subMilliseconds(new Date(), resetTime);

    if (lastChanged < diffDate) {
      return diffDate.getTime() - lastChanged.getTime();
    }

    return -1;
  });
}
