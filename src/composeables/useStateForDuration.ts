import { useState } from "./useState.ts";
import type { FullfilledUseState } from "./useState.ts";
import type { UseNewBooleanEntity } from "./useNewBoolean.ts";
import type { UseNewLightEntity } from "./useNewLight.ts";
import type { MaybeRef } from "../lib/types.ts";
import { useNow } from "./useNow.ts";
import { type ComputedRef, computed, unref } from "@vue/reactivity";
import { subSeconds } from "date-fns";

export function useStateForDuration(
  entity: string,
  requiredState: string,
  duration: number,
  defaultState?: string,
  interval = 1000
): ComputedRef<boolean> {
  const state = useState(entity);

  const now = useNow({ interval });

  return computed(() => {
    return (
      (state.value?.state ?? defaultState) === requiredState &&
      new Date(state.value?.last_changed ?? new Date()) <
        subSeconds(now.value, duration)
    );
  });
}

export function useNewStateForDuration(
  state: FullfilledUseState,
  requiredState: string,
  duration: number,
  defaultState?: string,
  interval = 1000
): ComputedRef<boolean> {
  const now = useNow({ interval });

  return computed(() => {
    return (
      (state.value?.state ?? defaultState) === requiredState &&
      new Date(state.value?.last_changed ?? new Date()) <
        subSeconds(now.value, duration)
    );
  });
}

/**
 * Checks if an entity value is equals a given state for a minimum amount of seconds.
 * @param entity Entity which state should be checked
 * @param equalsState State to be equal. Can be reactive
 * @param forDuration Duration in seconds
 * @param clockSourceInterval How often it should get checked in ms.
 * @returns Reactive boolean
 */
export function useEntityValueEqualsForMinimumDuration<
  Input extends UseNewBooleanEntity | UseNewLightEntity
>(
  entity: Input,
  equalsState: MaybeRef<Input["value"]>,
  forDuration: number,
  clockSourceInterval = 1000
): ComputedRef<boolean> {
  const now = useNow({ interval: clockSourceInterval });

  return computed(() => {
    return (
      entity.value === unref(equalsState) &&
      entity.lastChanged < subSeconds(now.value, forDuration)
    );
  });
}
