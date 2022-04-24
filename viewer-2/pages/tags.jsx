
import React, { useState } from 'react'
import { Container, Header, Menu, Table} from 'semantic-ui-react'
import { useEffect } from 'react';
import GitHubForkRibbon from 'react-github-fork-ribbon';
import { List } from 'immutable'
import * as fs from 'fs'
import { MainMenu } from '../src/components/MainMenu.jsx'

const Index = ({tags, categories}) => {

  return (
    <div>
      <MainMenu page={""} categories={categories} currentPage="tag-stats"/>
      <Container>
        <GitHubForkRibbon href="//github.com/vasyaod/my-trips-viewer"
                          target="_blank"
                          position="right">
          Fork me on GitHub
        </GitHubForkRibbon>

        <Header as='h1' content="Tag stats" textAlign='center' />

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
      categories: data.categories,
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