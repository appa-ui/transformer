const CustomError = require('custom-error-class')

exports.WrongSourceError = class WrongSourceError extends CustomError {
  constructor (message) {
    super(message)
    this.code = 'WRONG_SOURCE'
  }
}

exports.UnsupportedSourceError = class UnsupportedSourceError extends CustomError {
  constructor () {
    super('Only templates from the local filesystem, git, or dat are supported')
    this.code = 'UNSUPPORTED_SOURCE'
  }
}
