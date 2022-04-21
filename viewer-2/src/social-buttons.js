import * as config from '../next.config'

const tags = "#mytrips #github #velolive #bikeling"

export function shareFacebook(trackId, title, description) {
  const t = `${title}: ${description}\n${tags}\n`
  const url = `${config.url}${config.basePath}/tracks/${trackId}`
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURI(url)}&t=${t}`
  window.open(shareUrl, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600')
}
  
export function shareTwitter(trackId, title, description) {
  const text = `${title}: ${description}\n${tags}\n`
//    const twitterHandle = "amazon-budget-control"
  const url = `${config.url}${config.basePath}/tracks/${trackId}`
  const shareUrl = `https://twitter.com/share?url=${encodeURI(url)}&text=${text}`
  window.open(shareUrl, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600')
}

export function shareVk(trackId, title, description) {
  const text = `${title}: ${description}\n${tags}\n`
  const url = `${config.url}${config.basePath}/tracks/${trackId}`
  const shareUrl = `https://vk.com/share.php?url=${encodeURI(url)}&title=${text}`
  window.open(shareUrl, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600')
}

export function shareTelegram(trackId, title, description) {
  const text = `${title}: ${description}\n${tags}\n`
  const url = `${config.url}${config.basePath}/tracks/${trackId}`
  const shareUrl = `https://telegram.me/share/url?url=${url}&text=${text}`
  window.open(shareUrl, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600')
}