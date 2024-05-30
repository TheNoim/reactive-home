import type { FullfilledUseState } from "./useState.ts";
import { connection } from "../hass/connection.ts";
import { stringBoolToBool } from "../lib/util.ts";
import { type WritableComputedRef, computed, ref } from "@vue/reactivity";
import { extendRef, useDebounceFn } from "@vueuse/shared";
import type { HassEntity, MessageBase } from "home-assistant-js-websocket";
import { watch } from "@vue/runtime-core";

export interface UseNewBooleanReturn extends WritableComputedRef<boolean> {
  lastChanged: Date;
}

export function useNewBoolean(
  state: FullfilledUseState,
  debug = false
): UseNewBooleanReturn {
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

  // External change hook
  const exposedValue = computed({
    get() {
      return localValue.value;
    },
    set(newValue) {
      localValue.value = newValue;
      lastChanged.value = new Date().toISOString();
      if (debug) {
        console.log(`call(${state.value.entity_id}): updateHASSState`);
      }
      updateHASSState(newValue);
    },
  });

  // Incoming state changes from hass
  watch(
    () => state.value,
    (newEntityState) => {
      // If this is a change which we have send to HASS, then we can skip it
      const contextIndex = skipContexts.findIndex(
        (value) => value === newEntityState.context.id
      );
      if (contextIndex > -1) {
        skipContexts.splice(contextIndex, 1);
        return;
      }

      if (newEntityState.state === "unavailable") {
        if (debug) {
          console.log(
            `incoming(${state.value.entity_id}): skip. New state is unavailable`
          );
        }
        return;
      }

      localValue.value = stringBoolToBool(newEntityState.state);
      lastChanged.value = newEntityState.last_changed;
    }
  );

  const extendedMeta = {
    lastChanged: computed({
      get() {
        return new Date(lastChanged.value);
      },
      set(newValue) {
        lastChanged.value = newValue.toISOString();
      },
    }),
  };

  return extendRef(exposedValue, extendedMeta);
}

export type UseNewBooleanEntity = ReturnType<typeof useNewBoolean>;
