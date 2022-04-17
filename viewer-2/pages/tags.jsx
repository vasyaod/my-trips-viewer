
import React, { useState } from 'react'
import { Container, Header, Menu, Table} from 'semantic-ui-react'
import { useEffect } from 'react';
import Link from 'next/link'
import GitHubForkRibbon from 'react-github-fork-ribbon';
import { List } from 'immutable'
import * as fs from 'fs'

const Index = ({tags}) => {

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
              <Menu.Item>Heatmap</Menu.Item>
            </Link>
            <Link href="/tags" passHref>
              <Menu.Item active={true}>Tags</Menu.Item>
            </Link>
          </Container>
      </Menu>
      <Container>
        <GitHubForkRibbon href="//github.com/vasyaod/my-trips-viewer"
                          target="_blank"
                          position="right">
          Fork me on GitHub
        </GitHubForkRibbon>

        <Header as='h1' content="Stats" textAlign='center' />

        <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Tag</Table.HeaderCell>
                <Table.HeaderCell>Num of activities</Table.HeaderCell>
                <Table.HeaderCell>Distance, km</Table.HeaderCell>
                <Table.HeaderCell>Time, hh:mm</Table.HeaderCell>
                <Table.HeaderCell>Uphill ￪, m</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              { 
               tags.map(row =>
                  <Table.Row key={row.tag}>
                    <Table.Cell>{row.tag}</Table.Cell>
                    <Table.Cell>{row.count}</Table.Cell>
                    <Table.Cell>{row.distance}</Table.Cell>
                    <Table.Cell>{row.time}</Table.Cell>
                    <Table.Cell>{row.uphill}</Table.Cell>
                  </Table.Row>
                )
              }
            </Table.Body>
          </Table>

      </Container>
    </div>
  )
}

export async function getStaticProps() {
  const rawdata = fs.readFileSync('public/index.json')
  const data = JSON.parse(rawdata)

  return {
    props: {
      tags: List(data.tags)
      .sortBy(item => item.date)
      .map(row => ({...row,
        distance: Math.round(row.distance / 100) / 10,
        time: Math.floor(row.time / 1000 / 60 / 60) + ":" + (Math.round(row.time / 1000 / 60) % 60)
      }))
      .toArray()
    },
  }
}

export default Index