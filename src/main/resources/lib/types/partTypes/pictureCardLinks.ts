export interface PictureCardLink {
  title: string
  subTitle: string
  href: string
  image?: string
}

export interface ImageUrls {
  portraitSrcSet: string
  landscapeSrcSet: string
  imageSrc: string
  imageAlt: string
}

export interface PictureCardLinksContent {
  title: string
  subTitle: string
  href: string
  imageSources: ImageUrls
}
