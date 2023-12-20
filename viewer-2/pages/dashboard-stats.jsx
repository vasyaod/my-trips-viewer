
import { List } from 'immutable'
import * as nextConfig from '../next.config'
import * as fs from 'fs'
import { Image, Container, Card, Statistic} from 'semantic-ui-react'

function toStr(date) {
  const y = date.substring(0,4)
  const m = date.substring(5,7)
  let x
  switch (m) {
    case '01':
      x = "Jan"
      break;
    case '02':
      x = "Feb"
      break;
    case '03':
      x = "Mar"
      break;
    case '04':
      x = "Apr"
      break;
    case '05':
      x = "May"
      break;
    case '06':
      x = "Jun"
      break;
    case '07':
      x = "Jul"
      break;
    case '08':
      x = "Aug"
      break;
    case '09':
      x = "Sep"
      break;
    case '10':
      x = "Oct"
      break;
    case '11':
      x = "Nov"
      break;
    case '12':
      x = "Dec"
      break;
  }
  
  return `${x}, ${y}`
}

const IndexPage = ({yearStats, monthStats}) => {
  
  return (
    <Container>
      <div style={{width: "100%", height: "100%", display: "flex", alignItems: "center", padding: "3%"}}>
        <Card.Group doubling itemsPerRow={2} stackable style={{width: "100%"}}>
          { 
            yearStats.map(row =>
              <Card key={row.date} >
                <Card.Content>
                  <Card.Header style={{textAlign: "center"}}>
                    <Statistic style={{width: "100%"}}>
                        <Statistic.Value>{row.date}</Statistic.Value>
                        <Statistic.Label>Year stats</Statistic.Label>
                    </Statistic>

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
                  <Card.Header style={{textAlign: "center"}}>
                    <Statistic style={{width: "100%"}}>
                        <Statistic.Value>{toStr(row.date)}</Statistic.Value>
                        <Statistic.Label>Month stats</Statistic.Label>
                    </Statistic>
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