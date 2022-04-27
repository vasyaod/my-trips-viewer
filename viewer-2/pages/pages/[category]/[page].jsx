
import React from 'react'
import { Container, Button, Form, Grid, Header, Image, Message, Segment, Card, Label, Menu, Pagination, Dropdown} from 'semantic-ui-react'
import Link from 'next/link'
import GitHubForkRibbon from 'react-github-fork-ribbon';
import ReactMarkdown from 'react-markdown'
import ReactTooltip from 'react-tooltip';

import { Swiper, SwiperSlide } from 'swiper/react';
// import required modules
import { Pagination as Pagination1, Navigation} from "swiper";

import { List, Range } from 'immutable'
import Head from 'next/head'
import { MainMenu } from '../../../src/components/MainMenu.jsx'

import * as config from '../../../next.config'
import * as nextConfig from '../../../next.config'
import * as fs from 'fs'
import { shareFacebook, shareTwitter, shareVk, shareTelegram } from '../../../src/social-buttons.js'
import { categoryUrl } from '../../../src/utils.js'

const Index = ({siteTitle, siteDescription, index, currentPage, pages, categories, category}) => {
  
  function imgs1 (track) {
    const x = track.objects.map ( obj =>
    `${nextConfig.basePath}/images/${obj.img}/original.jpg`
    )
    return List(x).insert(0, `${nextConfig.basePath}/data/${track.id}/preview.png`).toArray()
  }

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


        <Segment basic>
          <Header as='h1' content={siteTitle} textAlign='center' />
    
          { siteDescription && 
            <Container text>
              <Segment padded basic size="large">
                <ReactMarkdown>{siteDescription}</ReactMarkdown>
              </Segment>
            </Container> 
          }
        </Segment>

        { pages > 1 && 
          <Segment basic textAlign='center' >
            <Pagination 
              style={{marginBottom: "1em"}}
              size='mini'
              defaultActivePage={currentPage} 
              totalPages={pages} 
              onPageChange={ (e, { activePage }) => location.href = categoryUrl(category, activePage)}
            /> <br/>
            <Menu compact>
              <Dropdown item text={'Filter: ' + category}>
                <Dropdown.Menu>
                  {
                    categories.map( category =>
                      <Dropdown.Item key={category.id}
                        name={category.id} 
                        active={category.id == category}
                        href={categoryUrl(category.id, 1)}
                      >
                        <Label>{category.count}</Label>
                        {category.id}
                      </Dropdown.Item>
                    )
                  }
                </Dropdown.Menu>
              </Dropdown>
            </Menu>
          </Segment>
        }

        { pages < 2 && 
          <Segment basic textAlign='center'>
            <Menu compact>
              <Dropdown item text={'Filter: ' + category}>
                <Dropdown.Menu>
                  {
                    categories.map( category =>
                      <Dropdown.Item key={category.id}
                        name={category.id} 
                        active={category.id == category}
                        href={categoryUrl(category.id, 1)}
                      >
                        <Label>{category.count}</Label>
                        {category.id}
                      </Dropdown.Item>
                    )
                  }
                </Dropdown.Menu>
              </Dropdown>
            </Menu>
          </Segment>
        }
                  {/* <SwiperSlide>
                    <Image src={`${nextConfig.basePath}/data/${track.id}/preview.png`} as='a' wrapped ui={false} href={`${nextConfig.basePath}/tracks/${track.id}`}/>
                    </SwiperSlide> */}

        <Card.Group doubling itemsPerRow={3} stackable>
          { 
            index.map(track =>
              <Card 
                key={track.id}
              >
                <Image src={`${nextConfig.basePath}/data/${track.id}/preview.png`} as='a' wrapped ui={false} href={`${nextConfig.basePath}/tracks/${track.id}`}/>

                { track.objects.length != 0 &&
                  <Swiper 
                    className="indexSwiper" 
                    pagination = {{ "clickable": true }}
                    navigation={true}
                    slidesPerView = {'auto'} 
                    modules={[Pagination1, Navigation]} 
                    style={{position: "absolute", top: 0, left: 0, aspectRatio: "4/3"}} 
                  >
                    { 
                      imgs1(track).map( (imgSrc) =>
                        <SwiperSlide key={imgSrc}>
                          <Image src={imgSrc} as='a' wrapped ui={false} href={`${nextConfig.basePath}/tracks/${track.id}`}/>
                        </SwiperSlide>
                      )
                    }
                    {/* <SwiperSlide style={{margin: 0, padding: 0, aspectRatio: "4/3"}}>
                      <img src={`${nextConfig.basePath}/data/${track.id}/preview.png`} style={{margin: 0, padding: 0, aspectRatio: "4/3"}}/>
                    </SwiperSlide> */}
                  </Swiper>
                }
                <Card.Content href={`${nextConfig.basePath}/tracks/${track.id}`} style={{display: "block"}}>
                  <Card.Header>{track.title}</Card.Header>
                  <Card.Meta>
                    <span className='date'>{track.date}</span>
                  </Card.Meta>
                  <Card.Description>
                    {track.description}
                  </Card.Description>
                </Card.Content>
                {track.tags.length > 0 &&
                  <Card.Content extra>
                    {track.tags && 
                      track.tags.map(tag =>
                        <span key={tag}>
                          { track.autoTagged &&
                            <Label tag data-tip='Automatically inferred tag' href={categoryUrl(tag, 1)}>
                              {tag}
                            </Label>
                          }
                          { !track.autoTagged &&
                            <Label color='grey' tag data-tip='Manual tag' href={categoryUrl(tag, 1)}>
                              {tag}
                            </Label>
                          }
                        </span>
                      )
                    }
                  </Card.Content>
                }
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
              size='mini'
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