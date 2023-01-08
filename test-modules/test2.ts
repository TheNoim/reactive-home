import { useState, watch, useBrightness } from "../reactive_home/src/mod.ts";

const lamp = useState("light.0x2c1165fffed484a7");

// watch(lamp, ({ state }) => {
//     console.log(state)
// })

const brightness = useBrightness();

watch(lamp, (val) => console.log(val));

console.log(brightness.value, lamp.value);
