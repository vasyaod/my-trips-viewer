import React, { useState } from 'react'
import { Segment, Statistic} from 'semantic-ui-react'
import { useEffect } from 'react';
import * as fs from 'fs'
import * as nextConfig from '../next.config'

const mapboxgl = require('mapbox-gl');

import 'mapbox-gl/dist/mapbox-gl.css'

function drawTrackData(map, tracks, bounds) {
  if (!map.loaded())
    return

  const data = {
    "type": "FeatureCollection",
    "features": tracks
      .map( t => {
        return {
            "type": "Feature",
            'geometry': {
              'type': 'LineString',
              'coordinates': t.map(p => [p.lng, p.lat])
            }
          }
        }
      )
  }
  
  const polylineId = "polyLine"
  const polylineColor1 = "#3379c3"
  const polylineColor2 = "#00b3fd"

  if (map.getSource(polylineId) == null){
    map.addSource(polylineId, {
      type: 'geojson',
      data: data
    });
  }

  if (map.getLayer(polylineId) == null){
    map.addLayer({
      "id": polylineId + "-2",
      "type": "line",
      "source": polylineId,
      "layout": {
        "line-cap": "round"
      },
      "paint": {
        "line-color": polylineColor1,
        "line-opacity": 0.8,
        "line-width": 7
        }
    });

    map.addLayer({
      "id": polylineId,
      "type": "line",
      "source": polylineId,
      "layout": {
        "line-cap": "round"
      },
      "paint": {
        "line-color": polylineColor2,
        "line-opacity": 0.9,
        "line-width": 5
        }
    });
  }

  map.getSource(polylineId).setData(data)

  map.fitBounds(bounds, {
    padding: 30,
    linear: true,
    duration: 0
  })
}

function drawObjects(map, objects) {

  // add markers to map
  objects.map( (obj, index) => {
    // create a DOM element for the marker
    var el = document.createElement('div');
    el.className = 'marker play2 button';
    el.style.backgroundImage =`url(${nextConfig.basePath}/images/${obj.img}/circle-thumb-32.png)`;
    el.style.width = '32px';
    el.style.height = '32px';

    // el.addEventListener('click', () => {
    //   this.setState({obj: obj, objIndex: index})
    // });

    // add marker to map
    return (new mapboxgl.Marker(el)
      .setLngLat([obj.lng, obj.lat])
      .addTo(map))
  });
}

const Index = ({tracks, distance, time, uphill, objects}) => {

  let mapContainer

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoidnZhemhlc292IiwiYSI6ImNqdHBpdnUxcTA1NXk0MXBjMTl4OHJlOWgifQ.J262J1QTtrGIlylAXKTYSQ';
    
    const allCoordinates = tracks.flatMap(t => 
      t.map(p => [p.lng, p.lat])
    )
    const bounds = allCoordinates.reduce(function(bounds, p) {
      return bounds.extend(p);
    }, new mapboxgl.LngLatBounds(allCoordinates[0], allCoordinates[0]));
    
    const map = new mapboxgl.Map({
      container: mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      bounds: bounds
    });

    map.once('load', () => {
       drawTrackData(map, tracks, bounds)
       drawObjects(map, objects)
    })
    
    map.getCanvas().style.cursor = 'default'
  });

  return (
    <div className="fullHeight">
      <div
        ref = {el => mapContainer = el}
        style = {{
          height: "100%",
          overflow: "hidden",
          width: "100%",
        }}
      />
      <div
        style = {{
          top: "2em",
          right: "2em",
          position: "absolute",
        }}
      >
        <Segment textAlign='center'>
          {/* <Header as='h3' dividing>
            Statistics
          </Header> */}
          <div>
            <Statistic>
              <Statistic.Value>{distance}</Statistic.Value>
              <Statistic.Label>km</Statistic.Label>
            </Statistic>
          </div>
          <div>
            <Statistic>
              <Statistic.Value>{time}</Statistic.Value>
              <Statistic.Label>hh:mm</Statistic.Label>
            </Statistic>
          </div>
        </Segment>
      </div>

    </div>
  )
}

export async function getStaticPaths() {
  const rawdata = fs.readFileSync('public/index.json')
  const data = JSON.parse(rawdata)

  // Get the paths we want to pre-render based on posts
  const paths = data.tracks.map((track) => ({
    params: { id: track.id },
  }))

  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const rawdata = fs.readFileSync(`public/data/${params.id}/objects.json`)
  const data = JSON.parse(rawdata)

  return {
    props: {
      tracks: data.tracks,
      objects: data.objects,
      distance: Math.round(data.distance / 100) / 10,
      time: Math.floor(data.time / 1000 / 60 / 60) + ":" + (Math.round(data.time / 1000 / 60) % 60),
      uphill: data.uphill
    },
  }
}

export default Index