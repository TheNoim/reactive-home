import { useState } from "./useState.ts";
import { computed, extendRef, refAutoReset } from "../dep.ts";
import { connection } from "../hass/connection.ts";
import type { Ref, UnwrapNestedRefs, MessageBase, HassEntity } from "../dep.ts";

/**
 * Switch device helper function. If a device supports only on and off, this can help manage this device as simple boolean.
 * @param entity Entity id
 * @param debug Enable debug prints
 * @returns
 */
export function useBoolean(
  entity: string,
  debug = false
): Ref<HassEntity | undefined> & {
  bool: boolean;
  set: (newValue: boolean) => Promise<void>;
} {
  const state = useState(entity);

  const localBool: Ref<null | boolean> = refAutoReset(null, 5000);

  async function set(newValue: boolean) {
    const payload = {
      type: "call_service",
      domain: (state.value?.entity_id ?? entity).split(".").at(0),
      service: `turn_${newValue ? "on" : "off"}`,
      target: {
        entity_id: entity,
      },
    } satisfies MessageBase;

    if (debug) {
      console.log(`call_service(${entity}): `, payload);
    }

    await connection.sendMessagePromise(payload);

    localBool.value = null;
  }

  const bool = computed<boolean>({
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
