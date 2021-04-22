// @flow

import { combineReducers } from 'redux'
import { List } from 'immutable'


const initialState = {
  tracks: List(List([])),
  objects: [],
  distance: 0,
  time: 0,
  index: [],
}

function distanceBetweenPoints(latlng1, latlng2){
  // const line = new ol.geom.LineString([
  //   [latlng1.lng, latlng1.lat],[latlng2.lng, latlng2.lat]
  // ]);
  var wgs84sphere = new ol.Sphere(6378137);  
  return wgs84sphere.haversineDistance([latlng1.lng, latlng1.lat],[latlng2.lng, latlng2.lat]); 
}


export function todoApp(state = initialState, action) {
  switch (action.type) {
    case 'GPX_CHANGED':
      // Calculate time for each segment
      let time = List(action.tracks)
        .flatMap (track => {
          return List(track.segments).flatMap (segment => {
            const s = List(segment)
            if(s.size > 1) {
              return s
                .pop()
                .zip(s.shift())
                .map((p) => {
                  return (Date.parse(p[1].time) - Date.parse(p[0].time))
                })
            } else {
              return List.of(0)
            }
          })
        })
        .reduce((total, value) => total + value)
      time = Math.round(time / 1000 / 60)
      time = Math.round(time / 60) + ":" + (time % 60)

      const points = List(action.tracks)
        .flatMap (track => {
          return List(track.segments).flatMap (segment => {
            return List(segment).map ( point =>{
              return {
                lng: point.lon,
                lat: point.lat,
                tm: Date.parse(point.time),
                pathType: "line"
              }
            })
          })
        })

      let distance = 0
      let i
      for(i = 0; i < points.size - 1; i++) {
        distance = distance + distanceBetweenPoints(points.get(i), points.get(i + 1))
       // time = time + Math.abs(points.get(i+1).tm - points.get(i).tm)
      }
      distance = Math.round(distance / 100) / 10

      const tracks = List(action.tracks)
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
      
      return {...state,
        tracks: tracks, //.toArray()
        distance: distance,
        time: time
      }

    case 'OBJECTS_CHANGED':
      return {...state,
        objects: action.values
      }

    case 'INDEX_LOADED':
      console.log(action.values)
      return {...state,
        index: List(action.values).sortBy(item => item.date).reverse()
      }

    default:
      return state
  }
}
