
import React from 'react'
import { Label, Menu, Dropdown} from 'semantic-ui-react'

export const CategoryDropDown = ({categories, category, href}) => {

  return (
    <Menu compact>
      <Dropdown item text={'Filter: ' + category}>
        <Dropdown.Menu>
          {
            categories.map( category =>
              <Dropdown.Item key={category.id}
                name={category.id}
                active={category.id == category}
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
