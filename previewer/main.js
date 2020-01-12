const fs = require('fs')
const puppeteer = require('puppeteer');
const util = require('util')
const yaml = require('js-yaml')
const mustache = require('mustache');

const readdir = util.promisify(fs.readdir)
const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)

const inputPath = process.env.INPUT_DATA_PATH || "./input"
const outputPath = process.env.OUTPUT_DATA_PATH || "./output"

function sleep(t) {
  return new Promise((resolve) => setTimeout(resolve, t))
}

if (!fs.existsSync(`${outputPath}/trips`)){
  fs.mkdirSync(`${outputPath}/trips`);
}

if (!fs.existsSync(`${outputPath}/data`)){
  fs.mkdirSync(`${outputPath}/data`);
}

const processTrip = async tripId => {
  const browser = await puppeteer.launch({
    defaultViewport: {width: 800, height: 600}
  });
  const page = await browser.newPage();
  await page.goto(`http://localhost:8080/#/maps/${tripId}`);
  await sleep(4000)
  await page.screenshot({path: `${outputPath}/data/${tripId}/preview.png`});

  await browser.close()

  var view = {
    title: "Joe",
    calc: function () {
      return 2 + 4;
    }
  };
  
  const tripPath = `${inputPath}/${tripId}/`
  const tripInfo = yaml.safeLoad(fs.readFileSync(`${tripPath}/trip.yml`, 'utf8'))

  const template = await readFile(`template.mustache`, 'utf8')
  const output = mustache.to_html(
    template,
    {
      title: tripInfo.title,
      description: tripInfo.description,
      tripId: tripId
    }
  )
  await writeFile(`${outputPath}/trips/${tripId}.html`, output, 'utf8')
}

// Read list of trips.
(async () => {
  const items = await readdir(inputPath)

  await Promise.all(items.map(item => processTrip(item)))
})()
