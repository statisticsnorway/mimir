import { getComponent, getContent } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'

export function get(): XP.Response {
  const currentContent = getContent()
  if (!currentContent) throw Error('No page found')

  const locale = currentContent.language || 'no'

  const component = getComponent<XP.PartComponent.VideoEmbed>()
  if (!component) throw Error('No part found')

  const { provider, title } = component.config
  const selectedProvider = provider._selected
  if (!selectedProvider) {
    return missingConfig()
  }

  if (selectedProvider === 'vimeo') {
    const value = provider?.vimeo?.value
    if (!value) return missingConfig()

    return {
      body: renderVimeo(provider?.vimeo?.value, title, locale),
      pageContributions: {
        bodyEnd: [
          '<script type="module" src="https://cdn.jsdelivr.net/npm/@slightlyoff/lite-vimeo@0.1.1/lite-vimeo.js"></script>',
        ],
      },
    }
  } else if (selectedProvider === 'youtube') {
    const value = provider?.youtube?.value
    if (!value) return missingConfig()

    return {
      body: renderYoutube(provider?.youtube?.value, title, locale),
      pageContributions: {
        bodyEnd: [
          '<script type="module" src="https://cdn.jsdelivr.net/npm/@justinribeiro/lite-youtube@1.5.0/lite-youtube.js"></script>',
        ],
      },
    }
  }
  return {
    body: missingConfig(`Ukjent provider ${selectedProvider}`),
  }
}

function renderVimeo(value: string, title: string, locale: string) {
  const id = extractVimeoId(value)

  if (!id) return missingConfig('Ugyldig Vimeo URL / ID').body

  return wrapInDiv(`
    <lite-vimeo
      videoid="${id}"
      videoplay="${localize({ key: 'videoEmbed.play', locale })}"
      videotitle="${title}"
    ></lite-vimeo>`)
}

function extractVimeoId(value: string) {
  if (value.match(/^\d+$/)) return value

  const matchFromUrl = value.match(
    /(?:http:|https:|)\/\/(?:player.|www.)?vimeo\.com\/(?:video\/|embed\/|watch\?\S*v=|v\/)?(\d*)/im
  )
  if (!matchFromUrl) return null
  return matchFromUrl[1]
}

function renderYoutube(value: string, title: string, locale: string) {
  const id = extractYoutubeId(value)

  if (!id) return missingConfig('Ugyldig Youtube URL / ID').body

  return wrapInDiv(`
    <lite-youtube
      videoid="${id}"
      videoplay="${localize({ key: 'videoEmbed.play', locale })}"
      videotitle="${title}"
    ></lite-vimeo>`)
}

function extractYoutubeId(value: string) {
  const matchFromUrl = value.match(/(.*?)(^|\/|v=)([a-z0-9_-]{11})(.*)?/im)

  if (!matchFromUrl) return null
  return matchFromUrl[3]
}

function missingConfig(message = 'Mangler konfigurasjon') {
  return { body: wrapInDiv(`<h2>Videoembed: ${message}</h2>`) }
}

function wrapInDiv(value: string) {
  return `<div class="xp-part video-embed">${value}</div>`
}
