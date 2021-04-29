var express = require('express');
const {
  route
} = require('.');
var router = express.Router();

var Book = require('../models/book')

/**
 * @swagger
 * components: 
 *  schemas:
 *    Book:
 *      type: object
 *      required: 
 *        - name
 *        - author
 *        - price
 *      properties:
 *        _id:
 *          type: string
 *          description: O id gerado automaticamente pelo servidor
 *        name:
 *          type: string
 *          description: O título do livro
 *        author:
 *          type: string
 *          description: O nome do autor primário do livro
 *        price:
 *          type: number
 *          description: O preço do livro
 *        __v:
 *          type: number
 *          description: Versão do esquema utilizado para criar o livro
 *      example:
 *        _id: 6089f79e66ce2d39b812b40e
 *        name: Diário de um Banana
 *        author: Jeff Kinney
 *        price: 40
 *        __v: 0
 * 
 *    Error:
 *      type: object
 *      properties:
 *        message:
 *          type: string
 *          description: Descrição do erro ocorrido caso disponível
 *      example:
 *        message: O nome do livro deve ter entre 4 e 65 caracteres
 */

/**
 * @swagger
 * /books:
 *  post:
 *    summary: Adiciona um novo livro
 *    tags: [Livros]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Book'
 *    responses:
 *      200:
 *        description: Livro adicionado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Book'
 *      400:
 *        description: Requisição inválida
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      500:
 *        description: Um erro interno ocorreu ao tentar processar a solicitação
 */
router.post('/', async (req, res, next) => {

  // Sanitization
  try {

    // Checks if there are missing arguments
    if (!req.body.name || !req.body.author || !req.body.price) return res.status(400).send({
      message: "Requisição inválida. Há campos requeridos que não foram preenchidos."
    })

    // Checks if book's name is valid
    if (req.body.name.length < 4 || req.body.name.length > 65) return res.status(400).send({
      message: "O nome do livro deve ter entre 4 e 65 caracteres",
      data: req.body.name
    })

    // Checks if the author's name is valid
    if (req.body.author.length < 4 || req.body.author.length > 25) return res.status(400).send({
      message: "O nome do autor deve ter entre 4 e 25 caracteres",
      data: req.body.author
    })

    // Checks if price is a valid number
    var reg = /\A[1-9]+\z/
    var price;
    try {
      price = parseInt(req.body.price, 10)
    } catch (err) {
      throw new Error(err)
    }

    if (!price || price < 0 || price > 9999) return res.status(400).send({
      message: "O preço inserido é inválido. O preço deve estar entre 0 e 9.999",
      data: price
    })
  } catch (e) {
    console.log(e)
    return res.sendStatus(500)
  }

  // Checks if there's a book with the same name registered already
  var exists = await Book.exists({
    name: req.body.name
  }).catch(e => {
    console.log("CREATE book ERROR: " + e)
    return res.sendStatus(500)
  })
  if (exists) return res.status(400).send({
    message: "Já há um livro cadastrado com este nome"
  })

  var data = new Book()
  data.name = req.body.name
  data.author = req.body.author
  data.price = req.body.price

  data.save().then(x => {
    res.status(200).send(x)
  }).catch(e => {
    res.sendStatus(500)
  })

})

/**
 * @swagger
 * tags:
 *  name: Livros
 *  description: Sistema de gerenciamento de livros
 */

/**
 * @swagger
 * /books:
 *  get:
 *    summary: Retorna todos os livros disponíveis
 *    tags: [Livros]
 *    responses:
 *      200:
 *        description: Requisição realizada com sucesso
 *        content:
 *           application/json:
 *              schema:
 *                type: array
 *                items:
 *                   $ref: '#/components/schemas/Book'
 */
router.get('/', async (req, res, next) => {
  const data = Book.find({}, (err, books) => {
    if (err) res.status(400).send({
      message: "Falha ao obter lista de livros",
      data: err
    })
    else {
      res.status(200).send({
        message: "Success",
        data: books
      })
    }
  })
});

/**
 * @swagger
 * /books/{id}:
 *  get:
 *    summary: Localiza um livro por seu ID
 *    tags: [Livros]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: O id do livro em questão
 *    responses:
 *      200:
 *        description: Livro encontrado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Book'
 *      404:
 *        description: Livro não encontrado
 */
router.get('/:id', (req, res, next) => {
  const data = Book.findById(req.params.id, (err, book) => {
    if (err) res.sendStatus(404)
    else res.status(200).send(book)
  })
})

/**
 * @swagger
 *  /books/{id}:
 *    put:
 *      summary: Atualiza os dados de um livro existente utilizando seu ID
 *      tags: [Livros]
 *      requestBody:
 *        required: true
 *        content: 
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Book'
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          required: true
 *          description: O id do livro em questão
 *      responses:
 *        200:
 *          description: Livro atualizado
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Book'
 *        400:
 *          description: Requisição inválida
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *        500:
 *          description: Erro interno
 */
router.put('/:id', (req, res, next) => {

  if (!req.params.id) return res.status(400).send({
    message: "Requisição inválida.",
    data: "id ausente"
  })

  const book = Book.findById(req.params.id, (err, book) => {
    if (err) res.status(400).send({
      message: "Requisição inválida.",
      data: err
    })
  })

  // Sanitization
  try {

    // Checks if there are missing arguments
    if (!req.body.name || !req.body.author || !req.body.price) return res.status(400).send({
      message: "Requisição inválida. Há campos requeridos que não foram preenchidos."
    })

    // Checks if book's name is valid
    if (req.body.name.length < 4 || req.body.name.length > 65) return res.status(400).send({
      message: "O nome do livro deve ter entre 4 e 65 caracteres",
      data: req.body.name
    })

    // Checks if the author's name is valid
    if (req.body.author.length < 4 || req.body.author.length > 25) return res.status(400).send({
      message: "O nome do autor deve ter entre 4 e 25 caracteres",
      data: req.body.author
    })

    // Checks if price is a valid number
    var reg = /\A[1-9]+\z/
    var price;
    try {
      price = parseInt(req.body.price, 10)
    } catch (err) {
      throw new Error(err)
    }

    if (!price || price < 0 || price > 9999) return res.status(400).send({
      message: "O preço inserido é inválido. O preço deve estar entre 0 e 9.999",
      data: price
    })
  } catch (e) {
    console.log(e)
    return res.status(400).send({
      message: "Requisição inválida"
    })
  }

  book.updateOne({
    _id: req.params.id
  }, req.body, (err, book) => {
    if (err) res.status(400).send({
      message: "Requisição inválida",
      data: err
    })
    else res.status(200).send({
      message: "Success",
      data: book
    })
  }).catch(e => {
    console.log(`UPDATE book - ERROR: ${e}`)
    res.status(500).send({
      message: "Erro interno"
    })
  })
})

/**
 * @swagger
 * /books/{id}:
 *  delete:
 *    summary: Deleta um livro cadastrado
 *    tags: [Livros]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: O id do livro em questão
 *    responses:
 *      200:
 *        description: Livro excluído
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Book'
 *      400:
 *        description: Requisição inválida
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      500:
 *        description: Erro interno
 */
router.delete('/:id', (req, res, next) => {

  Book.findByIdAndDelete(req.params.id, (err, book) => {
    if (err) return res.status(400).send({ message: err })
    else if (!book) return res.sendStatus(404)
    else return res.status(200).send(book)
  }).catch(e => {
    console.log(`DELETE book - ERROR: ${e}`)
    return res.sendStatus(500)
  })

})

module.exports = router;