import { useState } from "./useState.ts";
import { computed, extendRef, refAutoReset } from "../dep.ts";
import { auth, createApiCall } from "../hass/connection.ts";
import type { Ref, UnwrapNestedRefs } from "../dep.ts";

/**
 * Switch device helper function. If a device supports only on and off, this can help manage this device as simple boolean.
 * @param entity Entity id
 * @param debug Enable debug prints
 * @returns
 */
export function useBoolean(entity: string, debug = false) {
  const state = useState(entity);

  async function set(newValue: boolean) {
    const callServiceUrl = createApiCall(
      `/api/services/${state.value?.entity_id?.split(".").at(0)}/turn_${
        newValue ? "on" : "off"
      }`
    );
    if (debug) {
      console.log(`call_service(${entity}): `, {
        callServiceUrl: callServiceUrl,
      });
    }
    await fetch(callServiceUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${auth.accessToken}`,
      },
      body: JSON.stringify({
        entity_id: entity,
      }),
    });
  }

  const localBool: Ref<null | boolean> = refAutoReset(null, 5000);

  const bool: Ref<boolean> = computed({
    get() {
      return typeof localBool.value === "boolean"
        ? localBool.value
        : state.value?.state === "on";
    },
    set(newValue) {
      localBool.value = newValue;
      set(newValue);
    },
  });

  const extend = {
    bool,
    set,
  };

  return extendRef(state, extend) as typeof state &
    UnwrapNestedRefs<typeof extend>;
}
