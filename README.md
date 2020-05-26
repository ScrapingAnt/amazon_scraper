# Amazon Proxy Scraper

The useful tool to scrape products information from Amazon via ScrapingAnt API.

## Features

-   **Scrape products** from Amazon search result: amazon ID, rating, number of reviews, price, title, short and full description, high-resolution image, url, sponsored or not, discounted or not, featured by Amazon choice or not.
-   Result can be saved to a CSV or Excel file.
-   You can scrape up to **500 products**
-   You will **not** be banned by Amazon because of using proxies out of the box.

## Installation

**Install from NPM**

```sh
$ npm i -g @scrapingant/amazon-proxy-scraper
```

## Before you begin

This library depends on rotating proxies scraping API - ScrapingAnt. It has a free plan.

To use this code you need RapidApi key. Just go to <a href="https://rapidapi.com/okami4kak/api/scrapingant">ScrapingAnt page on RapidAPI</a>, and click "Subscribe to Test" button. After that you have to select plan(there is a free one with 500 requests included). After that you can find you api key in "X-RapidAPI-Key" field on <a href="https://rapidapi.com/okami4kak/api/scrapingant/endpoints">endpoints</a> page.

## USAGE

**Terminal**

```sh
$ amazon-proxy-scraper --help

Scrapes for a products with rotating proxies from the provided key word

Options:
  --help, -h      help                                                 [boolean]
  --version       Show version number                                  [boolean]
  --keyword, -k   Amazon search keyword ex. 'baking mat'  [string] [default: ""]
  --apiKey, -a    RapidAPI key for ScrapingAnt API        [string] [default: ""]
  --number, -n    Number of products to scrape. Maximum 500 products
                                                          [number] [default: 10]
  --save, -s      Save to a file?                      [boolean] [default: true]
  --fileType, -t  File type to save: can be either csv or xls.  [default: "csv"]
  --host, -H      The regional Amazon host (can be amazon.fr, amazon.co.uk,
                  etc.)                         [string] [default: "amazon.com"]
  --country, -c   Country of proxies location           [string] [default: "us"]


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

**Example 2**

Scrape 200 products with the "iphone" keyword and save everything to Excel file

```sh
$ amazon-proxy-scraper -k 'iphone' -t xls -n 200 -a '<apiKey>'
```

**The file will be saved in a folder from which you run the script:
iphone_product_1557946545582.xls**

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
    'amazon-id': 'B07MK2P53L',
    title: "Large Silicone Pastry Mat Extra Thick Non Stick Baking Mat with Measurement Fondant Mat, Counter Mat, Dough Rolling Mat, Oven Liner, Pie Crust Mat (16''(W)24''(L))",
    thumbnail: 'https://m.media-amazon.com/images/I/71RnXV6i+PL._AC_UL320_.jpg',
    'high-res-image': 'https://m.media-amazon.com/images/I/71RnXV6i+PL.jpg',
    url: 'https://amazon.com/Silicone-Measurement-Fondant-Counter-Rolling/dp/B07MK2P53L/ref=sr_1_1?dchild=1&keywords=baking+mat&qid=1590432950&sr=8-1',
    'is-discounted': true,
    'is-sponsored': false,
    'is-amazon-choice': false,
    price: '16.98',
    'before-discount': '22.99',
    'reviews-count': 902,
    rating: 4.8,
    score: '4329.60',
    savings: 6.009999999999998,
    'short-description': 'This fits your . Make sure this fitsby entering your model number.✔️ FOOD GRADE SILICONE: GREENRANIN Pastry Mat is made of premium silicone and glass fiber. It is safe, soft, durable and will not wrinkle or fade✔️ DOUBLE THICKNESS: The thickness of the Mat is 0.6MM, which is almost twice that of other mats (0.3MM). Thicker mats will not slip and wrinkle when used✔️ NON-STICKY SURFACE: Even if grease or dough sticks to the surface, pastry mat can be easily cleaned to keep the countertop clean and sanitary✔️ ANTI-SLIP BOTTOM: It is strongly adhesive to the countertop or other surfaces, it does not slip and slide on the countertop and can realize complete adhesion✔️ 100% SATISFACTION GUARANTEED: We believe in our products, so every purchase comes with our 100% money back guarantee. If you experience an issue with your GREENRAIN product, get in touch with us for a replacement or refund. We will provide friendly, easy-to-reach support',
    'full-description': ''
  },
  {
    'amazon-id': 'B07MZ5LTWQ',
    title: 'Silicone Baking Mat for Pastry Rolling Dough with Measurements - 19.7" x 15.7" BPA Free Non stick and Non Slip Blue Table Sheet Baking Supplies for Bake Pizza Cake',
    thumbnail: 'https://m.media-amazon.com/images/I/817S5sWMqyL._AC_UL320_.jpg',
    'high-res-image': 'https://m.media-amazon.com/images/I/817S5sWMqyL.jpg',
    url: 'https://amazon.com/Silicone-Baking-Pastry-Rolling-Measurements/dp/B07MZ5LTWQ/ref=ice_ac_b_dpb?dchild=1&keywords=baking+mat&qid=1590432950&sr=8-2',
    'is-discounted': true,
    'is-sponsored': false,
    'is-amazon-choice': true,
    price: '11.99',
    'before-discount': '29.99',
    'reviews-count': 530,
    rating: 4.5,
    score: '2385.00',
    savings: 18,
    'short-description': '',
    'full-description': ''
  },
.........
  {
    'amazon-id': 'B00008T960',
    title: 'Silpat 07770002481 Premium Non-Stick Silicone Baking Mat, Half Sheet Size, 11-5/8 x 16-1/2, Black',
    thumbnail: 'https://m.media-amazon.com/images/I/6130OpPcFkL._AC_UL320_.jpg',
    'high-res-image': 'https://m.media-amazon.com/images/I/6130OpPcFkL.jpg',
    url: 'https://amazon.com/Silpat-Premium-Non-Stick-Silicone-Baking/dp/B00008T960/ref=sr_1_3?dchild=1&keywords=baking+mat&qid=1590432950&sr=8-3',
    'is-discounted': true,
    'is-sponsored': false,
    'is-amazon-choice': false,
    price: '22.95',
    'before-discount': '24.99',
    'reviews-count': 2743,
    rating: 4.7,
    score: '12892.10',
    savings: 2.039999999999999,
    'short-description': 'This fits your . Make sure this fitsby entering your model number.Turn ANY pan into a non-stick surface and save time cleaning up! Use Silpat instead for any baking recipe (sweet or savory) that calls for parchment paper; Silpat replaces the need for butter, grease, oils, and spraysMade of fiberglass mesh and the highest quality food grade silicone, which provides consistent heat distribution and promotes even baking and browningSilpat is the original non-stick baking mat and has stood the test of time with use by the most demanding chefs in the world; Silpat products conform to US regulations on food grade silicone, and are FDA, NSF, and Kosher certifiedMat measures 11-5/8" x 16-1/2"; Made for a 13" x 18” panTemperature safe for use in the oven and freezer (-40° F to 482° F)',
    'full-description': "Size:Half Sheet | Style Name:Baking MatProduct DescriptionThis 11.6 x 16.5-inch half-sheet size baking mat will turn your pan into a non-stick surface. Silpat is especially great for working with sticky materials such as gooey dough, taffy, caramel, or anything your imagination allows. Nothing sticks to Silpat, so it will save you a lot of time cleaning as there is no more sticky mess on your pans! Silpat never needs greasing, which saves both time and money. Use Silpat instead for any baking recipe that calls for parchment paper. Utilizing Silpat products saves time, money and creates less waste for our environment. It is ideal for use when creating Danish pastries, baking biscuits, working with sugar and all sugary and salted preparations. Silpat Non-Stick..."
  },
  {
    'amazon-id': 'B085PX3DYH',
    title: 'Silicone Baking Mats Pastry Mat, Adoric 2Pack Non-stick Baking Mat and 1Pack 16x24 Inch Silicone Pastry Mat with Measurement Fondant Mat, Counter Mat, Dough Rolling Mat, Oven Liner, Pie Crust Mat',
    thumbnail: 'https://m.media-amazon.com/images/I/719rcMnmt3L._AC_UL320_.jpg',
    'high-res-image': 'https://m.media-amazon.com/images/I/719rcMnmt3L.jpg',
    url: 'https://amazon.com/Silicone-Adoric-Non-stick-Measurement-Fondant/dp/B085PX3DYH/ref=sr_1_4?dchild=1&keywords=baking+mat&qid=1590432950&sr=8-4',
    'is-discounted': false,
    'is-sponsored': false,
    'is-amazon-choice': false,
    price: '23.99',
    'before-discount': '',
    'reviews-count': 25,
    rating: 4.9,
    score: '122.50',
    savings: 0,
    'short-description': '',
    'full-description': ''
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

    fileType: 'xls', //Optional. If specified it overrides save option to true.

    showProgress: true //Optional. Show progress bar to CLI. False by default.
}
```

## License

**MIT**

**Free Software**