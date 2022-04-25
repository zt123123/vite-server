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
  return compiler.parse(fs.readFileSync(filePath, "utf-8"))
}

function getWorkSpaceFilePath(fileName) {
  return path.join(demoDir, fileName)
}

async function rewriteImportPath(code) {
  await init
  // parse import statement & replace module path to '/@modules/xxx'
  const [imports] = parse(code);
  const str = new MagicString(code)
  imports.forEach(({ n, s, e }) => {
    if (!n.startsWith('.') && !n.startsWith('..')) {
      str.overwrite(s, e, `/@modules/${n}`)
    }
  })
  return str.toString()
}

const util = {
  getWorkSpaceFilePath,
  getCompileResult,
  rewriteImportPath,
  getPackageFilePath(fileName = '') {
    const packagePath = path.join(process.cwd(), fileName.replace(/@modules/, 'node_modules'))
    const pkgJson = fs.readFileSync(path.join(packagePath, 'package.json'), "utf-8")
    // const { module } = JSON.parse(pkgJson)
    // hack entry file
    // console.log(path.join(packagePath, module));
    return path.join(packagePath, 'dist/vue.runtime.esm-browser.js')
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

    const styleString = 'const style = document.createElement("style");\nstyle.textContent = ' + JSON.stringify(result.code) +
      '\ndocument.head.appendChild(style)'
    return styleString
  },
  compileScript(ctx) {
    const { descriptor, descriptor: { script: { content } } } = getCompileResult(ctx)
    console.log('--content',content);
    const result = compiler.compileScript({
      ...descriptor,
      source: content
    })
    return result.content
  },
  rewriteVueFileContent(ctx) {
    const requestPath = ctx.request.path
    const result = getCompileResult(ctx)
    const { template } = result.descriptor
    let code = ''
    if (template) {
      code += `// template compiled to render function
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
