'use strict';

const ProductsScraper = require('./products-scraper')

module.exports = (options) => { return new ProductsScraper(options) }