
import React from 'react'
import { Container, Button, Form, Grid, Header, Image, Message, Segment, Card, Label, Menu} from 'semantic-ui-react'
import Link from 'next/link'
import GitHubForkRibbon from 'react-github-fork-ribbon';
import ReactMarkdown from 'react-markdown'
import ReactTooltip from 'react-tooltip';
import { List } from 'immutable'
import * as config from '../next.config'
import * as nextConfig from '../next.config'
import * as fs from 'fs'
import { shareFacebook, shareTwitter, shareVk } from '../src/social-buttons.js'
import * as Index from './pages/[page].jsx'

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
      index: List(data.tracks).sortBy(item => item.date).reverse().toArray().slice(0, nextConfig.pageSize)
    },
  }
}

export default IndexPage