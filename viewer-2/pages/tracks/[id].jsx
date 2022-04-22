
import React, { useState, useRef } from 'react'
import { Segment, Statistic, Modal, Container, Embed, Image, Button, Menu} from 'semantic-ui-react'
import { useEffect } from 'react';
import * as nextConfig from '../../next.config'
import * as fs from 'fs'
import { Swiper, SwiperSlide } from 'swiper/swiper-react.cjs.js';
import Head from 'next/head'
import { MainMenu } from '../../src/components/MainMenu.jsx'

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

function drawObjects(map, objects, setObj) {

  // add markers to map
  objects.map( (obj, index) => {
    // create a DOM element for the marker
    var el = document.createElement('div');
//    el.className = 'marker play2 button';
    el.style.backgroundImage =`url(${nextConfig.basePath}/images/${obj.img}/circle-thumb-32.png)`;
    el.style.width = '32px';
    el.style.height = '32px';

    if (setObj) {
      el.addEventListener('click', () => {
        setObj(obj)
      });
    }

    // add marker to map
    return (new mapboxgl.Marker(el)
      .setLngLat([obj.lng, obj.lat])
      .addTo(map)
    )
  });
}

const Index = ({tracks, distance, time, uphill, objects, title, description, trackId, categories}) => {

  const [obj, setObj] = useState(null);
  const mapContainer = useRef(null);

//  let mapContainer

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoidnZhemhlc292IiwiYSI6ImNqdHBpdnUxcTA1NXk0MXBjMTl4OHJlOWgifQ.J262J1QTtrGIlylAXKTYSQ';
    
    const allCoordinates = tracks.flatMap(t => 
      t.map(p => [p.lng, p.lat])
    )
    const bounds = allCoordinates.reduce(function(bounds, p) {
      return bounds.extend(p);
    }, new mapboxgl.LngLatBounds(allCoordinates[0], allCoordinates[0]));
    
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      bounds: bounds
    });

    // Add zoom and rotation controls to the map.
    map.once('load', () => {
      map.addControl(new mapboxgl.NavigationControl(),  'top-left');

      map.on('zoomend', e => {
        var zoom = map.getZoom();
      })

      drawTrackData(map, tracks, bounds)
      drawObjects(map, objects, setObj)

      map.getCanvas().style.cursor = 'default'
    })
  }, []);

  const titleWithDistance = `${title}, ${distance} km`

  return (
    <div className="fullHeight">
      <div className="fullHeight">
        <Head>
          <title>{titleWithDistance}</title>
          <meta property="og:title" content={titleWithDistance}/>
          <meta property="og:image" content={`${nextConfig.basePath}/data/${trackId}/preview.png`}/>
          <meta property="og:description" content={description}/>
        </Head>
        <MainMenu page={""} categories={categories} currentPage=""/>
        <div
          ref = {mapContainer}
          style = {{
            height: "100%",
            overflow: "hidden",
            width: "100%",
          }}
        />
        <div
          style = {{
            top: "3.5em",
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
            <div>
              <Statistic>
                <Statistic.Value>{uphill}</Statistic.Value>
                <Statistic.Label>￪ uphill, m</Statistic.Label>
              </Statistic>
            </div>
          </Segment>
        </div>

        { (objects && objects.length > 0) &&
            <div
              style = {{
                height: "15em",
                left: "0em",
                right: "0em",
                bottom: "0em",
                position: "absolute",
              }}
            >
              <Swiper
                slidesPerView = {'auto'} 
                centeredSlides = {true} 
                spaceBetween = {10}
                pagination = {{ "clickable": true }}
                className = "mySwiper"
              >
                { 
                  objects.map( (obj, index) =>
                    <SwiperSlide key={obj.img}>
                      <img onClick={() => setObj(obj)} src={`${nextConfig.basePath}/images/${obj.img}/original.jpg`}/>
                    </SwiperSlide>
                  )
                }
              </Swiper>
            </div>
          }
      </div>

      { obj &&
          <Modal 
            size="fullscreen" 
            basic 
            open={true} 
            closeOnDimmerClick={true}
            onClose={() => setObj(null)}
            >
            <Modal.Content>
              <Modal.Description>
                <Container>
                  { obj.type == "video" &&
                    <Embed
                      active={true}
                      id={obj.youtubeId}
                      placeholder={`${nextConfig.basePath}/images/${obj.img}/original.jpg`}
                      source='youtube'
                    />
                  }
                  { obj.type == "image" &&
                    <Image src={`${nextConfig.basePath}/images/${obj.img}/original.jpg`} onClick={() => setObj(null)}/>
                  }
                </Container>
              </Modal.Description>
            </Modal.Content>
          </Modal>
        }
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
  const data = JSON.parse(fs.readFileSync(`public/data/${params.id}/objects.json`))
  const indexData = JSON.parse(fs.readFileSync('public/index.json'))

  return {
    props: {
      categories: indexData.categories,
      tracks: data.tracks,
      objects: data.objects,
      title: data.title,
      description: data.description ? data.description : "",
      trackId: params.id,
      distance: Math.round(data.distance / 100) / 10,
      time: Math.floor(data.time / 1000 / 60 / 60) + ":" + (Math.round(data.time / 1000 / 60) % 60),
      uphill: data.uphill
    },
  }
}

export default Index