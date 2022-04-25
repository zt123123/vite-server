const Koa = require("koa")
const mime = require("mime/lite")
const fs = require("fs")
const path = require("path")
const {
  getWorkSpaceFilePath, getPackageFilePath, rewriteVueFileContent,
  compileTemplate, compileStyle, compileScript, rewriteImportPath
} = require("./util")
const server = new Koa()

server.use(async (ctx) => {
  const href = ctx.request.href
  const query = ctx.request.query
  const requestPath = ctx.request.path // eg: /index.js
  const extnameWithDot = path.extname(href); //eg: .js .css ...
  const basename = path.basename(href); // eg: index.html index.js ...
  const extname = extnameWithDot.slice(1) // => html、js、css ...
  // handle index.html
  if (requestPath === '/') {
    ctx.set('Content-Type', mime.getType('.html'))
    ctx.body = fs.createReadStream(getWorkSpaceFilePath('index.html'))
    return
  }

  // handle vue file query like: App.vue?type=template
  if (query.type) {
    let responseContent = ''
    if (query.type === "script") {
      responseContent = compileScript(ctx)
    } else if (query.type === "template") {
      responseContent = compileTemplate(ctx)
    } else if (query.type === "style") {
      responseContent = compileStyle(ctx)
    }
    ctx.set('Content-Type', mime.getType('.js'))
    responseContent = await rewriteImportPath(responseContent)
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
  if (extname === "js") {
    const content = await rewriteImportPath(fs.readFileSync(getWorkSpaceFilePath(basename), "utf-8"));
    ctx.body = content
    return
  }
  if (requestPath.includes('/@modules')) {
    ctx.set('Content-Type', mime.getType('js'))
    ctx.body = fs.createReadStream(getPackageFilePath(requestPath))
    return
  }
  ctx.body = fs.createReadStream(getWorkSpaceFilePath(basename))
})

server.listen(3000, () => {
  console.log('server start at http://localhost:3000');
})