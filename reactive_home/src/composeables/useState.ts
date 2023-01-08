import { connection } from "../hass/connection.ts";
import { subscribeEntities } from "../dep.ts";
import { ref, onScopeDispose, computed, getCurrentScope } from "../dep.ts";
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
