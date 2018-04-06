'use strict';

const express = require('express');
const test = require('ava');
const request = require('supertest');
const lastMiddleware = require('../index');

function makeApp({ method = 'get', result, options }) {
  const app = express();
  app[method]('/', (req, res, next) => next(result));
  app.use(lastMiddleware(options));
  return app;
}

test('status code # default http status code', async (t) => {
  const config = { result: {} };
  const res = await request(makeApp(config)).get('/');

  t.is(res.status, 200);
});

test('status code # set http status code', async (t) => {
  const getStatusCodes = [200, 301, 400, 500];
  for (const statusCode of getStatusCodes) {
    const config = { result: { statusCode } };
    const res = await request(makeApp(config)).get('/');
    t.is(res.status, statusCode);
  }

  const postStatusCode = [201];
  for (const statusCode of postStatusCode) {
    const config = { method: 'post', result: { statusCode } };
    const res = await request(makeApp(config)).post('/');
    t.is(res.status, statusCode);
  }
});

test('status code # set wrong http status code', async (t) => {
  const config = { result: { statusCode: 1000 } };
  const res = await request(makeApp(config)).get('/');

  t.is(res.status, 500);
});

test('response body # string type response', async (t) => {
  const config = { result: 'OK' };
  const res = await request(makeApp(config)).get('/');

  t.is(res.status, 200);
  t.is(res.body, config.result);
});

test('response body # integer type response', async (t) => {
  const config = { result: 200 };
  const res = await request(makeApp(config)).get('/');

  t.is(res.status, 200);
  t.is(res.body, config.result);
});

test('response body # object type response', async (t) => {
  const config = { result: { response: { data: 'OK' } } };
  const res = await request(makeApp(config)).get('/');

  t.is(res.status, 200);
  t.deepEqual(res.body, config.result.response);
});

test('response body # error type response', async (t) => {
  const config = { result: new Error('error') };
  const res = await request(makeApp(config)).get('/');

  t.is(res.status, 500);
});

test('response body # string format response', async (t) => {
  const config = {
    result: { response: { data: 'OK' }, format: 'string' }
  };
  const res = await request(makeApp(config)).get('/');

  t.is(res.status, 200);
  t.is(res.text, JSON.stringify(config.result.response));
});

test('response body # string format response using middleware options', async (t) => {
  const config = {
    result: { response: { data: 'OK' } },
    options: { format: 'string' }
  };
  const res = await request(makeApp(config)).get('/');

  t.is(res.status, 200);
  t.is(res.text, JSON.stringify(config.result.response));
});
