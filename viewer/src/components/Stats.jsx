// @flow
import React, { Component, Fragment } from 'react';
import { Segment, Card, Image, Container, Header, Button, Menu, Table} from 'semantic-ui-react'
import { Link } from "react-router-dom";
import ReactMarkdown from 'react-markdown'
import { connect } from 'react-redux'
import GitHubForkRibbon from 'react-github-fork-ribbon';

import { loadStats } from '../actions.js'
import * as config from '../config.js'

const style = {
  h1: {
    marginTop: '1em',
    marginBottom: '1em',
  },
}

class Index extends Component {

  componentDidMount() {
    this.props.loadStats()
  }

  render() {
    return (
      <div>
        <Menu tabular>
            <Container>
              <Menu.Item as={Link} to="/">All tracks</Menu.Item>
              <Menu.Item as={Link} active={true} to="/stats">Stats</Menu.Item>
              <Menu.Item as={Link} to="/heatmap">Heatmap</Menu.Item>
            </Container>
        </Menu>

        <Container>
          <GitHubForkRibbon href="//github.com/vasyaod/my-trips-viewer"
                            target="_blank"
                            position="right">
            Fork me on GitHub
          </GitHubForkRibbon>

          <Header as='h1' content="Stats" style={style.h1} textAlign='center' />

          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Date</Table.HeaderCell>
                <Table.HeaderCell>Num of activities</Table.HeaderCell>
                <Table.HeaderCell>Distance (km)</Table.HeaderCell>
                <Table.HeaderCell>Time (hh:mm)</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              { 
                this.props.stats.map(row =>
                  <Table.Row key={row.date}>
                    <Table.Cell>{row.date}</Table.Cell>
                    <Table.Cell>{row.count}</Table.Cell>
                    <Table.Cell>{row.distance}</Table.Cell>
                    <Table.Cell>{row.time}</Table.Cell>
                  </Table.Row>
                )
              }
            </Table.Body>
          </Table>

        </Container>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    stats: state.stats
  };
};

export default connect(mapStateToProps, { loadStats })(Index)
