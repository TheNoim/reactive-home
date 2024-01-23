import type { FullfilledUseState } from "./useState.ts";
import {
  useDebounceFn,
  reactive,
  watch,
  computed,
  extendRef,
  brightBlue,
  italic,
  type Ref,
} from "../dep.ts";
import type { MessageBase, HassEntity } from "../dep.ts";
import { connection } from "../hass/connection.ts";
import { stringBoolToBool } from "../lib/util.ts";
import { formatTime } from "../lib/time.ts";
import { toRef } from "../dep.ts";

type ExtendedObject = {
  brightness: number;
  entity_id: string;
  lastChanged: Date;
  rgbColor: [number, number, number];
};

export function useNewLight(
  state: FullfilledUseState,
  debug = false
): ExtendedObject & Ref<boolean> {
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
    async (
      newState: boolean,
      brightness?: number,
      rgbColor?: [number, number, number]
    ) => {
      const entity = state.value;

      let service_data;

      if ((brightness || rgbColor) && newState) {
        service_data = {} as any;
        if (brightness !== null && brightness !== undefined) {
          service_data["brightness"] = brightness;
        }
        if (rgbColor !== null && rgbColor !== undefined) {
          service_data["rgb_color"] = rgbColor;
        }
      } else {
        service_data = {};
      }

      const payload = {
        type: "call_service",
        domain: entity.entity_id.split(".").at(0),
        service: `turn_${newState ? "on" : "off"}`,
        target: {
          entity_id: entity.entity_id,
        },
        service_data: service_data,
      } satisfies MessageBase;

      if (debug) {
        console.log(
          `[${brightBlue("->")}][${formatTime(new Date())}] ${
            entity.entity_id
          }: ${italic(payload.service)} ${
            typeof payload.service_data === "object"
              ? payload.service_data.brightness
              : payload.service_data
          }`
        );
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
    rgbColor: state.value.attributes.rgb_color as [number, number, number],
  });

  const exposedValue = computed({
    get() {
      return localValues.value;
    },
    set(newValue) {
      localValues.value = newValue;
      localValues.lastChanged = new Date();
      // if (debug) {
      //   console.log(
      //     `call(${state.value.entity_id}): updateHASSState (via value change)`
      //   );
      // }
      updateHASSState(newValue);
    },
  });

  const exposedBrightness = computed({
    get() {
      return localValues.brightness;
    },
    set(newValue) {
      if (newValue > 254) {
        newValue = 254;
      } else if (newValue < 0) {
        newValue = 0;
      }
      newValue = Math.floor(newValue);
      localValues.brightness = newValue;
      if (newValue === 0 && localValues.value) {
        localValues.value = false;
      } else if (newValue > 0 && !localValues.value) {
        localValues.value = true;
      }
      localValues.lastChanged = new Date();
      // if (debug) {
      //   console.log(
      //     `call(${state.value.entity_id}): updateHASSState (via brightness change)`
      //   );
      // }
      updateHASSState(localValues.value, newValue);
    },
  });

  const exposedLastChanged = computed({
    get() {
      return localValues.lastChanged;
    },
    set(newValue) {
      localValues.lastChanged = newValue;
    },
  });

  const exposedRgbColor = computed({
    get() {
      return localValues.rgbColor;
    },
    set(newValue) {
      localValues.rgbColor = newValue;
      localValues.lastChanged = new Date();

      updateHASSState(localValues.value, undefined, localValues.rgbColor);
    },
  });

  // Incoming state changes from hass
  watch(
    () => state.value,
    (newEntityState) => {
      if (debug) {
        // console.log(
        //   `incoming(${state.value.entity_id}): value=${stringBoolToBool(
        //     newEntityState.state
        //   )} brightness=${getBrightnessFromAttribute(
        //     newEntityState
        //   )} lastChanged=${new Date(newEntityState.last_changed)}`
        // );
      }

      if (newEntityState.state === "unavailable") {
        // if (debug) {
        //   console.log(
        //     `incoming(${state.value.entity_id}): skip. New state is unavailable`
        //   );
        // }
        return;
      }

      localValues.lastChanged = new Date(newEntityState.last_changed);

      const contextIndex = skipContexts.findIndex(
        (value) => value === newEntityState.context.id
      );

      if (contextIndex > -1) {
        skipContexts.splice(contextIndex, 1);
        return;
      }

      if (localValues.value !== stringBoolToBool(newEntityState.state)) {
        localValues.value = stringBoolToBool(newEntityState.state);
      }
      if (
        localValues.brightness !== getBrightnessFromAttribute(newEntityState)
      ) {
        localValues.brightness = getBrightnessFromAttribute(newEntityState);
      }
      if (localValues.rgbColor !== newEntityState.attributes.rgb_color) {
        localValues.rgbColor = newEntityState.attributes.rgb_color;
      }
    }
  );

  return extendRef(toRef(exposedValue), {
    brightness: exposedBrightness,
    entity_id: state.value.entity_id,
    lastChanged: exposedLastChanged,
    rgbColor: exposedRgbColor,
  });
}

export type UseNewLightEntity = ReturnType<typeof useNewLight>;
