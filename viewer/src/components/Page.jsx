// @flow

import React, { Component } from 'react';
//import 'style-loader!css-loader!../css/styles.css';
import { Segment, Sidebar, Menu, Container } from 'semantic-ui-react'
import Map from './Map.jsx'
import { HashRouter as Router, Route, Link } from "react-router-dom";
// import queryString from 'query-string';
// import { loadProjectFromUrl } from '../actions/actions.js';
import { connect } from 'react-redux'

//const mapboxgl = require('mapbox-gl');

class Page extends Component {
  // componentDidMount() {
  //   const parameters = queryString.parse(location.search)
  //   if (parameters.project != null) {
  //     this.props.dispatch(loadProjectFromUrl(parameters.project))
  //   }
  // }

  render() {
    return (
      <Router>
        <div className="fullHeight">
          <Sidebar.Pushable as={Segment}>
            <Sidebar.Pusher >
              <Route exact path="/" component={Map}/>
              <Route exact path="/maps/:id" component={Map} />
            </Sidebar.Pusher>
          </Sidebar.Pushable>
        </div>
      </Router>
    );
  }
}

export default connect()(Page)
