
import React from 'react'
import { Container, Button, Form, Grid, Header, Image, Message, Segment, Card, Label, Menu, Pagination, Dropdown} from 'semantic-ui-react'
import Link from 'next/link'
import GitHubForkRibbon from 'react-github-fork-ribbon';
import ReactMarkdown from 'react-markdown'
import ReactTooltip from 'react-tooltip';
import { List, Repeat, Range } from 'immutable'
import Head from 'next/head'
import { MainMenu } from '../../../src/components/MainMenu.jsx'

import * as config from '../../../next.config'
import * as nextConfig from '../../../next.config'
import * as fs from 'fs'
import { shareFacebook, shareTwitter, shareVk, shareTelegram } from '../../../src/social-buttons.js'
import { categoryUrl } from '../../../src/utils.js'

const Index = ({siteTitle, siteDescription, index, currentPage, pages, categories, category}) => {

  return (
    <div>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <MainMenu page={""} categories={categories} currentPage="main" currentCategory={category}/>
      <Container>
        <ReactTooltip effect="solid" uuid="mytt"/>
        <GitHubForkRibbon href="//github.com/vasyaod/my-trips-viewer"
                          target="_blank"
                          position="right">
          Fork me on GitHub
        </GitHubForkRibbon>

        <Header as='h1' content={siteTitle} textAlign='center' />

        { siteDescription && 
          <Container text>
            <Segment padded basic size="large">
              <ReactMarkdown>{siteDescription}</ReactMarkdown>
            </Segment>
          </Container> 
        }

        { pages > 1 && 
          <Segment basic textAlign='center'>
            <Pagination 
              defaultActivePage={currentPage} 
              totalPages={pages} 
              onPageChange={ (e, { activePage }) => location.href = categoryUrl(category, activePage)}
            />
          </Segment>
        }

        <Card.Group doubling itemsPerRow={3} stackable>
          { 
            index.map(track =>
              <Card 
                key={track.id}
              >
                <Image src={`${nextConfig.basePath}/data/${track.id}/preview.png`} as='a' wrapped ui={false} href={`${nextConfig.basePath}/tracks/${track.id}`}/>
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
                            <Label tag data-tip='Automatically inferred tag'>
                              {tag}
                            </Label>
                          }
                          { !track.autoTagged &&
                            <Label color='grey' tag data-tip='Manual tag'>
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
                  <Button circular icon='telegram' onClick={() => shareTelegram(track.id, track.title, track.description)}/>
                  <Button circular icon='vk' onClick={() => shareVk(track.id, track.title, track.description)}/>
                </Card.Content>
              </Card>
            )
          }
        </Card.Group>

        { pages > 1 && 
          <Segment basic textAlign='center'>
            <Pagination 
              defaultActivePage={currentPage} 
              totalPages={pages} 
              onPageChange={ (e, { activePage }) => location.href = categoryUrl(category, activePage)}
            />
          </Segment>
        }
      </Container>
    </div>
  )
}

export async function getStaticPaths() {
  const rawdata = fs.readFileSync('public/index.json')
  const data = JSON.parse(rawdata)


  const paths = List(data.categories).flatMap ( category => {
    const pages = Math.ceil(List(data.tracks).filter(t => t.categories.includes(category.id)).size / nextConfig.pageSize)
    return Range(0, pages).map( i => {return { params: { category: category.id, page: `${i+1}` } }})
  })

  return {
    // Opt-in to on-demand generation for non-existent pages
    fallback: false,
    paths: paths.toArray()
  }
}

export async function getStaticProps({ params }) {
 

  const rawdata = fs.readFileSync('public/index.json')
  const data = JSON.parse(rawdata)

  const p = params.page ? parseInt(params.page) : 1;
  const category = params.category
  const pages = Math.ceil(
    List(data.tracks)
      .filter(t => t.categories.includes(category))
      .size / nextConfig.pageSize
  )

  return {
    props: {
      siteDescription: config.siteDescription,
      siteTitle: config.siteTitle,
      currentPage: params.page,
      categories: data.categories,
      pages: pages,
      category: category,
      index: List(data.tracks)
        .filter(t => t.categories.includes(category))
        .sortBy(item => item.date)
        .reverse()
        .toArray()
        .slice(0 + nextConfig.pageSize*(p-1), nextConfig.pageSize*p)
    },
  }
}

export default Index