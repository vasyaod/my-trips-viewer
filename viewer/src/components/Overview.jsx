// @flow
import React, { Component } from 'react';
import { Segment, Header, Statistic, Modal, Image, Container, Embed} from 'semantic-ui-react'
import { connect } from 'react-redux'

const mapboxgl = require('mapbox-gl');

import { loadFile } from '../actions.js'

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

    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl(),  'top-left');

    map.on('zoomend', e => {
      var zoom = map.getZoom();
    })
      
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

    if (this.props.points !== prevProps.points) {
      this.drawTrackData()
    }

    if (this.props.objects !== prevProps.objects) {
      this.drawObjects()
    }
  }



  render() {
    return (
      <div className="fullHeight">
        <div className="fullHeight">
          <div
            ref = {el => this.mapContainer = el}
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
                <Statistic.Value>{this.props.distance}</Statistic.Value>
                <Statistic.Label>km</Statistic.Label>
              </Statistic>
              </div>
              <div>
              <Statistic>
                <Statistic.Value>{this.props.time}</Statistic.Value>
                <Statistic.Label>hh:mm</Statistic.Label>
              </Statistic>
              </div>
            </Segment>
          </div>
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
    points: state.points,
    distance: state.distance,
    time: state.time,
    objects: state.objects,
  };
};

export default connect(mapStateToProps, { loadFile })(Map)
