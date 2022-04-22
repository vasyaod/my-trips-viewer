
import React from 'react'
import { Container, Label, Menu, Dropdown} from 'semantic-ui-react'
import Link from 'next/link'
import { categoryUrl } from '../../src/utils.js'

export const MainMenu = ({page, categories, currentPage, currentCategory}) => {

  return (
    <Menu inverted>
        <Container>
          <Link href="/" passHref>
            <Menu.Item active={currentPage == "main" && currentCategory == "all"}>All tracks</Menu.Item>
          </Link>
          <Dropdown item text='Categories'>
            <Dropdown.Menu>
              {
                categories.map( category =>
                  <Dropdown.Item key={category.id}
                    name={category.id} 
                    active={category.id == currentCategory}
                    href={categoryUrl(category.id, 1)}
                  >
                    <Label>{category.count}</Label>
                    {category.id}
                  </Dropdown.Item>
                )
              }
            </Dropdown.Menu>
          </Dropdown>
          <Link href="/heatmap" passHref>
            <Menu.Item active={currentPage == "heatmap"}>Heatmap</Menu.Item>
          </Link>
          <Dropdown item text='Stats'>
            <Dropdown.Menu>
              <Dropdown.Item active={currentPage == "stats"} href="/stats">
                Stats by months
              </Dropdown.Item>
              <Dropdown.Item active={currentPage == "tag-stats"} href="/tags">
                Tag stats
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Container>
      </Menu>
  )
}
