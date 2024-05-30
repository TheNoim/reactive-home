import { type ComputedRef, computed } from "@vue/reactivity";
import { useHassConfig } from "../composeables/useConfig.ts";
import { useNow } from "../composeables/useNow.ts";
import { getSunTimes, getPosition } from "suncalc3";
import { addHours, eachMinuteOfInterval, subHours } from "date-fns";
import type { ISunTimeList, ISunPosition } from "suncalc3";

const config = useHassConfig();

const now = useNow({ interval: 1000 * 60 });

export const sunTimes: ComputedRef<ISunTimeList> = computed(() => {
  return getSunTimes(now.value, config.latitude, config.longitude, 0);
});

export const sunPosition: ComputedRef<ISunPosition> = computed(() => {
  return getPosition(now.value, config.latitude, config.longitude);
});

export const sunPositionInPercent: ComputedRef<number> = computed(() => {
  const minutes = eachMinuteOfInterval({
    start: subHours(now.value, 24),
    end: addHours(now.value, 24),
  });

  const elevations = minutes
    .map(
      (minute) =>
        getPosition(minute.getTime(), config.latitude, config.longitude)
          .altitudeDegrees
    )
    .sort();

  const max = Math.max(...elevations);

  const min = Math.min(...elevations);

  const current = getPosition(
    now.value,
    config.latitude,
    config.longitude
  ).altitudeDegrees;

  const calculation = current > 0 ? current / max : -(current / min);

  return calculation;
});
