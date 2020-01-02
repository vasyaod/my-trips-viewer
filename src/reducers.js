// @flow

import { combineReducers } from 'redux'
import { List } from 'immutable'


const initialState = {
  points: List([])
}


export function todoApp(state = initialState, action) {
  switch (action.type) {
    case 'GPX_CHANGED':

      const points = List(action.values.tracks).flatMap (track => {
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

      return {...state,
        points: points //.toArray()
      }
      
    default:
      return state
  }
}
