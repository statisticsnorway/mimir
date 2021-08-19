import { Content, MediaImage } from 'enonic-types/content'

const {
  get
} = __non_webpack_require__('/lib/xp/content')

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
