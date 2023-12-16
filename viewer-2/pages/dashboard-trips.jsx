
import { List } from 'immutable'
import * as nextConfig from '../next.config'
import * as fs from 'fs'
import { Image, Card} from 'semantic-ui-react'

const IndexPage = ({index}) => {
  
  return (
    <div style={{width: "100%", height: "100%", display: "flex", alignItems: "center", padding: "3%"}}>
        <Card.Group doubling itemsPerRow={3} stackable style={{width: "100%"}}>
          { 
            index.map(track =>
              <Card 
                key={track.id}
              >
                <Image src={`${nextConfig.basePath}/data/${track.id}/preview.png`} 
                       as='a' 
                       wrapped ui={false} 
                       href={`${nextConfig.basePath}/tracks/${track.id}`}
                       style={{aspectRatio: "4/3", width: "100%"}}
                />

                <Card.Content href={`${nextConfig.basePath}/tracks/${track.id}`} style={{display: "block"}}>
                  <Card.Header>{track.title}</Card.Header>
                  <Card.Meta>
                    <span className='date'>{track.date}</span>
                  </Card.Meta>
                  <Card.Description>
                    {track.description}
                  </Card.Description>
                </Card.Content>
              </Card>
            )
          }
        </Card.Group>
    </div>
  )
}

export async function getStaticProps({ params }) {
 
  const rawdata = fs.readFileSync('public/index.json')
  const data = JSON.parse(rawdata)

  return {
    props: {
      index: List(data.tracks).sortBy(item => item.date).reverse().take(3).toArray()
    },
  }
}

export default IndexPage