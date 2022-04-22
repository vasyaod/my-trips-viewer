
import React from 'react'
import { Container, Label, Menu, Dropdown} from 'semantic-ui-react'
import Link from 'next/link'
import { categoryUrl } from '../../src/utils.js'

export const MainMenu = ({page, categories, currentPage}) => {

  return (
    <Menu inverted>
        <Container>
          <Link href="/" passHref>
            <Menu.Item active={currentPage == "main"}>All tracks</Menu.Item>
          </Link>
          <Link href="/stats" passHref>
            <Menu.Item active={currentPage == "stats"}>Stats</Menu.Item>
          </Link>
          <Link href="/heatmap" passHref>
            <Menu.Item active={currentPage == "heatmap"}>Heatmap</Menu.Item>
          </Link>
          <Link href="/tags" passHref>
            <Menu.Item active={currentPage == "tag-stats"}>Tag Stats</Menu.Item>
          </Link>
          <Dropdown item text='Categories'>
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
        </Container>
      </Menu>
  )
}
