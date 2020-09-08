const path = require('path')

const { test } = require('uvu')
const assert = require('uvu/assert')

const transformTemplate = require('../index')

const filepath = path.join(__dirname, 'fixtures', 'filesystem-example', 'README.md')

test('transform files', async () => {
  const stream = await transformTemplate(filepath)

  stream.on('data', (d) => {
    assert.ok(d)
  })
})

test('sync transform function', async () => {
  function transform ({ content, data, node }) {
    content = data.example

    return {
      data,
      content
    }
  }

  const stream = await transformTemplate(filepath, { transform })

  stream.on('data', (d) => {
    assert.ok(d.content === 'hi')
  })
})

test('async transform function', async () => {
  function transform ({ content, data, node }) {
    content = data.message

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        return resolve({
          data,
          content
        })
      }, 50)
    })
  }

  const data = { message: 'hello' }
  const stream = await transformTemplate(filepath, { data, transform })

  stream.on('data', (d) => {
    assert.ok(d.content === 'hello')
  })
})

test.run()
