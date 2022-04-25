const path = require("path")
const demoDir = path.join(process.cwd(), 'demo')
const compiler = require("@vue/compiler-sfc")
const fs = require("fs")
let id = 0;

function getCompileResult(ctx) {
  const href = ctx.request.href
  // exclude querystring
  const basename = path.basename(href).split('?')[0]; // App.vue?vue&type=xxx => App.vue
  const filePath = getDemoFilePath(basename)
  return compiler.parse(fs.readFileSync(filePath, "utf-8"))
}

function getDemoFilePath(fileName) {
  return path.join(demoDir, fileName)
}

const util = {
  getDemoFilePath,
  getCompileResult,
  getNodeModulesFilePath(fileName) {
    return path.join(process.cwd(), fileName)
  },
  compileTemplate(ctx) {
    const { descriptor, descriptor: { template: { content } } } = getCompileResult(ctx)
    const result = compiler.compileTemplate({
      id: String(id++),
      source: content,
      filename: descriptor.filename,
    })
    return result.code
  },
  compileStyle(ctx) {
    const { descriptor, descriptor: { styles: [{ content }] } } = getCompileResult(ctx)
    const result = compiler.compileStyle({
      id: String(id++),
      source: content,
      filename: descriptor.filename,
    })

    const styleString = 'const style = document.createElement("style");\nstyle.textContent = ' + JSON.stringify(result.code) +
      '\ndocument.head.appendChild(style)'
    return styleString
  },
  compileScript(ctx) {
    const { descriptor, descriptor: { scriptSetup: { content } } } = getCompileResult(ctx)
    const result = compiler.compileScript({
      ...descriptor,
      slotted: false,
      source: content
    })
    return result.setup
  },
  rewriteVueFileContent(ctx) {
    const requestPath = ctx.request.path
    const result = getCompileResult(ctx)
    const { template } = result.descriptor
    let code = ''
    if (template) {
      code += `// main script
import script from '${requestPath}?vue&type=script'

// template compiled to render function
import { render } from '${requestPath}?vue&type=template'

// css
import '${requestPath}?vue&type=style'

// attach render function to script
script.render = render

export default script`
    }
    return code
  }
}

module.exports = util
