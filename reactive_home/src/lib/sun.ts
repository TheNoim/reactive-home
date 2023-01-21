import { useHassConfig } from "../composeables/useConfig.ts";
import { useNow } from "../composeables/useNow.ts";
import { computed } from "../dep.ts";
import { eachMinuteOfInterval, subHours, addHours, SunCalc } from "../dep.ts";

const config = useHassConfig();

const now = useNow({ interval: 1000 * 60 });

export const sunTimes = computed(() => {
  return SunCalc.getSunTimes(now.value, config.latitude, config.longitude, 0);
});

export const sunPosition = computed(() => {
  return SunCalc.getPosition(now.value, config.latitude, config.longitude);
});

export const sunPositionInPercent = computed(() => {
  const minutes = eachMinuteOfInterval({
    start: subHours(now.value, 24),
    end: addHours(now.value, 24),
  });

  const elevations = minutes
    .map(
      (minute) =>
        SunCalc.getPosition(minute.getTime(), config.latitude, config.longitude)
          .altitudeDegrees
    )
    .sort();

  const max = Math.max(...elevations);

  const min = Math.min(...elevations);

  const current = SunCalc.getPosition(
    now.value,
    config.latitude,
    config.longitude
  ).altitudeDegrees;

  const calculation = current > 0 ? current / max : -(current / min);

  return calculation;
});
