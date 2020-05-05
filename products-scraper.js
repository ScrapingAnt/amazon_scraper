'use strict';

const cheerio = require('cheerio');
const makeRequest = require('./utils').makeRequest;
const writeDataToCsv = require('./utils').writeDataToCsv;
const querystring = require('querystring');

const CONSTANTS = require('./constants');

class ProductsScraper {

    constructor({keyword, number, host, apiKey, save}) {
        this.host = `https://${host || CONSTANTS.defaultAmazonUrl}`;

        this.alreadyScrappedProducts = [];
        this.apiKey = apiKey;
        this.keyword = keyword;
        this.numberOfProducts = parseInt(number) || CONSTANTS.defaultItemLimit;
        this.currentSearchPage = 1;
        this.saveToFile = save || false;
        this.continuePaginating = true;
    }

    async startScraping() {
        if (this.numberOfProducts > CONSTANTS.limit.product) {
            this.numberOfProducts = CONSTANTS.limit.product;
            console.info(`Setting number to MAXIMUM available (${CONSTANTS.limit.product}) because of exceeding limit`);
        }

        while (this.continuePaginating) {
            if (this.alreadyScrappedProducts.length >= this.numberOfProducts) {
                break;
            }

            const currentPageProducts = await this.getCurrentPageData();

            if (currentPageProducts.length > 0) {
                this.alreadyScrappedProducts = this.alreadyScrappedProducts.concat(currentPageProducts);
                this.currentSearchPage++;
            } else {
                this.continuePaginating = false;
            }
        }

        if (this.saveToFile && this.alreadyScrappedProducts.length > 0) {
            await writeDataToCsv(this.keyword.replace(/\s/g, "_"), this.alreadyScrappedProducts);
        }

        console.log(`Total scraped products count: ${this.alreadyScrappedProducts.length}`);

        return this.alreadyScrappedProducts;
    }

    async getCurrentPageData() {
        let retryCount = 0;

        const queryParams = querystring.encode({
            k: this.keyword,
            page: this.currentSearchPage
        });

        while(retryCount < CONSTANTS.limit.retry) {
            const pageBody = await makeRequest({
                url: `${this.host}/s?${queryParams}`,
                rapidApiKey: this.apiKey
            });

            const products = Object.values(this.getProducts(pageBody));

            if (products.length > 0) {
                return products;
            } else {
                retryCount++;
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
                'is-discounted': false,
                'is-sponsored': false,
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

                if (priceSearch) {
                    scrapingResult[key].price = dom(priceSearch.children[0])
                        .text()
                        .replace(/[^D+0-9.,]/g, '');
                }

                if (discountSearch) {
                    scrapingResult[key].beforeDiscount = dom(discountSearch.children[0])
                        .text()
                        .replace(/[^D+0-9.,]/g, '');
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

                if (urlSearch) {
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