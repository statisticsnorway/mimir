import { readFileSync } from 'fs'
import { join } from 'path'
import { ByteSource } from '@enonic-types/core'
import { describe, expect, test as it } from '@jest/globals'
import { mockLibContent } from './mockXP'

// tests
describe('getImageCaption ', () => {
  it('returns image caption for existing image', async () => {
    const { getImageCaption } = await import('/lib/ssb/utils/imageUtils')
    const response = getImageCaption(mediaImage._id)
    expect(response).toEqual('Caption image 1')
  })

  it('returns empty string for non existing image', async () => {
    const { getImageCaption } = await import('/lib/ssb/utils/imageUtils')
    const response = getImageCaption('non_existing_image_id')
    expect(response).toBe('')
  })
})

describe('getImageAlt ', () => {
  it('returns image alt for existing image', async () => {
    const { getImageAlt } = await import('/lib/ssb/utils/imageUtils')
    const response = getImageAlt(mediaImage._id)
    expect(response).toEqual('Alt text image 1')
  })

  it('returns whitespace string for non existing image', async () => {
    const { getImageAlt } = await import('/lib/ssb/utils/imageUtils')
    const response = getImageAlt('non_existing_image_id')
    expect(response).toBe('')
  })

  it('returns whitespace string for undefined id', async () => {
    const { getImageAlt } = await import('/lib/ssb/utils/imageUtils')
    const response = getImageAlt(null)
    expect(response).toBe('')
  })

  it('returns whitespace string for image with defined alt text as empty string', async () => {
    const { getImageAlt } = await import('/lib/ssb/utils/imageUtils')
    const response = getImageAlt(mediaImage2._id)
    expect(response).toBe('')
  })
})

describe('imageUrl ', () => {
  it('returns Enonic image url for valid path', async () => {
    const { imageUrl } = await import('/lib/ssb/utils/imageUtils')
    const response = imageUrl({ path: image1._path, scale: 'block(100,100)' })
    expect(response).toContain('/block-100-100/favicon-for-testing-1.svg')
  })
  it('returns Enonic image url for valid id', async () => {
    const { imageUrl } = await import('/lib/ssb/utils/imageUtils')
    const response = imageUrl({ id: image1._id, scale: 'block(100,100)' })
    expect(response).toContain('/block-100-100/favicon-for-testing-1.svg')
  })
  it('returns empty string for invalid path', async () => {
    const { imageUrl } = await import('/lib/ssb/utils/imageUtils')
    const response = imageUrl({ path: '/bildearkiv/non_existent.svg', scale: 'block(100,100)' })
    expect(response).toEqual('')
  })
  it('returns correct format for jpg image (without format set)', async () => {
    const { imageUrl } = await import('/lib/ssb/utils/imageUtils')
    const response = imageUrl({ path: image3._path, scale: 'block(200,200)' })
    expect(response).toContain('/block-200-200/favicon-for-testing-3.jpg')
  })
  it('returns correct format if specified', async () => {
    const { imageUrl } = await import('/lib/ssb/utils/imageUtils')
    const response = imageUrl({ path: image2._path, scale: 'block(100,100)', format: 'png' })
    expect(response).toContain('/block-100-100/favicon-for-testing-2.png')
  })
  it('returns jpg format if input format not defined and not media:vector', async () => {
    const { imageUrl } = await import('/lib/ssb/utils/imageUtils')
    const response = imageUrl({ path: image2._path, scale: 'block(100,100)' })
    expect(response).toContain('/block-100-100/favicon-for-testing-2.jpg')
  })
  it('returns url without format for media:vector images even if format is set', async () => {
    const { imageUrl } = await import('/lib/ssb/utils/imageUtils')
    const response = imageUrl({ path: vector1._path, scale: 'block(100,100)', format: 'png' })
    expect(response).toContain('/block-100-100/favicon-for-testing-1')
  })
})

////////////////////// MOCKING ///////////////////////////////////////////

// Adding images
const IMAGE_1 = 'favicon-for-testing-1'
const IMAGE_2 = 'favicon-for-testing-2'
const IMAGE_3 = 'favicon-for-testing-3'
const IMAGE_FILENAME_1 = `${IMAGE_1}.svg`
const IMAGE_FILENAME_2 = `${IMAGE_2}.png`
const IMAGE_FILENAME_3 = `${IMAGE_3}.jpg`

const imageArchive = mockLibContent.create({
  contentType: 'base:folder',
  data: {},
  name: 'bildearkiv',
  parentPath: '/',
})

const image1 = mockLibContent.createMedia({
  data: readFileSync(join(__dirname, '../assets/', IMAGE_FILENAME_1)) as unknown as ByteSource,
  name: IMAGE_FILENAME_1,
  parentPath: imageArchive._path,
  mimeType: 'image/svg+xml',
  focalX: 0.5,
  focalY: 0.5,
})

const image2 = mockLibContent.createMedia({
  data: readFileSync(join(__dirname, '../assets/', IMAGE_FILENAME_2)) as unknown as ByteSource,
  name: IMAGE_2,
  parentPath: imageArchive._path,
  mimeType: 'image/png',
  focalX: 0,
  focalY: 0,
})

const image3 = mockLibContent.createMedia({
  data: readFileSync(join(__dirname, '../assets/', IMAGE_FILENAME_3)) as unknown as ByteSource,
  name: IMAGE_3,
  parentPath: imageArchive._path,
  mimeType: 'image/jpg',
  focalX: 0,
  focalY: 0,
})

const vector1 = mockLibContent.create({
  data: readFileSync(join(__dirname, '../assets/', IMAGE_FILENAME_1)) as unknown as ByteSource,
  name: IMAGE_1,
  parentPath: imageArchive._path,
  contentType: 'media:vector',
})

// Create content
const mediaImage = mockLibContent.create({
  contentType: 'mimir:MediaImage',
  data: {
    altText: 'Alt text image 1',
    media: image1._id,
    caption: 'Caption image 1',
  },
  name: IMAGE_FILENAME_1 + '_media',
  parentPath: imageArchive._path,
})

const mediaImage2 = mockLibContent.create({
  contentType: 'mimir:MediaImage',
  data: {
    altText: '',
    media: image2._id,
    caption: '',
  },
  name: IMAGE_FILENAME_2 + '_media',
  parentPath: imageArchive._path,
})
