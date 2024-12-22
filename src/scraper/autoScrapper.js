const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function getSearchResults(query, pages = 3) {
  console.log(`Searching for: ${query}`);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let allUrls = [];

  for (let i = 0; i < pages; i++) {
    const searchURL = `https://www.google.com/search?q=${encodeURIComponent(
      query,
    )}&start=${i * 10}`;
    await page.goto(searchURL);

    const urls = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links
        .map((link) => link.href)
        .filter(
          (href) =>
            href.startsWith('http') &&
            !href.includes('google') &&
            !href.includes('youtube') &&
            !href.includes('accounts.google'),
        );
    });

    allUrls = allUrls.concat(urls);
  }

  await browser.close();
  console.log(`Found ${allUrls.length} URLs`);
  return allUrls;
}

async function scrapeWebsite(url) {
  console.log(`Scraping URL: ${url}`);
  try {
    const { data } = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(data);

    const ctcSynonyms = [
      'ctc',
      'compensation',
      'salary',
      'package',
      'pay',
      'remuneration',
      'wage',
      'stipend',
    ];
    const relevantText = $('body').text().toLowerCase();
    const isRelevant = ctcSynonyms.some((synonym) =>
      relevantText.includes(synonym),
    );

    if (!isRelevant) {
      console.log(`URL ${url} is not relevant.`);
      return null;
    }

    const scrapedData = [];

    // Function to extract CTC and other relevant information
    const extractInfo = (text) => {
      const ctcRegex = new RegExp(
        `(${ctcSynonyms.join(
          '|',
        )})\\s*[:=]?\\s*([\\d,.]+\\s*(?:lakh|k|l|cr|million|m|thousand|inr|rs|₹)?)`,
        'gi',
      );
      const ctcMatch = text.match(ctcRegex);
      if (ctcMatch) {
        const ctc = ctcMatch[0];
        const otherInfo = text.replace(ctcRegex, '').trim();
        return { ctc, otherInfo };
      }
      return null;
    };

    // Scrape tables
    $('table').each((_, table) => {
      $(table)
        .find('tr')
        .each((_, row) => {
          const rowText = $(row).text().trim();
          const info = extractInfo(rowText);
          if (info) {
            scrapedData.push(info);
          }
        });
    });

    // Scrape paragraphs and list items
    $('p, li').each((_, element) => {
      const text = $(element).text().trim();
      const info = extractInfo(text);
      if (info) {
        scrapedData.push(info);
      }
    });

    console.log(`Scraped ${scrapedData.length} items from ${url}`);
    return scrapedData;
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error.message);
    return null;
  }
}

function saveDataToCSV(data, filename) {
  console.log(`Saving data to ${filename}`);
  const filePath = path.resolve(__dirname, filename);

  if (data.length === 0) {
    console.log('No data to save.');
    return;
  }

  const headers = ['CTC', 'Other Information'];
  const csvData = [
    headers.join(','),
    ...data.map((row) => `"${row.ctc}","${row.otherInfo.replace(/"/g, '""')}"`),
  ].join('\n');

  fs.writeFileSync(filePath, csvData);
  console.log(`Data saved to ${filePath}`);
}

async function runScraper() {
  console.log('Starting scraper...');
  const queries = [
    'engineering placements CTC site:edu',
    'internship offers compensation',
    'college placement statistics salary',
    'SDE1 compensation details',
    'software engineer salary india',
    'IT company salary packages',
  ];

  let allScrapedData = [];

  for (const query of queries) {
    console.log(`Processing query: ${query}`);
    const urls = await getSearchResults(query, 5); // Increased to 5 pages
    for (const url of urls) {
      const data = await scrapeWebsite(url);
      if (data) allScrapedData = allScrapedData.concat(data);
    }
  }

  if (allScrapedData.length > 0) {
    saveDataToCSV(allScrapedData, 'scraped_ctc_data.csv');
  } else {
    console.log('No data found to save.');
  }

  console.log('Scraping completed.');
}

runScraper();
