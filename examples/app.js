'use strict';

const express = require('express');
const lastMiddlware = require('../index');

const app = express();

app.get('/', (req, res, next) => {
  next({
    response: { message: 'Welcome to express-last-middleware' }
  });
});

app.get('/200', (req, res, next) => {
  next({
    statusCode: 200,
    response: { message: 'OK' }
  });
});

app.get('/400', (req, res, next) => {
  next({
    statusCode: 400,
    response: { message: 'Bad Request' }
  });
});

app.get('/error', (req, res, next) => {
  next(new Error('This is an error'));
});

app.use(lastMiddlware({
  handleError: (error, req, res) => {
    res.status(500);
    res.json({ message: error.message });
  }
}));

app.listen(3000);
