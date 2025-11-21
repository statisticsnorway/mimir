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

  it('returns empty string for non existing image', async () => {
    const { getImageAlt } = await import('/lib/ssb/utils/imageUtils')
    const response = getImageAlt('non_existing_image_id')
    expect(response).toBe(' ')
  })

  it('returns empty string for undefined id', async () => {
    const { getImageAlt } = await import('/lib/ssb/utils/imageUtils')
    const response = getImageAlt(null)
    expect(response).toBe(' ')
  })
})

describe('imageUrl ', () => {
  it('returns Enonic image url for valid path', async () => {
    const { imageUrl } = await import('/lib/ssb/utils/imageUtils')
    const response = imageUrl({ path: image1._path, scale: 'block(100,100)' })
    expect(response).toContain('/block-100-100/SSB_logo_black.svg')
  })
  it('returns Enonic image url for valid id', async () => {
    const { imageUrl } = await import('/lib/ssb/utils/imageUtils')
    const response = imageUrl({ id: image1._id, scale: 'block(100,100)' })
    expect(response).toContain('/block-100-100/SSB_logo_black.svg')
  })
  it('returns empty string for invalid path', async () => {
    const { imageUrl } = await import('/lib/ssb/utils/imageUtils')
    const response = imageUrl({ path: '/bildearkiv/non_existent.svg', scale: 'block(100,100)' })
    expect(response).toEqual('')
  })
  it('returns correct format for non jpg image', async () => {
    const { imageUrl } = await import('/lib/ssb/utils/imageUtils')
    const response = imageUrl({ path: image1._path, scale: 'block(100,100)' })
    expect(response).toContain('.svg')
  })
  it('returns correct format for jpg image', async () => {
    const { imageUrl } = await import('/lib/ssb/utils/imageUtils')
    const response = imageUrl({ path: 'dummy/path', scale: 'block(100,100)' })
    expect(response).toEqual('')
  })
  it('returns url without format for media:vector images', async () => {
    const { imageUrl } = await import('/lib/ssb/utils/imageUtils')
    const response = imageUrl({ path: 'dummy/path', scale: 'block(100,100)' })
    expect(response).toEqual('')
  })
})

////////////////////// MOCKING ///////////////////////////////////////////

// Adding images
const IMAGE_1 = 'SSB_logo_black'
const IMAGE_2 = 'favicon-96x96'
const IMAGE_FILENAME_1 = `${IMAGE_1}.svg`
const IMAGE_FILENAME_2 = `${IMAGE_2}.png`

const imageArchive = mockLibContent.create({
  contentType: 'base:folder',
  data: {},
  name: 'bildearkiv',
  parentPath: '/',
})

const image1 = mockLibContent.createMedia({
  data: readFileSync(join(__dirname, '../../main/resources/assets/', IMAGE_FILENAME_1)) as unknown as ByteSource,
  name: IMAGE_FILENAME_1,
  parentPath: imageArchive._path,
  mimeType: 'image/svg',
  focalX: 0.5,
  focalY: 0.5,
})

mockLibContent.createMedia({
  data: readFileSync(
    join(__dirname, '../../main/resources/assets/favicon/', IMAGE_FILENAME_2)
  ) as unknown as ByteSource,
  name: IMAGE_2,
  parentPath: imageArchive._path,
  mimeType: 'image/jpeg',
  focalX: 0,
  focalY: 0,
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
