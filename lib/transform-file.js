const frontMatter = require('front-matter')

async function noop ({ content, data, node }) {
  return { content, data, node }
}

const allowedFrontmatterExtensions = [
  '.md',
  '.markdown',
  '.js',
  '.html'
]

module.exports = async function transformFile (node, options) {
  const { transform = noop, data = {} } = options

  let fileContent = node.file
  let attr = {}

  if (allowedFrontmatterExtensions.includes(node.ext)) {
    const { body, attributes } = frontMatter(node.file)
    fileContent = body
    attr = attributes
  }

  const fileData = Object.assign({}, data, attr)
  const transformOptions = { content: fileContent, data: fileData, node }
  const result = await transform(transformOptions)

  return {
    content: result.content,
    data: result.data,
    node: result.node
  }
}
