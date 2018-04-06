'use strict';

const express = require('express');
const test = require('ava');
const request = require('supertest');
const lastMiddleware = require('../index');

function makeApp({ result = {}, options }) {
  const app = express();
  app.get('/', (req, res, next) => next(result));
  app.use(lastMiddleware(options));
  return app;
}

test('check parameters # json format', async (t) => {
  const config = { options: { format: 'json' } };
  const res = await request(makeApp(config)).get('/');

  t.is(res.status, 200);
});

test('check parameters # string format', async (t) => {
  const config = { options: { format: 'string' } };
  const res = await request(makeApp(config)).get('/');

  t.is(res.status, 200);
});

test('check parameters # wrong format', async (t) => {
  const config = { options: { format: 'number' } };
  try {
    await request(makeApp(config)).get('/');
  } catch (e) {
    t.truthy(e);
  }
});

test('check parameters # handleError', async (t) => {
  const handleError = (error, req, res) => {
    res.status(502);
    res.json({ message: error.message });
  };

  const config = { options: { handleError }, result: new Error('Bad gateway') };
  const res = await request(makeApp(config)).get('/');

  t.is(res.status, 502);
  t.deepEqual(res.body, { message: 'Bad gateway' });
});

test('check parameters # wrong handleError', async (t) => {
  const config = { options: { handleError: 'not a function' } };
  try {
    await request(makeApp(config)).get('/');
  } catch (e) {
    t.truthy(e);
  }
});
