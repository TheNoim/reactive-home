import { useState } from "./useState.ts";
import { connection } from "../hass/connection.ts";
import { stringBoolToBool } from "../lib/util.ts";
import { type ComputedRef, type Ref, computed, ref } from "@vue/reactivity";
import type { HassEntity, MessageBase } from "home-assistant-js-websocket";
import { watch } from "@vue/runtime-core";
import { extendRef } from "@vueuse/shared";

export interface UseLightReturnType
  extends ComputedRef<HassEntity | undefined> {
  bool: boolean;
  lightPct: number;
  computedLightPct: number;
  computedBool: boolean;
}

export function useLight(entity: string, debug = false): UseLightReturnType {
  const state = useState(entity);

  const skipContexts: string[] = [];

  // Sync state to hass
  async function set(newValue: boolean, light = 255) {
    if (state.value && stringBoolToBool(state.value?.state) === newValue) {
      if (newValue && light === state.value.attributes.brightness) {
        return;
      } else if (!newValue) {
        return;
      }
    }

    const payload = {
      type: "call_service",
      domain: (state.value?.entity_id ?? entity).split(".").at(0),
      service: `turn_${newValue ? "on" : "off"}`,
      target: {
        entity_id: entity,
      },
      service_data:
        newValue && light > 0
          ? {
              brightness: light,
            }
          : {},
    } satisfies MessageBase;

    if (debug) {
      console.log(`call_service(${entity}): `, payload);
    }

    const result: { context: HassEntity["context"] } =
      await connection.sendMessagePromise(payload);

    if (result?.context?.id) {
      skipContexts.push(result.context.id);
    }
  }

  const bool: Ref<boolean> = ref(false);
  const lightPct = ref(-1);

  const computedLightPct = computed(() => lightPct.value);
  const computedBool = computed(() => bool.value);

  let skipNextWatch = false;

  watch(
    () => state.value,
    (newValue, oldValue) => {
      if (
        (!oldValue && newValue) ||
        (newValue?.state && stringBoolToBool(newValue.state) !== bool.value) ||
        (newValue?.attributes?.brightness &&
          newValue?.attributes.brightness !== lightPct.value)
      ) {
        const contextIndex = skipContexts.findIndex(
          (value) => value === newValue.context.id
        );

        if (contextIndex > -1) {
          if (debug) {
            console.log(`skipContexts(${entity}): ${newValue.context.id}`);
          }
          skipContexts.splice(contextIndex, 1);
          return;
        }

        if (newValue.state && bool.value !== stringBoolToBool(newValue.state)) {
          bool.value = stringBoolToBool(newValue.state);
        }
        if (
          newValue.attributes?.brightness &&
          lightPct.value !== newValue.attributes.brightness
        ) {
          lightPct.value = newValue.attributes.brightness;
        }
      }
    }
  );

  watch([computedBool, computedLightPct], ([boolVal, lightVal]) => {
    if (skipNextWatch) {
      console.log("skipNextWatch was true");
      skipNextWatch = false;
      return;
    } else {
      console.log("No skipNextWatch", { boolVal, lightVal });
    }
    set(boolVal as boolean, lightVal as number);
  });

  const extend = {
    bool,
    lightPct,
    computedLightPct,
    computedBool,
  };

  return extendRef(state, extend);
}
