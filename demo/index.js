import { createApp, h } from '/node_modules/vue/dist/vue.esm-browser.prod.js'
import { plus, sub, multi, divide } from "./a.js" // FIXME: 404 whithout extname
import App from './App.vue'

console.log(plus(1, 0));
console.log(sub(3, 1));
console.log(multi(3, 1));
console.log(divide(8, 2));

// const App = {
//   render() {
//     return h(
//       "div",
//       "hello world"
//     )
//   }
// }
createApp(App).mount("#app")