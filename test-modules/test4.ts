import {
  shouldReEnableSinceFactory,
  useNow,
  computed,
  useNewBoolean,
  useAsyncState,
  watch,
} from "../mod.ts";

const now = useNow({ interval: 1000 });

const entitiy = useNewBoolean(await useAsyncState("light.0x2c1165fffed484a7"));

const test = shouldReEnableSinceFactory(
  computed(() => 1000),
  now,
  entitiy
);

watch(test, (newTest, oldTest) => {
  console.log(`newTest = ${newTest} oldTest = ${oldTest}`);
});
