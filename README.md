# express-last-middleware

[![Build Status](https://travis-ci.org/royeo/express-last-middleware.svg?branch=master)](https://travis-ci.org/royeo/express-last-middleware)
[![Coverage Status](https://coveralls.io/repos/github/royeo/express-last-middleware/badge.svg?branch=master)](https://coveralls.io/github/royeo/express-last-middleware?branch=master)

The last middleware of express to handle the final response.

## Installation

```sh
$ npm install express-last-middleware
```

## Features

- Uniformly use the `next()` function in express to handle the response
- Setting the HTTP status code and response body at the same time
- Custom internal error response handler

## Usage

First, use `express-last-middleware` as the last middleware for express.

```js
const express = require('express');
const lastMiddleware = require('express-last-middleware');

const app = express();

// some routes ...

app.use(lastMiddleware());

app.listen(3000);
```

Then, when you need to send a response, just pass a value to the `next()` function. This passed value can be an object or a basic data type value.

```js
app.get('/', (req, res, next) => {
  next({ response: { data: 'OK' } });
});
```

If you pass a non-error object to the `next()` function, this object allows three optional attributes.

```js
app.get('/', (req, res, next) => next({
  statusCode: 200,            // set the HTTP status code, default 200
  response: { data: 'OK' },   // set the response body
  format: 'json'              // set the format of the response body, 'json' or 'string', default 'json'
}));
```

If you pass an error object to the `next()` function, the default HTTP status code for this response is `500` and the response body is an object containing the error message. You can also customize the function to handle the error object.

```js
app.get('/', (req, res, next) => {
  next(new Error('This is an error'));
});
```

If you pass a basic data type value to the `next()` function, the default HTTP status code for this response is `200` and the response body is the value of this basic data type value.

```js
app.get('/', (req, res, next) => {
  next('OK');
});
```

### API

#### lastMiddleware(options)

This `options` has two optional attributes, `format` and `handleError`.

#### options.format

The format of the response body, `json` or `string`, default `json`.

#### options.handleError

The function to handle the error object. If this function is not set, a `500` HTTP status code and error message response body will be returned when the `next()` function passes in an error object or an internal error occurs.

This function must receive three parameters, `error`, `req` and `res`.

#### options example

```js
app.use(lastMiddleware({
  format: 'json',
  handleError: (error, req, res) => {
    res.status(500);
    res.json({ message: error.message });
  }
}));
```

## Tests

```sh
$ npm test
```

## LICENSE

[MIT](LICENSE)