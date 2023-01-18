import type { FullfilledUseState } from "./useState.ts";
import {
  useDebounceFn,
  ref,
  watch,
  watchPausable,
  extendRef,
  computed,
  nextTick,
} from "../dep.ts";
import type { MessageBase, HassEntity, UnwrapNestedRefs } from "../dep.ts";
import { connection } from "../hass/connection.ts";
import { stringBoolToBool } from "../lib/util.ts";

export function useNewBoolean(state: FullfilledUseState, debug = false) {
  const skipContexts: string[] = [];

  const updateHASSState = useDebounceFn(async (newState: boolean) => {
    const entity = state.value;

    const payload = {
      type: "call_service",
      domain: entity.entity_id.split(".").at(0),
      service: `turn_${newState ? "on" : "off"}`,
      target: {
        entity_id: entity.entity_id,
      },
    } satisfies MessageBase;

    if (debug) {
      console.log(`call_service(${entity.entity_id}): `, payload);
    }

    const result: { context: HassEntity["context"] } =
      await connection.sendMessagePromise(payload);

    if (result?.context?.id) {
      skipContexts.push(result.context.id);
    }
  }, 50);

  const localValue = ref(stringBoolToBool(state.value.state));

  const lastChanged = ref(state.value.last_changed);

  // Local state changes
  const { pause, resume } = watchPausable(
    localValue,
    (newLocalValue: typeof localValue.value) => {
      if (debug) {
        console.log(`call(${state.value.entity_id}): updateHASSState`);
      }
      updateHASSState(newLocalValue);
    }
  );

  resume();

  // Incoming state changes from hass
  watch(
    () => state.value,
    async (newEntityState) => {
      const contextIndex = skipContexts.findIndex(
        (value) => value === newEntityState.context.id
      );

      if (contextIndex > -1) {
        skipContexts.splice(contextIndex, 1);
        return;
      }
      pause();
      localValue.value = stringBoolToBool(newEntityState.state);
      lastChanged.value = newEntityState.last_changed;
      await nextTick();
      resume();
    }
  );

  const extendObject = {
    lastChanged: computed({
      get() {
        return new Date(lastChanged.value);
      },
      set(newValue) {
        lastChanged.value = newValue.toISOString();
      },
    }),
  };

  return extendRef(localValue, extendObject) as typeof localValue &
    UnwrapNestedRefs<typeof extendObject>;
}

export type UseNewBooleanEntity = ReturnType<typeof useNewBoolean>;
