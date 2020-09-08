const path = require('path')
const through = require('through2')
const transformFile = require('./transform-file')

const transformableNodeTypes = ['file', 'url']

module.exports = function transformFiles (options) {
  return through.obj(async function (node, enc, next) {
    if (!transformableNodeTypes.includes(node.type)) {
      this.push(node)
      return next()
    }

    const parsedPath = path.parse(node.filepath)
    Object.assign(node, parsedPath)
    node.extname = node.extension = parsedPath.ext

    try {
      const { content, data } = await transformFile(node, options)
      node.content = content
      node.data = data
      this.push(node)
      next()
    } catch (err) {
      node.error = err
      this.push(node)
      next()
    }
  })
}
