import { type ShallowRef, shallowRef } from "@vue/reactivity";
import { tryOnScopeDispose } from "@vueuse/shared";

export type UseNowOptions = { interval?: number };

/**
 * A Ref which updates with current Date by provided interval
 * Default interval is 1000ms
 * @param options
 * @returns
 */
export function useNow(options?: UseNowOptions): ShallowRef<Date> {
  const value = shallowRef(new Date());

  const interval = setInterval(() => {
    value.value = new Date();
  }, options?.interval ?? 1000);

  tryOnScopeDispose(() => {
    clearInterval(interval);
  });

  return value;
}
