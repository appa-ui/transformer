const debug = require('debug')('appa-ui/transformer')
const { UnsupportedSourceError } = require('./lib/errors')

const git = require('./git')
const filesystem = require('./filesystem')
const url = require('./url')

/**
* Transform files from git or your local filesystem, or a url
*
* @name transformer
* @param {string} source - filepath, url, or git repo
* @param {[object]} options - optional object
* @param {[function]} options.transform - function that can transform each file
* @param {[object]} options.data - data object that is passed to templates
* @param {[object]} options.filepath - relative filepath to use with the source, especially helpful with dat & git. can specify file or directory
* @param {[string]} options.cacheDirectory - filepath for caching git & dat downloads
* @return {object} returns a stream of file and directory objects that can be used to construct a new directory
**/
module.exports = async function transformer (source, options = {}) {
  try {
    return await git(source, options)
  } catch (err) {
    debug(err)
    if (err.code !== 'WRONG_SOURCE') {
      throw err
    }
  }

  try {
    return await filesystem(source, options)
  } catch (err) {
    debug(err)
    if (err.code !== 'WRONG_SOURCE') {
      throw err
    }
  }

  try {
    return await url(source, options)
  } catch (err) {
    debug(err)
    if (err.code === 'WRONG_SOURCE') {
      throw new UnsupportedSourceError()
    } else {
      throw err
    }
  }
}

module.exports.git = git
module.exports.filesystem = filesystem
module.exports.url = url
