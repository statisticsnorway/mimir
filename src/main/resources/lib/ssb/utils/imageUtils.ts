import { get, Content } from '/lib/xp/content'
import { imageUrl as xpImageUrl, type ImageUrlParams } from '/lib/xp/portal'

export function getImageCaption(imageId: string): string | undefined {
  const imageContent: Content<MediaImage> | null = get({
    key: imageId,
  })
  return imageContent && imageContent !== undefined ? imageContent.data.caption : ''
}

export function getImageAlt(imageId: string): string | undefined {
  const imageContent: Content<MediaImage> | null = get({
    key: imageId,
  })
  return imageContent && imageContent !== undefined ? imageContent.data.altText : ' '
}

export function imageUrl(params: ImageUrlParams) {
  if (!(params.path || params.id)) return ''

  const image = get<Content<MediaImage>>({ key: (params.path as string) || (params.id as string) })
  if (!image) return ''

  if (image.type !== 'media:vector') {
    params.format = params.format || 'jpg'
  } else {
    delete params.format
  }

  return xpImageUrl(params)
}
