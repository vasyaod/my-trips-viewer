
import React from 'react'
import { Container, Header, Table, Segment } from 'semantic-ui-react'
import { MainMenu } from './MainMenu.jsx'
import GitHubForkRibbon from 'react-github-fork-ribbon';
import { CategoryDropDown } from './CategoryDropDown.jsx'
import * as nextConfig from '../../next.config'

export const Stats = ({stats, categories, title, currentPage, category}) => {

  return (
    <div>
      <MainMenu page={""} categories={categories} currentPage={currentPage}/>
      <Container>
        <GitHubForkRibbon href="//github.com/vasyaod/my-trips-viewer"
                          target="_blank"
                          position="right">
          Fork me on GitHub
        </GitHubForkRibbon>

        <Header as='h1' content={title} textAlign='center' />
        
        <Segment basic textAlign='center'>
          <CategoryDropDown categories={categories} category={category} href={(categoryId) => `${nextConfig.basePath}/${currentPage}/${categoryId}`}/>
        </Segment>

        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Date</Table.HeaderCell>
              <Table.HeaderCell>Num of activities</Table.HeaderCell>
              <Table.HeaderCell>Distance, km</Table.HeaderCell>
              <Table.HeaderCell>Time, hh:mm</Table.HeaderCell>
              <Table.HeaderCell>Uphill ￪, m</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            { 
              stats.map(row =>
                <Table.Row key={row.date}>
                  <Table.Cell>{row.date}</Table.Cell>
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