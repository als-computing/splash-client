const keys = [
  'experiment',
]

module.exports = keys.map(key => ({ ...require('./' + key), key }))
