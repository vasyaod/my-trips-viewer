
import { List } from 'immutable'
import * as config from '../next.config'
import * as nextConfig from '../next.config'
import * as fs from 'fs'
import * as Index from './pages/[category]/[page].jsx'

const IndexPage = Index.default

export async function getStaticProps({ params }) {
 
  const rawdata = fs.readFileSync('public/index.json')
  const data = JSON.parse(rawdata)

  const pages = Math.ceil(List(data.tracks).size / nextConfig.pageSize)

  return {
    props: {
      siteDescription: config.siteDescription,
      siteTitle: config.siteTitle,
      currentPage: 1,
      pages: pages,
      categories: data.categories,
      category: "all",
      index: List(data.tracks).sortBy(item => item.date).reverse().toArray().slice(0, nextConfig.pageSize)
    },
  }
}

export default IndexPage