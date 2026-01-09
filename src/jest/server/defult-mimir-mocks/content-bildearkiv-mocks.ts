import { readFileSync } from 'fs'
import { join } from 'path'
import { ByteSource } from '@enonic-types/core'
import { mockLibContent } from '../mockXP'

const IMAGE_1 = 'favicon-for-testing-1'
const IMAGE_2 = 'favicon-for-testing-2'
const IMAGE_3 = 'favicon-for-testing-3'
const IMAGE_FILENAME_1 = `${IMAGE_1}.svg`
const IMAGE_FILENAME_2 = `${IMAGE_2}.png`
const IMAGE_FILENAME_3 = `${IMAGE_3}.jpg`

export const imageArchive = mockLibContent.create({
  contentType: 'base:folder',
  data: {},
  name: 'bildearkiv',
  parentPath: '/',
})

export const image1 = mockLibContent.createMedia({
  data: readFileSync(join(__dirname, '../../assets/', IMAGE_FILENAME_1)) as unknown as ByteSource,
  name: IMAGE_FILENAME_1,
  parentPath: imageArchive._path,
  mimeType: 'image/svg+xml',
  focalX: 0.5,
  focalY: 0.5,
})

export const image2 = mockLibContent.createMedia({
  data: readFileSync(join(__dirname, '../../assets/', IMAGE_FILENAME_2)) as unknown as ByteSource,
  name: IMAGE_2,
  parentPath: imageArchive._path,
  mimeType: 'image/png',
  focalX: 0,
  focalY: 0,
})

export const image3 = mockLibContent.createMedia({
  data: readFileSync(join(__dirname, '../../assets/', IMAGE_FILENAME_3)) as unknown as ByteSource,
  name: IMAGE_3,
  parentPath: imageArchive._path,
  mimeType: 'image/jpg',
  focalX: 0,
  focalY: 0,
})

export const vector1 = mockLibContent.create({
  data: readFileSync(join(__dirname, '../../assets/', IMAGE_FILENAME_1)) as unknown as ByteSource,
  name: IMAGE_1,
  parentPath: imageArchive._path,
  contentType: 'media:vector',
})

export const mediaImage = mockLibContent.create({
  contentType: 'mimir:MediaImage',
  data: {
    altText: 'Alt text image 1',
    media: image1._id,
    caption: 'Caption image 1',
  },
  name: image1._name + '_media',
  parentPath: imageArchive._path,
})

export const mediaImage2 = mockLibContent.create({
  contentType: 'mimir:MediaImage',
  data: {
    altText: '',
    media: image2._id,
    caption: '',
  },
  name: image2._name + '_media',
  parentPath: imageArchive._path,
})
