export interface LocalSearchProps {
  title: string
  placeholder: string
  items: object
}

export interface SearchItem {
  title: string
  id: string
  url: string
}

export interface SearchFolderItem {
  _id: string
  displayName: string
  data: {
    serialNumber?: string
  }
}
