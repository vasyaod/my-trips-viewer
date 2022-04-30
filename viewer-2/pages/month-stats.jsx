
import { Stats } from '../src/components/Stats.jsx'
import { List } from 'immutable'
import * as fs from 'fs'

export async function getStaticProps() {
  const rawdata = fs.readFileSync('public/index.json')
  const data = JSON.parse(rawdata)

  const stats = List(data.tracks)
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
    .toArray()


  return {
    props: {
      title: "Stats by months",
      currentPage: "month-stats",
      categories: data.categories,
      stats: stats
    },
  }
}

export default Stats