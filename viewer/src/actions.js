// @flat

//import utils from './utils.js'
//import { List } from 'immutable'
//import * as utils from '../utils.js'
//import * as equal from 'deep-equal'
import * as config from './config.js'

const gpxParse = require("./gpx/gpx-parse");

export function loadFile(fileName) {
  return async(dispatch) => {
    
    console.log("Load file: " + fileName)
    const res1 = await fetch(`${config.url}data/${fileName}/track.gpx`)
    if (res1.status == 200) {
      const text = await res1.text()

      gpxParse.parseGpx(text, (error, data) => {
        dispatch({
          type: 'GPX_CHANGED',
          values: data
        })
      });
    } else {
      console.log("GPX File " + fileName + "is not found")
    }

    const res2 = await fetch(`${config.url}data/${fileName}/objects.json`)
    if (res2.status == 200) {
      const data = await res2.json()
      
      dispatch({
        type: 'OBJECTS_CHANGED',
        values: data
      })
    } else {
      console.log("Object file " + fileName + "is not found")
    }
  }
}

export function loadIndex() {
  return async(dispatch) => {
    
    const res = await fetch(`${config.url}index.json`)
    const data = await res.json()
  
    dispatch({
      type: 'INDEX_LOADED',
      values: data
    })
  }
}

const tags = "#mytrips #github #velolive #bikeling"

export function shareFacebook(tripId, title, description) {
  const t = `${title}: ${description}\n${tags}\n`
  const url = `https://vasyaod.github.io/my-trips/trips/${tripId}`
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURI(url)}&t=${t}`
  window.open(facebookShareUrl, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600')
}
  
export function shareTwitter(tripId, title, description) {
  const text = `${title}: ${description}\n${tags}\n`
//    const twitterHandle = "amazon-budget-control"
  const url = `https://vasyaod.github.io/my-trips/trips/${tripId}`
  const twitterShareUrl = `https://twitter.com/share?url=${encodeURI(url)}&text=${text}`
  window.open(twitterShareUrl, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600')
}

export function shareVk(tripId, title, description) {
  const text = `${title}: ${description}\n${tags}\n`
  const url = `https://vasyaod.github.io/my-trips/trips/${tripId}`
  const twitterShareUrl = `https://vk.com/share.php?url=${encodeURI(url)}&title=${text}`
  window.open(twitterShareUrl, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600')
}
