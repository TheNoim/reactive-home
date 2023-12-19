import { connection } from "../hass/connection.ts";
import { getStates, HassEntities, entitiesColl, watch } from "../dep.ts";
import { ref, computed, red, gray, deepEqual } from "../dep.ts";
import { formatTime } from "../lib/time.ts";

const collection = entitiesColl(connection);

const currentStates = ref<HassEntities | null>(collection.state);

collection.subscribe((newState) => {
  currentStates.value = newState;
});

export function useState(entity: string) {
  return computed(() => currentStates.value?.[entity]);
}

export type UseAsyncStateOption = {
  debug?: boolean;
};

/**
 * Like useState, but it fetches the current state first
 * @param entity entity_id
 * @returns
 */
export async function useAsyncState(
  entity: string,
  options: UseAsyncStateOption = {}
) {
  const initialStates = await getStates(connection);

  const initialState = initialStates.find(
    (value) => value.entity_id === entity
  );

  if (!initialState) {
    throw new Error("Failed to fetch initial state for entity " + entity);
  }

  const computedValue = computed(() => {
    return currentStates.value ? currentStates.value[entity] : initialState;
  });

  if (options.debug) {
    watch(
      () => computedValue.value,
      (newValue, oldValue) => {
        if (!deepEqual(newValue, oldValue))
          console.log(
            `[${red("<-")}][${formatTime(new Date())}] ${entity}: ${gray(
              `${oldValue.state}`
            )}->${newValue.state} ${
              "brightness" in newValue.attributes ||
              "brightness" in oldValue.attributes
                ? `${gray(`${oldValue.attributes.brightness}` ?? "")}->${
                    newValue.attributes.brightness ?? ""
                  }`
                : ""
            }`
          );
      },
      { deep: true }
    );
  }

  return computedValue;
}

export type FullfilledUseState = Awaited<ReturnType<typeof useAsyncState>>;
