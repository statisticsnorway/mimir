export type SubjectTag = import('./subjectTag/subjectTag').SubjectTag

declare global {
  interface XpXData {
    'com-enonic-app-metafields': {
      'meta-data': {
        seoImage: string
        seoDescription: string
      }
    }
    mimir?: {
      subjectTag?: SubjectTag
    }
  }
}
