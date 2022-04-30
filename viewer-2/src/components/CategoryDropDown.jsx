
import React from 'react'
import { Label, Menu, Dropdown} from 'semantic-ui-react'

export const CategoryDropDown = ({categories, category, href}) => {

  const currentCat = categories.find(e => e.id == category)
  return (
    <Menu compact>
      <Dropdown item scrolling text={'Filter: ' + currentCat.title}>
        <Dropdown.Menu>
          {
            categories.map( category =>
              <Dropdown.Item key={category.id}
                name={category.id}
                active={category.id == currentCat.id}
                href={href(category.id)}
              >
                <Label>{category.count}</Label>
                {category.title}
              </Dropdown.Item>
            )
          }
        </Dropdown.Menu>
      </Dropdown>
    </Menu>
  )
}
