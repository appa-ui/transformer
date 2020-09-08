const fs = require('fs')
const path = require('path')

const debug = require('debug')('appa-ui/transformer:filesystem')

const pump = require('pump')
const reader = require('folder-reader')
const transformFiles = require('./lib/transform-files')
const { WrongSourceError } = require('./lib/errors')

module.exports = async function filesystem (source, options = {}) {
  debug(source, options)

  const absoluteFilepath = path.isAbsolute(source) ? source : path.join(process.cwd(), source)
  const fullFilepath = options.filepath ? path.join(absoluteFilepath, options.filepath) : absoluteFilepath

  try {
    await filepathExists(fullFilepath)
  } catch (err) {
    throw new WrongSourceError()
  }

  return pump(reader(fullFilepath), transformFiles(options))
}

function filepathExists (fullFilepath) {
  return new Promise((resolve, reject) => {
    fs.stat(fullFilepath, (err, stats) => {
      if (err) {
        reject(err)
      }

      resolve(true)
    })
  })
}
