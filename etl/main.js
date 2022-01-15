const fs = require('fs')
const yaml = require('js-yaml')
const util = require('util')
const UUID = require('uuid-js');
const mustache = require('mustache');
const gpxParse = require("./src/gpx/gpx-parse");
const gpxUtils = require("./src/gpx-utils");
const { List } = require('immutable');

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

if (!fs.existsSync(`${outputPath}/trips`)) {
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

  const gpxes = await Promise.all(tripInfo
    .gpx
    .map( gpxFile => {
      const text = fs.readFileSync(`${inputPath}/${tripId}/${gpxFile}`, 'utf8')
      return new Promise((resolve, reject) => {
        gpxParse.parseGpx(text, (error, data) => {
          if (error) {
            reject(error)
          } else {
            resolve(data.tracks)
          }
        })
      })
    })
  )
  const flattenGpxes = List(gpxes).flatMap(x => x)
  
  const tracks = flattenGpxes
  .flatMap (track => {
    return List(track.segments).map (segment => {
      return List(segment).map ( point => {
        return {
          lng: point.lon,
          lat: point.lat,
          tm: Date.parse(point.time),
          pathType: "line"
        }
      })
    })
  })

  const time = gpxUtils.getTime(flattenGpxes)
  const distance = gpxUtils.getDistance(flattenGpxes)
  const uphill = gpxUtils.getUphill(flattenGpxes)
  
  let tags = []

  if (tripInfo.tags)
    tags = tripInfo.tags.split(',').map(x => x.trim());

  const desc = { ...tripInfo,
    objects: objects,
    tags: tags,
    time: time,
    distance: distance,
    uphill: uphill,
    tracks: tracks
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
    date: tripInfo.date.toISOString().split('T')[0],
    time: time,
    distance: distance,
    uphill: uphill, 
    tags: tags
  }
}

// Read list of trips.
(async () => {
  const items = (await readdir(inputPath))
    .filter(item => !item.startsWith('.'))
    .filter(item => fs.lstatSync(`${inputPath}/${item}`).isDirectory())

  const allTracks = await Promise.all(items.map(item => processTrip(item)))
  const successfulTracks = allTracks.filter(tripDesc => tripDesc != null)

  const stats = List(successfulTracks)
    .groupBy(x => x.date.substring(0,7))
    .map ( (x, key) => {
      return {
        date: key,
        count: x.size,
        distance: x.map(x => x.distance).reduce((x,y) => x + y),
        time: x.map(x => x.time).reduce((x,y) => x + y),
        uphill: x.map(x => x.uphill).reduce((x,y) => x + y)
      }
    })
    .toList()

  const heatmap = List(successfulTracks)
    .groupBy(x => x.date.substring(0,4))
    .map ( (x, key) => ({
      year: key,
      values: x
        .map(y => ({
          date: y.date,
          count: Math.round(y.distance / 1000)
        }))
        .toList()
      })
    )
    .toList()
    .reverse()

  const tags = List(successfulTracks)
    .flatMap(x => x.tags.map(y => { return {k: y, v: x} }))
    .groupBy(x => x.k)
    .map ( (items, key) => {
      const x = items.map(x => x.v)
      return {
        tag: key,
        count: x.size,
        distance: x.map(x => x.distance).reduce((x,y) => x + y),
        time: x.map(x => x.time).reduce((x,y) => x + y),
        uphill: x.map(x => x.uphill).reduce((x,y) => x + y)
      }
    })
    .toList()

  console.log("Creating index of trips")
  // Save trips indexes
  writeFile(
    `${outputPath}/index.json`, 
    JSON.stringify({
      tracks: successfulTracks,
      stats: stats.toJS(),
      heatmap: heatmap.toJS(),
      tags: tags.toJS(),
    }, null, 2), 
    'utf8'
  )

  // Try to notify GitHub about changes and republish GitHub Pages
  writeFile(`${outputPath}/.publish`, UUID.create().toString(), 'utf8')
})()
