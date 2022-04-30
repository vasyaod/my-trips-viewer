
import { Stats } from '../../src/components/Stats.jsx'
import { List } from 'immutable'
import * as fs from 'fs'

export async function getStaticPaths() {
  const rawdata = fs.readFileSync('public/index.json')
  const data = JSON.parse(rawdata)

   const paths = List(data.categories)
   .map ( category => {
     return { params: { category: category.id } }
    })
    .toJS()

  return {
    // Opt-in to on-demand generation for non-existent pages
    fallback: false,
    paths: paths
  }
}

export async function getStaticProps({ params }) {
  const rawdata = fs.readFileSync('public/index.json')
  const data = JSON.parse(rawdata)

  const category = params.category

  const stats = List(data.tracks)
    .filter(t => t.categories.includes(category))
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
    .toArray()

  return {
    props: {
      title: "Stats by years",
      currentPage: "year-stats",
      categories: data.categories,
      category: category,
      stats: stats
    },
  }
}

export default Stats