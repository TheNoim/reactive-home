import "./define-window.ts";

import colors from "https://esm.noim.io/color-name@2.0.0";

export * from "https://esm.noim.io/home-assistant-js-websocket@9.3.0";

export {
  computed,
  ref,
  reactive,
  readonly,
  unref,
  getCurrentScope,
  onScopeDispose,
  shallowRef,
} from "npm:@vue/reactivity@3.4.25";

export type {
  Ref,
  UnwrapNestedRefs,
  ComputedRef,
  ShallowRef,
  WritableComputedRef,
} from "npm:@vue/reactivity@3.4.25";

export * from "https://deno.land/std@0.223.0/fmt/colors.ts";

export { join } from "https://deno.land/std@0.223.0/path/mod.ts";

export * from "https://esm.noim.io/fast-equals@5.0.1";

export { useNow } from "./composeables/useNow.ts";

export {
  whenever,
  extendRef,
  refAutoReset,
  watchDebounced,
  useDebounceFn,
  watchPausable,
  toRef,
  tryOnScopeDispose,
} from "npm:@vueuse/shared@10.9.0";

export { watch } from "npm:@vue/runtime-core@3.4.25";

export { config as dotenvConfig } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

export { Input as CliffyInput } from "https://deno.land/x/cliffy@v0.25.7/prompt/mod.ts";

export { subMilliseconds } from "https://esm.noim.io/date-fns@3.6.0/subMilliseconds";
export { subSeconds } from "https://esm.noim.io/date-fns@3.6.0/subSeconds";
export { subHours } from "https://esm.noim.io/date-fns@3.6.0/subHours";
export { addHours } from "https://esm.noim.io/date-fns@3.6.0/addHours";
export { eachMinuteOfInterval } from "https://esm.noim.io/date-fns@3.6.0/eachMinuteOfInterval";

// @deno-types="https://raw.githubusercontent.com/Hypnos3/suncalc3/609d315d7787d15ca3f4643f8b121839e8333cee/suncalc.d.ts"
import SunCalc from "https://esm.noim.io/suncalc3@2.0.5";

import parse from "https://esm.noim.io/parse-duration@1.1.0";

export { SunCalc, parse as parseDuration, colors };
