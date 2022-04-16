import * as config from '../next.config'

const tags = "#mytrips #github #velolive #bikeling"

export function shareFacebook(trackId, title, description) {
  const t = `${title}: ${description}\n${tags}\n`
  const url = `${config.url}${config.basePath}/tracks/${trackId}`
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURI(url)}&t=${t}`
  window.open(facebookShareUrl, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600')
}
  
export function shareTwitter(trackId, title, description) {
  const text = `${title}: ${description}\n${tags}\n`
//    const twitterHandle = "amazon-budget-control"
  const url = `${config.url}${config.basePath}/tracks/${trackId}`
  const twitterShareUrl = `https://twitter.com/share?url=${encodeURI(url)}&text=${text}`
  window.open(twitterShareUrl, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600')
}

export function shareVk(trackId, title, description) {
  const text = `${title}: ${description}\n${tags}\n`
  const url = `${config.url}${config.basePath}/tracks/${trackId}`
  const twitterShareUrl = `https://vk.com/share.php?url=${encodeURI(url)}&title=${text}`
  window.open(twitterShareUrl, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600')
}
