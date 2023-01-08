import { sunPositionInPercent } from "./sun.ts";
import type { MaybeComputed } from "./types.ts";
import { computed, unref } from "../dep.ts";

export type UseBrightnessOptions = {
  minBrigthness?: number;
  maxBrigthness?: number;
};

/**
 * Calculate light brightness based on sun position
 * @param options
 * @returns light 1-255
 */
export function useBrightness(
  options: MaybeComputed<UseBrightnessOptions> = {}
) {
  return computed(() => {
    const sunPercent = sunPositionInPercent.value;

    const opt = unref(options);

    const maxBrigthness = opt.maxBrigthness ?? 1;
    const minBrightness = opt.minBrigthness ?? 0.2;

    if (sunPercent > 0) {
      return maxBrigthness;
    }

    const deltaBrightness = maxBrigthness - minBrightness;

    const percent = 1 + sunPercent;

    return Math.trunc((deltaBrightness * percent + minBrightness) * 255);
  });
}
