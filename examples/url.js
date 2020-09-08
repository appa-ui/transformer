const fs = require('fs')
const path = require('path')
const transformer = require('../index')
const handlebars = require('./handlebars')

// const url = 'https://raw.githubusercontent.com/sethvincent/apizza/master/pizza.md'
const url = 'https://github.com/sethvincent/apizza/blob/master/pizza.md'

transformer(url, { transform: handlebars })
  .then((stream) => {
    stream.on('data', (d) => {
      if (d.error) console.log(d.error)
      console.log(d)

      fs.writeFileSync(path.join(__dirname, '..', '/tmp/pizza.md'), d.content)
    })
  })
  .catch((err) => {
    console.log('err', err)
  })
