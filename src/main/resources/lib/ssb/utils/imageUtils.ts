import { get, Content } from '/lib/xp/content'
import { imageUrl as xpImageUrl, type ImageUrlParams, imagePlaceholder } from '/lib/xp/portal'

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
  return imageContent && imageContent !== undefined ? imageContent.data.altText : ''
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

export function getXPContentImage(XPContent: Content, imageDimensions: ImageDimensions) {
  let imageSrc: string | undefined
  let imageAlt: string | undefined = ''

  const { scale, format, placeholderWidth, placeholderHeight } = imageDimensions
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
      format,
    })
    imageAlt = getImageAlt(image) ? getImageAlt(image) : ''
  }

  return { imageSrc, imageAlt }
}

interface ImageDimensions {
  scale: ImageUrlParams['scale']
  format: string
  placeholderWidth: number
  placeholderHeight: number
}
