import { ref } from "../dep.ts";
import type { Ref } from "../dep.ts";

export type UseNowOptions = { interval?: number };

export function useNow(options?: UseNowOptions) {
  const value: Ref<Date> = ref(new Date());

  setInterval(() => {
    value.value = new Date();
  }, options?.interval);

  return value;
}
