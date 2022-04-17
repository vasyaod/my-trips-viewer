const fs = require('fs')
const puppeteer = require('puppeteer');
const util = require('util')
const crypto = require("crypto")

const readdir = util.promisify(fs.readdir)
const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)

// This is important parameter which is needed for rebuild all thumbnails 
// in case of interface changing.
const previewerVersion = "1.0"

const inputPath = process.env.INPUT_DATA_PATH || "../test-data/input"
const outputPath = process.env.OUTPUT_DATA_PATH || "../test-data/output"
//const basePath = "/" + (process.env.BASE_PATH || "my-tracks")
const basePath = "/"

function sleep(t) {
  return new Promise((resolve) => setTimeout(resolve, t))
}

function sha1(data) {
  return crypto.createHash("sha1").update(data + previewerVersion).digest("hex");
}

if (!fs.existsSync(`${outputPath}/data`)){
  fs.mkdirSync(`${outputPath}/data`);
}

const processTrip = async (browser, tripId) => {
  console.log("Process trip", tripId)

  const previewHashFile = `${outputPath}/data/${tripId}/preview.hash`
  const tripFile = `${inputPath}/${tripId}/trip.yml`
  const out = `${outputPath}/data/${tripId}/preview.png`

  if (!fs.existsSync(previewHashFile)) {
    fs.writeFileSync(previewHashFile, sha1(""));
  }
  
  var tripData = fs.readFileSync(tripFile, 'utf8').toString();
  var previewHash = fs.readFileSync(previewHashFile, 'utf8').toString();

  // If preview doesn't exist we create a new one.
  if (sha1(tripData) != previewHash){
    const page = await browser.newPage();
    page.on('console', msg => console.log('CONSOLE LOG:', msg.text()));
    page.on('requestfailed', msg => console.log('REQUEST FAILED LOG:', msg.text()));
    
    await page.goto(`http://localhost:3000${basePath}/previews/${tripId}`);
    await sleep(4000)
    await page.screenshot({path: out});
    await page.close()
    
    // save hash of current data
    fs.writeFileSync(previewHashFile, sha1(tripData));
  }
}

// Read list of trips.
(async () => {
  await sleep(10000)

  const browser = await puppeteer.launch({
    defaultViewport: {width: 800, height: 600}
  });

  const items = (await readdir(inputPath))
    .filter(item => !item.startsWith('.'))
    .filter(item => fs.lstatSync(`${inputPath}/${item}`).isDirectory())
    
  for (let i = 0; i < items.length; i++) {
    await processTrip(browser, items[i])
  }

  await browser.close()
  //await Promise.all(items.map(item => processTrip(item)))
})()
