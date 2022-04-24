const Koa = require("koa")
const mime = require("mime/lite")
const fs = require("fs")
const path = require("path")

const { getDemoFilePath, getNodeModulesFilePath } = require("./util")
const server = new Koa()

server.use(async (ctx) => {
  const extnameWithDot = path.extname(ctx.request.href); //eg: .js .css ...
  const basename = path.basename(ctx.request.href); // eg: index.html index.js ...
  const extname = extnameWithDot.slice(1) // => html、js、css ...
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