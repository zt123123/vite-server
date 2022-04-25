const Koa = require("koa")
const mime = require("mime/lite")
const fs = require("fs")
const path = require("path")
const { getDemoFilePath, getNodeModulesFilePath, rewriteVueFileContent, compileTemplate, compileStyle, compileScript } = require("./util")
const server = new Koa()

server.use(async (ctx) => {
  const href = ctx.request.href
  const query = ctx.request.query
  const requestPath = ctx.request.path
  const extnameWithDot = path.extname(href); //eg: .js .css ...
  const basename = path.basename(href); // eg: index.html index.js ...
  const extname = extnameWithDot.slice(1) // => html、js、css ...
  // handle index.html
  if (ctx.request.path === '/') {
    ctx.set('Content-Type', mime.getType('.html'))
    ctx.body = fs.createReadStream(getDemoFilePath('index.html'))
    return
  }

  // TODO: rewrite node_modules
  if(true){

  }

  if (query.type) {
    let responseContent = ''
    if (query.type === "script") {
      responseContent = compileScript(ctx)
    } else if (query.type === "template") {
      responseContent = compileTemplate(ctx)
    } else if (query.type === "style") {
      responseContent = compileStyle(ctx)
    }
    ctx.type = mime.getType('.js')
    ctx.body = responseContent
    return
  }


  // handle .vue file
  if (extnameWithDot === ".vue") {
    ctx.set('Content-Type', mime.getType('.js'))
    // rewrite
    const content = rewriteVueFileContent(ctx)
    ctx.body = content
    return
  }


  // set response header
  ctx.set('Content-Type', mime.getType(extname))
  if (ctx.request.path.includes('node_modules')) {
    ctx.body = fs.createReadStream(getNodeModulesFilePath(ctx.request.path))
    return
  }
  // FIXME: 404 whithout extname eg: import a from './a'
  ctx.body = fs.createReadStream(getDemoFilePath(basename))
})

server.listen(3000, () => {
  console.log('server start at http://localhost:3000');
})