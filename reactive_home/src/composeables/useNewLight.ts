import type { FullfilledUseState } from "./useState.ts";
import { useDebounceFn, reactive, watch } from "../dep.ts";
import type { MessageBase, HassEntity } from "../dep.ts";
import { connection } from "../hass/connection.ts";
import { stringBoolToBool } from "../lib/util.ts";

export function useNewLight(state: FullfilledUseState, debug = false) {
  const skipContexts: string[] = [];

  function getBrightnessFromAttribute(currentState: HassEntity) {
    if (
      currentState.attributes.brightness &&
      typeof currentState.attributes.brightness === "number"
    ) {
      return currentState.attributes.brightness;
    }
    return 255;
  }

  const updateHASSState = useDebounceFn(
    async (newState: boolean, brightness: number) => {
      const entity = state.value;

      const payload = {
        type: "call_service",
        domain: entity.entity_id.split(".").at(0),
        service: `turn_${newState ? "on" : "off"}`,
        target: {
          entity_id: entity.entity_id,
        },
        service_data:
          newState && brightness > 0
            ? {
                brightness: brightness,
              }
            : {},
      } satisfies MessageBase;

      if (debug) {
        console.log(`call_service(${entity.entity_id}): `, payload);
      }

      const result: { context: HassEntity["context"] } =
        await connection.sendMessagePromise(payload);

      if (result?.context?.id) {
        skipContexts.push(result.context.id);
      }
    },
    50
  );

  const localValues = reactive({
    value: stringBoolToBool(state.value.state),
    brightness: getBrightnessFromAttribute(state.value),
    entity_id: state.value.entity_id,
    lastChanged: new Date(state.value.last_changed),
    lock: false,
  });

  // Local state changes
  watch(
    () => {
      return { value: localValues.value, brightness: localValues.brightness };
    },
    (newLocalValues, oldLocalValues) => {
      if (
        newLocalValues.value === oldLocalValues.value &&
        newLocalValues.brightness === oldLocalValues.brightness
      ) {
        return;
      }
      if (debug) {
        console.log(`call(${state.value.entity_id}): updateHASSState`);
      }
      updateHASSState(newLocalValues.value, newLocalValues.brightness);
    }
  );

  // Incoming state changes from hass
  watch(
    () => state.value,
    (newEntityState) => {
      if (debug) {
        console.log(
          `incoming(${state.value.entity_id}): value=${stringBoolToBool(
            newEntityState.state
          )} brightness=${getBrightnessFromAttribute(
            newEntityState
          )} lastChanged=${new Date(newEntityState.last_changed)}`
        );
      }

      localValues.lastChanged = new Date(newEntityState.last_changed);

      const contextIndex = skipContexts.findIndex(
        (value) => value === newEntityState.context.id
      );

      if (contextIndex > -1) {
        skipContexts.splice(contextIndex, 1);
        return;
      }
      localValues.value = stringBoolToBool(newEntityState.state);
      localValues.brightness = getBrightnessFromAttribute(newEntityState);
    }
  );

  return localValues;
}

export type UseNewLightEntity = ReturnType<typeof useNewLight>;
