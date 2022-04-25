const { init, parse } = require('es-module-lexer');
const MagicString = require("magic-string").default;

const code = `import { createApp } from "vue"
import a from './a'
import b from './b'
`
init.then(() => {
  const [imports, exports] = parse(code);
  /**
     [
      { n: 'vue', s: 27, e: 30, ss: 0, se: 31, d: -1, a: -1 },
      { n: './a', s: 47, e: 50, ss: 32, se: 51, d: -1, a: -1 },
      { n: './b', s: 67, e: 70, ss: 52, se: 71, d: -1, a: -1 }
    ]
  */
  const str = new MagicString(code)

  imports.forEach(({ n, s, e }) => {
    /**
      import { createApp } from "vue--666"
      import a from './a--666'
      import b from './b--666'
     */
    str.overwrite(s, e, n + '--666')
  })

  console.log(str.toString());
})
