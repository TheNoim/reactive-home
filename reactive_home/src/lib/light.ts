import { sunPositionInPercent } from "./sun.ts";
import type { MaybeComputed } from "./types.ts";
import { type ComputedRef, computed, unref } from "../dep.ts";

export type UseBrightnessOptions = {
  /**
   * A value between 0 and 254
   */
  minBrigthness?: number;
  /**
   * A value between 0 and 254
   */
  maxBrigthness?: number;
};

/**
 * Calculate light brightness based on sun position
 * @param options
 * @returns light 1-255
 */
export function useBrightness(
  options: MaybeComputed<UseBrightnessOptions> = {}
): ComputedRef<number> {
  return computed(() => {
    const sunPercent = sunPositionInPercent.value;

    const opt = unref(options);

    const maxBrigthness = opt.maxBrigthness ?? 254;
    const minBrightness = opt.minBrigthness ?? 51;

    if (sunPercent > 0) {
      return maxBrigthness;
    }

    const deltaBrightness = maxBrigthness - minBrightness;

    const percent = 1 + sunPercent;

    return Math.trunc(
      ((deltaBrightness / 254) * percent + minBrightness / 254) * 254
    );
  });
}
