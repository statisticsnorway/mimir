import $ from 'jquery'

export function init() {
  $(document).ready(function() {
    $('#main-menu').find('.mega-menu.hidden-by-default').hide()
    // Merk headeren med klassen 'menu-closed' hvis det ikke fins megamenyer som skal vises ved sideinnlasting
    if (!($('#main-menu').find('.mega-menu').not('.hidden-by-default').length)) {
      $('#header').addClass('menu-closed')
    }

    // Vis-skjul megameny
    $('.mega-menu-toggle').click(function(e) {
      // NB! Krever at toggle-lenken har en href som matcher id-attributten til en megameny
      const thisHref = $(this).attr('href')
      const thisMegaMenu = $(thisHref)
      if (thisMegaMenu.length) {
        e.preventDefault()
        // Finn nærmeste hovedmenypunkt (med to hardkodede unntak for lenke i brødsmulesti på forskning og omssb)
        const parent = (thisHref == '#forskning-hovedmeny') ?
          $('.top-level.forskning') : ((thisHref == '#omssb-hovedmeny') ?
            $('.top-level.omssb') : $(this).closest('.top-level'))

        // Hvis alle megamenyer er lukket og denne skal åpnes
        if ($('#header').hasClass('menu-closed')) {
          $('#header').removeClass('menu-closed')
          $('#statistikker-hovedmeny').removeClass('d-none')
          parent.addClass('open')
          thisMegaMenu.slideDown('fast', function() {
            thisMegaMenu.focus()
          })
        } else {
          // Hvis denne menyen er åpen og skal lukkes
          if (parent.hasClass('open')) {
            parent.removeClass('open')
            thisMegaMenu.slideUp('fast', function() {
              $('#header').addClass('menu-closed')
            })
          } else {
            // Hvis en annen megameny er åpen og denne skal vises i stedet
            // Lukk alle åpne megamenyer
            // Åpne denne megamenyen med 200ms delay
            $('#main-menu').find('.mega-menu').slideUp('fast', function() {
              $('#main-menu').find('.top-level').removeClass('open')
              setTimeout(function() {
                parent.addClass('open')
                thisMegaMenu.slideDown(function() {
                  thisMegaMenu.focus()
                })
              }, 200)
            })
          }
        }
      }
    })

    // Vis/skjul expand-lenke for å vise delemner i megamenyen
    $('#main-menu').find('.topic').not('.active').hover(
      function() {
        $(this).addClass('hover')
        $(this).find('.subtopics-toggle').css('position', 'static')
      },
      function() {
        $(this).removeClass('hover')
        $(this).find('.subtopics-toggle').css('position', 'absolute')
      }
    )

    // Vis/skjul megameny-delemner ved klikk på expand-lenken
    $('#main-menu').find('.subtopics-toggle').click(function(e) {
      e.preventDefault()
      // Bytt vis/skjul-tekst
      $(this).find('span').toggle()
      const currentMegaMenuTopic = $(this).closest('.topic')
      if (currentMegaMenuTopic.hasClass('open')) {
        currentMegaMenuTopic.find('.subtopics').slideUp('fast', function() {
          currentMegaMenuTopic.removeClass('open')
        })
      } else {
        currentMegaMenuTopic.addClass('open')
        currentMegaMenuTopic.find('.subtopics').slideDown('fast')
      }
    })

    // Legg på hover-klasse for listepunkt i menyen, slik at "punktpilen" også kan markeres rosa ved hover, ikke bare selve lenken
    $('#main-menu').find('.top-level > a').hover(
      function() {
        $(this).closest('.top-level').addClass('hover')
      },
      function() {
        $(this).closest('.top-level').removeClass('hover')
      }
    )
  })
}
