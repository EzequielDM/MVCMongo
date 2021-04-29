var mongoose = require('mongoose')

var bookSchema = new mongoose.Schema({
	name: { type: 'string', required: true},
	author: { type: 'string', required: true },
	price: { type: 'number', required: true}
})

module.exports = mongoose.model('books', bookSchema)