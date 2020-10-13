import { Content } from 'enonic-types/lib/content'
import { DefaultPageConfig } from '../../site/pages/default/default-page-config'

const {
  get: getContent
} = __non_webpack_require__('/lib/xp/content')
const {
  fromParentTypeCache
} = __non_webpack_require__('/lib/ssb/cache')

export function getParentType(path: string): string | undefined {
  return fromParentTypeCache(path, () => parentType(path))
}

function parentType(path: string): string | undefined {
  const parentPathKey: string = parentPath(path)

  const parentContent: Content<object, DefaultPageConfig> | null = getContent({
    key: parentPathKey
  })

  if (parentContent) {
    if (parentContent.page.config || parentContent.type === 'portal:site') {
      return parentContent.page.config.pageType ? parentContent.page.config.pageType : 'default'
    } else {
      return fromParentTypeCache(parentPathKey,() => parentType(parentPathKey))
    }
  } else {
    log.error(`Cound not find content from path ${path}`)
    return undefined
  }
}


export function parentPath(path: string): string {
  const pathElements: Array<string> = path.split('/')
  pathElements.pop()
  return pathElements.join('/')
}
