import $ from 'jquery'
import axios from 'axios'

export function init() {
  $(function() {
    const showError = (message) => {
      const errorAlert = $('.part-dashboard .alert-danger')
      errorAlert
        .removeClass('d-none')
        .find('p')
        .text(message)
    }

    const showSuccess = (message) => {
      const successAlert = $('.part-dashboard .alert-success')
      successAlert
        .removeClass('d-none')
        .find('p')
        .text(message)
    }

    const updateRows = (updates) => {
      updates.forEach((update) => {
        const row = $(`tr[data-query="${update.id}"]`)
        row.children().eq(1).text(update.lastUpdated)
        row.children().eq(2).text(update.lastUpdatedReadable)
        if (update.hasData) {
          row.children().eq(0)
            .addClass('dataset-ok')
            .removeClass('dataset-missing')
        } else {
          row.children().eq(0)
            .addClass('dataset-missing')
            .removeClass('dataset-ok')
        }
      })
    }

    $('.part-dashboard .alert button').click(function() {
      $(this)
        .parent()
        .addClass('d-none')
    })

    const updateButton = $('.js-dashboard-update')
    const deleteAllButton = $('.js-dashboard-delete')
    const deleteSingleButton = $('.part-dashboard td [data-action="delete"]')
    const refreshSingleButton = $('.part-dashboard td [data-action="refresh"]')

    const serviceUrl = updateButton.attr('data-service')

    refreshSingleButton.click(function() {
      $(this).prop('disabled', true)
      const row = $(this).closest('tr')
      axios.get(serviceUrl, {
        params: {
          id: row.data('query')
        }
      })
        .then((response) => {
          if (response.data.success) {
            showSuccess(response.data.message)
            updateRows(response.data.updates)
          } else {
            showError(response.data.message)
          }
        })
        .catch((e) => {
          showError(e.response.data.message)
        })
        .finally(() => {
          $(this).prop('disabled', false)
        })
    })

    deleteSingleButton.click(function() {
      $(this).prop('disabled', true)
      const row = $(this).closest('tr')
      axios.delete(serviceUrl, {
        params: {
          id: row.data('query')
        }
      })
        .then((response) => {
          if (response.data.success) {
            showSuccess(response.data.message)
            updateRows(response.data.updates)
          } else {
            showError(response.data.message)
          }
        })
        .catch((e) => {
          showError(e.response.data.message)
        })
        .finally(() => {
          $(this).prop('disabled', false)
        })
    })

    deleteAllButton.click((e) => {
      deleteAllButton.prop('disabled', true).find('.spinner-border').toggleClass('d-none')
      axios.delete(serviceUrl, {
        params: {
          id: '*'
        }
      })
        .then((response) => {
          if (response.data.success) {
            showSuccess(response.data.message)
            updateRows(response.data.updates)
          } else {
            showError(response.data.message)
          }
        })
        .catch((e) => {
          showError(e.response.data.message)
        })
        .finally(() => {
          deleteAllButton.prop('disabled', false).find('.spinner-border').toggleClass('d-none')
        })
    })

    updateButton.click(() => {
      updateButton.prop('disabled', true).find('.spinner-border').toggleClass('d-none')
      axios.get(serviceUrl, {
        params: {
          id: '*'
        }
      })
        .then((response) => {
          if (response.data.success) {
            showSuccess(response.data.message)
            updateRows(response.data.updates)
          } else {
            showError(response.data.message)
          }
        })
        .catch((e) => {
          showError(e.response.data.message)
        })
        .finally(() => {
          updateButton.prop('disabled', false).find('.spinner-border').toggleClass('d-none')
        })
    })
  })
}
