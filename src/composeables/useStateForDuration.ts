import { useState } from "./useState.ts";
import { subSeconds } from "../dep.ts";
import { useNow } from "../dep.ts";
import { computed } from "../dep.ts";

export function useStateForDuration(
  entity: string,
  requiredState: string,
  duration: number,
  defaultState?: string,
  interval = 1000
) {
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
