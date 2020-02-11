// @flow
import React, { Component, Fragment } from 'react';
import { Segment, Card, Image, Container, Header, Button} from 'semantic-ui-react'
import { connect } from 'react-redux'
import GitHubForkRibbon from 'react-github-fork-ribbon';

import { loadIndex, shareFacebook, shareTwitter, shareVk } from '../actions.js'
import * as config from '../config.js'

const style = {
  h1: {
    marginTop: '1em',
    marginBottom: '1em',
  },
}

class Index extends Component {

  componentDidMount() {
    this.props.loadIndex()
  }

  render() {
    return (
      <Container>
        <GitHubForkRibbon href="//github.com/vasyaod/my-trips-viewer"
                          target="_blank"
                          position="right">
          Fork me on GitHub
        </GitHubForkRibbon>

        <Header as='h1' content='My trips' style={style.h1} textAlign='center' />

        <Card.Group doubling itemsPerRow={3} stackable>
          { 
            this.props.index.map(trip =>
              <Card 
                key={trip.id}
              >
                <Image src={`${config.url}data/${trip.id}/preview.png`} wrapped ui={false} href={`#/maps/${trip.id}`} as='a'/>
                <Card.Content href={`#/maps/${trip.id}`}>
                  <Card.Header>{trip.title}</Card.Header>
                  <Card.Meta>
                    <span className='date'>{trip.date}</span>
                  </Card.Meta>
                  <Card.Description>
                    {trip.description}
                  </Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <Button circular icon='facebook' onClick={() => shareFacebook(trip.id, trip.title, trip.description)}/>
                  <Button circular icon='twitter' onClick={() => shareTwitter(trip.id, trip.title, trip.description)} />
                  <Button circular icon='vk' onClick={() => shareVk(trip.id, trip.title, trip.description)}/>
              </Card.Content>
              </Card>
            )
          }
        </Card.Group>
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    index: state.index
  };
};

export default connect(mapStateToProps, { loadIndex })(Index)
