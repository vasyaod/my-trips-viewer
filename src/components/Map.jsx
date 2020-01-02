// @flow
import React, { Component } from 'react';
import { Segment, Header, Button, Container, Grid, Placeholder} from 'semantic-ui-react'
import { connect } from 'react-redux'

const mapboxgl = require('mapbox-gl');

import { loadFile } from '../actions.js'

class Map extends Component {
  
  componentDidMount() {
    const fileName = this.props.match.params.id == null ? "" : this.props.match.params.id
    this.props.loadFile(fileName)

    mapboxgl.accessToken = 'pk.eyJ1IjoidnZhemhlc292IiwiYSI6ImNqdHBpdnUxcTA1NXk0MXBjMTl4OHJlOWgifQ.J262J1QTtrGIlylAXKTYSQ';
    
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-0.0, 0.0],
      zoom: 1
    });
    this.map = map

    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl(),  'top-left');

    map.on('zoomend', e => {
      var zoom = map.getZoom();
    })
      
//    const self = this
    map.once('load', () => {
      this.loadData()
    })
    
    map.getCanvas().style.cursor = 'default'
  }
  
  loadData() {
    if (!this.map.loaded())
      return

    const map = this.map

    const coordinates = this.props.points.map(p => {
      return [p.lng, p.lat]
    }).toArray()

    const data = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          'geometry': {
            'type': 'LineString',
            'coordinates': coordinates
          }
        }
      ]
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

    var bounds = coordinates.reduce(function(bounds, p) {
      return bounds.extend(p);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
       
    map.fitBounds(bounds, {
      padding: 30
    })
  }

  render() {
    return (
      <div
        ref = {el => this.mapContainer = el}
        style = {{
          position: "relative",
          height: "100%",
          overflow: "hidden",
          width: "100%",
        }}>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
   points: state.points
  };
};

export default connect(mapStateToProps, { loadFile })(Map)
