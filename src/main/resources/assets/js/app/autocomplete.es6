import $ from 'jquery'
import 'bootstrap/js/dist/dropdown'
// Typeahead for input fields with autocomplete attribute: <input ... autocomplete>
// Markup according to Bootstrap 4 dropdown element - see https://getbootstrap.com/docs/4.0/components/dropdowns/
// Text to match on data-text attribute,
// i.e. <a data-text="5001 bergen vestlandet hordaland syv fjeld sjøforsvaret verdensarven bjørgvin buekorps" href="...">Bergen</a>
// Dependencies: jQuery and Bootstrap
export function init() {
  $('#input-query-municipality').each((i, el) => {
    //const dropdown = $(el).parent().find('.dropdown-menu')
    const dropdown = $('#municipality-list')
    const elements = dropdown.find('a')
    const submit = el.nextElementSibling

    console.log(dropdown, elements, submit)

    dropdown.css('max-width', $(el).outerWidth()) && $(window).resize(() => dropdown.css('max-width', $(el).outerWidth()))

    function toggleDropdown() {
      if (dropdown.find('a').length > 0) {
        $(el).dropdown('toggle')
      }
    }

    // toggle dropdown from chevron
    if (submit && submit.nodeName === 'BUTTON') {
      submit.addEventListener('click', () => {
        toggleDropdown()
      })
    }

    // handle keyboard navigation on elements in dropdown list
    elements.each((i, elem) => {
      const a = $(elem)
      a.keydown((e) => {
        if (e.which === 9) {
          e.preventDefault()
          el.focus()
        } else if (e.which === 40) {
          e.preventDefault()
          const next = elem.nextElementSibling
          if (next) {
            next.focus()
          }
        } else if (e.which === 38) {
          e.preventDefault()
          const prev = elem.previousElementSibling
          if (prev) {
            prev.focus()
          }
        }
      })
    })

    function filter(el) {
      const val = $(el).val()
      const re = new RegExp('(^|\\s)' + val, 'i') // search for val in text from start of string or from any space
      elements.each((j, a) => {
        if (a.getAttribute('data-text').match(re)) {
          dropdown.append(a)
        } else {
          a.remove()
        }
      })

      const hasLinks = dropdown.find('a').length > 0
      const isExpanded = el.getAttribute('aria-expanded') === 'true'
      if ((!hasLinks && isExpanded) || (hasLinks && !isExpanded)) {
        $(el).dropdown('toggle')
      }
    }

    // filter list on keyup, and handle keyboard navigation with down arrow
    $(el).keyup((e) => { // Using classList here because it is faster than jQuery
      if (e.which === 40) {
        const first = dropdown.find('a:not(.d-none)')[0]
        if (first) {
          first.focus()
        }
        return
      }
      filter(el)
    })

    // filter on load if there is any value in the input-field
    if (el.value) {
      filter(el)
    }
  })
}
