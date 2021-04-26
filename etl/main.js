const fs = require('fs')
const yaml = require('js-yaml')
const util = require('util')
const UUID = require('uuid-js');
const mustache = require('mustache');

const readdir = util.promisify(fs.readdir)
const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)

const exec = util.promisify(require('child_process').exec)
//const spawn = require('child_process').spawn;

const inputPath = process.env.INPUT_DATA_PATH || "../test-data/input"
const outputPath = process.env.OUTPUT_DATA_PATH || "../test-data/output"

if (!fs.existsSync(`${outputPath}`)) {
  fs.mkdirSync(`${outputPath}`);
}

if (!fs.existsSync(`${outputPath}/images`)) {
  fs.mkdirSync(`${outputPath}/images`);
}

if (!fs.existsSync(`${outputPath}/data`)) {
  fs.mkdirSync(`${outputPath}/data`);
}

if (!fs.existsSync(`${outputPath}/trips`)){
  fs.mkdirSync(`${outputPath}/trips`);
}

const processImage = async (tripId, meta) => {
  const dir = `${outputPath}/images/${tripId}-${meta.name}`;
  const tripPath = `${inputPath}/${tripId}/`

  // Process image if it doesn't exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  
    await exec(`cp ${tripPath}/${meta.file} ${dir}/original.jpg`)
    await exec(`./circle-thumb.sh ${dir}/original.jpg ${dir}/circle-thumb-32.png`)
    console.log(`Image ${tripId}-${meta.name}/${meta.file} has been processed`)
  }
}

const processVideo = async (tripId, meta, metaName) => {
  const dir = `${outputPath}/images/${tripId}-${meta.name}`;

  // Process video if it doesn't exists and is not processed
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
 
    await exec(`./youtube-dl -o ${dir}/original.jpg --write-thumbnail --skip-download https://youtu.be/${meta.youtubeId}`)
    await exec(`./circle-thumb.sh ${dir}/original.jpg ${dir}/circle-thumb-32.png`)

    console.log(`Video ${tripId}-${meta.name}/${meta.youtubeId} has been processed`)
  }
}

const processTrip = async tripId => {

  console.log("Process trip", tripId)

  const tripPath = `${inputPath}/${tripId}/`
  const tripOutputPath = `${outputPath}/data/${tripId}/`

  if (!fs.existsSync(tripOutputPath)){
    fs.mkdirSync(tripOutputPath);
  }

  const items = await readdir(tripPath)
  
  const metas = items
    .filter(item => item.endsWith(".meta"))
    .map(item => {
      const meta = yaml.safeLoad(fs.readFileSync(`${tripPath}/${item}`, 'utf8'))
      return { ...meta,
        name: item.replace(".meta", "")
      }
    })

  const imagePromises = Promise.all(
    metas
      .filter(meta => meta.type == "image")
      .map(meta => processImage(tripId, meta))
  )
  
  const videoPromises = Promise.all(
    metas
      .filter(meta => meta.type == "video")
      .map(meta => processVideo(tripId, meta))
  )

  // Convert objects file in JSON array
  const objects = metas
    .filter(meta => meta.lat && meta.lng)
    .map(meta => {
      return {
        type: meta.type,
        img: `${tripId}-${meta.name}`,
        youtubeId: meta.youtubeId,
        lat: meta.lat,
        lng: meta.lng
      }
    })
  
  const tripInfo = yaml.safeLoad(fs.readFileSync(`${inputPath}/${tripId}/trip.yml`, 'utf8'))

  const desc = { ...tripInfo,
    objects: objects
  }

  const output = mustache.render(
    await readFile(`template.mustache`, 'utf8'),
    {
      title: tripInfo.title,
      description: tripInfo.description,
      tripId: tripId
    }
  )
  await writeFile(`${outputPath}/trips/${tripId}.html`, output, 'utf8')
  
  if (!fs.existsSync(`${outputPath}/trips/${tripId}`)){
    fs.mkdirSync(`${outputPath}/trips/${tripId}`);
  }
  await writeFile(`${outputPath}/trips/${tripId}/index.html`, output, 'utf8')

  await Promise.all([
    imagePromises,
    videoPromises,
    writeFile(`${tripOutputPath}/objects.json`, JSON.stringify(desc, null, 2), 'utf8'),
    writeFile(`${tripOutputPath}/trip.json`, JSON.stringify(desc, null, 2), 'utf8'),
    exec(`cp ${tripPath}/*.gpx ${tripOutputPath}/`),
  ])

  return { ...tripInfo,
    id: tripId,
    date: tripInfo.date.toISOString().split('T')[0]
  }
}

// Read list of trips.
(async () => {
  const items = (await readdir(inputPath))
    .filter(item => !item.startsWith('.'))
    .filter(item => fs.lstatSync(`${inputPath}/${item}`).isDirectory())

  const trips = await Promise.all(items.map(item => processTrip(item)))

  console.log("Creating index of trips")
  // Save trips indexes
  writeFile(
    `${outputPath}/index.json`, 
    JSON.stringify(trips.filter(tripDesc => tripDesc != null), null, 2), 
    'utf8'
  )

  // Try to notify GitHub about changes and republish GitHub Pages
  writeFile(`${outputPath}/.publish`, UUID.create().toString(), 'utf8')
})()
