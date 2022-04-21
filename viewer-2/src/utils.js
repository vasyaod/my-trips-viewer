import * as nextConfig from '../next.config'

export function categoryUrl(category, page) {
  return `${nextConfig.basePath}/pages/${category}/${page}`
}