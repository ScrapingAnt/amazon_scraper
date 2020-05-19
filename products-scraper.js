'use strict';

const cheerio = require('cheerio');
const makeRequest = require('./utils').makeRequest;
const writeDataToCsv = require('./utils').writeDataToCsv;
const writeDataToXls = require('./utils').writeDataToXls;
const cliProgress = require('cli-progress');
const querystring = require('querystring');

const CONSTANTS = require('./constants');

class ProductsScraper {

    constructor({keyword, number, host, apiKey, save, country, fileType, showProgress }) {
        this.host = `https://${host || CONSTANTS.defaultAmazonUrl}`;

        this.alreadyScrappedProducts = [];
        this.apiKey = apiKey;
        this.keyword = keyword;
        this.fileType = fileType;
        this.numberOfProducts = parseInt(number) || CONSTANTS.defaultItemLimit;
        this.currentSearchPage = 1;
        this.saveToFile = save || false;
        this.country = country || 'us';
        this.progressBar = showProgress ? new cliProgress.SingleBar({
            format: `Amazon Scraping: ${this.keyword} | {bar} | {percentage}% - {value}/{total} Products || ETA: {eta}s`,
        }, cliProgress.Presets.shades_classic) : null;
    }

    async startScraping() {
        this.checkForCountry();
        this.checkForApiKey();
        this.checkForKeyword();
        this.checkForFileType();
        this.checkForProductsNumber();

        if (this.progressBar) {
            this.progressBar.start(this.numberOfProducts, 0);
        }

        while (true) {
            if (this.alreadyScrappedProducts.length >= this.numberOfProducts) {
                break;
            }

            const currentPageProducts = await this.getCurrentPageData();

            if (currentPageProducts.length > 0) {
                this.alreadyScrappedProducts = this.alreadyScrappedProducts.concat(currentPageProducts);

                if (this.progressBar) {
                    this.progressBar.update(this.alreadyScrappedProducts.length);
                }

                this.currentSearchPage++;
            } else {
                break;
            }
        }

        await this.checkAndSaveToFile();

        if (this.progressBar) {
            this.progressBar.stop();
        }

        console.log(`Total scraped products count: ${this.alreadyScrappedProducts.length}`);

        return this.alreadyScrappedProducts;
    }

    checkForCountry() {
        this.country = this.country.toLowerCase();

        if (!CONSTANTS.supported_countries.includes(this.country)) {
            throw `Not supported country. Please use one from the following: ${CONSTANTS.supported_countries.join(", ")}`;
        }
    }

    checkForApiKey() {
        if (!this.apiKey) {
            throw `No RapidAPI apiKey. Please refer to https://rapidapi.com/okami4kak/api/scrapingant for getting yours.`;
        }
    }

    checkForKeyword() {
        if (!this.keyword) {
            throw `No keyword for search. Please specify it..`;
        }
    }

    checkForFileType() {
        if (this.fileType) {
            this.saveToFile = true;
        }

        this.fileType = this.fileType.toLowerCase();

        if (!Object.values(CONSTANTS.supported_filetypes).includes(this.fileType)) {
            throw `Not supported file type. Please use one from the following: ${Object.values(CONSTANTS.supported_filetypes).join(", ")}`;
        }
    }

    checkForProductsNumber() {
        if (this.numberOfProducts > CONSTANTS.limit.product) {
            this.numberOfProducts = CONSTANTS.limit.product;
            console.info(`Setting number to MAXIMUM available (${CONSTANTS.limit.product}) because of exceeding limit.`);
        }
    }

    async checkAndSaveToFile() {
        if (this.saveToFile && this.alreadyScrappedProducts.length > 0) {
            const preparedKeyword = this.keyword.replace(/\s/g, "_");

            if (this.fileType === CONSTANTS.supported_filetypes.csv) {
                await writeDataToCsv(preparedKeyword, this.alreadyScrappedProducts);
            }

            if (this.fileType === CONSTANTS.supported_filetypes.xls) {
                await writeDataToXls(preparedKeyword, this.alreadyScrappedProducts);
            }
        }
    }

