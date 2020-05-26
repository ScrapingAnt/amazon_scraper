'use strict';

const got = require('got');
const fs = require('fs').promises;
const Json2csvParser = require('json2csv').Parser;
const json2xls = require('json2xls');

exports.makeRequest = async ({ url, rapidApiKey, country }) => {
    const request = await got.post('https://scrapingant.p.rapidapi.com/post', {
        retry: 5,
        headers: {
            "x-rapidapi-host": "scrapingant.p.rapidapi.com",
            "x-rapidapi-key": rapidApiKey,
            "content-type": "application/json",
            "accept": "application/json"
        },
        json: {
            url: url,
            proxy_country: country
        }
    });

    return request.body;
}

exports.writeDataToCsv = async (keyword, productsList) => {
    const productsParser = new Json2csvParser({
        fields: ['title', 'price', 'savings', 'rating', 'reviews-count', 'score', 'url', 'is-sponsored', 'is-amazon-choice', 'is-discounted', 'before-discount', 'amazon-id', 'thumbnail', 'high-res-image', 'short-description', 'full-description'],
    });

    return fs.writeFile(`${keyword}_product_${Date.now()}.csv`, productsParser.parse(productsList));
}

exports.writeDataToXls = async (keyword, productsList) =>
     fs.writeFile(`${keyword}_product_${Date.now()}.xls`, json2xls(productsList), 'binary');
