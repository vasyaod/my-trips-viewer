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

export function todoApp(state = initialState, action) {
  switch (action.type) {
    case 'TRACK_LOADED':
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
        objects: action.objects,
        distance: Math.round(action.distance / 100) / 10,
        time: action.time
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
