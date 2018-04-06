'use strict';

const http = require('http');
const _ = require('lodash');

/**
 * a class that handles the response
 */
class FinalResponse {
  constructor(options = {}) {
    this.checkFormat(options.format);
    this.format = options.format || 'json';

    this.checkHandleError(options.handleError);
    this.handleError = options.handleError || this.defaultHandleError;
  }

  /**
   * a middleware that handles the response
   * @param {any} result
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  middleware(result, req, res, next) {
    if (_.isError(result)) {
      this.handleError(result, req, res);
    } else {
      this.handleResponse(result, res);
    }
  }

  /**
   * default error handle
   * @param {object} error 
   * @param {object} req 
   * @param {object} res 
   */
  defaultHandleError(error, req, res) {
    this.setStatusCode(res, 500);
    this.sendResponse(res);
  }

  /**
   * handle normal response
   * @param {any} result
   * @param {object} res
   */
  handleResponse(result, res) {
    if (typeof result === 'object') {
      this.setStatusCode(res, result.statusCode);
      this.sendResponse(res, result);
    } else {
      this.setStatusCode(res, 200);
      this.sendResponse(res, { response: result });
    }
  }

  /**
   * set http status code, default 200
   * @param {object} res
   * @param {number} statusCode
   */
  setStatusCode(res, statusCode) {
    if (!statusCode) {
      res.status(200);
    } else if (this.isStatusCodeValid(statusCode)) {
      res.status(statusCode);
    } else {
      throw TypeError('statusCode must be a valid http status code');
    }
  }

  /**
   * determine whether the http status code is valid
   * @param {number} statusCode
   * @return {boolean}
   */
  isStatusCodeValid(statusCode) {
    return Number.isInteger(statusCode)
      && Boolean(http.STATUS_CODES[statusCode]);
  }

  /**
   * send a response
   * @param {object} res
   * @param {object} result
   */
  sendResponse(res, result = {}) {
    this.checkFormat(result.format);
    const format = result.format || this.format;
    return format === 'json'
      ? res.json(result.response)
      : res.send(JSON.stringify(result.response));
  }

  /**
   * check if the format is valid
   * @param {string} format 
   */
  checkFormat(format) {
    if (format && format !== 'json' && format !== 'string') {
      throw new TypeError('format can only be json or string');
    }
  }

  /**
   * check if the handleError is valid
   * @param {function} handleError 
   */
  checkHandleError(handleError) {
    if (handleError && typeof handleError !== 'function') {
      throw new TypeError('handleError must be a function');
    }
  }
}

module.exports = function lastMiddleware(options) {
  const finalResp = new FinalResponse(options);
  return finalResp.middleware.bind(finalResp);
};
