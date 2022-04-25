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
  const extnameWithDot = path.extname(href).split('?')[0]; //eg: .js .css ...
  const basename = path.basename(href); // eg: index.html index.js ...
  const extname = extnameWithDot.slice(1) // => html、js、css ...
  // handle index.html
  if (requestPath === '/') {
    ctx.set('Content-Type', mime.getType('.html'))
    const htmlString = fs.readFileSync(getWorkSpaceFilePath('index.html'), "utf-8")
    // hack process
    ctx.body = htmlString.replace(/\<body\>/, `<body><script>
    window.process = {
      env: {
        NODE_ENV: "development"
      }
    }
    </script>`)
    return
  }
  // handle .vue file
  if (extname === "vue") {
    ctx.set('Content-Type', mime.getType('.js'))
    // rewrite .vue file
    if (!query.type) {
      ctx.body = rewriteVueFileContent(ctx)
    } else {
      // handle vue file query like: App.vue?type=template
      let responseContent = ''
      if (query.type === "script") {
        responseContent = await compileScript(ctx)
      } else if (query.type === "template") {
        responseContent = await rewriteImportPath(compileTemplate(ctx))
      } else if (query.type === "style") {
        responseContent = compileStyle(ctx)
      }
      ctx.set('Content-Type', mime.getType('.js'))
      ctx.body = responseContent
    }
  } else if (extname === "js") {
    ctx.set('Content-Type', mime.getType(extname))
    ctx.body = await rewriteImportPath(fs.readFileSync(getWorkSpaceFilePath(basename), "utf-8"));
  } else if (requestPath.includes('/@modules')) {
    ctx.set('Content-Type', mime.getType('js'))
    ctx.body = await rewriteImportPath(fs.readFileSync(getPackageFilePath(requestPath), "utf-8"))
  } else {
    ctx.set('Content-Type', mime.getType(extname))
    ctx.body = fs.createReadStream(getWorkSpaceFilePath(basename))
  }
})

server.listen(3000, () => {
  console.log('server start at http://localhost:3000');
})