// @flow
import React, { Component } from 'react';
import { Segment, Header, Statistic, Modal, Image, Container, Embed, Card} from 'semantic-ui-react'
import { connect } from 'react-redux'

const mapboxgl = require('mapbox-gl');

import { loadFile } from '../actions.js'
import * as config from '../config.js'

const style = {
  h1: {
    marginTop: '1em',
    marginBottom: '1em',
  },
}

class Map extends Component {

  constructor(props) {
    super(props);
    this.state = {
      obj: null,
    }
  }

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
    
    map.scrollZoom.disable();
     
//    const self = this
    map.once('load', () => {
      this.drawTrackData()
      this.drawObjects()
    })
    
    map.getCanvas().style.cursor = 'default'
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.id !== prevProps.match.params.id) {
      const fileName = this.props.match.params.id == null ? "" : this.props.match.params.id
      this.props.loadFile(fileName)
    }

    if (this.props.tracks !== prevProps.tracks) {
      this.drawTrackData()
    }

    if (this.props.objects !== prevProps.objects) {
      this.drawObjects()
    }
  }

  drawTrackData() {
    if (!this.map.loaded())
      return

    const map = this.map

    const data = {
      "type": "FeatureCollection",
      "features": this.props.tracks
        .map( t => {
          return {
              "type": "Feature",
              'geometry': {
                'type': 'LineString',
                'coordinates': t.map(p => [p.lng, p.lat]).toArray()
              }
            }
          }
        )
        .toArray()
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

    const allCoordinates = this.props.tracks.flatMap(t => 
      t.map(p => [p.lng, p.lat])
    ).toArray()
    var bounds = allCoordinates.reduce(function(bounds, p) {
      return bounds.extend(p);
    }, new mapboxgl.LngLatBounds(allCoordinates[0], allCoordinates[0]));
       
    map.fitBounds(bounds, {
      padding: 30,
      linear: true
    })
  }

  drawObjects() {

//    if (!this.map.loaded())
      //return

    const map = this.map

    if (this.markers) {
      this.markers.forEach(marker => marker.remove())
    }

    // add markers to map
    this.markers = this.props.objects.map( (obj, index) => {
      // create a DOM element for the marker
      var el = document.createElement('div');
      el.className = 'marker play2 button';
      el.style.backgroundImage =`url(images/${obj.img}/circle-thumb-32.png)`;
      el.style.width = '32px';
      el.style.height = '32px';

      el.addEventListener('click', () => {
        this.setState({obj: obj, objIndex: index})
      });

      // add marker to map
      return (new mapboxgl.Marker(el)
        .setLngLat([obj.lng, obj.lat])
        .addTo(map))
    });
  }

  render() {
    return (
      <div className="fullHeight">
        <div className="fullHeight">
          
          <Container>
            <Header as='h1' content="2019 New year trip, Day 1" style={style.h1} textAlign='center' />
          </Container>

          <div
            ref = {el => this.mapContainer = el}
            style = {{
              height: "80%",
              overflow: "hidden",
            }}
            class="ui container"
          />
          <Container>
            <Segment padded basic textAlign='center'>
              <Statistic.Group floated='left' widths='three'>
                <Statistic>
                  <Statistic.Value>{this.props.distance}</Statistic.Value>
                  <Statistic.Label>km</Statistic.Label>
                </Statistic>
                <Statistic>
                  <Statistic.Value>{this.props.time}</Statistic.Value>
                  <Statistic.Label>hh:mm</Statistic.Label>
                </Statistic>
                <Statistic>
                  <Statistic.Value>1420</Statistic.Value>
                  <Statistic.Label>↑↓ m</Statistic.Label>
                </Statistic>
              </Statistic.Group>
            </Segment>

            <Card.Group doubling itemsPerRow={3} stackable>
            { 
              this.props.objects.map(obj =>
                <Card key={obj.img}>
                  <Image src={`${config.url}/images/${obj.img}/original.jpg`} wrapped ui={false}/>
                </Card>
              )
            }
          </Card.Group>

        </Container>

        </div>
        { this.state.obj &&
          <Modal 
            size="fullscreen" 
            basic 
            open={true} 
            closeOnDimmerClick={true}
            onClose={() => this.setState({obj: null})}
            >
            <Modal.Content>
              <Modal.Description>
                <Container>
                  { this.state.obj.type == "video" &&
                    <Embed
                      active={true}
                      id={this.state.obj.youtubeId}
                      placeholder={`images/${this.state.obj.img}/original.jpg`}
                      source='youtube'
                    />
                  }
                  { this.state.obj.type == "image" &&
                    <Image src={`images/${this.state.obj.img}/original.jpg`} onClick={() => this.setState({obj: null})}/>
                  }
                </Container>
              </Modal.Description>
            </Modal.Content>
          </Modal>
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    tracks: state.tracks,
    distance: state.distance,
    time: state.time,
    objects: state.objects,
  };
};

export default connect(mapStateToProps, { loadFile })(Map)
