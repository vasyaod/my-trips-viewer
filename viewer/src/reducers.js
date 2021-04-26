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
      
      return {...state,
        tracks: List(action.tracks).map(x => List(x)),
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
