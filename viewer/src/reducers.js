// @flow

import { combineReducers } from 'redux'
import { List } from 'immutable'


const initialState = {
  tracks: List(List([])),
  objects: [],
  distance: 0,
  time: 0,
  index: [],
  stats: [],
  tags: [],
}

export function todoApp(state = initialState, action) {
  switch (action.type) {
    case 'TRACK_LOADED':
      return {...state,
        tracks: List(action.tracks).map(x => List(x)),
        objects: action.objects,
        distance: Math.round(action.distance / 100) / 10,
        time: Math.floor(action.time / 1000 / 60 / 60) + ":" + (Math.round(action.time / 1000 / 60) % 60),
        uphill: action.uphill
      }

    case 'INDEX_LOADED':
      return {...state,
        index: List(action.values).sortBy(item => item.date).reverse(),
        heatmap: List(action.heatmap).sortBy(item => item.year).reverse()
      }

    case 'STATS_LOADED':
      return {...state,
        stats: List(action.values)
          .sortBy(item => item.date)
          .map(row => ({...row,
            distance: Math.round(row.distance / 100) / 10,
            time: Math.floor(row.time / 1000 / 60 / 60) + ":" + (Math.round(row.time / 1000 / 60) % 60)
          }))
          .reverse()
      }

    case 'TAGS_LOADED':
      return {...state,
        tags: List(action.values)
          .sortBy(item => item.date)
          .map(row => ({...row,
            distance: Math.round(row.distance / 100) / 10,
            time: Math.floor(row.time / 1000 / 60 / 60) + ":" + (Math.round(row.time / 1000 / 60) % 60)
          }))
      }
  
    default:
      return state
  }
}
