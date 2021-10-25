
import React, { useState, useEffect } from 'react'
import { Container, Header, Menu, Card } from 'semantic-ui-react'
import Link from 'next/link'
import GitHubForkRibbon from 'react-github-fork-ribbon';
import CalendarHeatmap from 'react-calendar-heatmap';
import * as config from '../config.js'
import * as fs from 'fs'

import 'react-calendar-heatmap/dist/styles.css'

const Index = ({heatmap}) => {

  return (
    <div>
      <Menu tabular>
          <Container>
            <Link href="/" passHref>
              <Menu.Item>All tracks</Menu.Item>
            </Link>
            <Link href="/stats" passHref>
              <Menu.Item>Stats</Menu.Item>
            </Link>
            <Link href="/heatmap" passHref>
              <Menu.Item active={true}>Heatmap</Menu.Item>
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

        <Header as='h1' content="Heatmap" textAlign='center' />

        <Card.Group doubling itemsPerRow={1} stackable>
          { heatmap &&
            heatmap.map( x =>
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

      </Container>
    </div>
  )
}

export async function getStaticProps() {
  const rawdata = fs.readFileSync('public/index.json')
  const data = JSON.parse(rawdata)

  return {
    props: {
      heatmap: data.heatmap
    },
  }
}

export default Index