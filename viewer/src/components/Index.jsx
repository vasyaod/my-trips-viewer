// @flow
import React, { Component, Fragment } from 'react';
import { Segment, Card, Image, Container, Header} from 'semantic-ui-react'
import { connect } from 'react-redux'

import { loadIndex } from '../actions.js'
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
        
        <Header as='h1' content='My trips' style={style.h1} textAlign='center' />

        <Card.Group doubling itemsPerRow={3} stackable>
          { 
            this.props.index.map(trip =>
              <Card 
                key={trip.id}
                href={`#/maps/${trip.id}`}
              >
                <Image src={`${config.url}data/${trip.id}/preview.png`} wrapped ui={false} />
                <Card.Content>
                  <Card.Header>{trip.title}</Card.Header>
                  <Card.Meta>
                    <span className='date'>{trip.date}</span>
                  </Card.Meta>
                  <Card.Description>
                    {trip.description}
                  </Card.Description>
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
