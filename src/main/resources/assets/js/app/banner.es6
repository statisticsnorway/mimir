import $ from 'jquery'
import imagesLoaded from 'imagesloaded'

export function init () {
  $(function () {
    function resize (image, width, height) {
      const src = $(image).attr('data-url').replace(/block-\d+-\d+/, `block-${width}-${height}`)
      $(image).attr('src', src)
    }

    function resizeImages () {
      $('.part-banner img').each(function (i, image) {
        const view = { height: $(image).parent().height().toFixed(0), width: $(image).parent().width().toFixed(0) }
        resize(image, view.width, view.height)
      })

      // it is created in a "non jquery" because the plugin isnt exporting a module
      imagesLoaded($('.part-banner'), function () {
        $('.part-banner').addClass('image-show') // We migh want to add some soft loading, so this class achieves this
      })
    }

    imagesLoaded($('.part-banner'), function () {
      $('.part-banner').addClass('opacity-1')
    })

    resizeImages()
    $(window).resize((e) => resizeImages())
  })
}
