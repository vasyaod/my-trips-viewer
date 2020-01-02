// @flat

//import utils from './utils.js'
//import { List } from 'immutable'
//import * as utils from '../utils.js'
//import * as equal from 'deep-equal'

const gpxParse = require("./gpx/gpx-parse");

export function loadFile(fileName) {
  return async(dispatch) => {
    
    console.log("Load file: " + fileName)
    const res = await fetch(`data/${fileName}.gpx`)
    if (res.status == 200) {
      const text = await res.text()

      gpxParse.parseGpx(text, (error, data) => {
        dispatch({
          type: 'GPX_CHANGED',
          values: data
        })
      });
    } else {
      console.log("File " + fileName + "is not found")
    }
  }
}
