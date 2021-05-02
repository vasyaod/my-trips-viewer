// @flow
import React, { Component, Fragment } from 'react';
import { Segment, Card, Image, Container, Header, Button, Menu, Table} from 'semantic-ui-react'
import { Link } from "react-router-dom";
import ReactMarkdown from 'react-markdown'
import { connect } from 'react-redux'
import CalendarHeatmap from 'react-calendar-heatmap';
import GitHubForkRibbon from 'react-github-fork-ribbon';

import { loadIndex } from '../actions.js'
import * as config from '../config.js'
import ReactTooltip from 'react-tooltip';                                                                                                                                                                                                                                       
 
import 'react-calendar-heatmap/dist/styles.css'

const style = {
  h1: {
    marginTop: '1em',
    marginBottom: '1em',
  },
}

class Heatmap extends Component {

  componentDidMount() {
    this.props.loadIndex()
  }

  render() {
    return (
      <div>
        <Menu tabular>
            <Container>
              <Menu.Item as={Link} to="/">All tracks</Menu.Item>
              <Menu.Item as={Link} to="/stats">Stats</Menu.Item>
              <Menu.Item as={Link} active={true} to="/heatmap">Heatmap</Menu.Item>
            </Container>
        </Menu>

        <Container>
          <ReactTooltip/>
          <GitHubForkRibbon href="//github.com/vasyaod/my-trips-viewer"
                            target="_blank"
                            position="right">
            Fork me on GitHub
          </GitHubForkRibbon>

          <Header as='h1' content="Heatmap" style={style.h1} textAlign='center' />

          { 
            <Card.Group doubling itemsPerRow={1} stackable>
              { this.props.heatmap &&
                this.props.heatmap.map( x =>
                  <Card key={x.year}>
                    <Card.Content>
                      <Card.Header>{x.year}</Card.Header>
                      <Card.Description>
                        <CalendarHeatmap
                          startDate={new Date(x.year + '-01-01')}
                          endDate={new Date(x.year + '-12-31')}
                          values={x.values}
                          tooltipDataAttrs={value => {
                            if (value.date)
                              return {
                                'data-tip': `${value.date}, distance ${value.count} km`,
                              }
                            else
                              return {
                                'data-tip': `No data`,
                              }
                          }}
                          classForValue={(value) => {
                            if (!value) {
                              return 'color-empty';
                            }

                            if (value.count < 10)
                              return `color-gitlab-1`;
                            else if (value.count < 25)
                              return `color-gitlab-2`;
                            else if (value.count < 50)
                              return `color-gitlab-3`;
                            else
                              return `color-gitlab-4`;
      
                          }}
                        />
                      </Card.Description>
                    </Card.Content>
                  </Card>
                )
              }
            </Card.Group>
          }

        </Container>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    heatmap: state.heatmap
  };
};

export default connect(mapStateToProps, { loadIndex })(Heatmap)
