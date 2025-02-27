export interface MenuBoxProps {
  boxes: Array<MenuItem>
  height: string
}

export interface MenuItem {
  title: string
  subtitle: string
  icon: Image | undefined
  href: string
  titleSize: string
}

export interface MenuConfig {
  title?: string
  subtitle?: string
  image?: string
  urlSrc?: hrefManual | hrefContent
}

export interface hrefManual {
  _selected: 'manual'
  manual: {
    url: string
  }
}

export interface hrefContent {
  _selected: 'content'
  content: {
    contentId: string
    anchor: string
  }
}

export interface Image {
  src: string
  alt: string | undefined
}
