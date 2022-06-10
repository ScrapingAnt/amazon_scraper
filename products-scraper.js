'use strict';

const cheerio = require('cheerio');
const writeDataToCsv = require('./utils').writeDataToCsv;
const writeDataToXls = require('./utils').writeDataToXls;
const cliProgress = require('cli-progress');
const querystring = require('querystring');
const retry = require('promise-retry');
const ScrapingAntClient = require('@scrapingant/scrapingant-client')


const CONSTANTS = require('./constants');

class ProductsScraper {

    constructor({keyword, number, host, apiKey, save, country, fileType, showProgress }) {
        this.host = `https://${host || CONSTANTS.defaultAmazonUrl}`;

        this.alreadyScrappedProducts = {};
        this.apiKey = apiKey;
        this.keyword = keyword;
        this.fileType = fileType;
        this.numberOfProducts = parseInt(number) || CONSTANTS.defaultItemLimit;
        this.currentSearchPage = 1;
        this.saveToFile = save || false;
        this.country = country;
        this.progressBar = showProgress ? new cliProgress.SingleBar({
            format: `Amazon Scraping: ${this.keyword} | {bar} | {percentage}% - {value}/{total} Products || ETA: {eta}s`,
        }, cliProgress.Presets.shades_classic) : null;
        this.productsPromises = [];
        this.client = new ScrapingAntClient({ apiKey });
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
            if (Object.keys(this.alreadyScrappedProducts).length >= this.numberOfProducts) {
                break;
            }

            const currentPageProducts = await this.getCurrentPageData();
            const productIds = Object.keys(currentPageProducts);

            if (productIds.length > 0) {
                this.alreadyScrappedProducts = Object.assign(currentPageProducts, this.alreadyScrappedProducts);

                this.productsPromises = this.productsPromises.concat(productIds.map(this.getProductPageData.bind(this)))

                this.currentSearchPage++;
            } else {
                break;
            }
        }

        //Waiting for all product promises completion
        await Promise.all(this.productsPromises)

        await this.checkAndSaveToFile();

        if (this.progressBar) {
            this.progressBar.stop();
        }

        console.log(`Total scraped products count: ${Object.keys(this.alreadyScrappedProducts).length}`);

        return Object.values(this.alreadyScrappedProducts);
    }

    checkForCountry() {
        if (this.country) {
            this.country = this.country.toLowerCase();

            if (!CONSTANTS.supported_countries.includes(this.country)) {
                throw `Not supported country. Please use one from the following: ${CONSTANTS.supported_countries.join(", ")}`;
            }
        }
    }

    checkForApiKey() {
        if (!this.apiKey) {
            throw `No ScrapingAnt apiKey. Please refer to https://scrapingant.com for getting yours.`;
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
            this.fileType = this.fileType.toLowerCase();

            if (!Object.values(CONSTANTS.supported_filetypes).includes(this.fileType)) {
                throw `Not supported file type. Please use one from the following: ${Object.values(CONSTANTS.supported_filetypes).join(", ")}`;
            }
        }
    }

    checkForProductsNumber() {
        if (this.numberOfProducts > CONSTANTS.limit.product) {
            this.numberOfProducts = CONSTANTS.limit.product;
            console.info(`Setting number to MAXIMUM available (${CONSTANTS.limit.product}) because of exceeding limit.`);
        }
    }

    async checkAndSaveToFile() {
        if (this.saveToFile && Object.keys(this.alreadyScrappedProducts).length > 0) {
            const preparedKeyword = this.keyword.replace(/\s/g, "_");

            if (this.fileType === CONSTANTS.supported_filetypes.csv) {
                await writeDataToCsv(preparedKeyword, Object.values(this.alreadyScrappedProducts));
            }

            if (this.fileType === CONSTANTS.supported_filetypes.xls) {
                await writeDataToXls(preparedKeyword, Object.values(this.alreadyScrappedProducts));
            }
        }
    }

    async getCurrentPageData() {
        const queryParams = querystring.encode({
            k: this.keyword,
            ...(this.currentSearchPage > 1 ? { page: this.currentSearchPage, ref: `sr_pg_${this.currentSearchPage}` } : {})
        });

        // Retry for avoiding empty or detected result from Amazon
        for (let i = 0; i < CONSTANTS.limit.retry; i++) {
            try {
                // Retry for any network or accessibility cases
                const params = this.country ? { proxy_country: this.country } : {};
                const response = await retry((attempt) => this.client.scrape(
                    `${this.host}/s?${queryParams}`,
                    params
                ).catch(attempt), { retries: CONSTANTS.limit.retry });

                const pageBody = response.content;
                const products = this.getProducts(pageBody);
                if (Object.keys(products).length > 0) {
                    return products;
                }
            } catch (err) {
                console.error(`Failed to get page ${this.currentSearchPage} for keyword ${this.keyword}. Going to retry...`);
            }
        }

        return {};
    }

    getProducts(body) {
        const dom = cheerio.load(body.replace(/\s\s+/g, '').replace(/\n/g, ''));
        const productList = dom('div[data-index]');
        const scrapingResult = {};

        for (let i = 0; i < productList.length; i++) {
            const totalInResult = Object.keys(scrapingResult).length + Object.keys(this.alreadyScrappedProducts).length;
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
                'high-res-image': "",
                'url': "",
                'is-discounted': false,
                'is-sponsored': false,
                'is-amazon-choice': false,
                'price': "",
                'before-discount': "",
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
                    scrapingResult[key]['before-discount'] = dom(discountSearch.children[0]).text().replace(/[^D+0-9.,]/g, '');
                    scrapingResult[key]['is-discounted'] = true;
                    let savings = scrapingResult[key]['before-discount'] - scrapingResult[key].price;
                    if (savings <= 0) {
                        scrapingResult[key]['is-discounted'] = false;
                        scrapingResult[key]['before-discount'] = 0;
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
                    scrapingResult[key]['high-res-image'] = scrapingResult[key].thumbnail.split("._")[0] + ".jpg"
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

    /**
     *
     * @param amazonId - also called asin, unique Amazon product ID
     * @returns {Promise<void>}
     *
     * The main idea of this method is pretty simple - amend existing products object with additional data
     */
    async getProductPageData(amazonId) {
        // Retry for avoiding empty or detected result from Amazon
        for (let i = 0; i < CONSTANTS.limit.retry; i++) {
            try {
                // Retry for any network or accessibility cases
                const response = await retry((attempt) => this.client.scrape(
                    `${this.host}/dp/${amazonId}`,
                    { proxy_country: this.country }
                    ).catch(attempt), { retries: CONSTANTS.limit.retry });
                const pageBody = response.content;

                const dom = cheerio.load(pageBody.replace(/\s\s+/g, '').replace(/\n/g, ''));

                const shortDescription = dom(`#featurebullets_feature_div`).text();
                const fullDescription = dom(`#productDescription`).text();

                this.alreadyScrappedProducts[amazonId]['short-description'] = shortDescription;
                this.alreadyScrappedProducts[amazonId]['full-description'] = fullDescription;

                if (shortDescription || fullDescription) {
                    if (this.progressBar) {
                        this.progressBar.increment()
                    }
                    return; //No need to retry.
                }

            } catch (exception) {
                console.error(`Failed to get product ${amazonId} for keyword ${this.keyword}. Going to retry...`);
            }
        }
    }
}

module.exports = ProductsScraper
