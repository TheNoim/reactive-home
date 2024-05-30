import _colors from "color-name";

export { watch } from "@vue/runtime-core";
export { computed, unref, reactive, ref, toRef } from "@vue/reactivity";
export { whenever } from "@vueuse/shared";
export type { Ref, UnwrapNestedRefs, ComputedRef } from "@vue/reactivity";
export type { HassEntity } from "home-assistant-js-websocket";
export const colors = _colors;
