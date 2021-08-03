const {
  get
} = __non_webpack_require__('/lib/xp/content')

export function getImageCaption(imageId: string): string {
  const imageContent: ImageContent | null = get({
    key: imageId
  })
  return imageContent && imageContent !== undefined ? imageContent.data.caption : ' '
}

export function getImageAlt(imageId: string): string {
  const imageContent: ImageContent | null = get({
    key: imageId
  })
  return imageContent && imageContent !== undefined ? imageContent.data.altText : ' '
}

export interface ImageContent {
    data: {
      caption: string;
      altText: string;
    };
}

export interface ImageUtilsLib {
    getImageCaption: (imageId: string) => string;
    getImageAlt: (imageId: string) => string;
}
