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
const distanceThreshold = parseFloat(process.env.DISTANCE_THRESHOLD || "20")
const timeThreshold = parseFloat(process.env.TIME_THRESHOLD || "600")

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
    console.log(`Video preview has been downloaded ${dir}/original.jpg`)

    await exec(`./circle-thumb.sh ${dir}/original.jpg.webp ${dir}/circle-thumb-32.png`)

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
  
  const filteredGpx = flattenGpxes
    .map (track => {
      return List(track.segments)
        .filter(segment => List(segment).size > 1 )
        .map (segment => {
          const points = List(segment)
          let currentP = points.get(0)
          let newPoints = [currentP]
          for(i = 1; i < points.size; i++) {
            const p1 =  {
              lng: currentP.lon,
              lat: currentP.lat,
            }
            
            const p2 = {
              lng: points.get(i).lon,
              lat: points.get(i).lat,
            }

            if (gpxUtils.distanceBetweenPoints(p1, p2) > distanceThreshold) {
              currentP = points.get(i)
              newPoints.push(currentP)
            } 
          }

          return List(newPoints)
        })
        .filter(segment => segment.size > 3 )
    })

  const splittedGpx = filteredGpx
    .map (track => {
      return track
        .filter(segment => segment.size > 1 )
        .flatMap (segment => {
          const points = segment
          
          let currentP = points.get(0)
          let newPoints = [currentP]
          let segments = []

          for(i = 1; i < points.size; i++) {
            const p1Time = Date.parse(currentP.time)
            const p2Time = Date.parse(points.get(i).time)
            if(Math.abs(p2Time - p1Time) > timeThreshold * 1000) {
              segments.push(newPoints)
              newPoints = []
            }
            currentP = points.get(i)
            newPoints.push(currentP)
          }

          segments.push(newPoints)
          return List(segments)
        })
        .map(segment => List(segment))
        .filter(segment => segment.size > 3 )
        .filter(segment => {                    // Remove one place tracks
          const center = {
            lng: segment.map(p => p.lon).reduce((total, value) => total + value) / segment.size,
            lat: segment.map(p => p.lat).reduce((total, value) => total + value) / segment.size,
          }
          const maxDistance = segment
            .map(p0 => {
              const p = {
                lng: p0.lon,
                lat: p0.lat
              }
              return gpxUtils.distanceBetweenPoints(p, center)
            })
            .reduce((total, value) => Math.max(total, value))
          
          return maxDistance > 50
        })
    })

    const tracks = splittedGpx
    .flatMap (track => {
      return track.map (segment => {
        return segment.map ( point => {
          return {
            lng: point.lon,
            lat: point.lat,
            tm: Date.parse(point.time),
            pathType: "line"
          }
        })
      })
    })

  const pointCount = gpxUtils.getPointCount(splittedGpx)
  const time = gpxUtils.getTime(splittedGpx)
  const distance = gpxUtils.getDistance(splittedGpx)
  const uphill = gpxUtils.getUphill(splittedGpx)
  
  let tags = []

  if (tripInfo.tags)
    tags = tripInfo.tags.split(',').map(x => x.trim());

  const desc = { ...tripInfo,
    objects: objects,
    tags: tags,
    time: time,
    distance: distance,
    uphill: uphill,
    pointCount: pointCount,
    tracks: tracks
  }

  await Promise.all([
    imagePromises,
    videoPromises,
    writeFile(`${tripOutputPath}/objects.json`, JSON.stringify(desc, null, 2), 'utf8'),
    writeFile(`${tripOutputPath}/trip.json`, JSON.stringify(desc, null, 2), 'utf8'),
    exec(`cp ${tripPath}/*.gpx ${tripOutputPath}/`),
  ])

  console.log("Trip done ", tripId, "distance", distance, "uphill", uphill, "pointCount", pointCount, "time", time)

  return { ...tripInfo,
    id: tripId,
    date: tripInfo.date.toISOString().split('T')[0],
    objects: objects,
    time: time,
    distance: distance,
    uphill: uphill,
    pointCount: pointCount,
    tags: tags,
    categories: List(["all"]).concat(tags).concat(List(objects.length > 0 ? ["with-pictures"]: []))
  }
}

// Read list of trips.
(async () => {
  const items = (await readdir(inputPath))
    .filter(item => !item.startsWith('.'))
    .filter(item => fs.lstatSync(`${inputPath}/${item}`).isDirectory())

  const allTracks = await Promise.all(items.map(item => processTrip(item)))
  const successfulTracks = List(allTracks)
    .filter(tripDesc => tripDesc != null)
    .sortBy(tripDesc => tripDesc.date)
    .map( (tripDesc, index) => {               // Add a index to a track title
      return { ...tripDesc,
        title: tripDesc.title + " #" + (index + 1),
      }
    })
    .toArray()

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

  const tagCategories = List(successfulTracks)
    .flatMap(x => x.tags.map(y => { return {k: y, v: x} }))
    .groupBy(x => x.k)
    .map ( (items, key) => {
      const x = items.map(x => x.v)
      return {
        id: key,
        title: key,
        count: x.size
      }
    })
    .toList()

  const allCategories = List([
    {
      id: "all",
      title: "All",
      count: List(successfulTracks).size
    },
    {
      id: "with-pictures",
      title: "With pictures or videos",
      count: List(successfulTracks.filter(t => t.objects.length > 0)).size
    }
  ])

  console.log("Creating index of trips")
  // Save trips indexes
  writeFile(
    `${outputPath}/index.json`, 
    JSON.stringify({
      tracks: successfulTracks,
      tags: tags.toJS(),
      categories: allCategories.concat(tagCategories)
    }, null, 2), 
    'utf8'
  )

  // Try to notify GitHub about changes and republish GitHub Pages
  writeFile(`${outputPath}/.publish`, UUID.create().toString(), 'utf8')
})()
