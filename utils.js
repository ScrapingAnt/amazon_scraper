'use strict';

const fs = require('fs').promises;
const Json2csvParser = require('json2csv').Parser;
const json2xls = require('json2xls');

exports.writeDataToCsv = async (keyword, productsList) => {
    const productsParser = new Json2csvParser({
        fields: ['title', 'price', 'savings', 'rating', 'reviews-count', 'score', 'url', 'is-sponsored', 'is-amazon-choice', 'is-discounted', 'before-discount', 'amazon-id', 'thumbnail', 'high-res-image', 'short-description', 'full-description'],
    });

    return fs.writeFile(`${keyword}_product_${Date.now()}.csv`, productsParser.parse(productsList));
}

exports.writeDataToXls = async (keyword, productsList) =>
     fs.writeFile(`${keyword}_product_${Date.now()}.xls`, json2xls(productsList), 'binary');
