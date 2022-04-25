
import { Stats } from '../src/components/Stats.jsx'
import { List } from 'immutable'
import * as fs from 'fs'

export async function getStaticProps() {
  const rawdata = fs.readFileSync('public/index.json')
  const data = JSON.parse(rawdata)

  return {
    props: {
      title: "Stats by months",
      currentPage: "month-stats",
      categories: data.categories,
      stats: List(data.monthStats)
          .sortBy(item => item.date)
          .map(row => ({...row,
            distance: Math.round(row.distance / 100) / 10,
            time: Math.floor(row.time / 1000 / 60 / 60) + ":" + (Math.round(row.time / 1000 / 60) % 60)
          }))
          .reverse()
          .toArray()
    },
  }
}

export default Stats