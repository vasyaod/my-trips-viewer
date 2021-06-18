// @flow
import React, { Component, Fragment } from 'react';
import { Segment, Card, Image, Container, Header, Button, Menu, Label} from 'semantic-ui-react'
import { Link } from "react-router-dom";
import ReactMarkdown from 'react-markdown'
import { connect } from 'react-redux'
import GitHubForkRibbon from 'react-github-fork-ribbon';

import { loadIndex, shareFacebook, shareTwitter, shareVk } from '../actions.js'
import * as config from '../config.js'

const style = {
  h1: {
    marginTop: '1em',
    marginBottom: '0.1em',
  },
}

class Index extends Component {

  componentDidMount() {
    this.props.loadIndex()
  }

  render() {
    return (
      <div>
        <Menu tabular>
            <Container>
              <Menu.Item as={Link} active={true} to="/" header>All tracks</Menu.Item>
              <Menu.Item as={Link} to="/stats">Stats</Menu.Item>
              <Menu.Item as={Link} to="/heatmap">Heatmap</Menu.Item>
              <Menu.Item as={Link} to="/tags">Tags</Menu.Item>
            </Container>
        </Menu>

        <Container>
          <GitHubForkRibbon href="//github.com/vasyaod/my-trips-viewer"
                            target="_blank"
                            position="right">
            Fork me on GitHub
          </GitHubForkRibbon>

          <Header as='h1' content={this.props.siteTitle} style={style.h1} textAlign='center' />

          { this.props.siteDescription && <Container text><Segment padded basic size="large" ><ReactMarkdown>{this.props.siteDescription}</ReactMarkdown></Segment></Container> }

          <Card.Group doubling itemsPerRow={3} stackable>
            { 
              this.props.index.map(track =>
                <Card 
                  key={track.id}
                >
                  <Image src={`${config.url}data/${track.id}/preview.png`} wrapped ui={false} to={`/track/${track.id}`} as={Link}/>
                  <Card.Content href={`#/track/${track.id}`}>
                    <Card.Header>{track.title}</Card.Header>
                    <Card.Meta>
                      <span className='date'>{track.date}</span>
                    </Card.Meta>
                    <Card.Description>
                      <p>
                        {track.description}
                      </p>
                      {track.tags && 
                        track.tags.map(tag =>
                          <Label key={tag} tag>
                            {tag}
                          </Label>
                        )
                      }
                    </Card.Description>
                  </Card.Content>
                  <Card.Content extra>
                    <Button circular icon='facebook' onClick={() => shareFacebook(track.id, track.title, track.description)}/>
                    <Button circular icon='twitter' onClick={() => shareTwitter(track.id, track.title, track.description)} />
                    <Button circular icon='vk' onClick={() => shareVk(track.id, track.title, track.description)}/>
                </Card.Content>
                </Card>
              )
            }
          </Card.Group>
        </Container>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    index: state.index,
    siteTitle: config.siteTitle,
    siteDescription: config.siteDescription
  };
};

export default connect(mapStateToProps, { loadIndex })(Index)
