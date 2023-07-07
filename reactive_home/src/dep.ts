import './define-window.ts';

export * from "https://esm.noim.io/home-assistant-js-websocket@8.1.0";

export {
  computed,
  ref,
  reactive,
  readonly,
  unref,
  getCurrentScope,
  onScopeDispose,
} from "https://esm.noim.io/@vue/reactivity@3.3.4";

export type {
  Ref,
  UnwrapNestedRefs,
  ComputedRef,
} from "https://esm.noim.io/@vue/reactivity@3.3.4";

export { useNow } from "./composeables/useNow.ts";

export {
  whenever,
  extendRef,
  refAutoReset,
  watchDebounced,
  useDebounceFn,
  watchPausable,
} from "https://esm.noim.io/@vueuse/core@10.2.1?deps=@vue/shared@3.3.4&externals=@vue/runtime-dom";

export { watch } from "https://esm.noim.io/@vue/runtime-core@3.3.4";

export { config as dotenvConfig } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

export { Input as CliffyInput } from "https://deno.land/x/cliffy@v0.25.7/prompt/mod.ts";

export {
  subMilliseconds,
  subSeconds,
  subHours,
  addHours,
  eachMinuteOfInterval,
} from "https://esm.noim.io/date-fns@2.30.0";

// @deno-types="https://raw.githubusercontent.com/Hypnos3/suncalc3/609d315d7787d15ca3f4643f8b121839e8333cee/suncalc.d.ts"
import SunCalc from "https://esm.noim.io/suncalc3@2.0.5";

import parse from "https://esm.noim.io/parse-duration@1.1.0";

export { join } from "https://deno.land/std@0.193.0/path/mod.ts";

export { SunCalc, parse as parseDuration };
