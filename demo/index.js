import { createApp } from "vue"
import { plus, sub, multi, divide } from "./a.js"
import App from './App.vue'
import "./index.css"
// precompile optiminize
// import { forEach } from 'lodash-es'

// forEach(["🍎", "🍌", "🍊"], (val) => {
//   console.log(val);
// })

console.log(plus(1, 0));
console.log(sub(3, 1));
console.log(multi(3, 1));
console.log(divide(8, 2));

createApp(App).mount("#app")