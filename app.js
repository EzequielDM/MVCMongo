var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const swaggerUI = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc')

var indexRouter = require('./routes/index');
var booksRouter = require('./routes/books');

var mongoose = require('mongoose')
mongoose.connect("mongodb://localhost:27017/restapi", { useNewUrlParser: true, useUnifiedTopology: true })

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Swagger Test",
      version: "1.0.0",
      description: "Simple Swagger Express.JS server"
    },
    servers: [
      {
        url: "http://localhost:3000"
      }
    ]
  },
  apis: ["./routes/*.js"]
}

const specs = swaggerJSDoc(options)

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/books', booksRouter);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;