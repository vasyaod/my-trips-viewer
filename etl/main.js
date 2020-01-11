const fs = require('fs')
const yaml = require('js-yaml')
const util = require('util')

const readdir = util.promisify(fs.readdir)
const writeFile = util.promisify(fs.writeFile)

const exec = util.promisify(require('child_process').exec)
//const spawn = require('child_process').spawn;

const inputPath = process.env.INPUT_DATA_PATH || "./input"
const outputPath = process.env.OUTPUT_DATA_PATH || "./output"

if (!fs.existsSync(`${outputPath}/images`)){
  fs.mkdirSync(`${outputPath}/images`);
}

if (!fs.existsSync(`${outputPath}/data`)){
  fs.mkdirSync(`${outputPath}/data`);
}

const processImage = async (tripId, meta) => {
  const fileName = meta.file.replace(/\.[^/.]+$/, "")

  const dir = `${outputPath}/images/${fileName}/`;
  const tripPath = `${inputPath}/${tripId}/`
  
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
 
  await Promise.all([
    exec(`ln -sf ${tripPath}/${meta.file} ${dir}/original.jpg`),
    exec(`./circle-thumb.sh ${tripPath}/${meta.file} ${dir}/circle-thumb-32.png`)
  ])
}

const processVideo = async (tripId, meta) => {

}

const processTrip = async tripId => {
  const tripPath = `${inputPath}/${tripId}/`
  const tripOutputPath = `${outputPath}/data/${tripId}/`

  if (!fs.existsSync(tripOutputPath)){
    fs.mkdirSync(tripOutputPath);
  }

  const items = await readdir(tripPath)
  
  const metas = items
    .filter(item => item.endsWith(".meta"))
    .map(item => 
      yaml.safeLoad(fs.readFileSync(`${tripPath}/${item}`, 'utf8'))
    )

  const images = metas.filter(meta => meta.type == "image")

  const imagePromises = Promise.all(
    metas
      .filter(meta => meta.type == "image")
      .map(meta => processImage(tripId, meta))
  )
  
  // Save objects file
  const objects = images
    .filter(meta => {
      meta.lat && meta.lng
    })
    .map(meta => {
      const fileName = meta.file.replace(/\.[^/.]+$/, "")

      return {
        thumb: fileName,
        img: fileName,
        lat: meta.lat,
        lng: meta.lng
      }
    })

  await Promise.all([
    imagePromises,
    writeFile(`${tripOutputPath}/objects.json`, JSON.stringify(objects, null, 2), 'utf8'),
    exec(`cp ${tripPath}/track.gpx ${tripOutputPath}/track.gpx`),
  ])
}

// Read list of trips.
(async () => {
  const items = await readdir(inputPath)
  Promise.all(items.map(item => processTrip(item)))
})()
