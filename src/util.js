const path = require("path")
const demoDir = path.join(process.cwd(), 'demo')

module.exports = {
  getDemoFilePath(fileName) {
    return path.join(demoDir, fileName)
  },
  getNodeModulesFilePath(fileName) {
    return path.join(process.cwd(), fileName)
  }
}
