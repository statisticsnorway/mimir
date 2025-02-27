/* eslint-disable no-var */
// https://github.com/jfriend00/docReady
;(function (funcName, baseObj) {
  'use strict'
  // The public function name defaults to window.docReady
  // but you can modify the last line of this function to pass in a different object or method name
  // if you want to put them in a different namespace and those will be used instead of
  // window.docReady(...)
  funcName = funcName || 'docReady'
  baseObj = baseObj || window
  var readyList = []
  var readyFired = false
  var readyEventHandlersInstalled = false

  // call this when the document is ready
  // this function protects itself against being called more than once
  function ready() {
    if (!readyFired) {
      // this must be set to true before we start calling callbacks
      readyFired = true
      for (var i = 0; i < readyList.length; i++) {
        // if a callback here happens to add new ready handlers,
        // the docReady() function will see that it already fired
        // and will schedule the callback to run right after
        // this event loop finishes so all handlers will still execute
        // in order and no new ones will be added to the readyList
        // while we are processing the list
        readyList[i].fn.call(window, readyList[i].ctx)
      }
      // allow any closures held by these functions to free
      readyList = []
    }
  }

  function readyStateChange() {
    if (document.readyState === 'complete') {
      ready()
    }
  }

  // This is the one public interface
  // docReady(fn, context);
  // the context argument is optional - if present, it will be passed
  // as an argument to the callback
  baseObj[funcName] = function (callback, context) {
    if (typeof callback !== 'function') {
      throw new TypeError('callback for docReady(fn) must be a function')
    }
    // if ready has already fired, then just schedule the callback
    // to fire asynchronously, but right away
    if (readyFired) {
      setTimeout(function () {
        callback(context)
      }, 1)
      return
    } else {
      // add the function and context to the list
      readyList.push({
        fn: callback,
        ctx: context,
      })
    }
    // if document already ready to go, schedule the ready function to run
    // IE only safe when readyState is "complete", others safe when readyState is "interactive"
    if (document.readyState === 'complete' || (!document.attachEvent && document.readyState === 'interactive')) {
      setTimeout(ready, 1)
    } else if (!readyEventHandlersInstalled) {
      // otherwise if we don't have event handlers installed, install them
      if (document.addEventListener) {
        // first choice is DOMContentLoaded event
        document.addEventListener('DOMContentLoaded', ready, false)
        // backup is window load event
        window.addEventListener('load', ready, false)
      } else {
        // must be IE
        document.attachEvent('onreadystatechange', readyStateChange)
        window.attachEvent('onload', ready)
      }
      readyEventHandlersInstalled = true
    }
  }
})('docReady', window)
// modify this previous line to pass in your own method name
// and object for the method to be attached to

window.docReady(function () {
  function isIE() {
    var userAgent = window.navigator.userAgent

    if (userAgent.indexOf('MSIE ') > 0 || !!userAgent.match(/Trident.*rv\:11\./)) {
      return true
    }

    return false
  }
  if (isIE()) {
    var browserWarning = document.getElementById('browser-warning')
    var title = 'Denne nettleseren støttes ikke av ssb.no'
    var text =
      'Hei, du bruker en nettleser som ikke støttes av ssb.no. ' +
      'Du bør derfor bytte til en oppdatert og mer sikker nettleser, som Chrome, Firefox eller Safari.'
    if (location.href.indexOf('/en/') >= 0 || location.href.indexOf('/en') === location.href.length - 3) {
      title = 'This web browser is not not supported by ssb.no.'
      text =
        'You are using a web browser that is not supported by ssb.no. ' +
        'We recommend you use the latest version of a more secure web browser like Chrome, Firefox, Edge or Safari.'
    }
    browserWarning.innerHTML =
      '<div class="ssb-dialog info my-5">' +
      '<div class="icon-panel">' +
      '<i class="icon">' +
      '<svg ' +
      'xmlns="http://www.w3.org/2000/svg" ' +
      'width="40" ' +
      'height="40" ' +
      'viewBox="0 0 24 24" ' +
      'fill="none" ' +
      'stroke="currentColor" ' +
      'stroke-width="2" ' +
      'stroke-linecap="round" ' +
      'stroke-linejoin="round" ' +
      'class="feather feather-alert-circle">' +
      '<circle cx="12" cy="12" r="10"></circle>' +
      '<line x1="12" y1="8" x2="12" y2="12"></line>' +
      '<line x1="12" y1="16" x2="12.01" y2="16"></line>' +
      '</svg>' +
      '</i>' +
      '</div>' +
      '<div class="dialog-content">' +
      '<span class="dialog-title">' +
      title +
      '</span>' +
      '<div class="content">' +
      text +
      '</div>' +
      '</div>' +
      '</div>'
  }
})
