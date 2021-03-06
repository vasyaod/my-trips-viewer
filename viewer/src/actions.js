// @flat

//import utils from './utils.js'
//import { List } from 'immutable'
//import * as utils from '../utils.js'
//import * as equal from 'deep-equal'
import * as config from './config.js'

export function loadFile(fileName) {
  return async(dispatch) => {
    
    console.log("Load trip: " + fileName)

    const res2 = await fetch(`${config.url}data/${fileName}/objects.json`)
    if (res2.status == 200) {
      const data = await res2.json()

      dispatch({ ...data,
        type: 'TRACK_LOADED',
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
      values: data.tracks,
      heatmap: data.heatmap
    })
  }
}

export function loadStats() {
  return async(dispatch) => {
    
    const res = await fetch(`${config.url}index.json`)
    const data = await res.json()
  
    dispatch({
      type: 'STATS_LOADED',
      values: data.stats
    })
  }
}

export function loadTags() {
  return async(dispatch) => {
    
    const res = await fetch(`${config.url}index.json`)
    const data = await res.json()
  
    dispatch({
      type: 'TAGS_LOADED',
      values: data.tags
    })
  }
}

const tags = "#mytrips #github #velolive #bikeling"

export function shareFacebook(trackId, title, description) {
  const t = `${title}: ${description}\n${tags}\n`
  const url = `${config.url}/tracks/${trackId}`
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURI(url)}&t=${t}`
  window.open(facebookShareUrl, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600')
}
  
export function shareTwitter(trackId, title, description) {
  const text = `${title}: ${description}\n${tags}\n`
//    const twitterHandle = "amazon-budget-control"
  const url = `${config.url}/tracks/${trackId}`
  const twitterShareUrl = `https://twitter.com/share?url=${encodeURI(url)}&text=${text}`
  window.open(twitterShareUrl, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600')
}

export function shareVk(trackId, title, description) {
  const text = `${title}: ${description}\n${tags}\n`
  const url = `${config.url}/tracks/trips/${trackId}`
  const twitterShareUrl = `https://vk.com/share.php?url=${encodeURI(url)}&title=${text}`
  window.open(twitterShareUrl, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600')
}
