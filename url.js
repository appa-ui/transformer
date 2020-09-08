const got = require('got')
const pump = require('pump')
const through = require('through2')
const from = require('from2-array')
const transformFiles = require('./lib/transform-files')
const { WrongSourceError } = require('./lib/errors')

const debug = require('debug')('appa-ui/transformer:url')

module.exports = async function url (source, options = {}) {
  debug(source, options)

  const urls = Array.isArray(source) ? source : [source]

  const parsedUrls = urls.map((url) => {
    const parsedUrl = new URL(url)

    if (!parsedUrl.protocol.includes('http')) {
      throw new WrongSourceError()
    }

    if (parsedUrl.hostname === 'github.com') {
      url = `https://raw.githubusercontent.com${parsedUrl.pathname.replace('/blob', '')}`
    }

    return {
      url,
      parsedUrl
    }
  })

  const fetchData = through.obj(async function (data, enc, next) {
    const { url, parsedUrl } = data
    const response = await got(url)

    this.push(Object.assign({}, parsedUrl, {
      type: 'url',
      file: response.body,
      filepath: parsedUrl.pathname
    }))

    next()
  })

  return pump(from.obj(parsedUrls), fetchData, transformFiles(options))
}
