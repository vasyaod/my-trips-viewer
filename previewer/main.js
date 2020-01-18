const fs = require('fs')
const puppeteer = require('puppeteer');
const util = require('util')
const yaml = require('js-yaml')
const mustache = require('mustache');

const readdir = util.promisify(fs.readdir)
const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)

const inputPath = process.env.INPUT_DATA_PATH || "../test-data/input"
const outputPath = process.env.OUTPUT_DATA_PATH || "../test-data/output"

function sleep(t) {
  return new Promise((resolve) => setTimeout(resolve, t))
}

if (!fs.existsSync(`${outputPath}/data`)){
  fs.mkdirSync(`${outputPath}/data`);
}

const processTrip = async tripId => {
  console.log("Process trip", tripId)

  const out = `${outputPath}/data/${tripId}/preview.png`
  // If preview doesn't exist we create a new one.
  if (!fs.existsSync(out)){
    const browser = await puppeteer.launch({
      defaultViewport: {width: 800, height: 600}
    });
    const page = await browser.newPage();
    page.on('console', msg => console.log('CONSOLE LOG:', msg.text()));
    page.on('requestfailed', msg => console.log('REQUEST FAILED LOG:', msg.text()));
    
    await page.goto(`http://localhost:8080/#/maps/${tripId}`);
    await sleep(10000)
    await page.screenshot({path: out});

    await browser.close()
  }
}

// Read list of trips.
(async () => {
  await sleep(10000)

  const items = await readdir(inputPath)
  await Promise.all(items.map(item => processTrip(item)))
})()
