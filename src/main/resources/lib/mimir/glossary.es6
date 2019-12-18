import { get } from '/lib/xp/content'
import * as portal from '/lib/xp/portal'

const contentTypeName = `${app.name}:glossary`;

export const parseGlossaryContent = (key) => {
  if (key) {
    const glossary = get({ key })
    if (glossary && glossary.type === contentTypeName) {
      return {
        id: `glossary-${glossary._id}`,
        href: portal.pageUrl({ id: glossary._id }),
        displayName: glossary.displayName,
        ingress: glossary.data.ingress
      }
    }
    return null
  }
  return null
}
