<template>
  <div class="ct">
    <h1 class="ct-title">{{ msg }}</h1>
    <button @click="reverse">Click Me</button>
  </div>
</template>

<script setup>
const msg = ref("vite");
const reverse = () => (msg.value = msg.value.split("").reverse().join(""));

// import { ref, defineComponent } from "vue";
// export default defineComponent({
//   setup() {
//     const msg = ref("hello");
//     const reverse = () => (msg.value = msg.value.split("").reverse().join(""));
//     return {
//       msg,
//       reverse,
//     };
//   },
// });
</script>

<style>
.ct {
  background-color: #ff0;
}
.ct-title {
  margin: 0;
  color: aqua;
}
</style>
