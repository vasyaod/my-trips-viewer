
import React from 'react'
import { Container, Button, Form, Grid, Header, Image, Message, Segment, Card, Label, Menu} from 'semantic-ui-react'
import Link from 'next/link'
import GitHubForkRibbon from 'react-github-fork-ribbon';
import ReactMarkdown from 'react-markdown'
import { List } from 'immutable'
import * as config from '../config.js'
import * as nextConfig from '../next.config'
import * as fs from 'fs'

const Index = ({siteTitle, siteDescription, index}) => {

  return (
    <div>
      <Menu tabular>
          <Container>
            <Link href="/" passHref>
              <Menu.Item active={true}>All tracks</Menu.Item>
            </Link>
            <Link href="/stats" passHref>
              <Menu.Item>Stats</Menu.Item>
            </Link>
            <Link href="/heatmap" passHref>
              <Menu.Item>Heatmap</Menu.Item>
            </Link>
            <Link href="/tags" passHref>
              <Menu.Item>Tags</Menu.Item>
            </Link>
          </Container>
      </Menu>
      <Container>
        <GitHubForkRibbon href="//github.com/vasyaod/my-trips-viewer"
                          target="_blank"
                          position="right">
          Fork me on GitHub
        </GitHubForkRibbon>

        <Header as='h1' content={siteTitle} textAlign='center' />

        { siteDescription && <Container text><Segment padded basic size="large" ><ReactMarkdown>{siteDescription}</ReactMarkdown></Segment></Container> }

        <Card.Group doubling itemsPerRow={3} stackable>
          { 
            index.map(track =>
              <Card 
                key={track.id}
              >
                <Link href={`/tracks/${track.id}`} passHref>
                  <Image src={`${nextConfig.basePath}/data/${track.id}/preview.png`} wrapped ui={false}/>
                </Link>
                <Card.Content href={`${nextConfig.basePath}/tracks/${track.id}`}>
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
                        <span key={tag}>
                          { track.autoTagged &&
                            <Label tag>
                              {tag}
                            </Label>
                          }
                          { !track.autoTagged &&
                            <Label color='grey' tag>
                              {tag}
                            </Label>
                          }
                        </span>
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
  )
}

export async function getStaticProps() {
 
  const rawdata = fs.readFileSync('public/index.json')
  const data = JSON.parse(rawdata)

  return {
    props: {
      siteDescription: config.siteDescription,
      siteTitle: config.siteTitle,
      index: List(data.tracks).sortBy(item => item.date).reverse().toArray()
    },
  }
}

export default Index