<template>
  <div class="ct">
    <h1 class="ct-title">{{ msg }}</h1>
    <button @click="reverse">Click Me</button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const msg = ref("vite");
const reverse = () => (msg.value = msg.value.split("").join(""));
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
