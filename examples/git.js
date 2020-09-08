const transformer = require('../index')

// const repo = 'git@github.com:sethvincent/example-github-actions-node.git'
const repo = 'https://github.com:sethvincent/example-github-actions-node.git'

transformer(repo)
  .then((stream) => {
    stream.on('data', (d) => {
      if (d.error) console.log(d.filepath, d.error)
      console.log(d.filepath)
    })
  })
  .catch((err) => {
    console.log('err', err)
  })
