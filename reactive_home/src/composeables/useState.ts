import { connection } from "../hass/connection.ts";
import { subscribeEntities, getStates } from "../dep.ts";
import {
  ref,
  onScopeDispose,
  computed,
  getCurrentScope,
  readonly,
} from "../dep.ts";
import type { HassEntity } from "../dep.ts";

export function useState(entity: string) {
  const currentState = ref<HassEntity | null>(null);

  const unsub = subscribeEntities(connection, (newState) => {
    currentState.value = newState[entity];
  });

  if (getCurrentScope()) {
    onScopeDispose(() => {
      unsub();
    });
  }

  return computed(() => currentState.value);
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

  const currentState = ref<HassEntity>(initialState);

  const unsub = subscribeEntities(connection, (newState) => {
    currentState.value = newState[entity];
  });

  if (getCurrentScope()) {
    onScopeDispose(() => {
      unsub();
    });
  }

  return readonly(currentState);
}

export type FullfilledUseState = Awaited<ReturnType<typeof useAsyncState>>;
