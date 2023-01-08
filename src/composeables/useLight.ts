import { useState } from "./useState.ts";
import { ref, watch } from "../dep.ts";
import { extendRef, watchDebounced } from "../dep.ts";
import { auth, createApiCall } from "../hass/connection.ts";
import { stringBoolToBool } from "../lib/util.ts";
import type { Ref, UnwrapNestedRefs } from "../dep.ts";

export function useLight(entity: string, debug = false) {
  const state = useState(entity);

  // Sync state to hass
  async function set(newValue: boolean, light = 255) {
    const payload = JSON.stringify({
      entity_id: entity,
      ...(newValue ? { brightness: light } : {}),
    });
    const callServiceUrl = createApiCall(
      `/api/services/${state.value?.entity_id?.split(".").at(0)}/turn_${
        newValue ? "on" : "off"
      }`
    );
    if (debug) {
      console.log(`call_service(${entity}): `, {
        callServiceUrl: callServiceUrl,
        payload,
      });
    }
    await fetch(callServiceUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${auth.accessToken}`,
      },
      body: payload,
    });
  }

  const bool: Ref<boolean> = ref(false);
  const lightPct = ref(1);

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
        if (newValue.state) {
          skipNextWatch = true;
          bool.value = stringBoolToBool(newValue.state);
        }
        if (newValue.attributes?.brightness) {
          skipNextWatch = true;
          lightPct.value = newValue.attributes.brightness;
        }
      }
    }
  );

  watchDebounced(
    [() => bool.value, () => lightPct.value],
    ([boolVal, lightVal]: [boolean, number]) => {
      if (skipNextWatch) {
        skipNextWatch = false;
        return;
      }
      set(boolVal as boolean, lightVal as number);
    },
    { debounce: 100 }
  );

  const extend = {
    bool,
    lightPct,
  };

  return extendRef(state, extend) as typeof state &
    UnwrapNestedRefs<typeof extend>;
}
