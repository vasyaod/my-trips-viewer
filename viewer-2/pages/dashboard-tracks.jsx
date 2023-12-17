
import { List } from 'immutable'
import * as nextConfig from '../next.config'
import * as fs from 'fs'
import { Image, Card} from 'semantic-ui-react'
import CalendarHeatmap from 'react-calendar-heatmap';

import 'react-calendar-heatmap/dist/styles.css'

const IndexPage = ({index, heatmap}) => {
  return (
    <div style={{width: "100%", height: "100%", paddingTop: "3%"}}>
      <div style={{width: "100%", height: "50%", display: "flex", alignItems: "center", marginTop: "1%"}}>
        <Card.Group doubling itemsPerRow={3} stackable style={{width: "100%", margin: "10%"}}>
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

                <Card.Content style={{display: "block"}}>
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
      <div style={{width: "100%", height: "50%", display: "flex", alignItems: "center"}}>
        <Card.Group doubling itemsPerRow={1} stackable style={{width: "100%", margin: "10%"}}>
          { heatmap &&
              <Card>
                <Card.Content>
                  <Card.Header>Activities in this year {heatmap.year}</Card.Header>
                  <Card.Description>
                    <CalendarHeatmap
                      startDate={new Date(heatmap.year + '-01-01')}
                      endDate={new Date(heatmap.year + '-12-31')}
                      values={heatmap.values}
                      onClick={value => location.href = `${nextConfig.basePath}/tracks/${value.date.replaceAll("-", "")}`}
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
            
          }
        </Card.Group>
      </div>
    </div>
  )
}

export async function getStaticProps({ params }) {
 
  const rawdata = fs.readFileSync('public/index.json')
  const data = JSON.parse(rawdata)

  return {
    props: {
      index: List(data.tracks)
        .sortBy(item => item.date)
        .reverse()
        .take(3)
        .toArray(),
      heatmap: List(data.tracks)
        .groupBy(x => x.date.substring(0,4))
        .map ( (x, key) => ({
          year: key,
          values: x
            .map(y => ({
              date: y.date,
              count: Math.round(y.distance / 1000)
            }))
            .toList()
            
          })
        )
        .toList()
        .reverse()
        .toJS()[0]
    },
  }
}

export default IndexPage