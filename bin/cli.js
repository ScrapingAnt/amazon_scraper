#!/usr/bin/env node
'use strict';

const ProductsScraper = require('../products-scraper');

const startScraper = async argv => {
    try {
        await new ProductsScraper({ ...argv, showProgress: true }).startScraping();
    } catch (error) {
        console.log(error);
    }
};

require('yargs')
    .usage('Usage: $0 [options]')
    .example(`$0 -s 'baking mat' -k 'rapid_api_key'`)
    .example(`$0 -s 'baking mat' -H 'www.amazon.de' -k 'rapid_api_key'`)
    .example(`$0 -s 'baking mat' -c 'us' -H 'www.amazon.de' -k 'rapid_api_key'`)
    .command('$0', 'Scrapes for a products with rotating proxies from the provided key word', {}, argv => {
        startScraper(argv);
    })
    .options({
        help: {
            alias: 'h',
            describe: 'help',
        },
        keyword: {
            alias: 'k',
            default: '',
            type: 'string',
            describe: "Amazon search keyword ex. 'baking mat'",
        },
        apiKey: {
            alias: 'a',
            default: '',
            type: 'string',
            describe: 'RapidAPI key for ScrapingAnt API'
        },
        number: {
            alias: 'n',
            default: 10,
            type: 'number',
            describe: 'Number of products to scrape. Maximum 500 products',
        },
        save: {
            alias: 's',
            default: true,
            type: 'boolean',
            describe: 'Save to a file?',
        },
        fileType: {
            alias: 't',
            default: 'csv',
            describe: "File type to save: can be either csv or xls."
        },
        host: {
            alias: 'H',
            default: 'amazon.com',
            type: 'string',
            describe: 'The regional Amazon host (can be amazon.fr, amazon.co.uk, etc.)',
        },
        country: {
            alias: 'c',
            default: 'us',
            type: 'string',
            describe: 'Country of proxies location'
        }
    })
    .check(argv => {
        if (!argv.apiKey) {
            throw 'ScrapingAnt RapidAPI key is missing';
        }
        if (!argv.keyword) {
            throw 'Search keyword is missing';
        }
        return true;
    })
    .demandCommand().argv;