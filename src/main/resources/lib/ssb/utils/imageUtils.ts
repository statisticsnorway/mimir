import { get, Content } from '/lib/xp/content'
import { imageUrl as xpImageUrl, type ImageUrlParams, imagePlaceholder } from '/lib/xp/portal'

export function getImageCaption(imageId?: string): string {
  if (!imageId) return ''
  const imageContent: Content<MediaImage> | null = get({
    key: imageId,
  })
  return imageContent?.data?.caption ?? ''
}

export function getImageAlt(imageId?: string): string {
  if (!imageId) return ' '
  const imageContent: Content<MediaImage> | null = get({
    key: imageId,
  })
  const alt = imageContent?.data?.altText
  if (alt) return alt
  else return ' '
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

export function getImageFromContent(XPContent: Content, imageDimensions: ImageDimensions) {
  let imageSrc: string | undefined
  let imageAlt: string | undefined = ''

  const { scale, placeholderWidth, placeholderHeight } = imageDimensions
  if (!XPContent?.x['com-enonic-app-metafields']?.['meta-data']?.seoImage) {
    imageSrc = imagePlaceholder({
      width: placeholderWidth,
      height: placeholderHeight,
    })
  } else {
    const image: string = XPContent?.x['com-enonic-app-metafields']?.['meta-data']?.seoImage
    imageSrc = imageUrl({
      id: image,
      scale,
      format: 'jpg',
    })
    imageAlt = getImageAlt(image)
  }

  return { imageSrc, imageAlt }
}

interface ImageDimensions {
  scale: ImageUrlParams['scale']
  placeholderWidth: number
  placeholderHeight: number
}
