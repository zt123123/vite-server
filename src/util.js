const path = require("path")
const demoDir = path.join(process.cwd(), 'demo')
const compiler = require("@vue/compiler-sfc")
const { init, parse } = require('es-module-lexer');
const MagicString = require("magic-string").default;
const fs = require("fs")
let id = 0;

function getCompileResult(ctx) {
  const href = ctx.request.href
  // exclude querystring
  const basename = path.basename(href).split('?')[0]; // App.vue?vue&type=xxx => App.vue
  const filePath = getWorkSpaceFilePath(basename)
  const parseRes = compiler.parse(fs.readFileSync(filePath, "utf-8"))
  console.log(parseRes);
  return parseRes
}

function generateCss(code) {
  return `
  const style = document.createElement("style");
  style.textContent = ${JSON.stringify(code)}
  document.head.appendChild(style)
  export default style
  `
}

function getWorkSpaceFilePath(fileName) {
  return path.join(demoDir, fileName)
}

async function rewriteImportPath(code, packagePath='', fileName) {
  await init
  // parse import statement & replace module path to '/@modules/xxx'
  // see example src/test.import-parse.js
  const [imports, exports] = parse(code);
  const str = new MagicString(code)
  imports.forEach(({ n, s, e }) => {
    if (!n.startsWith('.') && !n.startsWith('..') && !n.startsWith('/')) {
      str.overwrite(s, e, `/@modules/${n}?pkg=${n}`)
    }else{
      if(packagePath){
        str.overwrite(s, e, `/@modules/${packagePath}${n.slice(1)}`)
      }
    }
  })
  return str.toString()
}

const util = {
  getWorkSpaceFilePath,
  getCompileResult,
  rewriteImportPath,
  generateCss,
  getPackageFilePath(fileName = '', package='') {
    const packagePath = path.join(process.cwd(), fileName.replace(/@modules/, 'node_modules'))
    const pkgJson = fs.readFileSync(path.join(packagePath, 'package.json'), "utf-8")
    // esmodule entry file
    const { module } = JSON.parse(pkgJson)
    return path.join(packagePath, module)
  },
  compileTemplate(ctx) {
    const { descriptor, descriptor: { template: { content } } } = getCompileResult(ctx)
    const result = compiler.compileTemplate({
      id: String(id++),
      ...descriptor,
      source: content,
    })
    return result.code
  },
  compileStyle(ctx) {
    const { descriptor, descriptor: { styles: [{ content }] } } = getCompileResult(ctx)
    const result = compiler.compileStyle({
      id: String(id++),
      ...descriptor,
      source: content,
    })

    const styleString = generateCss(result.code)
    return styleString
  },
  async compileScript(ctx) {
    const { descriptor } = getCompileResult(ctx)
    let content = ''
    if (descriptor.script) {
      content = descriptor.script.content
    } else if (descriptor.scriptSetup) {
      // setup hack
      content = `
import { defineComponent, ref } from "vue";
export default defineComponent({
  setup(){
    ${descriptor.scriptSetup.content}
    return {
      msg,
      reverse
    }
  }
})`
    }
    return await rewriteImportPath(content)
  },
  rewriteVueFileContent(ctx) {
    const requestPath = ctx.request.path
    const result = getCompileResult(ctx)
    const { template } = result.descriptor
    let code = ''
    if (template) {
      code += `// main script
import script from '${requestPath}?type=script'

// template compiled to render function
import { render } from '${requestPath}?type=template'

// css
import '${requestPath}?type=style'

// attach render function to script
script.render = render

export default script`
    }
    return code
  }
}

module.exports = util
