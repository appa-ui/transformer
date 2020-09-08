const path = require('path')

const transformer = require('../index')
const handlebars = require('./handlebars')
const filepath = path.join(__dirname, '..', 'tests/fixtures/filesystem-example/README.md')

const data = { name: 'Example' }

transformer(filepath, { data, transform: handlebars })
  .then((stream) => {
    stream.on('data', (d) => console.log('data', d))
  })
  .catch((err) => {
    console.log('err', err)
  })
