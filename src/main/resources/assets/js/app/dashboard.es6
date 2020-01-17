import $ from 'jquery'
import axios from 'axios'

export function init() {
  $(function() {
    const updateButton = $('.js-dashboard-update')
    const deleteButton = $('.js-dashboard-delete')
    deleteButton.click((e) => {
      deleteButton.prop('disabled', true)
      const service = updateButton.attr('data-service')
      const success = $('.part-dashboard .delete-success')
      const warning = $('.part-dashboard .delete-warning')
      $('.part-dashboard .alert').addClass('d-none')
      deleteButton.find('.spinner-border').toggleClass('d-none')
      axios.get(service, { params: { delete: true } }).then((result) => success.toggleClass('d-none'))
        .catch((error) => warning.toggleClass('d-none'))
        .finally(() => deleteButton.prop('disabled', false).find('.spinner-border').toggleClass('d-none'))
    })
    updateButton.click((e) => {
      updateButton.prop('disabled', true)
      const service = updateButton.attr('data-service')
      const success = $('.part-dashboard .update-success')
      const warning = $('.part-dashboard .update-warning')
      $('.part-dashboard .alert').addClass('d-none')
      updateButton.find('.spinner-border').toggleClass('d-none')
      axios.get(service).then((result) => success.toggleClass('d-none'))
        .catch((error) => warning.toggleClass('d-none'))
        .finally(() => updateButton.prop('disabled', false).find('.spinner-border').toggleClass('d-none'))
    })
  })
}
