// Library providing process for finding all hyperlinked words with a glossary - returns an array of glossary
// which is rendered on bottom of page, see includes/glossary.html
// In combination with app/glossary.es6 to provide popup for words (Popper.js)

import * as portal from '/lib/xp/portal'
import * as content from '/lib/xp/content'

function parseText(text, glossary) {
  const m = text.match(/<a href="content:\/\/.*?">/g)
  m && m.forEach((link) => {
    const key = link.replace(/^.*content:\/\/(.*)".*>$/, '$1') // Extract content key from href attribute (on the form href="content://enonic-xp-hash-key")
    const item = content.get({ key })
    if (item && item.type === 'mimir:glossary') {
      glossary.push(item)
    }
  })
}

function traverseRegions(regions, glossary) {
  for (const key in regions) {
    if (regions.hasOwnProperty(key)) {
      if (regions[key].components) {
        regions[key].components.forEach((component) => {
          if (component.type === 'layout' && component.regions) {
            traverseRegions(component.regions, glossary)
          } else if (component.type === 'text') {
            parseText(component.text, glossary)
          }
        })
      }
    }
  }
}

exports.process= function(page) {
  const glossary = []

  // Process ingress
  page.data.ingress && parseText(page.data.ingress, glossary)
  page.data.ingress = page.data.ingress && portal.processHtml({ value: page.data.ingress })

  // Reccursivly traverse all page regions and parse text components for glossary links
  traverseRegions(page.page.regions, glossary)
  return glossary
}
