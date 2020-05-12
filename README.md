# Amazon Proxy Scraper

The useful tool to scrape products information from Amazon via ScrapingAnt API.

## Features

-   **Scrape products** from Amazon search result: amazon ID, rating, number of reviews, price, title, url, sponsored or not, discounted or not, featured by Amazon choice or not.
-   Result can be saved to a CSV file.
-   You can scrape up to **500 products**
-   You will not be banned by Amazon because of using proxies out of the box.

## Installation

**Install from NPM**

```sh
$ npm i -g @scrapingant/amazon-proxy-scraper
```

## Before you begin

This library depends on rotating proxies scraping API - ScrapingAnt. It has a free plan.

To use this code you need RapidApi key. Just go to <a href="https://rapidapi.com/okami4kak/api/scrapingant">ScrapingAnt page on RapidAPI</a>, and click "Subscribe to Test" button. After that you have to select plan(there is a free one with 100 requests included). After that you can find you api key in "X-RapidAPI-Key" field on <a href="https://rapidapi.com/okami4kak/api/scrapingant/endpoints">endpoints</a> page.

## USAGE

**Terminal**

```sh
$ amazon-proxy-scraper --help

Scrapes for a products with rotating proxies from the provided key word

Options:
  --help, -h     help                                                  [boolean]
  --version      Show version number                                   [boolean]
  --keyword, -k  Amazon search keyword ex. 'baking mat'   [string] [default: ""]
  --apiKey, -a   RapidAPI key for ScrapingAnt API         [string] [default: ""]
  --number, -n   Number of products to scrape. Maximum 500 products
                                                          [number] [default: 10]
  --save, -s     Save to a CSV file?                   [boolean] [default: true]
  --host, -H     The regional Amazon host (can be amazon.fr, amazon.co.uk, etc.)
                                                [string] [default: "amazon.com"]
  --country, -c  Country of proxies location            [string] [default: "us"]


Examples:
  amazon-proxy-scraper -k 'baking mat' -a '<apiKey>'
  amazon-proxy-scraper -k 'baking mat' -c 'fr' -h 'amazon.fr' -a '<apiKey>'
```

**Example 1**

Scrape 100 products with the "baking mat" keyword and save everything to a CSV file

```sh
$ amazon-proxy-scraper -k 'baking mat' -n 100 -a '<apiKey>'
```

**The file will be saved in a folder from which you run the script:
baking_mat_product_1527946544582.csv**

# Module

```javascript
const ProductsScraper = require("@scrapingant/amazon-proxy-scraper")

const scraper = new ProductsScraper({
    "apiKey": "<apiKey>",
    "keyword": "baking mat"
});

scraper.startScraping().then(console.log, console.error);
```

Example output:

```
Total scraped products count: 10
[
  {
    'amazon-id': 'B0725GYNG6',
    title: 'AmazonBasics Silicone, Non-Stick, Food Safe Baking Mat - Pack of 2',
    thumbnail: 'https://m.media-amazon.com/images/I/81IC5+bWDgL._AC_UL320_.jpg',
    url: 'https://amazon.com/gp/bestsellers/kitchen/3736921/ref=sr_bs_0_3736921_1',
    'is-discounted': false,
    'is-sponsored': true,
    'is-amazon-choice': false,
    price: '13.99',
    beforeDiscount: '',
    'reviews-count': 15735,
    rating: 4.7,
    score: '73954.50',
    savings: 0
  },
  {
    'amazon-id': 'B00008T960',
    title: 'Silpat Premium Non-Stick Silicone Baking Mat, Half Sheet Size, 11-5/8 x 16-1/2',
    thumbnail: 'https://m.media-amazon.com/images/I/6130OpPcFkL._AC_UL320_.jpg',
    url: 'https://amazon.com/Alfombrilla-horneado-silicona-antiadherente-Silpat/dp/B00008T960/ref=sr_1_2?dchild=1&keywords=baking+mat&qid=1588969148&sr=8-2',
    'is-discounted': false,
    'is-sponsored': false,
    'is-amazon-choice': false,
    price: '24.97',
    beforeDiscount: '',
    'reviews-count': 2713,
    rating: 4.7,
    score: '12751.10',
    savings: 0
  },
  {
    'amazon-id': 'B085PX3DYH',
    title: 'Silicone Baking Mats Pastry Mat, Adoric 2Pack Non-stick Baking Mat and 1Pack 16x24 Inch Silicone Pastry Mat with Measurement Fondant Mat, Counter Mat, Dough Rolling Mat, Oven Liner, Pie Crust Mat',
    thumbnail: 'https://m.media-amazon.com/images/I/719rcMnmt3L._AC_UL320_.jpg',
    url: 'https://amazon.com/Silicone-Adoric-Non-stick-Measurement-Fondant/dp/B085PX3DYH/ref=sr_1_3?dchild=1&keywords=baking+mat&qid=1588969148&sr=8-3',
    'is-discounted': false,
    'is-sponsored': false,
    'is-amazon-choice': false,
    price: '22.99',
    beforeDiscount: '',
    'reviews-count': 26,
    rating: 4.9,
    score: '127.40',
    savings: 0
  },
 .........................
  {
    'amazon-id': 'B082CYD4Z6',
    title: 'Sapid Extra Thick Silicone Pastry Mat Non-slip with Measurements for Non-stick Silicone Baking Mat Extra Large, Dough Rolling, Pie Crust, Kneading Mats, Countertop, Placement Mats (20" x 28", Red)',
    thumbnail: 'https://m.media-amazon.com/images/I/712Z+a5RxVL._AC_UL320_.jpg',
    url: 'https://amazon.com/Silicone-Measurements-Non-stick-Countertop-Placement/dp/B082CYD4Z6/ref=sr_1_10?dchild=1&keywords=baking+mat&qid=1588969148&sr=8-10',
    'is-discounted': false,
    'is-sponsored': false,
    'is-amazon-choice': false,
    price: '21.95',
    beforeDiscount: '',
    'reviews-count': 49,
    rating: 4.8,
    score: '235.20',
    savings: 0
  }
]
```

**Options**

```javascript
const options = {
    keyword: "keyword to search, string", //Required parameter. Example: "baking mat"

    number: 50, //Optional. 10 by default

    host: "amazon.fr", //Optional. amazon.com by default.

    apiKey: "<apiKey>", //Required parameter. ApiKey for ScrapingAnt API

    save: true, //Optional. Defines saving result to CSV. False by default.

    country: "us", //Optional. Proxy location country. US by default. Available countries: ae, br, cn, de, es, fr, gb, hk, in, it, il, jp, nl, ru, sa, us,

    showProgress: true //Optional. Show progress bar to CLI. False by default.
}
```

## License

**MIT**

**Free Software**