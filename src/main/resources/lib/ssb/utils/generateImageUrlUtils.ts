export function generateImageUrls(imageUrl: string) {
  const sizes = {
    mobile: 'block-600-200',
    tablet: 'block-992-275',
  }

  const imageMobileUrl = imageUrl.replace(/block-\d+-\d+/, sizes.mobile)
  const imageTabletUrl = imageUrl.replace(/block-\d+-\d+/, sizes.tablet)

  return {
    imageMobileUrl,
    imageTabletUrl,
  }
}
