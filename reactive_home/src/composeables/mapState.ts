import {
  useNow,
  whenever,
  watch,
  computed,
  unref,
  subMilliseconds,
  parseDuration as parse,
} from "../dep.ts";
import { useBoolean } from "./useBoolean.ts";
import { stringBoolToBool } from "../lib/util.ts";
import { useLight } from "./useLight.ts";
import { MaybeRef } from "../lib/types.ts";
import type { HassEntity } from "../dep.ts";
import type { BooleanStates } from "../lib/util.ts";

export type MapStateConfig = {
  entity: string;
  // Helper entity. This entity tells the state mapper that the value was overwritten by a humane
  overwriteEntity?: string;
  overwriteBrightnessEntity?: string;
  // Overwrite reset after (in ms)
  overwriteReset?: MaybeRef<number | HassEntity | null>;
  overwriteBrightnessReset?: MaybeRef<number | HassEntity | null>;

  desiredState: MaybeRef<BooleanStates>;

  desiredBrightness?: MaybeRef<number>;

  debug?: boolean;
};

/**
 * Map a boolean state to a hass light state
 * @param config
 */
export function mapState(config: MapStateConfig) {
  const entityHassState = useLight(config.entity, config.debug);

  const overwriteEntityHassState = config.overwriteEntity
    ? useBoolean(config.overwriteEntity, config.debug)
    : null;

  const overwriteBrightnessEntityHassState = config.overwriteBrightnessEntity
    ? useBoolean(config.overwriteBrightnessEntity, config.debug)
    : null;

  // Detect human overwrite
  watch(
    [
      () => entityHassState.computedBool,
      () => entityHassState.computedLightPct,
    ],
    ([newValue, newLightValue], [oldValue, oldLightValue]) => {
      // Skip initial state
      if (typeof oldValue !== "boolean" || typeof oldLightValue !== "number") {
        if (config.debug) {
          console.log(`computed_change(${config.entity}): skip `, {
            newValue,
            newLightValue,
          });
        }
        return;
      }

      if (config.debug) {
        console.log(`computed_change(${config.entity}): `, {
          newValue,
          newLightValue,
        });
      }

      if (newValue !== unref(config.desiredState)) {
        if (config.debug) {
          console.error(
            `State was overwritten by a humen for ${
              config.entity
            }. Expected ${stringBoolToBool(newValue)} and got ${unref(
              config.desiredState
            )}`
          );
        }
        if (overwriteEntityHassState) {
          overwriteEntityHassState.bool = true;
        }
      }

      if (config.desiredBrightness && newValue) {
        if (unref(config.desiredBrightness) !== newLightValue) {
          if (config.debug) {
            console.error(
              `Brightness was overwritten by a humen for ${
                config.entity
              }. Expected ${unref(
                config.desiredBrightness
              )} and got ${newLightValue}`
            );
          }
          if (overwriteBrightnessEntityHassState) {
            overwriteBrightnessEntityHassState.bool = true;
          }
        }
      }
    }
  );

  // Section: Overwrite reset

  const now = useNow({ interval: 1000 });

  const overwriteResetTime = computed(() => {
    if (!config.overwriteReset) {
      return 15 * 60 * 1000;
    }
    const value = unref(config.overwriteReset);
    if (typeof value === "number") {
      return value;
    }
    if (!value?.state) {
      return 15 * 60 * 1000;
    }
    return parse(value.state, "ms");
  });

  const overwriteBrightnessResetTime = computed(() => {
    if (!config.overwriteBrightnessReset) {
      return 15 * 60 * 1000;
    }
    const value = unref(config.overwriteBrightnessReset);
    if (typeof value === "number") {
      return value;
    }
    if (!value?.state) {
      return 15 * 60 * 1000;
    }
    return parse(value.state, "ms");
  });

  const overwriteEntityHassStateReset = computed(
    () =>
      overwriteEntityHassState?.value &&
      overwriteEntityHassState.value.last_changed &&
      new Date(overwriteEntityHassState.value.last_changed) <
        subMilliseconds(now.value, unref(overwriteResetTime)) &&
      overwriteEntityHassState.value.state === "on"
  );

  const overwriteBrightnessEntityHassStateReset = computed(
    () =>
      overwriteBrightnessEntityHassState?.value &&
      overwriteBrightnessEntityHassState.value.last_changed &&
      new Date(overwriteBrightnessEntityHassState.value.last_changed) <
        subMilliseconds(now.value, unref(overwriteBrightnessResetTime)) &&
      overwriteBrightnessEntityHassState.value.state === "on"
  );

  whenever(
    overwriteEntityHassStateReset,
    () => {
      if (overwriteEntityHassState) {
        overwriteEntityHassState.bool = false;
      }
    },
    { immediate: true }
  );

  whenever(
    overwriteBrightnessEntityHassStateReset,
    () => {
      if (overwriteBrightnessEntityHassState) {
        overwriteBrightnessEntityHassState.bool = false;
      }
    },
    { immediate: true }
  );

  // Section: Needs to sync

  const stateOutOfSync = computed(
    () =>
      stringBoolToBool(unref(config.desiredState)) !== entityHassState.bool &&
      !overwriteEntityHassState?.bool
  );

  const brightnessOutOfSync = computed(
    () =>
      config.desiredBrightness &&
      unref(config.desiredBrightness) !== entityHassState.lightPct &&
      !overwriteBrightnessEntityHassState?.bool
  );

  // Debugging
  watch(
    [
      () => stateOutOfSync.value,
      () => brightnessOutOfSync.value,
      () => unref(config.desiredState),
      () => entityHassState.bool,
    ],
    ([stateOutOfSync, brightnessOutOfSync, desiredState, bool]) => {
      if (config.debug) {
        console.log(`debug(${config.entity}): `, {
          stateOutOfSync,
          brightnessOutOfSync,
          desiredState,
          bool,
        });
      }
    }
  );

  // Section: Sync to hass

  whenever(
    stateOutOfSync,
    () => {
      if (config.debug) {
        console.log(
          `entityHassState.bool(${config.entity}) = ${stringBoolToBool(
            unref(config.desiredState)
          )}`
        );
      }
      entityHassState.bool = stringBoolToBool(unref(config.desiredState));
    },
    { immediate: true }
  );

  whenever(
    brightnessOutOfSync,
    () => {
      if (config.debug) {
        console.log(
          `entityHassState.lightPct(${config.entity}) = ${unref(
            config.desiredBrightness
          )} (current === ${entityHassState.lightPct})`
        );
      }
      if (config.desiredBrightness) {
        entityHassState.lightPct = unref(config.desiredBrightness);
      }
    },
    { immediate: true }
  );
}
