// Typeahead for input fields with autocomplete attribute: <input ... autocomplete>
// Markup according to Bootstrap 4 dropdown element - see https://getbootstrap.com/docs/4.0/components/dropdowns/
// Text to match on data-text attribute, i.e. <a data-text="5001 bergen vestlandet hordaland syv fjeld sjøforsvaret verdensarven bjørgvin buekorps" href="...">Bergen</a>
// Dependencies: jQuery and Bootstrap
$('input[autocomplete]').each((i, el) => {
  const dropdown = $(el).parent().find('.dropdown-menu')
  const elements = dropdown.find('a')
  dropdown.css('max-width', $(el).outerWidth()) && $(window).resize(() => dropdown.css('max-width', $(el).outerWidth()))
  $(el).keyup((e) => { // Using classList here because it is faster than jQuery
    const val = $(el).val()
    const startOfLine = val && val.match(/\D/) ? '^' : ''
    const re = new RegExp(startOfLine + val, 'i')
    elements.each((j, a) => a.classList.add('d-none') || a.getAttribute('data-text').match(re) && a.classList.remove('d-none'))
    dropdown.toggleClass('show', dropdown.find('a:not(.d-none)').length > 0) // remove dropdown on zero hits
  })
})