    async getCurrentPageData() {
        const queryParams = querystring.encode({
            k: this.keyword,
            page: this.currentSearchPage
        });

        for (let i = 0; i < CONSTANTS.limit.retry; i++) {
            const pageBody = await makeRequest({
                url: `${this.host}/s?${queryParams}`,
                rapidApiKey: this.apiKey,
                country: this.country
            });

            const products = Object.values(this.getProducts(pageBody));
            if (products.length > 0) {
                return products;
            }
        }

        return [];
    }

    getProducts(body) {
        const dom = cheerio.load(body.replace(/\s\s+/g, '').replace(/\n/g, ''));
        const productList = dom('div[data-index]');
        const scrapingResult = {};

        for (let i = 0; i < productList.length; i++) {
            const totalInResult = Object.keys(scrapingResult).length + this.alreadyScrappedProducts.length;
            if (totalInResult >= this.numberOfProducts) {
                break;
            }
            if (!productList[i].attribs['data-asin']) {
                continue;
            }
            scrapingResult[productList[i].attribs['data-asin']] = {
                'amazon-id': productList[i].attribs['data-asin'],
                'title': "",
                'thumbnail': "",
                'url': "",
                'is-discounted': false,
                'is-sponsored': false,
                'is-amazon-choice': false,
                'price': "",
                'beforeDiscount': "",
                'reviews-count': 0,
                'rating': 0,
                'score': 0,
                'savings': 0
            };
        }

        for (let key in scrapingResult) {
            try {
                const priceSearch = dom(`div[data-asin=${key}] span[data-a-size="l"]`)[0] || dom(`div[data-asin=${key}] span[data-a-size="m"]`)[0];
                const discountSearch = dom(`div[data-asin=${key}] span[data-a-strike="true"]`)[0];
                const ratingSearch = dom(`div[data-asin=${key}] .a-icon-star-small`)[0];
                const titleThumbnailSearch = dom(`div[data-asin=${key}] [data-image-source-density="1"]`)[0];
                const urlSearch = dom(`div[data-asin=${key}] .a-link-normal`);
                const amazonChoice = dom(`div[data-asin=${key}] span[id="${key}-amazons-choice"]`).text();

                if (priceSearch) {
                    scrapingResult[key].price = dom(priceSearch.children[0]).text().replace(/[^D+0-9.,]/g, '');
                }

                if (amazonChoice) {
                    scrapingResult[key]['is-amazon-choice'] = true;
                }

                if (discountSearch) {
                    scrapingResult[key].beforeDiscount = dom(discountSearch.children[0]).text().replace(/[^D+0-9.,]/g, '');
                    scrapingResult[key]['is-discounted'] = true;
                    let savings = scrapingResult[key].beforeDiscount - scrapingResult[key].price;
                    if (savings <= 0) {
                        scrapingResult[key]['is-discounted'] = false;
                        scrapingResult[key].beforeDiscount = 0;
                    } else {
                        scrapingResult[key].savings = savings;
                    }
                }

                if (ratingSearch) {
                    scrapingResult[key].rating = parseFloat(ratingSearch.children[0].children[0].data);
                    scrapingResult[key]['reviews-count'] = parseInt(ratingSearch.parent.parent.parent.next.attribs['aria-label'].replace(/,/g, ''));
                    scrapingResult[key].score = parseFloat(scrapingResult[key].rating * scrapingResult[key]['reviews-count']).toFixed(2);
                }

                if (titleThumbnailSearch) {
                    scrapingResult[key].title = titleThumbnailSearch.attribs.alt;
                    scrapingResult[key].thumbnail = titleThumbnailSearch.attribs.src;
                }

                if (urlSearch && Array.isArray(urlSearch)) {
                    let url = urlSearch[0].attribs.href;
                    if (url.indexOf('/gcx/-/') > -1) {
                        url = urlSearch[1].attribs.href;
                    }

                    if (url.indexOf('/gp/') > -1) {
                        scrapingResult[key]['is-sponsored'] = true;
                    }

                    scrapingResult[key].url = `${this.host}${url}`;
                }
            } catch (err) {
                console.error(err);
            }
        }

        return scrapingResult;
    }
}

module.exports = ProductsScraper