import { connection } from "../hass/connection.ts";
import { getStates, HassEntities, entitiesColl } from "../dep.ts";
import { ref, computed } from "../dep.ts";

const collection = entitiesColl(connection);

const currentStates = ref<HassEntities | null>(collection.state);

collection.subscribe((newState) => {
  currentStates.value = newState;
});

export function useState(entity: string) {
  return computed(() => currentStates.value?.[entity]);
}

/**
 * Like useState, but it fetches the current state first
 * @param entity entity_id
 * @returns
 */
export async function useAsyncState(entity: string) {
  const initialStates = await getStates(connection);

  const initialState = initialStates.find(
    (value) => value.entity_id === entity
  );

  if (!initialState) {
    throw new Error("Failed to fetch initial state for entity " + entity);
  }

  return computed(() => {
    return currentStates.value ? currentStates.value[entity] : initialState;
  });
}

export type FullfilledUseState = Awaited<ReturnType<typeof useAsyncState>>;
