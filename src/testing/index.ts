// import { computed, effectScope } from '@vue/reactivity';
// import { watch } from '@vue-reactivity/watch';
// import { useState } from './composeables/useState.ts';
// import { useStateForDuration } from './composeables/useStateForDuration.ts';

// const scope = effectScope();

// scope.run(() => {
//     const epoWohnzimmer = useState('binary_sensor.occupancy');

//     const motionWohnzimmerOff = useStateForDuration('binary_sensor.0x00124b00250907a0_occupancy', 'off', 5, 'off');

//     const lightShouldBeOn = computed(() => {
//         return !motionWohnzimmerOff.value || epoWohnzimmer.value.state === 'on'
//     });

//     watch(lightShouldBeOn, (newValue, oldValue) => console.log({ newValue, oldValue }));
// });

for await (const module of Deno.readDir('./modules')) {
    if (!module.isFile) {
        continue;
    }

    await import(`./modules/${module.name}`);
}