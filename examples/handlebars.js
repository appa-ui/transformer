const handlebars = require('handlebars')

module.exports = function transform ({ content, data, node }) {
  if (node.extname === '.md') {
    const template = handlebars.compile(content)

    return {
      data,
      content: template(data)
    }
  }

  return {
    data,
    content
  }
}
