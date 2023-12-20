
import { List } from 'immutable'
import * as nextConfig from '../next.config'
import * as fs from 'fs'
import { Image, Container, Card, Statistic} from 'semantic-ui-react'

const IndexPage = ({yearStats, monthStats}) => {
  
  return (
    <Container>
      <div style={{width: "100%", height: "100%", display: "flex", alignItems: "center", padding: "3%"}}>
        <Card.Group doubling itemsPerRow={2} stackable style={{width: "100%"}}>
          { 
            yearStats.map(row =>
              <Card key={row.date} >
                <Card.Content>
                  <Card.Header style={{textAlign: "center", fontSize:"3em"}}>
                    Year {row.date}
                  </Card.Header>
                  <Card.Description style={{padding: "2em"}}>
                    <div>
                      <Statistic style={{width: "100%"}}>
                        <Statistic.Value>{row.count}</Statistic.Value>
                        <Statistic.Label># Activities</Statistic.Label>
                      </Statistic>
                    </div>
                    <div>
                      <Statistic style={{width: "100%"}}>
                        <Statistic.Value>{row.distance}</Statistic.Value>
                        <Statistic.Label>Distance, km</Statistic.Label>
                      </Statistic>
                    </div>
                    <div>
                      <Statistic style={{width: "100%"}}>
                        <Statistic.Value>{row.time}</Statistic.Value>
                        <Statistic.Label>Total time, hh:mm</Statistic.Label>
                      </Statistic>
                    </div>
                  </Card.Description>
                </Card.Content>
              </Card>
            )
          }
          {
            monthStats.map(row =>
              <Card key={row.date} >
                <Card.Content>
                  <Card.Header style={{textAlign: "center", fontSize:"3em"}}>
                    Month {row.date}
                  </Card.Header>
                  <Card.Description style={{padding: "2em"}}>
                    <div>
                      <Statistic style={{width: "100%"}}>
                        <Statistic.Value>{row.count}</Statistic.Value>
                        <Statistic.Label># Activities</Statistic.Label>
                      </Statistic>
                    </div>
                    <div>
                      <Statistic style={{width: "100%"}}>
                        <Statistic.Value>{row.distance}</Statistic.Value>
                        <Statistic.Label>Distance, km</Statistic.Label>
                      </Statistic>
                    </div>
                    <div>
                      <Statistic style={{width: "100%"}}>
                        <Statistic.Value>{row.time}</Statistic.Value>
                        <Statistic.Label>Total time, hh:mm</Statistic.Label>
                      </Statistic>
                    </div>
                  </Card.Description>
                </Card.Content>
              </Card>
            )
          }
        </Card.Group>
      </div>  
    </Container>
  )
}

export async function getStaticProps({ params }) {
 
  const rawdata = fs.readFileSync('public/index.json')
  const data = JSON.parse(rawdata)

  return {
    props: {
      yearStats: List(data.tracks)
        .groupBy(x => x.date.substring(0,4))
        .map ( (x, key) => {
          return {
            date: key,
            count: x.size,
            distance: x.map(x => x.distance).reduce((x,y) => x + y),
            time: x.map(x => x.time).reduce((x,y) => x + y),
            uphill: x.map(x => x.uphill).reduce((x,y) => x + y)
          }
        })
        .sortBy(item => item.date)
        .map(row => ({...row,
          distance: Math.round(row.distance / 100) / 10,
          time: Math.floor(row.time / 1000 / 60 / 60) + ":" + (Math.round(row.time / 1000 / 60) % 60)
        }))
        .reverse()
        .toList()
        .take(2)
        .reverse()
        .toArray(),

      monthStats: List(data.tracks)
        .groupBy(x => x.date.substring(0,7))
        .map ( (x, key) => {
            return {
              date: key,
              count: x.size,
              distance: x.map(x => x.distance).reduce((x,y) => x + y),
              time: x.map(x => x.time).reduce((x,y) => x + y),
              uphill: x.map(x => x.uphill).reduce((x,y) => x + y)
            }
          })
          .sortBy(item => item.date)
          .map(row => ({...row,
            distance: Math.round(row.distance / 100) / 10,
            time: Math.floor(row.time / 1000 / 60 / 60) + ":" + (Math.round(row.time / 1000 / 60) % 60)
          }))
        .reverse()
        .toList()
        .take(2)
        .reverse()
        .toArray()
    },
  }
}

export default IndexPage