// @flat

//import utils from './utils.js'
//import { List } from 'immutable'
//import * as utils from '../utils.js'
//import * as equal from 'deep-equal'

const gpxParse = require("./gpx/gpx-parse");

export function loadFile(fileName) {
  return async(dispatch) => {
    
    console.log("Load file: " + fileName)
    const res1 = await fetch(`data/${fileName}/track.gpx`)
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

    const res2 = await fetch(`data/${fileName}/objects.json`)
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