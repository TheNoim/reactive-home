import "./define-window.ts";

import colors from "https://esm.noim.io/color-name@2.0.0";

export * from "https://esm.noim.io/home-assistant-js-websocket@9.1.0";

export {
  computed,
  ref,
  reactive,
  readonly,
  unref,
  getCurrentScope,
  onScopeDispose,
  shallowRef,
} from "https://esm.noim.io/@vue/reactivity@3.4.15";

export type {
  Ref,
  UnwrapNestedRefs,
  ComputedRef,
  ShallowRef,
  WritableComputedRef,
} from "https://esm.noim.io/@vue/reactivity@3.4.15";

export * from "https://deno.land/std@0.212.0/fmt/colors.ts";

export { join } from "https://deno.land/std@0.212.0/path/mod.ts";

export * from "https://esm.noim.io/fast-equals@5.0.1";

export { useNow } from "./composeables/useNow.ts";

// Update this manual with inspecting the esm url via curl -I and fixing the `x-typescript-types` url
// @deno-types="https://esm.noim.io/v135/@vueuse/shared@10.7.0/X-ZC9AdnVlL3NoYXJlZEAzLjQuMTUsdnVlQDMuNC4xNQ/index.d.ts"
export {
  whenever,
  extendRef,
  refAutoReset,
  watchDebounced,
  useDebounceFn,
  watchPausable,
  toRef,
  tryOnScopeDispose,
} from "https://esm.noim.io/@vueuse/shared@10.7.0?deps=@vue/shared@3.4.15,vue@3.4.15,&externals=@vue/runtime-dom,@vue/reactivity@3.4.15,@vue/runtime-core@3.4.15";

export { watch } from "https://esm.noim.io/@vue/runtime-core@3.4.15";

export { config as dotenvConfig } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

export { Input as CliffyInput } from "https://deno.land/x/cliffy@v0.25.7/prompt/mod.ts";

export { subMilliseconds } from "https://esm.noim.io/date-fns@3.3.1/subMilliseconds";
export { subSeconds } from "https://esm.noim.io/date-fns@3.3.1/subSeconds";
export { subHours } from "https://esm.noim.io/date-fns@3.3.1/subHours";
export { addHours } from "https://esm.noim.io/date-fns@3.3.1/addHours";
export { eachMinuteOfInterval } from "https://esm.noim.io/date-fns@3.3.1/eachMinuteOfInterval";

// @deno-types="https://raw.githubusercontent.com/Hypnos3/suncalc3/609d315d7787d15ca3f4643f8b121839e8333cee/suncalc.d.ts"
import SunCalc from "https://esm.noim.io/suncalc3@2.0.5";

import parse from "https://esm.noim.io/parse-duration@1.1.0";

export { SunCalc, parse as parseDuration, colors };
