import { get, Content, MediaImage } from '/lib/xp/content'

export function getImageCaption(imageId: string): string | undefined {
  const imageContent: Content<MediaImage> | null = get({
    key: imageId
  })
  return imageContent && imageContent !== undefined ? imageContent.data.caption : ' '
}

export function getImageAlt(imageId: string): string | undefined {
  const imageContent: Content<MediaImage> | null = get({
    key: imageId
  })
  return imageContent && imageContent !== undefined ? imageContent.data.altText : ' '
}

export interface ImageUtilsLib {
    getImageCaption: (imageId: string) => string | undefined;
    getImageAlt: (imageId: string) => string | undefined;
}
