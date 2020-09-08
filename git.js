const fs = require('fs')
const os = require('os')
const path = require('path')
const https = require('https')

const debug = require('debug')('appa-ui/transformer:git')

const gitInfo = require('hosted-git-info')
const gitRegex = require('regex-git')
const mkdirp = require('mkdirp')
const tar = require('tar-fs')
const gunzip = require('gunzip-maybe')
const pump = require('pump')
const eos = require('end-of-stream')

const { WrongSourceError } = require('./lib/errors')
const filesystem = require('./filesystem')

function isGitUrl (source) {
  return gitRegex.test(source)
}

function downloadTarball (url, destinationFilepath) {
  mkdirp.sync(path.dirname(destinationFilepath))

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode > 400) {
        debug(`${res.statusCode} - ${res.statusMessage}`)
        return reject(new Error({
          code: res.statusCode,
          message: res.statusMessage
        }))
      } else if (res.statusCode > 300) {
        return downloadTarball(res.headers.location, destinationFilepath).then(resolve)
      }

      const stream = pump(res, fs.createWriteStream(destinationFilepath))

      eos(stream, (err) => {
        if (err) return reject(new Error())
        resolve()
      })
    })
  })
}

function untar (tarballFilepath, destinationFilepath) {
  return new Promise((resolve, reject) => {
    mkdirp.sync(destinationFilepath)
    const untarStream = tar.extract(destinationFilepath)
    const stream = pump(fs.createReadStream(tarballFilepath), gunzip(), untarStream)

    eos(stream, (err) => {
      if (err) return reject(err)
      const [repoDirectory] = fs.readdirSync(destinationFilepath)
      resolve(repoDirectory)
    })
  })
}

module.exports = async function git (source, options = {}) {
  debug(source, options)

  if (!isGitUrl(source)) {
    throw new WrongSourceError()
  }

  const cacheDirectory = options.cacheDirectory || path.join(os.homedir(), '.appa-transformer', 'cache')
  mkdirp.sync(cacheDirectory)

  const info = gitInfo.fromUrl(source)
  const tarballUrl = info.tarball()
  const shortcut = info.shortcut()
  const tarballFilepath = `${path.join(cacheDirectory, shortcut)}.tar.gz`
  const extractedDirectory = path.join(cacheDirectory, shortcut)

  // download tarball
  await downloadTarball(tarballUrl, tarballFilepath)

  // untar
  const repoDirectory = await untar(tarballFilepath, extractedDirectory)

  // TODO: it should be possible to pipe the untar stream into a transformFiles stream
  // for now: use filesystem code to transform files
  return filesystem(path.join(extractedDirectory, repoDirectory), options)
}
