const { get } = __non_webpack_require__( '/lib/xp/content')
const portal = __non_webpack_require__( '/lib/xp/portal')

const contentTypeName = `${app.name}:glossary`

export const parseGlossaryContent = (key) => {
  if (key) {
    const glossary = get({ key })
    if (glossary && glossary.type === contentTypeName) {
      return {
        id: glossary._id,
        href: portal.pageUrl({ id: glossary._id }),
        displayName: glossary.displayName,
        text: glossary.data.text
      }
    }
    return null
  }
  return null
}
