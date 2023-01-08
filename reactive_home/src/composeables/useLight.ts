import { useState } from "./useState.ts";
import { ref, watch, computed } from "../dep.ts";
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
      ...(newValue
        ? { brightness: light < 0 ? (newValue ? 255 : 0) : light + 1 }
        : {}),
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
        if (newValue.state && bool.value !== stringBoolToBool(newValue.state)) {
          skipNextWatch = true;
          // console.log("New bool", stringBoolToBool(newValue.state));
          bool.value = stringBoolToBool(newValue.state);
        }
        if (
          newValue.attributes?.brightness &&
          lightPct.value !== newValue.attributes.brightness
        ) {
          skipNextWatch = true;
          // console.log("New lightPct", newValue.attributes.brightness);
          lightPct.value = newValue.attributes.brightness;
        }
      }
    }
  );

  watch([computedBool, computedLightPct], ([boolVal, lightVal]) => {
    if (skipNextWatch) {
      // console.log("skipNextWatch was true");
      skipNextWatch = false;
      return;
    } else {
      // console.log("No skipNextWatch", { boolVal, lightVal });
    }
    set(boolVal as boolean, lightVal as number);
  });

  const extend = {
    bool,
    lightPct,
    computedLightPct,
    computedBool,
  };

  return extendRef(state, extend) as typeof state &
    UnwrapNestedRefs<typeof extend>;
}
