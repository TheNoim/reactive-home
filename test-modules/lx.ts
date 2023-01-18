import { useState, computed } from "../mod.ts";

/**
 *
 * @param entity Entity id
 * @returns Computed lumen float value
 */
export function useLumen(entity: string) {
  const state = useState(entity);

  return computed(() => {
    if (!state.value) {
      return null;
    }
    return parseFloat(state.value.state);
  });
}
