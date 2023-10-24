/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

declare const __non_webpack_require__: (path: string) => any

declare const resolve: (path: string) => any

declare const app: {
  name: string
  version: string
  config?: {
    [key: string]: string | object | any
  }
}

declare const log: {
  debug: (...args: any[]) => void
  info: (...args: any[]) => void
  warning: (...args: any[]) => void
  error: (...args: any[]) => void
}

declare const __: {
  newBean: (bean: string) => any
  toNativeObject: (beanResult: any) => any
}

interface BaseMedia<Media extends object = BaseMediaConfig> {
  media: Media
  caption?: string
  artist?: string | Array<string>
  copyright?: string
  tags?: string | Array<string>
}
interface BaseMediaConfig {
  attachment: string
}
interface MediaImage extends BaseMedia<ImageConfig> {
  altText?: string
}
interface ImageConfig {
  attachment: string
  focalPoint: {
    x: number
    y: number
  }
  zoomPosition: {
    left: number
    top: number
    right: number
    bottom: number
  }
  cropPosition: {
    left: number
    top: number
    right: number
    bottom: number
    zoom: number
  }
}
interface MediaImageXData {
  media: {
    imageInfo: {
      imageHeight: number
      imageWidth: number
      contentType: string
      colorSpace: string
      pixelSize: number
      byteSize: number
      description: string
      fileSource: string
    }
    cameraInfo: {
      make: string
      model: string
      lens: string
      iso: string
      focalLength: string
      focalLength35: string
      exposureBias: string
      aperture: string
      shutterTime: string
      flash: string
      autoFlashCompensation: string
      whiteBalance: string
      exposureProgram: string
      shootingMode: string
      meteringMode: string
      exposureMode: string
      focusDistance: string
      orientation: string
    }
  }
}

declare namespace XP {
  type PageContributions = import('@item-enonic-types/global/controller').Response['pageContributions']
}
